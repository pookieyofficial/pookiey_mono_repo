import React, { useState, useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import { ThemedText } from '@/components/ThemedText'
import UserProfileView from '@/components/UserProfileView'
import { DBUser } from '@/types/Auth'
import { useTranslation } from 'react-i18next'
import CustomDialog, { DialogType } from '@/components/CustomDialog'

const UserProfile = () => {
  const { t } = useTranslation();
  const { userData, returnToStory } = useLocalSearchParams<{ userData?: string; returnToStory?: string }>()
  const router = useRouter()
  
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
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
          } catch (e) {
            console.error('Error parsing userData:', e)
            showDialog()
          }
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
  }, [userData])

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
    <SafeAreaView style={styles.container}>
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

