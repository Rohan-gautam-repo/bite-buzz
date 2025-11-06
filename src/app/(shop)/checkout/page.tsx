"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Product, CartItemWithDetails, Address, PaymentMethod } from "@/types";
import { placeOrder } from "@/lib/orderUtils";
import { validateStockAvailability } from "@/lib/stockValidation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
  ShoppingCart, 
  MapPin, 
  Package, 
  CreditCard, 
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Banknote,
  Smartphone,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

function CheckoutPageContent() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { cart, cartItemCount, loading: cartLoading } = useCart();
  
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("COD");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    // Check if cart is empty
    if (!cartLoading && cartItemCount === 0) {
      toast.error("Your cart is empty");
      router.push("/");
      return;
    }

    // Get selected address from session storage
    const selectedAddressId = sessionStorage.getItem('selectedAddressId');
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      router.push("/cart");
      return;
    }

    fetchCheckoutData(selectedAddressId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, cart, cartLoading, cartItemCount]);

  const fetchCheckoutData = async (addressId: string) => {
    if (!currentUser || !cart || cart.items.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch cart products
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
      const validItems = items.filter((item) => item !== null) as CartItemWithDetails[];
      setCartItems(validItems);

      // Fetch selected address
      const addressBookRef = doc(db, "addressBooks", currentUser.uid);
      const addressBookSnap = await getDoc(addressBookRef);
      
      if (addressBookSnap.exists()) {
        const addressBook = addressBookSnap.data();
        const address = addressBook.addresses?.find((addr: Address) => addr.id === addressId);
        
        if (address) {
          setSelectedAddress(address);
        } else {
          toast.error("Selected address not found");
          router.push("/cart");
        }
      } else {
        toast.error("No addresses found");
        router.push("/cart");
      }
    } catch (error) {
      console.error("Error fetching checkout data:", error);
      toast.error("Failed to load checkout data");
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!currentUser || !selectedAddress || cartItems.length === 0) {
      toast.error("Missing required data");
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Validate stock availability
      const stockValidation = await validateStockAvailability(cart!.items);

      if (!stockValidation.valid) {
        // Show specific stock errors
        const errorMessage = stockValidation.errors.join('\n');
        toast.error(
          <div className="space-y-1">
            <p className="font-semibold">Some items are out of stock:</p>
            {stockValidation.errors.map((error, index) => (
              <p key={index} className="text-sm">{error}</p>
            ))}
          </div>,
          { duration: 5000 }
        );
        setProcessing(false);
        return;
      }

      // Step 2: Place order
      const order = await placeOrder(
        currentUser.uid,
        cart!.items,
        selectedAddress,
        grandTotal,
        selectedPaymentMethod
      );

      // Step 3: Clear session storage
      sessionStorage.removeItem('selectedAddressId');

      // Step 4: Show success and navigate
      toast.success("Order placed successfully!");
      router.push(`/orders/confirmation/${order.id}`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      
      // Parse error message for better display
      const errorMessage = error.message || "Failed to place order";
      
      if (errorMessage.includes("Stock unavailable")) {
        const lines = errorMessage.split('\n').filter((line: string) => line.trim());
        toast.error(
          <div className="space-y-1">
            {lines.map((line: string, index: number) => (
              <p key={index} className="text-sm">{line}</p>
            ))}
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setProcessing(false);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryCharge = subtotal >= 100 ? 0 : 40;
  const grandTotal = subtotal + deliveryCharge;

  if (loading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push("/cart")}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4 font-medium transition"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-10 w-10 text-orange-600" />
            Checkout
          </h1>
          <p className="text-gray-600 mt-2">Review your order and complete purchase</p>
        </motion.div>

        <div className="space-y-6">
          {/* Order Review Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
              Order Review
            </h2>
            <div className="space-y-3">
              {cartItems.map((item, index) => (
                <div
                  key={item.productId}
                  className={`flex items-center justify-between py-3 ${
                    index !== cartItems.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.product.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">
                        ₹{item.product.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-orange-600">₹{item.subtotal}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Delivery Address Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-orange-600" />
                Delivery Address
              </h2>
              <button
                onClick={() => router.push("/cart")}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm transition"
              >
                Change Address
              </button>
            </div>

            {selectedAddress ? (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded">
                        {selectedAddress.addressType}
                      </span>
                      {selectedAddress.isDefault && (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{selectedAddress.fullName}</h3>
                    <p className="text-gray-600 text-sm mb-1">{selectedAddress.phone}</p>
                    <p className="text-gray-700">
                      {selectedAddress.addressLine1}
                      {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                    </p>
                    <p className="text-gray-700">
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pinCode}
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                <p className="text-gray-600">No address selected</p>
              </div>
            )}
          </motion.div>

          {/* Payment Method Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-orange-600" />
              Payment Method
            </h2>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPaymentMethod("COD")}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === "COD"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentMethod === "COD"
                        ? "border-orange-500"
                        : "border-gray-300"
                    }`}>
                      {selectedPaymentMethod === "COD" && (
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                      )}
                    </div>
                  </div>
                  <div className="text-4xl">💵</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Cash on Delivery</h3>
                    <p className="text-sm text-gray-600">Pay when your order arrives</p>
                  </div>
                  {selectedPaymentMethod === "COD" && (
                    <CheckCircle className="h-6 w-6 text-orange-500" />
                  )}
                </div>
              </motion.div>

              {/* UPI - Coming Soon */}
              <div
                className="border-2 border-gray-200 rounded-lg p-4 opacity-60 cursor-not-allowed bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  </div>
                  <div className="text-4xl">📱</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">UPI</h3>
                      <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">PhonePe, Google Pay, Paytm</p>
                  </div>
                </div>
              </div>

              {/* Cards - Coming Soon */}
              <div
                className="border-2 border-gray-200 rounded-lg p-4 opacity-60 cursor-not-allowed bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  </div>
                  <div className="text-4xl">💳</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">Credit/Debit Cards</h3>
                      <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Visa, Mastercard, RuPay</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Summary Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-orange-600" />
              Order Summary
            </h2>

            <div className="space-y-3">
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
              <div className="flex justify-between text-gray-600">
                <span>Payment Method</span>
                <span className="font-semibold flex items-center gap-1">
                  {selectedPaymentMethod === "COD" && "💵 Cash on Delivery"}
                  {selectedPaymentMethod === "UPI" && "📱 UPI"}
                  {selectedPaymentMethod === "Card" && "💳 Card"}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Grand Total</span>
                  <span className="text-3xl font-bold text-orange-600">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={processing || !selectedAddress || cartItems.length === 0}
              className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Processing Order...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Place Order
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By placing this order, you agree to our Terms & Conditions
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutPageContent />
    </ProtectedRoute>
  );
}
