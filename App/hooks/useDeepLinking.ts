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

  try {
    const { supabase } = await import('@/config/supabaseConfig');

    const { data, error } = await supabase.auth.setSession({
      access_token: hashParams.access_token,
      refresh_token: hashParams.refresh_token,
    });

    if (error) {
      deepLinkState.setProcessing(false);
      return false;
    }

    deepLinkState.setProcessing(false);
    return true;
  } catch (error) {
    deepLinkState.setProcessing(false);
    return false;
  }
};

/* --------------------------------------------------------
   👥 Referral Link Handler
-------------------------------------------------------- */
const handleReferralLink = (queryParams: Record<string, any>): boolean => {
  if (queryParams?.ref) {
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

      const last = deepLinkState.getLastHandledUrl?.();
      if (last && last === event.url) {
        return;
      }
      deepLinkState.setLastHandledUrl?.(event.url);

      // Parse URL
      const { queryParams } = Linking.parse(event.url);
      const hashParams = parseHashParams(event.url);

      const parsed = Linking.parse(event?.url);

      /* 📍 Determine Target Route */
      let targetRoute: string | null = null;

      if (queryParams?.route && typeof queryParams.route === 'string') {
        targetRoute = queryParams.route.startsWith('/')
          ? queryParams.route
          : '/' + queryParams.route;
      } else if (parsed.path) {
        targetRoute = parsed.path.startsWith('/')
          ? parsed.path
          : '/' + parsed.path;
      }

      /* 🔐 Handle Magic Link Login */
      const hasMagicLinkTokens = await handleMagicLinkTokens(hashParams);
      if (hasMagicLinkTokens && targetRoute) {
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
          router.push(targetRoute as any);
          deepLinkState.clearPendingDeeplink();
        } else if (isAuthenticated && !dbUser?.profile?.isOnboarded) {
          deepLinkState.setPendingDeeplink(targetRoute);
        } else {
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

        if (data?.deepLink) {
          handleDeepLink({ url: data.deepLink as string });
        }

        if (data?.route) {
          let route = (data.route as string).startsWith('/') ? data.route : '/' + data.route;
          handleDeepLink({ url: `pookiey://app${route}` });
        }
      }
    );

    /* ------------------------------------------
       🚀 Check if app was opened via a link
    ------------------------------------------- */
    Linking.getInitialURL().then((url) => {
      if (url) {
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
