import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTIPD4WlKBJXvOaglslTCXh2Gsr-mRGRk",
  authDomain: "thedatingapp-3b551.firebaseapp.com",
  projectId: "thedatingapp-3b551",
  storageBucket: "thedatingapp-3b551.appspot.com",
  messagingSenderId: "657044187272",
  appId: "1:657044187272:web:2a033d88058c0592dbd73d",
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app);

export default app;
