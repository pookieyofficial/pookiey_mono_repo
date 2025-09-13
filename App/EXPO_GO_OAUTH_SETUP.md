# Expo Go OAuth Setup Guide

## 🔧 **The Issue You're Experiencing**

When using Google OAuth in Expo Go, after selecting a Google account, the browser redirects to `localhost:8081` instead of returning to the Expo Go app. This happens because the redirect URLs aren't properly configured for Expo Go.

## ✅ **Solution: Proper Redirect URL Configuration**

### **1. For Supabase Dashboard:**

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > URL Configuration**
3. Add these redirect URLs:

```
https://auth.expo.io/@your-expo-username/thedatingapp
exp://localhost:8081/--/auth/callback
exp://192.168.x.x:8081/--/auth/callback (your local IP)
thedatingapp://auth/callback
```

**Note:** Replace `your-expo-username` with your actual Expo username.

### **2. For Google Cloud Console:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add these **Authorized redirect URIs**:

```
https://auth.expo.io/@your-expo-username/thedatingapp
exp://localhost:8081/--/auth/callback
exp://192.168.x.x:8081/--/auth/callback
thedatingapp://auth/callback
```

## 🚀 **How the Fixed Implementation Works:**

### **For Expo Go (Development):**
1. Uses `AuthSession.makeRedirectUri()` without parameters
2. Automatically generates: `https://auth.expo.io/@username/project`
3. Expo Go handles the redirect properly

### **For Production Builds:**
1. Uses your custom scheme: `thedatingapp://auth/callback`
2. Works with standalone apps and app store builds

## 📱 **Testing Steps:**

1. **Start Expo Go** and scan your QR code
2. **Check console logs** - you should see:
   ```
   Expo Go Redirect URI: https://auth.expo.io/@username/thedatingapp
   ```
3. **Test Google sign-in** - should now return to Expo Go app
4. **Verify authentication** - user should be logged in

## 🔍 **Debugging Tips:**

### **Check Redirect URI:**
The console will log the redirect URI being used. Make sure it matches what you configured in Supabase and Google.

### **Common Issues:**

1. **Still redirecting to localhost:**
   - Make sure you're using the updated `useGoogleAuth` hook
   - Check that `signInWithGoogleMobile` is being called
   - Verify redirect URLs in Supabase dashboard

2. **OAuth flow cancelled:**
   - Check that Google OAuth client is properly configured
   - Verify that redirect URLs match exactly

3. **Exchange code failed:**
   - Check Supabase logs for authentication attempts
   - Verify that the OAuth provider is enabled in Supabase

## 🛠 **Environment Setup:**

Make sure your `.env` file has:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📋 **Quick Checklist:**

- [ ] Supabase redirect URLs configured
- [ ] Google OAuth redirect URIs configured  
- [ ] Using `signInWithGoogleMobile()` in login screen
- [ ] Environment variables set up
- [ ] Testing in Expo Go (not web browser)

## 🔄 **Alternative Approach (If Still Issues):**

If you're still having issues, you can try the web-based approach:

```typescript
const handleGoogleSignIn = async () => {
  try {
    // Open Google OAuth in web browser
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
  } catch (error: any) {
    showDialog('Google Sign In Failed', error.message, 'error');
  }
};
```

But the mobile-specific approach should work better for Expo Go.

## 🎯 **Expected Behavior After Fix:**

1. User taps "Continue with Google"
2. Browser opens with Google sign-in
3. User selects account
4. **Browser closes and returns to Expo Go app** ✅
5. User is authenticated and redirected to home screen

The key is using the Expo proxy URLs (`https://auth.expo.io/@username/project`) which Expo Go handles automatically!
