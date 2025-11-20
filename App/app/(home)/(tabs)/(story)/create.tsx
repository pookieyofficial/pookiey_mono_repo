import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/hooks/useAuth';
import { storyAPI } from '@/APIs/storyAPIs';
import { requestPresignedURl, uploadTos3 } from '@/hooks/uploadTos3';
import { useStoryStore, StoryItem } from '@/store/storyStore';
import { useAuthStore } from '@/store/authStore';
import * as FileSystem from 'expo-file-system/legacy';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { compressImageToJPEG } from '@/utils/imageCompression';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CreateStoryScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { setStories, setLoading } = useStoryStore();
  const { dbUser } = useAuthStore();
  
  // Camera states
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState<{ granted: boolean } | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);
  
  // Media states
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<Video>(null);

  // File size limits
  const MAX_IMAGE_SIZE = 7 * 1024 * 1024; // 7 MB in bytes
  const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30 MB in bytes
  const MAX_VIDEO_DURATION = 30; // 30 seconds

  // Request camera permission on mount
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        if (!cameraPermission?.granted) {
          const result = await requestCameraPermission();
          console.log('Camera permission result:', result);
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    };
    requestPermissions();
  }, [cameraPermission]);


  // Play video when preview is shown
  useEffect(() => {
    if (capturedMedia && mediaType === 'video' && videoRef.current) {
      videoRef.current.playAsync().catch(console.error);
    }
  }, [capturedMedia, mediaType]);

  // Toggle camera facing
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Take photo
  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo) {
        // Check file size
        try {
          const fileInfo = await FileSystem.getInfoAsync(photo.uri);
          if (fileInfo.exists && fileInfo.size && fileInfo.size > MAX_IMAGE_SIZE) {
            Alert.alert('File too large', `Image size must be less than 7 MB. Current size: ${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB`);
            return;
          }
        } catch (error) {
          console.error('Error checking file size:', error);
        }

        setCapturedMedia(photo.uri);
        setMediaType('image');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };


  // Save media to device storage
  const saveToDevice = async (uri: string, type: 'image' | 'video') => {
    try {
      // Request permission manually to avoid AUDIO permission issue
      let permission = await MediaLibrary.getPermissionsAsync().catch(() => null);
      
      if (!permission || !permission.granted) {
        permission = await MediaLibrary.requestPermissionsAsync().catch(() => null);
        if (!permission || !permission.granted) {
          console.log('Media library permission not granted');
          return false;
        }
      }

      // Save to device
      const asset = await MediaLibrary.createAssetAsync(uri);
      console.log('Media saved to device:', asset.uri);
      return true;
    } catch (error: any) {
      console.error('Error saving to device:', error);
      // Don't fail the upload if saving to device fails
      return false;
    }
  };

  // Pick from gallery (image or video)
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant gallery permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
        videoMaxDuration: MAX_VIDEO_DURATION,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const isVideo = asset.type === 'video';
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        
        // Check file size
        if (asset.fileSize && asset.fileSize > maxSize) {
          Alert.alert(
            'File too large',
            `${isVideo ? 'Video' : 'Image'} size must be less than ${isVideo ? '30' : '7'} MB. Current size: ${(asset.fileSize / (1024 * 1024)).toFixed(2)} MB`
          );
          return;
        }
        
        // Check video duration
        if (isVideo && asset.duration) {
          const durationInSeconds = asset.duration / 1000;
          if (durationInSeconds > MAX_VIDEO_DURATION) {
            Alert.alert('Video too long', `Video must be ${MAX_VIDEO_DURATION} seconds or less. Current duration: ${durationInSeconds.toFixed(1)} seconds`);
            return;
          }
        }
        
        setCapturedMedia(asset.uri);
        setMediaType(isVideo ? 'video' : 'image');
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const handlePublish = async () => {
    if (!token) {
      Alert.alert('Error', 'Please log in to create a story');
      return;
    }

    if (!capturedMedia || !mediaType) {
      Alert.alert('Error', 'Please capture or select media first');
      return;
    }

    setUploading(true);

    try {
      let mediaToUpload = capturedMedia;
      let mimeType = mediaType === 'image' ? 'image/jpeg' : 'video/mp4';

      // Compress image to JPEG if it's an image
      if (mediaType === 'image') {
        console.log('🔄 Compressing image for story...');
        try {
          const compressed = await compressImageToJPEG(
            capturedMedia,
git             0.85 // High quality for stories
          );
          mediaToUpload = compressed.uri;
          mimeType = compressed.mimeType;
          console.log('✅ Image compressed successfully');
          
          // Log compression results
          const originalInfo = await FileSystem.getInfoAsync(capturedMedia);
          if (originalInfo.exists && compressed.size) {
            const originalSize = (originalInfo as any).size;
            const compressionRatio = ((1 - compressed.size / originalSize) * 100).toFixed(1);
            console.log(`📊 Compression: ${(originalSize / (1024 * 1024)).toFixed(2)}MB → ${(compressed.size / (1024 * 1024)).toFixed(2)}MB (${compressionRatio}% reduction)`);
          }
        } catch (compressionError) {
          console.error('⚠️ Image compression failed, uploading original:', compressionError);
          // Continue with original image if compression fails
        }
      }

      const presignedUrls = await requestPresignedURl([mimeType]);
      
      if (!presignedUrls || presignedUrls.length === 0) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileURL } = presignedUrls[0];
      const uploadSuccess = await uploadTos3(mediaToUpload, uploadUrl, mimeType);
      
      if (!uploadSuccess) {
        throw new Error('Failed to upload media');
      }

      // Clean up compressed temporary file if different from original
      if (mediaType === 'image' && mediaToUpload !== capturedMedia) {
        try {
          await FileSystem.deleteAsync(mediaToUpload, { idempotent: true });
          console.log('🗑️ Cleaned up temporary compressed file');
        } catch (cleanupError) {
          console.warn('⚠️ Failed to clean up temporary file:', cleanupError);
        }
      }

      // Create story
      await storyAPI.createStory(
        {
          type: mediaType as 'image' | 'video',
          mediaUrl: fileURL,
        },
        token
      );

      // Save to device storage
      const saved = await saveToDevice(capturedMedia, mediaType);
      if (saved) {
        console.log('Story saved to device gallery');
      }

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

      Alert.alert(
        'Success', 
        saved ? 'Story published and saved to your gallery!' : 'Story published!', 
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating story:', error);
      Alert.alert('Error', error.message || 'Failed to create story');
    } finally {
      setUploading(false);
    }
  };

  // Show loading while checking permissions
  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primaryBackgroundColor} />
      </View>
    );
  }

  // Show permission request screen if needed
  if (!cameraPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons 
          name="camera-outline" 
          size={80} 
          color={Colors.text.tertiary} 
        />
        <ThemedText type="subtitle" style={styles.permissionTitle}>
          Camera Access Required
        </ThemedText>
        <Text style={styles.permissionText}>
          We need access to your camera to capture photos for your story.
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={async () => {
            await requestCameraPermission();
          }}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {capturedMedia ? (
        /* Preview Mode */
        <>
          <View style={styles.previewContainer}>
            {mediaType === 'image' ? (
              <Image 
                source={{ uri: capturedMedia }} 
                style={styles.previewMedia} 
                resizeMode="cover"
                onError={(error) => {
                  console.error('Image load error:', error);
                  Alert.alert('Error', 'Failed to load image preview');
                }}
                onLoad={() => {
                  console.log('Image loaded successfully');
                }}
              />
            ) : (
              <Video
                ref={videoRef}
                source={{ uri: capturedMedia }}
                style={styles.previewMedia}
                resizeMode={ResizeMode.COVER}
                shouldPlay={true}
                isLooping={true}
                useNativeControls={true}
                onError={(error) => {
                  console.error('Video load error:', error);
                  Alert.alert('Error', 'Failed to load video preview');
                }}
                onLoad={() => {
                  console.log('Video loaded successfully');
                  if (videoRef.current) {
                    videoRef.current.playAsync().catch(console.error);
                  }
                }}
              />
            )}
          </View>

          {/* Preview Controls */}
          <SafeAreaView style={styles.previewHeader} edges={['top']}>
            <View style={styles.previewHeaderContent}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  setCapturedMedia(null);
                  setMediaType(null);
                }}
              >
                <Ionicons name="close" size={32} color="#fff" />
              </TouchableOpacity>
              <ThemedText type="defaultSemiBold" style={styles.previewTitle}>
                Preview Your Story
              </ThemedText>
              <View style={{ width: 48 }} />
            </View>
          </SafeAreaView>

          <SafeAreaView style={styles.previewFooter} edges={['bottom']}>
            <TouchableOpacity
              style={[styles.shareButton, uploading && styles.shareButtonDisabled]}
              onPress={handlePublish}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.shareButtonText}>Uploading...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={24} color="#fff" />
                  <Text style={styles.shareButtonText}>Share Story</Text>
                </>
              )}
            </TouchableOpacity>
          </SafeAreaView>
        </>
      ) : (
        /* Camera Mode */
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
          />

          {/* Camera Header */}
          <SafeAreaView style={styles.cameraHeader} edges={['top']}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <ThemedText type="defaultSemiBold" style={styles.cameraTitle}>
                Tap to Capture
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={32} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Camera Controls */}
          <SafeAreaView style={styles.cameraControls} edges={['bottom']}>
            <View style={styles.controlsRow}>
              {/* Gallery Button */}
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={handlePickFromGallery}
              >
                <Ionicons name="images" size={32} color="#fff" />
                <Text style={styles.galleryButtonText}>Gallery</Text>
              </TouchableOpacity>

              {/* Capture Button */}
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              {/* Help Text */}
              <View style={styles.helpContainer}>
                <Text style={styles.helpText}>Tap for photo</Text>
                <Text style={styles.helpText}>Gallery for video</Text>
              </View>
            </View>
          </SafeAreaView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Permission Screen
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.parentBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 24,
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: Colors.primaryBackgroundColor,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: Colors.primaryBackgroundColor,
    fontSize: 16,
    fontWeight: '500',
  },
  // Camera View
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cameraHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 16,
    color: '#fff',
  },
  iconButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
  },
  // Camera Controls
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryButton: {
    alignItems: 'center',
    gap: 4,
    width: 80,
  },
  galleryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
  },
  helpContainer: {
    alignItems: 'center',
    gap: 2,
    width: 80,
  },
  helpText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    textAlign: 'center',
  },
  // Preview Mode
  previewContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  previewHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  previewTitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  previewFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  shareButton: {
    backgroundColor: Colors.primaryBackgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: Colors.primaryBackgroundColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

