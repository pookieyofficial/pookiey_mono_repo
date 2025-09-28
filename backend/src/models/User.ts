import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    user_id: string;
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
    notificationTokens?: string[];
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
    notificationPermissions: {
        like: boolean;
        message: boolean;
        match: boolean;
        comment: boolean;
        follow: boolean;
    };
}

const UserSchema = new Schema<IUser>(
    {
        user_id: { type: String, required: true, unique: true, index: true },
        email: { type: String, required: true, unique: true, index: true },
        phoneNumber: { type: String, unique: true, sparse: true, index: true, },
        displayName: { type: String, default: "" },
        photoURL: { type: String, default: "" },
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
            bio: { type: String, default: "" },
            location: {
                type: { type: String, enum: ["Point"], default: "Point" },
                coordinates: { type: [Number], index: "2dsphere" },
                city: String,
                country: String,
            },
            photos: [
                {
                    url: { type: String, default: "" },
                    isPrimary: { type: Boolean, default: false },
                    uploadedAt: { type: Date, default: Date.now },
                },
            ],
            interests: [String],
            height: { type: Number, default: 0 },
            education: { type: String, default: "" },
            occupation: { type: String, default: "" },
            company: { type: String, default: "" },
            school: { type: String, default: "" },
            isOnboarded: { type: Boolean, default: false },
        },
        preferences: {
            distanceMaxKm: { type: Number, default: 50 },
            ageRange: { type: [Number], default: [18, 35] },
            showMe: { type: [String], enum: ["male", "female", "other"] },
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        lastLoginAt: { type: Date, default: Date.now },
        notificationTokens: { type: [String], default: [] },
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("Users", UserSchema);
