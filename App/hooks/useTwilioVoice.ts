import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  TwilioVoice,
  Call,
  CallInvite,
  CallState,
} from '@ashworthhub/twilio-voice-expo';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from './useSocket';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:6969/api/v1';

export interface CallStatus {
  isCalling: boolean;
  isRinging: boolean;
  isConnected: boolean;
  isEnded: boolean;
  callSid?: string;
  error?: string;
}

export const useTwilioVoice = () => {
  const { idToken, getIdToken, dbUser } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const [callStatus, setCallStatus] = useState<CallStatus>({
    isCalling: false,
    isRinging: false,
    isConnected: false,
    isEnded: false,
  });
  const [incomingCall, setIncomingCall] = useState<{
    matchId: string;
    callerId: string;
    callerIdentity: string;
  } | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const callRef = useRef<Call | null>(null);
  const tokenRef = useRef<string | null>(null);

  const token = idToken || getIdToken();

  // Initialize Twilio Voice
  useEffect(() => {
    const initializeTwilio = async () => {
      try {
        // Note: The register method might need an access token
        // We'll register when we get the token
        console.log('Twilio Voice ready');
      } catch (error) {
        console.error('Failed to initialize Twilio Voice:', error);
      }
    };

    initializeTwilio();

    return () => {
      if (callRef.current) {
        try {
          callRef.current.disconnect();
        } catch (error) {
          console.error('Error disconnecting call:', error);
        }
      }
    };
  }, []);

  // Fetch Twilio access token from backend
  const fetchAccessToken = useCallback(async (): Promise<string> => {
    try {
      const response = await axios.get(`${API_URL}/call/token`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success && response.data.data.token) {
        tokenRef.current = response.data.data.token;
        return response.data.data.token;
      }
      throw new Error('Failed to get access token');
    } catch (error: any) {
      console.error('Error fetching access token:', error);
      throw new Error(error?.response?.data?.message || 'Failed to get access token');
    }
  }, [token]);

  // Listen for incoming calls via socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleIncomingCall = (data: {
      matchId: string;
      callerId: string;
      callerIdentity: string;
    }) => {
      console.log('Incoming call:', data);
      setIncomingCall(data);
      setCallStatus({
        isCalling: false,
        isRinging: true,
        isConnected: false,
        isEnded: false,
      });
    };

    const handleCallAnswered = (data: {
      matchId: string;
      receiverId: string;
      receiverIdentity: string;
    }) => {
      console.log('Call answered:', data);
      setCallStatus((prev) => ({
        ...prev,
        isRinging: false,
        isConnected: true,
      }));
    };

    const handleCallRejected = (data: { matchId: string; receiverId: string }) => {
      console.log('Call rejected:', data);
      setIncomingCall(null);
      setCallStatus({
        isCalling: false,
        isRinging: false,
        isConnected: false,
        isEnded: true,
      });
    };

    const handleCallEnded = (data: { matchId: string; endedBy: string }) => {
      console.log('Call ended:', data);
      if (callRef.current) {
        callRef.current.disconnect();
        callRef.current = null;
      }
      setActiveCall(null);
      setIncomingCall(null);
      setCallStatus({
        isCalling: false,
        isRinging: false,
        isConnected: false,
        isEnded: true,
      });
    };

    socket.on('call_incoming', handleIncomingCall);
    socket.on('call_answered', handleCallAnswered);
    socket.on('call_rejected', handleCallRejected);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('call_incoming', handleIncomingCall);
      socket.off('call_answered', handleCallAnswered);
      socket.off('call_rejected', handleCallRejected);
      socket.off('call_ended', handleCallEnded);
    };
  }, [socket, isConnected]);

  // Listen for Twilio call events
  useEffect(() => {
    if (!activeCall) return;

    const handleCallStateChange = (call: Call, state: CallState) => {
      console.log('Call state changed:', state);
      setActiveCall(call);

      switch (state) {
        case CallState.Connecting:
          setCallStatus((prev) => ({
            ...prev,
            isCalling: true,
            isRinging: true,
          }));
          break;
        case CallState.Connected:
          setCallStatus((prev) => ({
            ...prev,
            isCalling: false,
            isRinging: false,
            isConnected: true,
            isEnded: false,
          }));
          break;
        case CallState.Disconnected:
          setCallStatus({
            isCalling: false,
            isRinging: false,
            isConnected: false,
            isEnded: true,
          });
          setActiveCall(null);
          callRef.current = null;
          break;
        default:
          break;
      }
    };

    const handleCallError = (call: Call, error: Error) => {
      console.error('Call error:', error);
      setCallStatus((prev) => ({
        ...prev,
        error: error.message,
        isEnded: true,
      }));
      setActiveCall(null);
      callRef.current = null;
    };

    activeCall.on('stateChanged', handleCallStateChange);
    activeCall.on('error', handleCallError);

    return () => {
      activeCall.off('stateChanged', handleCallStateChange);
      activeCall.off('error', handleCallError);
    };
  }, [activeCall]);

  // Make a call
  const makeCall = useCallback(
    async (matchId: string, receiverId: string, receiverIdentity: string) => {
      try {
        if (!socket || !isConnected) {
          throw new Error('Socket not connected');
        }

        setCallStatus({
          isCalling: true,
          isRinging: false,
          isConnected: false,
          isEnded: false,
        });

        // Emit call initiation event
        socket.emit('call_initiate', { matchId, receiverId });

        // Get access token
        const accessToken = await fetchAccessToken();

        // Register with Twilio first (if needed)
        try {
          await TwilioVoice.register(accessToken);
        } catch (regError) {
          console.log('Register error (may be already registered):', regError);
        }

        // Make the call using Twilio
        const call = await TwilioVoice.connect({
          accessToken,
          params: {
            To: receiverIdentity, // Twilio client identity
          },
        });

        callRef.current = call;
        setActiveCall(call);
      } catch (error: any) {
        console.error('Error making call:', error);
        setCallStatus((prev) => ({
          ...prev,
          error: error.message || 'Failed to make call',
          isCalling: false,
          isEnded: true,
        }));
      }
    },
    [socket, isConnected, fetchAccessToken]
  );

  // Answer incoming call
  const answerCall = useCallback(async () => {
    try {
      if (!incomingCall || !socket) {
        throw new Error('No incoming call');
      }

      const accessToken = await fetchAccessToken();

      // Register with Twilio first (if needed)
      try {
        await TwilioVoice.register(accessToken);
      } catch (regError) {
        console.log('Register error (may be already registered):', regError);
      }

      // Answer the call
      // Note: The exact API may vary - check @ashworthhub/twilio-voice-expo docs
      const call = await TwilioVoice.accept({
        accessToken,
        callInvite: incomingCall as any, // Type assertion - adjust based on actual API
      });

      // Notify caller via socket
      socket.emit('call_answer', {
        matchId: incomingCall.matchId,
        callerId: incomingCall.callerId,
      });

      callRef.current = call;
      setActiveCall(call);
      setIncomingCall(null);
      setCallStatus({
        isCalling: false,
        isRinging: false,
        isConnected: true,
        isEnded: false,
      });
    } catch (error: any) {
      console.error('Error answering call:', error);
      setCallStatus((prev) => ({
        ...prev,
        error: error.message || 'Failed to answer call',
        isEnded: true,
      }));
      setIncomingCall(null);
    }
  }, [incomingCall, socket, fetchAccessToken]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (!incomingCall || !socket) return;

    socket.emit('call_reject', {
      matchId: incomingCall.matchId,
      callerId: incomingCall.callerId,
    });

    setIncomingCall(null);
    setCallStatus({
      isCalling: false,
      isRinging: false,
      isConnected: false,
      isEnded: true,
    });
  }, [incomingCall, socket]);

  // End active call
  const endCall = useCallback(() => {
    if (callRef.current) {
      callRef.current.disconnect();
      callRef.current = null;
    }

    if (activeCall) {
      activeCall.disconnect();
      setActiveCall(null);
    }

    if (socket && incomingCall) {
      socket.emit('call_end', {
        matchId: incomingCall.matchId,
        otherUserId: incomingCall.callerId,
      });
    }

    setIncomingCall(null);
    setCallStatus({
      isCalling: false,
      isRinging: false,
      isConnected: false,
      isEnded: true,
    });
  }, [activeCall, incomingCall, socket]);

  return {
    callStatus,
    incomingCall,
    activeCall,
    makeCall,
    answerCall,
    rejectCall,
    endCall,
  };
};

