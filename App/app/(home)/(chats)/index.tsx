import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChatListItem } from '@/components/ChatListItem';
import { useSocket, InboxItem } from '@/hooks/useSocket';
import { messageAPI } from '@/APIs/messageAPIs';
import { useAuth } from '@/hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import CustomLoader from '@/components/CustomLoader';

export default function ChatsScreen() {
  const { token } = useAuth();
  const { isConnected, onInboxUpdate, onNewMessage } = useSocket();
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load inbox on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadInbox();
    }, [])
  );

  // Listen for inbox updates
  useEffect(() => {
    const cleanup = onInboxUpdate((data) => {
      loadInbox();
    });

    return cleanup;
  }, []);

  // Listen for new messages to update unread counts
  useEffect(() => {
    const cleanup = onNewMessage((message) => {
      loadInbox();
    });

    return cleanup;
  }, []);

  const loadInbox = async () => {
    try {
      if (token) {
        const data = await messageAPI.getInbox(token);
        setInbox(data);
      }
    } catch (error) {
      console.error('Error loading inbox:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadInbox();
  };

  const renderItem = ({ item }: { item: InboxItem }) => (
    <ChatListItem item={item} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ThemedText type="title" style={styles.emptyTitle}>No Matches Yet</ThemedText>
      <ThemedText style={styles.emptyThemedText}>
        Start swiping to find matches and begin conversations!
      </ThemedText>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText type="title" style={styles.headerTitle}>Messages</ThemedText>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.parentBackgroundColor
      }}>
        <CustomLoader messages={['Fetching chats...']} />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 2 : 0} style={styles.container}>
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <FlatList
          data={inbox}
          renderItem={renderItem}
          keyExtractor={(item) => item.matchId}
          contentContainerStyle={[
            styles.listContainer,
            inbox.length === 0 && styles.emptyListContainer,
          ]}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#FF3B30"
            />
          }
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parentBackgroundColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: Colors.titleColor,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionThemedText: {
    fontSize: 13,
  },
  listContainer: {
    flexGrow: 1,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyThemedText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
