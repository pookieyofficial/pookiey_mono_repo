import { Request, Response } from "express";
import { User } from "../models";

export const getMe = async (req: Request, res: Response) => {
    try {
        console.log('getMe called with supabase_id:', (req.user as any)?.supabase_id);
        
        const user = (req.user as any)?.user;
        console.log('User found in DB:', !!user);
        
        if (!user) {
            console.log('User not found, returning 404');
            return res.status(404).json({ message: "User not found" });
        }
        
        console.log('User found, returning user data');
        res.json({ success: true, data: user });
    }
    catch (error) {
        console.log('getMe error:', error);
        res.status(400).json({ message: "Get user failed" });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { supabase_id, email, phoneNumber, displayName, photoURL, provider = "email" } = req.body;

        console.log({ supabase_id, email, phoneNumber, provider });

        if (!supabase_id) {
            return res.status(400).json({ success: false, message: "Supabase ID is required" });
        }

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // First check if user already exists with this supabase_id
        const existingUser = await User.findOne({ supabase_id });
        if (existingUser) {
            res.json({ success: true, message: "User already exists", data: existingUser });
            return;
        }

        // Check if user exists with this email but different supabase_id
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            // Update the existing user with the new supabase_id (account linking)
            console.log('Linking existing email account with new Supabase ID');
            const updatedUser = await User.findOneAndUpdate(
                { email },
                { 
                    supabase_id,
                    provider,
                    photoURL: photoURL || existingEmail.photoURL,
                    displayName: displayName || existingEmail.displayName,
                    isEmailVerified: true,
                    lastLoginAt: new Date()
                },
                { new: true }
            );
            res.json({ success: true, message: "Account linked successfully", data: updatedUser });
            return;
        }

        if (phoneNumber) {
            const existingPhone = await User.findOne({ phoneNumber });
            if (existingPhone) {
                res.status(400).json({ success: false, message: "Phone number already registered" });
                return;
            }
        }

        // Create new user with Supabase data
        const userData: any = {
            supabase_id,
            email,
            provider,
            displayName: displayName || email.split('@')[0], // Use email prefix as default display name
            photoURL,
            isEmailVerified: provider === "google" || provider === "email",
            isPhoneVerified: !!phoneNumber,
        };

        if (phoneNumber) {
            userData.phoneNumber = phoneNumber;
        }

        const response = await User.create(userData);
        res.json({ success: true, data: response });
    }
    catch (error: any) {
        console.log("Create user error:", error);
        res.status(400).json({ success: false, message: "Create user failed", error: error.message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const updatedUser = await User.findOneAndUpdate({ supabase_id: (user as any)?.supabase_id }, req.body, { new: true });
        if (!updatedUser) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        res.json({ success: true, data: updatedUser });
    }
    catch (error) {
        console.error('updateUser error:', error);
        res.status(400).json({ message: "Update user failed" });
    }
};