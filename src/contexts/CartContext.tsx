"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "./AuthContext";
import { Cart, CartItem } from "@/types";

interface CartContextType {
  cart: Cart | null;
  cartItemCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (productId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate total items in cart
  const cartItemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  // Fetch cart from Firestore
  const fetchCart = useCallback(async () => {
    if (!currentUser) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      const cartRef = doc(db, "carts", currentUser.uid);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        setCart({ userId: currentUser.uid, ...cartSnap.data() } as Cart);
      } else {
        // Create empty cart if doesn't exist
        const emptyCart: Omit<Cart, "updatedAt"> = {
          userId: currentUser.uid,
          items: [],
        };
        await setDoc(cartRef, {
          ...emptyCart,
          updatedAt: serverTimestamp(),
        });
        setCart({ ...emptyCart, updatedAt: Timestamp.now() });
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Real-time cart listener
  useEffect(() => {
    if (!currentUser) {
      setCart(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const cartRef = doc(db, "carts", currentUser.uid);
    
    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setCart({ userId: currentUser.uid, ...snapshot.data() } as Cart);
        } else {
          setCart({ userId: currentUser.uid, items: [], updatedAt: Timestamp.now() });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to cart:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Add item to cart
  const addToCart = async (productId: string, quantity: number) => {
    if (!currentUser || !cart) {
      throw new Error("User not authenticated or cart not loaded");
    }

    try {
      // Optimistic update
      const existingItemIndex = cart.items.findIndex((item) => item.productId === productId);
      let updatedItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = [...cart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item
        updatedItems = [
          ...cart.items,
          {
            productId,
            quantity,
            addedAt: Timestamp.now(),
          },
        ];
      }

      // Update local state immediately (optimistic)
      setCart({
        ...cart,
        items: updatedItems,
      });

      // Update Firestore
      const cartRef = doc(db, "carts", currentUser.uid);
      await updateDoc(cartRef, {
        items: updatedItems,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Revert optimistic update on error
      await fetchCart();
      throw error;
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId: string, newQuantity: number) => {
    if (!currentUser || !cart) {
      throw new Error("User not authenticated or cart not loaded");
    }

    try {
      let updatedItems: CartItem[];

      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        updatedItems = cart.items.filter((item) => item.productId !== productId);
      } else {
        // Update quantity
        updatedItems = cart.items.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        );
      }

      // Optimistic update
      setCart({
        ...cart,
        items: updatedItems,
      });

      // Update Firestore
      const cartRef = doc(db, "carts", currentUser.uid);
      await updateDoc(cartRef, {
        items: updatedItems,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating cart item:", error);
      // Revert optimistic update on error
      await fetchCart();
      throw error;
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string) => {
    if (!currentUser || !cart) {
      throw new Error("User not authenticated or cart not loaded");
    }

    try {
      const updatedItems = cart.items.filter((item) => item.productId !== productId);

      // Optimistic update
      setCart({
        ...cart,
        items: updatedItems,
      });

      // Update Firestore
      const cartRef = doc(db, "carts", currentUser.uid);
      await updateDoc(cartRef, {
        items: updatedItems,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
      // Revert optimistic update on error
      await fetchCart();
      throw error;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!currentUser || !cart) {
      throw new Error("User not authenticated or cart not loaded");
    }

    try {
      // Optimistic update
      setCart({
        ...cart,
        items: [],
      });

      // Update Firestore
      const cartRef = doc(db, "carts", currentUser.uid);
      await updateDoc(cartRef, {
        items: [],
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      // Revert optimistic update on error
      await fetchCart();
      throw error;
    }
  };

  const value = {
    cart,
    cartItemCount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
