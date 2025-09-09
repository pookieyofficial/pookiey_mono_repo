
export interface User {
  _id?: string;
  uid: string;
  email: string;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  status: 'active' | 'inactive' | 'blocked' | 'deleted';
  preferences: UserPreferences;

}

export interface UserPreferences {
  interestedIn: ('male' | 'female' | 'other')[];
  ageRange: [number, number];
  distanceRangeKm: number;
  education: string[];
  occupation: string[];
}


export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bio?: string;
  location?: {
    coordinates: [number, number];
    city?: string;
    country?: string;
  };
  photos: string[];
  interests: string[];
  height?: number;
  education?: string;
  occupation?: string;
  company?: string;
  school?: string;
  isOnboarded: boolean;
  visibleTo: 'public' | 'private';
  isPremium: boolean;
  isVerified: boolean;
}

export interface Match {
  _id?: string;
  user1Id: string;
  user2Id: string;
  status: 'pending' | 'matched' | 'unmatched' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id?: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'gif' | 'video';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

