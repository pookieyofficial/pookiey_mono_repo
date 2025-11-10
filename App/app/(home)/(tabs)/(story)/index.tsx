import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/hooks/useAuth';
import { storyAPI } from '@/APIs/storyAPIs';
import { useStoryStore, StoryItem } from '@/store/storyStore';
import { useAuthStore } from '@/store/authStore';
import { getUserByIdAPI } from '@/APIs/userAPIs';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

export default function StoriesScreen() {
  const router = useRouter();
  const { token } = useAuth();
  
  // Get stories from store (loaded from home page)
  const { stories, isLoading, setStories, setLoading, updateStoryViewStatus } = useStoryStore();
  const { dbUser } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [currentUserIndex, setCurrentUserIndex] = useState<number>(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);
  const [viewedStoryIds, setViewedStoryIds] = useState<Set<string>>(new Set());
  const progressAnim = useRef(new Animated.Value(0)).current;
  const storyTimer = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<Video>(null);

  // Refresh stories (reload from API)
  const loadStories = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await storyAPI.getStories(token);
      console.log('Stories refreshed:', data);
      
      // Ensure "Your Story" always appears first, even if empty
      let storiesList: StoryItem[] = data || []
      
      // Check if "Your Story" exists
      const myStoryIndex = storiesList.findIndex(item => item.isMe)
      
      // Get current user info
      const currentUserId = dbUser?.user_id
      const currentUserName = dbUser?.displayName || `${dbUser?.profile?.firstName || ''} ${dbUser?.profile?.lastName || ''}`.trim() || 'You'
      const currentUserAvatar = dbUser?.photoURL || dbUser?.profile?.photos?.[0]?.url || ''
      
      if (myStoryIndex === -1 && currentUserId) {
        // "Your Story" doesn't exist, create a placeholder
        const myStory: StoryItem = {
          id: currentUserId,
          username: currentUserName,
          avatar: currentUserAvatar,
          stories: [],
          isMe: true
        }
        storiesList = [myStory, ...storiesList]
      } else if (myStoryIndex > 0) {
        // "Your Story" exists but not first, move it to first
        const myStory = storiesList[myStoryIndex]
        storiesList = [myStory, ...storiesList.filter((_, idx) => idx !== myStoryIndex)]
      }
      
      setStories(storiesList);
    } catch (error: any) {
      console.error('Error loading stories:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load stories';
      Alert.alert('Error', errorMessage);
      // Even on error, ensure "Your Story" exists if we have user info
      if (dbUser?.user_id) {
        const myStory: StoryItem = {
          id: dbUser.user_id,
          username: dbUser.displayName || `${dbUser.profile?.firstName || ''} ${dbUser.profile?.lastName || ''}`.trim() || 'You',
          avatar: dbUser.photoURL || dbUser.profile?.photos?.[0]?.url || '',
          stories: [],
          isMe: true
        }
        setStories([myStory]);
      } else {
        setStories([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, setStories, setLoading, dbUser]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStories();
  }, [loadStories]);

  const handleStoryPress = (index: number, isAddButton: boolean = false) => {
    if (isAddButton) {
      // If clicking the + icon, navigate to create story
      router.push('/(home)/(tabs)/(story)/create' as any);
    } else {
      // If clicking the story circle, show the story directly
    if (stories[index] && stories[index].stories.length > 0) {
      setSelectedStoryIndex(index);
      }
    }
  };

  const handleAddStory = () => {
    router.push('/(home)/(tabs)/(story)/create' as any);
  };

  const handleCloseStory = () => {
    if (storyTimer.current) {
      clearTimeout(storyTimer.current);
      storyTimer.current = null;
    }
    // Stop video if playing
    if (videoRef.current) {
      videoRef.current.pauseAsync();
      videoRef.current.unloadAsync();
    }
    progressAnim.setValue(0);
    setSelectedStoryIndex(null);
    setCurrentUserIndex(0);
    setCurrentStoryIndex(0);
    setViewedStoryIds(new Set());
    // Ensure we're on the story tab - navigate explicitly to story index
    router.push('/(home)/(tabs)/(story)/' as any);
    // Refresh stories to update view status
    loadStories();
  };

  const handleStorySeen = useCallback(async (storyId: string) => {
    if (!token || !storyId) return;
    
    // Prevent duplicate view tracking
    if (viewedStoryIds.has(storyId)) {
      console.log('Story already tracked as viewed:', storyId);
      return;
    }

    try {
      console.log('Marking story as viewed:', storyId);
      await storyAPI.viewStory(storyId, token);
      
      // Mark as viewed in local state to prevent duplicates
      setViewedStoryIds(prev => new Set(prev).add(storyId));
      
      // Update story view status in store
      updateStoryViewStatus(storyId);
      
      // Refresh stories to update view status after a short delay
      setTimeout(() => {
        loadStories();
      }, 500);
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  }, [token, loadStories, viewedStoryIds, updateStoryViewStatus]);

  // Get all stories in order (selected first, then others)
  const getAllStories = useCallback(() => {
    if (selectedStoryIndex === null) return [];
    const reorderedStories = [
      stories[selectedStoryIndex],
      ...stories.filter((_, idx) => idx !== selectedStoryIndex)
    ];
    return reorderedStories;
  }, [stories, selectedStoryIndex]);

  // Get current story data
  const getCurrentStory = useCallback(() => {
    const allStories = getAllStories();
    if (allStories.length === 0 || currentUserIndex >= allStories.length) return null;
    const user = allStories[currentUserIndex];
    if (user.stories.length === 0 || currentStoryIndex >= user.stories.length) return null;
    return { user, story: user.stories[currentStoryIndex] };
  }, [getAllStories, currentUserIndex, currentStoryIndex]);

  // Navigate to next story
  const nextStory = useCallback(() => {
    progressAnim.stopAnimation();
    // Stop current video if playing
    if (videoRef.current) {
      videoRef.current.pauseAsync();
      videoRef.current.unloadAsync();
    }
    const allStories = getAllStories();
    if (allStories.length === 0) {
      handleCloseStory();
      return;
    }

    const currentUser = allStories[currentUserIndex];
    if (currentStoryIndex < currentUser.stories.length - 1) {
      // Next story in same user
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentUserIndex < allStories.length - 1) {
      // Next user
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      // All stories done
      handleCloseStory();
    }
  }, [getAllStories, currentUserIndex, currentStoryIndex, progressAnim, handleCloseStory]);

  // Navigate to previous story
  const prevStory = useCallback(() => {
    progressAnim.stopAnimation();
    // Stop current video if playing
    if (videoRef.current) {
      videoRef.current.pauseAsync();
      videoRef.current.unloadAsync();
    }
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (currentUserIndex > 0) {
      const allStories = getAllStories();
      const prevUser = allStories[currentUserIndex - 1];
      setCurrentUserIndex(currentUserIndex - 1);
      setCurrentStoryIndex(prevUser.stories.length - 1);
    }
  }, [getAllStories, currentUserIndex, currentStoryIndex, progressAnim]);

  // Handle video playback status
  const handleVideoStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      // Update progress bar based on video position
      if (status.durationMillis && status.durationMillis > 0) {
        const progress = status.positionMillis / status.durationMillis;
        progressAnim.setValue(progress);
      }
      
      // Auto-advance when video finishes
      if (status.didJustFinish) {
        nextStory();
      }
    }
  }, [progressAnim, nextStory]);

  // Start story progress animation
  const startStoryProgress = useCallback(() => {
    const current = getCurrentStory();
    if (!current) return;

    // Mark story as viewed
    if (!current.story.isSeen && !current.user.isMe) {
      handleStorySeen(current.story.id);
    }

    // For videos, let the video control the progress
    if (current.story.type === 'video') {
      // Video will handle its own playback and completion
      return;
    }

    // For images, use animation
    progressAnim.setValue(0);
    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: current.story.duration * 1000 || STORY_DURATION,
      useNativeDriver: false,
    });
    
    animation.start(({ finished }) => {
      if (finished) {
        nextStory();
      }
    });

    return () => animation.stop();
  }, [getCurrentStory, progressAnim, handleStorySeen, nextStory]);

  // Handle story selection
  useEffect(() => {
    if (selectedStoryIndex !== null) {
      setCurrentUserIndex(0);
      setCurrentStoryIndex(0);
      progressAnim.setValue(0);
    }
  }, [selectedStoryIndex, progressAnim]);

  // Start progress when story changes
  useEffect(() => {
    if (selectedStoryIndex !== null) {
      const current = getCurrentStory();
      
      // Reset progress
      progressAnim.setValue(0);
      
      // For videos, start playback after a short delay to ensure video is loaded
      if (current?.story.type === 'video') {
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.playAsync().catch((error) => {
              console.error('Error playing video:', error);
            });
          }
        }, 100);
      } else {
        // For images, start animation
        const cleanup = startStoryProgress();
        return () => {
          cleanup?.();
        };
      }
    }
    return () => {
      if (storyTimer.current) {
        clearTimeout(storyTimer.current);
      }
      progressAnim.stopAnimation();
      if (videoRef.current) {
        videoRef.current.pauseAsync().catch(() => {});
      }
    };
  }, [selectedStoryIndex, currentUserIndex, currentStoryIndex, startStoryProgress, progressAnim, getCurrentStory]);

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const swipeThreshold = 50;

        if (Math.abs(dy) > Math.abs(dx) && dy > swipeThreshold) {
          // Swipe down to close
          handleCloseStory();
        } else if (dx > swipeThreshold) {
          // Swipe right - previous story
          prevStory();
        } else if (dx < -swipeThreshold) {
          // Swipe left - next story
          nextStory();
        }
      },
    })
  ).current;


  const renderStoryItem = ({ item, index }: { item: StoryItem; index: number }) => {
    const hasUnviewed = item.stories.some(story => !story.isSeen && !item.isMe);
    // Count only unviewed stories (don't count own stories)
    const unviewedCount = item.stories.filter(story => !story.isSeen && !item.isMe).length;

    return (
      <View style={styles.storyItem}>
      <TouchableOpacity
          style={styles.storyCircleContainer}
          onPress={() => {
            if (item.isMe && item.stories.length === 0) {
              // If it's "Your Story" with no stories, clicking anywhere should add story
              handleAddStory();
            } else {
              // Otherwise, show the story
              handleStoryPress(index);
            }
          }}
        activeOpacity={0.7}
      >
          {/* Gradient border for unviewed stories */}
          {hasUnviewed ? (
            <LinearGradient
              colors={[Colors.primaryBackgroundColor, Colors.primaryBackgroundColor, Colors.primaryBackgroundColor]}
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

          {/* Add story icon for my story - only show if there are stories, clicking this adds a new story */}
          {item.isMe && (
            <TouchableOpacity
              style={styles.addIconContainer}
              onPress={(e) => {
                e.stopPropagation();
                handleAddStory();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.addIcon}>
                <Ionicons name="add" size={20} color={Colors.primary.white} />
              </View>
            </TouchableOpacity>
          )}

          {/* Story count badge - show only unviewed stories count */}
          {unviewedCount > 0 && (
            <View style={styles.storyCountBadge}>
              <ThemedText style={styles.storyCountText}>{unviewedCount}</ThemedText>
            </View>
          )}
        </TouchableOpacity>

        <ThemedText style={styles.storyName} numberOfLines={1}>
          {item.isMe ? 'Your Story' : item.username}
        </ThemedText>
      </View>
    );
  };

  // If story is selected, show story viewer directly (no modal)
  if (selectedStoryIndex !== null) {
    const allStories = getAllStories();
    const current = getCurrentStory();

    if (!current) {
      handleCloseStory();
      return null;
    }

    const { user, story } = current;
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    // Handle profile click - navigate to user profile
    const handleProfilePress = async () => {
      if (user.isMe) {
        // Navigate to settings/profile for own profile
        router.push('/(home)/(tabs)/(setting)/profile' as any);
        return;
      }
      
      // Fetch full user details from API
      try {
        if (!token) {
          Alert.alert('Error', 'Please log in to view profiles');
          return;
        }
        
        const response = await getUserByIdAPI(user.id, token);
        if (response.success && response.data) {
          router.push({
            pathname: '/userProfile' as any,
            params: {
              userData: JSON.stringify(response.data)
            }
          });
        } else {
          Alert.alert('Error', 'Failed to load user profile');
        }
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        Alert.alert('Error', error?.response?.data?.message || 'Failed to load user profile');
      }
    };

    return (
      <View style={styles.storyViewerContainer} {...panResponder.panHandlers}>
        {/* Story Media (Image or Video) */}
        {story.type === 'video' ? (
          <Video
            ref={videoRef}
            source={{ uri: story.url }}
            style={styles.storyImage}
            resizeMode={ResizeMode.COVER}
            shouldPlay={true}
            isLooping={false}
            volume={1.0}
            isMuted={false}
            onPlaybackStatusUpdate={handleVideoStatusUpdate}
            onLoadStart={() => {
              // Mark story as viewed when video starts loading
              if (!story.isSeen && !user.isMe) {
                handleStorySeen(story.id);
              }
            }}
          />
        ) : (
          <Image
            source={{ uri: story.url }}
            style={styles.storyImage}
            resizeMode="cover"
          />
        )}

        {/* Header with Progress Bars and Profile */}
        <View style={styles.storyHeader}>
          {/* Progress Bars - moved to header */}
          <View style={styles.progressContainer}>
            {user.stories.map((_, index) => (
              <View key={index} style={styles.progressBarBackground}>
                {index === currentStoryIndex && (
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      { width: progressWidth }
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Profile and Close Button Row */}
          <View style={styles.storyHeaderRow}>
            <TouchableOpacity 
              style={styles.storyHeaderLeft}
              onPress={handleProfilePress}
              activeOpacity={0.7}
            >
              <Image source={{ uri: user.avatar }} style={styles.storyHeaderAvatar} />
              <ThemedText style={styles.storyHeaderName}>{user.username}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCloseStory} style={styles.storyCloseButton}>
              <Ionicons name="close" size={28} color={Colors.primary.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tap Areas for Navigation */}
        <View style={styles.tapContainer}>
          <TouchableOpacity
            style={[styles.tapArea, styles.tapAreaLeft]}
            onPress={prevStory}
            activeOpacity={1}
          />
          <TouchableOpacity
            style={[styles.tapArea, styles.tapAreaRight]}
            onPress={nextStory}
            activeOpacity={1}
          />
        </View>
      </View>
    );
  }

  if (isLoading && stories.length === 0) {
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
        <ThemedText type="title" style={styles.headerTitle}>Stories</ThemedText>
      </View>

      {stories.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="camera-outline" size={80} color={Colors.text.tertiary} />
          <ThemedText type="subtitle" style={styles.emptyText}>No stories yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            {token ? 'Share a moment with your matches or create your own story!' : 'Please log in to view stories'}
          </ThemedText>
          {token && (
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddStory}>
              <ThemedText style={styles.emptyButtonText}>Add Your First Story</ThemedText>
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
    borderBottomColor: Colors.text.light,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.titleColor,
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
    marginTop: 4,
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
  storyViewerContainer: {
    flex: 1,
    backgroundColor: Colors.primary.black,
  },
  storyImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 4,
    zIndex: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.white,
  },
  storyHeader: {
    paddingTop: 50,
    paddingBottom: 16,
    zIndex: 10,
  },
  storyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  storyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storyHeaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary.white,
  },
  storyHeaderName: {
    color: Colors.primary.white,
    fontSize: 14,
    fontWeight: '600',
  },
  storyCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  tapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 5,
  },
  tapArea: {
    flex: 1,
  },
  tapAreaLeft: {
    // Left half for previous
  },
  tapAreaRight: {
    // Right half for next
  },
});
