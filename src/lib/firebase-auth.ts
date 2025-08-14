import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';
import { userService } from './firebase-db';
import { IUser } from './firebase-models';

// Authentication service
export const authService = {
  // Register new user
  async register(email: string, password: string, username: string): Promise<FirebaseUser> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: username });

      // Create user document in Firestore
      await userService.createUser({
        username,
        email,
        wishlist: [],
        cart: [],
      });

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  async login(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },

  // Get user data from Firestore
  async getUserData(userId: string): Promise<IUser | null> {
    return await userService.getUserById(userId);
  },
};

// JWT token generation (for API routes)
export const generateJWT = (user: FirebaseUser) => {
  // You can use Firebase Admin SDK to generate custom tokens
  // For now, we'll use a simple approach with user UID
  return {
    uid: user.uid,
    email: user.email,
    username: user.displayName,
  };
};

// Verify JWT token (for API routes)
export const verifyJWT = async (token: string) => {
  // In a real implementation, you'd verify the token with Firebase Admin SDK
  // For now, we'll return the token data directly
  return token;
};
