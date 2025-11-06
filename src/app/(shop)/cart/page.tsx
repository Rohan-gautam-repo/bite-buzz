"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Product, CartItemWithDetails } from "@/types";
import AddressRequiredCheck from "@/components/AddressRequiredCheck";
import ProtectedRoute from "@/components/ProtectedRoute";
import BackButton from "@/components/BackButton";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Loader2, 
  ShoppingBag,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CartPage() {
  const router = useRouter();
  const { cart, cartItemCount, updateCartItem, removeFromCart, loading: cartLoading } = useCart();
  
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (cart && cart.items.length > 0) {
      fetchCartProducts();
    } else {
      setLoading(false);
      setCartItems([]);
    }
  }, [cart]);

  const fetchCartProducts = async () => {
    if (!cart || cart.items.length === 0) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const productPromises = cart.items.map(async (item) => {
        const productRef = doc(db, "products", item.productId);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const product = { id: productSnap.id, ...productSnap.data() } as Product;
          return {
            ...item,
            product,
            subtotal: product.price * item.quantity,
          };
        }
        return null;
      });

      const items = await Promise.all(productPromises);
      setCartItems(items.filter((item) => item !== null) as CartItemWithDetails[]);
    } catch (error) {
      console.error("Error fetching cart products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1 || newQuantity > maxStock) return;
    
    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryCharge = subtotal >= 100 ? 0 : 40;
  const grandTotal = subtotal + deliveryCharge;

  if (cartLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (cartItemCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md"
        >
          <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet. Start shopping now!
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 mx-auto transition"
          >
            <ShoppingBag size={20} />
            Start Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <BackButton />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="h-10 w-10 text-orange-600" />
            Your Cart
          </h1>
          <p className="text-gray-600 mt-2">
            {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg flex items-center justify-center">
                      <span className="text-5xl">{item.product.emoji}</span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {item.product.description}
                        </p>
                      </div>
                      <button
                        onClick={() => setDeleteConfirm(item.productId)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1, item.product.stockQuantity)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1, item.product.stockQuantity)}
                          disabled={item.quantity >= Math.min(10, item.product.stockQuantity)}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          ₹{item.product.price} × {item.quantity}
                        </p>
                        <p className="text-xl font-bold text-orange-600">
                          ₹{item.subtotal}
                        </p>
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {item.product.stockQuantity < 5 && (
                      <p className="text-xs text-amber-600 mt-2">
                        ⚠️ Only {item.product.stockQuantity} left in stock
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 sticky top-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  {deliveryCharge === 0 ? (
                    <span className="font-semibold text-green-600">FREE</span>
                  ) : (
                    <span className="font-semibold">₹{deliveryCharge}</span>
                  )}
                </div>
                {subtotal < 100 && (
                  <p className="text-xs text-green-600">
                    Add ₹{(100 - subtotal).toFixed(0)} more for FREE delivery!
                  </p>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Grand Total</span>
                    <span className="text-orange-600">₹{grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address Selector */}
              <AddressRequiredCheck
                onAddressSelected={setSelectedAddress}
                selectedAddressId={selectedAddress}
              />

              {/* Checkout Button */}
              <button
                onClick={() => {
                  if (selectedAddress) {
                    // Store selected address in session storage for checkout page
                    sessionStorage.setItem('selectedAddressId', selectedAddress);
                    router.push("/checkout");
                  }
                }}
                disabled={!selectedAddress}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                Proceed to Checkout
              </button>

              {!selectedAddress && (
                <p className="text-xs text-amber-600 text-center mt-2">
                  ⚠️ Please select a delivery address to proceed
                </p>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                By proceeding, you agree to our Terms & Conditions
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Remove Item?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this item from your cart?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveItem(deleteConfirm)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
              >
                Remove
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
