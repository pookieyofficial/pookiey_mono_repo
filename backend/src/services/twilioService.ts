import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;

if (!accountSid || !authToken) {
  console.warn("⚠️ Twilio credentials not found. Voice calling will not work.");
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Generate an Access Token for Twilio Voice SDK
 * This token allows the client to connect to Twilio's services
 */
export const generateVoiceToken = (identity: string): string => {
  if (!apiKey || !apiSecret) {
    throw new Error("Twilio API Key and Secret are required for voice tokens");
  }

  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  // Create a voice grant
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
    incomingAllow: true, // Allow incoming calls
  });

  // Create an access token
  const token = new AccessToken(accountSid!, apiKey, apiSecret, {
    identity: identity,
    ttl: 3600, // Token expires in 1 hour
  });

  token.addGrant(voiceGrant);

  return token.toJwt();
};

/**
 * Generate an Access Token for Twilio Video (Programmable Video)
 * Used for video calls. Room name is typically the matchId.
 * API Key must be in US1 region for Video - see Twilio docs.
 */
export const generateVideoToken = (identity: string, roomName: string): string => {
  if (!apiKey || !apiSecret) {
    throw new Error("Twilio API Key and Secret are required for video tokens");
  }

  const AccessToken = twilio.jwt.AccessToken;
  const VideoGrant = AccessToken.VideoGrant;

  const videoGrant = new VideoGrant({ room: roomName });

  const token = new AccessToken(accountSid!, apiKey, apiSecret, {
    identity,
    ttl: 3600,
  });

  token.addGrant(videoGrant);

  return token.toJwt();
};

/**
 * Create a TwiML response for handling calls
 * This is used when a call is made through Twilio
 */
export const createTwiMLResponse = (to: string): string => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  // Dial the other user
  const dial = response.dial({
    callerId: process.env.TWILIO_PHONE_NUMBER,
  });

  // For P2P calling, we'll use a client identifier
  // In a real implementation, you'd map userIds to client names
  dial.client(to);

  return response.toString();
};

/**
 * Create a TwiML response that connects the caller into a conference.
 * Used for "online-only" in-app calls where BOTH devices join the same room.
 *
 * Twilio Voice SDK clients will call the TwiML App's Voice URL and pass custom params.
 * We read `room` and `role` to decide whether to end the conference when the user leaves.
 */
export const createConferenceTwiMLResponse = (
  room: string,
  role: "caller" | "receiver" = "caller"
): string => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  if (!room) {
    response.say("Missing room.");
    response.hangup();
    return response.toString();
  }

  // Only the caller ends the conference on exit so the room ends when caller hangs up.
  const endConferenceOnExit = role === "caller";

  const dial = response.dial();
  dial.conference(
    {
      endConferenceOnExit,
      startConferenceOnEnter: true,
    },
    room
  );

  return response.toString();
};

/**
 * Check if Twilio is properly configured
 */
export const isTwilioConfigured = (): boolean => {
  return !!(accountSid && authToken && apiKey && apiSecret);
};

