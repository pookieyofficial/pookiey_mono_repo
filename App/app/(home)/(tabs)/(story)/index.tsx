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
  const insets = useSafeAreaInsets(); // Move hook to top - must be called unconditionally
  
  // Get stories from store (loaded from home page)
  const { stories, categorizedStories, isLoading, setCategorizedStories, setLoading, updateStoryViewStatus } = useStoryStore();
  const { dbUser } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'myStory' | 'friends' | 'discover' | null>(null);
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
      
      // Handle new categorized structure
      if (data && typeof data === 'object' && !Array.isArray(data) && 'myStory' in data) {
        // New structure with categorized stories
        const categorizedStories = {
          myStory: data.myStory || null,
          friends: Array.isArray(data.friends) ? data.friends : [],
          discover: Array.isArray(data.discover) ? data.discover : []
        }
        
        // Ensure "Your Story" exists even if empty
        if (!categorizedStories.myStory && dbUser?.user_id) {
          categorizedStories.myStory = {
            id: dbUser.user_id,
            username: dbUser.displayName || `${dbUser.profile?.firstName || ''} ${dbUser.profile?.lastName || ''}`.trim() || 'You',
            avatar: dbUser.photoURL || dbUser.profile?.photos?.[0]?.url || '',
            stories: [],
            isMe: true
          }
        }
        
        setCategorizedStories(categorizedStories);
      } else if (Array.isArray(data)) {
        // Fallback to old structure (flat array)
        const storiesList: StoryItem[] = data;
        const myStoryIndex = storiesList.findIndex(item => item.isMe)
        
        const currentUserId = dbUser?.user_id
        const currentUserName = dbUser?.displayName || `${dbUser?.profile?.firstName || ''} ${dbUser?.profile?.lastName || ''}`.trim() || 'You'
        const currentUserAvatar = dbUser?.photoURL || dbUser?.profile?.photos?.[0]?.url || ''
        
        if (myStoryIndex === -1 && currentUserId) {
          const myStory: StoryItem = {
            id: currentUserId,
            username: currentUserName,
            avatar: currentUserAvatar,
            stories: [],
            isMe: true
          }
          storiesList.unshift(myStory)
        }
        
        // Convert to categorized structure for consistency
        const myStory = storiesList.find(item => item.isMe) || (currentUserId ? {
          id: currentUserId,
          username: currentUserName,
          avatar: currentUserAvatar,
          stories: [],
          isMe: true
        } : null)
        
        const friends = storiesList.filter(item => !item.isMe)
        
        setCategorizedStories({
          myStory: myStory as StoryItem | null,
          friends: friends,
          discover: []
        })
      } else {
        // If data is neither object with myStory nor array, set empty structure
        console.warn('Unexpected data format from stories API:', data);
        setCategorizedStories({
          myStory: dbUser?.user_id ? {
            id: dbUser.user_id,
            username: dbUser.displayName || `${dbUser.profile?.firstName || ''} ${dbUser.profile?.lastName || ''}`.trim() || 'You',
            avatar: dbUser.photoURL || dbUser.profile?.photos?.[0]?.url || '',
            stories: [],
            isMe: true
          } : null,
          friends: [],
          discover: []
        });
      }
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
        setCategorizedStories({
          myStory,
          friends: [],
          discover: []
        });
      } else {
        setCategorizedStories({
          myStory: null,
          friends: [],
          discover: []
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, setCategorizedStories, setLoading, dbUser]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStories();
  }, [loadStories]);

  const handleStoryPress = (item: StoryItem, category: 'myStory' | 'friends' | 'discover', indexInCategory: number) => {
    if (!categorizedStories) return;
    
    // Set the category and index within that category
    setSelectedCategory(category);
    setSelectedStoryIndex(indexInCategory);
  };

  const handleAddStory = () => {
    router.push('/(home)/(tabs)/(story)/create' as any);
  };

  const handleCloseStory = useCallback(async () => {
    if (storyTimer.current) {
      clearTimeout(storyTimer.current);
      storyTimer.current = null;
    }
    // Stop video if playing - await to ensure it completes
    if (videoRef.current) {
      try {
        await videoRef.current.pauseAsync();
        await videoRef.current.unloadAsync();
      } catch (error) {
        console.error('Error stopping video:', error);
      }
    }
    progressAnim.setValue(0);
    progressAnim.stopAnimation();
    setSelectedStoryIndex(null);
    setSelectedCategory(null);
    setCurrentUserIndex(0);
    setCurrentStoryIndex(0);
    setViewedStoryIds(new Set());
    setShowMenu(false);
    // No need to navigate - setting selectedStoryIndex to null will show the list view
    // Refresh stories to update view status
    loadStories();
  }, [progressAnim, loadStories]);

  const handleBackButton = async () => {
    // Clean up story resources
    if (storyTimer.current) {
      clearTimeout(storyTimer.current);
      storyTimer.current = null;
    }
    // Stop video if playing - await to ensure it completes
    if (videoRef.current) {
      try {
        await videoRef.current.pauseAsync();
        await videoRef.current.unloadAsync();
      } catch (error) {
        console.error('Error stopping video:', error);
      }
    }
    progressAnim.setValue(0);
    progressAnim.stopAnimation();
    setSelectedStoryIndex(null);
    setSelectedCategory(null);
    setCurrentUserIndex(0);
    setCurrentStoryIndex(0);
    setViewedStoryIds(new Set());
    setShowMenu(false);
    // Navigate to home tab
    router.push('/(home)/(tabs)/index' as any);
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

  // Get all stories in a flat list for story viewer (only from selected category)
  const getAllStories = useCallback(() => {
    if (!categorizedStories || !selectedCategory) {
      // Fallback to old stories array
      if (selectedStoryIndex === null) return [];
      return stories.slice(selectedStoryIndex);
    }
    
    // Only return stories from the selected category
    let categoryStories: StoryItem[] = [];
    
    if (selectedCategory === 'myStory' && categorizedStories.myStory) {
      categoryStories = [categorizedStories.myStory];
    } else if (selectedCategory === 'friends') {
      categoryStories = categorizedStories.friends;
    } else if (selectedCategory === 'discover') {
      categoryStories = categorizedStories.discover;
    }
    
    if (selectedStoryIndex === null) return categoryStories;
    // Show stories from selected index onwards (including selected)
    return categoryStories.slice(selectedStoryIndex);
  }, [categorizedStories, stories, selectedStoryIndex, selectedCategory]);

  // Get current story data
  const getCurrentStory = useCallback(() => {
    const allStories = getAllStories();
    if (allStories.length === 0 || currentUserIndex >= allStories.length) return null;
    const user = allStories[currentUserIndex];
    if (user.stories.length === 0 || currentStoryIndex >= user.stories.length) return null;
    return { user, story: user.stories[currentStoryIndex] };
  }, [getAllStories, currentUserIndex, currentStoryIndex]);

  // Navigate to next story
  const nextStory = useCallback(async () => {
    progressAnim.stopAnimation();
    // Stop current video if playing - await to ensure it completes
    if (videoRef.current) {
      try {
        await videoRef.current.pauseAsync();
        await videoRef.current.unloadAsync();
      } catch (error) {
        console.error('Error stopping video:', error);
      }
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
  const prevStory = useCallback(async () => {
    progressAnim.stopAnimation();
    // Stop current video if playing - await to ensure it completes
    if (videoRef.current) {
      try {
        await videoRef.current.pauseAsync();
        await videoRef.current.unloadAsync();
      } catch (error) {
        console.error('Error stopping video:', error);
      }
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
      // getAllStories already slices from selectedStoryIndex, so start at 0
      setCurrentUserIndex(0);
      setCurrentStoryIndex(0);
      progressAnim.setValue(0);
      setWasViewingStory(null); // Clear the flag when starting a new story
    } else {
      // When story viewer closes, ensure video is stopped
      if (videoRef.current) {
        videoRef.current.pauseAsync()
          .then(() => videoRef.current?.unloadAsync())
          .catch(() => {});
      }
      progressAnim.stopAnimation();
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
    if (selectedStoryIndex === null) return;
    
    const current = getCurrentStory();
    if (!current) return;
    
    // Reset progress
    progressAnim.setValue(0);
    
    // For videos, we rely on shouldPlay={true} and onLoad callback
    // For images, start the timer animation
    if (current.story.type !== 'video') {
      const cleanup = startStoryProgress();
      return () => {
        cleanup?.();
      };
    }
    
    return () => {
      if (storyTimer.current) {
        clearTimeout(storyTimer.current);
        storyTimer.current = null;
      }
      progressAnim.stopAnimation();
    };
  }, [selectedStoryIndex, currentUserIndex, currentStoryIndex, startStoryProgress, progressAnim]);
  
  // Separate cleanup for when story viewer closes completely
  useEffect(() => {
    if (selectedStoryIndex === null && videoRef.current) {
      videoRef.current.pauseAsync()
        .then(() => videoRef.current?.unloadAsync())
        .catch(() => {});
    }
  }, [selectedStoryIndex]);

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



  // Handle case when story becomes invalid during viewing
  useEffect(() => {
    if (selectedStoryIndex !== null) {
      const current = getCurrentStory();
      if (!current) {
        // Use setTimeout to avoid setState during render
        const timer = setTimeout(() => {
          handleCloseStory();
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedStoryIndex, getCurrentStory, handleCloseStory]);

  // If story is selected, show story viewer directly (no modal)
  if (selectedStoryIndex !== null) {
    const allStories = getAllStories();
    const current = getCurrentStory();

    // Return null while waiting for the useEffect to close
    if (!current) {
      return null;
    }

    const { user, story } = current;
    // insets is already defined at the top of the component
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
      // Stop and unload video if playing
      if (videoRef.current) {
        try {
          await videoRef.current.pauseAsync();
          await videoRef.current.unloadAsync();
        } catch (error) {
          console.error('Error stopping video:', error);
        }
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
            key={`video-${story.id}-${currentUserIndex}-${currentStoryIndex}`}
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
            onLoad={() => {
              // Ensure video plays after it's fully loaded
              if (videoRef.current) {
                videoRef.current.playAsync().catch((error) => {
                  console.error('Error playing video on load:', error);
                });
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

        {/* Header with Back Button, Profile and Close/Menu Button */}
        <View style={[styles.storyHeader, { top: insets.top + 3 }]}>
          <View style={styles.storyHeaderRow}>

            
            {/* Profile Section */}
            <TouchableOpacity 
              style={styles.storyHeaderLeft}
              onPress={handleProfilePress}
              activeOpacity={0.7}
            >
              <Image source={{ uri: user.avatar }} style={styles.storyHeaderAvatar} />
              <ThemedText style={styles.storyHeaderName}>{user.username}</ThemedText>
            </TouchableOpacity>
            
            {/* Close/Menu Button */}
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

  // Render discover story card (Snapchat-style) - Enhanced design
  const renderDiscoverCard = ({ item, index }: { item: StoryItem; index: number }) => {
    const hasUnviewed = item.stories.some(story => !story.isSeen);
    const firstStory = item.stories[0];
    const storyCount = item.stories.length;
    
    // If first story is a video, use user's avatar as thumbnail
    const thumbnailUrl = firstStory?.type === 'video' 
      ? (item.avatar || 'https://via.placeholder.com/200')
      : (firstStory?.url || item.avatar || 'https://via.placeholder.com/200');
    
    return (
      <TouchableOpacity
        style={styles.discoverCard}
        onPress={() => {
          if (item.stories.length > 0) {
            handleStoryPress(item, 'discover', index);
          }
        }}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.discoverCardImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
          style={styles.discoverCardGradient}
        >
          <View style={styles.discoverCardContent}>
            <View style={styles.discoverCardUserInfo}>
              <Image
                source={{ uri: item.avatar || 'https://via.placeholder.com/40' }}
                style={styles.discoverCardAvatar}
              />
              <View style={styles.discoverCardText}>
                <ThemedText style={styles.discoverCardName} numberOfLines={1}>
                  {item.username}
                </ThemedText>
                {storyCount > 1 && (
                  <ThemedText style={styles.discoverCardStoryCount}>
                    {storyCount} stories
                  </ThemedText>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (isLoading && !categorizedStories) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBackgroundColor} />
        </View>
      </SafeAreaView>
    );
  }

  const hasAnyStories = categorizedStories && (
    (categorizedStories.myStory && categorizedStories.myStory.stories.length > 0) ||
    categorizedStories.friends.length > 0 ||
    categorizedStories.discover.length > 0
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Enhanced Header with gradient */}
      <View style={styles.headerSection}>
        <ThemedText type='title' style={styles.headerTitle}>{('Stories')}</ThemedText>
      </View>

      {!hasAnyStories && !isLoading ? (
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
      ) : categorizedStories ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          keyExtractor={() => 'main-list'}
          ListHeaderComponent={
            <>
              {/* Stories - Your Story + Friends in one horizontal scroll */}
              <FlatList
                horizontal
                data={[
                  ...(categorizedStories.myStory ? [categorizedStories.myStory] : []),
                  ...categorizedStories.friends
                ]}
                extraData={categorizedStories} // Force re-render when stories change
                renderItem={({ item, index }) => {
                  const isMyStory = item.isMe;
                  const hasStories = item.stories.length > 0;
                  // Check if any story from this user hasn't been viewed
                  const hasUnviewed = hasStories && item.stories.some(story => !story.isSeen);
                  
                  const getFirstName = () => {
                    if (isMyStory) return 'Your Story';
                    const nameParts = item.username.trim().split(/\s+/);
                    return nameParts[0] || item.username;
                  };
                  
                  return (
                    <View style={styles.storyItem}>
                      <TouchableOpacity
                        style={styles.storyCircleContainer}
                        onPress={() => {
                          if (isMyStory) {
                            if (hasStories) {
                              handleStoryPress(item, 'myStory', 0);
                            } else {
                              handleAddStory();
                            }
                          } else {
                            if (hasStories) {
                              const friendIndex = categorizedStories.myStory ? index - 1 : index;
                              handleStoryPress(item, 'friends', friendIndex);
                            }
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        {isMyStory ? (
                          // Your Story - always show with gradient
                          <LinearGradient
                            colors={hasStories 
                              ? [Colors.primaryBackgroundColor, Colors.primaryBackgroundColor + 'DD']
                              : [Colors.text.tertiary, Colors.text.light]
                            }
                            style={styles.gradientBorder}
                          >
                            <View style={styles.storyCircleInner}>
                              <Image
                                source={{ uri: item.avatar || 'https://via.placeholder.com/60' }}
                                style={styles.storyAvatar}
                              />
                            </View>
                          </LinearGradient>
                        ) : hasUnviewed ? (
                          // Friend with unviewed stories
                          <LinearGradient
                            colors={[Colors.primaryBackgroundColor, Colors.primaryBackgroundColor + 'DD', Colors.primaryBackgroundColor]}
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
                          // Friend with viewed stories
                          <View style={styles.storyCircleViewed}>
                            <Image
                              source={{ uri: item.avatar || 'https://via.placeholder.com/60' }}
                              style={styles.storyAvatar}
                            />
                          </View>
                        )}
                        
                        {/* Add button for Your Story */}
                        {isMyStory && (
                          <TouchableOpacity
                            style={styles.addIconContainer}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleAddStory();
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.addIcon}>
                              <Ionicons name="add" size={Math.max(16, STORY_CIRCLE_SIZE * 0.20)} color={Colors.primary.white} />
                            </View>
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                      <ThemedText style={styles.storyName} numberOfLines={1}>
                        {getFirstName()}
                      </ThemedText>
                    </View>
                  );
                }}
                keyExtractor={(item, index) => {
                  // Include viewed status in key to force re-render when status changes
                  const viewedCount = item.stories.filter(s => s.isSeen).length;
                  return `story-${item.id}-${index}-viewed-${viewedCount}`;
                }}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContainer}
              />

              {/* Discover Section - Vertical scrollable */}
              {categorizedStories.discover.length > 0 && (
                <View style={styles.sectionContainer}>
                  <View style={styles.discoverHeader}>
                    <ThemedText >Discover </ThemedText>
                  </View>
                  <FlatList
                    data={categorizedStories.discover}
                    renderItem={renderDiscoverCard}
                    keyExtractor={(item, index) => `discover-${item.id}-${index}`}
                    numColumns={2}
                    contentContainerStyle={styles.discoverListContainer}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={true}
                  />
                </View>
              )}
            </>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryBackgroundColor} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="camera-outline" size={80} color={Colors.text.tertiary} />
          <ThemedText type="subtitle" style={styles.emptyText}>No stories yet</ThemedText>
        </View>
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
  headerGradient: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    color: Colors.primary.black,
  },
  listContainer: {
    padding: 12,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  storyItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 1,
    paddingHorizontal: 2,
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
  storyCircleViewed: {
    width: STORY_CIRCLE_SIZE,
    height: STORY_CIRCLE_SIZE,
    borderRadius: STORY_CIRCLE_SIZE / 2,
    borderWidth: 2.5,
    borderColor: '#CCCCCC', // Gray border for viewed stories
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.white,
    padding: 3,
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
    fontSize: 10,
    color: Colors.text.primary,
    textAlign: 'center',
    maxWidth: 80,
    marginTop: 4,
    fontWeight: '500',
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
    gap: 12,
  },

  storyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
  sectionContainer: {
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.titleColor,
    letterSpacing: 0.3,
  },
  friendsHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  friendsSubtitle: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
    fontWeight: '400',
  },
  discoverHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  discoverSubtitle: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
    fontWeight: '400',
  },
  horizontalListContainer: {
    paddingHorizontal: 12,
  },
  discoverListContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  discoverCard: {
    width: (SCREEN_WIDTH - 36) / 2, // 2 columns with padding
    height: 280,
    margin: 6,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.primary.white,
    shadowColor: Colors.primaryBackgroundColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  discoverCardImage: {
    width: '100%',
    height: '100%',
  },
  discoverCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  discoverCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  discoverCardUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  discoverCardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: Colors.primary.white,
    marginRight: 10,
  },
  discoverCardText: {
    flex: 1,
  },
  discoverCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary.white,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  discoverCardStoryCount: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  discoverCardBadge: {
    backgroundColor: Colors.primaryBackgroundColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  discoverCardBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary.white,
    letterSpacing: 0.5,
  },
});


