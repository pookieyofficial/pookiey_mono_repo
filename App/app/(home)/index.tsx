import { useAuth } from '@/hooks/useAuth'
import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, ImageSourcePropType } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SwipeDeck, { CardItem, SwipeAction } from '@/components/SwipeDeck'
import { ThemedText } from '@/components/ThemedText'
import { Colors } from '@/constants/Colors'

export default function index() {
  const { signOut } = useAuth()
  const data: CardItem[] = useMemo(() => [
    { id: 1, name: 'Jessica Parker', age: 23, job: 'Professional model', image: require('@/assets/images/loginPageImage.png') as ImageSourcePropType },
    { id: 2, name: 'Camila Snow', age: 23, job: 'Marketer', image: require('@/assets/images/react-logo.png') as ImageSourcePropType },
    { id: 3, name: 'Bred Jackson', age: 25, job: 'Photograph', image: require('@/assets/images/partial-react-logo.png') as ImageSourcePropType },
  ], [])

  const onSwiped = (item: CardItem, action: SwipeAction) => {
    console.log(`Swiped ${action} on`, item)
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.parentBackgroundColor }}>
      <View style={{ flex: 1 }}>
        <SwipeDeck data={data} onSwiped={onSwiped} />
        <TouchableOpacity onPress={() => signOut()} style={{ position: 'absolute', top: 12, right: 12 }}>
          <ThemedText>Sign Out</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
