import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { verifySupabaseToken } from "../config/supabase";

// List of admin user emails - in production, store this in env or database
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
    console.log("verifyAdmin middleware");
    console.log({ ADMIN_EMAILS })
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }

        const supabaseUser = await verifySupabaseToken(token);

        if (!supabaseUser) {
            return res.status(401).json({ success: false, message: "Unauthorized - Invalid token" });
        }

        const user = await User.findOne({ user_id: supabaseUser.id });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if user is admin (by email or add isAdmin field to User model)
        const isAdmin = ADMIN_EMAILS.includes(user.email) 
        
        

        if (!isAdmin) {
            return res.status(403).json({ success: false, message: "Forbidden - Admin access required" });
        }

        req.user = user as any;
        next();
    } catch (error) {
        console.error("Admin verification error:", error);
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};
