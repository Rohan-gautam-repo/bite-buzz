"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { currentUser, loading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-orange-500 mb-4">
          🍔 Bite-Buzz
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Your favorite food, delivered fast!
        </p>
        
        {/* Authentication Status */}
        <div className="mb-8">
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin h-5 w-5 text-orange-500" />
              <span className="text-gray-600">Loading...</span>
            </div>
          ) : currentUser ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-green-800 font-medium mb-2">
                Welcome back, {currentUser.displayName || currentUser.email}!
              </p>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-blue-800 mb-3">Please login to start ordering</p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/login"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition font-medium"
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <div className="text-4xl">🍕</div>
          <div className="text-4xl">🍜</div>
          <div className="text-4xl">🍰</div>
          <div className="text-4xl">🥗</div>
          <div className="text-4xl">🍱</div>
        </div>
      </div>
    </div>
  );
}
