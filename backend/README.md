# Dating App Backend

A robust backend API for the dating app built with Node.js, Express.js, MongoDB, and Firebase Admin SDK.

## Features

- 🔥 Firebase Authentication integration
- 🍃 MongoDB database connection
- 🚀 Express.js REST API
- 🔒 JWT token authentication
- 🛡️ Security middleware (Helmet, CORS)
- 🏥 Health check endpoints
- 📱 Mobile app ready
- 🔄 Graceful shutdown handling
- 🚀 TypeScript with strict configuration
- 🔧 ESLint for code quality

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Firebase project with Admin SDK

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
# Create a .env file with the following variables:
```

3. Configure your environment variables in `.env`:
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/dating-app

# Firebase Configuration (get from Firebase Console > Project Settings > Service Accounts)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### Development

Run the development server:
```bash
npm run dev
```

Build the project:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /` - Basic API info
- `GET /health` - Health check with service status

### Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Project Structure

```
src/
├── config/
│   ├── env.ts          # Environment configuration
│   ├── database.ts     # MongoDB connection
│   └── firebase.ts     # Firebase Admin SDK setup
├── middleware/
│   └── auth.ts         # Authentication middleware
├── types/
│   └── index.ts        # TypeScript type definitions
└── index.ts            # Main application entry point
```

## Database Schema

### Users Collection
- User profiles and authentication data
- Firebase UID integration
- Location-based matching support

### Matches Collection
- User matching system
- Match status tracking

### Messages Collection
- Real-time messaging support
- Message types (text, image, gif)
- Read status tracking

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication and Firestore
4. Go to Project Settings > Service Accounts
5. Generate a new private key
6. Copy the credentials to your `.env` file

## MongoDB Setup

### Local MongoDB
```bash
# Install MongoDB locally
# macOS
brew install mongodb/brew/mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

### MongoDB Atlas
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
