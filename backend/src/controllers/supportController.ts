import { Request, Response } from "express";
import { Support } from "../models/Support";
import type { IUser } from "../models/User";

export const createSupportMessage = async (req: Request, res: Response) => {
  try {
    const user = req.user as any as IUser;
    const { subject, category, priority, message, attachments } = req.body;

    // Validation
    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Subject is required and cannot be empty",
      });
    }

    if (subject.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Subject cannot exceed 200 characters",
      });
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message is required and cannot be empty",
      });
    }

    if (message.length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 10000 characters",
      });
    }

    const validCategories = ["bug", "feature_request", "account_issue", "billing", "technical", "other"];
    const validPriorities = ["low", "medium", "high", "urgent"];

    const supportCategory = validCategories.includes(category) ? category : "other";
    const supportPriority = validPriorities.includes(priority) ? priority : "medium";

    // Validate attachments if provided
    if (attachments && !Array.isArray(attachments)) {
      return res.status(400).json({
        success: false,
        message: "Attachments must be an array",
      });
    }

    if (attachments && attachments.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 attachments allowed",
      });
    }

    const supportMessage = new Support({
      userId: user.user_id,
      userEmail: user.email,
      subject: subject.trim(),
      category: supportCategory,
      priority: supportPriority,
      message: message.trim(),
      attachments: attachments || [],
      status: "pending",
    });

    await supportMessage.save();

    res.status(201).json({
      success: true,
      message: "Support message submitted successfully",
      data: {
        id: supportMessage._id,
        subject: supportMessage.subject,
        category: supportMessage.category,
        priority: supportMessage.priority,
        status: supportMessage.status,
        createdAt: supportMessage.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({  
      success: false,
      message: "Failed to submit support message",
    });
  }
};

export const getSupportMessages = async (req: Request, res: Response) => {
  try {
    const user = req.user as any as IUser;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const supportMessages = await Support.find({ userId: user.user_id })
      .sort({ createdAt: -1 })
      .select("subject category priority message attachments status response respondedAt createdAt")
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Support.countDocuments({ userId: user.user_id });

    res.json({
      success: true,
      data: {
        supportMessages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch support messages",
    });
  }
};

