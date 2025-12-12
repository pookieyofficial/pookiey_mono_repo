# Twilio Voice Calling Setup Guide

This guide will help you set up P2P voice calling in your Pookiey app using Twilio Voice SDK with Expo.

## Prerequisites

1. A Twilio account (sign up at https://www.twilio.com)
2. Twilio Account SID and Auth Token
3. Twilio API Key and API Secret
4. A TwiML Application SID (for handling calls)

## Step 1: Twilio Account Setup

1. **Create a Twilio Account**
   - Go to https://www.twilio.com and sign up
   - Get your Account SID and Auth Token from the Twilio Console

2. **Create an API Key**
   - In Twilio Console, go to Account → API Keys & Tokens
   - Create a new API Key
   - Save the API Key SID and API Secret

3. **Create a TwiML Application**
   - In Twilio Console, go to Voice → TwiML → TwiML Apps
   - Create a new TwiML App
   - Note the Application SID

4. **Get a Phone Number (Optional for P2P)**
   - For P2P calling, you typically don't need a phone number
   - However, if you want PSTN calling, you'll need to purchase a number

## Step 2: Backend Configuration

Add these environment variables to your `backend/.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_API_KEY=your_api_key_sid_here
TWILIO_API_SECRET=your_api_secret_here
TWILIO_TWIML_APP_SID=your_twiml_app_sid_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number (optional)
```

## Step 3: Install Dependencies

The following packages have already been installed:
- `@ashworthhub/twilio-voice-expo` (in app/)
- `twilio` (in backend/)

## Step 4: Rebuild Your App

Since we added a native module, you need to rebuild your app:

```bash
# For iOS
cd app
npx expo prebuild --clean
npx expo run:ios

# For Android
cd app
npx expo prebuild --clean
npx expo run:android
```

Or if using EAS Build:
```bash
cd app
eas build --platform ios
eas build --platform android
```

## Step 5: How It Works

### Architecture

1. **Call Initiation**: When User A wants to call User B:
   - User A taps the call button in the chat room
   - Frontend requests a Twilio access token from backend
   - Backend generates token using Twilio SDK
   - Frontend uses token to connect via Twilio Voice SDK
   - Socket.IO notifies User B about incoming call

2. **Call Answering**: When User B receives a call:
   - Socket.IO event triggers incoming call UI
   - User B can answer or reject
   - If answered, both users connect via Twilio

3. **Call Management**: 
   - All call state changes are managed by Twilio Voice SDK
   - Socket.IO handles signaling between users
   - Call UI updates based on call state

### API Endpoints

- `GET /api/v1/call/token` - Get Twilio access token for authenticated user
- `POST /api/v1/call/initiate` - Initiate a call (optional, currently handled via socket)

### Socket Events

- `call_initiate` - Emitted when a user initiates a call
- `call_incoming` - Received when there's an incoming call
- `call_answer` - Emitted when a call is answered
- `call_answered` - Received when the other user answers
- `call_reject` - Emitted when a call is rejected
- `call_rejected` - Received when the other user rejects
- `call_end` - Emitted when a call ends
- `call_ended` - Received when the other user ends the call

## Step 6: Testing

1. **Start your backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start your app**:
   ```bash
   cd app
   npm run mobile
   ```

3. **Test the flow**:
   - Open a chat with a matched user
   - Tap the call button in the header
   - The other user should receive an incoming call notification
   - Answer the call and verify audio works

## Troubleshooting

### Issue: "Twilio credentials not found"
- Make sure all Twilio environment variables are set in `backend/.env`
- Restart your backend server after adding variables

### Issue: "Failed to initialize Twilio Voice"
- Make sure you've rebuilt the app after installing the package
- Check that `expo-dev-client` is installed and working
- Verify microphone permissions are granted

### Issue: Calls not connecting
- Check that both users are online and connected via Socket.IO
- Verify Twilio access tokens are being generated correctly
- Check Twilio Console logs for any errors

### Issue: No audio
- Verify microphone permissions are granted
- Check device volume settings
- Ensure both users have stable internet connections

## Important Notes

1. **P2P Calling**: This implementation uses Twilio's client-to-client calling, which is P2P when possible but routes through Twilio servers.

2. **Costs**: Twilio charges for voice calls. Check their pricing at https://www.twilio.com/pricing

3. **Permissions**: The app requires microphone permissions. These are handled by the Expo plugin.

4. **Development vs Production**: 
   - In development, use Twilio test credentials
   - In production, use your live Twilio credentials
   - Make sure to set up proper environment variables in your production environment

## Next Steps

- Add call history/logging
- Add call quality indicators
- Implement call recording (if needed, requires additional Twilio setup)
- Add push notifications for missed calls
- Add call duration tracking

