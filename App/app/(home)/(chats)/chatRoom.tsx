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
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
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

export default function ChatRoom() {
  const params = useLocalSearchParams();
  const { dbUser, token } = useAuth();
  const {
    isConnected,
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
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const navigation = useNavigation();

  const matchId = params.matchId as string;
  const userName = params.userName as string;
  const userAvatar = params.userAvatar as string;
  const otherUserId = params.userId as string;
  const insets = useSafeAreaInsets();

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
  }, [userName, userAvatar, isTyping]);

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
  }, [matchId, isConnected]);

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
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
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
  }, [inputThemedText, matchId]);

  const handleTyping = (ThemedText: string) => {
    setInputThemedText(ThemedText);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (ThemedText.length > 0) {
      startTyping(matchId);
      typingTimeoutRef.current = setTimeout(() => stopTyping(matchId), 1000);
    } else stopTyping(matchId);
  };

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
    <View style={styles.container}>
      {/* Main Chat Area */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : (isKeyboardVisible ? 'height' : undefined)}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
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

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Platform.OS === 'ios' ? insets.bottom : insets.bottom + 6 },
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
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputThemedText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputThemedText.trim()}
          >
            <Ionicons
              name="send"
              size={24}
              color={inputThemedText.trim() ? '#FF3B30' : '#ccc'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
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
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 18, marginBottom: 8 },
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
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { opacity: 0.5 },
});
