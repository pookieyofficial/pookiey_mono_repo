# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication with Google OAuth for your dating app.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account or sign in
2. Click "New Project" and fill in your project details
3. Choose a region close to your users for better performance
4. Set a strong database password and save it securely

## 2. Configure Environment Variables

Create a `.env` file in your `App` directory with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard under Settings > API.

## 3. Set up Google OAuth

### 3.1 Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client IDs for:
   - Web application (for web builds)
   - iOS application (for iOS builds)
   - Android application (for Android builds)

### 3.2 Configure Supabase Auth

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID: Your Google OAuth client ID
   - Client Secret: Your Google OAuth client secret
4. Add redirect URLs:
   - For development: `http://localhost:8081/auth/callback`
   - For production: Your production domain + `/auth/callback`

## 4. Database Schema

The authentication system expects a user profile structure. You may need to create additional tables for user profiles, matches, etc.

Example user profile table:

```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  phone TEXT,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 5. Phone Authentication Setup

For phone authentication, you'll need to configure Twilio in Supabase:

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure SMS settings with your Twilio credentials
3. Set up phone number verification templates

## 6. Testing the Implementation

1. Start your development server: `npm start`
2. Navigate to the auth screen
3. Test Google sign-in
4. Test phone number authentication
5. Verify that users are properly redirected after authentication

## 7. Migration from Firebase

The new Supabase implementation is designed to be modular and maintain the same user experience as the Firebase implementation. The main changes are:

- `useAuthStateManager` → `useSupabaseAuthStateManager`
- `usePhoneAuth` → `useSupabasePhoneAuth`
- New `useGoogleAuth` hook for Google OAuth
- Updated auth store to work with Supabase user types

## 8. File Structure

```
App/
├── config/
│   └── supabaseConfig.ts          # Supabase client configuration
├── hooks/
│   ├── useSupabaseAuth.ts         # Main Supabase auth hook
│   ├── useSupabaseAuthStateManager.ts # Auth state management
│   ├── useSupabasePhoneAuth.ts    # Phone authentication
│   └── useGoogleAuth.ts           # Google OAuth
├── store/
│   └── authStore.ts               # Updated auth store
└── app/(auth)/
    └── supabase-login.tsx         # New login screen with Google OAuth
```

## 9. Troubleshooting

### Common Issues:

1. **Google OAuth not working**: Check that redirect URLs are correctly configured in both Google Cloud Console and Supabase
2. **Phone auth not working**: Verify Twilio configuration in Supabase
3. **Environment variables not loading**: Ensure `.env` file is in the correct location and variables start with `EXPO_PUBLIC_`

### Debug Mode:

Enable debug logging by setting `EXPO_PUBLIC_DEBUG=true` in your environment variables.

## 10. Production Deployment

1. Update environment variables for production
2. Configure production redirect URLs
3. Set up proper error monitoring
4. Test all authentication flows in production environment

For more detailed information, refer to the [Supabase documentation](https://supabase.com/docs/guides/auth).
