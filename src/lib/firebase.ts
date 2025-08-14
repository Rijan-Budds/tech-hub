import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAnLUzK9h8jR9pYvrajHsOu4kvCoihki6o",
  authDomain: "ecommerce-app-da180.firebaseapp.com",
  projectId: "ecommerce-app-da180",
  storageBucket: "ecommerce-app-da180.firebasestorage.app",
  messagingSenderId: "720943276086",
  appId: "1:720943276086:web:df8451e08a59923ca3b897",
  measurementId: "G-1V37XLN5JV"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
