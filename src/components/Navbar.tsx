"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  Home,
  ShoppingCart,
  User,
  Settings,
  Package,
  LogOut,
  Menu,
  X,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  cartItemCount?: number;
}

export default function Navbar({ cartItemCount = 0 }: NavbarProps) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.username || currentUser.displayName || "User");
            setEmail(currentUser.email || "");
          } else {
            setUsername(currentUser.displayName || "User");
            setEmail(currentUser.email || "");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUsername(currentUser.displayName || "User");
          setEmail(currentUser.email || "");
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/", showOnMobile: true },
    {
      icon: ShoppingCart,
      label: "Cart",
      path: "/cart",
      badge: cartItemCount,
      showOnMobile: true,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => router.push("/")}
          >
            <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
              🐝
            </span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Bite-Buzz
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Home */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors duration-200 group"
              aria-label="Go to home"
            >
              <Home className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
              <span className="text-gray-700 group-hover:text-orange-600 font-medium">
                Home
              </span>
            </button>

            {/* Cart */}
            <button
              onClick={() => router.push("/cart")}
              className="relative flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors duration-200 group"
              aria-label={`Cart with ${cartItemCount} items`}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </div>
              <span className="text-gray-700 group-hover:text-orange-600 font-medium">
                Cart
              </span>
            </button>

            {/* Profile or Login/Register */}
            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors duration-200 group"
                  aria-label="Profile menu"
                  aria-expanded={showProfileMenu}
                >
                  <User className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
                  <span className="text-gray-700 group-hover:text-orange-600 font-medium">
                    {username || "Profile"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 overflow-hidden"
                    >
                      {/* Username Display */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/orders");
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-orange-50 transition-colors duration-200 group"
                      >
                        <Package className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
                        <span className="text-gray-700 group-hover:text-orange-600">
                          Order History
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/addresses");
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-orange-50 transition-colors duration-200 group"
                      >
                        <MapPin className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
                        <span className="text-gray-700 group-hover:text-orange-600">
                          My Addresses
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/settings");
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-orange-50 transition-colors duration-200 group"
                      >
                        <Settings className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
                        <span className="text-gray-700 group-hover:text-orange-600">
                          Settings
                        </span>
                      </button>

                      <div className="border-t border-gray-100 mt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors duration-200 group"
                        >
                          <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                          <span className="text-gray-700 group-hover:text-red-600">
                            Logout
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="flex items-center space-x-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 font-semibold"
                aria-label="Login or Register"
              >
                <User className="w-5 h-5" />
                <span>Login / Register</span>
              </button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-4">
            {/* Cart Icon with Badge */}
            <button
              onClick={() => router.push("/cart")}
              className="relative p-2"
              aria-label={`Cart with ${cartItemCount} items`}
            >
              <ShoppingCart className="w-6 h-6 text-gray-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 overflow-hidden"
            >
              <div className="py-4 space-y-2">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    router.push("/");
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-orange-50 transition-colors duration-200"
                >
                  <Home className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Home</span>
                </button>

                {currentUser ? (
                  <>
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        router.push("/orders");
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-orange-50 transition-colors duration-200"
                    >
                      <Package className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Order History</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        router.push("/addresses");
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-orange-50 transition-colors duration-200"
                    >
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">My Addresses</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        router.push("/settings");
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-orange-50 transition-colors duration-200"
                    >
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Settings</span>
                    </button>

                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <div className="px-4 py-2">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      router.push("/login");
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200 mx-4 rounded-lg"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-semibold">Login / Register</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
