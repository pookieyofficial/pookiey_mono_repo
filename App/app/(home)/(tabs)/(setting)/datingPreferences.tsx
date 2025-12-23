import React, { useState, useEffect, useRef } from 'react'
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
import { useTranslation } from 'react-i18next'

// Number Input Component with Up/Down Arrows
interface NumberInputProps {
  value: number
  onIncrement: () => void
  onDecrement: () => void
  min: number
  max: number
  label: string
}

const NumberInput: React.FC<NumberInputProps & { unit?: string }> = ({
  value,
  onIncrement,
  onDecrement,
  min,
  max,
  label,
  unit,
}) => {
  const [displayValue, setDisplayValue] = React.useState(value)
  const lastValueRef = React.useRef(value)

  // Sync display value when prop value changes (e.g., from external source)
  React.useEffect(() => {
    if (value !== lastValueRef.current) {
      setDisplayValue(value)
      lastValueRef.current = value
    }
  }, [value])

  const handleIncrement = () => {
    if (displayValue >= max) return
    
    // Immediate visual update - no waiting for parent state
    const newValue = displayValue + 1
    setDisplayValue(newValue)
    lastValueRef.current = newValue
    
    // Trigger parent update immediately
    onIncrement()
  }

  const handleDecrement = () => {
    if (displayValue <= min) return
    
    // Immediate visual update - no waiting for parent state
    const newValue = displayValue - 1
    setDisplayValue(newValue)
    lastValueRef.current = newValue
    
    // Trigger parent update immediately
    onDecrement()
  }

  return (
    <View style={styles.numberInputContainer}>
      <ThemedText style={styles.numberInputLabel}>{label}</ThemedText>
      <View style={styles.numberInputRow}>
        <TouchableOpacity
          style={[styles.arrowButton, displayValue <= min && styles.arrowButtonDisabled]}
          onPress={handleDecrement}
          disabled={displayValue <= min}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-down"
            size={20}
            color={displayValue <= min ? Colors.text.tertiary : Colors.primary.red}
          />
        </TouchableOpacity>
        <View style={styles.numberDisplay}>
          <ThemedText type="bold" style={styles.numberValue}>
            {displayValue}{unit ? ` ${unit}` : ''}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.arrowButton, displayValue >= max && styles.arrowButtonDisabled]}
          onPress={handleIncrement}
          disabled={displayValue >= max}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-up"
            size={20}
            color={displayValue >= max ? Colors.text.tertiary : Colors.primary.red}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

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
            
            {/* Age Range Inputs */}
            <NumberInput
              value={minAge}
              onIncrement={() => {
                if (minAge < maxAge - 1) {
                  setMinAge(minAge + 1)
                }
              }}
              onDecrement={() => {
                if (minAge > 18) {
                  setMinAge(minAge - 1)
                }
              }}
              min={18}
              max={maxAge - 1}
              label={t('datingPreferences.minimumAge', { age: minAge })}
            />

            <View style={styles.spacer} />

            <NumberInput
              value={maxAge}
              onIncrement={() => {
                if (maxAge < 65) {
                  setMaxAge(maxAge + 1)
                }
              }}
              onDecrement={() => {
                if (maxAge > minAge + 1) {
                  setMaxAge(maxAge - 1)
                }
              }}
              min={minAge + 1}
              max={65}
              label={t('datingPreferences.maximumAge', { age: maxAge })}
            />
          </View>

          {/* Distance Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={24} color={Colors.primary.red} />
              <ThemedText style={styles.sectionTitle}>{t('datingPreferences.maximumDistance')}</ThemedText>
            </View>

            {/* Distance Input */}
            <NumberInput
              value={distance}
              onIncrement={() => {
                if (distance < 100) {
                  setDistance(distance + 1)
                }
              }}
              onDecrement={() => {
                if (distance > 1) {
                  setDistance(distance - 1)
                }
              }}
              min={1}
              max={100}
              label={t('datingPreferences.distanceKm', { distance })}
              unit="km"
            />
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
  spacer: {
    height: 16,
  },
  // Number Input Styles
  numberInputContainer: {
    marginBottom: 20,
  },
  numberInputLabel: {
    fontSize: 16,
    color: Colors.titleColor,
    marginBottom: 12,
    fontWeight: '500',
  },
  numberInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.white,
    borderWidth: 2,
    borderColor: Colors.primary.red,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  arrowButtonDisabled: {
    borderColor: Colors.text.light,
    backgroundColor: Colors.parentBackgroundColor,
    opacity: 0.5,
  },
  numberDisplay: {
    minWidth: 80,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.parentBackgroundColor,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberValue: {
    fontSize: 32,
    color: Colors.primary.red,
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
