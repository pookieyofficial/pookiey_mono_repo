import { useState } from 'react';
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseConfig';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Complete the auth session for web browser
WebBrowser.maybeCompleteAuthSession();

export interface GoogleAuthResult {
  data: any;
  error: AuthError | null;
}

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
    try {
      setLoading(true);

      if (Platform.OS === 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        return { data, error: null };
      } else {
        // Mobile implementation using proper redirect handling
        const redirectUri = AuthSession.makeRedirectUri({
          scheme: 'thedatingapp',
          path: 'auth/callback',
        });

        console.log('Redirect URI:', redirectUri);

        // Create the OAuth URL with proper parameters
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
          // Use WebBrowser for OAuth flow
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectUri,
            {
              showInRecents: false,
              preferEphemeralSession: false,
            }
          );

          console.log('OAuth result:', result);

          if (result.type === 'success' && result.url) {
            console.log('Success URL:', result.url);
            
            // Parse the URL to get the access token (Supabase returns token directly)
            const url = new URL(result.url);
            const hash = url.hash.substring(1); // Remove the # symbol
            const params = new URLSearchParams(hash);
            
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const error = params.get('error');

            if (error) {
              throw new AuthError(`OAuth error: ${error}`);
            }

            if (accessToken) {
              console.log('Access token received, setting session...');
              
              // Set the session directly with the tokens
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });

              if (sessionError) {
                console.error('Session error:', sessionError);
                throw sessionError;
              }
              
              console.log('Session set successfully');
              return { data: sessionData, error: null };
            }
          } else if (result.type === 'cancel') {
            console.log('OAuth flow was cancelled by user');
            throw new AuthError('OAuth flow was cancelled');
          } else {
            console.log('OAuth flow failed:', result.type);
          }
        }

        return { data: null, error: new AuthError('OAuth flow failed') };
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogleWeb = async (): Promise<GoogleAuthResult> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with Google (Web):', error);
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogleMobile = async (): Promise<GoogleAuthResult> => {
    try {
      setLoading(true);

      // For Expo Go, use the proxy approach
      const redirectUri = AuthSession.makeRedirectUri({
        // Expo Go automatically uses the proxy
      });

      console.log('Expo Go Redirect URI:', redirectUri);

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
        // For Expo Go, use WebBrowser with the proxy URL
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri,
          {
            showInRecents: false,
            preferEphemeralSession: false, // Keep session for Expo Go
          }
        );

        console.log('Expo Go OAuth result:', result);

        if (result.type === 'success' && result.url) {
          console.log('Expo Go Success URL:', result.url);
          
          // Parse the URL to get the access token (Supabase returns token directly)
          const url = new URL(result.url);
          const hash = url.hash.substring(1); // Remove the # symbol
          const params = new URLSearchParams(hash);
          
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const error = params.get('error');

          if (error) {
            throw new AuthError(`OAuth error: ${error}`);
          }

          if (accessToken) {
            console.log('Expo Go access token received, setting session...');
            
            // Set the session directly with the tokens
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) {
              console.error('Expo Go session error:', sessionError);
              throw sessionError;
            }
            
            console.log('Expo Go session set successfully');
            return { data: sessionData, error: null };
          }
        } else if (result.type === 'cancel') {
          console.log('Expo Go OAuth flow was cancelled by user');
          throw new AuthError('OAuth flow was cancelled');
        } else {
          console.log('Expo Go OAuth flow failed:', result.type);
        }
      }

      return { data: null, error: new AuthError('OAuth flow failed') };
    } catch (error) {
      console.error('Error signing in with Google (Expo Go):', error);
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signInWithGoogle,
    signInWithGoogleWeb,
    signInWithGoogleMobile,
  };
}