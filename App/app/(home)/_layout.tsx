import { Stack } from "expo-router";

export default function _layout() {
    return (
        <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
        </Stack>
    )
}