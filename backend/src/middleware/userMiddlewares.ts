import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import { User } from "../models/User";

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decodedToken = await admin.auth().verifyIdToken(token);

        const user = await User.findOne({ uid: decodedToken.uid });

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user as any;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Unauthorized", error: error });
    }
};

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        const user = await User.findOne({ uid: decodedToken.uid });
        req.user = { 
            uid: decodedToken.uid, 
            phoneNumber: decodedToken.phone_number,
            user: user
        } as any;
        
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Unauthorized", error: error });
    }
};