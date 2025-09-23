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
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

  // Initialize auth system once
  const { setupAuthListener, getInitialSession } = useAuthStore();

  // Initialize auth system once on app load
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Initializing centralized auth system...');

      // Setup the auth listener (singleton - only runs once)
      setupAuthListener();

      // Get initial session
      await getInitialSession();

      console.log('✅ Centralized auth system initialized');
    };

    initializeAuth();
  }, []); // Empty dependency array ensures this runs only once

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

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}
