"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!currentUser) {
        router.push("/login");
        return;
      }

      // If admin is required, check user email
      if (requireAdmin && currentUser.email !== "admin@bitebuzz.com") {
        router.push("/");
        return;
      }
    }
  }, [currentUser, loading, router, requireAdmin]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not admin (when required), don't render children
  if (!currentUser) {
    return null;
  }

  if (requireAdmin && currentUser.email !== "admin@bitebuzz.com") {
    return null;
  }

  // User is authenticated (and admin if required), render children
  return <>{children}</>;
}
