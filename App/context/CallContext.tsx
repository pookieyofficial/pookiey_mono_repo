import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { VoiceCallUI } from '@/components/VoiceCallUI';
import { useTwilioVoice } from '@/hooks/useTwilioVoice';
import { useMessagingStore } from '@/store/messagingStore';
import { AudioDevice } from '@twilio/voice-react-native-sdk';
import CustomDialog, { DialogType } from '@/components/CustomDialog';

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

  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>('info');
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [dialogPrimaryButton, setDialogPrimaryButton] = useState<{ text: string; onPress: () => void }>({ text: 'OK', onPress: () => setDialogVisible(false) });
  const [dialogSecondaryButton, setDialogSecondaryButton] = useState<{ text: string; onPress: () => void } | undefined>(undefined);
  const [dialogCancelButton, setDialogCancelButton] = useState<{ text: string; onPress: () => void } | undefined>(undefined);

  // Show dialog helper function
  const showDialog = (
    type: DialogType,
    message: string,
    title?: string,
    primaryButton?: { text: string; onPress: () => void },
    secondaryButton?: { text: string; onPress: () => void },
    cancelButton?: { text: string; onPress: () => void }
  ) => {
    setDialogType(type);
    setDialogTitle(title || '');
    setDialogMessage(message);
    setDialogPrimaryButton(primaryButton || { text: 'OK', onPress: () => setDialogVisible(false) });
    setDialogSecondaryButton(secondaryButton);
    setDialogCancelButton(cancelButton);
    setDialogVisible(true);
  };

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
      showDialog('info', 'No audio devices found.', 'Audio output');
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

    // For multiple devices, show selection dialog
    // Since CustomDialog supports limited buttons, we'll show the first 2 devices as buttons
    // and list others in the message, or show all in message with instructions
    if (devices.length > 2) {
      const deviceList = devices.map((d, idx) => `${idx + 1}. ${d.name}`).join('\n');
      const firstDevice = devices[0];
      const secondDevice = devices[1];
      
      showDialog(
        'info',
        `Available audio devices:\n${deviceList}\n\nTap a button to select, or use the toggle for quick switching.`,
        'Audio output',
        {
          text: firstDevice.name,
          onPress: () => {
            setDialogVisible(false);
            selectAudioDevice(firstDevice);
          },
        },
        secondDevice ? {
          text: secondDevice.name,
          onPress: () => {
            setDialogVisible(false);
            selectAudioDevice(secondDevice);
          },
        } : undefined,
        {
          text: 'Cancel',
          onPress: () => setDialogVisible(false),
        }
      );
    } else if (devices.length === 2) {
      // Two devices - show both as buttons
      const firstDevice = devices[0];
      const secondDevice = devices[1];
      
      showDialog(
        'info',
        'Choose where you want to hear the call',
        'Audio output',
        {
          text: firstDevice.name,
          onPress: () => {
            setDialogVisible(false);
            selectAudioDevice(firstDevice);
          },
        },
        {
          text: secondDevice.name,
          onPress: () => {
            setDialogVisible(false);
            selectAudioDevice(secondDevice);
          },
        },
        {
          text: 'Cancel',
          onPress: () => setDialogVisible(false),
        }
      );
    } else if (devices.length === 1) {
      // Single device - just select it
      await selectAudioDevice(devices[0]);
    }
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

      <CustomDialog
        visible={dialogVisible}
        type={dialogType}
        title={dialogTitle}
        message={dialogMessage}
        onDismiss={() => setDialogVisible(false)}
        primaryButton={dialogPrimaryButton}
        secondaryButton={dialogSecondaryButton}
        cancelButton={dialogCancelButton}
      />

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


