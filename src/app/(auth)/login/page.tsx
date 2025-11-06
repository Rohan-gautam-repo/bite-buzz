"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { transferGuestCartToUser, hasGuestCartItems } from "@/lib/guestCartUtils";
import { auth } from "@/lib/firebase/config";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, currentUser } = useAuth();
  const { addToCart } = useCart();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const returnUrl = searchParams.get("returnUrl");
  const hasGuestItems = hasGuestCartItems();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      
      await login(data.email, data.password);
      
      // Transfer guest cart if exists
      if (hasGuestItems) {
        setSuccessMessage("Transferring your cart items...");
        
        // Wait a bit for currentUser to be set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the current user from auth
        const user = auth.currentUser;
        if (user) {
          const result = await transferGuestCartToUser(user.uid, addToCart);
          
          if (result.success && result.itemCount > 0) {
            setSuccessMessage(`Added ${result.itemCount} item(s) to your cart!`);
          }
        }
      }
      
      // Redirect to returnUrl or home
      setTimeout(() => {
        router.push(returnUrl || "/");
      }, 500);
    } catch (error: any) {
      setErrorMessage(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Login to your BiteBuzz account</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {/* Guest Cart Notice */}
          {hasGuestItems && !successMessage && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-600">
                💡 Your cart items will be saved after login!
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Register
              </Link>
            </p>
          </div>

          {/* Admin Login Link */}
          <div className="mt-4 text-center">
            <Link
              href="/admin/login"
              className="text-xs text-gray-500 hover:text-purple-600 font-medium transition flex items-center justify-center gap-1"
            >
              🔐 Admin Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
