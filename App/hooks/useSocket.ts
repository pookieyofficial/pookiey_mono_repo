import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:6969/api/v1';
const SOCKET_URL = API_URL.replace('/api/v1', '');

// --- Singleton Socket.IO connection (avoid multiple parallel sockets per user) ---
// Multiple components call useSocket() (tabs, chat room, call provider). Previously each call
// created its own socket connection, which can lead to missing events / inconsistent "online"
// presence. We keep a single socket per logged-in user for the whole app runtime.
let singletonSocket: Socket | null = null;
let singletonUserId: string | null = null;

export interface Message {
  _id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  text: string;
  type: 'text' | 'image' | 'gif' | 'audio';
  mediaUrl?: string;
  audioDuration?: number;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InboxItem {
  matchId: string;
  userId: string;
  name: string;
  avatar?: string;
  receiverNotificationToken?: string[];
  lastMessage?: {
    text: string;
    createdAt: Date;
    senderId: string;
    isRead: boolean;
  };
  matchedAt: Date;
  unreadCount: number;
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [socketState, setSocketState] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { dbUser } = useAuth();

  useEffect(() => {
    if (!dbUser?.user_id) {
      return;
    }

    const userId = dbUser.user_id;

    // Reuse existing socket for same user, otherwise replace it.
    if (!singletonSocket || singletonUserId !== userId) {
      if (singletonSocket) {
        try {
          singletonSocket.removeAllListeners();
          singletonSocket.disconnect();
        } catch {
          // ignore
        }
      }

      console.log('Connecting to socket:', SOCKET_URL);
      singletonUserId = userId;
      singletonSocket = io(SOCKET_URL, {
        auth: { userId },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    const socket = singletonSocket;

    const onConnect = () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
    };

    const onDisconnect = (reason: any) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    };

    const onConnectError = (error: any) => {
      console.error('Socket connection error:', error?.message ?? error);
    };

    const onError = (error: { message: string }) => {
      console.error('Socket error:', error.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('error', onError);

    socketRef.current = socket;
    setSocketState(socket);
    // If this hook mounts after the singleton socket is already connected,
    // we won't get a fresh 'connect' event. Seed state from current socket status.
    setIsConnected(!!socket.connected);

    return () => {
      // Don't disconnect the singleton here; other screens/providers may still rely on it.
      // We only disconnect when the logged-in user changes (handled above).
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('error', onError);
      socketRef.current = null;
      setSocketState(null);
      setIsConnected(false);
    };
  }, [dbUser?.user_id]);

  const waitForConnection = useCallback(
    async (timeoutMs: number = 2500) => {
      const start = Date.now();

      // Wait for socket to be created (can be briefly null right after mount)
      while (!socketRef.current && Date.now() - start < timeoutMs) {
        await new Promise((r) => setTimeout(r, 50));
      }

      const socket = socketRef.current;
      if (!socket) {
        throw new Error('Socket not initialized');
      }

      if (socket.connected) {
        return socket;
      }

      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          cleanup();
          reject(new Error('Socket connection timeout'));
        }, Math.max(0, timeoutMs - (Date.now() - start)));

        const onConnect = () => {
          cleanup();
          resolve();
        };

        const onConnectError = (err: any) => {
          cleanup();
          reject(err instanceof Error ? err : new Error('Socket connection error'));
        };

        const cleanup = () => {
          clearTimeout(timer);
          socket.off('connect', onConnect);
          socket.off('connect_error', onConnectError);
        };

        socket.on('connect', onConnect);
        socket.on('connect_error', onConnectError);
      });

      return socket;
    },
    []
  );

  const checkCallReady = useCallback(
    async (matchId: string, receiverId: string, timeoutMs: number = 1500): Promise<boolean> => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) return false;

      return await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => resolve(false), timeoutMs);
        socket.emit(
          'call_presence',
          { matchId, receiverId },
          (res?: { receiverOnline?: boolean }) => {
            clearTimeout(timer);
            resolve(!!res?.receiverOnline);
          }
        );
      });
    },
    []
  );

  const joinMatch = (matchId: string) => {
    socketRef.current?.emit('join_match', matchId);
  };

  const leaveMatch = (matchId: string) => {
    socketRef.current?.emit('leave_match', matchId);
  };

  const sendMessage = (data: {
    matchId: string;
    text: string;
    type?: 'text' | 'image' | 'gif' | 'audio';
    mediaUrl?: string;
    audioDuration?: number;
  }) => {
    socketRef.current?.emit('send_message', data);
  };

  const markAsRead = (matchId: string) => {
    socketRef.current?.emit('mark_as_read', { matchId });
  };

  const startTyping = (matchId: string) => {
    socketRef.current?.emit('typing_start', { matchId });
  };

  const stopTyping = (matchId: string) => {
    socketRef.current?.emit('typing_stop', { matchId });
  };

  const onNewMessage = (callback: (message: Message) => void) => {
    socketRef.current?.on('new_message', callback);
    return () => {
      socketRef.current?.off('new_message', callback);
    };
  };

  const onInboxUpdate = (callback: (data: any) => void) => {
    socketRef.current?.on('inbox_update', callback);
    return () => {
      socketRef.current?.off('inbox_update', callback);
    };
  };

  const onUserTyping = (callback: (data: { userId: string }) => void) => {
    socketRef.current?.on('user_typing', callback);
    return () => {
      socketRef.current?.off('user_typing', callback);
    };
  };

  const onUserStoppedTyping = (callback: (data: { userId: string }) => void) => {
    socketRef.current?.on('user_stopped_typing', callback);
    return () => {
      socketRef.current?.off('user_stopped_typing', callback);
    };
  };

  const onMessagesRead = (callback: (data: { matchId: string; count: number }) => void) => {
    socketRef.current?.on('messages_read', callback);
    return () => {
      socketRef.current?.off('messages_read', callback);
    };
  };

  return {
    socket: socketState,
    isConnected,
    waitForConnection,
    checkCallReady,
    joinMatch,
    leaveMatch,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    onNewMessage,
    onInboxUpdate,
    onUserTyping,
    onUserStoppedTyping,
    onMessagesRead,
  };
};

