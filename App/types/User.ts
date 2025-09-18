// User types for frontend - matching backend MongoDB models

export interface User {
    _id?: string;
    user_id: string;
    email: string;
    phoneNumber?: string;
    displayName?: string;
    photoURL?: string;
    provider: "google" | "email" | "phone";
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    status: "active" | "banned" | "deleted" | "suspended";
    profile?: UserProfile;
    preferences?: UserPreferences;
    createdAt: Date | string;
    updatedAt: Date | string;
    lastLoginAt?: Date | string;
    notificationTokens?: string[];
}

export interface UserProfile {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string;
    gender: "male" | "female" | "other";
    bio?: string;
    location?: UserLocation;
    photos: UserPhoto[];
    interests: string[];
    height?: number;
    education?: string;
    occupation?: string;
    company?: string;
    school?: string;
    isOnboarded: boolean;
}

export interface UserLocation {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    city?: string;
    country?: string;
}

export interface UserPhoto {
    url: string;
    isPrimary?: boolean;
    uploadedAt: Date | string;
}

export interface UserPreferences {
    distanceMaxKm: number;
    ageRange: [number, number]; // [minAge, maxAge]
    showMe: ("male" | "female" | "other")[];
}

// API Request/Response types
export interface CreateUserRequest {
    user_id: string;
    email: string;
    phoneNumber?: string;
    displayName?: string;
    photoURL?: string;
    provider: "google" | "email" | "phone";
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
}

export interface UpdateUserProfileRequest {
    profile?: Partial<UserProfile>;
    preferences?: Partial<UserPreferences>;
    displayName?: string;
    photoURL?: string;
    notificationTokens?: string[];
}

export interface GetRecommendedUsersRequest {
    latitude: number;
    longitude: number;
    maxDistance: number; // in kilometers
    limit?: number;
    offset?: number;
}

export interface RecommendedUser {
    _id: string;
    profile: {
        firstName: string;
        lastName: string;
        dateOfBirth: Date | string;
        gender: "male" | "female" | "other";
        bio?: string;
        photos: UserPhoto[];
        interests: string[];
        occupation?: string;
        isOnboarded: boolean;
    };
    distance?: number; // distance in kilometers
    age?: number; // calculated age
}

export interface AuthUser {
    user_id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    provider: "google" | "email" | "phone";
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    status: "active" | "banned" | "deleted" | "suspended";
    isOnboarded: boolean;
    createdAt: Date | string;
    lastLoginAt?: Date | string;
}

export interface OnboardingData {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: "male" | "female" | "other";
    bio?: string;
    location?: {
        type: "Point";
        coordinates: [number, number];
        city?: string;
    };
    photos?: UserPhoto[];
    interests: string[];
    occupation?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Common API responses
export interface UserResponse extends ApiResponse<User> {}
export interface UsersResponse extends ApiResponse<User[]> {}
export interface RecommendedUsersResponse extends ApiResponse<RecommendedUser[]> {}
export interface AuthResponse extends ApiResponse<AuthUser> {}