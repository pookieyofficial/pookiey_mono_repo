import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Dimensions, ScrollView, Animated } from 'react-native';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomBackButton from '@/components/CustomBackButton';
import MainButton from '@/components/MainButton';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { requestPresignedURl, uploadMultipleTos3 } from '@/hooks/uploadTos3';
import { useOnboardingStore } from '@/store/onboardingStore';
import { compressImageToJPEG } from '@/utils/imageCompression';
import { useTranslation } from 'react-i18next';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_SIZE = (screenWidth - 80) / 3;

export default function PremiumImageSelectorScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { photos, setPhotos } = useOnboardingStore();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageMimeTypes, setSelectedImageMimeTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // console.log({ photos })
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Load existing photos from store on component mount
  useEffect(() => {
    if (photos && photos.length > 0) {
      setSelectedImages(photos);
      // Set default mime type for existing photos
      setSelectedImageMimeTypes(photos.map(() => 'image/jpeg'));
      // console.log("Loaded existing photos from store:", photos);
    }
  }, [photos]);

  const handleupload = async () => {
    try {
      if (!Array.isArray(photos) || photos.length === 0) {
        // console.log('🔄 Compressing images for onboarding...');
        
        // Step 1: Compress all images
        const compressedImages = [];
        const compressedMimeTypes = [];
        
        for (let i = 0; i < selectedImages.length; i++) {
          try {
            const compressed = await compressImageToJPEG(
              selectedImages[i],
              0.8  // Good quality for profile photos
            );
            
            compressedImages.push(compressed.uri);
            compressedMimeTypes.push(compressed.mimeType);
            
            // Log compression stats
            const originalInfo = await FileSystem.getInfoAsync(selectedImages[i]);
            if (originalInfo.exists && compressed.size) {
              const originalSize = (originalInfo as any).size;
              const compressionRatio = ((1 - compressed.size / originalSize) * 100).toFixed(1);
              // console.log(`📊 Image ${i + 1}: ${(originalSize / (1024 * 1024)).toFixed(2)}MB → ${(compressed.size / (1024 * 1024)).toFixed(2)}MB (${compressionRatio}% reduction)`);
            }
          } catch (compressionError) {
            // console.error(`⚠️ Image ${i + 1} compression failed, using original:`, compressionError);
            compressedImages.push(selectedImages[i]);
            compressedMimeTypes.push(selectedImageMimeTypes[i]);
          }
        }
        
        // console.log('✅ All images compressed successfully');
        
        // Step 2: Request presigned URLs with compressed image MIME types
        const arrayofPresignedUrls = await requestPresignedURl(compressedMimeTypes);
        
        // Step 3: Prepare result array with compressed images
        let resultArray = [];
        for (let i = 0; i < compressedImages.length; i++) {
          let obj = {
            LocalUrl: compressedImages[i],
            PresignedUrl: arrayofPresignedUrls[i].uploadUrl,
            MimeType: compressedMimeTypes[i]
          };
          resultArray.push(obj);
        }
        
        let ImagePublicUrl = [];
        for (let i = 0; i < compressedImages.length; i++) {
          const fileUrl = arrayofPresignedUrls[i].fileURL;
          // console.log({ fileUrl });
          ImagePublicUrl.push(fileUrl);
        }
        
        // Save the public URLs to Zustand store
        setPhotos(ImagePublicUrl);
        // console.log("Photos saved to store:", ImagePublicUrl);
        // console.log("publicurl of image is ", photos);
        // console.log("resultArray", resultArray);

        // Step 4: Upload compressed images to S3
        const uploadResponse = await uploadMultipleTos3(resultArray);
        // console.log("uploadResponse", uploadResponse);
        
        // Step 5: Clean up temporary compressed files
        for (let i = 0; i < compressedImages.length; i++) {
          if (compressedImages[i] !== selectedImages[i]) {
            try {
              await FileSystem.deleteAsync(compressedImages[i], { idempotent: true });
              // console.log(`🗑️ Cleaned up compressed file ${i + 1}`);
            } catch (cleanupError) {
              // console.warn(`⚠️ Failed to clean up compressed file ${i + 1}:`, cleanupError);
            }
          }
        }
      }
    } catch (error) {
      // console.log("error from handleUpload", error);
    }
  }

  const pickImages = async () => {
    try {
      setIsLoading(true);

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(t('image.permissionRequired'), t('image.grantCameraRoll'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        quality: 1,
        allowsEditing: false,
        selectionLimit: 6 - selectedImages.length,
      });



      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        const newMimeTypes = result.assets.map(asset => asset.mimeType || 'image/jpeg');
        setSelectedImages(prev => [...prev, ...newImages].slice(0, 6));
        setSelectedImageMimeTypes(prev => [...prev, ...newMimeTypes].slice(0, 6));
        // console.log("Selected Images:", selectedImages);
        // console.log("Selected Mime Types:", selectedImageMimeTypes)

        // Success animation feedback
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.95,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      Alert.alert(t('profile.error'), t('profile.failedToSelectImage'));
      // console.error('Image picker error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const newSelectedImages = selectedImages.filter((_, i) => i !== index);
    const newSelectedImageMimeTypes = selectedImageMimeTypes.filter((_, i) => i !== index);

    setSelectedImages(newSelectedImages);
    setSelectedImageMimeTypes(newSelectedImageMimeTypes);

    // Update the store with the remaining images
    setPhotos(newSelectedImages);
  };

  const handleContinue = () => {
    if (selectedImages.length === 6) {
      router.push('/(onboarding)/notification');
    } else {
      pickImages();
    }
  };

  const remainingImages = 6 - selectedImages.length;
  const isComplete = selectedImages.length === 6;
  const progressPercentage = (selectedImages.length / 6) * 100;

  const renderImageCard = (index: number) => {
    const imageUri = selectedImages[index];
    const isEmpty = !imageUri;

    return (
      <Animated.View
        key={index}
        style={[
          styles.imageCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={imageUri ? () => removeImage(index) : pickImages}
          activeOpacity={0.7}
        >
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.selectedImage}
                transition={300}
              />
              <View style={styles.imageOverlay} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <View style={styles.removeButtonInner}>
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <View style={styles.imageNumberBadge}>
                <ThemedText style={styles.imageNumberText}>{index + 1}</ThemedText>
              </View>
            </View>
          ) : (
            <View style={[styles.emptyCard, styles.emptyCardGradient]}>
              <View style={styles.addIconContainer}>
                <MaterialCommunityIcons name="plus" size={28} color={Colors.primaryBackgroundColor} />
              </View>
              <ThemedText style={styles.addText}>{t('image.addPhoto')}</ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomBackButton />

      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>
            {t('image.title')}
          </ThemedText>
          <View style={styles.titleUnderline} />
        </View>
        <ThemedText style={styles.subtitle}>
          {t('image.subtitle')}
        </ThemedText>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <ThemedText style={styles.progressText}>
              {selectedImages.length}/6 {t('image.photos')}
            </ThemedText>
            <ThemedText style={styles.progressPercentage}>
              {Math.round(progressPercentage)}%
            </ThemedText>
          </View>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                }
              ]}
            />
          </View>
        </View>
      </View>

      {/* Enhanced Scrollable Image Grid */}
      <ScrollView
        style={styles.scrollableContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageGrid}>
          {Array.from({ length: 6 }, (_, index) => renderImageCard(index))}
        </View>
      </ScrollView>

      {/* Enhanced Bottom Button */}
      <View style={styles.buttonContainer}>
        <MainButton
          title={
            isComplete
              ? t('image.continue')
              : remainingImages === 1
                ? t('image.selectMore', { count: remainingImages })
                : t('image.selectMorePlural', { count: remainingImages })
          }
          onPress={() => {
            handleContinue();
            handleupload();
          }}
          disabled={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollableContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: '#FAFBFC',
  },
  titleContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    textAlign: 'left',
    marginBottom: 12,
    color: '#1A1A1A',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: Colors.primaryBackgroundColor,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'left',
    color: '#6B7280',
    lineHeight: 26,
    marginBottom: 32,
    fontWeight: '400',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 15,
    color: Colors.primaryBackgroundColor,
    fontWeight: '700',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primaryBackgroundColor,
    borderRadius: 4,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  imageCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardTouchable: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 15,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  removeButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  imageNumberBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  imageNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  emptyCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFA',
  },
  emptyCardGradient: {
    backgroundColor: '#FAFAFA',
  },
  addIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#FAFBFC',
  },
});