import { useAuthStateManager } from '@/hooks/useAuthStateManager';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/store/authStore';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import * as Linking from 'expo-linking'


export default function RootLayout() {
  SplashScreen.preventAutoHideAsync();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const isLoading = useAuthStore((s) => s.isLoading);
  useAuthStateManager();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
      console.log('isLoading', isLoading);
    }

    const handleDeepLink = (event: { url: string }) => {
      const { queryParams, path } = Linking.parse(event.url);
      console.log("Deep link opened:", { path, queryParams });
      if (queryParams?.ref) {
        console.log("Referred by:", queryParams.ref);
      }
    };

    const sub = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => sub.remove();

  }, [isLoading]);

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <PaperProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(home)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}
