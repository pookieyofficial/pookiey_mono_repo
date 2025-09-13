import { useState } from 'react';
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseConfig';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export interface GoogleAuthResult {
  data: any;
  error: AuthError | null;
}

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);


  const signInWithGoogleMobile = async (): Promise<GoogleAuthResult> => {
    try {
      setLoading(true);

      const redirectUri = AuthSession.makeRedirectUri({});


      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri,
          {
            showInRecents: false,
            preferEphemeralSession: false,
          }
        );


        if (result.type === 'success' && result.url) {

          const url = new URL(result.url);
          const hash = url.hash.substring(1);
          const params = new URLSearchParams(hash);

          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const error = params.get('error');

          if (error) {
            throw new AuthError(`OAuth error: ${error}`);
          }

          if (accessToken) {
            console.log({ accessToken, refreshToken });

            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) {
              throw sessionError;
            }

            return { data: sessionData, error: null };
          }
        } else if (result.type === 'cancel') {
          throw new AuthError('OAuth flow was cancelled');
        }
      }

      return { data: null, error: new AuthError('OAuth flow failed') };
    } catch (error) {
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signInWithGoogleMobile,
  };
}