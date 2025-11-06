"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Address } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { MapPin, Plus, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AddressRequiredCheckProps {
  onAddressSelected?: (addressId: string) => void;
  selectedAddressId?: string;
}

export default function AddressRequiredCheck({ 
  onAddressSelected, 
  selectedAddressId 
}: AddressRequiredCheckProps) {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoAddressModal, setShowNoAddressModal] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchAddresses();
    }
  }, [currentUser]);

  const fetchAddresses = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const addressBookRef = doc(db, "addressBooks", currentUser.uid);
      const addressBookSnap = await getDoc(addressBookRef);

      if (addressBookSnap.exists()) {
        const data = addressBookSnap.data();
        const userAddresses = data.addresses || [];
        setAddresses(userAddresses);

        // If no addresses exist, show the modal
        if (userAddresses.length === 0) {
          setShowNoAddressModal(true);
        } else if (!selectedAddressId && onAddressSelected) {
          // Auto-select default address if available
          const defaultAddress = userAddresses.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            onAddressSelected(defaultAddress.id);
          }
        }
      } else {
        // No address book exists, show modal
        setShowNoAddressModal(true);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddressClick = () => {
    router.push("/addresses");
  };

  const handleSelectAddress = (addressId: string) => {
    if (onAddressSelected) {
      onAddressSelected(addressId);
    }
    setShowAddressSelector(false);
  };

  const getSelectedAddress = () => {
    return addresses.find((addr) => addr.id === selectedAddressId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="animate-spin h-6 w-6 text-orange-600" />
      </div>
    );
  }

  return (
    <>
      {/* Address Selection Section */}
      {addresses.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin size={16} className="inline mr-1 text-orange-600" />
            Delivery Address <span className="text-red-500">*</span>
          </label>
          
          {selectedAddressId && getSelectedAddress() ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={18} className="text-green-600" />
                    <span className="font-semibold text-gray-900">
                      {getSelectedAddress()?.fullName}
                    </span>
                    {getSelectedAddress()?.isDefault && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 ml-6">
                    {getSelectedAddress()?.addressLine1}
                    {getSelectedAddress()?.addressLine2 && `, ${getSelectedAddress()?.addressLine2}`}
                    <br />
                    {getSelectedAddress()?.city}, {getSelectedAddress()?.state} - {getSelectedAddress()?.pinCode}
                    <br />
                    Phone: {getSelectedAddress()?.phone}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddressSelector(true)}
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedAddressId || ""}
                onChange={(e) => handleSelectAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none pr-10"
              >
                <option value="">Select delivery address</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.addressType} - {address.fullName} ({address.city})
                    {address.isDefault && " - Default"}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <button
            onClick={handleAddAddressClick}
            className="text-sm text-orange-600 hover:underline mt-2 flex items-center gap-1"
          >
            <Plus size={16} />
            Add new address
          </button>
        </div>
      )}

      {/* No Address Modal */}
      <AnimatePresence>
        {showNoAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-orange-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Add Delivery Address
                </h3>
                <p className="text-gray-600 mb-6">
                  Please add a delivery address first to proceed with checkout
                </p>

                <button
                  onClick={handleAddAddressClick}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 mb-3 transition"
                >
                  <Plus size={20} />
                  Add Address
                </button>
                
                <button
                  onClick={() => setShowNoAddressModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  I'll do it later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Selector Modal */}
      <AnimatePresence>
        {showAddressSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddressSelector(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Select Delivery Address
                </h3>
                <button
                  onClick={() => setShowAddressSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    onClick={() => handleSelectAddress(address.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedAddressId === address.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {address.fullName}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {address.addressType}
                          </span>
                          {address.isDefault && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {address.addressLine1}
                          {address.addressLine2 && `, ${address.addressLine2}`}
                          <br />
                          {address.city}, {address.state} - {address.pinCode}
                          <br />
                          Phone: {address.phone}
                        </p>
                      </div>
                      {selectedAddressId === address.id && (
                        <CheckCircle2 size={24} className="text-orange-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddAddressClick}
                className="w-full mt-4 border-2 border-dashed border-gray-300 hover:border-orange-500 text-gray-600 hover:text-orange-600 px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
              >
                <Plus size={20} />
                Add New Address
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
