# Phase 7 Testing Guide

## 🧪 Testing Checkout & Order Placement

### Prerequisites
1. ✅ User logged in
2. ✅ Products in cart
3. ✅ At least one delivery address saved

## Test Scenarios

### 1. Happy Path - Successful Order
**Steps**:
1. Go to cart page (`/cart`)
2. Select a delivery address
3. Click "Proceed to Checkout"
4. Verify order review shows all items correctly
5. Verify delivery address is displayed
6. Verify order summary is correct
7. Click "Place Order"
8. Verify loading spinner appears
9. Verify success toast notification
10. Verify navigation to order confirmation page
11. Check cart is now empty
12. Verify stock was deducted in database

**Expected Result**: Order created successfully, cart cleared, stock updated

---

### 2. Empty Cart Validation
**Steps**:
1. Ensure cart is empty
2. Navigate to `/checkout` directly
3. Observe behavior

**Expected Result**: Error toast "Your cart is empty", redirected to home page

---

### 3. No Address Selected
**Steps**:
1. Add items to cart
2. Navigate to `/checkout` directly (without selecting address from cart)
3. Observe behavior

**Expected Result**: Error toast "Please select a delivery address", redirected to cart page

---

### 4. Out of Stock Item
**Steps**:
1. Add an item to cart (e.g., 5 units)
2. Manually set product stock to 0 in Firestore
3. Complete checkout
4. Click "Place Order"
5. Observe error message

**Expected Result**: Error toast showing "{ProductName} - Out of stock", order not created

---

### 5. Insufficient Stock
**Steps**:
1. Add 5 units of a product to cart
2. Manually set product stock to 3 in Firestore
3. Complete checkout
4. Click "Place Order"
5. Observe error message

**Expected Result**: Error toast showing "{ProductName} - Only 3 left", order not created

---

### 6. Multiple Stock Issues
**Steps**:
1. Add multiple items to cart
2. Set different stock levels (some 0, some insufficient)
3. Complete checkout
4. Click "Place Order"
5. Observe error messages

**Expected Result**: Multi-line error toast showing all stock issues, order not created

---

### 7. Change Address
**Steps**:
1. Go to checkout page
2. Click "Change Address" button
3. Verify navigation back to cart
4. Select different address
5. Return to checkout
6. Verify new address is displayed

**Expected Result**: Address changed successfully

---

### 8. Concurrent Order Test
**Steps**:
1. Open checkout page in two browser tabs
2. Set product stock to 10
3. Add 8 units to cart in Tab 1
4. Add 8 units to cart in Tab 2
5. Place order in Tab 1 (should succeed)
6. Place order in Tab 2 (should fail due to insufficient stock)

**Expected Result**: 
- Tab 1: Order successful, stock reduced to 2
- Tab 2: Error message "Insufficient stock (2 available)"

---

### 9. Order Data Validation
**Steps**:
1. Place a successful order
2. Check Firestore `orders` collection
3. Verify order document has:
   - ✅ Unique order number (BUZZ format)
   - ✅ User ID
   - ✅ All order items with correct data
   - ✅ Delivery address
   - ✅ Total amount
   - ✅ Status: "preparing"
   - ✅ Delivery partner (name and phone)
   - ✅ Order date timestamp

**Expected Result**: All fields present and correct

---

### 10. Stock Deduction Validation
**Steps**:
1. Note product stock quantity before order
2. Place order
3. Check product stock quantity after order
4. Calculate: oldStock - orderedQuantity = newStock

**Expected Result**: Stock correctly deducted

---

### 11. Cart Clearing Validation
**Steps**:
1. Place order successfully
2. Check cart badge in navbar
3. Navigate to cart page
4. Check Firestore `carts` collection

**Expected Result**: Cart empty, badge shows 0, cart document deleted from Firestore

---

### 12. Delivery Charges Calculation
**Steps**:
1. Test with subtotal < ₹100
   - Expected: ₹40 delivery charge
2. Test with subtotal >= ₹100
   - Expected: FREE delivery

**Expected Result**: Delivery charges calculated correctly

---

### 13. UI/UX Tests

#### Loading States
- ✅ Initial page load shows spinner
- ✅ Place order button shows loading spinner
- ✅ Button disabled during processing

#### Error Feedback
- ✅ Stock errors show in toast
- ✅ Network errors show friendly message
- ✅ Multi-line errors displayed properly

#### Navigation
- ✅ Back to cart works
- ✅ Change address works
- ✅ Success navigates to confirmation
- ✅ Error keeps user on checkout

#### Responsive Design
- ✅ Works on mobile (< 640px)
- ✅ Works on tablet (640px - 1024px)
- ✅ Works on desktop (> 1024px)

---

### 14. Network Error Simulation
**Steps**:
1. Open browser DevTools
2. Set network to "Offline"
3. Try to place order
4. Observe error handling

**Expected Result**: Friendly error message, no crash

---

### 15. Transaction Rollback Test
**Steps**:
1. Place order with multiple items
2. Simulate transaction failure (disconnect during order)
3. Check that:
   - Order not created
   - Stock not deducted
   - Cart not cleared

**Expected Result**: Complete rollback, no partial data

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read property 'items' of null"
**Solution**: Ensure user is logged in and cart exists

### Issue: "Address not found"
**Solution**: Ensure address ID in session storage matches an actual address

### Issue: "Product not found"
**Solution**: Ensure all cart items reference existing products

### Issue: Toast not showing
**Solution**: Verify Toaster component is in layout

---

## 📊 Database Checks

After each test, verify in Firestore:

### Orders Collection
```
orders/
  └── {userId}_{timestamp}/
      ├── orderNumber: "BUZZ..."
      ├── userId: "..."
      ├── items: [...]
      ├── deliveryAddress: {...}
      ├── totalAmount: 999
      ├── status: "preparing"
      ├── deliveryPartner: {name, phone}
      └── orderDate: Timestamp
```

### Products Collection
```
products/
  └── {productId}/
      ├── stockQuantity: (reduced)
      └── updatedAt: Timestamp
```

### Carts Collection
```
carts/
  └── {userId}/ (should be deleted)
```

---

## ✅ Test Completion Checklist

- [ ] Happy path successful order
- [ ] Empty cart validation
- [ ] No address validation
- [ ] Out of stock handling
- [ ] Insufficient stock handling
- [ ] Multiple stock issues
- [ ] Change address
- [ ] Concurrent orders
- [ ] Order data validation
- [ ] Stock deduction validation
- [ ] Cart clearing validation
- [ ] Delivery charges calculation
- [ ] Loading states
- [ ] Error feedback
- [ ] Navigation flows
- [ ] Responsive design
- [ ] Network error handling
- [ ] Transaction rollback

---

## 🚀 Performance Checks

- [ ] Page loads in < 2 seconds
- [ ] Order placement completes in < 3 seconds
- [ ] No memory leaks
- [ ] No console errors
- [ ] Smooth animations (60fps)

---

**Happy Testing!** 🎉
