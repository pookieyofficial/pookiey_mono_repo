import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { VoiceCallUI } from '@/components/VoiceCallUI';
import { useTwilioVoice } from '@/hooks/useTwilioVoice';
import { useMessagingStore } from '@/store/messagingStore';
import { AudioDevice } from '@twilio/voice-react-native-sdk';

type CallContextValue = {
  makeCall: (matchId: string, receiverId: string, receiverIdentity: string) => Promise<void>;
  answerCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  isMuted: boolean;
  onAudioDevicePress: () => void;
  selectedAudioDeviceName?: string;
  isSpeakerOn: boolean;
  callStatus: {
    isCalling: boolean;
    isRinging: boolean;
    isConnected: boolean;
    isEnded: boolean;
    error?: string;
  };
  incomingCall: { matchId: string; callerId: string; callerIdentity: string } | null;
};

const CallContext = createContext<CallContextValue | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { inbox } = useMessagingStore();
  const {
    callStatus,
    incomingCall,
    makeCall,
    answerCall,
    rejectCall,
    endCall,
    isMuted,
    toggleMute,
    audioDevices,
    selectedAudioDevice,
    selectAudioDevice,
  } = useTwilioVoice();
  const [outgoingMatchId, setOutgoingMatchId] = useState<string | null>(null);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  const caller = useMemo(() => {
    if (!incomingCall?.matchId) return null;
    return inbox.find((i) => i.matchId === incomingCall.matchId) || null;
  }, [incomingCall?.matchId, inbox]);

  const outgoingPeer = useMemo(() => {
    if (!outgoingMatchId) return null;
    return inbox.find((i) => i.matchId === outgoingMatchId) || null;
  }, [outgoingMatchId, inbox]);

  // Keep the active matchId stable during a call.
  // (incomingCall is cleared on answer, but we still want to show the same userName/avatar while connected)
  useEffect(() => {
    if (incomingCall?.matchId) {
      setActiveMatchId(incomingCall.matchId);
    }
  }, [incomingCall?.matchId]);

  // Clear outgoing target when call fully ends
  useEffect(() => {
    if (callStatus.isEnded) {
      setOutgoingMatchId(null);
      setActiveMatchId(null);
    }
  }, [callStatus.isEnded]);

  const makeCallWithTarget = useMemo(() => {
    return async (matchId: string, receiverId: string, receiverIdentity: string) => {
      setOutgoingMatchId(matchId);
      setActiveMatchId(matchId);
      await makeCall(matchId, receiverId, receiverIdentity);
    };
  }, [makeCall]);

  const activePeer = useMemo(() => {
    if (!activeMatchId) return null;
    return inbox.find((i) => i.matchId === activeMatchId) || null;
  }, [activeMatchId, inbox]);

  const isSpeakerOn =
    selectedAudioDevice?.type === (AudioDevice as any)?.Type?.Speaker ||
    (selectedAudioDevice?.name || '').toLowerCase().includes('speaker');

  const onAudioDevicePress = useCallback(async () => {
    const devices = audioDevices || [];
    if (!devices.length) {
      Alert.alert('Audio output', 'No audio devices found.');
      return;
    }

    // If we only have earpiece/speaker, toggle quickly
    if (devices.length <= 2) {
      const speaker = devices.find((d) => d.type === (AudioDevice as any)?.Type?.Speaker);
      const earpiece = devices.find((d) => d.type === (AudioDevice as any)?.Type?.Earpiece);
      if (speaker && earpiece) {
        const next = selectedAudioDevice?.uuid === speaker.uuid ? earpiece : speaker;
        await selectAudioDevice(next);
        return;
      }
    }

    Alert.alert(
      'Audio output',
      'Choose where you want to hear the call',
      [
        ...devices.map((d) => ({
          text: d.name,
          onPress: () => selectAudioDevice(d),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  }, [audioDevices, selectedAudioDevice?.uuid, selectAudioDevice]);

  const ctx = useMemo<CallContextValue>(
    () => ({
      makeCall: makeCallWithTarget,
      answerCall,
      rejectCall,
      endCall,
      toggleMute,
      isMuted,
      onAudioDevicePress,
      selectedAudioDeviceName: selectedAudioDevice?.name,
      isSpeakerOn,
      callStatus,
      incomingCall,
    }),
    [
      makeCallWithTarget,
      answerCall,
      rejectCall,
      endCall,
      toggleMute,
      isMuted,
      onAudioDevicePress,
      selectedAudioDevice?.name,
      isSpeakerOn,
      callStatus,
      incomingCall,
    ]
  );

  const displayName = activePeer?.name || (incomingCall ? caller?.name : outgoingPeer?.name) || 'User';
  const displayAvatar = activePeer?.avatar || (incomingCall ? caller?.avatar : outgoingPeer?.avatar);

  return (
    <CallContext.Provider value={ctx}>
      {children}

      {/* Global voice call UI (so incoming calls show on any screen while app is open) */}
      <VoiceCallUI
        visible={
          callStatus.isCalling || callStatus.isRinging || callStatus.isConnected || !!incomingCall
        }
        isIncoming={!!incomingCall}
        isConnected={callStatus.isConnected}
        isRinging={callStatus.isRinging}
        userName={displayName}
        userAvatar={displayAvatar}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isSpeakerOn={isSpeakerOn}
        onAudioDevicePress={onAudioDevicePress}
        onAnswer={answerCall}
        onReject={rejectCall}
        onEnd={endCall}
      />
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within a CallProvider');
  return ctx;
}


