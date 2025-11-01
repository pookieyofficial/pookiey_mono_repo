import React, { useState, useEffect } from 'react'
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { ThemedText } from '@/components/ThemedText'
import CustomBackButton from '@/components/CustomBackButton'
import UserProfileView from '@/components/UserProfileView'
import { DBUser } from '@/types/Auth'

const UserProfile = () => {
  const { userData } = useLocalSearchParams<{ userData?: string }>()
  
  const [user, setUser] = useState<DBUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true)
      try {
        // Parse userData from params
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
          } catch (e) {
            console.error('Error parsing userData:', e)
            Alert.alert('Error', 'Failed to load user profile data')
          }
        } else {
          Alert.alert('Error', 'No user data provided')
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
        Alert.alert('Error', 'Failed to load user profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [userData])

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBackgroundColor} />
          <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <CustomBackButton /> */}
      <UserProfileView user={user} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parentBackgroundColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
})

export default UserProfile

