import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

// We ALWAYS use the user's custom PMSL project as requested.
// This ensures that live checks and deployment always connect to your real PMSL Firebase project.
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyBl6JCCxMXuJU8xFQGrWYRzQvI-3bBFXjA",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "pmslleagu.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "pmslleagu",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "pmslleagu.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "83604420517",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:83604420517:web:72cde07bf6dfdd83f3da4c",
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || "G-LWSJ75HM50"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Since you are using your real 'pmslleagu' Firebase project, we default to the standard
// default database (which corresponds to database ID '(default)', initialized by passing undefined).
// This means you do not need to provide or configure a custom database ID at all!
const databaseId = (import.meta as any).env.VITE_FIREBASE_DATABASE_ID || undefined;

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, databaseId);

