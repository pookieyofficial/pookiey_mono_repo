import { Router, Request, Response } from "express";
import { verifyUser } from "../middleware/userMiddlewares";
import { createConferenceTwiMLResponse, generateVoiceToken, isTwilioConfigured } from "../services/twilioService";
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
 * ALL /api/v1/call/twiml
 * Twilio Voice webhook (TwiML App Voice URL).
 *
 * This is intentionally NOT behind verifyUser (Twilio will call it).
 * For online-only calls, both clients connect with params { room: matchId, role: caller|receiver }.
 *
 * Twilio may call with form-encoded body; we also accept query params.
 */
callRouter.all("/twiml", async (req: Request, res: Response) => {
  try {
    // Helpful logging while integrating (safe: no auth tokens expected from Twilio)
    console.log("[twiml] incoming", {
      method: req.method,
      contentType: req.headers["content-type"],
      userAgent: req.headers["user-agent"],
      bodyKeys: req.body ? Object.keys(req.body) : [],
      queryKeys: req.query ? Object.keys(req.query) : [],
    });

    const rawRoom =
      req.body?.room ??
      req.body?.Room ??
      req.query?.room ??
      req.query?.Room ??
      // fallback: some integrations pass matchId as To
      req.body?.To ??
      req.body?.to ??
      req.query?.To ??
      req.query?.to ??
      "";

    const room = rawRoom.toString();
    const role = (req.body?.role || req.query?.role || "caller").toString() as "caller" | "receiver";

    console.log("[twiml] resolved", { room, role });

    const twiml = createConferenceTwiMLResponse(room, role);
    res.type("text/xml");
    res.status(200).send(twiml);
  } catch (error: any) {
    console.error("Error generating call TwiML:", error);
    // Return valid TwiML so Twilio doesn't just say "application error" with no clue
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
    console.error("Error initiating call:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initiate call",
    });
  }
});

export default callRouter;

