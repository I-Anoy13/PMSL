import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCof9dWyHauYmMOfQ5pyUN_plVnegjM6yc",
  authDomain: "turab-d2f2c.firebaseapp.com",
  projectId: "turab-d2f2c",
  storageBucket: "turab-d2f2c.firebasestorage.app",
  messagingSenderId: "22237938511",
  appId: "1:22237938511:web:13d9f7b5a1ac5f1b443b3a"
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

// Initialize Firestore targeting the custom Database ID from firebase-applet-config.json
export const db = getFirestore(app, "ai-studio-pmsl-de4a2bc4-36dc-46db-8d80-183acc9c6718");
