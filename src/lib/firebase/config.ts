import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase config is valid
export const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

// Initialize Firebase (singleton pattern)
const app = isFirebaseConfigured()
  ? getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp()
  : ({} as FirebaseApp);

// Initialize Firebase services - using type assertion for build compatibility
export const auth = isFirebaseConfigured() ? getAuth(app) : ({} as Auth);
export const db = isFirebaseConfigured() ? getFirestore(app) : ({} as Firestore);

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined' && isFirebaseConfigured()) {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
