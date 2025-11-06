"use client";

import React, { useState, useEffect } from "react";
import { Address, AddressType } from "@/types";
import { z } from "zod";
import { MapPin, User, Phone, Home, Briefcase, MapPinned, Loader2 } from "lucide-react";

// Zod schema for address validation
const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required").min(2, "Name must be at least 2 characters"),
  phone: z.string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  addressLine1: z.string().min(1, "Address Line 1 is required").min(5, "Please enter a valid address"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required").min(2, "Please enter a valid city"),
  state: z.string().min(1, "State is required").min(2, "Please enter a valid state"),
  pinCode: z.string()
    .regex(/^\d{6}$/, "PIN Code must be exactly 6 digits"),
  addressType: z.enum(["Home", "Work", "Other"]),
  isDefault: z.boolean(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  address?: Address;
  onSubmit: (addressData: Omit<Address, "id">) => Promise<void>;
  onCancel: () => void;
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    addressLine1: address?.addressLine1 || "",
    addressLine2: address?.addressLine2 || "",
    city: address?.city || "",
    state: address?.state || "",
    pinCode: address?.pinCode || "",
    addressType: address?.addressType || "Home",
    isDefault: address?.isDefault || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!address;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddressTypeChange = (type: AddressType) => {
    setFormData((prev) => ({ ...prev, addressType: type }));
    if (errors.addressType) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.addressType;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    try {
      addressSchema.parse(formData);
      setErrors({});
      
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error("Error submitting form:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User size={16} className="inline mr-1 text-orange-600" />
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
            errors.fullName ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter your full name"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone size={16} className="inline mr-1 text-orange-600" />
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          maxLength={10}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
            errors.phone ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="10-digit mobile number"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Address Line 1 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin size={16} className="inline mr-1 text-orange-600" />
          Address Line 1 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
            errors.addressLine1 ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="House No., Building Name, Street"
        />
        {errors.addressLine1 && (
          <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>
        )}
      </div>

      {/* Address Line 2 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin size={16} className="inline mr-1 text-gray-400" />
          Address Line 2 (Optional)
        </label>
        <input
          type="text"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          placeholder="Landmark, Area"
        />
      </div>

      {/* City and State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="City"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
              errors.state ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select State</option>
            {indianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state}</p>
          )}
        </div>
      </div>

      {/* PIN Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPinned size={16} className="inline mr-1 text-orange-600" />
          PIN Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="pinCode"
          value={formData.pinCode}
          onChange={handleChange}
          maxLength={6}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
            errors.pinCode ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="6-digit PIN Code"
        />
        {errors.pinCode && (
          <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>
        )}
      </div>

      {/* Address Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Address Type <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleAddressTypeChange("Home")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition ${
              formData.addressType === "Home"
                ? "border-orange-500 bg-orange-50 text-orange-700"
                : "border-gray-300 hover:border-orange-300"
            }`}
          >
            <Home size={18} />
            Home
          </button>
          <button
            type="button"
            onClick={() => handleAddressTypeChange("Work")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition ${
              formData.addressType === "Work"
                ? "border-orange-500 bg-orange-50 text-orange-700"
                : "border-gray-300 hover:border-orange-300"
            }`}
          >
            <Briefcase size={18} />
            Work
          </button>
          <button
            type="button"
            onClick={() => handleAddressTypeChange("Other")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition ${
              formData.addressType === "Other"
                ? "border-orange-500 bg-orange-50 text-orange-700"
                : "border-gray-300 hover:border-orange-300"
            }`}
          >
            <MapPin size={18} />
            Other
          </button>
        </div>
      </div>

      {/* Set as Default */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
        />
        <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
          Set as default delivery address
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {isEditMode ? "Updating..." : "Saving..."}
            </>
          ) : (
            <>{isEditMode ? "Update Address" : "Save Address"}</>
          )}
        </button>
      </div>
    </form>
  );
}
