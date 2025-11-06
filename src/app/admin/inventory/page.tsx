"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Product, Category } from "@/types";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  AlertCircle,
  Loader2,
  LogOut,
} from "lucide-react";

export default function AdminInventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<(Product & { categoryName: string })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Check admin authentication
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      router.push("/admin/login");
    }
  }, [router]);

  // Seed categories and products
  const handleSeedData = async () => {
    if (!confirm("This will seed categories and products. Continue?")) return;
    
    setIsSeeding(true);
    try {
      // Seed categories first
      const categoriesResponse = await fetch("/api/seed/categories");
      const categoriesResult = await categoriesResponse.json();
      
      if (!categoriesResult.success) {
        throw new Error(categoriesResult.message);
      }
      
      // Then seed products
      const productsResponse = await fetch("/api/seed/products");
      const productsResult = await productsResponse.json();
      
      if (!productsResult.success) {
        throw new Error(productsResult.message);
      }
      
      alert(`Success! Seeded ${categoriesResult.categoriesSeeded} categories and ${productsResult.productsSeeded} products.`);
      window.location.reload();
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("Failed to seed data. Please try again.");
    } finally {
      setIsSeeding(false);
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, "categories");
        const q = query(categoriesRef, orderBy("displayOrder", "asc"));
        const snapshot = await getDocs(q);
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Real-time products listener
  useEffect(() => {
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        // Add category names to products
        const productsWithCategory = productsData.map((product) => {
          const category = categories.find((cat) => cat.id === product.category);
          return {
            ...product,
            categoryName: category?.name || "Unknown",
          };
        });

        setProducts(productsWithCategory);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching products:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [categories]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group products by category
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const categoryName = product.categoryName;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  const handleDelete = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    document.cookie = "adminSession=; path=/; max-age=0";
    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-8 w-8 text-orange-600" />
                Product Inventory Management
              </h1>
              <p className="text-gray-600 mt-1">Manage your store&apos;s product catalog</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Seed database with sample categories and products"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Package size={20} />
                    Seed Data
                  </>
                )}
              </button>
              <button
                onClick={() => router.push("/admin/inventory/add")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <Plus size={20} />
                Add New Product
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.emoji} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">In Stock</p>
            <p className="text-2xl font-bold text-green-600">
              {products.filter((p) => p.stockQuantity > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">
              {products.filter((p) => p.stockQuantity === 0).length}
            </p>
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <button
                onClick={() => router.push("/admin/inventory/add")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition"
              >
                <Plus size={20} />
                Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
              <div key={categoryName} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">{categoryName}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {categoryProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{product.emoji}</span>
                              <div>
                                <p className="font-semibold text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-semibold text-gray-900">₹{product.price}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-gray-900">{product.stockQuantity} units</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.stockQuantity > 0 ? (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                In Stock
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                Out of Stock
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => router.push(`/admin/inventory/edit/${product.id}`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(product.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
