import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { deepLinkState } from '@/utils/deepLinkState';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';

/* --------------------------------------------------------
   🔎 Helper: Parse Hash Tokens (for Supabase magic links)
-------------------------------------------------------- */
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

/* --------------------------------------------------------
   🔐 Supabase - Handle Magic Link Session Tokens
-------------------------------------------------------- */
const handleMagicLinkTokens = async (hashParams: Record<string, string>): Promise<boolean> => {
  if (!hashParams.access_token || !hashParams.refresh_token) return false;

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

    console.log('✅ Session set successfully! User:', data.user?.email);
    deepLinkState.setProcessing(false);
    return true;
  } catch (error) {
    console.error('❌ Error setting session:', error);
    deepLinkState.setProcessing(false);
    return false;
  }
};

/* --------------------------------------------------------
   👥 Referral Link Handler
-------------------------------------------------------- */
const handleReferralLink = (queryParams: Record<string, any>): boolean => {
  if (queryParams?.ref) {
    console.log('👥 Referral detected:', queryParams.ref);
    return true;
  }
  return false;
};

/* --------------------------------------------------------
   📌 MAIN HOOK — Deep Link & Notification Handling
-------------------------------------------------------- */
export const useDeepLinking = () => {
  useEffect(() => {
    /* ---------------------
       🔗 HANDLE ANY URL
    ---------------------- */
    const handleDeepLink = async (event: { url: string }) => {
      console.log('🔗 Deep link received:', event.url);

      const last = deepLinkState.getLastHandledUrl?.();
      if (last && last === event.url) {
        console.log('⏭️ Skipping duplicate deeplink URL:', event.url);
        return;
      }
      deepLinkState.setLastHandledUrl?.(event.url);

      // Parse URL
      const { queryParams } = Linking.parse(event.url);
      const hashParams = parseHashParams(event.url);

      if (Object.keys(hashParams).length > 0)
        console.log('📦 Hash params:', Object.keys(hashParams));

      const parsed = Linking.parse(event?.url);

      /* 📍 Determine Target Route */
      let targetRoute: string | null = null;

      if (queryParams?.route && typeof queryParams.route === 'string') {
        targetRoute = queryParams.route.startsWith('/')
          ? queryParams.route
          : '/' + queryParams.route;
        console.log('📍 Route from query params:', targetRoute);
      } else if (parsed.path) {
        targetRoute = parsed.path.startsWith('/')
          ? parsed.path
          : '/' + parsed.path;
        console.log('📍 Route from path:', targetRoute);
      }

      /* 🔐 Handle Magic Link Login */
      const hasMagicLinkTokens = await handleMagicLinkTokens(hashParams);
      if (hasMagicLinkTokens && targetRoute) {
        console.log('🔐 Magic link detected, saving route for after auth:', targetRoute);
        deepLinkState.setPendingDeeplink(targetRoute);
        return;
      }

      /* 👥 Referral */
      if (handleReferralLink(queryParams || {})) return;

      /* 🚦 Normal routing with Auth Check */
      if (targetRoute) {
        const store = useAuthStore.getState();
        const isAuthenticated = store.isAuthenticated;
        const dbUser = store.dbUser;

        if (isAuthenticated && dbUser?.profile?.isOnboarded) {
          console.log('🚀 Authenticated + onboarded → navigating:', targetRoute);
          router.push(targetRoute as any);
          deepLinkState.clearPendingDeeplink();
        } else if (isAuthenticated && !dbUser?.profile?.isOnboarded) {
          console.log('⏳ Authenticated but not onboarded → save & wait:', targetRoute);
          deepLinkState.setPendingDeeplink(targetRoute);
        } else {
          console.log('⏳ Not authenticated → save & wait:', targetRoute);
          deepLinkState.setPendingDeeplink(targetRoute);
        }
      }
    };

    /* ------------------------------------------
       📱 Listen to external app & link events
    ------------------------------------------- */
    const linkSubscription = Linking.addEventListener('url', handleDeepLink);

    /* ------------------------------------------
       🔔 LISTEN FOR NOTIFICATION CLICKS
    ------------------------------------------- */
    const notifSubscription = Notifications.addNotificationResponseReceivedListener(
      response => {
        const data = response.notification.request.content.data;
        console.log('🔔 Notification tapped:', data);

        if (data?.deepLink) {
          console.log('📌 Route via deepLink:', data.deepLink);
          handleDeepLink({ url: data.deepLink as string });
        }

        if (data?.route) {
          let route = (data.route as string).startsWith('/') ? data.route : '/' + data.route;
          console.log('📌 Route via data.route param:', route);
          handleDeepLink({ url: `pookiey://app${route}` });
        }
      }
    );

    /* ------------------------------------------
       🚀 Check if app was opened via a link
    ------------------------------------------- */
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🟢 Initial URL:', url);
        deepLinkState.setLastHandledUrl?.(url);
        handleDeepLink({ url });
      }
    });

    /* ------------------------------------------
       🧹 Cleanup
    ------------------------------------------- */
    return () => {
      linkSubscription.remove();
      notifSubscription.remove();
    };
  }, []);
};
