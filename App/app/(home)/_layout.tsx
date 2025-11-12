import { Stack } from "expo-router";

export default function _layout() {
    return (
        <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="matchingScreen"/>
            <Stack.Screen name="imageGallery" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="userProfile" options={{ presentation: 'fullScreenModal' }} />
        </Stack>
    )
}