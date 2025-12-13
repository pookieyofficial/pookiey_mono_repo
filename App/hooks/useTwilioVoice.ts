import { useCallback, useEffect, useRef, useState } from 'react';
import { Call, Voice } from '@twilio/voice-react-native-sdk';
import axios from 'axios';
import { supabase } from '@/config/supabaseConfig';
import { useSocket } from './useSocket';
import { Audio } from 'expo-av';

// Ensure we always have a valid base URL (prevents "Invalid URL: //")
const API_URL = "https://api.thedevpiyush.com/api/v1";

type Status = 'idle' | 'calling' | 'ringing' | 'connected';

type CallStatus = {
  isCalling: boolean;
  isRinging: boolean;
  isConnected: boolean;
  isEnded: boolean;
  error?: string;
};

export function useTwilioVoice() {
  const { socket, isConnected } = useSocket();

  const [status, setStatus] = useState<Status>('idle');
  const [incomingCall, setIncomingCall] = useState<{
    matchId: string;
    callerId: string;
    callerIdentity: string;
  } | null>(null);

  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const callRef = useRef<Call | null>(null);

  // Track who to notify on end
  const otherUserIdRef = useRef<string | null>(null);
  const matchIdRef = useRef<string | null>(null);

  // Online-only calls: DO NOT call voice.register() (avoids Firebase dependency on Android).
  // We create one Voice instance and reuse it.
  const voiceRef = useRef<Voice | null>(null);
  if (!voiceRef.current) {
    voiceRef.current = new Voice();
  }
  const voice = voiceRef.current;

  const ensureMicPermission = useCallback(async () => {
    const perm = await Audio.requestPermissionsAsync();
    if (perm.status !== 'granted') {
      throw new Error('Microphone permission is required to place/answer calls.');
    }
  }, []);

  // 🔐 Fetch token
  const fetchToken = async (): Promise<string> => {
    if (!API_URL) {
      throw new Error('Backend API URL is not configured');
    }

    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;

    if (!accessToken) {
      throw new Error('User session is missing. Please sign in again.');
    }

    const res = await axios.get(`${API_URL}/call/token`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const token = res?.data?.data?.token;
    if (!token) {
      throw new Error('Failed to get access token from backend');
    }

    return token;
  };

  const cleanup = useCallback(() => {
    callRef.current = null;
    setActiveCall(null);
    setIncomingCall(null);
    setStatus('idle');
    otherUserIdRef.current = null;
    matchIdRef.current = null;
  }, []);

  // Socket listeners for "online-only" call signaling
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onIncoming = (data: { matchId: string; callerId: string; callerIdentity: string }) => {
      setIncomingCall(data);
      setStatus('ringing');
    };

    const onAnswered = (_data: { matchId: string; receiverId: string; receiverIdentity: string }) => {
      // caller UI
      setStatus('connected');
    };

    const onRejected = (_data: { matchId: string; receiverId: string }) => {
      callRef.current?.disconnect();
      cleanup();
    };

    const onEnded = (_data: { matchId: string; endedBy: string }) => {
      callRef.current?.disconnect();
      cleanup();
    };

    const onUnavailable = (_data: { matchId: string; receiverId: string; reason: string }) => {
      // receiver offline/unavailable
      callRef.current?.disconnect();
      setStatus('idle');
    };

    socket.on('call_incoming', onIncoming);
    socket.on('call_answered', onAnswered);
    socket.on('call_rejected', onRejected);
    socket.on('call_ended', onEnded);
    socket.on('call_unavailable', onUnavailable);

    return () => {
      socket.off('call_incoming', onIncoming);
      socket.off('call_answered', onAnswered);
      socket.off('call_rejected', onRejected);
      socket.off('call_ended', onEnded);
      socket.off('call_unavailable', onUnavailable);
    };
  }, [socket, isConnected, cleanup]);

  // ▶️ Make call
  // Signature matches existing usage: (matchId, receiverId, receiverIdentity)
  // receiverIdentity is not needed for conference-based calling; we use room=matchId.
  const makeCall = useCallback(
    async (matchId: string, receiverId: string, _receiverIdentity: string) => {
      try {
        if (!socket || !isConnected) {
          throw new Error('Socket not connected');
        }

        await ensureMicPermission();

        setStatus('calling');
        matchIdRef.current = matchId;
        otherUserIdRef.current = receiverId;

        // Ask server to signal receiver. Server will emit call_unavailable if receiver is offline.
        socket.emit('call_initiate', { matchId, receiverId });

        // Wait briefly for offline/unavailable.
        const ok = await new Promise<boolean>((resolve) => {
          const timer = setTimeout(() => {
            cleanupListeners();
            resolve(true);
          }, 800); // short grace window; receiver may still answer later

          const onUnavailable = () => {
            clearTimeout(timer);
            cleanupListeners();
            resolve(false);
          };

          const onInitiated = () => {
            clearTimeout(timer);
            cleanupListeners();
            resolve(true);
          };

          const cleanupListeners = () => {
            socket.off('call_unavailable', onUnavailable);
            socket.off('call_initiated', onInitiated);
          };

          socket.on('call_unavailable', onUnavailable);
          socket.on('call_initiated', onInitiated);
        });

        if (!ok) {
          setStatus('idle');
          return;
        }

        // Connect caller into conference room via TwiML App Voice URL
        const token = await fetchToken();
        const call = await voice.connect(token, {
          // Include both `room` and `To` (some TwiML apps read `To`)
          params: { room: matchId, To: matchId, role: 'caller' },
        });

        callRef.current = call;
        setActiveCall(call);

        call.on(Call.Event.Connected, () => setStatus('connected'));
        call.on(Call.Event.Disconnected, () => cleanup());
        call.on(Call.Event.ConnectFailure, (err: any) => {
          console.error('Call connect failure:', err);
          cleanup();
        });
      } catch (e: any) {
        console.error('Error making call:', e);
        cleanup();
      }
    },
    [socket, isConnected, voice, cleanup, ensureMicPermission]
  );

  // ✅ Answer call
  const answerCall = useCallback(async () => {
    try {
      if (!incomingCall || !socket || !isConnected) return;

      await ensureMicPermission();

      const token = await fetchToken();
      matchIdRef.current = incomingCall.matchId;
      otherUserIdRef.current = incomingCall.callerId;

      // Connect receiver into the same conference room
      const call = await voice.connect(token, {
        params: { room: incomingCall.matchId, To: incomingCall.matchId, role: 'receiver' },
      });

      callRef.current = call;
      setActiveCall(call);
      setIncomingCall(null);
      setStatus('connected');

      // Notify caller for UI state
      socket.emit('call_answer', { matchId: matchIdRef.current, callerId: otherUserIdRef.current });

      call.on(Call.Event.Disconnected, () => cleanup());
      call.on(Call.Event.ConnectFailure, () => cleanup());
    } catch (e: any) {
      console.error('Error answering call:', e);
      cleanup();
    }
  }, [incomingCall, socket, isConnected, voice, cleanup, ensureMicPermission]);

  // ❌ Reject call
  const rejectCall = useCallback(() => {
    if (!incomingCall || !socket) return;
    socket.emit('call_reject', { matchId: incomingCall.matchId, callerId: incomingCall.callerId });
    setIncomingCall(null);
    setStatus('idle');
  }, [incomingCall, socket]);

  // 🔚 End call
  const endCall = useCallback(() => {
    callRef.current?.disconnect();
    if (socket && matchIdRef.current && otherUserIdRef.current) {
      socket.emit('call_end', { matchId: matchIdRef.current, otherUserId: otherUserIdRef.current });
    }
    cleanup();
  }, [socket, cleanup]);

  const callStatus: CallStatus = {
    isCalling: status === 'calling',
    isRinging: status === 'ringing',
    isConnected: status === 'connected',
    isEnded: status === 'idle',
    error: status === 'idle' ? undefined : undefined,
  };

  return {
    status,
    callStatus,
    activeCall,
    incomingCall,
    makeCall,
    answerCall,
    rejectCall,
    endCall,
  };
}
