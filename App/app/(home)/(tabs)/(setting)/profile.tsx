import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import { ThemedText } from '@/components/ThemedText'
import { Ionicons } from '@expo/vector-icons'
import CustomBackButton from '@/components/CustomBackButton'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { LogBox } from 'react-native'
import { useTranslation } from 'react-i18next'
LogBox.ignoreAllLogs(false);


const Profile = () => {
  const { t } = useTranslation();
  const { dbUser } = useAuthStore()
  const navigationRouter = useRouter()
  const { signOut } = useAuth()
  
  // Get all photos as array of URLs
  const getAllPhotos = (): string[] => {
    const photos = dbUser?.profile?.photos || []
    const photoURLs = photos.map(p => p?.url || '').filter(url => url)
    // Include photoURL if it exists and not already in photos
    if (dbUser?.photoURL && !photoURLs.includes(dbUser.photoURL)) {
      return [dbUser.photoURL, ...photoURLs]
    }
    return photoURLs
  }

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: Date | string | undefined): number | string => {
    if (!dateOfBirth) return 'N/A'
    const dob = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    return age
  }

  // Get primary photo or first photo
  const getPrimaryPhoto = (): string => {
    return dbUser?.photoURL || ''
  }

  // Get full name
  const getFullName = (): string => {
    if (dbUser?.profile?.firstName || dbUser?.profile?.lastName) {
      return `${dbUser.profile.firstName || ''} ${dbUser.profile.lastName || ''}`.trim()
    }
    return dbUser?.displayName || t('profilePage.user') || 'User'
  }

  // Get interests count
  const getInterestsCount = (): number => {
    return dbUser?.profile?.interests?.length || 0
  }

  const getInterestTags = (): string[] => {
    return dbUser?.profile?.interests?.slice(0, 3) || []
  }

  const handleSignOut = () => {
    Alert.alert(
      t('settings.signOut'),
      t('settings.areYouSureSignOut'),
      [
        {
          text: t('settings.cancel'),
          style: 'cancel'
        },
        {
          text: t('settings.signOut'),
          style: 'destructive',
          onPress: () => signOut()
        }
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <CustomBackButton />
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.primaryBackgroundColor} />
          <ThemedText style={styles.signOutText}>{t('profilePage.signOut')}</ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}

        <View style={styles.profileCard}>
          {/* Profile Image Section */}
          <View style={styles.profileImageSection}>
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={() => {
                const allPhotos = getAllPhotos()
                if (allPhotos.length > 0) {
                  navigationRouter.push({
                    pathname: '/imageGallery',
                    params: {
                      photos: JSON.stringify(allPhotos),
                      initialIndex: '0'
                    }
                  })
                }
              }}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: getPrimaryPhoto() }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>

          {/* Name and Age */}
          <View style={styles.nameSection}>
            <ThemedText style={styles.userName}>{getFullName()}</ThemedText>
            <ThemedText style={styles.userAge}>
              {typeof calculateAge(dbUser?.profile?.dateOfBirth) === 'number'
                ? `${calculateAge(dbUser?.profile?.dateOfBirth)} ${t('profilePage.yearsOld')}`
                : t('profilePage.ageNotSet')}
            </ThemedText>
          </View>

          {/* Bio */}
          {dbUser?.profile?.bio && (
            <View style={styles.bioSection}>
              <ThemedText style={styles.bioText}>{dbUser.profile.bio}</ThemedText>
            </View>
          )}

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{getInterestsCount()}</ThemedText>
              <ThemedText style={styles.statLabel}>{t('profilePage.interests')}</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{dbUser?.profile?.photos?.length || 0}</ThemedText>
              <ThemedText style={styles.statLabel}>{t('profilePage.photos')}</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {dbUser?.profile?.occupation ? '1' : '0'}
              </ThemedText>
              <ThemedText style={styles.statLabel}>{t('profilePage.occupation')}</ThemedText>
            </View>
          </View>
        </View>

        {/* Interests Section */}
        {getInterestsCount() > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-outline" size={20} color={Colors.primaryBackgroundColor} />
              <ThemedText style={styles.sectionTitle}>{t('profilePage.interests')}</ThemedText>
            </View>
            <View style={styles.tagsContainer}>
              {getInterestTags().map((interest, index) => (
                <View key={index} style={styles.tag}>
                  <ThemedText style={styles.tagText}>{interest}</ThemedText>
                </View>
              ))}
              {getInterestsCount() > 3 && (
                <View style={styles.tag}>
                  <ThemedText style={styles.tagText}>+{getInterestsCount() - 3}</ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primaryBackgroundColor} />
            <ThemedText style={styles.sectionTitle}>{t('profilePage.details')}</ThemedText>
          </View>

          {/* Gender */}
          {dbUser?.profile?.gender && typeof dbUser.profile.gender === 'string' && (
            <TouchableOpacity style={styles.detailItem} activeOpacity={0.7}>
              <View style={styles.detailLeft}>
                <Ionicons name="people-outline" size={20} color="#666" />
                <ThemedText style={styles.detailLabel}>{t('profilePage.gender')}</ThemedText>
              </View>
              <ThemedText style={styles.detailValue}>
                {dbUser.profile.gender === 'male' ? t('gender.man') : dbUser.profile.gender === 'female' ? t('gender.woman') : dbUser.profile.gender.charAt(0).toUpperCase() + dbUser.profile.gender.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Location */}
          {dbUser?.profile?.location?.city && (
            <TouchableOpacity style={styles.detailItem} activeOpacity={0.7}>
              <View style={styles.detailLeft}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <ThemedText style={styles.detailLabel}>{t('profilePage.location')}</ThemedText>
              </View>
              <ThemedText style={styles.detailValue}>{dbUser.profile.location.city}</ThemedText>
            </TouchableOpacity>
          )}

          {/* Occupation */}
          {dbUser?.profile?.occupation && (
            <TouchableOpacity style={styles.detailItem} activeOpacity={0.7}>
              <View style={styles.detailLeft}>
                <Ionicons name="briefcase-outline" size={20} color="#666" />
                <ThemedText style={styles.detailLabel}>{t('profilePage.occupation')}</ThemedText>
              </View>
              <ThemedText style={styles.detailValue}>{dbUser.profile.occupation}</ThemedText>
            </TouchableOpacity>
          )}

          {/* Education */}
          {dbUser?.profile?.education && (
            <TouchableOpacity style={styles.detailItem} activeOpacity={0.7}>
              <View style={styles.detailLeft}>
                <Ionicons name="school-outline" size={20} color="#666" />
                <ThemedText style={styles.detailLabel}>{t('profilePage.education')}</ThemedText>
              </View>
              <ThemedText style={styles.detailValue}>{dbUser.profile.education}</ThemedText>
            </TouchableOpacity>
          )}

          {/* Height */}
          {typeof dbUser?.profile?.height === 'number' && dbUser.profile.height > 0 && (
            <TouchableOpacity style={styles.detailItem} activeOpacity={0.7}>
              <View style={styles.detailLeft}>
                <Ionicons name="resize-outline" size={20} color="#666" />
                <ThemedText style={styles.detailLabel}>{t('profilePage.height')}</ThemedText>
              </View>
              <ThemedText style={styles.detailValue}>
                {`${dbUser.profile.height} cm`}
              </ThemedText>
            </TouchableOpacity>
          )}

        </View>

        {/* Photos Section */}
        {dbUser?.profile?.photos && dbUser.profile.photos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="images-outline" size={20} color={Colors.primaryBackgroundColor} />
              <ThemedText style={styles.sectionTitle}>{t('profilePage.photos')}</ThemedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photosScroll}
              contentContainerStyle={styles.photosContainer}
            >
              {dbUser?.profile?.photos?.slice(0, 5).map((photo, index) => {
                const allPhotos = getAllPhotos()
                const photoIndex = allPhotos.findIndex(p => p === photo?.url)
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.photoItem}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (allPhotos.length > 0) {
                        navigationRouter.push({
                          pathname: '/imageGallery',
                          params: {
                            photos: JSON.stringify(allPhotos),
                            initialIndex: (photoIndex >= 0 ? photoIndex : index).toString()
                          }
                        })
                      }
                    }}
                  >
                    <Image source={{ uri: photo?.url }} style={styles.photoImage} />
                    {photo?.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <ThemedText style={styles.primaryBadgeText}>{t('profilePage.primary')}</ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        )}

        {/* Preferences Section */}
        {dbUser?.preferences && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings-outline" size={20} color={Colors.primaryBackgroundColor} />
              <ThemedText style={styles.sectionTitle}>{t('profilePage.datingPreferences')}</ThemedText>
            </View>

            <TouchableOpacity style={styles.detailItem} activeOpacity={0.7}>
              <View style={styles.detailLeft}>
                <Ionicons name="navigate-outline" size={20} color="#666" />
                <ThemedText style={styles.detailLabel}>{t('profilePage.maxDistance')}</ThemedText>
              </View>
              <ThemedText style={styles.detailValue}>
                {dbUser?.preferences?.distanceMaxKm} km
              </ThemedText>
            </TouchableOpacity>

            {dbUser?.preferences?.ageRange && (
              <TouchableOpacity style={styles.detailItem} activeOpacity={0.7}>
                <View style={styles.detailLeft}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <ThemedText style={styles.detailLabel}>{t('profilePage.ageRange')}</ThemedText>
                </View>
                <ThemedText style={styles.detailValue}>
                  {`${dbUser.preferences.ageRange?.[0]} - ${dbUser.preferences.ageRange?.[1]} ${t('profilePage.yearsOld')}`}
                </ThemedText>

              </TouchableOpacity>
            )}

            {dbUser.preferences.showMe && dbUser.preferences.showMe.length > 0 && (
              <TouchableOpacity style={styles.detailItem} activeOpacity={0.7}>
                <View style={styles.detailLeft}>
                  <Ionicons name="eye-outline" size={20} color="#666" />
                  <ThemedText style={styles.detailLabel}>{t('profilePage.showMe')}</ThemedText>
                </View>
                <ThemedText style={styles.detailValue}>
                  {dbUser.preferences.showMe.map(g => g === 'male' ? t('gender.man') : g === 'female' ? t('gender.woman') : g).join(', ')}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Edit Button */}
        <TouchableOpacity 
          style={styles.editButton} 
          activeOpacity={0.8}
          onPress={() => navigationRouter.push('/(home)/(tabs)/(setting)/editProfile')}
        >
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <ThemedText style={styles.editButtonText}>{t('profilePage.editProfile')}</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parentBackgroundColor,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: 'white',
    marginRight: 10,
    gap: 6,
  },
  signOutText: {
    fontSize: 14,
    color: Colors.primaryBackgroundColor,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    padding: 24,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    color: Colors.titleColor,
  },
  userAge: {
    color: Colors.text.secondary,
  },
  bioSection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  bioText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primaryBackgroundColor,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    marginLeft: 8,
    flex: 1,
  },
  photoCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  photosScroll: {
    maxHeight: 180,
  },
  photosContainer: {
    paddingHorizontal: 0,
    gap: 12,
    paddingRight: 20,
  },
  photoItem: {
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 0,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(75, 22, 76, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: Colors.primaryBackgroundColor,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
})

export default Profile
