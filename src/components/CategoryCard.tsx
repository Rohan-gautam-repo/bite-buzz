"use client";

import { Category } from "@/types";
import { motion } from "framer-motion";

interface CategoryCardProps {
  category: Category;
  onClick: (categoryId: string) => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(category.id)}
      className="flex flex-col items-center justify-center p-6 md:p-8 bg-white rounded-2xl shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 hover:bg-gradient-to-br hover:from-orange-50 hover:to-yellow-50 border border-gray-100 group"
      role="button"
      tabIndex={0}
      aria-label={`View ${category.name} category`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(category.id);
        }
      }}
    >
      {/* Emoji Icon */}
      <div className="text-6xl md:text-7xl mb-3 md:mb-4 transition-transform duration-300 group-hover:scale-110">
        {category.emoji}
      </div>

      {/* Category Name */}
      <h3 className="text-lg md:text-xl font-semibold text-gray-800 text-center group-hover:text-orange-600 transition-colors duration-300">
        {category.name}
      </h3>
    </motion.div>
  );
}
