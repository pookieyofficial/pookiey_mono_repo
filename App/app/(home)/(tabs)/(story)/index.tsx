import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { storyAPI } from '@/APIs/storyAPIs';
import InstaStory from 'expo-insta-story';

interface StoryItem {
  id: string;
  username: string;
  avatar: string;
  stories: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    duration: number;
    isSeen: boolean;
    createdAt: string | Date;
  }>;
  isMe: boolean;
}

export default function StoriesScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  const loadStories = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await storyAPI.getStories(token);
      console.log('Stories loaded:', data);
      setStories(data || []);
    } catch (error: any) {
      console.error('Error loading stories:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load stories';
      Alert.alert('Error', errorMessage);
      setStories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStories();
  }, [loadStories]);

  const handleStoryPress = (index: number) => {
    if (stories[index] && stories[index].stories.length > 0) {
      setSelectedStoryIndex(index);
    }
  };

  const handleAddStory = () => {
    router.push('/create' as any);
  };

  const handleCloseStory = () => {
    setSelectedStoryIndex(null);
    loadStories(); // Refresh to update view status
  };

  const handleStorySeen = async (storyId: string) => {
    if (!token) return;
    try {
      await storyAPI.viewStory(storyId, token);
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  const renderStoryItem = ({ item, index }: { item: StoryItem; index: number }) => {
    const hasUnviewed = item.stories.some(story => !story.isSeen && !item.isMe);
    const storyCount = item.stories.length;

    return (
      <TouchableOpacity
        style={styles.storyItem}
        onPress={() => handleStoryPress(index)}
        activeOpacity={0.7}
      >
        <View style={styles.storyCircleContainer}>
          {/* Gradient border for unviewed stories */}
          {hasUnviewed ? (
            <LinearGradient
              colors={[Colors.primaryBackgroundColor, '#FF6B9D', '#C44569']}
              style={styles.gradientBorder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.storyCircleInner}>
                <Image
                  source={{ uri: item.avatar || 'https://via.placeholder.com/60' }}
                  style={styles.storyAvatar}
                />
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.storyCircleInner, { borderWidth: item.isMe ? 2 : 0, borderColor: Colors.primary.white }]}>
              <Image
                source={{ uri: item.avatar || 'https://via.placeholder.com/60' }}
                style={styles.storyAvatar}
              />
            </View>
          )}

          {/* Add story icon for my story */}
          {item.isMe && (
            <View style={styles.addIconContainer}>
              <View style={styles.addIcon}>
                <Ionicons name="add" size={20} color={Colors.primary.white} />
              </View>
            </View>
          )}

          {/* Story count badge */}
          {storyCount > 1 && (
            <View style={styles.storyCountBadge}>
              <Text style={styles.storyCountText}>{storyCount}</Text>
            </View>
          )}
        </View>

        <Text style={styles.storyName} numberOfLines={1}>
          {item.isMe ? 'Your Story' : item.username}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBackgroundColor} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stories</Text>
        <TouchableOpacity onPress={handleAddStory} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={28} color={Colors.primaryBackgroundColor} />
        </TouchableOpacity>
      </View>

      {stories.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="camera-outline" size={80} color={Colors.text.tertiary} />
          <Text style={styles.emptyText}>No stories yet</Text>
          <Text style={styles.emptySubtext}>
            {token ? 'Share a moment with your matches or create your own story!' : 'Please log in to view stories'}
          </Text>
          {token && (
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddStory}>
              <Text style={styles.emptyButtonText}>Add Your First Story</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item, index) => `story-${item.id}-${index}`}
          numColumns={4}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryBackgroundColor} />
          }
        />
      )}

      {/* Story Viewer Modal */}
      <Modal
        visible={selectedStoryIndex !== null}
        animationType="fade"
        transparent={false}
        onRequestClose={handleCloseStory}
      >
        {selectedStoryIndex !== null && stories[selectedStoryIndex] && (
          <InstaStory
            data={stories.map((user, userIndex) => ({
              id: userIndex,
              user_name: user.username,
              avatar_image: user.avatar,
              stories: user.stories.map((story, storyIndex) => {
                const storyData: any = {
                  story_id: storyIndex,
                  story: story.url,
                  type: story.type,
                  duration: story.duration,
                  isSeen: story.isSeen,
                  onClose: handleCloseStory,
                  onStorySeen: () => handleStorySeen(story.id),
                };
                
                // For videos, ensure proper format
                if (story.type === 'video') {
                  storyData.story_type = 'video';
                  storyData.story_video = story.url;
                }
                
                return storyData;
              }),
            })) as any}
            duration={10}
            onClose={handleCloseStory}
            renderCloseComponent={() => (
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseStory}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={28} color={Colors.primary.white} />
              </TouchableOpacity>
            )}
            renderSwipeUpComponent={() => null}
            unPressedBorderColor={Colors.primaryBackgroundColor}
            pressedBorderColor={Colors.primary.white}
          />
        )}
      </Modal>
    </SafeAreaView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.titleColor,
  },
  addButton: {
    padding: 4,
  },
  listContainer: {
    padding: 12,
  },
  storyItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  storyCircleContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  gradientBorder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCircleInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    overflow: 'hidden',
    backgroundColor: Colors.primary.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  addIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primaryBackgroundColor,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.white,
  },
  addIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primaryBackgroundColor,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.primary.white,
  },
  storyCountText: {
    color: Colors.primary.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  storyName: {
    fontSize: 12,
    color: Colors.text.primary,
    textAlign: 'center',
    maxWidth: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primaryBackgroundColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: Colors.primary.white,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
});
