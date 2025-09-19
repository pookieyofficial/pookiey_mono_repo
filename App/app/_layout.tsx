import { useSupabaseAuthStateManager } from '@/hooks/useSupabaseAuthStateManager';
import { useAuthStore } from '@/store/authStore';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import * as Linking from 'expo-linking'
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  // Load the fonts
  const [loaded, error] = useFonts({
    HellixBold: require('../assets/fonts/Hellix-Bold.ttf'),
    HellixSemiBold: require('../assets/fonts/Hellix-SemiBold.ttf'),
    HellixMedium: require('../assets/fonts/Hellix-Medium.ttf'),
    HellixRegularItalic: require('../assets/fonts/Hellix-RegularItalic.ttf'),
  });

  // Check if the user is loading
  const isLoading = useAuthStore((s) => s.isLoading);

  // Handle the authentication state change globally in the app
    useSupabaseAuthStateManager();

  // Handle deep linking URLs
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { queryParams, path } = Linking.parse(event.url);
      if (queryParams?.ref) {
        console.log("Referred by:", queryParams.ref);
      }
    };

    const sub = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => sub.remove();

  }, []);

  // Wait for the fonts to load
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <PaperProvider>
      <ThemeProvider value={DefaultTheme}>
        {/* <Stack initialRouteName="(onboarding)/profile" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(home)" />
          <Stack.Screen name="+not-found" />
        </Stack> */}
        <Stack initialRouteName='(auth)' screenOptions={{ headerShown: false }}>
          <Stack.Screen name='(auth)' />
        </Stack>
        <StatusBar style="auto" backgroundColor='red' />
      </ThemeProvider>
    </PaperProvider>
  );
}
