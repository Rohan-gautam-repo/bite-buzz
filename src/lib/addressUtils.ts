import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase/config";
import { Address, AddressBook } from "@/types";

/**
 * Fetch all addresses for a user from Firebase
 */
export async function fetchUserAddresses(userId: string): Promise<Address[]> {
  try {
    const addressBookRef = doc(db, "addressBooks", userId);
    const addressBookSnap = await getDoc(addressBookRef);

    if (addressBookSnap.exists()) {
      const data = addressBookSnap.data() as AddressBook;
      return data.addresses || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw new Error("Failed to fetch addresses from database");
  }
}

/**
 * Add a new address to the user's address book
 */
export async function addAddress(
  userId: string,
  addressData: Omit<Address, "id">,
  existingAddresses: Address[] = []
): Promise<Address[]> {
  try {
    // Generate unique address ID
    const newAddress: Address = {
      ...addressData,
      id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    let updatedAddresses = [...existingAddresses];

    // If this is set as default, unset other defaults
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((addr) => ({
        ...addr,
        isDefault: false,
      }));
    }

    // If this is the first address, make it default automatically
    if (updatedAddresses.length === 0) {
      newAddress.isDefault = true;
    }

    updatedAddresses.push(newAddress);

    // Save to Firebase
    const addressBookRef = doc(db, "addressBooks", userId);
    await setDoc(
      addressBookRef,
      {
        userId,
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
        createdAt: existingAddresses.length === 0 ? serverTimestamp() : undefined,
      },
      { merge: true }
    );

    return updatedAddresses;
  } catch (error) {
    console.error("Error adding address:", error);
    throw new Error("Failed to add address to database");
  }
}

/**
 * Update an existing address
 */
export async function updateAddress(
  userId: string,
  addressId: string,
  addressData: Omit<Address, "id">,
  existingAddresses: Address[]
): Promise<Address[]> {
  try {
    let updatedAddresses = existingAddresses.map((addr) => {
      if (addr.id === addressId) {
        return { ...addressData, id: addr.id };
      }
      // If new address is set as default, unset others
      if (addressData.isDefault && addr.id !== addressId) {
        return { ...addr, isDefault: false };
      }
      return addr;
    });

    const addressBookRef = doc(db, "addressBooks", userId);
    const addressBookSnap = await getDoc(addressBookRef);

    if (addressBookSnap.exists()) {
      await updateDoc(addressBookRef, {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      });
    } else {
      // If document doesn't exist, create it
      await setDoc(addressBookRef, {
        userId,
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    }

    return updatedAddresses;
  } catch (error) {
    console.error("Error updating address:", error);
    throw new Error("Failed to update address in database");
  }
}

/**
 * Delete an address
 */
export async function deleteAddress(
  userId: string,
  addressId: string,
  existingAddresses: Address[]
): Promise<Address[]> {
  try {
    const addressToDelete = existingAddresses.find((addr) => addr.id === addressId);
    let updatedAddresses = existingAddresses.filter((addr) => addr.id !== addressId);

    // If the deleted address was default and there are other addresses, make the first one default
    if (addressToDelete?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    const addressBookRef = doc(db, "addressBooks", userId);
    const addressBookSnap = await getDoc(addressBookRef);

    if (addressBookSnap.exists()) {
      await updateDoc(addressBookRef, {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      });
    } else {
      throw new Error("Address book not found");
    }

    return updatedAddresses;
  } catch (error) {
    console.error("Error deleting address:", error);
    throw new Error("Failed to delete address from database");
  }
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(
  userId: string,
  addressId: string,
  existingAddresses: Address[]
): Promise<Address[]> {
  try {
    const updatedAddresses = existingAddresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));

    const addressBookRef = doc(db, "addressBooks", userId);
    const addressBookSnap = await getDoc(addressBookRef);

    if (addressBookSnap.exists()) {
      await updateDoc(addressBookRef, {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp(),
      });
    } else {
      throw new Error("Address book not found");
    }

    return updatedAddresses;
  } catch (error) {
    console.error("Error setting default address:", error);
    throw new Error("Failed to set default address in database");
  }
}

/**
 * Get the default address for a user
 */
export async function getDefaultAddress(userId: string): Promise<Address | null> {
  try {
    const addresses = await fetchUserAddresses(userId);
    return addresses.find((addr) => addr.isDefault) || addresses[0] || null;
  } catch (error) {
    console.error("Error getting default address:", error);
    return null;
  }
}

/**
 * Get a specific address by ID
 */
export async function getAddressById(
  userId: string,
  addressId: string
): Promise<Address | null> {
  try {
    const addresses = await fetchUserAddresses(userId);
    return addresses.find((addr) => addr.id === addressId) || null;
  } catch (error) {
    console.error("Error getting address by ID:", error);
    return null;
  }
}

/**
 * Validate if an address exists and belongs to the user
 */
export async function validateUserAddress(
  userId: string,
  addressId: string
): Promise<boolean> {
  try {
    const address = await getAddressById(userId, addressId);
    return address !== null;
  } catch (error) {
    console.error("Error validating address:", error);
    return false;
  }
}
