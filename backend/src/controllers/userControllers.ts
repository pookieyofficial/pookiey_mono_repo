import { Request, Response } from "express";
import { User } from "../models";

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(400).json({ message: "Get user failed" });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { uid, phoneNumber } = req.body;

        console.log({ uid });

        const user = await User.findOne({ uid });
        if (user) {
            res.json({ success: false, message: "User already exists", data: user });
            return;
        }
        const response = await User.create({ uid, phoneNumber });
        res.json({ success: true, data: response });
    }
    catch (error) {
        res.status(400).json({ success: false, message: "Create user failed", data: error });
        console.log(error)
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