import { useAuth } from '@/hooks/useAuth'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function index() {
  const { signOut } = useAuth()
  return (
    <SafeAreaView>
      <View>
        <Text>Home</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Text>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
