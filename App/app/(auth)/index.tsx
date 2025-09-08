import Onboarding from '@/components/Onboarding';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function IndexScreen() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { isInitialized, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        setIsCheckingAuth(false);
      }
    }
  }, [isInitialized, isAuthenticated]);

  const handleOnboardingComplete = () => {
    router.replace('/login');
  };

  if (isCheckingAuth) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.primary.white,
      }}>
        <ActivityIndicator size="large" color={Colors.primary.red} />
      </View>
    );
  }

  return <Onboarding onComplete={handleOnboardingComplete} />;
}
