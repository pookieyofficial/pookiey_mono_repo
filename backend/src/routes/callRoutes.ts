import { Router, Request, Response } from "express";
import { verifyUser } from "../middleware/userMiddlewares";
import { generateVoiceToken, isTwilioConfigured } from "../services/twilioService";
import { Matches } from "../models";

const callRouter = Router();

/**
 * GET /api/v1/call/token
 * Generate a Twilio Voice token for the authenticated user
 */
callRouter.get("/token", verifyUser, async (req: Request, res: Response) => {
  try {
    if (!isTwilioConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Voice calling is not configured on the server",
      });
    }

    const user = req.user as any;
    const identity = user.user_id || user._id?.toString();

    if (!identity) {
      return res.status(400).json({
        success: false,
        message: "User identity not found",
      });
    }

    const token = generateVoiceToken(identity);

    res.json({
      success: true,
      data: {
        token,
        identity,
      },
    });
  } catch (error: any) {
    console.error("Error generating voice token:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate voice token",
    });
  }
});

/**
 * POST /api/v1/call/initiate
 * Initiate a call between two matched users
 */
callRouter.post("/initiate", verifyUser, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { matchId, receiverId } = req.body;

    if (!matchId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "matchId and receiverId are required",
      });
    }

    // Verify the match exists and user is part of it
    const match = await Matches.findById(matchId);
    if (!match || (match.user1Id !== user.user_id && match.user2Id !== user.user_id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this match",
      });
    }

    // Verify receiver is the other user in the match
    const otherUserId = match.user1Id === user.user_id ? match.user2Id : match.user1Id;
    if (otherUserId !== receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver is not part of this match",
      });
    }

    // Generate token for the caller
    const token = generateVoiceToken(user.user_id);

    res.json({
      success: true,
      data: {
        token,
        identity: user.user_id,
        matchId,
        receiverId,
      },
    });
  } catch (error: any) {
    console.error("Error initiating call:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initiate call",
    });
  }
});

export default callRouter;

