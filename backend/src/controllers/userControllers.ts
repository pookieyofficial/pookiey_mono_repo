import { Request, Response } from "express";
import { User } from "../models";
import { parseForMonggoSetUpdates } from "../utils/parseReqBody";

export const getMe = async (req: Request, res: Response) => {
    try {
        console.info("getMe controller");
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
        console.info("createUser controller");
        
        // Get user data from verified token (middleware sets this)
        const tokenUser = req.user as any;
        const { displayName, photoURL, provider = "google" } = req.body;
        
        // Use token data as source of truth for critical fields
        const user_id = tokenUser.user_id;
        const email = tokenUser.email;
        const phoneNumber = tokenUser.phoneNumber;

        console.log("Token user data:", { user_id, email, phoneNumber, provider });
        console.log("Request body data:", { displayName, photoURL, provider });

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
        console.info("updateUser controller");
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
        console.info("getUsers controller");
        const users = await User.find();
        console.log({ users })
        res.json({ success: true, data: users });
    }
    catch (error) {
        console.error('getUsers error:', error);
        res.status(400).json({ message: "Get users failed" });
    }
};