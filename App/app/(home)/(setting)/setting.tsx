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
import { Colors } from '../../../constants/Colors'
import { ThemedText } from '@/components/ThemedText'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/store/authStore'

const Settings = () => {

  const { dbUser } = useAuthStore()

  const handleButtonPress = (buttonName: string) => {
    console.log(`${buttonName} pressed`)
    // Add navigation logic here
  }

  const handleProfilePress = () => {
    router.push('/(home)/(setting)/profile')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Settings Header */}
        <View style={styles.headerSection}>
          <ThemedText type='title' style={styles.headerTitle}>Settings</ThemedText>
        </View>

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

            {dbUser?.displayName && <View style={styles.profileInfo}>
              <ThemedText type='bold' style={styles.profileName}>{dbUser?.displayName}</ThemedText>
            </View>}

            {dbUser?.profile?.bio && <View style={styles.profileInfo}>
              <ThemedText style={styles.profileStatus}>{dbUser?.profile?.bio}</ThemedText>
              <ThemedText style={styles.profileStatus}>{dbUser?.profile?.bio}</ThemedText>
            </View>}

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

            <ThemedText style={styles.settingText}>Dating Preference</ThemedText>
             
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
            <ThemedText style={styles.settingText}>Account Settings</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <View style={styles.decorativeBorder} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleButtonPress('Help Center')}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="help-circle-outline" size={24} color={Colors.primary.red} />
            </View>
            <ThemedText style={styles.settingText}>Help Center</ThemedText>
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
            <ThemedText style={styles.settingText}>Privacy Policy</ThemedText>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
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
    borderWidth: 1,
    borderColor: Colors.text.light,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 40,
  },
  heartIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary.red,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    color: Colors.titleColor,
    marginBottom: 6,
  },
  profileStatus: {
    fontSize: 15,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  profileArrow: {
    padding: 8,
    borderRadius: 20,
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
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.text.light,
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
    fontWeight: '500',
    marginLeft: 12,
  },
  decorativeBorder: {
    height: 0,
    backgroundColor: Colors.primary.red,
    marginVertical: 8,
    marginHorizontal: 20,
    borderRadius: 0.5,
    opacity: 0.3,
  },
})

export default Settings