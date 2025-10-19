import { useAuthStore } from '@/store/authStore';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useDeepLinking } from '@/hooks/useDeepLinking';
import { Colors } from '@/constants/Colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    HellixBold: require('../assets/fonts/Hellix-Bold.ttf'),
    HellixSemiBold: require('../assets/fonts/Hellix-SemiBold.ttf'),
    HellixMedium: require('../assets/fonts/Hellix-Medium.ttf'),
    HellixRegularItalic: require('../assets/fonts/Hellix-RegularItalic.ttf'),
  });

  const { setupAuthListener, getInitialSession } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Initializing centralized auth system...');
      setupAuthListener();
      await getInitialSession();
      console.log('✅ Centralized auth system initialized');
    };

    initializeAuth();
  }, []);

  useDeepLinking();

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.parentBackgroundColor }}>
      <PaperProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack initialRouteName='(auth)' screenOptions={{ headerShown: false }}>
            <Stack.Screen name='(auth)' />
            <Stack.Screen name='(home)' />
            <Stack.Screen name='matchingScreen'/>
          </Stack>
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
