/**
 * Guest Cart Utilities
 * Manages cart items for unauthenticated users using localStorage
 */

export interface GuestCartItem {
  productId: string;
  quantity: number;
  timestamp: number;
}

const GUEST_CART_KEY = "guestCart";

/**
 * Save a product to the guest cart
 */
export function saveGuestCartItem(productId: string, quantity: number): void {
  try {
    const guestCart = getGuestCart();
    
    // Check if item already exists
    const existingItemIndex = guestCart.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      guestCart[existingItemIndex].quantity += quantity;
      guestCart[existingItemIndex].timestamp = Date.now();
    } else {
      // Add new item
      guestCart.push({
        productId,
        quantity,
        timestamp: Date.now(),
      });
    }

    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
  } catch (error) {
    console.error("Error saving guest cart item:", error);
  }
}

/**
 * Get all items from the guest cart
 */
export function getGuestCart(): GuestCartItem[] {
  try {
    const cartData = localStorage.getItem(GUEST_CART_KEY);
    if (!cartData) {
      return [];
    }
    return JSON.parse(cartData) as GuestCartItem[];
  } catch (error) {
    console.error("Error getting guest cart:", error);
    return [];
  }
}

/**
 * Transfer guest cart items to user's Firestore cart
 */
export async function transferGuestCartToUser(
  userId: string,
  addToCartFunction: (productId: string, quantity: number) => Promise<void>
): Promise<{ success: boolean; itemCount: number; error?: string }> {
  try {
    const guestCart = getGuestCart();
    
    if (guestCart.length === 0) {
      return { success: true, itemCount: 0 };
    }

    // Add all guest cart items to user's cart
    for (const item of guestCart) {
      await addToCartFunction(item.productId, item.quantity);
    }

    // Clear guest cart after successful transfer
    clearGuestCart();

    return { success: true, itemCount: guestCart.length };
  } catch (error: any) {
    console.error("Error transferring guest cart:", error);
    return {
      success: false,
      itemCount: 0,
      error: error.message || "Failed to transfer cart items",
    };
  }
}

/**
 * Clear all items from the guest cart
 */
export function clearGuestCart(): void {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.error("Error clearing guest cart:", error);
  }
}

/**
 * Check if guest cart has items
 */
export function hasGuestCartItems(): boolean {
  const guestCart = getGuestCart();
  return guestCart.length > 0;
}

/**
 * Get count of items in guest cart
 */
export function getGuestCartItemCount(): number {
  const guestCart = getGuestCart();
  return guestCart.reduce((total, item) => total + item.quantity, 0);
}
