import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  callStatus: any;
  incomingCall: any;
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

  // -----------------------------
  // Audio routing logic
  // -----------------------------
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  const setupCallAudio = useCallback(async (speaker: boolean) => {
    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        shouldRouteThroughEarpiece: !speaker,
      });
    } catch (e) {
      console.log('Audio setup error', e);
    }
  }, []);

  const resetCallAudio = useCallback(async () => {
    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: false,
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      });
    } catch (e) {
      console.log('Audio reset error', e);
    }
  }, []);

  const onAudioDevicePress = useCallback(async () => {
    const next = !isSpeakerOn;
    setIsSpeakerOn(next);
    await setupCallAudio(next);
  }, [isSpeakerOn, setupCallAudio]);

  // Voice call → default earpiece
  useEffect(() => {
    if (callStatus.isConnected) {
      setIsSpeakerOn(false);
      setupCallAudio(false);
    }
  }, [callStatus.isConnected, setupCallAudio]);

  // Video call → default speaker
  useEffect(() => {
    if (videoStatus === 'connected') {
      setIsSpeakerOn(true);
      setupCallAudio(true);
    }
  }, [videoStatus, setupCallAudio]);

  // Reset audio when everything ends
  useEffect(() => {
    if (callStatus.isEnded && videoStatus === 'idle') {
      resetCallAudio();
      setIsSpeakerOn(false);
    }
  }, [callStatus.isEnded, videoStatus, resetCallAudio]);

  // -----------------------------
  // Ringtone logic
  // -----------------------------
  const ringPlayerRef = useRef<AudioPlayer | null>(null);
  const ringSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const ringAsset = useMemo(
    () => Asset.fromModule(require('@/assets/sounds/call-ring.mp3')),
    []
  );

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
    if (callStatus.isConnected || videoStatus === 'connected') {
      stopRingtone();
    }
  }, [callStatus.isConnected, videoStatus, stopRingtone]);

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

        const subscription = player.addListener(
          'playbackStatusUpdate',
          (status: AudioStatus) => {
            if (!status.isLoaded) return;
            if (status.didJustFinish) {
              player.seekTo(0);
              player.play();
            }
          }
        );
        ringSubscriptionRef.current = subscription;
        player.play();
      } catch (error) {
        console.error('Error playing ringtone:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    incomingCall,
    incomingVideoCall,
    callStatus.isRinging,
    callStatus.isConnected,
    videoStatus,
    ringAsset,
    stopRingtone,
  ]);

  // -----------------------------
  // Context value
  // -----------------------------
  const ctx = useMemo<CallContextValue>(
    () => ({
      makeCall,
      makeVideoCall,
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
      makeCall,
      makeVideoCall,
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

  return (
    <CallContext.Provider value={ctx}>
      {children}

      <VoiceCallUI
        visible={!callStatus.isEnded}
        isIncoming={!!incomingCall}
        isConnected={callStatus.isConnected}
        isRinging={callStatus.isRinging}
        isConnecting={callStatus.isConnecting}
        userName="User"
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isSpeakerOn={isSpeakerOn}
        onAudioDevicePress={onAudioDevicePress}
        onAnswer={answerCall}
        onReject={rejectCall}
        onEnd={endCall}
      />

      <VideoCallUI
        visible={videoStatus !== 'idle'}
        isIncoming={!!incomingVideoCall}
        isConnected={videoStatus === 'connected'}
        isRinging={videoStatus === 'ringing'}
        isConnecting={videoStatus === 'connecting'}
        userName="User"
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
