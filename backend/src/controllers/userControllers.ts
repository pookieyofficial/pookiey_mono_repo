import { Request, Response } from "express";
import { User } from "../models";

export const getMe = async (req: Request, res: Response) => {
    try {
        console.log('getMe called with uid:', req.user?.uid);
        
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
        const { uid, phoneNumber } = req.body;

        console.log({ uid, phoneNumber });

        if (!uid) {
            return res.status(400).json({ success: false, message: "UID is required" });
        }

        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: "Phone number is required" });
        }

        const existingUser = await User.findOne({ uid });
        if (existingUser) {
            res.json({ success: false, message: "User already exists", data: existingUser });
            return;
        }

        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
            res.status(400).json({ success: false, message: "Phone number already registered" });
            return;
        }

        const response = await User.create({ uid, phoneNumber });
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
        const updatedUser = await User.findOneAndUpdate({ uid: user?.uid }, req.body, { new: true });
        if (!updatedUser) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        res.json({ success: true, data: updatedUser });
    }
    catch (error) {
        res.status(400).json({ message: "Update user failed" });
    }
};