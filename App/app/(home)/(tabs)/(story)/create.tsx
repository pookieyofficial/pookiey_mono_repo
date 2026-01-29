import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
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
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { compressImageToJPEG } from '@/utils/imageCompression';
import CustomDialog, { DialogType } from '@/components/CustomDialog';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CreateStoryScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { setCategorizedStories, setLoading } = useStoryStore();
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
  const videoPlayer = useVideoPlayer(capturedMedia || null, (player) => {
    if (capturedMedia && mediaType === 'video') {
      player.loop = true;
      player.play();
    }
  });

  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>('info');
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [dialogPrimaryButton, setDialogPrimaryButton] = useState<{ text: string; onPress: () => void }>({ text: 'OK', onPress: () => setDialogVisible(false) });
  const [dialogSecondaryButton, setDialogSecondaryButton] = useState<{ text: string; onPress: () => void } | undefined>(undefined);

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
        }
      } catch (error) {
      }
    };
    requestPermissions();
  }, [cameraPermission]);


  // Restart video when new preview is set
  useEffect(() => {
    if (capturedMedia && mediaType === 'video') {
      try {
        videoPlayer.replace({ uri: capturedMedia });
        videoPlayer.loop = true;
        videoPlayer.play();
      } catch {
        // ignore
      }
    }
  }, [capturedMedia, mediaType, videoPlayer]);

  // Toggle camera facing
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Show dialog helper function
  const showDialog = (
    type: DialogType,
    message: string,
    title?: string,
    primaryButton?: { text: string; onPress: () => void },
    secondaryButton?: { text: string; onPress: () => void }
  ) => {
    setDialogType(type);
    setDialogTitle(title || '');
    setDialogMessage(message);
    setDialogPrimaryButton(primaryButton || { text: 'OK', onPress: () => setDialogVisible(false) });
    setDialogSecondaryButton(secondaryButton);
    setDialogVisible(true);
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
            showDialog('error', `Image size must be less than 7 MB. Current size: ${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB`, 'File too large');
            return;
          }
        } catch (error) {
        }

        setCapturedMedia(photo.uri);
        setMediaType('image');
      }
    } catch (error) {
      showDialog('error', 'Failed to take photo', 'Error');
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
          return false;
        }
      }

      // Save to device
      const asset = await MediaLibrary.createAssetAsync(uri);
      return true;
    } catch (error: any) {
      // Don't fail the upload if saving to device fails
      return false;
    }
  };

  // Pick from gallery (image or video)
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showDialog('warning', 'Please grant gallery permissions', 'Permission needed');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        // Allow any aspect ratio by disabling the fixed crop box
        allowsEditing: false,
        quality: 0.8,
        videoMaxDuration: MAX_VIDEO_DURATION,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const isVideo = asset.type === 'video';
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

        // Check file size
        if (asset.fileSize && asset.fileSize > maxSize) {
          showDialog(
            'error',
            `${isVideo ? 'Video' : 'Image'} size must be less than ${isVideo ? '30' : '7'} MB. Current size: ${(asset.fileSize / (1024 * 1024)).toFixed(2)} MB`,
            'File too large'
          );
          return;
        }

        // Check video duration
        if (isVideo && asset.duration) {
          const durationInSeconds = asset.duration / 1000;
          if (durationInSeconds > MAX_VIDEO_DURATION) {
            showDialog('error', `Video must be ${MAX_VIDEO_DURATION} seconds or less. Current duration: ${durationInSeconds.toFixed(1)} seconds`, 'Video too long');
            return;
          }
        }

        setCapturedMedia(asset.uri);
        setMediaType(isVideo ? 'video' : 'image');
      }
    } catch (error) {
      showDialog('error', 'Failed to pick media', 'Error');
    }
  };

  const handlePublish = async () => {
    if (!token) {
      showDialog('error', 'Please log in to create a story', 'Error');
      return;
    }

    if (!capturedMedia || !mediaType) {
      showDialog('error', 'Please capture or select media first', 'Error');
      return;
    }

    setUploading(true);

    try {
      let mediaToUpload = capturedMedia;
      let mimeType = mediaType === 'image' ? 'image/jpeg' : 'video/mp4';

      // Compress image to JPEG if it's an image
      if (mediaType === 'image') {
        try {
          const compressed = await compressImageToJPEG(
            capturedMedia,
            0.85 // High quality for stories
          );
          mediaToUpload = compressed.uri;
          mimeType = compressed.mimeType;

          // Log compression results
          const originalInfo = await FileSystem.getInfoAsync(capturedMedia);
          if (originalInfo.exists && compressed.size) {
            const originalSize = (originalInfo as any).size;
            const compressionRatio = ((1 - compressed.size / originalSize) * 100).toFixed(1);
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

      // Refresh stories in store
      try {
        setLoading(true);
        const data = await storyAPI.getStories(token);

        // Handle new categorized structure
        if (data && typeof data === 'object' && !Array.isArray(data) && 'myStory' in data) {
          // New structure with categorized stories
          const categorizedStories = {
            myStory: data.myStory || null,
            friends: Array.isArray(data.friends) ? data.friends : [],
            discover: Array.isArray(data.discover) ? data.discover : []
          };

          // Ensure "Your Story" exists even if empty
          if (!categorizedStories.myStory && dbUser?.user_id) {
            categorizedStories.myStory = {
              id: dbUser.user_id,
              username: dbUser.displayName || `${dbUser.profile?.firstName || ''} ${dbUser.profile?.lastName || ''}`.trim() || 'You',
              avatar: dbUser.photoURL || dbUser.profile?.photos?.[0]?.url || '',
              stories: [],
              isMe: true
            };
          }

          setCategorizedStories(categorizedStories);
        } else if (Array.isArray(data)) {
          // Fallback to old structure (flat array)
          const storiesList: StoryItem[] = data;
          const myStoryIndex = storiesList.findIndex(item => item.isMe);

          const currentUserId = dbUser?.user_id;
          const currentUserName = dbUser?.displayName || `${dbUser?.profile?.firstName || ''} ${dbUser?.profile?.lastName || ''}`.trim() || 'You';
          const currentUserAvatar = dbUser?.photoURL || dbUser?.profile?.photos?.[0]?.url || '';

          if (myStoryIndex === -1 && currentUserId) {
            const myStory: StoryItem = {
              id: currentUserId,
              username: currentUserName,
              avatar: currentUserAvatar,
              stories: [],
              isMe: true
            };
            storiesList.unshift(myStory);
          }

          // Convert to categorized structure
          const myStory = storiesList.find(item => item.isMe) || (currentUserId ? {
            id: currentUserId,
            username: currentUserName,
            avatar: currentUserAvatar,
            stories: [],
            isMe: true
          } : null);

          const friends = storiesList.filter(item => !item.isMe);

          setCategorizedStories({
            myStory: myStory as StoryItem | null,
            friends: friends,
            discover: []
          });
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
      } catch (refreshError) {
        console.error('Error refreshing stories:', refreshError);
      } finally {
        setLoading(false);
      }

      showDialog(
        'success',
        'Story published!',
        'Success',
        {
          text: 'OK',
          onPress: () => {
            setDialogVisible(false);
            router.back();
          },
        }
      );
    } catch (error: any) {
      console.error('Error creating story:', error);
      showDialog('error', error.message || 'Failed to create story', 'Error');
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
    <>
      <CustomDialog
        visible={dialogVisible}
        type={dialogType}
        title={dialogTitle}
        message={dialogMessage}
        onDismiss={() => setDialogVisible(false)}
        primaryButton={dialogPrimaryButton}
        secondaryButton={dialogSecondaryButton}
      />
      <View style={styles.container}>
        {capturedMedia ? (
          /* Preview Mode */
          <>
            <View style={styles.previewContainer}>
              {mediaType === 'image' ? (
                <Image
                  source={{ uri: capturedMedia }}
                  style={styles.previewMedia}
                  // Show the full image without cropping; will letterbox if aspect ratios differ
                  resizeMode="contain"
                  onError={(error) => {
                    console.error('Image load error:', error);
                    showDialog('error', 'Failed to load image preview', 'Error');
                  }}
                />
              ) : (
                <VideoView
                  player={videoPlayer}
                  style={styles.previewMedia}
                  contentFit="cover"
                  nativeControls
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
    </>
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

