"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, getDocs, doc, getDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Category, Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { ChevronRight, Home, Loader2, ShoppingBag, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CategoryProductsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const { addToCart } = useCart();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [categoryId]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category details
      const categoryRef = doc(db, "categories", categoryId);
      const categorySnap = await getDoc(categoryRef);

      if (!categorySnap.exists()) {
        setError("Category not found");
        setLoading(false);
        return;
      }

      const categoryData = {
        id: categorySnap.id,
        ...categorySnap.data(),
      } as Category;
      setCategory(categoryData);

      // Fetch products in this category
      const productsRef = collection(db, "products");
      const q = query(
        productsRef,
        where("category", "==", categoryId),
        orderBy("name", "asc")
      );
      const productsSnap = await getDocs(q);

      const productsData = productsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(productsData);
    } catch (err) {
      console.error("Error fetching category products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      await addToCart(productId, quantity);
      showToast("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Failed to add to cart. Please try again.");
    }
  };

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 hover:text-orange-600 transition"
          >
            <Home size={16} />
            Home
          </button>
          <ChevronRight size={16} />
          <span className="text-gray-900 font-medium">
            {category?.emoji} {category?.name}
          </span>
        </nav>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-8xl mb-4 inline-block">{category?.emoji}</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            {category?.name}
          </h1>
          <p className="text-gray-600">
            {products.length} {products.length === 1 ? "product" : "products"} available
          </p>
        </motion.div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Products Available
            </h3>
            <p className="text-gray-600 mb-6">
              We're currently out of products in this category. Check back soon!
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Browse Other Categories
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50"
        >
          <div className="bg-white rounded-full p-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              ✓
            </motion.div>
          </div>
          <span className="font-semibold">{toast.message}</span>
        </motion.div>
      )}
    </div>
  );
}
