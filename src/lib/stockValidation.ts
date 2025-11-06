import { db } from './firebase/config';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { CartItem } from '@/types';

export interface StockValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates stock availability for all items in the cart
 * Uses Firestore transaction to handle concurrent access
 * @param cartItems - Array of cart items to validate
 * @returns Promise with validation result containing valid flag and error messages
 */
export async function validateStockAvailability(
  cartItems: CartItem[]
): Promise<StockValidationResult> {
  const errors: string[] = [];

  try {
    await runTransaction(db, async (transaction) => {
      // Fetch all products in parallel within the transaction
      const productPromises = cartItems.map(async (item) => {
        const productRef = doc(db, 'products', item.productId);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          errors.push(`Product (ID: ${item.productId}) - Product not found`);
          return;
        }

        const product = productSnap.data();
        const productName = product.name || 'Unknown Product';
        const availableStock = product.stockQuantity || 0;

        // Check if sufficient stock is available
        if (availableStock < item.quantity) {
          if (availableStock === 0) {
            errors.push(`${productName} - Out of stock`);
          } else {
            errors.push(`${productName} - Only ${availableStock} left`);
          }
        }
      });

      await Promise.all(productPromises);
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    console.error('Error validating stock:', error);
    return {
      valid: false,
      errors: ['Failed to validate stock availability. Please try again.'],
    };
  }
}
