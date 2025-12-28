import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioDevice, Call, Voice } from '@twilio/voice-react-native-sdk';
import axios from 'axios';
import { supabase } from '@/config/supabaseConfig';
import { useSocket } from './useSocket';
import { Audio } from 'expo-av';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

type Status = 'idle' | 'calling' | 'ringing' | 'connected';

type CallStatus = {
  isCalling: boolean;
  isRinging: boolean;
  isConnected: boolean;
  isEnded: boolean;
  error?: string;
};

export function useTwilioVoice() {
  const { socket, isConnected, waitForConnection } = useSocket();

  const [status, setStatus] = useState<Status>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<AudioDevice | undefined>(undefined);
  const [isVoiceReady, setIsVoiceReady] = useState(false);
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

  const voiceRef = useRef<Voice | null>(null);
  const getVoice = useCallback((): Voice => {
    if (!voiceRef.current) {
      voiceRef.current = new Voice();
      setIsVoiceReady(true);
    }
    return voiceRef.current;
  }, []);

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
    setIsMuted(false);
    setAudioDevices([]);
    setSelectedAudioDevice(undefined);
    otherUserIdRef.current = null;
    matchIdRef.current = null;
  }, []);

  const toggleMute = useCallback(() => {
    const call: any = callRef.current;
    if (!call) return;

    // Twilio RN Voice SDK supports muting; use defensive access to avoid runtime issues.
    const next = !isMuted;
    try {
      if (typeof call.mute === 'function') {
        call.mute(next);
        setIsMuted(next);
      } else if (typeof call.setMuted === 'function') {
        call.setMuted(next);
        setIsMuted(next);
      }
    } catch (e) {
      // console.error('Error toggling mute:', e);
    }
  }, [isMuted]);

  // Keep audio devices in sync with the native layer (speaker / bluetooth / earpiece)
  useEffect(() => {
    if (!isVoiceReady || !voiceRef.current) return;
    const voice = voiceRef.current;

    // Initial fetch
    (async () => {
      try {
        const res = await voice.getAudioDevices();
        setAudioDevices(res.audioDevices || []);
        setSelectedAudioDevice(res.selectedDevice);
      } catch {
        // non-fatal
      }
    })();

    const handler = (devices: AudioDevice[], selected?: AudioDevice) => {
      setAudioDevices(devices || []);
      setSelectedAudioDevice(selected);
    };

    voice.on(Voice.Event.AudioDevicesUpdated, handler);
    return () => {
      voice.off(Voice.Event.AudioDevicesUpdated, handler);
    };
  }, [isVoiceReady]);

  const selectAudioDevice = useCallback(async (device: AudioDevice) => {
    try {
      // Correct API: AudioDevice.select() triggers native routing + emits AudioDevicesUpdated
      await device.select();
    } catch (e) {
      // console.error('Error selecting audio device:', e);
    }
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
  // receiverIdentity is not needed for conference-based calling; we use room=matchId.
  const makeCall = useCallback(
    async (matchId: string, receiverId: string, _receiverIdentity: string) => {
      try {
        // Socket can be briefly disconnected when user just opened the chat screen.
        // Wait a moment for Socket.IO to connect instead of failing the first call attempt.
        const s = socket?.connected ? socket : await waitForConnection(2500);
        if (!s?.connected) {
          throw new Error('Socket not connected');
        }

        await ensureMicPermission();

        setStatus('calling');
        matchIdRef.current = matchId;
        otherUserIdRef.current = receiverId;

        // Ask server to signal receiver. Server will emit call_unavailable if receiver is offline.
        s.emit('call_initiate', { matchId, receiverId });

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

        // Connect caller into conference room via TwiML App Voice URL
        const token = await fetchToken();
        const voice = getVoice();
        const call = await voice.connect(token, {
          // Include both `room` and `To` (some TwiML apps read `To`)
          params: { room: matchId, To: matchId, role: 'caller' },
        });

        callRef.current = call;
        setActiveCall(call);

        call.on(Call.Event.Connected, () => setStatus('connected'));
        call.on(Call.Event.Disconnected, () => cleanup());
        call.on(Call.Event.ConnectFailure, (err: any) => {
          // console.error('Call connect failure:', err);
          cleanup();
        });
      } catch (e: any) {
        // console.error('Error making call:', e);
        cleanup();
      }
    },
    [socket, isConnected, waitForConnection, cleanup, ensureMicPermission, getVoice]
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
      const voice = getVoice();
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
      // console.error('Error answering call:', e);
      cleanup();
    }
  }, [incomingCall, socket, isConnected, cleanup, ensureMicPermission, getVoice]);

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
    isMuted,
    audioDevices,
    selectedAudioDevice,
    activeCall,
    incomingCall,
    makeCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    selectAudioDevice,
  };
}
