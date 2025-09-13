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

        const user = await User.findOne({ supabase_id: supabaseUser.id });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized - User not found" });
        }

        req.user = user as any;
        next();
    }
    catch (error) {
        console.error('verifyUser error:', error);
        return res.status(401).json({ message: "Unauthorized", error: error });
    }
};

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        const supabaseUser = await verifySupabaseToken(token);
        if (!supabaseUser) {
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }

        const user = await User.findOne({ supabase_id: supabaseUser.id });
        
        req.user = { 
            supabase_id: supabaseUser.id, 
            email: supabaseUser.email,
            phoneNumber: supabaseUser.phone,
            user: user
        } as any;
        
        next();
    }
    catch (error) {
        console.error('verifyToken error:', error);
        return res.status(401).json({ message: "Unauthorized", error: error });
    }
};