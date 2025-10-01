import { useEffect } from 'react';
import * as Linking from 'expo-linking';

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

  console.log('🔐 Magic link tokens detected, setting session...');
  
  try {
    const { supabase } = await import('@/config/supabaseConfig');
    
    const { data, error } = await supabase.auth.setSession({
      access_token: hashParams.access_token,
      refresh_token: hashParams.refresh_token,
    });
    
    if (error) {
      console.error('❌ Failed to set session:', error);
      return false;
    }
    
    console.log('✅ Session set successfully!');
    console.log('User:', data.user?.email);
    return true;
  } catch (error) {
    console.error('❌ Error setting session:', error);
    return false;
  }
};

const handleReferralLink = (queryParams: Record<string, any>): boolean => {
  if (queryParams?.ref) {
    console.log('👥 Referral detected:', queryParams.ref);
    // TODO: Add referral handling logic
    return true;
  }
  return false;
};

export const useDeepLinking = () => {
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log('🔗 Deep link received:', event.url);
      
      const { queryParams } = Linking.parse(event.url);
      const hashParams = parseHashParams(event.url);
      
      if (Object.keys(hashParams).length > 0) {
        console.log('📦 Hash params:', Object.keys(hashParams));
      }
      
      // Try each handler until one succeeds
      if (await handleMagicLinkTokens(hashParams)) return;
      if (handleReferralLink(queryParams || {})) return;
      
      // Add more handlers here as needed
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('📱 Initial URL:', url);
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, []);
};

