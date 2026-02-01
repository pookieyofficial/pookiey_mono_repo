import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { VoiceCallUI } from '@/components/VoiceCallUI';
import { VideoCallUI } from '@/components/VideoCallUI';
import { useWebRTCVoice } from '@/hooks/useWebRTCVoice';
import { useWebRTCVideo } from '@/hooks/useWebRTCVideo';
import { useMessagingStore } from '@/store/messagingStore';
import CustomDialog, { DialogType } from '@/components/CustomDialog';
import { Asset } from 'expo-asset';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer, AudioStatus } from 'expo-audio';

type CallContextValue = {
  makeCall: (matchId: string, receiverId: string, receiverIdentity: string) => Promise<void>;
  makeVideoCall: (matchId: string, receiverId: string, receiverIdentity: string) => Promise<void>;
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
    isConnecting: boolean;
    isConnected: boolean;
    isEnded: boolean;
    error?: string;
  };
  incomingCall: { matchId: string; callerId: string; callerIdentity: string; callType?: 'voice' | 'video' } | null;
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
    clearError: clearVoiceError,
  } = useWebRTCVoice();
  const {
    status: videoStatus,
    error: videoError,
    isMuted: videoIsMuted,
    isVideoEnabled,
    videoTracks,
    incomingVideoCall,
    makeVideoCall,
    answerVideoCall,
    rejectVideoCall,
    endVideoCall,
    toggleMute: toggleVideoMute,
    toggleVideo,
    flipCamera,
    localStream,
    remoteStream,
    clearError: clearVideoError,
  } = useWebRTCVideo();
  const [outgoingMatchId, setOutgoingMatchId] = useState<string | null>(null);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [activeVideoMatchId, setActiveVideoMatchId] = useState<string | null>(null);
  const ringPlayerRef = useRef<AudioPlayer | null>(null);
  const ringSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const ringAsset = useMemo(
    () => Asset.fromModule(require('@/assets/sounds/call-ring.mp3')),
    []
  );

  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>('info');
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [dialogPrimaryButton, setDialogPrimaryButton] = useState<{ text: string; onPress: () => void }>({ text: 'OK', onPress: () => setDialogVisible(false) });
  const [dialogSecondaryButton, setDialogSecondaryButton] = useState<{ text: string; onPress: () => void } | undefined>(undefined);
  const [dialogCancelButton, setDialogCancelButton] = useState<{ text: string; onPress: () => void } | undefined>(undefined);

  // Show dialog helper function
  const showDialog = useCallback((
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
  }, []);

  useEffect(() => {
    if (callStatus.error) {
      showDialog('info', callStatus.error, 'Call ended');
      clearVoiceError();
    }
  }, [callStatus.error, clearVoiceError, showDialog]);

  useEffect(() => {
    if (videoError) {
      showDialog('info', videoError, 'Call ended');
      clearVideoError();
    }
  }, [videoError, clearVideoError, showDialog]);

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
  }, [incomingCall?.matchId, inbox]);

  // Video: track active match for display name/avatar
  useEffect(() => {
    if (incomingVideoCall?.matchId) {
      setActiveVideoMatchId(incomingVideoCall.matchId);
    }
  }, [incomingVideoCall?.matchId, inbox]);

  // Clear video match when video call ends
  useEffect(() => {
    if (videoStatus === 'idle') {
      setActiveVideoMatchId(null);
    }
  }, [videoStatus]);

  // Clear outgoing target when call fully ends
  useEffect(() => {
    if (callStatus.isEnded) {
      setOutgoingMatchId(null);
      setActiveMatchId(null);
    }
  }, [callStatus.isEnded]);

  const stopRingtone = useCallback(() => {
    if (ringSubscriptionRef.current) {
      ringSubscriptionRef.current.remove();
      ringSubscriptionRef.current = null;
    }
    if (ringPlayerRef.current) {
      ringPlayerRef.current.pause();
      ringPlayerRef.current.remove();
      ringPlayerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const shouldRing =
      (!!incomingCall && callStatus.isRinging && !callStatus.isConnected) ||
      (!!incomingVideoCall && videoStatus === 'ringing');

    if (!shouldRing) {
      stopRingtone();
      return;
    }

    let cancelled = false;
    (async () => {
      if (ringPlayerRef.current) {
        if (!ringPlayerRef.current.playing) {
          ringPlayerRef.current.play();
        }
        return;
      }

      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: false,
          shouldPlayInBackground: false,
        });

        await ringAsset.downloadAsync();
        const uri = ringAsset.localUri ?? ringAsset.uri;
        const player = createAudioPlayer({ uri }, { updateInterval: 500 });

        if (cancelled) {
          player.remove();
          return;
        }

        player.loop = true;
        ringPlayerRef.current = player;
        const subscription = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            player.seekTo(0);
            player.play();
          }
        });
        ringSubscriptionRef.current = subscription;
        player.play();
      } catch (error) {
        console.error('Error playing ringtone:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [incomingCall, incomingVideoCall, callStatus.isRinging, callStatus.isConnected, videoStatus, ringAsset, stopRingtone]);

  useEffect(() => {
    return () => {
      stopRingtone();
    };
  }, [stopRingtone]);

  const makeCallWithTarget = useMemo(() => {
    return async (matchId: string, receiverId: string, receiverIdentity: string) => {
      setOutgoingMatchId(matchId);
      setActiveMatchId(matchId);
      await makeCall(matchId, receiverId, receiverIdentity);
    };
  }, [makeCall]);

  const makeVideoCallWithTarget = useMemo(() => {
    return async (matchId: string, receiverId: string, receiverIdentity: string) => {
      setActiveVideoMatchId(matchId);
      await makeVideoCall(matchId, receiverId, receiverIdentity);
    };
  }, [makeVideoCall]);

  const activePeer = useMemo(() => {
    if (!activeMatchId) return null;
    return inbox.find((i) => i.matchId === activeMatchId) || null;
  }, [activeMatchId, inbox]);

  const videoPeer = useMemo(() => {
    const matchId = activeVideoMatchId || incomingVideoCall?.matchId;
    if (!matchId) return null;
    return inbox.find((i) => i.matchId === matchId) || null;
  }, [activeVideoMatchId, incomingVideoCall?.matchId, inbox]);

  // WebRTC audio routing - simplified for now
  // Note: Audio device selection in WebRTC requires native implementation
  // For now, we'll use a simple speaker toggle
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  const onAudioDevicePress = useCallback(async () => {
    setIsSpeakerOn(!isSpeakerOn);
  }, [isSpeakerOn]);

  const ctx = useMemo<CallContextValue>(
    () => ({
      makeCall: makeCallWithTarget,
      makeVideoCall: makeVideoCallWithTarget,
      answerCall,
      rejectCall,
      endCall,
      toggleMute,
      isMuted,
      onAudioDevicePress,
      selectedAudioDeviceName: isSpeakerOn ? 'Speaker' : 'Earpiece',
      isSpeakerOn,
      callStatus,
      incomingCall,
    }),
    [
      makeCallWithTarget,
      makeVideoCallWithTarget,
      answerCall,
      rejectCall,
      endCall,
      toggleMute,
      isMuted,
      onAudioDevicePress,
      isSpeakerOn,
      callStatus,
      incomingCall,
    ]
  );

  const displayName = activePeer?.name || (incomingCall ? caller?.name : outgoingPeer?.name) || 'User';
  const displayAvatar = activePeer?.avatar || (incomingCall ? caller?.avatar : outgoingPeer?.avatar);
  const videoDisplayName = videoPeer?.name || 'User';
  const videoDisplayAvatar = videoPeer?.avatar;

  // Do we have enough info to render names/avatars?
  const hasCallerInfo = !!(caller || activePeer);
  const hasVideoCallerInfo = !!videoPeer;

  // Voice visibility:
  // - Outgoing (no incomingCall): show for calling / connecting / connected
  // - Incoming (incomingCall present): show only if we have caller info AND status is ringing/connecting/connected
  // - Never show when ended/idle
  const isVoiceOutgoingActive =
    !incomingCall &&
    (callStatus.isCalling || callStatus.isConnecting || callStatus.isConnected);

  const isVoiceIncomingActive =
    !!incomingCall &&
    hasCallerInfo &&
    (callStatus.isRinging || callStatus.isConnecting || callStatus.isConnected);

  const voiceVisible = !callStatus.isEnded && (isVoiceOutgoingActive || isVoiceIncomingActive);

  // Video visibility:
  // - Outgoing (no incomingVideoCall): show for calling / connecting / connected
  // - Incoming (incomingVideoCall present): show only if we have caller info AND status is ringing/connecting/connected
  // - Never show when idle
  const isVideoOutgoingActive =
    !incomingVideoCall &&
    (videoStatus === 'calling' || videoStatus === 'connecting' || videoStatus === 'connected');

  const isVideoIncomingActive =
    !!incomingVideoCall &&
    hasVideoCallerInfo &&
    (videoStatus === 'ringing' || videoStatus === 'connecting' || videoStatus === 'connected');

  const videoVisible = videoStatus !== 'idle' && (isVideoOutgoingActive || isVideoIncomingActive);

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
        visible={voiceVisible && !videoVisible}
        isIncoming={!!incomingCall}
        isConnected={callStatus.isConnected}
        isRinging={callStatus.isRinging}
        isConnecting={callStatus.isConnecting}
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

      {/* Global video call UI */}
      <VideoCallUI
        visible={videoVisible}
        isIncoming={!!incomingVideoCall}
        isConnected={videoStatus === 'connected'}
        isRinging={videoStatus === 'ringing'}
        isConnecting={videoStatus === 'connecting'}
        userName={videoDisplayName}
        userAvatar={videoDisplayAvatar}
        isMuted={videoIsMuted}
        isVideoEnabled={isVideoEnabled}
        onToggleMute={toggleVideoMute}
        onToggleVideo={toggleVideo}
        onFlipCamera={flipCamera}
        onAnswer={answerVideoCall}
        onReject={rejectVideoCall}
        onEnd={endVideoCall}
        localStream={localStream}
        remoteStream={remoteStream}
        videoTracks={videoTracks}
      />
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within a CallProvider');
  return ctx;
}


