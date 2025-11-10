import { Request, Response } from "express";
import { Story, IStory } from "../models/Story";
import { User } from "../models/User";
import { Matches } from "../models/Matches";

// Get all stories from all users (not limited to matches)
export const getStories = async (req: Request, res: Response) => {
    try {
        console.info("getStories controller");
        const currentUserId = (req.user as any)?.user_id;

        if (!currentUserId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        // Get all users who have stories (not expired)
        const usersWithStories = await Story.distinct("userId", {
            expiresAt: { $gt: new Date() }
        });

        // Get stories from all users
        const storiesByUser = await Promise.all(
            usersWithStories.map(async (userId) => {
                const user = await User.findOne({ user_id: userId }).select("user_id displayName photoURL profile");
                if (!user) return null;

                const userStories = await Story.find({
                    userId,
                    expiresAt: { $gt: new Date() }
                }).sort({ createdAt: -1 });

                if (userStories.length === 0) return null;

                // Check if current user has viewed all stories
                const allViewed = userStories.every(story => 
                    story.views.includes(currentUserId)
                );

                return {
                    id: user.user_id,
                    username: user.displayName || `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || "User",
                    avatar: user.profile?.photos?.[0]?.url || user.photoURL || "",
                    stories: userStories.map((story: IStory) => ({
                        id: (story._id as any)?.toString() || "",
                        type: story.type,
                        url: story.mediaUrl,
                        duration: story.type === "video" ? 15 : 5, // 15s for video, 5s for image
                        isSeen: story.views.includes(currentUserId),
                        createdAt: story.createdAt
                    })),
                    isMe: userId === currentUserId
                };
            })
        );

        const filteredStories = storiesByUser.filter(item => item !== null);

        // Sort: my story first, then others
        filteredStories.sort((a, b) => {
            if (a?.isMe) return -1;
            if (b?.isMe) return 1;
            return 0;
        });

        res.json({
            success: true,
            data: filteredStories
        });
    } catch (error) {
        console.error("getStories error:", error);
        res.status(400).json({ success: false, message: "Get stories failed" });
    }
};

// Create a new story
export const createStory = async (req: Request, res: Response) => {
    try {
        console.info("createStory controller");
        const currentUserId = (req.user as any)?.user_id;

        if (!currentUserId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const { type, mediaUrl } = req.body;

        if (!type || !["image", "video"].includes(type)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid story type. Must be 'image' or 'video'" 
            });
        }

        if (!mediaUrl) {
            return res.status(400).json({ 
                success: false, 
                message: "Media URL is required" 
            });
        }

        // Create story with 24 hour expiration
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const storyData = {
            userId: currentUserId,
            type,
            mediaUrl,
            views: [],
            expiresAt
        };

        const newStory = await Story.create(storyData);

        res.json({
            success: true,
            data: newStory
        });
    } catch (error) {
        console.error("createStory error:", error);
        res.status(400).json({ success: false, message: "Create story failed" });
    }
};

// Mark story as viewed
export const viewStory = async (req: Request, res: Response) => {
    try {
        console.info("viewStory controller");
        const currentUserId = (req.user as any)?.user_id;
        const { storyId } = req.params;

        if (!currentUserId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ success: false, message: "Story not found" });
        }

        // Don't count self-views
        if (story.userId === currentUserId) {
            return res.json({ success: true, data: story });
        }

        // Add view if not already viewed
        if (!story.views.includes(currentUserId)) {
            story.views.push(currentUserId);
            await story.save();
        }

        res.json({ success: true, data: story });
    } catch (error) {
        console.error("viewStory error:", error);
        res.status(400).json({ success: false, message: "View story failed" });
    }
};

// Delete a story
export const deleteStory = async (req: Request, res: Response) => {
    try {
        console.info("deleteStory controller");
        const currentUserId = (req.user as any)?.user_id;
        const { storyId } = req.params;

        if (!currentUserId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ success: false, message: "Story not found" });
        }

        // Only allow users to delete their own stories
        if (story.userId !== currentUserId) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this story" });
        }

        await Story.findByIdAndDelete(storyId);

        res.json({ success: true, message: "Story deleted successfully" });
    } catch (error) {
        console.error("deleteStory error:", error);
        res.status(400).json({ success: false, message: "Delete story failed" });
    }
};

