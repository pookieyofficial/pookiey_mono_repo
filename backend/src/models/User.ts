import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    supabase_id: string;
    email: string;
    phoneNumber?: string;
    displayName?: string;
    photoURL?: string;
    provider: "google" | "email" | "phone";
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    status: "active" | "banned" | "deleted" | "suspended";
    profile?: IUserProfile;
    preferences?: IUserPreferences;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
}

export interface IUserProfile {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: "male" | "female" | "other";
    bio?: string;
    location?: {
        type: "Point";
        coordinates: [number, number];
        city?: string;
        country?: string;
    };
    photos: { url: string; isPrimary?: boolean; uploadedAt: Date }[];
    interests: string[];
    height?: number;
    education?: string;
    occupation?: string;
    company?: string;
    school?: string;
    isOnboarded: boolean;
}

export interface IUserPreferences {
    distanceMaxKm: number;
    ageRange: [number, number];
    showMe: ("male" | "female" | "other")[];
}

const UserSchema = new Schema<IUser>(
    {
        supabase_id: { type: String, required: true, unique: true, index: true },
        email: { type: String, required: true, unique: true, index: true },
        phoneNumber: { type: String, unique: true, sparse: true, index: true },
        displayName: String,
        photoURL: String,
        provider: { 
            type: String, 
            enum: ["google", "email", "phone"], 
            required: true,
            default: "email"
        },
        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ["active", "banned", "deleted", "suspended"],
            default: "active",
        },
        profile: {
            firstName: { type: String, index: true },
            lastName: { type: String, index: true },
            dateOfBirth: Date,
            gender: { type: String, enum: ["male", "female", "other"] },
            bio: String,
            location: {
                type: { type: String, enum: ["Point"], default: "Point" },
                coordinates: { type: [Number], index: "2dsphere" },
                city: String,
                country: String,
            },
            photos: [
                {
                    url: String,
                    isPrimary: { type: Boolean, default: false },
                    uploadedAt: { type: Date, default: Date.now },
                },
            ],
            interests: [String],
            height: Number,
            education: String,
            occupation: String,
            company: String,
            school: String,
            isOnboarded: { type: Boolean, default: false },
        },
        preferences: {
            distanceMaxKm: { type: Number, default: 50 },
            ageRange: { type: [Number], default: [18, 35] },
            showMe: { type: [String], enum: ["male", "female", "other"] },
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        lastLoginAt: Date,
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
