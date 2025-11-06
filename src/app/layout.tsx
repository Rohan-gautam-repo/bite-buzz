import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bite-Buzz - Quick Food Delivery",
  description: "Order your favorite food and get it delivered fast!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">
                {children}
              </main>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
