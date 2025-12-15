import { Stack } from 'expo-router'
import React from 'react'

export default function _layout() {
    return (
        <>
            <Stack initialRouteName="profile" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="profile" />
                <Stack.Screen name="referral" />
                <Stack.Screen name="gender" />
                <Stack.Screen name="occupation" />
                <Stack.Screen name="interest" />
                <Stack.Screen name="image" />
                <Stack.Screen name="notification" />
                <Stack.Screen name="language" />
                <Stack.Screen name="location" />
                <Stack.Screen name="microphone" />
            </Stack>
        </>
    )
}
