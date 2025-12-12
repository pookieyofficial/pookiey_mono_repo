import React from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../../../../constants/Colors'
import { ThemedText } from '@/components/ThemedText'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/store/authStore'
import { truncateText } from '@/utils/truncateTexts'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '@/components/LanguageSelector'
import { useOnboardingStore } from '@/store/onboardingStore'

const Settings = () => {
  const { t } = useTranslation();
  const { dbUser } = useAuthStore()
  const { setLanguage } = useOnboardingStore()

  const handleButtonPress = (buttonName: string) => {
    console.log(`${buttonName} pressed`)
    
    if (buttonName === 'Dating Preference') {
      router.push('/(home)/(tabs)/(setting)/datingPreferences')
    }
    if (buttonName === 'Refer') {
      router.push('/(home)/(tabs)/(setting)/refer_screen')
    }
    // Add navigation logic for other buttons here
  }

  const handleProfilePress = () => {
    router.push('/(home)/(tabs)/(setting)/profile')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Settings Header */}
      <View style={styles.headerSection}>
        <ThemedText type='title' style={styles.headerTitle}>{t('settings.settings')}</ThemedText>
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileCard}
            onPress={handleProfilePress}
            activeOpacity={0.8}>

            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: dbUser?.photoURL }}
                style={styles.profileImage}
              />
            </View>

            <View style={styles.profileInfo}>
              {dbUser?.displayName && (
                <ThemedText type='bold' style={styles.profileName}>
                  {dbUser?.profile?.firstName} {dbUser?.profile?.lastName}
                </ThemedText>
              )}

              {dbUser?.profile?.bio ? (
                <ThemedText style={styles.profileStatus}>
                  {dbUser.profile.bio}
                </ThemedText>
              ) : (
                dbUser?.email && (
                  <ThemedText style={styles.profileStatus}>
                    {truncateText(dbUser.email, 10)}
                  </ThemedText>
                )
              )}
            </View>

            <View style={styles.profileArrow}>
              <Ionicons name="chevron-forward" size={20} color={Colors.primary.red} />
            </View>

          </TouchableOpacity>
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleButtonPress('Dating Preference')}
            activeOpacity={0.7}>

            <View style={styles.settingIconContainer}>
              <Ionicons name="heart-outline" size={24} color={Colors.primary.red} />
            </View>

            <ThemedText style={styles.settingText}>{t('settings.datingPreference')}</ThemedText>

            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <View style={styles.decorativeBorder} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleButtonPress('Refer')}
            activeOpacity={0.7}>

            <View style={styles.settingIconContainer}>
              <Ionicons name="gift-outline" size={24} color={Colors.primary.red} />
            </View>

            <ThemedText style={styles.settingText}>Invite & Refer</ThemedText>

            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <View style={styles.decorativeBorder} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleButtonPress('Setting')}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="settings-outline" size={24} color={Colors.primary.red} />
            </View>
            <ThemedText style={styles.settingText}>{t('settings.accountSettings')}</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <View style={styles.decorativeBorder} />

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="language-outline" size={24} color={Colors.primary.red} />
            </View>
            <ThemedText style={styles.settingText}>{t('settings.language')}</ThemedText>
            <View style={{ marginLeft: 'auto' }}>
              <LanguageSelector store={{ setLanguage }} />
            </View>
          </View>

          <View style={styles.decorativeBorder} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleButtonPress('Help Center')}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="help-circle-outline" size={24} color={Colors.primary.red} />
            </View>
            <ThemedText style={styles.settingText}>{t('settings.helpCenter')}</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <View style={styles.decorativeBorder} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleButtonPress('Privacy Policy')}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="shield-outline" size={24} color={Colors.primary.red} />
            </View>
            <ThemedText style={styles.settingText}>{t('settings.privacyPolicy')}</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
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
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    color: Colors.titleColor,
  },
  profileSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: Colors.primary.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    color: Colors.titleColor,
    lineHeight: 24,
  },
  profileStatus: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginTop: 2,
  },
  profileArrow: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsList: {
    paddingHorizontal: 16,
  },
  settingItem: {
    backgroundColor: Colors.primary.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: Colors.titleColor,
    marginLeft: 12,
  },
  decorativeBorder: {
    height: 0,
    backgroundColor: Colors.primary.red,
    marginVertical: 4,
    marginHorizontal: 20,
    borderRadius: 0.5,
    opacity: 0.3,
  },
})

export default Settings