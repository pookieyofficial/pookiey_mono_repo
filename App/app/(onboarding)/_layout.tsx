import { Stack } from 'expo-router'
import React from 'react'

export default function _layout() {
    return (
        <Stack initialRouteName="profile" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="profile" />
            <Stack.Screen name="gender" />
            <Stack.Screen name="interests" />
        </Stack>
    )
}
