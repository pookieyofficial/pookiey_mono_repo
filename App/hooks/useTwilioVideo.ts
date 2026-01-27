import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { supabase } from '@/config/supabaseConfig';
import { useSocket } from './useSocket';
import { Camera } from 'expo-camera';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

export type VideoCallStatus = 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected';

export type VideoTrackIdentity = {
  participantSid: string;
  videoTrackSid: string;
};

export function useTwilioVideo() {
  const { socket, isConnected, waitForConnection } = useSocket();
  const twilioRef = useRef<any>(null);

  const [status, setStatus] = useState<VideoCallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [videoTracks, setVideoTracks] = useState<Map<string, VideoTrackIdentity>>(new Map());
  const [incomingVideoCall, setIncomingVideoCall] = useState<{
    matchId: string;
    callerId: string;
    callerIdentity: string;
  } | null>(null);

  const otherUserIdRef = useRef<string | null>(null);
  const matchIdRef = useRef<string | null>(null);
  const [pendingConnect, setPendingConnect] = useState<{ token: string } | null>(null);

  const ensureCameraPermission = useCallback(async () => {
    const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
    if (camStatus !== 'granted') {
      throw new Error('Camera permission is required for video calls.');
    }
    const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();
    if (micStatus !== 'granted') {
      throw new Error('Microphone permission is required for video calls.');
    }
  }, []);

  const fetchVideoToken = useCallback(async (roomName: string): Promise<string> => {
    if (!API_URL) throw new Error('Backend API URL is not configured');
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) throw new Error('User session is missing. Please sign in again.');

    const res = await axios.get(`${API_URL}/call/video-token`, {
      params: { room: roomName },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const token = res?.data?.data?.token;
    if (!token) throw new Error('Failed to get video token from backend');
    return token;
  }, []);

  const cleanup = useCallback(() => {
    setVideoTracks(new Map());
    setIncomingVideoCall(null);
    setStatus('idle');
    setIsMuted(false);
    setIsVideoEnabled(true);
    setPendingConnect(null);
    otherUserIdRef.current = null;
    matchIdRef.current = null;
    try {
      twilioRef.current?.disconnect?.();
    } catch (_) {}
  }, []);

  // Run pending connect when ref is ready (TwilioVideo is mounted)
  useEffect(() => {
    if (!pendingConnect || !twilioRef.current) return;
    twilioRef.current.connect({ accessToken: pendingConnect.token });
    setPendingConnect(null);
  }, [pendingConnect]);

  // Socket listeners for video call signaling
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onIncoming = (data: { matchId: string; callerId: string; callerIdentity: string; callType?: 'voice' | 'video' }) => {
      if (data.callType !== 'video') return;
      setIncomingVideoCall({ matchId: data.matchId, callerId: data.callerId, callerIdentity: data.callerIdentity });
      setStatus('ringing');
    };

    const onAnswered = () => setStatus('connected');
    const onRejected = () => cleanup();
    const onEnded = () => cleanup();
    const onUnavailable = () => setStatus('idle');

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

  const makeVideoCall = useCallback(
    async (matchId: string, receiverId: string, _receiverIdentity: string) => {
      try {
        const s = socket?.connected ? socket : await waitForConnection(2500);
        if (!s?.connected) throw new Error('Socket not connected');
        await ensureCameraPermission();

        setStatus('calling');
        matchIdRef.current = matchId;
        otherUserIdRef.current = receiverId;

        s.emit('call_initiate', { matchId, receiverId, callType: 'video' });

        const ok = await new Promise<boolean>((resolve) => {
          const timer = setTimeout(() => {
            cleanupListeners();
            resolve(true);
          }, 800);
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
            s.off('call_unavailable', onUnavailable);
            s.off('call_initiated', onInitiated);
          };
          s.on('call_unavailable', onUnavailable);
          s.on('call_initiated', onInitiated);
        });

        if (!ok) {
          setStatus('idle');
          return;
        }

        setStatus('connecting');
        const token = await fetchVideoToken(matchId);
        if (twilioRef.current) {
          twilioRef.current.connect({ accessToken: token });
        } else {
          setPendingConnect({ token });
        }
      } catch (e: any) {
        console.error('Error making video call:', e);
        cleanup();
      }
    },
    [socket, waitForConnection, ensureCameraPermission, fetchVideoToken, cleanup]
  );

  const answerVideoCall = useCallback(async () => {
    try {
      if (!incomingVideoCall || !socket || !isConnected) return;
      await ensureCameraPermission();

      matchIdRef.current = incomingVideoCall.matchId;
      otherUserIdRef.current = incomingVideoCall.callerId;

      setStatus('connecting');
      setIncomingVideoCall(null);

      const token = await fetchVideoToken(incomingVideoCall.matchId);
      if (twilioRef.current) {
        twilioRef.current.connect({ accessToken: token });
      } else {
        setPendingConnect({ token });
      }

      socket.emit('call_answer', {
        matchId: incomingVideoCall.matchId,
        callerId: incomingVideoCall.callerId,
      });
    } catch (e: any) {
      console.error('Error answering video call:', e);
      cleanup();
    }
  }, [incomingVideoCall, socket, isConnected, ensureCameraPermission, fetchVideoToken, cleanup]);

  const rejectVideoCall = useCallback(() => {
    if (!incomingVideoCall || !socket) return;
    socket.emit('call_reject', { matchId: incomingVideoCall.matchId, callerId: incomingVideoCall.callerId });
    setIncomingVideoCall(null);
    setStatus('idle');
  }, [incomingVideoCall, socket]);

  const endVideoCall = useCallback(() => {
    try {
      twilioRef.current?.disconnect?.();
    } catch (_) {}
    if (socket && matchIdRef.current && otherUserIdRef.current) {
      socket.emit('call_end', { matchId: matchIdRef.current, otherUserId: otherUserIdRef.current });
    }
    cleanup();
  }, [socket, cleanup]);

  const toggleMute = useCallback(() => {
    twilioRef.current?.setLocalAudioEnabled?.(!isMuted).then?.((enabled: boolean) => setIsMuted(!enabled));
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    twilioRef.current?.setLocalVideoEnabled?.(!isVideoEnabled).then?.((enabled: boolean) => setIsVideoEnabled(enabled));
  }, [isVideoEnabled]);

  const flipCamera = useCallback(() => {
    twilioRef.current?.flipCamera?.();
  }, []);

  const onRoomDidConnect = useCallback(() => {
    setStatus('connected');
  }, []);

  const onRoomDidDisconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const onRoomDidFailToConnect = useCallback((err: any) => {
    console.error('Video room failed to connect:', err);
    cleanup();
  }, [cleanup]);

  const onParticipantAddedVideoTrack = useCallback(
    ({ participant, track }: { participant: { sid: string }; track: { trackSid: string } }) => {
      setVideoTracks((prev) => new Map(prev).set(track.trackSid, { participantSid: participant.sid, videoTrackSid: track.trackSid }));
    },
    []
  );

  const onParticipantRemovedVideoTrack = useCallback(({ track }: { track: { trackSid: string } }) => {
    setVideoTracks((prev) => {
      const next = new Map(prev);
      next.delete(track.trackSid);
      return next;
    });
  }, []);

  return {
    twilioRef,
    status,
    isMuted,
    isVideoEnabled,
    videoTracks,
    incomingVideoCall,
    makeVideoCall,
    answerVideoCall,
    rejectVideoCall,
    endVideoCall,
    toggleMute,
    toggleVideo,
    flipCamera,
    onRoomDidConnect,
    onRoomDidDisconnect,
    onRoomDidFailToConnect,
    onParticipantAddedVideoTrack,
    onParticipantRemovedVideoTrack,
  };
}
