"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Order, OrderStatus } from "@/types";
import { cancelOrder } from "@/lib/orderUtils";
import { 
  Package, 
  Loader2,
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function OrderHistoryPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("userId", "==", currentUser.uid),
        orderBy("orderDate", "desc"),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const ordersData: Order[] = [];

      querySnapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() } as Order);
      });

      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (order: Order) => {
    setReordering(order.id);

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
      setReordering(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrder(orderId);

    try {
      await cancelOrder(orderId);
      toast.success("Order cancelled successfully");
      setShowCancelDialog(null);
      // Refresh orders
      await fetchOrders();
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast.error(error.message || "Failed to cancel order");
    } finally {
      setCancellingOrder(null);
    }
  };

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

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "preparing":
        return <Package className="w-4 h-4" />;
      case "dispatched":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md"
        >
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">No Orders Yet</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't placed any orders yet. Start shopping now!
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-10 w-10 text-orange-600" />
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">
            {orders.length} {orders.length === 1 ? "order" : "orders"} found
          </p>
        </motion.div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <button
                      onClick={() => router.push(`/orders/track/${order.id}`)}
                      className="text-lg font-bold text-orange-600 hover:text-orange-700 transition"
                    >
                      #{order.orderNumber}
                    </button>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(order.orderDate)}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-3 mb-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2"
                    >
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
                </div>

                {/* Total Amount */}
                <div className="border-t pt-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => router.push(`/orders/track/${order.id}`)}
                    className="flex-1 min-w-[150px] bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Eye size={18} />
                    Track Order
                  </button>

                  <button
                    onClick={() => handleReorder(order)}
                    disabled={reordering === order.id}
                    className="flex-1 min-w-[150px] bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {reordering === order.id ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <RotateCcw size={18} />
                        Reorder
                      </>
                    )}
                  </button>

                  {order.status === "preparing" && (
                    <button
                      onClick={() => setShowCancelDialog(order.id)}
                      className="flex-1 min-w-[150px] bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
                onClick={() => setShowCancelDialog(null)}
                disabled={cancellingOrder !== null}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Keep Order
              </button>
              <button
                onClick={() => handleCancelOrder(showCancelDialog)}
                disabled={cancellingOrder !== null}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                {cancellingOrder ? (
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
