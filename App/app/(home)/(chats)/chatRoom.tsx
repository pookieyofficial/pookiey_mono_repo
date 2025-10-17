import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSocket, Message } from '@/hooks/useSocket';
import { messageAPI } from '@/APIs/messageAPIs';
import { useAuth } from '@/hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatRoom() {
  const params = useLocalSearchParams();
  const router = useRouter();
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
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const matchId = params.matchId as string;
  const userName = params.userName as string;
  const userAvatar = params.userAvatar as string;
  const otherUserId = params.userId as string;

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
      if (matchId) {
        leaveMatch(matchId);
      }
    };
  }, [matchId, isConnected]);

  // Listen for new messages
  useEffect(() => {
    const cleanup = onNewMessage((message: Message) => {
      if (message.matchId === matchId) {
        setMessages((prev) => [...prev, message]);

        // Mark as read if message is from other user
        if (message.senderId !== dbUser?.user_id) {
          markAsRead(matchId);
        }

        // Scroll to bottom
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
      if (data.userId === otherUserId) {
        setIsTyping(true);
      }
    });

    const cleanupStoppedTyping = onUserStoppedTyping((data) => {
      if (data.userId === otherUserId) {
        setIsTyping(false);
      }
    });

    return () => {
      cleanupTyping();
      cleanupStoppedTyping();
    };
  }, [otherUserId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      if (token && dbUser?.user_id) {
        const data = await messageAPI.getMessages(token, { matchId });
        setMessages(data);

        // Mark messages as read
        markAsRead(matchId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    const messageData = {
      matchId,
      text: inputText.trim(),
      type: 'text' as const,
    };

    sendMessage(messageData);
    setInputText('');
    stopTyping(matchId);
  }, [inputText, matchId]);

  const handleTyping = (text: string) => {
    setInputText(text);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing indicator
    if (text.length > 0) {
      startTyping(matchId);

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(matchId);
      }, 3000);
    } else {
      stopTyping(matchId);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.senderId === dbUser?.user_id;

    return (
      <View
        style={[
          styles.messageBubble,
          isMine ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isMine ? styles.myMessageText : styles.theirMessageText,
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            isMine ? styles.myMessageTime : styles.theirMessageTime,
          ]}
        >
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3B30" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          {userAvatar ? (
            <Image
              source={{ uri: userAvatar }}
              style={styles.headerAvatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{userName}</Text>
            {isTyping && (
              <Text style={styles.typingIndicator}>typing...</Text>
            )}
          </View>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Start your conversation with {userName}
            </Text>
          </View>
        }
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={24}
              color={inputText.trim() ? '#FF3B30' : '#ccc'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  typingIndicator: {
    fontSize: 13,
    color: '#FF3B30',
    fontStyle: 'italic',
  },
  headerRight: {
    width: 40,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF3B30',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  theirMessageTime: {
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

