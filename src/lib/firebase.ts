import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Detect if we should use the custom PMSL project or the platform-provided workspace project.
// We use the PMSL project if we are on the custom domain, or if VITE_FIREBASE_PROJECT_ID is set to 'pmslleagu',
// or if the default system config isn't available.
const isPreviewEnv = typeof window !== 'undefined' && (
  window.location.hostname.includes('run.app') ||
  window.location.hostname.includes('localhost') ||
  window.location.hostname.includes('127.0.0.1')
);

// We use the custom production PMSL project if we are in production (not in preview),
// or if the hostname includes 'pmslleagu', or if VITE_FIREBASE_PROJECT_ID is 'pmslleagu',
// or if the default workspace config isn't available.
const isPMSL = 
  !isPreviewEnv ||
  (import.meta as any).env.VITE_FIREBASE_PROJECT_ID === 'pmslleagu' ||
  (typeof window !== 'undefined' && (
    window.location.hostname.includes('pmslleagu') ||
    window.location.hostname === 'pmslleagu.firebaseapp.com' || 
    window.location.hostname === 'pmslleagu.web.app' ||
    window.location.hostname === 'pmslleagu.com'
  )) ||
  !firebaseAppletConfig.projectId;

const firebaseConfig = isPMSL ? {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyBl6JCCxMXuJU8xFQGrWYRzQvI-3bBFXjA",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "pmslleagu.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "pmslleagu",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "pmslleagu.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "83604420517",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:83604420517:web:72cde07bf6dfdd83f3da4c",
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || "G-LWSJ75HM50"
} : {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || firebaseAppletConfig.measurementId || ""
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

// Determine Firestore Database ID
// For development/preview envs, we use the custom workspace database ID.
// For live production environments (custom domains or standard Firebase hosting),
// we default to the standard default database ('undefined') so the user doesn't need to specify one.
const databaseId = (import.meta as any).env.VITE_FIREBASE_DATABASE_ID || (
  isPMSL
    ? undefined
    : (isPreviewEnv ? (firebaseAppletConfig.firestoreDatabaseId || undefined) : undefined)
);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, databaseId);

