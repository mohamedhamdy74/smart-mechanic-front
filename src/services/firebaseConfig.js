import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAMsivZFd-T8OGeVXxwHiGEHfWaIMoUdQM",
  authDomain: "mechanics-app-b5373.firebaseapp.com",
  databaseURL: "https://mechanics-app-b5373-default-rtdb.firebaseio.com",
  projectId: "mechanics-app-b5373",
  storageBucket: "mechanics-app-b5373.firebasestorage.app",
  messagingSenderId: "913098753857",
  appId: "1:913098753857:web:6f5bd54efa2f793b0143c0",
  measurementId: "G-VDNMZ8Y9CW"
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