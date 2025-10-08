import { Stack } from "expo-router";

export default function _layout() {
    return (
        <Stack initialRouteName="setting" screenOptions={{headerShown:false}}>
            <Stack.Screen name="setting"/>
            <Stack.Screen name="profile"/>
        </Stack>
    )
}