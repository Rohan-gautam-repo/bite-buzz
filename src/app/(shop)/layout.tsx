"use client";

import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCart } from "@/contexts/CartContext";

interface ShopLayoutProps {
  children: ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
  const { cartItemCount } = useCart();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <Navbar cartItemCount={cartItemCount} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
