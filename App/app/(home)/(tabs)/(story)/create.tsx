import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { storyAPI } from '@/APIs/storyAPIs';
import { requestPresignedURl, uploadTos3 } from '@/hooks/uploadTos3';
import { useStoryStore, StoryItem } from '@/store/storyStore';
import { useAuthStore } from '@/store/authStore';
import * as FileSystem from 'expo-file-system';
import { Video, ResizeMode } from 'expo-av';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CreateStoryScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { setStories, setLoading } = useStoryStore();
  const { dbUser } = useAuthStore();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [uploading, setUploading] = useState(false);

  // File size limits
  const MAX_IMAGE_SIZE = 7 * 1024 * 1024; // 7 MB in bytes
  const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30 MB in bytes
  const MAX_VIDEO_DURATION = 30; // 30 seconds

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Check file size
        if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
          Alert.alert('File too large', `Image size must be less than 7 MB. Current size: ${(asset.fileSize / (1024 * 1024)).toFixed(2)} MB`);
          return;
        }
        
        // If fileSize is not available, try to get it from FileSystem
        if (!asset.fileSize) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(asset.uri);
            if (fileInfo.exists && fileInfo.size && fileInfo.size > MAX_IMAGE_SIZE) {
              Alert.alert('File too large', `Image size must be less than 7 MB. Current size: ${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB`);
              return;
            }
          } catch (error) {
            console.error('Error checking file size:', error);
          }
        }
        
        setSelectedMedia(asset.uri);
        setMediaType('image');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: MAX_VIDEO_DURATION,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const videoUri = asset.uri;
        const duration = asset.duration;
        
        // Check video duration
        if (duration !== undefined && duration !== null) {
          // Duration is in milliseconds
          const durationInSeconds = duration / 1000;
          
          if (durationInSeconds > MAX_VIDEO_DURATION) {
            Alert.alert('Video too long', `Video must be ${MAX_VIDEO_DURATION} seconds or less. Current duration: ${durationInSeconds.toFixed(1)} seconds`);
            return;
          }
        }

        // Check file size
        if (asset.fileSize && asset.fileSize > MAX_VIDEO_SIZE) {
          Alert.alert('File too large', `Video size must be less than 30 MB. Current size: ${(asset.fileSize / (1024 * 1024)).toFixed(2)} MB`);
          return;
        }
        
        // If fileSize is not available, try to get it from FileSystem
        if (!asset.fileSize) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(videoUri);
            if (fileInfo.exists && fileInfo.size && fileInfo.size > MAX_VIDEO_SIZE) {
              Alert.alert('File too large', `Video size must be less than 30 MB. Current size: ${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB`);
              return;
            }
          } catch (error) {
            console.error('Error checking file size:', error);
          }
        }

        setSelectedMedia(videoUri);
        setMediaType('video');
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Check file size
        if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
          Alert.alert('File too large', `Image size must be less than 7 MB. Current size: ${(asset.fileSize / (1024 * 1024)).toFixed(2)} MB`);
          return;
        }
        
        // If fileSize is not available, try to get it from FileSystem
        if (!asset.fileSize) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(asset.uri);
            if (fileInfo.exists && fileInfo.size && fileInfo.size > MAX_IMAGE_SIZE) {
              Alert.alert('File too large', `Image size must be less than 7 MB. Current size: ${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB`);
              return;
            }
          } catch (error) {
            console.error('Error checking file size:', error);
          }
        }
        
        setSelectedMedia(asset.uri);
        setMediaType('image');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const takeVideo = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: MAX_VIDEO_DURATION,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const videoUri = asset.uri;
        const duration = asset.duration;
        
        // Check video duration
        if (duration !== undefined && duration !== null) {
          // Duration is in milliseconds
          const durationInSeconds = duration / 1000;
          
          if (durationInSeconds > MAX_VIDEO_DURATION) {
            Alert.alert('Video too long', `Video must be ${MAX_VIDEO_DURATION} seconds or less. Current duration: ${durationInSeconds.toFixed(1)} seconds`);
            return;
          }
        }

        // Check file size
        if (asset.fileSize && asset.fileSize > MAX_VIDEO_SIZE) {
          Alert.alert('File too large', `Video size must be less than 30 MB. Current size: ${(asset.fileSize / (1024 * 1024)).toFixed(2)} MB`);
          return;
        }
        
        // If fileSize is not available, try to get it from FileSystem
        if (!asset.fileSize) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(videoUri);
            if (fileInfo.exists && fileInfo.size && fileInfo.size > MAX_VIDEO_SIZE) {
              Alert.alert('File too large', `Video size must be less than 30 MB. Current size: ${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB`);
              return;
            }
          } catch (error) {
            console.error('Error checking file size:', error);
          }
        }

        setSelectedMedia(videoUri);
        setMediaType('video');
      }
    } catch (error) {
      console.error('Error taking video:', error);
      Alert.alert('Error', 'Failed to take video');
    }
  };

  const handlePublish = async () => {
    if (!token) {
      Alert.alert('Error', 'Please log in to create a story');
      return;
    }

    if (!selectedMedia || !mediaType) {
      Alert.alert('Error', 'Please select an image or video');
      return;
    }

    setUploading(true);

    try {
      const mimeType = mediaType === 'image' ? 'image/jpeg' : 'video/mp4';
      const presignedUrls = await requestPresignedURl([mimeType]);
      
      if (!presignedUrls || presignedUrls.length === 0) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileURL } = presignedUrls[0];
      const uploadSuccess = await uploadTos3(selectedMedia, uploadUrl, mimeType);
      
      if (!uploadSuccess) {
        throw new Error('Failed to upload media');
      }

      // Create story
      await storyAPI.createStory(
        {
          type: mediaType as 'image' | 'video',
          mediaUrl: fileURL,
        },
        token
      );

      // Refresh stories in store
      try {
        setLoading(true);
        const data = await storyAPI.getStories(token);
        
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
      } catch (refreshError) {
        console.error('Error refreshing stories:', refreshError);
      } finally {
        setLoading(false);
      }

      Alert.alert('Success', 'Story published!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating story:', error);
      Alert.alert('Error', error.message || 'Failed to create story');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Story</Text>
        <TouchableOpacity
          onPress={handlePublish}
          style={[styles.publishButton, (!selectedMedia || uploading) && styles.publishButtonDisabled]}
          disabled={!selectedMedia || uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={Colors.primary.white} />
          ) : (
            <Text style={styles.publishButtonText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {selectedMedia ? (
          <View style={styles.mediaPreview}>
            {mediaType === 'image' ? (
              <Image source={{ uri: selectedMedia }} style={styles.mediaImage} resizeMode="contain" />
            ) : (
              <Video
                source={{ uri: selectedMedia }}
                style={styles.mediaImage}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
                useNativeControls={true}
              />
            )}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                setSelectedMedia(null);
                setMediaType(null);
              }}
            >
              <Ionicons name="close-circle" size={32} color={Colors.primary.red} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mediaPlaceholder}>
            <Ionicons name="camera-outline" size={80} color={Colors.text.tertiary} />
            <Text style={styles.placeholderText}>Select an image or video</Text>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Ionicons name="images-outline" size={24} color={Colors.primaryBackgroundColor} />
            <Text style={styles.actionButtonText}>Choose Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={24} color={Colors.primaryBackgroundColor} />
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={pickVideo}>
            <Ionicons name="film-outline" size={24} color={Colors.primaryBackgroundColor} />
            <Text style={styles.actionButtonText}>Choose Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={takeVideo}>
            <Ionicons name="videocam-outline" size={24} color={Colors.primaryBackgroundColor} />
            <Text style={styles.actionButtonText}>Record Video</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parentBackgroundColor,
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  publishButton: {
    backgroundColor: Colors.primaryBackgroundColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishButtonText: {
    color: Colors.primary.white,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  mediaPreview: {
    width: '100%',
    height: 500,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 16,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
  },
  mediaPlaceholder: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.secondaryBackgroundColor,
    borderRadius: 12,
    marginBottom: 16,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  buttonsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  actionButtonText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
});

