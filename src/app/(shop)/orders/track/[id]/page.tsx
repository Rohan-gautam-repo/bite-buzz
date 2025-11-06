"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Order, OrderStatus } from "@/types";
import { cancelOrder } from "@/lib/orderUtils";
import { useCart } from "@/contexts/CartContext";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Home,
  Loader2,
  ArrowLeft,
  Phone,
  User,
  MapPin,
  Calendar,
  XCircle,
  AlertCircle,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Confetti from "react-confetti";

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { addToCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showDeliveryConfetti, setShowDeliveryConfetti] = useState(false);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    // Real-time listener for order updates
    const orderRef = doc(db, "orders", orderId);
    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setOrder({ id: snapshot.id, ...snapshot.data() } as Order);
        } else {
          toast.error("Order not found");
          router.push("/orders");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [orderId, router]);

  // Background auto-delivery checker - runs independently
  useEffect(() => {
    if (!order || order.status !== "dispatched" || !orderId) return;

    // Check if order should be delivered based on dispatch time
    const checkAndDeliverOrder = async () => {
      if (!order.dispatchedAt) return;

      const dispatchTime = order.dispatchedAt.toDate();
      const currentTime = new Date();
      const elapsedSeconds = (currentTime.getTime() - dispatchTime.getTime()) / 1000;

      // If 20 seconds have passed since dispatch, auto-deliver
      if (elapsedSeconds >= 20) {
        try {
          const orderRef = doc(db, "orders", orderId);
          await updateDoc(orderRef, {
            status: "delivered",
            deliveredAt: serverTimestamp(),
          });
          // Toast will be shown when the status updates via the listener
        } catch (error) {
          console.error("Error updating order to delivered:", error);
        }
      } else {
        // Schedule delivery for the remaining time
        const remainingTime = (20 - elapsedSeconds) * 1000;
        const deliveryTimer = setTimeout(async () => {
          try {
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, {
              status: "delivered",
              deliveredAt: serverTimestamp(),
            });
          } catch (error) {
            console.error("Error updating order to delivered:", error);
          }
        }, remainingTime);

        return () => clearTimeout(deliveryTimer);
      }
    };

    checkAndDeliverOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status, order?.dispatchedAt, orderId]);

  // Show confetti and toast when order is delivered
  useEffect(() => {
    if (order?.status === "delivered" && !showDeliveryConfetti) {
      setShowDeliveryConfetti(true);
      toast.success("Order delivered successfully! 🎉");
      setTimeout(() => setShowDeliveryConfetti(false), 5000);
    }
  }, [order?.status, showDeliveryConfetti]);

  const handleReorder = async () => {
    if (!order) return;

    setReordering(true);
    try {
      for (const item of order.items) {
        await addToCart(item.productId, item.quantity);
      }
      toast.success("Items added to cart!");
      router.push("/cart");
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Failed to add items to cart");
    } finally {
      setReordering(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;

    setCancelling(true);
    try {
      await cancelOrder(orderId);
      toast.success("Order cancelled successfully");
      setShowCancelDialog(false);
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast.error(error.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
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

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "dispatched":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isStageCompleted = (stage: OrderStatus) => {
    const stages: OrderStatus[] = ["preparing", "dispatched", "delivered"];
    const currentIndex = stages.indexOf(order.status);
    const stageIndex = stages.indexOf(stage);
    return currentIndex >= stageIndex;
  };

  const isStageInProgress = (stage: OrderStatus) => {
    return order.status === stage;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
      {showDeliveryConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push("/orders")}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4 font-medium transition"
          >
            <ArrowLeft size={20} />
            Back to Orders
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Track Order</h1>
              <p className="text-gray-600 mt-2">Order #{order.orderNumber}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </motion.div>

        {/* Timeline */}
        {order.status !== "cancelled" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-8 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Order Progress</h2>

            <div className="space-y-8">
              {/* Stage 1: Order Placed */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  {order.status !== "preparing" && (
                    <div className="w-1 h-16 bg-green-500 mt-2" />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-semibold text-gray-900 text-lg">Order Placed</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {formatDate(order.orderDate)}
                  </p>
                  <p className="text-green-600 text-sm mt-1">✅ Completed</p>
                </div>
              </div>

              {/* Stage 2: Preparing */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isStageCompleted("preparing")
                        ? "bg-green-500"
                        : isStageInProgress("preparing")
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                    }`}
                  >
                    {isStageInProgress("preparing") ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Package className="w-6 h-6 text-white" />
                      </motion.div>
                    ) : (
                      <Package className="w-6 h-6 text-white" />
                    )}
                  </div>
                  {(isStageCompleted("dispatched") ||
                    isStageInProgress("dispatched")) && (
                    <div
                      className={`w-1 h-16 mt-2 ${
                        isStageCompleted("dispatched") ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-semibold text-gray-900 text-lg">Preparing</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Your order is being prepared
                  </p>
                  {isStageInProgress("preparing") && (
                    <p className="text-yellow-600 text-sm mt-1">⏳ In Progress</p>
                  )}
                  {isStageCompleted("dispatched") && (
                    <p className="text-green-600 text-sm mt-1">✅ Completed</p>
                  )}
                </div>
              </div>

              {/* Stage 3: Dispatched */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isStageCompleted("delivered")
                        ? "bg-green-500"
                        : isStageInProgress("dispatched")
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                  >
                    {isStageInProgress("dispatched") ? (
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Truck className="w-6 h-6 text-white" />
                      </motion.div>
                    ) : (
                      <Truck className="w-6 h-6 text-white" />
                    )}
                  </div>
                  {(isStageCompleted("delivered") ||
                    isStageInProgress("delivered")) && (
                    <div
                      className={`w-1 h-16 mt-2 ${
                        isStageCompleted("delivered") ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-semibold text-gray-900 text-lg">Dispatched</h3>
                  {isStageInProgress("dispatched") || isStageCompleted("delivered") ? (
                    <>
                      <p className="text-gray-600 text-sm mt-1">
                        {order.dispatchedAt && formatDate(order.dispatchedAt)}
                      </p>
                      {order.deliveryPartner && (
                        <div className="bg-blue-50 rounded-lg p-4 mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">
                              {order.deliveryPartner.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">{order.deliveryPartner.phone}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            📍 Estimated delivery: 20 minutes
                          </p>
                        </div>
                      )}
                      {isStageInProgress("dispatched") && (
                        <p className="text-blue-600 text-sm mt-2">🚚 On the way</p>
                      )}
                      {isStageCompleted("delivered") && (
                        <p className="text-green-600 text-sm mt-2">✅ Completed</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400 text-sm mt-1">Not yet dispatched</p>
                  )}
                </div>
              </div>

              {/* Stage 4: Delivered */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isStageCompleted("delivered") ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <Home className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-semibold text-gray-900 text-lg">Delivered</h3>
                  {isStageCompleted("delivered") ? (
                    <>
                      <p className="text-gray-600 text-sm mt-1">
                        {order.deliveredAt && formatDate(order.deliveredAt)}
                      </p>
                      <div className="bg-green-50 rounded-lg p-4 mt-3">
                        <p className="text-green-600 font-semibold text-center mb-2">
                          ✅ Order delivered successfully!
                        </p>
                        <p className="text-sm text-gray-600 text-center">
                          Thank you for ordering with BiteBuzz! 🎉
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-400 text-sm mt-1">Not yet delivered</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Cancelled Status */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-8 mb-6"
          >
            <div className="text-center py-8">
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Order Cancelled
              </h2>
              <p className="text-gray-600 mb-4">
                This order was cancelled on{" "}
                {order.cancelledAt && formatDate(order.cancelledAt)}
              </p>
              <span className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold text-sm">
                Cancelled
              </span>
            </div>
          </motion.div>
        )}

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Details</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-orange-600">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Payment Method
                </span>
                <span className="font-semibold text-gray-900">
                  {order.paymentMethod === "COD" && "💵 Cash on Delivery"}
                  {order.paymentMethod === "UPI" && "📱 UPI"}
                  {order.paymentMethod === "Card" && "💳 Card"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-orange-600">
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-orange-600" />
            Delivery Address
          </h2>
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-1">
              {order.deliveryAddress.fullName}
            </h3>
            <p className="text-gray-600 text-sm mb-1">
              {order.deliveryAddress.phone}
            </p>
            <p className="text-gray-700">
              {order.deliveryAddress.addressLine1}
              {order.deliveryAddress.addressLine2 &&
                `, ${order.deliveryAddress.addressLine2}`}
            </p>
            <p className="text-gray-700">
              {order.deliveryAddress.city}, {order.deliveryAddress.state} -{" "}
              {order.deliveryAddress.pinCode}
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        {order.status === "preparing" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => setShowCancelDialog(true)}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <XCircle size={20} />
              Cancel Order
            </button>
          </motion.div>
        )}

        {order.status === "delivered" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleReorder}
              disabled={reordering}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {reordering ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Adding to Cart...
                </>
              ) : (
                <>
                  <RotateCcw size={20} />
                  Order Again
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cancel Order?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to cancel this order? This action cannot be
                undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelling}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
