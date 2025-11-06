"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { z } from "zod";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginInput = z.infer<typeof adminLoginSchema>;

const ADMIN_CREDENTIALS = {
  username: "Admin",
  password: "Password@2025",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: AdminLoginInput) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Check credentials
      if (
        data.username === ADMIN_CREDENTIALS.username &&
        data.password === ADMIN_CREDENTIALS.password
      ) {
        // Set admin session in localStorage and cookie
        localStorage.setItem("adminSession", "true");
        document.cookie = "adminSession=true; path=/; max-age=86400"; // 24 hours

        // Redirect to admin inventory
        router.push("/admin/inventory");
      } else {
        setErrorMessage("Invalid credentials. Please try again.");
      }
    } catch (error: any) {
      setErrorMessage("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
            <p className="text-gray-600">Secure access to inventory management</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                {...register("username")}
                id="username"
                type="text"
                placeholder="Enter admin username"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
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
                  placeholder="Enter admin password"
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
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="mr-2" size={20} />
                  Admin Login
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              🔒 This is a secure admin portal. Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
