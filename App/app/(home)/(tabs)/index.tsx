import { useAuth } from '@/hooks/useAuth'
import React, { useEffect, useState, useCallback } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SwipeDeck, { SwipeAction } from '@/components/SwipeDeck'
import { ThemedText } from '@/components/ThemedText'
import { Colors } from '@/constants/Colors'
import { useUser } from '@/hooks/useUser'
import { RecommendedUser } from '@/types/User'
import { useRouter } from 'expo-router'
import { storyAPI } from '@/APIs/storyAPIs'
import { useStoryStore, StoryItem } from '@/store/storyStore'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from 'react-i18next'

export default function index() {
  const { t } = useTranslation();
  const router = useRouter()

  const { getRecommendedUsers } = useUser()
  const { idToken, token } = useAuth()
  const { signOut } = useAuth()

  const [profiles, setProfiles] = useState<RecommendedUser[]>([])
  const [consumed, setConsumed] = useState(0)
  const [deckKey, setDeckKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Story store
  const { setCategorizedStories, setLoading: setStoryLoading } = useStoryStore()
  const { dbUser } = useAuthStore()

  // Load stories when component mounts
  const loadStories = useCallback(async () => {
    if (!token) {
      setStoryLoading(false)
      return
    }

    try {
      setStoryLoading(true)
      const data = await storyAPI.getStories(token)
      console.log('Stories loaded from home page:', data)
      
      // Handle new categorized structure
      if (data && typeof data === 'object' && !Array.isArray(data) && 'myStory' in data) {
        // New structure with categorized stories
        const categorizedStories = {
          myStory: data.myStory || null,
          friends: Array.isArray(data.friends) ? data.friends : [],
          discover: Array.isArray(data.discover) ? data.discover : []
        }
        
        // Ensure "Your Story" exists even if empty
        if (!categorizedStories.myStory && dbUser?.user_id) {
          categorizedStories.myStory = {
            id: dbUser.user_id,
            username: dbUser.displayName || `${dbUser.profile?.firstName || ''} ${dbUser.profile?.lastName || ''}`.trim() || 'You',
            avatar: dbUser.photoURL || dbUser.profile?.photos?.[0]?.url || '',
            stories: [],
            isMe: true
          }
        }
        
        setCategorizedStories(categorizedStories)
      } else if (Array.isArray(data)) {
        // Fallback to old structure (flat array)
        const storiesList: StoryItem[] = data;
        const myStoryIndex = storiesList.findIndex(item => item.isMe)
        
        const currentUserId = dbUser?.user_id
        const currentUserName = dbUser?.displayName || `${dbUser.profile?.firstName || ''} ${dbUser.profile?.lastName || ''}`.trim() || 'You'
        const currentUserAvatar = dbUser?.photoURL || dbUser.profile?.photos?.[0]?.url || ''
        
        if (myStoryIndex === -1 && currentUserId) {
          const myStory: StoryItem = {
            id: currentUserId,
            username: currentUserName,
            avatar: currentUserAvatar,
            stories: [],
            isMe: true
          }
          storiesList.unshift(myStory)
        }
        
        // Convert to categorized structure for consistency
        const myStory = storiesList.find(item => item.isMe) || (currentUserId ? {
          id: currentUserId,
          username: currentUserName,
          avatar: currentUserAvatar,
          stories: [],
          isMe: true
        } : null)
        
        const friends = storiesList.filter(item => !item.isMe)
        
        setCategorizedStories({
          myStory: myStory as StoryItem | null,
          friends: friends,
          discover: []
        })
      } else {
        // If data is neither object with myStory nor array, set empty structure
        console.warn('Unexpected data format from stories API:', data);
        setCategorizedStories({
          myStory: dbUser?.user_id ? {
            id: dbUser.user_id,
            username: dbUser.displayName || `${dbUser.profile?.firstName || ''} ${dbUser.profile?.lastName || ''}`.trim() || 'You',
            avatar: dbUser.photoURL || dbUser.profile?.photos?.[0]?.url || '',
            stories: [],
            isMe: true
          } : null,
          friends: [],
          discover: []
        });
      }
    } catch (error: any) {
      console.error('Error loading stories:', error)
      // Even on error, ensure "Your Story" exists if we have user info
      if (dbUser?.user_id) {
        const myStory: StoryItem = {
          id: dbUser.user_id,
          username: dbUser.displayName || `${dbUser.profile?.firstName || ''} ${dbUser.profile?.lastName || ''}`.trim() || 'You',
          avatar: dbUser.photoURL || dbUser.profile?.photos?.[0]?.url || '',
          stories: [],
          isMe: true
        }
        setCategorizedStories({
          myStory,
          friends: [],
          discover: []
        })
      } else {
        setCategorizedStories({
          myStory: null,
          friends: [],
          discover: []
        })
      }
    } finally {
      setStoryLoading(false)
    }
  }, [token, setCategorizedStories, setStoryLoading, dbUser])

  const onSwiped = async (item: RecommendedUser, action: SwipeAction) => {
    console.log(`Swiped ${action} on`, item)
    const nextConsumed = consumed + 1
    setConsumed(nextConsumed)
    const remaining = profiles.length - nextConsumed
    if (remaining <= 5) await loadMoreProfiles()
  }

  const onMatch = (match: any) => {
    console.log('🎉 New match received:', match)
    // Navigate to matching screen with match data
    router.push({
      pathname: '/matchingScreen',
      params: {
        matchData: JSON.stringify(match),
        matchedUser: JSON.stringify(match.matchedUser || match)
      }
    })
  }

  const onCardPress = (user: RecommendedUser) => {
    // Navigate to user profile view screen
    router.push({
      pathname: '/userProfile' as any,
      params: {
        userData: JSON.stringify(user)
      }
    })
  }

  useEffect(() => {
    initializeProfiles()
  }, [idToken])

  useEffect(() => {
    loadStories() // Load stories when home page loads
  }, [loadStories])

  const initializeProfiles = async () => {
    setIsLoading(true)
    try {
      const recommendedUsers = await getRecommendedUsers(idToken as string, {
        maxDistance: 1000,
        limit: 10,
        offset: 0
      })
      const initial = recommendedUsers?.data || []
      setProfiles(initial)
      setConsumed(0)
      setDeckKey(k => k + 1) // reset deck to first card on full refresh
    } catch (error) {
      console.error('Error initializing profiles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreProfiles = async () => {
    try {
      const recommendedUsers = await getRecommendedUsers(idToken as string, {
        maxDistance: 1000,
        limit: 100,
        offset: 0
      })

      if (recommendedUsers?.data && recommendedUsers?.data?.length > 0) {
        setProfiles(prevProfiles => {
          const combined = [...prevProfiles, ...recommendedUsers.data]
          const uniqueProfiles = combined.filter((profile, index, self) =>
            index === self.findIndex(p => p._id === profile._id)
          )
          return uniqueProfiles
        })
      }
    } catch (error) {
      console.error('Error loading more profiles:', error)
    }
  }

  const handleRefreshProfiles = async () => {
    setIsLoading(true)
    await initializeProfiles()
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.parentBackgroundColor }}>
      <View style={{ flex: 1 }}>

        {isLoading && profiles.length === 0
          ?
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedText>{t('home.loadingProfiles')}</ThemedText>
          </View>
          :
          <SwipeDeck key={deckKey} data={profiles} onSwiped={onSwiped} onMatch={onMatch} onCardPress={onCardPress} />
        }

        <TouchableOpacity onPress={() => router.push('/matchingScreen')} style={{ position: 'absolute', top: 12, right: 12 }}>
          <ThemedText>{t('home.goToMatchingScreen')}</ThemedText>
        </TouchableOpacity>



        {/* <TouchableOpacity onPress={() => signOut()} style={{ position: 'absolute', top: 12, left: 12 }}>
          <ThemedText>Sign Out</ThemedText>
        </TouchableOpacity> */}

      </View>
    </SafeAreaView>
  )
}
