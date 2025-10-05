import { Request, Response } from "express";
import mongoose from "mongoose";
import { Interaction } from "../models/Interactions";
import { Matches } from "../models/Matches";

// This function is used to handle the interaction between two users and check if they are matched
export const interaction = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const fromUser = (req.user as any)?.user_id as string;
        const toUser = req.query.toUser as string;
        const type = req.query.type as string;

        if (!fromUser) {
            return res.status(400).json({ message: "User not found" });
        }
        if (!toUser || !type) {
            return res.status(400).json({ message: "To user and type are required" });
        }
        if (toUser === fromUser) {
            return res.status(400).json({ message: "You cannot interact with yourself" });
        }

        // validate type
        const allowedTypes = ["like", "dislike", "superlike"];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ message: "Invalid interaction type" });
        }

        // Check if interaction already exists (fromUser → toUser)
        let interaction = await Interaction.findOne({ fromUser, toUser }).session(session);

        if (interaction) {
            res.status(400).json({ message: "Interaction already exists" });
            return;
        }

        // Otherwise create a new interaction
        const newInteraction = await Interaction.create([{ fromUser, toUser, type }], { session });

        // Check if other user has interacted with this user
        const otherUserInteraction = await Interaction.findOne({ fromUser: toUser, toUser: fromUser }).session(session);

        // Create a match if both users have positive interactions (like or superlike)
        if (otherUserInteraction && 
            (otherUserInteraction.type === "like" || otherUserInteraction.type === "superlike") &&
            (type === "like" || type === "superlike")) {

            const match = await Matches.create(
                [{ user1Id: fromUser, user2Id: toUser, status: "matched", initiatedBy: fromUser }],
                { session }
            );
            await session.commitTransaction();
            return res.json({ success: true, match: match[0], isMatch: true });
        }

        await session.commitTransaction();
        res.json({ success: true, data: newInteraction[0], isMatch: false });
    } catch (error) {
        await session.abortTransaction();
        console.error("interaction error:", error);
        res.status(400).json({ message: "Interaction failed" });
    } finally {
        session.endSession();
    }
};