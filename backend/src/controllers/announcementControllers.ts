import { Request, Response } from "express";
import { Announcement } from "../models/Announcement";
import { User } from "../models/User";
import type { IUser } from "../models/User";


export const getActiveAnnouncement = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const now = new Date();
    const userPlan = user.subscription?.plan || "free";

    const baseQuery: any = {
      isEnabled: true,
      $or: [
        { targetAudience: "all" },
        { targetAudience: userPlan },
      ],
    };

    const candidates = await Announcement.find(baseQuery)
      .sort({ priority: -1, createdAt: -1 })
      .select("title htmlContent priority targetAudience startDate endDate createdAt")
      .lean();


    const activeAnnouncements = candidates.filter((ann) => {
      const startDate = ann.startDate ? new Date(ann.startDate) : null;
      const endDate = ann.endDate ? new Date(ann.endDate) : null;

      const startValid = !startDate || startDate <= now;

      const endValid = !endDate || endDate >= now;

      const isValid = startValid && endValid;

      if (!isValid) {
        return false;
      }

      return isValid;
    });

    const announcement = activeAnnouncements[0] || null;

    if (!announcement) {
      return res.json({
        success: true,
        data: null,
        message: "No active announcements",
      });
    }

    return res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to fetch announcement",
    });
  }
};

/**
 * Get all announcements (admin only)
 */
export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const announcements = await Announcement.find({})
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

/**
 * Create announcement (admin only)
 */
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { title, htmlContent, isEnabled, priority, targetAudience, startDate, endDate } = req.body;

    if (!title || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: "Title and HTML content are required",
      });
    }

    const announcement = await Announcement.create({
      title,
      htmlContent,
      isEnabled: isEnabled ?? false,
      priority: priority ?? 0,
      targetAudience: targetAudience || "all",
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    res.json({
      success: true,
      data: announcement,
      message: "Announcement created successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to create announcement",
      error: error.message,
    });
  }
};

/**
 * Update announcement (admin only)
 */
export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { id } = req.params;
    const updates = req.body;

    if (updates.startDate) {
      updates.startDate = new Date(updates.startDate);
    }
    if (updates.endDate) {
      updates.endDate = new Date(updates.endDate);
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      data: announcement,
      message: "Announcement updated successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to update announcement",
      error: error.message,
    });
  }
};

/**
 * Delete announcement (admin only)
 */
export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to delete announcement",
      error: error.message,
    });
  }
};
