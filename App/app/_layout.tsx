import { useSupabaseAuthStateManager } from '@/hooks/useSupabaseAuthStateManager';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/store/authStore';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import * as Linking from 'expo-linking'
import * as SplashScreen from 'expo-splash-screen';



// SplashScreen.preventAutoHideAsync()
export default function RootLayout() {
  const colorScheme = useColorScheme();
   const [loaded] = useFonts({
     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
     InterItalic: require('../assets/fonts/Inter-Italic-VariableFont_opsz,wght.ttf'),
     InterVariable: require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
  });
   const isLoading = useAuthStore((s) => s.isLoading);
//   useSupabaseAuthStateManager();

//   useEffect(() => {
//     const handleDeepLink = (event: { url: string }) => {
//       const { queryParams, path } = Linking.parse(event.url);
//       if (queryParams?.ref) {
//         console.log("Referred by:", queryParams.ref);
//       }
//     };

//     const sub = Linking.addEventListener("url", handleDeepLink);

//     Linking.getInitialURL().then((url) => {
//       if (url) handleDeepLink({ url });
//     });

//     return () => sub.remove();

//   }, []);

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <PaperProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* <Stack initialRouteName="(onboarding)/profile" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(home)" />
          <Stack.Screen name="+not-found" />
        </Stack> */}
        <Stack initialRouteName='(auth)' screenOptions={{headerShown:false}}>
          <Stack.Screen name='(auth)' />
        </Stack>
        <StatusBar style="auto" backgroundColor='red' />
      </ThemeProvider>
    </PaperProvider>
  );
}
