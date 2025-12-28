import React, { useState } from 'react'
import {
  View,
  StyleSheet,
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
import CustomLoader from '@/components/CustomLoader'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'

const UpdateLocation = () => {
  const { dbUser, idToken, setDBUser } = useAuthStore()
  const { updateUser } = useUser()
  const {
    isLoading,
    hasPermission,
    location,
    address,
    error,
    requestLocationPermission,
    clearError
  } = useLocation()

  const [isUpdating, setIsUpdating] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  const handleUpdateLocation = async () => {
    if (!location) {
      Alert.alert('No Location', 'Please allow location access to update your location')
      return
    }

    if (!idToken) {
      Alert.alert('Error', 'Authentication token not found. Please log in again.')
      return
    }

    setIsUpdating(true)
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
        Alert.alert('Success', 'Location updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ])
      } else {
        Alert.alert('Error', response?.message || 'Failed to update location')
      }
    } catch (error: any) {
      // console.error('Update location error:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update location'
      Alert.alert('Error', errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRequestLocation = async () => {
    clearError()
    const success = await requestLocationPermission()
    if (!success) {
      setShowErrorDialog(true)
    }
  }

  if (!hasPermission || !location) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomBackButton />
        <View style={styles.content}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              <View style={[styles.circle, styles.circle1]} />
              <View style={[styles.circle, styles.circle2]} />
              <View style={[styles.circle, styles.circle3]} />
              <View style={styles.locationPinContainer}>
                <Ionicons name="location" size={60} color="white" />
              </View>
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <ThemedText type="title" style={styles.title}>
              Update Your Location
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Update your location to see nearby users and connect with people around you
            </ThemedText>
          </View>

          <View style={styles.spacer} />

          {/* Action Button */}
          <MainButton
            title={isLoading ? "Getting location..." : "Allow location"}
            onPress={handleRequestLocation}
            disabled={isLoading}
          />
        </View>

        <CustomDialog
          visible={showErrorDialog}
          type="error"
          message="Unable to access location. Please allow location access in your device settings."
          onDismiss={() => {
            setShowErrorDialog(false)
            clearError()
          }}
          primaryButton={{
            text: "Try Again",
            onPress: () => {
              setShowErrorDialog(false)
              clearError()
              handleRequestLocation()
            }
          }}
        />
      </SafeAreaView>
    )
  }

  const mapRegion = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomBackButton />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Your Location
          </ThemedText>
          <ThemedText style={styles.addressText}>
            {address || 'Current location'}
          </ThemedText>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={false}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
              description={address || "Current location"}
            />
          </MapView>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary.red} />
          <ThemedText style={styles.infoText}>
            Your location will be used to show you nearby users. You can update it anytime.
          </ThemedText>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRequestLocation}
            disabled={isUpdating || isLoading}
          >
            <Ionicons name="refresh-outline" size={20} color={Colors.primary.red} />
            <ThemedText style={styles.refreshButtonText}>Refresh Location</ThemedText>
          </TouchableOpacity>

          <MainButton
            title={isUpdating ? "Updating..." : "Update Location"}
            onPress={handleUpdateLocation}
            disabled={isUpdating}
          />
        </View>
      </View>

      {isUpdating && <CustomLoader />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parentBackgroundColor,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: 200,
    height: 200,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 50,
  },
  circle1: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(229, 62, 62, 0.8)',
    top: 20,
    left: 40,
  },
  circle2: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(229, 62, 62, 0.6)',
    top: 10,
    right: 30,
  },
  circle3: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(229, 62, 62, 0.4)',
    bottom: 30,
    left: 60,
  },
  locationPinContainer: {
    zIndex: 10,
    backgroundColor: 'transparent',
    borderRadius: 40,
    padding: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 150,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 28,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  spacer: {
    flex: 0.5,
  },
  header: {
    marginBottom: 20,
  },
  addressText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  mapContainer: {
    flex: 1,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  refreshButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.primary.red,
  },
})

export default UpdateLocation
