import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions
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
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(false);

const { width } = Dimensions.get('window')

const EditProfile = () => {
  const { dbUser, idToken, setDBUser } = useAuthStore()
  const { updateUser } = useUser()
  
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
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form with current user data
  useEffect(() => {
    if (dbUser?.profile) {
      setFirstName(dbUser.profile.firstName || '')
      setLastName(dbUser.profile.lastName || '')
      setBio(dbUser.profile.bio || '')
      setGender((dbUser.profile.gender as 'male' | 'female' | 'other') || 'male')
      setOccupation(dbUser.profile.occupation || '')
      setEducation(dbUser.profile.education || '')
      setHeight(dbUser.profile.height?.toString() || '')
      setInterests(dbUser.profile.interests || [])
      setPhotos(dbUser.profile.photos || [])
    }
  }, [dbUser])

  // Add interest
  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim()) && interests.length < 10) {
      setInterests([...interests, newInterest.trim()])
      setNewInterest('')
    } else if (interests.length >= 10) {
      Alert.alert('Limit Reached', 'You can add up to 10 interests')
    }
  }

  // Remove interest
  const removeInterest = (interestToRemove: string) => {
    setInterests(interests.filter(interest => interest !== interestToRemove))
  }

  // Pick image from gallery
  const pickImage = async () => {
    if (photos.length >= 6) {
      Alert.alert('Limit Reached', 'You can add up to 6 photos')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      const newPhoto = {
        url: result.assets[0].uri,
        isPrimary: photos.length === 0,
        uploadedAt: new Date().toISOString()
      }
      setPhotos([...photos, newPhoto])
    }
  }

  // Remove photo
  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    // If we removed the primary photo, make the first remaining photo primary
    if (photos[index]?.isPrimary && newPhotos.length > 0) {
      newPhotos[0].isPrimary = true
    }
    setPhotos(newPhotos)
  }

  // Save profile
  const saveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required')
      return
    }

    if (!idToken) {
      Alert.alert('Error', 'Authentication token not found. Please log in again.')
      return
    }

    // Validate height if provided
    if (height && (isNaN(parseInt(height)) || parseInt(height) < 100 || parseInt(height) > 250)) {
      Alert.alert('Error', 'Please enter a valid height between 100-250 cm')
      return
    }

    setIsLoading(true)
    try {
      const profileData = {
        profile: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          bio: bio.trim() || undefined,
          gender,
          occupation: occupation.trim() || undefined,
          education: education.trim() || undefined,
          height: height ? parseInt(height) : undefined,
          interests: interests.length > 0 ? interests : undefined,
          photos: photos.length > 0 ? photos : undefined
        }
      }

      const response = await updateUser(idToken, profileData)
      
      if (response?.success) {
        // Update the user in the store
        setDBUser(response.data)
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ])
      } else {
        Alert.alert('Error', response?.message || 'Failed to update profile')
      }
    } catch (error: any) {
      console.error('Update profile error:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile'
      Alert.alert('Error', errorMessage)
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
          <ThemedText type='title' style={styles.headerTitle}>Edit Profile</ThemedText>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={Colors.primaryBackgroundColor} />
            <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>First Name *</ThemedText>
            <TextInput
              style={styles.textInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Last Name *</ThemedText>
            <TextInput
              style={styles.textInput}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <ThemedText style={styles.inputLabel}>Bio</ThemedText>
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
              placeholder="Tell us about yourself..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Gender</ThemedText>
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
                    {option.charAt(0).toUpperCase() + option.slice(1)}
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
            <ThemedText style={styles.sectionTitle}>Details</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Occupation</ThemedText>
            <TextInput
              style={styles.textInput}
              value={occupation}
              onChangeText={setOccupation}
              placeholder="What do you do?"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Education</ThemedText>
            <TextInput
              style={styles.textInput}
              value={education}
              onChangeText={setEducation}
              placeholder="Your education background"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Height (cm)</ThemedText>
            <TextInput
              style={styles.textInput}
              value={height}
              onChangeText={setHeight}
              placeholder="Your height in cm"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart-outline" size={20} color={Colors.primaryBackgroundColor} />
            <ThemedText style={styles.sectionTitle}>Interests</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Add Interest</ThemedText>
            <View style={styles.addInterestContainer}>
              <TextInput
                style={[styles.textInput, styles.addInterestInput]}
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder="Enter an interest"
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
            <ThemedText style={styles.sectionTitle}>Photos</ThemedText>
          </View>

          <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
            <Ionicons name="camera-outline" size={24} color={Colors.primaryBackgroundColor} />
            <ThemedText style={styles.addPhotoText}>Add Photo</ThemedText>
          </TouchableOpacity>

          {photos.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photosScroll}
              contentContainerStyle={styles.photosContainer}
            >
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photo.url }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <MainButton
            title="Save Changes"
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
    fontSize: 16,
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
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  photosContainer: {
    gap: 12,
    paddingRight: 0,
  },
  photoItem: {
    width: 150,
    height: 195,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
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
})

export default EditProfile
