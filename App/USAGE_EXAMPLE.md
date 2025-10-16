# Database User Data Usage Guide

## Overview
The auth store now properly saves and persists the complete user data from MongoDB alongside the Supabase authentication data.

## Type Imports
All auth-related types are now organized in `types/Auth.ts`:
```typescript
import { SupabaseUser, DBUser } from '@/types/Auth';
```

## What's Changed

### Before
```typescript
// Only Supabase user data was saved
const user = useAuthStore((state) => state.user);
// user only had: id, email, phone, user_metadata, app_metadata
```

### After
```typescript
// Now you have both Supabase auth data AND full database user data
const supabaseUser = useAuthStore((state) => state.user);  // Supabase auth data
const dbUser = useAuthStore((state) => state.dbUser);      // Full MongoDB user data
```

## Using the Database User Data

### Method 1: Direct Access from Store
```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const dbUser = useAuthStore((state) => state.dbUser);
  
  // Access user properties
  const displayName = dbUser?.displayName;
  const profile = dbUser?.profile;
  const photos = dbUser?.profile?.photos;
  const isOnboarded = dbUser?.profile?.isOnboarded;
  
  return (
    <View>
      <Text>{displayName}</Text>
      {profile?.photos?.[0] && (
        <Image source={{ uri: profile.photos[0].url }} />
      )}
    </View>
  );
}
```

### Method 2: Using the Custom Hook (Recommended)
```typescript
import { useDbUser } from '@/hooks/useDbUser';

function MyComponent() {
  const { 
    dbUser, 
    profile, 
    preferences, 
    isOnboarded, 
    displayName,
    photoURL 
  } = useDbUser();
  
  return (
    <View>
      <Text>{displayName}</Text>
      <Text>Age: {calculateAge(profile?.dateOfBirth)}</Text>
      <Text>Bio: {profile?.bio}</Text>
    </View>
  );
}
```

## Available User Properties

The `dbUser` object contains:

```typescript
{
  _id: string;
  user_id: string;
  email: string;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  provider: "google" | "email" | "phone";
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: "active" | "banned" | "deleted" | "suspended";
  
  profile?: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string;
    gender: "male" | "female" | "other";
    bio?: string;
    location?: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
      city?: string;
      country?: string;
    };
    photos: Array<{
      url: string;
      isPrimary?: boolean;
      uploadedAt: Date | string;
    }>;
    interests: string[];
    height?: number;
    education?: string;
    occupation?: string;
    company?: string;
    school?: string;
    isOnboarded: boolean;
  };
  
  preferences?: {
    distanceMaxKm: number;
    ageRange: [number, number]; // [minAge, maxAge]
    showMe: ("male" | "female" | "other")[];
  };
  
  createdAt: Date | string;
  updatedAt: Date | string;
  lastLoginAt?: Date | string;
  notificationTokens?: string[];
}
```

## Updating User Data

### Method 1: Update via API and then update store
```typescript
import { useUser } from '@/hooks/useUser';
import { useAuthStore } from '@/store/authStore';

async function updateProfile() {
  const { updateUser } = useUser();
  const idToken = useAuthStore.getState().idToken;
  const setDbUser = useAuthStore.getState().setDbUser;
  
  // Update on backend
  const response = await updateUser(idToken, {
    profile: {
      bio: "New bio",
      occupation: "Software Engineer"
    }
  });
  
  // Update local store
  if (response?.data) {
    setDbUser(response.data);
  }
}
```

### Method 2: Optimistic update (update store immediately)
```typescript
import { useDbUser } from '@/hooks/useDbUser';

function MyComponent() {
  const { updateDbUser } = useDbUser();
  
  const handleUpdate = () => {
    // Update store immediately for better UX
    updateDbUser({
      profile: {
        ...profile,
        bio: "New bio"
      }
    });
    
    // Then sync with backend
    // ... API call
  };
}
```

## Persistence

The `dbUser` data is automatically persisted to AsyncStorage alongside other auth data. When the app restarts, it will be automatically restored.

## Complete Example: Profile Screen

```typescript
import React from 'react';
import { View, Text, Image, Button } from 'react-native';
import { useDbUser } from '@/hooks/useDbUser';
import { useUser } from '@/hooks/useUser';
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const { dbUser, profile, isOnboarded, displayName } = useDbUser();
  const { updateUser } = useUser();
  const idToken = useAuthStore((state) => state.idToken);
  const setDbUser = useAuthStore((state) => state.setDbUser);
  
  const calculateAge = (dob: Date | string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    return today.getFullYear() - birthDate.getFullYear();
  };
  
  const handleUpdateBio = async (newBio: string) => {
    if (!idToken) return;
    
    try {
      const response = await updateUser(idToken, {
        profile: { bio: newBio }
      });
      
      if (response?.data) {
        setDbUser(response.data);
      }
    } catch (error) {
      console.error('Failed to update bio:', error);
    }
  };
  
  if (!dbUser) {
    return <Text>Loading...</Text>;
  }
  
  return (
    <View>
      {/* Profile Picture */}
      {profile?.photos?.[0] && (
        <Image 
          source={{ uri: profile.photos[0].url }} 
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
      )}
      
      {/* Basic Info */}
      <Text>{displayName}</Text>
      {profile?.dateOfBirth && (
        <Text>Age: {calculateAge(profile.dateOfBirth)}</Text>
      )}
      <Text>{profile?.occupation}</Text>
      
      {/* Bio */}
      <Text>{profile?.bio || 'No bio yet'}</Text>
      
      {/* Interests */}
      <View>
        {profile?.interests?.map((interest, index) => (
          <Text key={index}>{interest}</Text>
        ))}
      </View>
      
      {/* Location */}
      {profile?.location && (
        <Text>
          {profile.location.city}, {profile.location.country}
        </Text>
      )}
      
      {/* Preferences */}
      <Text>
        Looking for: {dbUser.preferences?.showMe?.join(', ')}
      </Text>
      <Text>
        Age Range: {dbUser.preferences?.ageRange?.[0]} - {dbUser.preferences?.ageRange?.[1]}
      </Text>
      <Text>
        Distance: {dbUser.preferences?.distanceMaxKm} km
      </Text>
    </View>
  );
}
```

