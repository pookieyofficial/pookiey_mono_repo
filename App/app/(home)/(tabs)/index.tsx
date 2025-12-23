import { useAuth } from '@/hooks/useAuth'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, Linking, Platform, Alert } from 'react-native'
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
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import { Audio } from 'expo-av'
import { useFocusEffect } from '@react-navigation/native'
import * as Device from 'expo-device'

export default function index() {
  const { t } = useTranslation();
  const router = useRouter()

  const { getRecommendedUsers, updateUser } = useUser()
  const { idToken, token } = useAuth()
  const { signOut } = useAuth()

  const [profiles, setProfiles] = useState<RecommendedUser[]>([])
  const [consumed, setConsumed] = useState(0)
  const [deckKey, setDeckKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [permissionsChecked, setPermissionsChecked] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const isRefreshingRef = useRef(false)
  const isCheckingPermissionsRef = useRef(false)
  const lastLocationSentRef = useRef<string | null>(null)
  const lastPushTokenSentRef = useRef<string | null>(null)
  const permissionDialogShownRef = useRef<string | null>(null)

  // Story store
  const { setCategorizedStories, setLoading: setStoryLoading } = useStoryStore()
  const { dbUser, setDBUser, addNotificationToken, getNotificationTokens } = useAuthStore()

  const updateLocationInApi = useCallback(
    async (coords: { latitude: number; longitude: number }, city?: string) => {
      if (!idToken) return

      const signature = `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}|${city || ''}`
      if (lastLocationSentRef.current === signature) return

      try {
        const response = await updateUser(idToken as string, {
          profile: {
            location: {
              type: 'Point' as const,
              coordinates: [coords.longitude, coords.latitude],
              city,
            },
          },
        })

        if (response?.success && response?.data) {
          setDBUser(response.data)
        }

        lastLocationSentRef.current = signature
      } catch (e) {
        console.error('Home: failed to update location in API:', e)
      }
    },
    [idToken, setDBUser, updateUser],
  )

  const updateNotificationTokenInApi = useCallback(
    async (pushToken: string) => {
      if (!idToken) return
      if (!pushToken) return
      if (lastPushTokenSentRef.current === pushToken) return

      try {
        const localTokens = getNotificationTokens()
        const dbTokens = Array.isArray(dbUser?.notificationTokens) ? dbUser!.notificationTokens : []
        const merged = Array.from(new Set([...dbTokens, ...localTokens, pushToken]))
        console.log(merged)

        const response = await updateUser(idToken as string, { notificationTokens: merged })
        if (response?.success && response?.data) {
          setDBUser(response.data)
        }
        console.log(response)

        lastPushTokenSentRef.current = pushToken
      } catch (e) {
        console.error('Home: failed to update notification token in API:', e)
      }
    },
    [dbUser, getNotificationTokens, idToken, setDBUser, updateUser],
  )

  const ensurePermissions = useCallback(async () => {
    if (isCheckingPermissionsRef.current) return
    isCheckingPermissionsRef.current = true
    setPermissionError(null)

    try {
      // 1) Location permission + update location via API
      const currentLocationPerm = await Location.getForegroundPermissionsAsync()
      const locationStatus =
        currentLocationPerm.status === 'granted'
          ? currentLocationPerm.status
          : (await Location.requestForegroundPermissionsAsync()).status

      if (locationStatus !== 'granted') {
        setPermissionsChecked(false)
        setPermissionError('Location permission is required to continue. Please allow it.')
        return
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        let city: string | undefined
        try {
          const reverse = await Location.reverseGeocodeAsync({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          })
          if (reverse?.length) {
            const a = reverse[0]
            const addressParts = [a.city, a.region, a.country].filter(Boolean)
            city = addressParts.join(', ') || undefined
          }
        } catch (e) {
          console.log('Home: reverse geocode failed:', e)
        }

        await updateLocationInApi(
          {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          },
          city,
        )
      } catch (e) {
        console.log('Home: unable to fetch current location:', e)
      }

      // 2) Notifications permission + update token via API
      const currentNotifPerm = await Notifications.getPermissionsAsync()
      const notifStatus =
        currentNotifPerm.status === 'granted'
          ? currentNotifPerm.status
          : (await Notifications.requestPermissionsAsync()).status

      if (notifStatus !== 'granted') {
        setPermissionsChecked(false)
        setPermissionError('Notification permission is required to continue. Please allow it.')
        return
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      })

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('messages', {
          name: 'messages',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          showBadge: true,
        })
      }

      if (Device.isDevice) {
        const pushToken = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
        })
        if (pushToken?.data) {
          addNotificationToken(pushToken.data)
          await updateNotificationTokenInApi(pushToken.data)
        }
      } else {
        console.warn('Home: must use physical device for push notifications token')
      }

      // 3) Microphone permission (no API call)
      const currentMicPerm = await Audio.getPermissionsAsync()
      const micStatus =
        currentMicPerm.status === 'granted'
          ? currentMicPerm.status
          : (await Audio.requestPermissionsAsync()).status

      if (micStatus !== 'granted') {
        setPermissionsChecked(false)
        setPermissionError('Microphone permission is required to continue. Please allow it.')
        return
      }

      setPermissionsChecked(true)
    } catch (error) {
      console.error('Home: error ensuring permissions:', error)
      setPermissionError('Could not request permissions. Please try again.')
      setPermissionsChecked(false)
    } finally {
      isCheckingPermissionsRef.current = false
    }
  }, [addNotificationToken, updateLocationInApi, updateNotificationTokenInApi])

  // Ask permissions directly (no routing)
  useEffect(() => {
    ensurePermissions()
  }, [ensurePermissions])

  // Show a quick dialog if permissions are missing, but DO NOT block the swipe deck UI.
  useEffect(() => {
    const message =
      permissionError ||
      (!permissionsChecked ? 'Permissions are required for the best experience. Please allow them.' : null)

    if (!message) return

    // Avoid spamming the same dialog repeatedly (e.g. on re-renders / polling)
    if (permissionDialogShownRef.current === message) return
    permissionDialogShownRef.current = message

    // Delay slightly so we don't show an Alert during initial render/layout
    const t = setTimeout(() => {
      Alert.alert('Permissions needed', message, [
        {
          text: 'Grant',
          onPress: () => {
            // Reset so we can show again if it still fails after a re-request
            permissionDialogShownRef.current = null
            ensurePermissions()
          },
        },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings().catch(() => null),
        },
        { text: 'Not now', style: 'cancel' },
      ])
    }, 250)

    return () => clearTimeout(t)
  }, [permissionError, permissionsChecked, ensurePermissions])

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
        const currentUserName = dbUser?.displayName || `${dbUser?.profile?.firstName || ''} ${dbUser?.profile?.lastName || ''}`.trim() || 'You'
        const currentUserAvatar = dbUser?.photoURL || dbUser?.profile?.photos?.[0]?.url || ''

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
    const nextConsumed = consumed + 1
    setConsumed(nextConsumed)
    const remaining = profiles.length - nextConsumed
    if (remaining <= 5) await loadMoreProfiles()
  }

  const onMatch = (match: any) => {
    router.push({
      pathname: '/matchingScreen',
      params: {
        matchData: JSON.stringify(match),
        matchedUser: JSON.stringify(match.matchedUser || match)
      }
    })
  }

  const onCardPress = (user: RecommendedUser) => {
    router.push({
      pathname: '/userProfile' as any,
      params: {
        userData: JSON.stringify(user)
      }
    })
  }

  const initializeProfiles = useCallback(async () => {
    if (!idToken) return
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
  }, [idToken, getRecommendedUsers])

  // Store initializeProfiles in ref to avoid dependency issues
  const initializeProfilesRef = useRef(initializeProfiles)
  initializeProfilesRef.current = initializeProfiles

  useEffect(() => {
    // Only initialize profiles if permissions are checked and granted
    if (permissionsChecked && idToken) {
      initializeProfilesRef.current()
    }
  }, [idToken, permissionsChecked])

  useEffect(() => {
    // Only load stories if permissions are checked
    if (permissionsChecked) {
      loadStories()
    }
  }, [loadStories, permissionsChecked])

  // Refresh profiles when screen comes into focus (e.g., after updating dating preferences)
  // Only refresh if we already have profiles (user returned from another screen, not initial load)
  useFocusEffect(
    useCallback(() => {
      if (permissionsChecked && idToken && profiles.length > 0 && !isRefreshingRef.current) {
        initializeProfilesRef.current()
      }
    }, [permissionsChecked, idToken, profiles.length])
  )

  // Re-check permissions when user returns (e.g. after changing OS settings)
  useFocusEffect(
    useCallback(() => {
      ensurePermissions()
    }, [ensurePermissions])
  )

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

      </View>
    </SafeAreaView>
  )
}
