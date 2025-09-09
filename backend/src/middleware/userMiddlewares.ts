import { Request, Response, NextFunction } from "express";
import { admin } from "../config/firebase";
import { User } from "../models/User";

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);

    const user = await User.findById(decodedToken.uid);

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user as any;
    next();
};
