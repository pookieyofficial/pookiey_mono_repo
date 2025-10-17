import { Request, Response } from "express";
import { Messages } from "../models";
import { Matches } from "../models/Matches";
import mongoose from "mongoose";

// Get inbox with latest messages for all matches
export const getInbox = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.user_id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const inbox = await Matches.aggregate([
            // Step 1: Filter only this user's matches
            {
                $match: {
                    $or: [
                        { user1Id: userId },
                        { user2Id: userId }
                    ],
                    status: "matched"
                }
            },

            // Step 2: Lookup the latest message for each match
            {
                $lookup: {
                    from: "messages",
                    let: { matchId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$matchId", "$$matchId"] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: "lastMessage"
                }
            },

            // Step 3: Get the matched user's details
            {
                $addFields: {
                    otherUserId: {
                        $cond: [
                            { $eq: ["$user1Id", userId] },
                            "$user2Id",
                            "$user1Id"
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "otherUserId",
                    foreignField: "user_id",
                    as: "matchedUser"
                }
            },
            { $unwind: "$matchedUser" },

            // Step 4: Flatten lastMessage array
            {
                $unwind: {
                    path: "$lastMessage",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Step 5: Count unread messages
            {
                $lookup: {
                    from: "messages",
                    let: { matchId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$matchId", "$$matchId"] },
                                        { $eq: ["$receiverId", userId] },
                                        { $eq: ["$isRead", false] }
                                    ]
                                }
                            }
                        },
                        { $count: "count" }
                    ],
                    as: "unreadCount"
                }
            },

            // Step 6: Create a combined sort key
            {
                $addFields: {
                    sortTime: { $ifNull: ["$lastMessage.createdAt", "$createdAt"] },
                    unreadCount: { 
                        $ifNull: [{ $arrayElemAt: ["$unreadCount.count", 0] }, 0] 
                    }
                }
            },

            // Step 7: Final projection
            {
                $project: {
                    _id: 0,
                    matchId: "$_id",
                    userId: "$matchedUser.user_id",
                    name: {
                        $concat: [
                            { $ifNull: ["$matchedUser.profile.firstName", ""] },
                            " ",
                            { $ifNull: ["$matchedUser.profile.lastName", ""] }
                        ]
                    },
                    avatar: { 
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$matchedUser.profile.photos",
                                    as: "photo",
                                    cond: { $eq: ["$$photo.isPrimary", true] }
                                }
                            },
                            0
                        ]
                    },
                    lastMessage: {
                        text: "$lastMessage.text",
                        createdAt: "$lastMessage.createdAt",
                        senderId: "$lastMessage.senderId",
                        isRead: "$lastMessage.isRead"
                    },
                    matchedAt: "$createdAt",
                    sortTime: 1,
                    unreadCount: 1
                }
            },

            // Step 8: Sort by that combined time
            { $sort: { sortTime: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: inbox
        });

    } catch (error) {
        console.error("Error fetching inbox:", error);
        res.status(500).json({ 
            error: "Failed to fetch inbox",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

// Get messages for a specific match
export const getMessages = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.user_id;
        const { matchId } = req.params;
        const { limit = 50, before } = req.query;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Verify the match exists and user is part of it
        const match = await Matches.findById(matchId);
        if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const query: any = { matchId: new mongoose.Types.ObjectId(matchId) };
        
        if (before) {
            query.createdAt = { $lt: new Date(before as string) };
        }

        const messages = await Messages.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .lean();

        res.status(200).json({
            success: true,
            data: messages.reverse() // Return in chronological order
        });

    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ 
            error: "Failed to fetch messages",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.user_id;
        const { matchId, text, type = "text", mediaUrl } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!matchId || !text) {
            return res.status(400).json({ error: "Match ID and text are required" });
        }

        // Verify the match exists and user is part of it
        const match = await Matches.findById(matchId);
        if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const receiverId = match.user1Id === userId ? match.user2Id : match.user1Id;

        const message = new Messages({
            matchId,
            senderId: userId,
            receiverId,
            text,
            type,
            mediaUrl,
            isRead: false
        });

        await message.save();

        // Update match's lastInteractionAt
        await Matches.findByIdAndUpdate(matchId, {
            lastInteractionAt: new Date()
        });

        res.status(201).json({
            success: true,
            data: message
        });

    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ 
            error: "Failed to send message",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

// Mark messages as read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.user_id;
        const { matchId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Verify the match exists and user is part of it
        const match = await Matches.findById(matchId);
        if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const result = await Messages.updateMany(
            {
                matchId: new mongoose.Types.ObjectId(matchId),
                receiverId: userId,
                isRead: false
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date()
                }
            }
        );

        res.status(200).json({
            success: true,
            data: {
                modifiedCount: result.modifiedCount
            }
        });

    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ 
            error: "Failed to mark messages as read",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

// Delete a message
export const deleteMessage = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.user_id;
        const { messageId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const message = await Messages.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        if (message.senderId !== userId) {
            return res.status(403).json({ error: "You can only delete your own messages" });
        }

        await Messages.findByIdAndDelete(messageId);

        res.status(200).json({
            success: true,
            message: "Message deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ 
            error: "Failed to delete message",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

