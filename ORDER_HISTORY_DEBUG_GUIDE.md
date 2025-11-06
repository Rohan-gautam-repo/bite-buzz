# Order History Debugging Guide

## Issue: Unable to See Order History

If you're unable to see orders in the order history page, follow this debugging guide to identify and fix the issue.

## Step 1: Check Browser Console

1. Open the Orders page (`/orders`)
2. Open browser Developer Tools (F12)
3. Go to the **Console** tab
4. Look for these log messages:

### Expected Console Output:
```
Current user detected: [USER_ID] [USER_EMAIL]
Fetched [NUMBER] orders for user [USER_ID]
```

### If you see:
- **"No current user found"** → Authentication issue (see Step 2)
- **"Index not available"** → Firestore index issue (see Step 3)
- **"Fetched 0 orders"** → No orders exist yet (see Step 4)
- **Error messages** → Database permission issue (see Step 5)

## Step 2: Verify User Authentication

### Check if user is logged in:
1. Open Console in browser
2. Type: `localStorage.getItem('user')`
3. Should show user data

### If not logged in:
1. Go to Login page
2. Sign in with your credentials
3. Return to Orders page

## Step 3: Create Firestore Index (Most Common Issue)

The query requires a composite index in Firestore.

### Create Index via Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Set:
   - Collection ID: `orders`
   - Field 1: `userId` (Ascending)
   - Field 2: `orderDate` (Descending)
6. Click **Create Index**
7. Wait for index to build (usually 1-5 minutes)

### Create Index via Error Link:
If you see an index error in console with a link, simply click the link and it will auto-create the index.

### Alternative: Modify firestore.rules
Add this to your `firestore.rules`:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 4: Verify Orders Exist in Firestore

### Check Firestore Database:
1. Go to Firebase Console
2. Navigate to **Firestore Database** → **Data** tab
3. Find the `orders` collection
4. Check if any documents exist
5. Open a document and verify:
   - `userId` matches your user ID
   - `orderDate` field exists
   - `items` array has data
   - `status` is set correctly

### If No Orders Exist:
1. Place a test order:
   - Add items to cart
   - Select delivery address
   - Proceed to checkout
   - Place order
2. Check if order appears in Firestore
3. Return to Orders page

## Step 5: Check Firestore Security Rules

### Verify read permissions:
Your `firestore.rules` should allow users to read their own orders:

```javascript
match /orders/{orderId} {
  allow read: if request.auth != null && 
                 resource.data.userId == request.auth.uid;
  allow create: if request.auth != null && 
                   request.resource.data.userId == request.auth.uid;
  allow update: if request.auth != null && 
                   resource.data.userId == request.auth.uid;
}
```

### Test rules:
1. Firebase Console → Firestore → Rules
2. Click **Rules Playground**
3. Test read operation on `/orders/[any_order_id]`

## Step 6: Network Issues

### Check Network tab:
1. Open DevTools → Network tab
2. Refresh Orders page
3. Look for Firestore requests
4. Check for:
   - 403 errors (permission denied)
   - 404 errors (collection not found)
   - Network failures

## Step 7: Manual Testing Steps

### Test the complete flow:

1. **Login**
   - Navigate to `/login`
   - Sign in with email/password
   - Verify redirect to home

2. **Add items to cart**
   - Browse products
   - Click "Add to Cart" on multiple items
   - Verify cart badge shows count

3. **Add delivery address**
   - Navigate to `/addresses`
   - Add a new address
   - Set as default

4. **Place order**
   - Go to `/cart`
   - Select delivery address
   - Click "Proceed to Checkout"
   - On checkout page, click "Place Order"
   - Wait for confirmation

5. **Check order confirmation**
   - Should redirect to `/orders/confirmation/[orderId]`
   - Watch the 3-stage animation
   - Note the order number

6. **View order history**
   - Click profile menu
   - Select "My Orders"
   - OR navigate to `/orders`
   - Order should appear in list

## Step 8: Common Issues & Solutions

### Issue: "Index required" error
**Solution**: Create Firestore composite index (see Step 3)

### Issue: Orders show for wrong user
**Solution**: 
- Check userId in order documents
- Verify authentication context
- Clear browser cache and re-login

### Issue: Orders exist but don't display
**Solution**:
- Check browser console for errors
- Verify Firestore rules allow read access
- Try manual query in Firestore console

### Issue: Page stuck on loading
**Solution**:
- Check network connectivity
- Verify Firestore configuration
- Check for JavaScript errors

## Step 9: Quick Debug Mode

I've added debug information to the page:

1. When page loads, check console for:
   - Current user ID
   - Number of orders fetched

2. On empty state, the user ID is displayed

3. Use this to verify:
   - User is authenticated
   - User ID matches order documents in Firestore

## Step 10: Create Test Order

If you need to create a test order quickly:

1. **Via Firebase Console**:
   ```javascript
   // Go to Firestore → orders collection → Add document
   {
     userId: "[YOUR_USER_ID]",
     orderNumber: "BUZZ1234567890",
     items: [
       {
         productId: "product1",
         name: "Test Pizza",
         price: 299,
         quantity: 2,
         emoji: "🍕"
       }
     ],
     deliveryAddress: {
       fullName: "Test User",
       phone: "+91 12345-67890",
       addressLine1: "123 Test St",
       city: "Test City",
       state: "Test State",
       pinCode: "123456",
       addressType: "Home",
       isDefault: true
     },
     totalAmount: 598,
     status: "preparing",
     orderDate: [Current Timestamp],
     deliveryPartner: {
       name: "Test Driver",
       phone: "+91 98765-43210"
     }
   }
   ```

2. Refresh the Orders page

## Verification Checklist

After following the steps, verify:

- [ ] User is logged in (check console)
- [ ] Firestore index is created
- [ ] Orders exist in Firestore database
- [ ] Order documents have correct userId
- [ ] Security rules allow read access
- [ ] No errors in browser console
- [ ] Network requests succeed
- [ ] Orders display on page

## Still Not Working?

If orders still don't appear:

1. **Check the exact error message** in console
2. **Copy the error** and check:
   - Firestore documentation
   - Stack Overflow
   - GitHub issues

3. **Share these details**:
   - Browser console logs
   - Network tab screenshots
   - Firestore rules
   - Order document structure

4. **Try a fresh start**:
   - Clear browser cache
   - Logout and login again
   - Try incognito mode
   - Try different browser

## Success Indicators

✅ Orders page shows order cards
✅ Can click order number to track
✅ Status badges display correctly
✅ Can reorder items
✅ Can cancel preparing orders

---

**Most Common Issue**: Missing Firestore composite index

**Quick Fix**: Click the index creation link in the error message or manually create it in Firebase Console.
