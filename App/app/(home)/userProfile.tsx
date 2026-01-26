import React, { useState, useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import { ThemedText } from '@/components/ThemedText'
import UserProfileView from '@/components/UserProfileView'
import { DBUser } from '@/types/Auth'
import { useTranslation } from 'react-i18next'
import CustomDialog from '@/components/CustomDialog'
import { useAuth } from '@/hooks/useAuth'
import { getUserByIdAPI } from '@/APIs/userAPIs'

const UserProfile = () => {
  const { t } = useTranslation();
  const { userId, returnToStory } = useLocalSearchParams<{ userId?: string; returnToStory?: string }>()
  const router = useRouter()
  const { token } = useAuth()

  const [user, setUser] = useState<DBUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dialogVisible, setDialogVisible] = useState(false)

  const showDialog = () => {
    setDialogVisible(true)
  }

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true)
      try {
        if (!userId) {
          showDialog()
          setIsLoading(false)
          return
        }

        if (!token) {
          showDialog()
          setIsLoading(false)
          return
        }

        // Always fetch fresh user data from API
        const response = await getUserByIdAPI(userId, token)
        if (response.success && response.data) {
          setUser(response.data as DBUser)
        } else {
          showDialog()
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
        showDialog()
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [userId, token])

  const handleBack = () => {
    if (returnToStory === 'true') {
      router.push('/(home)/(tabs)/(story)/' as any);
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBackgroundColor} />
          <ThemedText style={styles.loadingText}>{t('userProfileView.loadingProfile')}</ThemedText>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="default" />
      <CustomDialog
        visible={dialogVisible}
        type="error"
        title={t('userProfileView.error')}
        message={t('userProfileView.userInfoNotAvailable')}
        onDismiss={() => setDialogVisible(false)}
        primaryButton={{
          text: t('auth.ok') || 'OK',
          onPress: () => setDialogVisible(false),
        }}
      />
      <UserProfileView user={user} />
    </View>
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

