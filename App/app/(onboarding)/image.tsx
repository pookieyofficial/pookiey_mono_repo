import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Dimensions, ScrollView, Animated } from 'react-native';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomBackButton from '@/components/CustomBackButton';
import MainButton from '@/components/MainButton';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { requestPresignedURl, uploadMultipleTos3 } from '@/hooks/uploadTos3';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_SIZE = (screenWidth - 80) / 3;

export default function PremiumImageSelectorScreen() {
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageMimeTypes, setSelectedImageMimeTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleupload = async () => {
    try {
      const arrayofPresignedUrls = await requestPresignedURl(selectedImageMimeTypes)
      //here we have to parse the localImageurl, presignedurl, mimeType from the array and have to make an array
      let resultArray = []
      
      for( let i = 0; i < selectedImages.length; i++){
        let obj = {
          LocalUrl: selectedImages[i],
          PresignedUrl: arrayofPresignedUrls[i].uploadUrl,
          MimeType: selectedImageMimeTypes[i]
        }
        resultArray.push(obj)
      }
      console.log("resultArray", resultArray);
      
      const uploadResponse = await uploadMultipleTos3(resultArray)
      console.log("uploadResponse", uploadResponse)
    } catch (error) {
      console.log("error from handleUpload", error)
    }
  }

  const pickImages = async () => {
    try {
      setIsLoading(true);

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Please grant camera roll permissions to select images.");
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
        console.log("Selected Images:", selectedImages);
        console.log("Selected Mime Types:", selectedImageMimeTypes)

        // Success animation feedback
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.9,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select images. Please try again.");
      console.error('Image picker error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
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

    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setSelectedImageMimeTypes(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (selectedImages.length === 6) {
      router.push('/(home)');
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
                  outputRange: [0.8, 1],
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
              <ThemedText style={styles.addText}>Add Photo</ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomBackButton />

      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText type="title">
            Show Your Best Self
          </ThemedText>
          <View style={styles.titleUnderline} />
        </View>
        <ThemedText style={styles.subtitle}>
          Add 6 photos that showcase your personality and interests.
        </ThemedText>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <ThemedText style={styles.progressText}>
              {selectedImages.length}/6 photos
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

        {/* Premium Tips Section */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsHeader}>
            <Ionicons name="sparkles" size={24} color={Colors.primaryBackgroundColor} />
            <ThemedText style={styles.tipsTitle}>Photo Tips</ThemedText>
          </View>

          <View style={styles.tipsGrid}>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="sunny" size={20} color={Colors.primaryBackgroundColor} />
              </View>
              <ThemedText style={styles.tipText}>Good lighting</ThemedText>
            </View>

            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="person" size={20} color={Colors.primaryBackgroundColor} />
              </View>
              <ThemedText style={styles.tipText}>Clear face</ThemedText>
            </View>

            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="happy" size={20} color={Colors.primaryBackgroundColor} />
              </View>
              <ThemedText style={styles.tipText}>Genuine smile</ThemedText>
            </View>

            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="images" size={20} color={Colors.primaryBackgroundColor} />
              </View>
              <ThemedText style={styles.tipText}>Variety of shots</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Bottom Button */}
      <View style={styles.buttonContainer}>
        <MainButton
          title={
            isComplete
              ? "Continue"
              : `Select ${remainingImages} More Photo${remainingImages !== 1 ? 's' : ''}`
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
    backgroundColor: Colors.parentBackgroundColor,

  },
  scrollableContainer: {
    flex: 1,
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: Colors.parentBackgroundColor,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.primaryBackgroundColor,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: Colors.primaryBackgroundColor,
    borderRadius: 2,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: 25,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 14,
    color: Colors.primaryBackgroundColor,
    fontWeight: '700',
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primaryBackgroundColor,
    borderRadius: 3,
    shadowColor: Colors.primaryBackgroundColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  imageCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    marginBottom: 15,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.primaryBackgroundColor,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
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
    borderRadius: 18,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 18,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  removeButtonInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  imageNumberBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryBackgroundColor,
  },
  emptyCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyCardGradient: {
    backgroundColor: Colors.parentBackgroundColor,
  },
  addIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    borderStyle: 'dashed',
  },
  addText: {
    fontSize: 13,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    shadowColor: Colors.primaryBackgroundColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primaryBackgroundColor,
    marginLeft: 8,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tipItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 6,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  tipText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '600',
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    backgroundColor: Colors.parentBackgroundColor,
  },
});