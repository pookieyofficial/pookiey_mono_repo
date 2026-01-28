import { Router, Request, Response } from "express";
import { verifyUser } from "../middleware/userMiddlewares";
import { createConferenceTwiMLResponse, generateVoiceToken, generateVideoToken, isTwilioConfigured } from "../services/twilioService";
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
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate voice token",
    });
  }
});

/**
 * GET /api/v1/call/video-token?room=:roomName
 * Generate a Twilio Video token for the authenticated user (for video calls).
 * roomName is typically the matchId.
 */
callRouter.get("/video-token", verifyUser, async (req: Request, res: Response) => {
  try {
    if (!isTwilioConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Video calling is not configured on the server",
      });
    }

    const user = req.user as any;
    const identity = user.user_id || user._id?.toString();
    const roomName = (req.query.room as string) || "";

    if (!identity) {
      return res.status(400).json({
        success: false,
        message: "User identity not found",
      });
    }

    if (!roomName) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'room' is required",
      });
    }

    const token = generateVideoToken(identity, roomName);

    res.json({
      success: true,
      data: {
        token,
        identity,
        roomName,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate video token",
    });
  }
});

callRouter.all("/twiml", async (req: Request, res: Response) => {
  try {

    const rawRoom =
      req.body?.room ??
      req.body?.Room ??
      req.query?.room ??
      req.query?.Room ??
      req.body?.To ??
      req.body?.to ??
      req.query?.To ??
      req.query?.to ??
      "";

    const room = rawRoom.toString();
    const role = (req.body?.role || req.query?.role || "caller").toString() as "caller" | "receiver";

    const twiml = createConferenceTwiMLResponse(room, role);
    res.type("text/xml");
    res.status(200).send(twiml);
  } catch (error: any) {
    res.type("text/xml");
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Application error.</Say><Hangup/></Response>`);
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
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initiate call",
    });
  }
});

export default callRouter;

