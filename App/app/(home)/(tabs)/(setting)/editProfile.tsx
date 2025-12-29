import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import { ThemedText } from '@/components/ThemedText'
import { Ionicons } from '@expo/vector-icons'
import CustomBackButton from '@/components/CustomBackButton'
import MainButton from '@/components/MainButton'
import { useAuthStore } from '@/store/authStore'
import { useUser } from '@/hooks/useUser'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { LogBox } from 'react-native';
import { requestPresignedURl, uploadMultipleTos3, uploadTos3 } from '@/hooks/uploadTos3'
import { compressImageToJPEG } from '@/utils/imageCompression'
import { useTranslation } from 'react-i18next'
LogBox.ignoreAllLogs(false);

const { width } = Dimensions.get('window')

const EditProfile = () => {
  const { t } = useTranslation();
  const { dbUser, idToken, setDBUser } = useAuthStore()
  const { updateUser } = useUser()
  const MAX_PHOTOS = 10
  
  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [bio, setBio] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')
  const [occupation, setOccupation] = useState('')
  const [education, setEducation] = useState('')
  const [height, setHeight] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState('')
  const [photos, setPhotos] = useState<any[]>([])
  const [photoMimeTypes, setPhotoMimeTypes] = useState<string[]>([])
  const [photoURL, setPhotoURL] = useState('')
  const [isUploadingPhotoURL, setIsUploadingPhotoURL] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form with current user data
  useEffect(() => {
    if (dbUser) {
      if (dbUser.profile) {
        setFirstName(dbUser.profile.firstName || '')
        setLastName(dbUser.profile.lastName || '')
        setBio(dbUser.profile.bio || '')
        setGender((dbUser.profile.gender as 'male' | 'female' | 'other') || 'male')
        setOccupation(dbUser.profile.occupation || '')
        setEducation(dbUser.profile.education || '')
        setHeight(dbUser.profile.height?.toString() || '')
        setInterests((dbUser.profile.interests || []).map((interest: string) => interest.toLowerCase()))
        const existingPhotos = dbUser.profile.photos || []
        setPhotos(existingPhotos)
        // Set default mime types for existing S3 URLs
        setPhotoMimeTypes(existingPhotos.map(() => 'image/jpeg'))
      }
      // Initialize photoURL
      if (dbUser.photoURL) {
        setPhotoURL(dbUser.photoURL)
      }
    }
  }, [dbUser])

  // Add interest
  const addInterest = () => {
    const trimmedInterest = newInterest.trim().toLowerCase()
    if (trimmedInterest && !interests.includes(trimmedInterest) && interests.length < 10) {
      setInterests([...interests, trimmedInterest])
      setNewInterest('')
    } else if (interests.length >= 10) {
      Alert.alert(t('editProfile.limitReached'), t('editProfile.upTo10Interests'))
    }
  }

  // Remove interest
  const removeInterest = (interestToRemove: string) => {
    setInterests(interests.filter(interest => interest !== interestToRemove))
  }

  // Check if URL is a local file path (not an S3 URL)
  const isLocalPath = (url: string) => {
    return url && (url.startsWith('file://') || url.startsWith('content://') || url.startsWith('ph://'))
  }

  // Check for duplicate images
  const isDuplicateImage = (newUri: string, existingPhotos: any[]) => {
    return existingPhotos.some(photo => {
      const photoUrl = typeof photo === 'string' ? photo : photo.url
      // For local paths, compare the full URI
      if (isLocalPath(photoUrl) && isLocalPath(newUri)) {
        return photoUrl === newUri
      }
      // For S3 URLs, we can't easily detect duplicates, so skip
      return false
    })
  }

  // Pick image from gallery
  const pickImage = async () => {
    const maxPhotos = MAX_PHOTOS
    if (photos.length >= maxPhotos) {
      Alert.alert(t('editProfile.limitReached'), `You can add up to ${maxPhotos} photos`)
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: maxPhotos - photos.length,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newPhotos: any[] = []
      const newMimeTypes: string[] = []
      const remainingSlots = maxPhotos - photos.length
      
      if (remainingSlots <= 0) {
        Alert.alert(t('editProfile.limitReached'), `You can add up to ${maxPhotos} photos`)
        return
      }
      
      // Limit the number of photos that can be added
      const photosToAdd = result.assets.slice(0, remainingSlots)
      
      for (const asset of photosToAdd) {
        const localUri = asset.uri
        
        // Check for duplicates
        if (isDuplicateImage(localUri, photos)) {
          Alert.alert(t('editProfile.duplicateImage'), t('editProfile.imageAlreadySelected'))
          continue
        }

        const newPhoto = {
          url: localUri,
          isPrimary: photos.length === 0 && newPhotos.length === 0,
          uploadedAt: new Date().toISOString()
        }
        newPhotos.push(newPhoto)
        newMimeTypes.push(asset.mimeType || 'image/jpeg')
      }

      if (newPhotos.length > 0) {
        const totalPhotos = photos.length + newPhotos.length
        if (totalPhotos > maxPhotos) {
          // This shouldn't happen, but add a safety check
          const photosToKeep = newPhotos.slice(0, maxPhotos - photos.length)
          const mimeTypesToKeep = newMimeTypes.slice(0, maxPhotos - photos.length)
          setPhotos([...photos, ...photosToKeep])
          setPhotoMimeTypes([...photoMimeTypes, ...mimeTypesToKeep])
          Alert.alert(t('editProfile.limitReached'), `You can add up to ${maxPhotos} photos`)
        } else {
          setPhotos([...photos, ...newPhotos])
          setPhotoMimeTypes([...photoMimeTypes, ...newMimeTypes])
        }
      }
      
      // Warn if user tried to select more than allowed
      if (result.assets.length > remainingSlots) {
        Alert.alert(
          t('editProfile.limitReached'), 
          `You can add up to ${maxPhotos} photos. Only ${remainingSlots} ${remainingSlots === 1 ? 'photo' : 'photos'} added.`
        )
      }
    }
  }

  // Remove photo
  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newMimeTypes = photoMimeTypes.filter((_, i) => i !== index)
    // If we removed the primary photo, make the first remaining photo primary
    if (photos[index]?.isPrimary && newPhotos.length > 0) {
      newPhotos[0].isPrimary = true
    }
    setPhotos(newPhotos)
    setPhotoMimeTypes(newMimeTypes)
  }

  // Upload profile picture (photoURL)
  const uploadProfilePicture = async (imageUri: string) => {
    try {
      setIsUploadingPhotoURL(true);
      
      // Check if it's already an S3 URL
      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        setPhotoURL(imageUri);
        setIsUploadingPhotoURL(false);
        return imageUri;
      }

      // Compress the image
      const compressed = await compressImageToJPEG(imageUri, 0.8);
      
      // Request presigned URL
      const presignedUrls = await requestPresignedURl([compressed.mimeType]);
      
      if (!presignedUrls || presignedUrls.length === 0) {
        throw new Error('Failed to get presigned URL');
      }

      const { uploadUrl, fileURL } = presignedUrls[0];

      // Upload to S3
      const uploadSuccess = await uploadTos3(
        compressed.uri,
        uploadUrl,
        compressed.mimeType
      );

      if (!uploadSuccess) {
        throw new Error('Failed to upload image');
      }

      // Clean up compressed file if different from original
      if (compressed.uri !== imageUri) {
        try {
          await FileSystem.deleteAsync(compressed.uri, { idempotent: true });
        } catch (cleanupError) {
          console.warn('Failed to clean up compressed file:', cleanupError);
        }
      }

      setPhotoURL(fileURL);
      setIsUploadingPhotoURL(false);
      return fileURL;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setIsUploadingPhotoURL(false);
      Alert.alert(t('editProfile.error'), t('editProfile.failedToUploadImage'));
      throw error;
    }
  };

  // Pick profile picture
  const pickProfilePicture = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(t('editProfile.permissionRequired'), t('editProfile.cameraRollPermission'));
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedUri = result.assets[0].uri;
        await uploadProfilePicture(selectedUri);
      }
    } catch (error) {
      Alert.alert(t('editProfile.error'), t('editProfile.failedToSelectImage'));
    }
  };

  // Take profile picture
  const takeProfilePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(t('editProfile.permissionRequired'), t('editProfile.cameraPermission'));
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedUri = result.assets[0].uri;
        await uploadProfilePicture(selectedUri);
      }
    } catch (error) {
      Alert.alert(t('editProfile.error'), t('editProfile.failedToTakePhoto'));
    }
  };

  const showProfilePictureOptions = () => {
    Alert.alert(
      t('editProfile.selectProfilePicture'),
      t('editProfile.chooseOption'),
      [
        {
          text: t('editProfile.chooseFromLibrary'),
          onPress: pickProfilePicture,
        },
        {
          text: t('editProfile.takePhoto'),
          onPress: takeProfilePicture,
        },
        {
          text: t('editProfile.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  // Save profile
  const saveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(t('editProfile.error'), t('editProfile.firstNameLastNameRequired'))
      return
    }

    if (!idToken) {
      Alert.alert(t('editProfile.error'), t('editProfile.authTokenNotFound'))
      return
    }

    // Validate minimum 2 images
    if (photos.length < 2) {
      Alert.alert(t('editProfile.error'), t('editProfile.uploadAtLeast2Photos'))
      return
    }

    setIsLoading(true)
    try {
      // Separate existing S3 URLs from new local images
      const existingS3Photos: any[] = []
      const newLocalPhotos: { photo: any; mimeType: string; index: number }[] = []
      
      photos.forEach((photo, index) => {
        const photoUrl = typeof photo === 'string' ? photo : photo.url
        if (isLocalPath(photoUrl)) {
          newLocalPhotos.push({
            photo,
            mimeType: photoMimeTypes[index] || 'image/jpeg',
            index
          })
        } else {
          // It's already an S3 URL, keep it as is
          existingS3Photos.push(photo)
        }
      })

      let finalPhotos: any[] = [...existingS3Photos]

      // Upload new local images to S3
      if (newLocalPhotos.length > 0) {
        console.log('🔄 Compressing images for profile...');
        
        // Step 1: Compress all new images
        const compressedPhotos: { photo: any; mimeType: string; index: number; compressedUri: string }[] = [];
        
        for (let i = 0; i < newLocalPhotos.length; i++) {
          const item = newLocalPhotos[i];
          const photoUrl = typeof item.photo === 'string' ? item.photo : item.photo.url;
          
          try {
            const compressed = await compressImageToJPEG(
              photoUrl,
              0.8  // Good quality for profile photos
            );
            
            compressedPhotos.push({
              ...item,
              compressedUri: compressed.uri,
              mimeType: compressed.mimeType
            });
            
            // Log compression stats
            const originalInfo = await FileSystem.getInfoAsync(photoUrl);
            if (originalInfo.exists && compressed.size) {
              const originalSize = (originalInfo as any).size;
              const compressionRatio = ((1 - compressed.size / originalSize) * 100).toFixed(1);
              console.log(`📊 Image ${i + 1}: ${(originalSize / (1024 * 1024)).toFixed(2)}MB → ${(compressed.size / (1024 * 1024)).toFixed(2)}MB (${compressionRatio}% reduction)`);
            }
          } catch (compressionError) {
            console.error(`⚠️ Image ${i + 1} compression failed, using original:`, compressionError);
            compressedPhotos.push({
              ...item,
              compressedUri: photoUrl,
              mimeType: item.mimeType
            });
          }
        }
        
        console.log('✅ All images compressed successfully');
        
        // Step 2: Get MIME types for compressed images
        const mimeTypes = compressedPhotos.map(item => item.mimeType);
        
        // Step 3: Request presigned URLs
        const presignedUrls = await requestPresignedURl(mimeTypes);
        
        if (!presignedUrls || presignedUrls.length !== compressedPhotos.length) {
          Alert.alert(t('editProfile.error'), t('editProfile.failedToGetUploadUrls'));
          setIsLoading(false);
          return;
        }

        // Step 4: Prepare compressed files for upload
        const filesToUpload = compressedPhotos.map((item, i) => ({
          LocalUrl: item.compressedUri,
          PresignedUrl: presignedUrls[i].uploadUrl,
          MimeType: item.mimeType
        }));

        // Step 5: Upload compressed images to S3
        const uploadResults = await uploadMultipleTos3(filesToUpload);
        
        // Check if all uploads succeeded
        const allSucceeded = uploadResults.every(result => 
          result && (result.status === 200 || result.status === 204)
        );

        if (!allSucceeded) {
          Alert.alert(t('editProfile.error'), t('editProfile.someImagesFailedToUpload'));
          setIsLoading(false);
          return;
        }

        // Step 6: Map new local photos to their S3 URLs, preserving structure
        const newS3Photos = compressedPhotos.map((item, i) => {
          const s3Url = presignedUrls[i].fileURL;
          // If photo is an object, preserve its structure
          if (typeof item.photo === 'object' && item.photo !== null) {
            return {
              ...item.photo,
              url: s3Url
            };
          }
          // Otherwise, just return the S3 URL
          return s3Url;
        });

        finalPhotos = [...existingS3Photos, ...newS3Photos];
        
        // Step 7: Clean up temporary compressed files
        for (let i = 0; i < compressedPhotos.length; i++) {
          const originalUrl = typeof newLocalPhotos[i].photo === 'string' ? newLocalPhotos[i].photo : newLocalPhotos[i].photo.url;
          if (compressedPhotos[i].compressedUri !== originalUrl) {
            try {
              await FileSystem.deleteAsync(compressedPhotos[i].compressedUri, { idempotent: true });
              console.log(`🗑️ Cleaned up compressed file ${i + 1}`);
            } catch (cleanupError) {
              console.warn(`⚠️ Failed to clean up compressed file ${i + 1}:`, cleanupError);
            }
          }
        }
      }

      // Ensure at least one photo is marked as primary
      if (finalPhotos.length > 0) {
        const hasPrimary = finalPhotos.some(photo => 
          typeof photo === 'object' && photo?.isPrimary
        )
        if (!hasPrimary) {
          if (typeof finalPhotos[0] === 'object') {
            finalPhotos[0].isPrimary = true
          }
        }
      }

      const profileData: any = {
        profile: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          bio: bio.trim() || undefined,
          gender,
          occupation: occupation.trim() || undefined,
          education: education.trim() || undefined,
          height: height ? parseInt(height) : undefined,
          interests: interests.length > 0 ? interests.map(interest => interest.toLowerCase()) : undefined,
          photos: finalPhotos
        }
      }

      // Include photoURL if it has been set
      if (photoURL) {
        profileData.photoURL = photoURL;
      }

      const response = await updateUser(idToken, profileData)
      
      if (response?.success) {
        // Update the user in the store
        setDBUser(response.data)
        Alert.alert(t('editProfile.success'), t('editProfile.profileUpdatedSuccessfully'), [
          { text: t('editProfile.ok'), onPress: () => router.back() }
        ])
      } else {
        Alert.alert(t('editProfile.error'), response?.message || t('editProfile.failedToUpdateProfile'))
      }
    } catch (error: any) {
      console.error('Update profile error:', error)
      const errorMessage = error?.response?.data?.message || error?.message || t('editProfile.failedToUpdateProfile')
      Alert.alert(t('editProfile.error'), errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomBackButton />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <ThemedText type='title' style={styles.headerTitle}>{t('editProfile.editProfile')}</ThemedText>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={Colors.primaryBackgroundColor} />
            <ThemedText style={styles.sectionTitle}>{t('editProfile.basicInformation')}</ThemedText>
          </View>

          {/* Profile Picture (photoURL) */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{t('editProfile.profilePicture')}</ThemedText>
            <View style={styles.profilePictureContainer}>
              <TouchableOpacity 
                onPress={showProfilePictureOptions} 
                style={styles.profilePictureButton}
                disabled={isUploadingPhotoURL}
              >
                {photoURL ? (
                  <View style={styles.profilePictureWrapper}>
                    <Image source={{ uri: photoURL }} style={styles.profilePictureImage} />
                    {isUploadingPhotoURL && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                      </View>
                    )}
                    
                  </View>
                ) : (
                  <View style={styles.profilePicturePlaceholder}>
                    <Ionicons name="person" size={40} color={Colors.secondaryForegroundColor} />
                    <Ionicons name="camera" size={20} color={Colors.primaryBackgroundColor} style={styles.cameraIconPlaceholder} />
                  </View>
                )}
              </TouchableOpacity>
              {photoURL && (
                <TouchableOpacity 
                  style={styles.editPhotoButton}
                  onPress={showProfilePictureOptions}
                >
                  <Ionicons name="create-outline" size={16} color={Colors.primaryBackgroundColor} />
                  <ThemedText style={styles.editPhotoText}>{t('editProfile.editPhoto')}</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{t('editProfile.firstName')}</ThemedText>
            <TextInput
              style={styles.textInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('editProfile.enterFirstName')}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{t('editProfile.lastName')}</ThemedText>
            <TextInput
              style={styles.textInput}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t('editProfile.enterLastName')}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <ThemedText style={styles.inputLabel}>{t('editProfile.bio')}</ThemedText>
              <ThemedText style={styles.characterCount}>{bio.length}/500</ThemedText>
            </View>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={bio}
              onChangeText={(text) => {
                if (text.length <= 500) {
                  setBio(text)
                }
              }}
              placeholder={t('editProfile.tellUsAboutYourself')}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{t('editProfile.gender')}</ThemedText>
            <View style={styles.genderContainer}>
              {['male', 'female', 'other'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    gender === option && styles.genderOptionSelected
                  ]}
                  onPress={() => setGender(option as 'male' | 'female' | 'other')}
                >
                  <ThemedText style={[
                    styles.genderText,
                    gender === option && styles.genderTextSelected
                  ]}>
                    {option === 'male' ? t('editProfile.male') : option === 'female' ? t('editProfile.female') : t('editProfile.other')}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primaryBackgroundColor} />
            <ThemedText style={styles.sectionTitle}>{t('editProfile.details')}</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{t('editProfile.occupation')}</ThemedText>
            <TextInput
              style={styles.textInput}
              value={occupation}
              onChangeText={setOccupation}
              placeholder={t('editProfile.whatDoYouDo')}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{t('editProfile.education')}</ThemedText>
            <TextInput
              style={styles.textInput}
              value={education}
              onChangeText={setEducation}
              placeholder={t('editProfile.educationBackground')}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{t('editProfile.height')}</ThemedText>
            <TextInput
              style={styles.textInput}
              value={height}
              onChangeText={setHeight}
              placeholder={t('editProfile.heightInCm')}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart-outline" size={20} color={Colors.primaryBackgroundColor} />
            <ThemedText style={styles.sectionTitle}>{t('editProfile.interests')}</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{t('editProfile.addInterest')}</ThemedText>
            <View style={styles.addInterestContainer}>
              <TextInput
                style={[styles.textInput, styles.addInterestInput]}
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder={t('editProfile.enterAnInterest')}
                placeholderTextColor="#999"
                onSubmitEditing={addInterest}
              />
              <TouchableOpacity style={styles.addButton} onPress={addInterest}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {interests.length > 0 && (
            <View style={styles.interestsContainer}>
              {interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <ThemedText style={styles.interestText}>{interest}</ThemedText>
                  <TouchableOpacity
                    style={styles.removeInterestButton}
                    onPress={() => removeInterest(interest)}
                  >
                    <Ionicons name="close" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="images-outline" size={20} color={Colors.primaryBackgroundColor} />
            <ThemedText style={styles.sectionTitle}>{t('editProfile.photos')}</ThemedText>
          </View>
          <View style={styles.photoCountContainer}>
            <ThemedText style={styles.photoCountText}>
              {photos.length}/{MAX_PHOTOS} photos (Minimum 2 required)
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
            <Ionicons name="camera-outline" size={24} color={Colors.primaryBackgroundColor} />
            <ThemedText style={styles.addPhotoText}>{t('editProfile.addPhoto')}</ThemedText>
          </TouchableOpacity>

          {photos.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photosScroll}
              contentContainerStyle={styles.photosContainer}
            >
              {photos.map((photo, index) => {
                const photoUrl = typeof photo === 'string' ? photo : photo.url
                const allPhotos = photos.map(p => typeof p === 'string' ? p : p.url).filter(url => url)
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.photoItem}
                    onPress={() => {
                      if (allPhotos.length > 0) {
                        router.push({
                          pathname: '/imageGallery',
                          params: {
                            photos: JSON.stringify(allPhotos),
                            initialIndex: index.toString()
                          }
                        })
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: photoUrl }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={(e) => {
                        e.stopPropagation()
                        removePhoto(index)
                      }}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF4444" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          )}
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <MainButton
            title={t('editProfile.saveChanges')}
            onPress={saveProfile}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parentBackgroundColor,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    color: Colors.titleColor,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    marginLeft: 8,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'HellixMedium',
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  genderOptionSelected: {
    backgroundColor: Colors.primaryBackgroundColor,
    borderColor: Colors.primaryBackgroundColor,
  },
  genderText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  genderTextSelected: {
    color: '#FFFFFF',
  },
  addInterestContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  addInterestInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: Colors.primaryBackgroundColor,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  interestText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginRight: 6,
  },
  removeInterestButton: {
    padding: 2,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryBackgroundColor,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 16,
  },
  addPhotoText: {
    fontSize: 16,
    color: Colors.primaryBackgroundColor,
    fontWeight: '600',
    marginLeft: 8,
  },
  photosScroll: {
    maxHeight: 220,
  },
  photosContainer: {
    paddingHorizontal: 0,
    gap: 12,
    paddingRight: 20,
  },
  photoItem: {
    width: 150,
    height: 195,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 0,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  photoCountContainer: {
    marginBottom: 12,
  },
  photoCountText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  profilePictureContainer: {
    alignItems: 'center',
  },
  profilePictureButton: {
    marginBottom: 12,
  },
  profilePictureWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.secondaryBackgroundColor,
  },
  profilePictureImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.secondaryBackgroundColor,
    borderWidth: 3,
    borderColor: Colors.secondaryBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primaryBackgroundColor,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraIconPlaceholder: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryBackgroundColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editPhotoText: {
    fontSize: 14,
    color: Colors.primaryBackgroundColor,
    fontWeight: '600',
  },
})

export default EditProfile
