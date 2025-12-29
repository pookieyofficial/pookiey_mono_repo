import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSocket, Message } from '@/hooks/useSocket';
import { messageAPI } from '@/APIs/messageAPIs';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import CustomLoader from '@/components/CustomLoader';
import ParsedText from 'react-native-parsed-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { requestPresignedURl, uploadTos3 } from '@/hooks/uploadTos3';
import { useCall } from '@/context/CallContext';

export default function ChatRoom() {
  const params = useLocalSearchParams();
  const { dbUser, token } = useAuth();
  const {
    isConnected,
    checkCallReady,
    joinMatch,
    leaveMatch,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    onNewMessage,
    onUserTyping,
    onUserStoppedTyping,
  } = useSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputThemedText, setInputThemedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState(0);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const recordingDurationRef = useRef(0);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const navigation = useNavigation();
  const [isOtherUserOnline, setIsOtherUserOnline] = useState<boolean>(false);

  const { makeCall } = useCall();

  const matchId = params.matchId as string;
  const userName = params.userName as string;
  const userAvatar = params.userAvatar as string;
  const otherUserId = params.userId as string;
  const insets = useSafeAreaInsets();

  // Check if user has active subscription with premium or super plan
  const isPremium = 
    dbUser?.subscription?.status === 'active' && 
    (dbUser?.subscription?.plan === 'premium' || dbUser?.subscription?.plan === 'super');

  const [imageError, setImageError] = useState(false);

  useLayoutEffect(() => {
    console.log('userAvatar', userAvatar);
    navigation.setOptions({
      headerShown: true,
      headerTitle: '',
      headerLeft: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -8 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 8, marginRight: 4 }}
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>

          {userAvatar && userAvatar.length > 0 && !imageError ? (
            <Image
              source={{ uri: userAvatar }}
              style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }}
              contentFit="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                marginRight: 12,
                backgroundColor: '#e1e1e1',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#666' }}>
                {userName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
          <View>
            <ThemedText style={{ fontSize: 17, fontWeight: '600', color: '#000' }}>
              {userName}
            </ThemedText>
            {isTyping && (
              <ThemedText style={{ fontSize: 13, color: '#FF3B30', fontStyle: 'italic' }}>
                typing...
              </ThemedText>
            )}
          </View>
        </View>
      ),
      headerRight: () => (
        <View style={{ position: 'relative', marginRight: 8 }}>
          <TouchableOpacity
            onPress={() => {
              if (dbUser?.user_id && otherUserId) {
                // Check premium status first
                if (!isPremium) {
                  Alert.alert(
                    'Premium Required',
                    'Voice calling requires a premium subscription. Please upgrade to make calls.'
                  );
                  return;
                }

                const canCallNow = isConnected && isOtherUserOnline;
                if (!isConnected) {
                  Alert.alert('Connecting...', 'Please wait while we are connecting to the recipient!');
                  return;
                }
                if (!isOtherUserOnline) {
                  Alert.alert('Call unavailable', 'You can only call when the recipient is online on Pookiey!');
                  return;
                }
                if (canCallNow) {
                  makeCall(matchId, otherUserId, otherUserId);
                }
              }
            }}
            style={{ padding: 8 }}
          >
            <Ionicons
              name="call"
              size={24}
              color={isConnected && isOtherUserOnline && isPremium ? '#FF3B30' : '#B0B0B0'}
            />
          </TouchableOpacity>
          {!isPremium && (
            <View
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                backgroundColor: 'transparent',
                borderRadius: 8,
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: '#fff',
              }}
            >
              <Ionicons name="lock-closed" size={20} color={Colors.text.secondary} />
            </View>
          )}
        </View>
      ),
      headerStyle: {
        backgroundColor: Colors.parentBackgroundColor,
      },
    });

    navigation.getParent()?.setOptions?.({
      tabBarStyle: {
        display: 'none',
      },
    });

    return () => {
      navigation.getParent()?.setOptions?.({
        tabBarStyle: {
          display: 'flex',
          backgroundColor: Colors.parentBackgroundColor,
        },
      });
    };
  }, [
    navigation,
    userName,
    userAvatar,
    isTyping,
    dbUser?.user_id,
    otherUserId,
    matchId,
    makeCall,
    isConnected,
    isOtherUserOnline,
    isPremium,
  ]);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [matchId]);

  // Join match room on mount
  useEffect(() => {
    if (matchId && isConnected) {
      joinMatch(matchId);
    }
    return () => {
      if (matchId) leaveMatch(matchId);
    };
  }, [matchId, isConnected, joinMatch, leaveMatch]);

  // Track whether the other user is connected (for enabling the call button)
  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    const refresh = async () => {
      if (!matchId || !otherUserId || !isConnected) {
        if (!cancelled) setIsOtherUserOnline(false);
        return;
      }

      const online = await checkCallReady(matchId, otherUserId);
      if (!cancelled) setIsOtherUserOnline(online);
    };

    refresh();
    interval = setInterval(refresh, 4000);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [matchId, otherUserId, isConnected, checkCallReady]);

  // Listen for new messages
  useEffect(() => {
    const cleanup = onNewMessage((message: Message) => {
      if (message.matchId === matchId) {
        setMessages((prev) => [...prev, message]);
        if (message.senderId !== dbUser?.user_id) markAsRead(matchId);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });
    return cleanup;
  }, [matchId, dbUser?.user_id]);

  // Listen for typing indicators
  useEffect(() => {
    const cleanupTyping = onUserTyping((data) => {
      if (data.userId === otherUserId) setIsTyping(true);
    });
    const cleanupStoppedTyping = onUserStoppedTyping((data) => {
      if (data.userId === otherUserId) setIsTyping(false);
    });
    return () => {
      cleanupTyping();
      cleanupStoppedTyping();
    };
  }, [otherUserId]);

  // Scroll on keyboard open and track keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = undefined;
      }
      const currentSound = soundRef.current;
      if (currentSound) {
        currentSound.setOnPlaybackStatusUpdate(null);
        void currentSound.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      if (token && dbUser?.user_id) {
        const data = await messageAPI.getMessages(token, { matchId });
        setMessages(data);
        markAsRead(matchId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = useCallback(() => {
    if (!inputThemedText.trim()) return;
    const messageData = {
      matchId,
      text: inputThemedText.trim(),
      type: 'text' as const,
    };
    sendMessage(messageData);
    setInputThemedText('');
    stopTyping(matchId);
  }, [inputThemedText, matchId, sendMessage, stopTyping]);

  const handleTyping = useCallback((text: string) => {
    setInputThemedText(text);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (text.length > 0) {
      startTyping(matchId);
      typingTimeoutRef.current = setTimeout(() => stopTyping(matchId), 1000);
    } else stopTyping(matchId);
  }, [matchId, startTyping, stopTyping]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDateHeader = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDurationLabel = (totalSeconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleSendVoiceNote = useCallback(
    async (localUri: string, durationSeconds: number) => {
      try {
        setUploadingAudio(true);
        const mimeType = 'audio/m4a';
        const presignedUrls = await requestPresignedURl([mimeType]);

        if (!Array.isArray(presignedUrls) || presignedUrls.length === 0) {
          throw new Error('Failed to obtain upload URL');
        }

        const { uploadUrl, fileURL } = presignedUrls[0];
        const uploaded = await uploadTos3(localUri, uploadUrl, mimeType);

        if (!uploaded) {
          throw new Error('Upload failed');
        }

        await FileSystem.deleteAsync(localUri, { idempotent: true });

        sendMessage({
          matchId,
          text: '[Voice note]',
          type: 'audio',
          mediaUrl: fileURL,
          audioDuration: durationSeconds,
        });
        stopTyping(matchId);
      } catch (error) {
        console.error('Error sending voice note:', error);
        Alert.alert(
          'Upload failed',
          'We could not send your voice note. Please try again.'
        );
      } finally {
        await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => { });
        setUploadingAudio(false);
      }
    },
    [matchId, sendMessage, stopTyping]
  );

  const finalizeRecording = useCallback(
    async (shouldSend: boolean) => {
      if (!recording) return;

      const durationSeconds = Math.max(1, recordingDurationRef.current);
      let uri: string | null = null;

      try {
        await recording.stopAndUnloadAsync();
        uri = recording.getURI();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = undefined;
      }

      setRecording(null);
      setIsRecording(false);
      setRecordingDurationSeconds(0);
      recordingDurationRef.current = 0;

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
      } catch (error) {
        console.error('Error resetting audio mode:', error);
      }

      if (!uri) {
        if (shouldSend) {
          Alert.alert('Voice note error', 'We could not access the recorded file.');
        }
        return;
      }

      if (shouldSend) {
        await handleSendVoiceNote(uri, durationSeconds);
      } else {
        await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => { });
      }
    },
    [recording, handleSendVoiceNote]
  );

  const startRecordingVoiceNote = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(
          'Microphone access needed',
          'Please enable microphone access in your device settings to send voice notes.'
        );
        return;
      }

      if (soundRef.current) {
        soundRef.current.setOnPlaybackStatusUpdate(null);
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlayingMessageId(null);
        setIsSoundPlaying(false);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recordingObject = new Audio.Recording();
      await recordingObject.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recordingObject.startAsync();

      setRecording(recordingObject);
      setIsRecording(true);
      recordingDurationRef.current = 0;
      setRecordingDurationSeconds(0);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      recordingIntervalRef.current = setInterval(async () => {
        try {
          const status = await recordingObject.getStatusAsync();
          if (status.isRecording && typeof status.durationMillis === 'number') {
            const seconds = Math.floor(status.durationMillis / 1000);
            recordingDurationRef.current = seconds;
            setRecordingDurationSeconds(seconds);
          }
        } catch (error) {
          console.error('Error updating recording status:', error);
        }
      }, 250);
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecording(null);
      setIsRecording(false);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      }).catch(() => { });
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to start recording. Please try again.';
      Alert.alert(
        'Recording error',
        errorMessage.includes('Session activation failed')
          ? 'Another app is using the microphone or audio sources.'
          : 'Unable to start recording. Please try again.'
      );
      return;
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    finalizeRecording(true).catch((error) =>
      console.error('Error finalizing recording:', error)
    );
  }, [finalizeRecording]);

  const handleCancelRecording = useCallback(() => {
    finalizeRecording(false).catch((error) =>
      console.error('Error cancelling recording:', error)
    );
  }, [finalizeRecording]);

  const togglePlayback = useCallback(
    async (message: Message) => {
      if (!message.mediaUrl) return;

      try {
        if (playingMessageId === message._id && soundRef.current) {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            if (status.isPlaying) {
              await soundRef.current.pauseAsync();
              setIsSoundPlaying(false);
            } else {
              await soundRef.current.playAsync();
              setIsSoundPlaying(true);
            }
          }
          return;
        }

        if (soundRef.current) {
          soundRef.current.setOnPlaybackStatusUpdate(null);
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: message.mediaUrl },
          { shouldPlay: true }
        );

        await sound.setProgressUpdateIntervalAsync(250);

        soundRef.current = sound;
        setPlayingMessageId(message._id);
        setPlaybackPosition(0);
        const initialDuration = (message.audioDuration ?? 0) * 1000;
        setPlaybackDuration(initialDuration);
        setIsSoundPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) {
            return;
          }

          setIsSoundPlaying(status.isPlaying ?? false);

          const durationMillis =
            typeof status.durationMillis === 'number'
              ? status.durationMillis
              : (message.audioDuration ?? 0) * 1000;
          const positionMillis = status.positionMillis ?? 0;

          setPlaybackPosition(positionMillis);
          setPlaybackDuration(durationMillis);

          if (status.didJustFinish) {
            sound.setOnPlaybackStatusUpdate(null);
            setPlayingMessageId(null);
            setPlaybackPosition(0);
            setIsSoundPlaying(false);
            setPlaybackDuration((message.audioDuration ?? 0) * 1000);
            soundRef.current = null;
            void sound.unloadAsync();
          }
        });
      } catch (error) {
        console.error('Error playing voice note:', error);
        Alert.alert('Playback error', 'Unable to play this voice note.');
      }
    },
    [playingMessageId]
  );

  // group messages with date dividers
  const groupedMessages: any[] = [];
  let lastDate = '';
  messages.forEach((msg) => {
    const msgDate = formatDateHeader(msg.createdAt);
    if (msgDate !== lastDate) {
      groupedMessages.push({ type: 'date', id: msgDate, date: msgDate });
      lastDate = msgDate;
    }
    groupedMessages.push({ ...msg });
  });

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateContainer}>
          <ThemedText style={styles.dateText}>{item.date}</ThemedText>
        </View>
      );
    }

    const isMine = item.senderId === dbUser?.user_id;

    if (item.type === 'audio') {
      const isPlayingMessage = playingMessageId === item._id;
      const totalDurationMs =
        isPlayingMessage && playbackDuration > 0
          ? playbackDuration
          : (item.audioDuration ?? 0) * 1000;
      const currentPositionMs = isPlayingMessage ? playbackPosition : 0;
      const progress =
        totalDurationMs > 0 ? Math.min(currentPositionMs / totalDurationMs, 1) : 0;

      return (
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myMessage : styles.theirMessage,
            { paddingVertical: 10, paddingHorizontal: 14 },
          ]}
        >
          <View style={styles.audioRow}>
            {/* Play / Pause */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => togglePlayback(item)}
              style={[
                styles.audioPlayBtn,
                { backgroundColor: isMine ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)' },
              ]}
            >
              <Ionicons
                name={isPlayingMessage && isSoundPlaying ? 'pause' : 'play'}
                size={18}
                color={isMine ? '#fff' : Colors.primaryBackgroundColor}
              />
            </TouchableOpacity>

            {/* Thin progress line + moving dot */}
            <View style={styles.audioProgressContainer}>
              <View
                style={[
                  styles.audioProgressLine,
                  { backgroundColor: isMine ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.15)' },
                ]}
              />
              <View
                style={[
                  styles.audioProgressIndicator,
                  {
                    backgroundColor: isMine ? '#fff' : Colors.primaryBackgroundColor,
                    left: `${progress * 100}%`,
                  },
                ]}
              />
            </View>

            {/* Duration */}
            <ThemedText
              style={[
                styles.audioDuration,
                isMine ? styles.myMessageTime : styles.theirMessageTime,
              ]}
            >
              {formatDurationLabel(Math.max(0, Math.floor(totalDurationMs / 1000)))}
            </ThemedText>
          </View>

          <ThemedText
            style={[
              styles.messageTime,
              isMine ? styles.myMessageTime : styles.theirMessageTime,
            ]}
          >
            {formatTime(item.createdAt)}
          </ThemedText>
        </View>
      );
    }

    // Text message
    return (
      <View
        style={[
          styles.messageBubble,
          isMine ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <ParsedText
          selectable={true}
          style={[
            styles.messageThemedText,
            isMine ? styles.myMessageThemedText : styles.theirMessageThemedText,
            { fontFamily: 'HellixMedium' },
          ]}
          parse={[
            {
              type: 'url',
              style: {
                color: `${isMine ? Colors.secondaryBackgroundColor : Colors.primaryBackgroundColor}`,
                textDecorationLine: 'underline',
                fontFamily: 'HellixSemiBold',
              },
              onPress: (url) => Linking.openURL(url),
            },
            { pattern: /\*(.*?)\*/g, style: { fontFamily: 'HellixBold' } },
            { pattern: /_(.*?)_/g, style: { fontFamily: 'HellixRegularItalic' } },
            {
              pattern: /`(.*?)`/g,
              style: {
                fontFamily: 'HellixSemiBold',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: 4,
                paddingHorizontal: 3,
                fontSize: 15,
              },
            },
            {
              pattern: /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/g,
              style: { color: `${isMine ? Colors.secondaryBackgroundColor : Colors.primaryBackgroundColor}`, textDecorationLine: 'underline', fontFamily: 'HellixSemiBold' },
              onPress: (url) => {
                const hasProtocol = url.startsWith('http://') || url.startsWith('https://');
                Linking.openURL(hasProtocol ? url : `https://${url}`);
              },
            },
          ]}
        >
          {item.text}
        </ParsedText>

        <ThemedText
          style={[
            styles.messageTime,
            isMine ? styles.myMessageTime : styles.theirMessageTime,
          ]}
        >
          {formatTime(item.createdAt)}
        </ThemedText>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomLoader messages={['loading messages...']} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 1 : 0}
    >
      {/* Main Chat Area */}
      <FlatList
        ref={flatListRef}
        data={groupedMessages}
        renderItem={renderItem}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyThemedText}>
              Start your conversation with {userName}
            </ThemedText>
          </View>
        }
      />

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Ionicons name="mic" size={18} color="#FF3B30" style={{ marginRight: 8 }} />
          <ThemedText style={styles.recordingText}>Recording</ThemedText>
          <ThemedText style={styles.recordingTimer}>
            {formatDurationLabel(recordingDurationSeconds)}
          </ThemedText>
          <TouchableOpacity
            style={styles.cancelRecordingButton}
            onPress={handleCancelRecording}
          >
            <ThemedText style={styles.cancelRecordingText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Area */}
      <View
        style={[
          styles.inputContainer,
          {
            paddingBottom: Platform.OS === 'ios'
              ? insets.bottom + (isKeyboardVisible ? 0 : 0)
              : insets.bottom + (isKeyboardVisible ? keyboardHeight : 0) + 6,
          },
        ]}
      >
        <TextInput
          style={styles.input}
          value={inputThemedText}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
          editable={!isRecording && !uploadingAudio}
        />
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputThemedText.trim() || uploadingAudio) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputThemedText.trim() || uploadingAudio}
          >
            {uploadingAudio ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <Ionicons
                name="send"
                size={24}
                color={inputThemedText.trim() ? '#FF3B30' : '#ccc'}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.micButton,
              isRecording && styles.micButtonActive,
              uploadingAudio && styles.micButtonDisabled,
            ]}
            onPress={isRecording ? handleStopRecording : startRecordingVoiceNote}
            disabled={uploadingAudio}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={22}
              color={isRecording ? '#fff' : '#FF3B30'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice Call UI is rendered globally via CallProvider */}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.parentBackgroundColor },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.parentBackgroundColor },
  messagesList: { padding: 16, flexGrow: 1 },
  dateContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 8,
  },
  dateText: { fontSize: 13, color: '#444', fontFamily: 'HellixMedium' },
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 20, marginBottom: 8 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: Colors.primaryBackgroundColor },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: Colors.secondaryBackgroundColor },
  messageThemedText: { fontSize: 16, lineHeight: 20 },
  myMessageThemedText: { color: '#fff' },
  theirMessageThemedText: { color: '#000' },
  messageTime: { fontSize: 11, marginTop: 4 },
  myMessageTime: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  theirMessageTime: { color: '#999' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyThemedText: { fontSize: 16, color: '#999', textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFE9E7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  recordingText: { fontSize: 14, color: '#FF3B30', fontFamily: 'HellixMedium', marginRight: 8 },
  recordingTimer: { fontSize: 14, color: '#FF3B30', fontFamily: 'HellixSemiBold', marginRight: 16 },
  cancelRecordingButton: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: '#fff' },
  cancelRecordingText: { fontSize: 13, color: '#555', fontFamily: 'HellixMedium' },
  actionsContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  micButtonActive: { backgroundColor: '#FF3B30' },
  micButtonDisabled: { opacity: 0.5 },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendButtonDisabled: { opacity: 0.5 },

  // --- WhatsApp-like voice bubble ---
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  audioProgressContainer: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  audioProgressLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 2,
    transform: [{ translateY: -1 }],
  },
  audioProgressIndicator: {
    position: 'absolute',
    top: '50%',
    width: 10,
    height: 10,
    borderRadius: 5,
    transform: [{ translateY: -5 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  audioDuration: {
    fontSize: 12,
    marginLeft: 8,
    width: 50,
    textAlign: 'right',
  },
});
