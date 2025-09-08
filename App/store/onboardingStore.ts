import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OnboardingState {
    fullName: string;
    birthday: string;
    gender: string;
    location: string;
    occupation: string;
    interests: string[];
    bio: string;
    profilePicture: string;
}

interface OnboardingActions {
    setFullName: (fullName: string) => void;
    setBirthday: (birthday: string) => void;
    setGender: (gender: string) => void;
    setLocation: (location: string) => void;
    setOccupation: (occupation: string) => void;
    setInterests: (interests: string[]) => void;
    setBio: (bio: string) => void;
    setProfilePicture: (profilePicture: string) => void;
}

type OnboardingStore = OnboardingState & OnboardingActions;

const initialState: OnboardingState = {
    fullName: '',
    birthday: '',
    gender: '',
    location: '',
    occupation: '',
    interests: [],
    bio: '',
    profilePicture: '',
}

export const useOnboardingStore = create<OnboardingStore>()(
    persist(
        (set, get) => ({
            ...initialState,
            setFullName: (fullName: string) => set({ fullName }),
            setBirthday: (birthday: string) => set({ birthday }),
            setGender: (gender: string) => set({ gender }),
            setLocation: (location: string) => set({ location }),
            setOccupation: (occupation: string) => set({ occupation }),
            setInterests: (interests: string[]) => set({ interests }),
            setBio: (bio: string) => set({ bio }),
            setProfilePicture: (profilePicture: string) => set({ profilePicture }),
            }),
        {
            name: 'onboarding-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                fullName: state.fullName,
                birthday: state.birthday,
                gender: state.gender,
                location: state.location,
                occupation: state.occupation,
                interests: state.interests,
                bio: state.bio,
                profilePicture: state.profilePicture,
            }),
        }
    )
)