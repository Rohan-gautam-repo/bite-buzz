"use client";

import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { Toaster } from "react-hot-toast";

interface ShopLayoutProps {
  children: ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
  const { cartItemCount } = useCart();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <Navbar cartItemCount={cartItemCount} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </div>
  );
}
