# Backend Migration from Firebase to Supabase

## ✅ **Migration Complete**

The backend has been successfully migrated from Firebase Authentication to Supabase Authentication.

## 🔧 **Changes Made**

### **1. User Model (`src/models/User.ts`)**
- **Changed:** `uid` → `supabase_id`
- **Changed:** `phoneNumber` → Optional field
- **Added:** `provider` field to track auth method (google, email, phone)
- **Updated:** Email is now required field
- **Updated:** Phone verification defaults to false

### **2. Supabase Configuration (`src/config/supabase.ts`)**
- **Added:** Supabase client with service role key
- **Added:** `verifySupabaseToken()` function for JWT verification
- **Environment variables needed:**
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### **3. Authentication Middleware (`src/middleware/userMiddlewares.ts`)**
- **Replaced:** Firebase Admin SDK → Supabase client
- **Updated:** `verifyUser()` - now verifies Supabase JWT tokens
- **Updated:** `verifyToken()` - now uses Supabase user data
- **Changed:** User lookup by `supabase_id` instead of `uid`

### **4. User Controllers (`src/controllers/userControllers.ts`)**
- **Updated:** `createUser()` - now accepts Supabase user data
- **Updated:** `getMe()` - uses `supabase_id` for logging
- **Updated:** `updateUser()` - finds user by `supabase_id`
- **Added:** Support for email, displayName, photoURL, provider

### **5. Frontend Integration (`App/hooks/useUser.ts`)**
- **Updated:** `createUser()` - now sends Supabase user data
- **Updated:** `getOrCreateUser()` - uses Supabase user object
- **Added:** Automatic extraction of user metadata from Supabase

## 📋 **Environment Variables Required**

Create a `.env` file in the backend directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/datingapp

# Supabase Configuration
SUPABASE_URL=https://szzxdypursgvddxlhkud.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=6969
NODE_ENV=development
```

## 🔄 **API Changes**

### **Create User Endpoint**
**Before:**
```json
{
  "uid": "firebase_uid",
  "phoneNumber": "+1234567890"
}
```

**After:**
```json
{
  "supabase_id": "supabase_user_id",
  "email": "user@example.com",
  "phoneNumber": "+1234567890",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "provider": "google"
}
```

### **Authentication Header**
**Unchanged:** Still uses `Authorization: Bearer <token>`
**Changed:** Token is now Supabase JWT instead of Firebase token

## 🗄️ **Database Schema Changes**

### **User Document Structure**
```javascript
{
  supabase_id: String,      // Required, unique
  email: String,            // Required, unique
  phoneNumber: String,      // Optional, unique
  displayName: String,      // Optional
  photoURL: String,         // Optional
  provider: String,         // "google" | "email" | "phone"
  isEmailVerified: Boolean, // Default: false
  isPhoneVerified: Boolean, // Default: false
  status: String,           // "active" | "banned" | "deleted" | "suspended"
  profile: Object,          // User profile data
  preferences: Object,      // User preferences
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

## 🚀 **Testing the Migration**

### **1. Backend Setup**
```bash
cd backend
npm install
# Add environment variables to .env
npm start
```

### **2. Frontend Setup**
```bash
cd App
npm start
```

### **3. Test Authentication Flow**
1. **Google Sign-in** should work
2. **User creation** should happen automatically
3. **API calls** should work with Supabase tokens
4. **User data** should be stored with new schema

## 🔍 **Debugging**

### **Common Issues:**
1. **"Invalid API key"** - Check `SUPABASE_SERVICE_ROLE_KEY`
2. **"User not found"** - Check if user exists in database
3. **"Unauthorized"** - Check token format and expiration

### **Logs to Check:**
- Backend: User creation and authentication logs
- Frontend: Supabase auth state changes
- Network: API request/response headers

## 📝 **Migration Notes**

- **Backward Compatibility:** None - this is a breaking change
- **Data Migration:** Existing Firebase users will need to re-authenticate
- **Token Format:** Supabase JWT tokens are different from Firebase
- **User ID:** All references to `uid` changed to `supabase_id`

## ✅ **Verification Checklist**

- [ ] Supabase environment variables configured
- [ ] Backend starts without errors
- [ ] Frontend can authenticate with Google
- [ ] User creation works in database
- [ ] API endpoints respond correctly
- [ ] Authentication middleware works
- [ ] User data is properly stored

The migration is complete and ready for testing!
