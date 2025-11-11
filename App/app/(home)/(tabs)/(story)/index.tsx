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
  StatusBar,
  Modal,
  Pressable,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
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

// Calculate responsive story item size
const LIST_PADDING = 12 * 2; // left + right padding
const ITEM_PADDING = 4 * 2; // left + right padding per item
const NUM_COLUMNS = 4;
const AVAILABLE_WIDTH = SCREEN_WIDTH - LIST_PADDING;
const ITEM_WIDTH = (AVAILABLE_WIDTH - (ITEM_PADDING * NUM_COLUMNS)) / NUM_COLUMNS;
const STORY_CIRCLE_SIZE = Math.min(ITEM_WIDTH - 8, 140); // Max 140px (increased for bigger profiles), but responsive
const STORY_CIRCLE_INNER = STORY_CIRCLE_SIZE - 6; // Account for border padding
const STORY_AVATAR_SIZE = STORY_CIRCLE_INNER - 6; // Account for inner padding
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
  const [showMenu, setShowMenu] = useState(false);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const [wasViewingStory, setWasViewingStory] = useState<number | null>(null);
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
      // Backend already sorts by latest story date, so we just need to ensure "Your Story" is first
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
      
      // Additional sorting by latest story date (backend should already do this, but ensure it)
      // Sort other stories (not "Your Story") by latest story date
      const myStory = storiesList.find(item => item.isMe);
      const otherStories = storiesList.filter(item => !item.isMe);
      
      otherStories.sort((a, b) => {
        const aLatest = a.stories.length > 0 
          ? new Date(a.stories[0].createdAt).getTime() 
          : 0;
        const bLatest = b.stories.length > 0 
          ? new Date(b.stories[0].createdAt).getTime() 
          : 0;
        return bLatest - aLatest; // Descending order (newest first)
      });
      
      // Combine: "Your Story" first, then others sorted by latest
      const finalStoriesList = myStory 
        ? [myStory, ...otherStories]
        : otherStories;
      
      setStories(finalStoriesList);
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
    setShowMenu(false);
    // No need to navigate - setting selectedStoryIndex to null will show the list view
    // Refresh stories to update view status
    loadStories();
  };

  const handleDeleteStory = async () => {
    const current = getCurrentStory();
    if (!current || !current.user.isMe) {
      return;
    }

    const storyId = current.story.id;
    setShowMenu(false);

    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this story?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingStoryId(storyId);
              if (!token) {
                Alert.alert('Error', 'Please log in to delete stories');
                return;
              }

              await storyAPI.deleteStory(storyId, token);
              
              // Refresh stories first
              await loadStories();
              
              // Get updated stories after refresh
              const updatedStories = getAllStories();
              if (updatedStories.length === 0 || currentUserIndex >= updatedStories.length) {
                handleCloseStory();
                return;
              }
              
              const updatedUser = updatedStories[currentUserIndex];
              
              // If this was the last story for this user, move to next user or close
              if (updatedUser.stories.length === 0) {
                if (currentUserIndex < updatedStories.length - 1) {
                  // Move to next user
                  setCurrentUserIndex(currentUserIndex + 1);
                  setCurrentStoryIndex(0);
                } else {
                  // No more stories, close viewer
                  handleCloseStory();
                }
              } else {
                // Adjust current story index if needed
                if (currentStoryIndex >= updatedUser.stories.length) {
                  setCurrentStoryIndex(updatedUser.stories.length - 1);
                }
                // Stay on current story (index may have shifted)
              }
            } catch (error: any) {
              console.error('Error deleting story:', error);
              Alert.alert('Error', error?.response?.data?.message || 'Failed to delete story');
            } finally {
              setDeletingStoryId(null);
            }
          },
        },
      ]
    );
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

  // Get stories starting from selected user onwards (don't show previous users)
  const getAllStories = useCallback(() => {
    if (selectedStoryIndex === null) return [];
    // Show stories from selected index onwards (including selected)
    return stories.slice(selectedStoryIndex);
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
      setWasViewingStory(null); // Clear the flag when starting a new story
    }
  }, [selectedStoryIndex, progressAnim]);

  // Handle screen focus - resume story if we were viewing one
  useFocusEffect(
    useCallback(() => {
      // When screen comes into focus, check if we were viewing a story
      if (wasViewingStory !== null && selectedStoryIndex === null) {
        // Small delay to ensure navigation is complete
        setTimeout(() => {
          // Resume the story viewer
          setSelectedStoryIndex(wasViewingStory);
          setWasViewingStory(null);
        }, 100);
      }
      
      // Cleanup when screen loses focus
      return () => {
        // Pause story when navigating away
        if (selectedStoryIndex !== null) {
          if (storyTimer.current) {
            clearTimeout(storyTimer.current);
            storyTimer.current = null;
          }
          if (videoRef.current) {
            videoRef.current.pauseAsync().catch(() => {});
          }
          progressAnim.stopAnimation();
        }
      };
    }, [wasViewingStory, selectedStoryIndex, progressAnim])
  );

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
    
    // Extract first name from username
    // Username can be: "FirstName LastName", "DisplayName", or "You"
    const getFirstName = () => {
      if (item.isMe) {
        return 'Your Story';
      }
      // Split by space and take the first part
      const nameParts = item.username.trim().split(/\s+/);
      return nameParts[0] || item.username;
    };
    
    const displayName = getFirstName();

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
                <Ionicons name="add" size={Math.max(20, STORY_CIRCLE_SIZE * 0.22)} color={Colors.primary.white} />
              </View>
            </TouchableOpacity>
          )}

        </TouchableOpacity>
        
        {/* Display first name below the story profile */}
        <ThemedText style={styles.storyName} numberOfLines={1}>
          {displayName}
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
    const insets = useSafeAreaInsets();
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    // Handle profile click - navigate to user profile
    const handleProfilePress = async () => {
      // Pause story playback before navigating
      if (storyTimer.current) {
        clearTimeout(storyTimer.current);
        storyTimer.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
      progressAnim.stopAnimation();
      
      // Store the current story index to resume later
      setWasViewingStory(selectedStoryIndex);
      
      if (user.isMe) {
        // Navigate to settings/profile for own profile
        // Store that we're coming from story viewer so we can return
        router.push({
          pathname: '/(home)/(tabs)/(setting)/profile' as any,
          params: {
            returnToStory: 'true'
          }
        });
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
              userData: JSON.stringify(response.data),
              returnToStory: 'true' // Flag to indicate we should return to story tab
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
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
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

        {/* Progress Bars - at the very top, just below status bar */}
        <View style={[styles.progressContainer, { top: insets.top }]}>
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

        {/* Header with Profile and Close/Menu Button */}
        <View style={[styles.storyHeader, { top: insets.top + 3 }]}>
          <View style={styles.storyHeaderRow}>
            <TouchableOpacity 
              style={styles.storyHeaderLeft}
              onPress={handleProfilePress}
              activeOpacity={0.7}
            >
              <Image source={{ uri: user.avatar }} style={styles.storyHeaderAvatar} />
              <ThemedText style={styles.storyHeaderName}>{user.username}</ThemedText>
            </TouchableOpacity>
            {user.isMe ? (
              <TouchableOpacity 
                onPress={() => setShowMenu(true)} 
                style={styles.storyMenuButton}
              >
                <Ionicons name="ellipsis-vertical" size={24} color={Colors.primary.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleCloseStory} style={styles.storyCloseButton}>
                <Ionicons name="close" size={28} color={Colors.primary.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Menu Modal for Own Stories */}
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <Pressable 
            style={styles.menuOverlay}
            onPress={() => setShowMenu(false)}
          >
            <Pressable style={styles.menuContainer} onPress={(e) => e.stopPropagation()}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleDeleteStory}
                disabled={deletingStoryId === story.id}
              >
                {deletingStoryId === story.id ? (
                  <ActivityIndicator size="small" color={Colors.primary.red} />
                ) : (
                  <Ionicons name="trash-outline" size={20} color={Colors.primary.red} />
                )}
                <ThemedText style={[styles.menuItemText, { color: Colors.primary.red }]}>
                  Delete Story
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowMenu(false)}
              >
                <ThemedText style={styles.menuItemText}>Cancel</ThemedText>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

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
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  storyCircleContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  gradientBorder: {
    width: STORY_CIRCLE_SIZE,
    height: STORY_CIRCLE_SIZE,
    borderRadius: STORY_CIRCLE_SIZE / 2,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCircleInner: {
    width: STORY_CIRCLE_INNER,
    height: STORY_CIRCLE_INNER,
    borderRadius: STORY_CIRCLE_INNER / 2,
    overflow: 'hidden',
    backgroundColor: Colors.primary.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatar: {
    width: STORY_AVATAR_SIZE,
    height: STORY_AVATAR_SIZE,
    borderRadius: STORY_AVATAR_SIZE / 2,
  },
  addIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primaryBackgroundColor,
    borderRadius: Math.max(14, STORY_CIRCLE_SIZE * 0.15),
    width: Math.max(28, STORY_CIRCLE_SIZE * 0.31),
    height: Math.max(28, STORY_CIRCLE_SIZE * 0.31),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.white,
  },
  addIcon: {
    width: Math.max(20, STORY_CIRCLE_SIZE * 0.22),
    height: Math.max(20, STORY_CIRCLE_SIZE * 0.22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primaryBackgroundColor,
    borderRadius: Math.max(12, STORY_CIRCLE_SIZE * 0.12),
    minWidth: Math.max(24, STORY_CIRCLE_SIZE * 0.25),
    height: Math.max(24, STORY_CIRCLE_SIZE * 0.25),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: Colors.primary.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  storyCountText: {
    color: Colors.primary.white,
    fontSize: Math.max(11, STORY_CIRCLE_SIZE * 0.12),
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
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 0,
    paddingBottom: 0,
    gap: 5,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 0,
    paddingBottom: 16,
    zIndex: 10,
  },
  storyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 5,
  },
  storyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storyHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary.white,
  },
  storyHeaderName: {
    color: Colors.primary.white,
    fontSize: 16,
    fontWeight: '600',
  },
  storyCloseButton: {
    padding: 8,
    borderRadius: 20,
  },
  storyMenuButton: {
    padding: 8,
    borderRadius: 20,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: Colors.primary.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text.light,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
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
