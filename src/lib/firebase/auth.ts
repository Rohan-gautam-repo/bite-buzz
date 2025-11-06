import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import { User, CreateUserInput } from "@/types";

/**
 * Register a new user with email and password
 */
export const registerUser = async (
  email: string,
  password: string,
  username: string
): Promise<User> => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Update profile with username
    await updateProfile(firebaseUser, {
      displayName: username,
    });

    // Create user document in Firestore
    const userData: CreateUserInput = {
      email: firebaseUser.email!,
      username,
      role: "user",
    };

    await setDoc(doc(db, "users", firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
    });

    // Send verification email
    await sendEmailVerification(firebaseUser);

    // Return user data
    return {
      id: firebaseUser.uid,
      ...userData,
      createdAt: new Date() as any,
    };
  } catch (error: any) {
    console.error("Error registering user:", error);
    throw new Error(error.message || "Failed to register user");
  }
};

/**
 * Login user with email and password
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (!userDoc.exists()) {
      throw new Error("User data not found");
    }

    return {
      id: firebaseUser.uid,
      ...userDoc.data(),
    } as User;
  } catch (error: any) {
    console.error("Error logging in:", error);
    throw new Error(error.message || "Failed to login");
  }
};

/**
 * Logout current user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Error logging out:", error);
    throw new Error(error.message || "Failed to logout");
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      return null;
    }

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (!userDoc.exists()) {
      return null;
    }

    return {
      id: firebaseUser.uid,
      ...userDoc.data(),
    } as User;
  } catch (error: any) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          callback({
            id: firebaseUser.uid,
            ...userDoc.data(),
          } as User);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    throw new Error(error.message || "Failed to send password reset email");
  }
};

/**
 * Check if user is admin
 */
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      return false;
    }
    const userData = userDoc.data() as User;
    return userData.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};
