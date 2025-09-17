import { Request, Response } from "express";
import { User } from "../models";
import { parseForMonggoSetUpdates } from "../utils/parseReqBody";

export const getMe = async (req: Request, res: Response) => {
    try {

        const user = (req.user as any)?.user;
        console.log({ user })

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        console.log('getMe error:', error);
        res.status(400).json({ message: "Get user failed" });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { user_id, email, phoneNumber, displayName, photoURL, provider = "email" } = req.body;

        console.log({ user_id, email, phoneNumber, provider });

        if (!user_id) {
            return res.status(400).json({ success: false, message: "Supabase ID is required" });
        }

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // First check if user already exists with this user_id
        const existingUser = await User.findOne({ user_id });
        if (existingUser) {
            res.json({ success: true, message: "User already exists", data: existingUser });
            return;
        }

        // Check if a user already registered with this email
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            res.status(400).json({ success: false, message: "Email already registered" });
            return;
        }

        // Check if a user already registered with this phone number
        if (phoneNumber) {
            const existingPhone = await User.findOne({ phoneNumber });
            if (existingPhone) {
                res.status(400).json({ success: false, message: "Phone number already registered" });
                return;
            }
        }

        // Create new user with data from Supabase
        const userData: any = {
            user_id,
            email,
            provider,
            displayName: displayName || email.split('@')[0],
            photoURL,
            isEmailVerified: provider === "google" || provider === "email",
            isPhoneVerified: !!phoneNumber,
        };

        if (phoneNumber) {
            userData.phoneNumber = phoneNumber;
        }

        // Create new user in database
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
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        if (req.body.user_id || req.body.email || req.body.phoneNumber) {
            res.status(400).json({ message: "User ID, email, and phone number cannot be updated" });
            return;
        }

        const updates = parseForMonggoSetUpdates(req.body);
        console.log({ updates })

        const updatedUser = await User.findOneAndUpdate(
            { user_id: (user as any)?.user_id },
            { $set: updates as any },
            { new: true, runValidators: true });

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

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        console.log({ users })
        res.json({ success: true, data: users });
    }
    catch (error) {
        console.error('getUsers error:', error);
        res.status(400).json({ message: "Get users failed" });
    }
};