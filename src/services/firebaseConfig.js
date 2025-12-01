import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Prevent duplicate Firebase app initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const database = getDatabase(app);
export const auth = getAuth(app);

export const initializeFirebase = async () => {
  try {
    // Skip authentication for now - use database rules for access control
    console.log('Firebase initialized without authentication - using database rules');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    console.log('Continuing without authentication - read-only mode');
  }
};