"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Order } from "@/types";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Loader2,
  Phone,
  User,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { toast } from "react-hot-toast";

type Stage = 1 | 2 | 3;

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState<Stage>(1);
  const [showConfetti, setShowConfetti] = useState(true);
  const [preparationProgress, setPreparationProgress] = useState(0);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    // Stage progression timers
    const stage1Timer = setTimeout(() => {
      setCurrentStage(2);
      setShowConfetti(false);
    }, 20000); // 20 seconds

    const stage2Timer = setTimeout(() => {
      setCurrentStage(3);
      updateOrderToDispatched();
    }, 60000); // 60 seconds

    return () => {
      clearTimeout(stage1Timer);
      clearTimeout(stage2Timer);
    };
  }, []);

  useEffect(() => {
    // Preparation progress animation (Stage 2)
    if (currentStage === 2) {
      const interval = setInterval(() => {
        setPreparationProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + 2.5; // 40 seconds to reach 100%
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentStage]);

  const fetchOrder = async () => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        setOrder({ id: orderSnap.id, ...orderSnap.data() } as Order);
      } else {
        toast.error("Order not found");
        router.push("/orders");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderToDispatched = async () => {
    if (!orderId) return;

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "dispatched",
        dispatchedAt: serverTimestamp(),
      });

      // Refresh order data
      const updatedOrder = await getDoc(orderRef);
      if (updatedOrder.exists()) {
        setOrder({ id: updatedOrder.id, ...updatedOrder.data() } as Order);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3].map((stage) => (
            <div key={stage} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStage >= stage
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {stage}
              </div>
              {stage < 3 && (
                <div
                  className={`w-16 h-1 ${
                    currentStage > stage ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Stage 1: Order Confirmed */}
          {currentStage === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
              </motion.div>

              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Order Confirmed! 🎉
              </h1>
              <p className="text-gray-600 mb-6">
                Thank you for your order. We're getting it ready!
              </p>

              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-2xl font-bold text-orange-600">
                  {order.orderNumber}
                </p>
              </div>

              <div className="text-left space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg">Order Summary</h3>
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-orange-600">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-6">Stage 1 of 3</p>
            </motion.div>
          )}

          {/* Stage 2: Preparing Order */}
          {currentStage === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Package className="w-24 h-24 text-orange-500 mx-auto mb-6" />
              </motion.div>

              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Packing Your Order 👨‍🍳
              </h1>
              <p className="text-gray-600 mb-8">
                Our kitchen is preparing your delicious food!
              </p>

              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Preparation Progress</span>
                  <span>{Math.round(preparationProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <motion.div
                    className="bg-orange-500 h-4 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${preparationProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="text-left space-y-3">
                <h3 className="font-semibold text-gray-900">Items being prepared:</h3>
                {order.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 bg-orange-50 rounded-lg p-3"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </motion.div>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-6">Stage 2 of 3</p>
            </motion.div>
          )}

          {/* Stage 3: Order Dispatched */}
          {currentStage === 3 && (
            <motion.div
              key="stage3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <motion.div
                animate={{ x: [0, 20, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Truck className="w-24 h-24 text-blue-500 mx-auto mb-6" />
              </motion.div>

              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Order Dispatched! 🚚
              </h1>
              <p className="text-gray-600 mb-8">
                Your order is on its way to you!
              </p>

              {order.deliveryPartner && (
                <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Delivery Partner Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Delivery Partner</p>
                        <p className="font-semibold text-gray-900">
                          {order.deliveryPartner.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Contact Number</p>
                        <p className="font-semibold text-gray-900">
                          {order.deliveryPartner.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p className="font-semibold text-gray-900">30-40 minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => router.push(`/orders/track/${orderId}`)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <Truck size={20} />
                Track Order
              </button>

              <p className="text-sm text-gray-500 mt-6">Stage 3 of 3</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
