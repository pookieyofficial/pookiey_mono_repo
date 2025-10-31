import { useAuth } from '@/hooks/useAuth'
import React, { useEffect, useState } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SwipeDeck, { SwipeAction } from '@/components/SwipeDeck'
import { ThemedText } from '@/components/ThemedText'
import { Colors } from '@/constants/Colors'
import { useUser } from '@/hooks/useUser'
import { RecommendedUser } from '@/types/User'
import { useRouter } from 'expo-router'

export default function index() {
  const router = useRouter()

  const { getRecommendedUsers } = useUser()
  const { idToken } = useAuth()

  const { signOut } = useAuth()

  const [profiles, setProfiles] = useState<RecommendedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const onSwiped = async (item: RecommendedUser, action: SwipeAction) => {
    console.log(`Swiped ${action} on`, item)
    const nextProfiles = profiles.filter(profile => profile._id !== item._id)
    setProfiles(nextProfiles)
    if (nextProfiles.length <= 5) {
      await loadMoreProfiles()
    }
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

  useEffect(() => {
    initializeProfiles()
  }, [idToken])

  const initializeProfiles = async () => {
    setIsLoading(true)
    try {
      const recommendedUsers = await getRecommendedUsers(idToken as string, {
        maxDistance: 1000,
        limit: 10,
        offset: 0
      })
      setProfiles(recommendedUsers?.data || [])
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
        limit: 10,
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
            <ThemedText>Loading profiles...</ThemedText>
          </View>
          :
          <SwipeDeck data={profiles} onSwiped={onSwiped} onMatch={onMatch} />
        }

        {/* <TouchableOpacity onPress={() => router.push('/matchingScreen')} style={{ position: 'absolute', top: 12, right: 12 }}>
          <ThemedText>go to matching screen</ThemedText>
        </TouchableOpacity> */}



        {/* <TouchableOpacity onPress={() => signOut()} style={{ position: 'absolute', top: 12, left: 12 }}>
          <ThemedText>Sign Out</ThemedText>
        </TouchableOpacity> */}

      </View>
    </SafeAreaView>
  )
}
