import { Request, Response } from "express";
import mongoose from "mongoose";
import { Interaction } from "../models/Interactions";
import { Matches } from "../models/Matches";
import { User } from "../models";
import { SUBSCRIPTION_PLANS, SubscriptionPlanId } from "../config/subscriptionPlans";
import { checkAndUpdateInteractionLimit } from "../services/subscriptionService";

// This function is used to handle the interaction between two users and check if they are matched
export const interaction = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const fromUser = (req.user as any)?.user_id as string;
        const toUser = req.query.toUser as string;
        const type = req.query.type as string;

        if (!fromUser || !toUser || !type) {
            return res.status(400).json({ message: "Either fromUser or toUser or interaction type is not provided" });
        }
        if (toUser === fromUser) {
            return res.status(400).json({ message: "You cannot interact with yourself" });
        }

        // validate type
        const allowedTypes = ["like", "dislike", "superlike"];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ message: "Invalid interaction type" });
        }

        // Check if interaction already exists (fromUser -> toUser)
        let interaction = await Interaction.findOne({ fromUser, toUser }).session(session);

        if (interaction) {
            res.json({ message: "Already interacted with this user" });
            return;
        }

        const user = await User.findOne({ user_id: fromUser }).session(session);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const limitCheck = await checkAndUpdateInteractionLimit(user._id as mongoose.Types.ObjectId, session);
        
        if (!limitCheck.allowed) {
            await session.abortTransaction();
            return res.json({
                success: false,
                message: "Daily interaction limit reached",
                showPriceModal: true,
                limit: limitCheck.limit,
                remaining: limitCheck.remaining
            });
        }

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

            const [user1Details, user2Details] = await Promise.all([
                User.findOne({ user_id: fromUser }).select('user_id displayName photoURL profile').session(session),
                User.findOne({ user_id: toUser }).select('user_id displayName photoURL profile').session(session)
            ]);

            await session.commitTransaction();

            return res.json({
                success: true,
                match: match[0],
                isMatch: true,
                matchId: match[0]._id,
                user1: {
                    user_id: user1Details?.user_id,
                    displayName: user1Details?.displayName,
                    photoURL: user1Details?.photoURL || user1Details?.profile?.photos?.[0]?.url,
                    profile: {
                        firstName: user1Details?.profile?.firstName,
                        photos: user1Details?.profile?.photos
                    }
                },
                user2: {
                    user_id: user2Details?.user_id,
                    displayName: user2Details?.displayName,
                    photoURL: user2Details?.photoURL || user2Details?.profile?.photos?.[0]?.url,
                    profile: {
                        firstName: user2Details?.profile?.firstName,
                        photos: user2Details?.profile?.photos
                    }
                }
            });
        }

        await session.commitTransaction();
        res.json({ success: true, data: newInteraction[0], isMatch: false });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: "Interaction failed" });
    } finally {
        session.endSession();
    }
};