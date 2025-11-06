"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  register: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUsername: (newUsername: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Register new user
  const register = async (email: string, password: string, username: string) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with username
      await updateProfile(user, { displayName: username });

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        username: username,
        role: "user",
        createdAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        throw new Error("This email is already registered. Please login instead.");
      } else if (error.code === "auth/weak-password") {
        throw new Error("Password is too weak. Please choose a stronger password.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address.");
      } else {
        throw new Error(error.message || "Registration failed. Please try again.");
      }
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Login error:", error);
      // Handle specific Firebase errors
      if (error.code === "auth/user-not-found") {
        throw new Error("No account found with this email. Please register first.");
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address.");
      } else if (error.code === "auth/user-disabled") {
        throw new Error("This account has been disabled.");
      } else if (error.code === "auth/invalid-credential") {
        throw new Error("Invalid email or password. Please try again.");
      } else {
        throw new Error(error.message || "Login failed. Please try again.");
      }
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error("Logout failed. Please try again.");
    }
  };

  // Update username
  const updateUsername = async (newUsername: string) => {
    try {
      if (!currentUser) {
        throw new Error("No user is currently logged in.");
      }

      // Update display name in Firebase Auth
      await updateProfile(currentUser, { displayName: newUsername });

      // Update username in Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        username: newUsername,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Update username error:", error);
      throw new Error(error.message || "Failed to update username. Please try again.");
    }
  };

  // Update password
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!currentUser || !currentUser.email) {
        throw new Error("No user is currently logged in.");
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await firebaseUpdatePassword(currentUser, newPassword);
    } catch (error: any) {
      console.error("Update password error:", error);
      // Handle specific Firebase errors
      if (error.code === "auth/wrong-password") {
        throw new Error("Current password is incorrect.");
      } else if (error.code === "auth/weak-password") {
        throw new Error("New password is too weak. Please choose a stronger password.");
      } else if (error.code === "auth/requires-recent-login") {
        throw new Error("Please log out and log in again before changing your password.");
      } else {
        throw new Error(error.message || "Failed to update password. Please try again.");
      }
    }
  };

  // Helper function to set auth cookies
  const setAuthCookies = async (user: User | null) => {
    if (user) {
      const token = await user.getIdToken();
      // Set cookies for middleware
      document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax`;
      document.cookie = `user-email=${user.email}; path=/; max-age=3600; SameSite=Lax`;
    } else {
      // Clear cookies on logout
      document.cookie = "firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user-email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await setAuthCookies(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    register,
    login,
    logout,
    updateUsername,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
