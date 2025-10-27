import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { deepLinkState } from '@/utils/deepLinkState';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';

const parseHashParams = (url: string): Record<string, string> => {
  const hashMatch = url.match(/#(.+)$/);
  const hashParams: Record<string, string> = {};

  if (hashMatch) {
    const hashString = hashMatch[1];
    const pairs = hashString.split('&');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value) {
        hashParams[key] = decodeURIComponent(value);
      }
    });
  }

  return hashParams;
};

const handleMagicLinkTokens = async (hashParams: Record<string, string>): Promise<boolean> => {
  if (!hashParams.access_token || !hashParams.refresh_token) {
    return false;
  }

  deepLinkState.setProcessing(true);

  console.log('🔐 Magic link tokens detected, setting session...');

  try {
    const { supabase } = await import('@/config/supabaseConfig');

    const { data, error } = await supabase.auth.setSession({
      access_token: hashParams.access_token,
      refresh_token: hashParams.refresh_token,
    });

    if (error) {
      console.error('❌ Failed to set session:', error);
      deepLinkState.setProcessing(false);
      return false;
    }

    console.log('✅ Session set successfully!');
    console.log('User:', data.user?.email);
    deepLinkState.setProcessing(false);
    return true;
  } catch (error) {
    console.error('❌ Error setting session:', error);
    deepLinkState.setProcessing(false);
    return false;
  }
};

const handleReferralLink = (queryParams: Record<string, any>): boolean => {
  if (queryParams?.ref) {
    console.log('👥 Referral detected:', queryParams.ref);
    return true;
  }
  return false;
};

export const useDeepLinking = () => {
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log('🔗 Deep link received:', event.url);

      const last = deepLinkState.getLastHandledUrl?.();
      if (last && last === event.url) {
        console.log('⏭️ Skipping duplicate deeplink URL:', event.url);
        return;
      }
      deepLinkState.setLastHandledUrl?.(event.url);

      const { queryParams } = Linking.parse(event.url);
      const hashParams = parseHashParams(event.url);

      if (Object.keys(hashParams).length > 0) {
        console.log('📦 Hash params:', Object.keys(hashParams));
      }


      const parsed = Linking.parse(event.url);
      let targetRoute: string | null = null;
      
      if (queryParams?.route && typeof queryParams.route === 'string') {
        targetRoute = queryParams.route;
        if (!targetRoute.startsWith('/')) {
          targetRoute = '/' + targetRoute;
        }
        console.log('📍 Route from query params:', targetRoute);
      } else if (parsed.path) {
        targetRoute = parsed.path;
        if (!targetRoute.startsWith('/')) {
          targetRoute = '/' + targetRoute;
        }
        console.log('📍 Route from path:', targetRoute);
      }

      const hasMagicLinkTokens = await handleMagicLinkTokens(hashParams);
      
      if (hasMagicLinkTokens && targetRoute) {
        console.log('🔐 Magic link detected, saving route for after auth:', targetRoute);
        deepLinkState.setPendingDeeplink(targetRoute);
        return;
      }

      if (handleReferralLink(queryParams || {})) return;

      if (targetRoute) {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        const dbUser = useAuthStore.getState().dbUser;
        
        if (isAuthenticated && dbUser?.profile?.isOnboarded) {
          console.log('✅ User is authenticated and onboarded, routing immediately to:', targetRoute);
          router.push(targetRoute as any);
          deepLinkState.clearPendingDeeplink();
        } else if (isAuthenticated && !dbUser?.profile?.isOnboarded) {
          console.log('⏳ User authenticated but not onboarded, saving pending deeplink for after onboarding');
          deepLinkState.setPendingDeeplink(targetRoute);
        } else {
          console.log('⏳ User not authenticated, saving pending deeplink for after login');
          deepLinkState.setPendingDeeplink(targetRoute);
        }
      }

    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('📱 Initial URL:', url);
        deepLinkState.setLastHandledUrl?.(url);
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, []);
};

