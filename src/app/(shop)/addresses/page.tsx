"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Address } from "@/types";
import AddressForm from "@/components/AddressForm";
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Home, 
  Briefcase,
  Star,
  X,
  Loader2,
  Phone,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddressesPage() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchAddresses();
    } else if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  const fetchAddresses = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const addressBookRef = doc(db, "addressBooks", currentUser.uid);
      const addressBookSnap = await getDoc(addressBookRef);

      if (addressBookSnap.exists()) {
        const data = addressBookSnap.data();
        setAddresses(data.addresses || []);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      showToast("Failed to load addresses", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddAddress = async (addressData: Omit<Address, "id">) => {
    if (!currentUser) return;

    try {
      const newAddress: Address = {
        ...addressData,
        id: `addr_${Date.now()}`,
      };

      let updatedAddresses = [...addresses];

      // If this is set as default, unset other defaults
      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map((addr) => ({
          ...addr,
          isDefault: false,
        }));
      }

      updatedAddresses.push(newAddress);

      const addressBookRef = doc(db, "addressBooks", currentUser.uid);
      await setDoc(addressBookRef, {
        userId: currentUser.uid,
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      });

      setAddresses(updatedAddresses);
      setShowForm(false);
      showToast("Address added successfully", "success");
    } catch (error) {
      console.error("Error adding address:", error);
      showToast("Failed to add address", "error");
    }
  };

  const handleEditAddress = async (addressData: Omit<Address, "id">) => {
    if (!currentUser || !editingAddress) return;

    try {
      let updatedAddresses = addresses.map((addr) => {
        if (addr.id === editingAddress.id) {
          return { ...addressData, id: addr.id };
        }
        // If new address is set as default, unset others
        if (addressData.isDefault && addr.id !== editingAddress.id) {
          return { ...addr, isDefault: false };
        }
        return addr;
      });

      const addressBookRef = doc(db, "addressBooks", currentUser.uid);
      await updateDoc(addressBookRef, {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      });

      setAddresses(updatedAddresses);
      setEditingAddress(undefined);
      setShowForm(false);
      showToast("Address updated successfully", "success");
    } catch (error) {
      console.error("Error updating address:", error);
      showToast("Failed to update address", "error");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!currentUser) return;

    try {
      const updatedAddresses = addresses.filter((addr) => addr.id !== addressId);

      const addressBookRef = doc(db, "addressBooks", currentUser.uid);
      await updateDoc(addressBookRef, {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      });

      setAddresses(updatedAddresses);
      setDeleteConfirm(null);
      showToast("Address deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting address:", error);
      showToast("Failed to delete address", "error");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!currentUser) return;

    try {
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));

      const addressBookRef = doc(db, "addressBooks", currentUser.uid);
      await updateDoc(addressBookRef, {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      });

      setAddresses(updatedAddresses);
      showToast("Default address updated", "success");
    } catch (error) {
      console.error("Error setting default address:", error);
      showToast("Failed to set default address", "error");
    }
  };

  const openAddForm = () => {
    setEditingAddress(undefined);
    setShowForm(true);
  };

  const openEditForm = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAddress(undefined);
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "Home":
        return <Home size={18} className="text-orange-600" />;
      case "Work":
        return <Briefcase size={18} className="text-blue-600" />;
      default:
        return <MapPin size={18} className="text-gray-600" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading addresses...</p>
        </div>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <MapPin className="h-10 w-10 text-orange-600" />
                My Addresses
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your delivery addresses
              </p>
            </div>
            <button
              onClick={openAddForm}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Add New Address
            </button>
          </div>
        </motion.div>

        {/* Empty State */}
        {addresses.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <MapPin className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No Addresses Saved Yet</h2>
            <p className="text-gray-600 mb-8">
              Add your first delivery address to make checkout faster and easier
            </p>
            <button
              onClick={openAddForm}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 mx-auto transition"
            >
              <Plus size={20} />
              Add Your First Address
            </button>
          </motion.div>
        )}

        {/* Addresses Grid */}
        {addresses.length > 0 && !showForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`bg-white rounded-xl shadow-sm p-6 relative ${
                  address.isDefault ? "ring-2 ring-orange-500" : ""
                }`}
              >
                {/* Default Badge */}
                {address.isDefault && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                      <Star size={12} fill="currentColor" />
                      Default
                    </span>
                  </div>
                )}

                {/* Address Type Icon & Badge */}
                <div className="flex items-center gap-2 mb-4">
                  {getAddressIcon(address.addressType)}
                  <span className="text-sm font-medium text-gray-600">
                    {address.addressType}
                  </span>
                </div>

                {/* Full Name */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-gray-900">
                    <User size={16} className="text-gray-400" />
                    <h3 className="text-lg font-bold">{address.fullName}</h3>
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={16} className="text-gray-400" />
                    <p>{address.phone}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <div className="flex items-start gap-2 text-gray-700">
                    <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                      <br />
                      {address.city}, {address.state} - {address.pinCode}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <button
                    onClick={() => openEditForm(address)}
                    className="flex items-center gap-1 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(address.id)}
                    className="flex items-center gap-1 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex items-center gap-1 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition ml-auto"
                    >
                      <Star size={16} />
                      Set as Default
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Address Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
              onClick={closeForm}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full my-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingAddress ? "Edit Address" : "Add New Address"}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X size={24} className="text-gray-500" />
                  </button>
                </div>

                <AddressForm
                  address={editingAddress}
                  onSubmit={editingAddress ? handleEditAddress : handleAddAddress}
                  onCancel={closeForm}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Address?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this address? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(deleteConfirm)}
                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 z-50"
            >
              <div
                className={`px-6 py-4 rounded-lg shadow-lg ${
                  toast.type === "success"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {toast.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
