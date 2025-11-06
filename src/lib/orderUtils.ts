import { db } from './firebase/config';
import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { CartItem, Order, Address, OrderItem } from '@/types';
import { validateStockAvailability } from './stockValidation';

/**
 * Generates a unique order number in format: BUZZ + timestamp + random
 * Example: BUZZ1730912345678
 */
function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `BUZZ${timestamp}${random}`;
}

/**
 * Generates a random delivery partner with name and phone
 */
function generateDeliveryPartner(): { name: string; phone: string } {
  const names = [
    'Rajesh Kumar',
    'Amit Sharma',
    'Vikram Singh',
    'Priya Patel',
    'Suresh Reddy',
    'Arjun Mehta',
    'Neha Gupta',
    'Ravi Verma',
  ];

  const randomName = names[Math.floor(Math.random() * names.length)];

  // Generate random 10-digit phone number
  const firstPart = Math.floor(10000 + Math.random() * 90000); // 5 digits
  const secondPart = Math.floor(10000 + Math.random() * 90000); // 5 digits
  const phone = `+91 ${firstPart}-${secondPart}`;

  return { name: randomName, phone };
}

/**
 * Places an order with stock validation and transaction handling
 * @param userId - User ID placing the order
 * @param cartItems - Items in the cart
 * @param deliveryAddress - Delivery address for the order
 * @param totalAmount - Total amount of the order
 * @returns Promise with created Order object
 * @throws Error if stock validation fails or transaction fails
 */
export async function placeOrder(
  userId: string,
  cartItems: CartItem[],
  deliveryAddress: Address,
  totalAmount: number
): Promise<Order> {
  // Step 1: Validate stock availability
  const stockValidation = await validateStockAvailability(cartItems);

  if (!stockValidation.valid) {
    throw new Error(
      `Stock unavailable:\n${stockValidation.errors.join('\n')}`
    );
  }

  // Step 2: Create order using Firestore transaction
  let orderId: string = '';

  try {
    await runTransaction(db, async (transaction) => {
      // Revalidate stock within transaction (to handle concurrent orders)
      const orderItems: OrderItem[] = [];

      for (const cartItem of cartItems) {
        const productRef = doc(db, 'products', cartItem.productId);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`Product ${cartItem.productId} not found`);
        }

        const product = productSnap.data();
        const availableStock = product.stockQuantity || 0;

        // Final stock check within transaction
        if (availableStock < cartItem.quantity) {
          throw new Error(
            `${product.name} - Insufficient stock (${availableStock} available)`
          );
        }

        // Prepare order item
        orderItems.push({
          productId: cartItem.productId,
          name: product.name,
          price: product.price,
          quantity: cartItem.quantity,
          emoji: product.emoji,
        });

        // Deduct stock
        const newStock = availableStock - cartItem.quantity;
        transaction.update(productRef, {
          stockQuantity: newStock,
          updatedAt: serverTimestamp(),
        });
      }

      // Generate order details
      const orderNumber = generateOrderNumber();
      const deliveryPartner = generateDeliveryPartner();
      const orderRef = doc(db, 'orders', `${userId}_${Date.now()}`);

      const orderData: any = {
        userId,
        orderNumber,
        items: orderItems,
        deliveryAddress,
        totalAmount,
        status: 'preparing',
        deliveryPartner,
        orderDate: serverTimestamp(),
      };

      // Create order document
      transaction.set(orderRef, orderData);

      // Clear user's cart
      const cartRef = doc(db, 'carts', userId);
      transaction.delete(cartRef);

      // Store order ID for return
      orderId = orderRef.id;
    });

    // Fetch the created order to get the actual server timestamp
    if (orderId) {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (orderDoc.exists()) {
        return {
          id: orderDoc.id,
          ...orderDoc.data(),
        } as Order;
      }
    }

    throw new Error('Order creation failed');
  } catch (error: any) {
    console.error('Error placing order:', error);
    throw new Error(error.message || 'Failed to place order. Please try again.');
  }
}

/**
 * Cancels an order and restores stock to products
 * @param orderId - ID of the order to cancel
 * @throws Error if order cannot be cancelled or transaction fails
 */
export async function cancelOrder(orderId: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }

      const order = orderSnap.data() as Order;

      // Check if order can be cancelled
      if (order.status !== 'preparing') {
        throw new Error('Cannot cancel order after dispatch');
      }

      // Restore stock for all items
      for (const item of order.items) {
        const productRef = doc(db, 'products', item.productId);
        const productSnap = await transaction.get(productRef);

        if (productSnap.exists()) {
          const product = productSnap.data();
          const currentStock = product.stockQuantity || 0;
          const newStock = currentStock + item.quantity;

          transaction.update(productRef, {
            stockQuantity: newStock,
            updatedAt: serverTimestamp(),
          });
        }
      }

      // Update order status to cancelled
      transaction.update(orderRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
      });
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    throw new Error(error.message || 'Failed to cancel order. Please try again.');
  }
}
