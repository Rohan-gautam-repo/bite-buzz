"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Category } from "@/types";
import CategoryCard from "@/components/CategoryCard";
import CategorySkeleton from "@/components/CategorySkeleton";
import { motion } from "framer-motion";
import { AlertCircle, Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const categoriesRef = collection(db, "categories");
      const q = query(categoriesRef, orderBy("displayOrder", "asc"));
      const snapshot = await getDocs(q);

      const categoriesData: Category[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];

      setCategories(categoriesData);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(
        "Failed to load categories. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        {/* Logo/Title */}
        <div className="flex items-center justify-center space-x-3">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-7xl"
          >
            🐝
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent"
          >
            Bite-Buzz
          </motion.h1>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xl md:text-2xl text-gray-600 font-medium flex items-center justify-center gap-2"
        >
          <Sparkles className="w-6 h-6 text-yellow-500" />
          Fresh Food, Fast Delivery
          <span className="text-3xl">🚀</span>
        </motion.p>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-gray-500 max-w-2xl mx-auto"
        >
          Browse our fresh categories and get your favorite foods delivered to
          your doorstep
        </motion.p>
      </motion.div>

      {/* Categories Section */}
      <div className="space-y-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="text-3xl font-bold text-gray-800"
        >
          Shop by Category
        </motion.h2>

        {/* Loading State */}
        {loading && <CategorySkeleton />}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 space-y-4"
          >
            <AlertCircle className="w-16 h-16 text-red-500" />
            <p className="text-xl text-gray-600">{error}</p>
            <button
              onClick={fetchCategories}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-300 font-medium"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 space-y-4"
          >
            <div className="text-6xl">📦</div>
            <p className="text-xl text-gray-600">No categories found</p>
            <p className="text-gray-500">
              Please contact support or try again later
            </p>
          </motion.div>
        )}

        {/* Categories Grid */}
        {!loading && !error && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CategoryCard
                  category={category}
                  onClick={handleCategoryClick}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Additional Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-12 p-6 md:p-8 bg-white rounded-2xl shadow-md border border-gray-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-4xl">🌟</div>
            <h3 className="font-semibold text-gray-800">Quality Products</h3>
            <p className="text-sm text-gray-600">
              Fresh and high-quality items
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">⚡</div>
            <h3 className="font-semibold text-gray-800">Fast Delivery</h3>
            <p className="text-sm text-gray-600">
              Quick delivery to your doorstep
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">💰</div>
            <h3 className="font-semibold text-gray-800">Best Prices</h3>
            <p className="text-sm text-gray-600">
              Competitive prices guaranteed
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
