import { useCallback, useMemo } from 'react';
import { useWebRTC, CallStatus } from './useWebRTC';

type VoiceCallStatus = {
  isCalling: boolean;
  isRinging: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  isEnded: boolean;
  error?: string;
};

export function useWebRTCVoice() {
  const {
    status,
    isMuted,
    localStream,
    remoteStream,
    incomingCall: baseIncomingCall,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
  } = useWebRTC();

  // Filter to only voice calls
  const incomingCall = useMemo(() => {
    return baseIncomingCall?.callType === 'voice' ? baseIncomingCall : null;
  }, [baseIncomingCall]);

  const makeCall = useCallback(
    async (matchId: string, receiverId: string, _receiverIdentity: string) => {
      await initiateCall({
        matchId,
        receiverId,
        callType: 'voice',
      });
    },
    [initiateCall]
  );

  const callStatus: VoiceCallStatus = useMemo(
    () => ({
      isCalling: status === 'calling',
      isRinging: status === 'ringing',
      isConnecting: status === 'connecting',
      isConnected: status === 'connected',
      isEnded: status === 'idle',
      error: undefined,
    }),
    [status]
  );

  return {
    status,
    callStatus,
    isMuted,
    incomingCall,
    makeCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    localStream,
    remoteStream,
  };
}
