# Guest Cart to User Cart Transfer Feature

## Overview
This feature allows non-logged-in users (guests) to add products to their cart, and when they log in or register, those cart items are automatically transferred to their user account cart.

## Implementation Details

### 1. **CartContext.tsx** - Updated
Added a new `transferGuestCart` function that:
- Retrieves items from localStorage guest cart
- Adds each item to the user's Firestore cart
- Clears the guest cart after successful transfer
- Handles errors gracefully without blocking the login process

Added an auto-transfer useEffect hook that:
- Automatically triggers when a user logs in
- Checks for guest cart items
- Transfers them to the user's cart without manual intervention

### 2. **Login Page** - Updated
- Imports `transferGuestCart` from CartContext
- Checks if guest has cart items using `hasGuestCartItems()`
- Automatically transfers cart items after successful login
- Shows success message to user
- Redirects to the returnUrl or cart page

### 3. **Register Page** - Updated
- Same functionality as login page
- Transfers guest cart items after successful registration
- Shows appropriate success messages

### 4. **Category Products Page** - Already Configured
- When guest users click "Add to Cart", items are saved to localStorage
- User is redirected to login page with returnUrl set to `/cart`
- After login, items are automatically transferred

## User Flow

### Scenario 1: Guest adds items then logs in
1. Guest user browses products (not logged in)
2. Guest clicks "Add to Cart" on a product
3. Product is saved to localStorage (guest cart)
4. User is shown a toast: "Please login to complete your purchase!"
5. User is redirected to login page
6. User enters credentials and logs in
7. **Automatic Transfer**: Guest cart items are automatically transferred to user's Firestore cart
8. Success message shown: "Cart items transferred successfully!"
9. User is redirected to cart page (or specified returnUrl)
10. User can see their cart items and proceed to checkout

### Scenario 2: Guest adds multiple items
1. Guest adds multiple products to cart (all saved to localStorage)
2. Guest clicks login or navigates to login page
3. Guest logs in
4. All items from guest cart are transferred to user cart
5. Guest cart is cleared from localStorage

### Scenario 3: Guest registers new account
1. Guest adds items to cart
2. Guest clicks register to create new account
3. After successful registration
4. Cart items are automatically transferred
5. User is redirected to cart/home page with items in cart

### Scenario 4: Automatic transfer on any login
1. Guest adds items to cart
2. Guest closes browser or navigates away
3. Guest returns later and logs in directly (without being prompted)
4. Cart items are still in localStorage
5. **Auto-transfer triggers** when user logs in
6. Items are seamlessly added to user's cart

## Technical Details

### Guest Cart Storage
- Stored in `localStorage` with key: `"guestCart"`
- Data structure:
```typescript
interface GuestCartItem {
  productId: string;
  quantity: number;
  timestamp: number;
}
```

### Transfer Process
1. User logs in/registers
2. CartContext detects user authentication
3. Checks localStorage for guest cart items
4. For each item in guest cart:
   - Calls `addToCart(productId, quantity)`
   - Item is added to Firestore user cart
   - If item already exists, quantities are merged
5. After all items transferred:
   - `clearGuestCart()` removes items from localStorage
6. Cart UI updates automatically via real-time listener

### Error Handling
- If transfer fails for one item, continues with remaining items
- Errors are logged but don't block login process
- User can manually add items if transfer fails

## Files Modified
1. `src/contexts/CartContext.tsx` - Added transferGuestCart function and auto-transfer logic
2. `src/app/(auth)/login/page.tsx` - Updated to use new transfer method
3. `src/app/(auth)/register/page.tsx` - Updated to use new transfer method

## Files Used (No Changes Needed)
1. `src/lib/guestCartUtils.ts` - Utility functions for guest cart operations
2. `src/app/(shop)/category/[id]/page.tsx` - Already implements guest cart saving
3. `src/components/ProductCard.tsx` - Displays products with add to cart functionality

## Testing Checklist

### Test Case 1: Guest to Login Flow
- [ ] Add product to cart as guest
- [ ] Verify product saved in localStorage (check DevTools → Application → Local Storage)
- [ ] Click login
- [ ] Enter credentials and login
- [ ] Verify items appear in cart after login
- [ ] Verify localStorage guest cart is cleared

### Test Case 2: Multiple Items Transfer
- [ ] Add 3-4 different products as guest
- [ ] Login
- [ ] Verify all items appear in cart with correct quantities
- [ ] Verify no duplicates

### Test Case 3: Quantity Merging
- [ ] Login and add item X to cart (quantity: 2)
- [ ] Logout
- [ ] As guest, add same item X to cart (quantity: 3)
- [ ] Login again
- [ ] Verify item X has quantity of 5 (2+3)

### Test Case 4: Registration Flow
- [ ] Add items to cart as guest
- [ ] Click register
- [ ] Create new account
- [ ] Verify items transferred to new account

### Test Case 5: Direct Login (No Prompt)
- [ ] Add items as guest
- [ ] Navigate to login page directly (without being prompted)
- [ ] Login
- [ ] Verify items still transferred

### Test Case 6: Empty Guest Cart
- [ ] Login without adding any items as guest
- [ ] Verify no errors occur
- [ ] Verify cart is empty

## Benefits
1. **Improved User Experience**: Users don't lose their cart when they log in
2. **Increased Conversion**: Users are more likely to complete purchases
3. **Seamless Transition**: Automatic transfer requires no user action
4. **Data Persistence**: Cart data preserved across sessions
5. **Flexible**: Works with both login and registration flows

## Future Enhancements (Optional)
- Add cart item count badge showing guest cart items
- Add toast notification showing how many items were transferred
- Add ability to merge conflicting items with user preference
- Add guest cart expiration (auto-clear after X days)
- Add guest cart sync across tabs
