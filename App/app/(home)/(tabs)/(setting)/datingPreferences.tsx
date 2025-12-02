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
import { useTranslation } from 'react-i18next'

const DatingPreferences = () => {
  const { t } = useTranslation();
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
  const [showMe, setShowMe] = useState<"male" | "female">('male')
  const [showLocationDialog, setShowLocationDialog] = useState(false)

  useEffect(() => {
    // Load existing preferences
    if (dbUser?.preferences) {
      setMinAge(dbUser.preferences.ageRange?.[0] || 18)
      setMaxAge(dbUser.preferences.ageRange?.[1] || 50)
      setDistance(dbUser.preferences.distanceMaxKm || 50)
      // Get the first valid gender preference or default to 'male'
      const existingShowMe = dbUser.preferences.showMe || []
      const firstValidGender = existingShowMe.find((g) => g === 'male' || g === 'female')
      setShowMe(firstValidGender || 'male')
    }
  }, [dbUser])

  const handleUpdateLocation = async () => {
    if (!location) {
      Alert.alert(t('datingPreferences.noLocation'), t('datingPreferences.allowLocationAccess'))
      return
    }

    if (!idToken) {
      Alert.alert(t('datingPreferences.error'), t('datingPreferences.authTokenNotFound'))
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
        Alert.alert(t('datingPreferences.success'), t('datingPreferences.locationUpdatedSuccessfully'))
      } else {
        Alert.alert(t('datingPreferences.error'), response?.message || t('datingPreferences.failedToUpdateLocation'))
      }
    } catch (error: any) {
      console.error('Update location error:', error)
      Alert.alert(t('datingPreferences.error'), error?.message || t('datingPreferences.failedToUpdateLocation'))
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
    if (!idToken) {
      Alert.alert(t('datingPreferences.error'), t('datingPreferences.authTokenNotFound'))
      return
    }

    setIsLoading(true)
    try {

      const preferencesData = {
        preferences: {
          ageRange: [minAge, maxAge],
          distanceMaxKm: distance,
          showMe: [showMe]
        }
      }

      const response = await updateUser(idToken, preferencesData)

      if (response?.success) {
        setDBUser(response.data)
        Alert.alert(t('datingPreferences.success'), t('datingPreferences.preferencesUpdatedSuccessfully'), [
          { text: t('datingPreferences.ok'), onPress: () => router.back() }
        ])
      } else {
        Alert.alert(t('datingPreferences.error'), response?.message || t('datingPreferences.failedToUpdatePreferences'))
      }
    } catch (error: any) {
      console.error('Update preferences error:', error)
      const errorMessage = error?.response?.data?.message || error?.message || t('datingPreferences.failedToUpdatePreferences')
      Alert.alert(t('datingPreferences.error'), errorMessage)
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
            {t('datingPreferences.preferences')}
          </ThemedText>
          

          {/* Gender Preference Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={24} color={Colors.primary.red} />
              <ThemedText style={styles.sectionTitle}>{t('datingPreferences.showMe')}</ThemedText>
            </View>
            
            <ThemedText style={styles.genderDescription}>
              {t('datingPreferences.selectGendersInterested')}
            </ThemedText>

            <View style={styles.genderOptions}>
              {(['male', 'female'] as const).map((gender) => {
                const isSelected = showMe === gender
                return (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      isSelected && styles.genderOptionSelected
                    ]}
                    onPress={() => setShowMe(gender)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.genderRadio,
                      isSelected && styles.genderRadioSelected
                    ]}>
                      {isSelected && (
                        <View style={styles.genderRadioInner} />
                      )}
                    </View>
                    <ThemedText style={[
                      styles.genderLabel,
                      isSelected && styles.genderLabelSelected
                    ]}>
                      {gender === 'male' ? t('gender.man') : t('gender.woman')}
                    </ThemedText>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Age Range Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-outline" size={24} color={Colors.primary.red} />
              <ThemedText style={styles.sectionTitle}>{t('datingPreferences.ageRange')}</ThemedText>
            </View>
            
            {/* Min and Max Age Display */}
            <View style={styles.valueRow}>
              <View style={styles.valueContainer}>
                <ThemedText style={styles.valueLabel}>{t('datingPreferences.minAge')}</ThemedText>
                <ThemedText type="bold" style={styles.valueText}>{minAge}</ThemedText>
              </View>
              
              <View style={styles.valueContainer}>
                <ThemedText style={styles.valueLabel}>{t('datingPreferences.maxAge')}</ThemedText>
                <ThemedText type="bold" style={styles.valueText}>{maxAge}</ThemedText>
              </View>
            </View>

            {/* Sliders */}
            <View style={styles.sliderContainer}>
              <ThemedText style={styles.sliderLabel}>{t('datingPreferences.minimumAge', { age: minAge })}</ThemedText>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={Math.max(18, maxAge - 1)}
                value={minAge}
                onValueChange={(value) => {
                  // Ensure min age is always less than max age
                  if (value < maxAge) {
                    setMinAge(Math.round(value))
                  }
                }}
                minimumTrackTintColor={Colors.primary.red}
                maximumTrackTintColor={Colors.text.light}
                thumbTintColor={Colors.primary.red}
                step={1}
              />
            </View>

            <View style={styles.sliderContainer}>
              <ThemedText style={styles.sliderLabel}>{t('datingPreferences.maximumAge', { age: maxAge })}</ThemedText>
              <Slider
                style={styles.slider}
                minimumValue={Math.min(65, minAge + 1)}
                maximumValue={65}
                value={maxAge}
                onValueChange={(value) => {
                  // Ensure max age is always greater than min age
                  if (value > minAge) {
                    setMaxAge(Math.round(value))
                  }
                }}
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
              <ThemedText style={styles.sectionTitle}>{t('datingPreferences.maximumDistance')}</ThemedText>
            </View>

            <View style={styles.valueRow}>
              <View style={styles.valueContainer}>
                <ThemedText style={styles.valueLabel}>{t('datingPreferences.distance')}</ThemedText>
                <ThemedText type="bold" style={styles.valueText}>{distance} km</ThemedText>
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <ThemedText style={styles.sliderLabel}>{t('datingPreferences.distanceKm', { distance })}</ThemedText>
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
              <ThemedText style={styles.sectionTitle}>{t('datingPreferences.updateLocation')}</ThemedText>
            </View>

            <ThemedText style={styles.locationDescription}>
              {t('datingPreferences.updateLocationDescription')}
            </ThemedText>

            <TouchableOpacity
              style={styles.updateLocationButton}
              onPress={handleRequestLocation}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={20} color={Colors.primary.red} />
              <ThemedText style={styles.updateLocationButtonText}>{t('datingPreferences.updateLocationButton')}</ThemedText>
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
            title={t('datingPreferences.savePreferences')}
            onPress={handleSave}
            disabled={isLoading}
          />
        </View>
      </ScrollView>

      <CustomDialog
        visible={showLocationDialog}
        type="error"
        message={t('datingPreferences.unableToAccessLocation')}
        onDismiss={() => {
          setShowLocationDialog(false)
          clearError()
        }}
        primaryButton={{
          text: t('datingPreferences.tryAgain'),
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
  genderDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  genderOptions: {
    gap: 12,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.text.light,
    backgroundColor: Colors.primary.white,
  },
  genderOptionSelected: {
    borderColor: Colors.primary.red,
    backgroundColor: Colors.primary.red + '10',
  },
  genderRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.text.light,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.white,
  },
  genderRadioSelected: {
    borderColor: Colors.primary.red,
  },
  genderRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary.red,
  },
  genderLabel: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  genderLabelSelected: {
    color: Colors.primary.red,
    fontWeight: '600',
  },
})

export default DatingPreferences
