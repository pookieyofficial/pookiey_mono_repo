import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { verifySupabaseToken } from "../config/supabase";

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        const supabaseUser = await verifySupabaseToken(token);

        if (!supabaseUser) {
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }

        const user = await User.findOne({ user_id: supabaseUser.id });

        if (!user) {
            // Return 404 so clients can create the user when the token is valid but account doesn't exist
            return res.status(404).json({ message: "User not found" });
        }

        const userStatuses = ["banned", "deleted", "suspended"];

        if (userStatuses.includes(user.status)) {
            return res.status(403).json({ message: `Unauthorized - Account is ${user.status}` });
        }


        req.user = user as any;
        console.log("User verified", user);
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        console.log({ token })
        const supabaseUser = await verifySupabaseToken(token);
        if (!supabaseUser) {
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }
        const user = await User.findOne({ user_id: supabaseUser.id });

        console.log({ user })
        req.user = {
            user_id: supabaseUser.id,
            email: supabaseUser.email,
            phoneNumber: supabaseUser.phone || supabaseUser.user_metadata?.phone,
            user: user
        } as any;
        console.log({ reqUser: req.user })
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Unauthorized", error: error });
    }
};