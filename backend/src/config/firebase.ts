import * as admin from 'firebase-admin';
import { config } from './env';

class FirebaseAdmin {
  private app: admin.app.App | null = null;

  initialize(): void {
    try {
      if (this.app) {
        console.log('Firebase Admin already initialized');
        return;
      }

      // Check if we have the required Firebase configuration
      if (!config.firebase.projectId || !config.firebase.clientEmail || !config.firebase.privateKey) {
        console.warn('Firebase configuration is incomplete. Firebase Admin SDK will not be initialized.');
        console.warn('Please provide FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment variables.');
        return;
      }

      console.log('Initializing Firebase Admin SDK...');

      const serviceAccount: admin.ServiceAccount = {
        projectId: config.firebase.projectId,
        privateKeyId: config.firebase.privateKeyId,
        privateKey: config.firebase.privateKey,
        clientEmail: config.firebase.clientEmail,
        clientId: config.firebase.clientId,
        authUri: config.firebase.authUri,
        tokenUri: config.firebase.tokenUri,
        authProviderX509CertUrl: config.firebase.authProviderX509CertUrl,
        clientX509CertUrl: config.firebase.clientX509CertUrl,
      };

      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.firebase.projectId,
      });

      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
      throw error;
    }
  }

  getApp(): admin.app.App {
    if (!this.app) {
      throw new Error('Firebase Admin not initialized. Call initialize() first.');
    }
    return this.app;
  }

  getAuth(): admin.auth.Auth {
    if (!this.app) {
      throw new Error('Firebase Admin not initialized. Call initialize() first.');
    }
    return this.app.auth();
  }

  getFirestore(): admin.firestore.Firestore {
    if (!this.app) {
      throw new Error('Firebase Admin not initialized. Call initialize() first.');
    }
    return this.app.firestore();
  }

  getMessaging(): admin.messaging.Messaging {
    if (!this.app) {
      throw new Error('Firebase Admin not initialized. Call initialize() first.');
    }
    return this.app.messaging();
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const auth = this.getAuth();
      const decodedToken = await auth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      throw error;
    }
  }

  async createCustomToken(uid: string, additionalClaims?: object): Promise<string> {
    try {
      const auth = this.getAuth();
      const customToken = await auth.createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error) {
      console.error('Error creating custom token:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    try {
      const auth = this.getAuth();
      const userRecord = await auth.getUserByEmail(email);
      return userRecord;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      const auth = this.getAuth();
      const userRecord = await auth.getUser(uid);
      return userRecord;
    } catch (error) {
      console.error('Error getting user by UID:', error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.app !== null;
  }
}

// Create and export a singleton instance
export const firebaseAdmin = new FirebaseAdmin();

// Export Firebase Admin types for use in other files
export { admin };
