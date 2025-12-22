import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { verifySupabaseToken } from "../config/supabase";



export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
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


        const isAdmin = user?.isAdmin || user?.isModerator
        
        

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
