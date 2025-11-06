"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { Minus, Plus, ShoppingCart, Check, Loader2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, quantity: number) => Promise<void>;
  isGuest?: boolean;
}

export default function ProductCard({ product, onAddToCart, isGuest = false }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const maxQuantity = Math.min(10, product.stockQuantity);
  const isInStock = product.stockQuantity > 0;

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await onAddToCart(product.id, quantity);
      
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setQuantity(1); // Reset quantity after adding
      }, 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Product Image/Emoji */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 flex items-center justify-center">
        <span className="text-7xl">{product.emoji}</span>
      </div>

      {/* Product Details */}
      <div className="p-6 space-y-4">
        {/* Name and Price */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-2xl font-bold text-orange-600">
            ₹{product.price}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        {/* Out of Stock Badge - Only show when stock is 0 */}
        {!isInStock && (
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
              ✗ Out of Stock
            </span>
          </div>
        )}

        {/* Quantity Selector and Add to Cart */}
        {isInStock && (
          <div className="space-y-3 pt-2">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Minus size={16} className="text-gray-600" />
                </button>
                <span className="w-8 text-center font-semibold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= maxQuantity}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Plus size={16} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding || showSuccess}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                showSuccess
                  ? "bg-green-500 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isAdding ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {isGuest ? "Redirecting..." : "Adding..."}
                </>
              ) : showSuccess ? (
                <>
                  <Check size={20} />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  {isGuest ? "Login to Add" : "Add to Cart"}
                </>
              )}
            </button>
          </div>
        )}

        {/* Out of Stock Button */}
        {!isInStock && (
          <button
            disabled
            className="w-full py-3 rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}
