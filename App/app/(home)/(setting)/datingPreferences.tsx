import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { ThemedText } from '@/components/ThemedText'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/store/authStore'
import { useUser } from '@/hooks/useUser'
import { useLocation } from '@/hooks/useLocation'
import CustomBackButton from '@/components/CustomBackButton'
import MainButton from '@/components/MainButton'
import CustomDialog from '@/components/CustomDialog'
import Slider from '@react-native-community/slider'

const DatingPreferences = () => {
  const { dbUser, idToken, setDBUser } = useAuthStore()
  const { updateUser } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    hasPermission,
    location,
    address,
    requestLocationPermission,
    clearError
  } = useLocation()

  const [minAge, setMinAge] = useState(18)
  const [maxAge, setMaxAge] = useState(50)
  const [distance, setDistance] = useState(50)
  const [showLocationDialog, setShowLocationDialog] = useState(false)

  useEffect(() => {
    // Load existing preferences
    if (dbUser?.preferences) {
      setMinAge(dbUser.preferences.ageRange?.[0] || 18)
      setMaxAge(dbUser.preferences.ageRange?.[1] || 50)
      setDistance(dbUser.preferences.distanceMaxKm || 50)
    }
  }, [dbUser])

  const handleUpdateLocation = async () => {
    if (!location) {
      Alert.alert('No Location', 'Please allow location access to update your location')
      return
    }

    if (!idToken) {
      Alert.alert('Error', 'Authentication token not found. Please log in again.')
      return
    }

    try {
      const profileData = {
        profile: {
          location: {
            type: "Point" as const,
            coordinates: [location.coords.longitude, location.coords.latitude],
            city: address,
          }
        }
      }

      const response = await updateUser(idToken, profileData)

      if (response?.success) {
        setDBUser(response.data)
        Alert.alert('Success', 'Location updated successfully')
      } else {
        Alert.alert('Error', response?.message || 'Failed to update location')
      }
    } catch (error: any) {
      console.error('Update location error:', error)
      Alert.alert('Error', error?.message || 'Failed to update location')
    }
  }

  const handleRequestLocation = async () => {
    clearError()
    const success = await requestLocationPermission()
    if (!success) {
      setShowLocationDialog(true)
    } else {
      setShowLocationDialog(false)
      await handleUpdateLocation()
    }
  }

  const handleSave = async () => {
    if (minAge >= maxAge) {
      Alert.alert('Invalid Age Range', 'Minimum age must be less than maximum age')
      return
    }

    if (!idToken) {
      Alert.alert('Error', 'Authentication token not found. Please log in again.')
      return
    }

    setIsLoading(true)
    try {
      const preferencesData = {
        preferences: {
          ageRange: [minAge, maxAge],
          distanceMaxKm: distance,
          showMe: dbUser?.preferences?.showMe || ['male', 'female', 'other']
        }
      }

      const response = await updateUser(idToken, preferencesData)

      if (response?.success) {
        setDBUser(response.data)
        Alert.alert('Success', 'Preferences updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ])
      } else {
        Alert.alert('Error', response?.message || 'Failed to update preferences')
      }
    } catch (error: any) {
      console.error('Update preferences error:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update preferences'
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
      >
        <View style={styles.content}>
          {/* Header */}
          <ThemedText type="title" style={styles.title}>
            Preferences
          </ThemedText>
          

          {/* Age Range Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-outline" size={24} color={Colors.primary.red} />
              <ThemedText style={styles.sectionTitle}>Age Range</ThemedText>
            </View>
            
            {/* Min and Max Age Display */}
            <View style={styles.valueRow}>
              <View style={styles.valueContainer}>
                <ThemedText style={styles.valueLabel}>Min Age</ThemedText>
                <ThemedText type="bold" style={styles.valueText}>{minAge}</ThemedText>
              </View>
              
              <View style={styles.valueContainer}>
                <ThemedText style={styles.valueLabel}>Max Age</ThemedText>
                <ThemedText type="bold" style={styles.valueText}>{maxAge}</ThemedText>
              </View>
            </View>

            {/* Sliders */}
            <View style={styles.sliderContainer}>
              <ThemedText style={styles.sliderLabel}>Minimum Age: {minAge}</ThemedText>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={64}
                value={minAge}
                onValueChange={setMinAge}
                minimumTrackTintColor={Colors.primary.red}
                maximumTrackTintColor={Colors.text.light}
                thumbTintColor={Colors.primary.red}
                step={1}
              />
            </View>

            <View style={styles.sliderContainer}>
              <ThemedText style={styles.sliderLabel}>Maximum Age: {maxAge}</ThemedText>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={65}
                value={maxAge}
                onValueChange={setMaxAge}
                minimumTrackTintColor={Colors.primary.red}
                maximumTrackTintColor={Colors.text.light}
                thumbTintColor={Colors.primary.red}
                step={1}
              />
            </View>
          </View>

          {/* Distance Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={24} color={Colors.primary.red} />
              <ThemedText style={styles.sectionTitle}>Maximum Distance</ThemedText>
            </View>

            <View style={styles.valueRow}>
              <View style={styles.valueContainer}>
                <ThemedText style={styles.valueLabel}>Distance</ThemedText>
                <ThemedText type="bold" style={styles.valueText}>{distance} km</ThemedText>
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <ThemedText style={styles.sliderLabel}>Distance: {distance} km</ThemedText>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={100}
                value={distance}
                onValueChange={setDistance}
                minimumTrackTintColor={Colors.primary.red}
                maximumTrackTintColor={Colors.text.light}
                thumbTintColor={Colors.primary.red}
                step={1}
              />
            </View>
          </View>

          {/* Location Update Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="navigate-outline" size={24} color={Colors.primary.red} />
              <ThemedText style={styles.sectionTitle}>Update Location</ThemedText>
            </View>

            <ThemedText style={styles.locationDescription}>
              Update your location to see nearby users and connect with people around you
            </ThemedText>

            <TouchableOpacity
              style={styles.updateLocationButton}
              onPress={handleRequestLocation}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={20} color={Colors.primary.red} />
              <ThemedText style={styles.updateLocationButtonText}>Update Location</ThemedText>
            </TouchableOpacity>

            {address && (
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={16} color={Colors.text.secondary} />
                <ThemedText style={styles.locationText}>{address}</ThemedText>
              </View>
            )}
          </View>

          {/* Save Button */}
          <MainButton
            title="Save Preferences"
            onPress={handleSave}
            disabled={isLoading}
          />
        </View>
      </ScrollView>

      <CustomDialog
        visible={showLocationDialog}
        type="error"
        message="Unable to access location. Please allow location access in your device settings to update your location."
        onDismiss={() => {
          setShowLocationDialog(false)
          clearError()
        }}
        primaryButton={{
          text: "Try Again",
          onPress: () => {
            setShowLocationDialog(false)
            clearError()
            handleRequestLocation()
          }
        }}
      />
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
  content: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
    color: Colors.titleColor,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 30,
  },
  section: {
    backgroundColor: Colors.primary.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginLeft: 12,
    color: Colors.titleColor,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  valueContainer: {
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  valueText: {
    fontSize: 28,
    color: Colors.primary.red,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 16,
    color: Colors.titleColor,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  locationDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  updateLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.white,
    borderWidth: 1,
    borderColor: Colors.primary.red,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  updateLocationButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.primary.red,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.parentBackgroundColor,
    borderRadius: 8,
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text.secondary,
  },
})

export default DatingPreferences
