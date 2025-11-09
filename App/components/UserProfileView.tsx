

import React, { useState } from 'react'
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Modal,
  Pressable,
  Animated
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import { ThemedText } from './ThemedText'
import { DBUser } from '@/types/Auth'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { useMessagingStore } from '@/store/messagingStore'
import { useAuth } from '@/hooks/useAuth'
import { useUserInteraction } from '@/hooks/userInteraction'
import { messageAPI } from '@/APIs/messageAPIs'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Default mock data for testing
const DEFAULT_MOCK_USER: DBUser = {
  user_id: 'mock_user_1',
  email: 'jessica@example.com',
  displayName: 'Jessica Parker',
  photoURL: 'https://i.pravatar.cc/400?img=1',
  provider: 'email',
  isEmailVerified: true,
  isPhoneVerified: false,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  profile: {
    firstName: 'Jessica',
    lastName: 'Parker',
    dateOfBirth: new Date('2001-05-15'),
    gender: 'female',
    bio: 'My name is Jessica Parker and I enjoy meeting new people and finding ways to help them have an uplifting experience. I enjoy reading, traveling, and exploring new cultures. Life is an adventure and I\'m here to make the most of it!',
    location: {
      type: 'Point',
      coordinates: [-87.6298, 41.8781],
      city: 'Chicago',
      country: 'United States'
    },
    photos: [
      { url: 'https://i.pravatar.cc/400?img=1', isPrimary: true, uploadedAt: new Date() },
      { url: 'https://i.pravatar.cc/400?img=2', uploadedAt: new Date() },
      { url: 'https://i.pravatar.cc/400?img=3', uploadedAt: new Date() },
      { url: 'https://i.pravatar.cc/400?img=4', uploadedAt: new Date() }
    ],
    interests: ['Travelling', 'Books', 'Music', 'Dancing', 'Modeling'],
    occupation: 'Professional model',
    isOnboarded: true
  }
}

interface UserProfileViewProps {
  user: DBUser | null
  onLike?: () => void
  onMessage?: () => void
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onMessage }) => {
  const router = useRouter()
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ title: '', message: '' })
  const { dbUser: currentUser } = useAuthStore()
  const { inbox, setInbox } = useMessagingStore()
  const { token } = useAuth()
  const { likeUser } = useUserInteraction()
  
  const displayUser = user || DEFAULT_MOCK_USER

  const findOrCreateMatch = async (otherUserId: string): Promise<string | null> => {
    try {
      // First, check if match exists in inbox
      let existingMatch = inbox.find(item => item.userId === otherUserId)
      if (existingMatch) {
        return existingMatch.matchId
      }

      // Refresh inbox from backend to get latest matches
      if (token) {
        try {
          const updatedInbox = await messageAPI.getInbox(token)
          setInbox(updatedInbox)
          
          // Check again after refresh
          existingMatch = updatedInbox.find(item => item.userId === otherUserId)
          if (existingMatch) {
            return existingMatch.matchId
          }
        } catch (error) {
          console.error('Error refreshing inbox:', error)
        }
      }

      // If no match found, try to create one by liking the user
      // This will create a match if the other user already liked you
      if (token && currentUser?.user_id) {
        try {
          const interactionResult = await likeUser(otherUserId)
          
          // If interaction created a match, use the match ID
          // The backend response may include matchId directly or in match._id
          if (interactionResult.isMatch) {
            const matchId = (interactionResult as any).matchId || interactionResult.match?._id
            if (matchId) {
              return matchId
            }
          }

          // Even if not a match, refresh inbox in case one was created
          if (token) {
            try {
              const updatedInbox = await messageAPI.getInbox(token)
              setInbox(updatedInbox)
              
              const newMatch = updatedInbox.find(item => item.userId === otherUserId)
              if (newMatch) {
                return newMatch.matchId
              }
            } catch (error) {
              console.error('Error refreshing inbox after interaction:', error)
            }
          }
        } catch (error) {
          console.error('Error creating interaction:', error)
        }
      }

      return null
    } catch (error) {
      console.error('Error finding/creating match:', error)
      return null
    }
  }

  const handleChatPress = async () => {
    if (!displayUser?.user_id) {
      setAlertMessage({
        title: '⚠️ Error',
        message: 'User information is not available. Please try again later.'
      })
      setShowAlert(true)
      return
    }

    if (!currentUser?.user_id) {
      setAlertMessage({
        title: '⚠️ Error',
        message: 'You must be logged in to chat with other users.'
      })
      setShowAlert(true)
      return
    }

    if (!token) {
      setAlertMessage({
        title: '⚠️ Error',
        message: 'Authentication token not available. Please log in again.'
      })
      setShowAlert(true)
      return
    }

    // Try to find or create a match
    const matchId = await findOrCreateMatch(displayUser.user_id)
    
    if (!matchId) {
      const userName = displayUser.profile?.firstName || displayUser.displayName || 'this user'
      setAlertMessage({
        title: '💬 Start a Conversation',
        message: `${userName} needs to interact with you (like you back) before you can start chatting. Send them a like and wait for them to like you back! 💕`
      })
      setShowAlert(true)
      return
    }

    // Navigate to chat room
    const userName = displayUser.profile?.firstName || displayUser.displayName || 'User'
    const userAvatar = displayUser.profile?.photos?.[0]?.url || displayUser.photoURL || ''

    router.push({
      pathname: '/(home)/(tabs)(chats)/chatRoom',
      params: {
        matchId,
        userName,
        userAvatar,
        userId: displayUser.user_id,
      },
    })
  }

  const getAge = () => {
    if (!displayUser?.profile?.dateOfBirth) return null
    const birthDate = new Date(displayUser.profile.dateOfBirth)
    const ageDiff = Date.now() - birthDate.getTime()
    const ageDate = new Date(ageDiff)
    return Math.abs(ageDate.getUTCFullYear() - 1970)
  }

  const age = getAge()
  const photos = displayUser?.profile?.photos?.map(p => p.url!) || []
  // Get ALL interests - no limit
  const interests = displayUser?.profile?.interests || []
  const bio = displayUser?.profile?.bio || ''
  const firstName = displayUser?.profile?.firstName || displayUser?.displayName || 'User'
  const occupation = displayUser?.profile?.occupation
  const location = displayUser?.profile?.location
  const distance = 1 // mock distance

  const BIO_TRUNCATE_LENGTH = 100
  const isBioLong = bio.length > BIO_TRUNCATE_LENGTH
  const displayBio = isBioExpanded || !isBioLong ? bio : `${bio.substring(0, BIO_TRUNCATE_LENGTH)}...`

  // Get current user's interests for comparison
  const currentUserInterests = currentUser?.profile?.interests || []
  
  // Helper function to check if interest matches
  const isInterestMatch = (interest: string) => {
    return currentUserInterests.some(
      (userInterest) => userInterest.toLowerCase().trim() === interest.toLowerCase().trim()
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Two Layered Images */}
        <View style={styles.headerSection}>
          {/* Background Image (for gradient effect) */}
          {photos.length > 0 && photos.length > 1 ? (
            <Image
              source={{ uri: photos[1] || photos[0] }}
              style={styles.backgroundImage}
              resizeMode="cover"
              blurRadius={20}
            />
          ) : photos.length > 0 ? (
            <Image
              source={{ uri: photos[0] }}
              style={styles.backgroundImage}
              resizeMode="cover"
              blurRadius={20}
            />
          ) : (
            <View style={styles.headerImagePlaceholder}>
              <Ionicons name="person" size={80} color={Colors.primary.white} />
            </View>
          )}

          {/* Foreground Image (main image) */}
          {photos.length > 0 ? (
            <Image
              source={{ uri: photos[0] }}
              style={styles.foregroundImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.headerImagePlaceholder}>
              <Ionicons name="person" size={80} color={Colors.primary.white} />
            </View>
          )}

          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
            style={styles.imageOverlay}
          />

          {/* Simple Back Button at top */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.primary.red} />
          </TouchableOpacity>

          {/* Header content at bottom */}
          <View style={styles.headerContent}>
            <View style={styles.nameRow}>
              <View style={styles.nameContainer}>
                <ThemedText style={styles.userName}>
                  {firstName}{age ? `, ${age}` : ''}
                </ThemedText>
                {occupation && (
                  <ThemedText style={styles.occupation}>
                    {occupation}
                  </ThemedText>
                )}
              </View>

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.chatButton}
                  onPress={handleChatPress}
                >
                  <Ionicons name="chatbubble-ellipses" size={20} color={Colors.primary.white} />
                </TouchableOpacity>
                {onMessage && (
                  <TouchableOpacity 
                    style={styles.messageButton}
                    onPress={onMessage}
                  >
                    <Ionicons name="paper-plane" size={20} color={Colors.primary.white} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          {/* Location */}
          {location && (
            <View style={styles.section}>
              <ThemedText type="bold" style={styles.sectionTitle}>Location</ThemedText>
              <View style={styles.locationRow}>
                <ThemedText style={styles.locationText}>
                  {location.city}{location.country ? `, ${location.country}` : ''}
                </ThemedText>
                <View style={styles.distanceBadge}>
                  <Ionicons name="location" size={14} color={Colors.primary.white} style={{ marginRight: 4 }} />
                  <ThemedText style={styles.distanceText}>{distance} km</ThemedText>
                </View>
              </View>
            </View>
          )}

          {/* About */}
          {bio && (
            <View style={styles.section}>
              <ThemedText type="bold" style={styles.sectionTitle}>About</ThemedText>
              <ThemedText style={styles.bioText}>{displayBio}</ThemedText>
              {isBioLong && (
                <TouchableOpacity onPress={() => setIsBioExpanded(!isBioExpanded)}>
                  <ThemedText style={styles.readMoreText}>
                    {isBioExpanded ? 'Read less' : 'Read more'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Interests */}
          {interests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText type="bold" style={styles.sectionTitle}>Interests</ThemedText>
              </View>
              <View style={styles.tagsContainer}>
                {interests.map((interest, i) => {
                  const isMatch = isInterestMatch(interest)
                  return isMatch ? (
                    <View key={`interest-${i}`} style={styles.tagSelected}>
                      <Ionicons name="checkmark" size={14} color={Colors.primary.white} style={{ marginRight: 4 }} />
                      <ThemedText style={styles.tagSelectedText}>{interest}</ThemedText>
                    </View>
                  ) : (
                    <View key={`interest-${i}`} style={styles.tagUnselected}>
                      <ThemedText style={styles.tagUnselectedText}>{interest}</ThemedText>
                    </View>
                  )
                })}
              </View>
            </View>
          )}

          {/* Gallery */}
          {photos.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText type="bold" style={styles.sectionTitle}>Gallery</ThemedText>
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: '/imageGallery',
                      params: {
                        photos: JSON.stringify(photos),
                        initialIndex: '0'
                      }
                    })
                  }}
                >
                  <ThemedText style={styles.seeAllText}>See all</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.galleryGrid}>
                {photos.slice(0, 4).map((photoUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.galleryImageContainer}
                    onPress={() => {
                      router.push({
                        pathname: '/imageGallery',
                        params: {
                          photos: JSON.stringify(photos),
                          initialIndex: index.toString()
                        }
                      })
                    }}
                    activeOpacity={0.8}
                  >
                    <Image 
                      source={{ uri: photoUrl }} 
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Custom Alert Modal */}
      <Modal
        visible={showAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAlert(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowAlert(false)}
        >
          <Pressable style={styles.alertContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.alertHeader}>
              <ThemedText style={styles.alertTitle}>{alertMessage.title}</ThemedText>
            </View>
            
            <View style={styles.alertContent}>
              <ThemedText style={styles.alertMessage}>{alertMessage.message}</ThemedText>
            </View>

            <View style={styles.alertActions}>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => setShowAlert(false)}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.alertButtonText}>Got it</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.white,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  headerSection: {
    position: 'relative',
    width: '100%',
    height: 420,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.black,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  foregroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'd',
    zIndex: 10,
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nameContainer: { flex: 1 },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary.white,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  occupation: {
    fontSize: 16,
    color: Colors.primary.white,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: Colors.primary.white,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryBackgroundColor,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  distanceText: {
    fontSize: 14,
    color: Colors.primary.white,
    fontWeight: '600',
  },

  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  readMoreText: {
    fontSize: 16,
    color: Colors.primaryBackgroundColor,
    fontWeight: '600',
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  tagSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.primary.red,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  tagSelectedText: {
    fontSize: 14,
    color: Colors.primary.white,
    fontWeight: '600',
  },
  tagUnselected: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.primary.white,
    borderWidth: 1,
    borderColor: Colors.auth.inputBorder,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  tagUnselectedText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600',
  },

  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginTop: 4,
  },
  galleryImageContainer: {
    width: (SCREEN_WIDTH - 52) / 2,
    height: (SCREEN_WIDTH - 52) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.text.light,
    marginHorizontal: 6,
    marginBottom: 12,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  seeAllText: {
    fontSize: 16,
    color: Colors.primaryBackgroundColor,
    fontWeight: '600',
  },
  headerImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.text.light,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: Colors.primary.white,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  alertHeader: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.titleColor,
    textAlign: 'center',
  },
  alertContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  alertMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  alertActions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  alertButton: {
    backgroundColor: Colors.primaryBackgroundColor,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryBackgroundColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.white,
  },
})

export default UserProfileView
