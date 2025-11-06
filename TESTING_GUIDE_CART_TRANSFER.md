# Testing Guide: Guest Cart to User Cart Transfer

## Quick Test Steps

### Test 1: Basic Guest to Login Transfer ⭐ (Most Important)

1. **Open browser in incognito/private mode** (to ensure clean state)

2. **Navigate to the app**: `http://localhost:3000`

3. **Make sure you're logged out**
   - Check if you see "Login" button in navbar

4. **Browse to a category**
   - Click on any category (e.g., Vegetables 🥕, Fruits 🍎)

5. **Add a product to cart**
   - Click "Add to Cart" or "Login to Add" button
   - You should see: "Please login to complete your purchase!"
   - You'll be redirected to login page

6. **Check localStorage** (Optional - for verification)
   - Open DevTools (F12)
   - Go to Application → Local Storage → your domain
   - Look for key: `guestCart`
   - Should show: `[{"productId":"xxx","quantity":1,"timestamp":xxx}]`

7. **Login with existing account**
   - Enter email and password
   - Click "Login"

8. **Verify transfer**
   - Should see message: "Transferring your cart items..."
   - Then: "Cart items transferred successfully!"
   - Should be redirected to cart page or home

9. **Check your cart**
   - Click cart icon in navbar
   - Verify the product you added as guest is now in your cart

10. **Verify localStorage cleared**
    - Open DevTools → Application → Local Storage
    - `guestCart` key should be empty or removed

✅ **Expected Result**: Product appears in cart after login

---

### Test 2: Multiple Items Transfer

1. **Logout** (if logged in)

2. **Add multiple products** (3-4 different products)
   - Add Product A from Category 1
   - Add Product B from Category 2
   - Add Product C from Category 1
   - Add Product D from Category 3

3. **Check localStorage**
   - Should show 4 items in `guestCart`

4. **Navigate to login page**

5. **Login**

6. **Verify all items in cart**
   - All 4 products should appear
   - Each with correct quantity

✅ **Expected Result**: All 4 products appear in cart

---

### Test 3: Quantity Merging

1. **Login** to your account

2. **Add Product X to cart** (quantity: 2)
   - Verify it's in your cart with quantity 2

3. **Logout**

4. **As guest, add same Product X** (quantity: 3)

5. **Login again**

6. **Check cart**
   - Product X should have quantity: 5 (2 + 3)

✅ **Expected Result**: Quantities are merged (2 + 3 = 5)

---

### Test 4: Registration Flow

1. **Logout** (clear any guest cart)

2. **Add products as guest** (2-3 products)

3. **Click "Register"** instead of login

4. **Create new account**
   - Fill in email, username, password
   - Submit form

5. **Verify transfer after registration**
   - Should see transfer message
   - Items should appear in cart

✅ **Expected Result**: Items transferred to new account

---

### Test 5: Direct Login (Auto-Transfer)

1. **Logout**

2. **Add items to cart as guest**

3. **Close browser tab** (simulate leaving site)

4. **Open new tab** and navigate to app

5. **Navigate directly to login page** (don't click "Add to Cart")
   - Type URL: `http://localhost:3000/login`

6. **Login**

7. **Navigate to cart**
   - Items should still be there

✅ **Expected Result**: Auto-transfer works even without "Add to Cart" prompt

---

### Test 6: Empty Guest Cart (No Errors)

1. **Logout**

2. **Do NOT add any items**

3. **Navigate to login page**

4. **Login**

5. **Verify no errors**
   - No error messages in console
   - No error popups
   - Login completes normally

✅ **Expected Result**: Login works normally with no errors

---

## Debugging Tools

### Check localStorage in Browser Console

```javascript
// Get guest cart
JSON.parse(localStorage.getItem('guestCart'))

// Clear guest cart manually (if needed)
localStorage.removeItem('guestCart')

// Add test item to guest cart
localStorage.setItem('guestCart', JSON.stringify([
  { productId: 'test-product-id', quantity: 2, timestamp: Date.now() }
]))
```

### Check Firestore Cart in Console

1. Open Firebase Console
2. Go to Firestore Database
3. Navigate to `carts` collection
4. Find your user ID document
5. Check `items` array

### Check Browser DevTools

**Console Tab**: Look for these logs
```
User logged in, auto-transferring guest cart
Transferring X guest cart items to user cart
Guest cart transfer completed and cleared
```

**Network Tab**: Check Firestore requests
- Look for `updateDoc` calls to `carts/{userId}`

**Application Tab**: Check localStorage
- Key: `guestCart`
- Should be cleared after login

---

## Common Issues & Solutions

### Issue 1: Items not transferring
**Solution**: 
- Check if `guestCart` exists in localStorage before login
- Check browser console for error messages
- Verify user is actually logged in (check navbar)

### Issue 2: Duplicate items in cart
**Solution**: 
- This is expected behavior if item already exists
- Quantities should be merged
- Check the `addToCart` function logic

### Issue 3: localStorage not clearing
**Solution**: 
- Check if `clearGuestCart()` is being called
- Manually clear: `localStorage.removeItem('guestCart')`
- Check for JavaScript errors in console

### Issue 4: Transfer message not showing
**Solution**: 
- Message only shows if guest cart has items
- Check `hasGuestCartItems()` returns true
- Verify success message state is being set

---

## Success Criteria

✅ Guest can add items to cart without login  
✅ Items saved to localStorage as guest  
✅ After login, items automatically transfer to user cart  
✅ Transfer works for both login AND registration  
✅ localStorage cleared after transfer  
✅ User sees success message  
✅ Items appear in cart page  
✅ Quantities merge correctly if item already exists  
✅ No errors in console  
✅ Works with returnUrl parameter  

---

## Test Data

### Test Accounts
Create these test accounts for testing:
```
Email: test1@example.com
Password: Test@123

Email: test2@example.com
Password: Test@456
```

### Test Products
Use existing products from your database:
- Check different categories
- Test with different quantities
- Test with in-stock and out-of-stock items

---

## Automated Testing Script (Optional)

If you want to write automated tests, here's a structure:

```javascript
describe('Guest Cart Transfer', () => {
  
  beforeEach(() => {
    // Clear localStorage
    cy.clearLocalStorage()
    // Logout if logged in
    cy.logout()
  })
  
  it('should transfer guest cart items after login', () => {
    // Add item as guest
    cy.visit('/category/vegetables')
    cy.contains('Add to Cart').first().click()
    
    // Verify localStorage
    cy.window().then((win) => {
      const guestCart = JSON.parse(win.localStorage.getItem('guestCart'))
      expect(guestCart).to.have.length(1)
    })
    
    // Login
    cy.visit('/login')
    cy.get('input[name="email"]').type('test1@example.com')
    cy.get('input[name="password"]').type('Test@123')
    cy.get('button[type="submit"]').click()
    
    // Verify cart
    cy.visit('/cart')
    cy.contains('Cart Items').should('exist')
    cy.get('[data-testid="cart-item"]').should('have.length', 1)
    
    // Verify localStorage cleared
    cy.window().then((win) => {
      const guestCart = win.localStorage.getItem('guestCart')
      expect(guestCart).to.be.null
    })
  })
})
```

---

## Performance Considerations

- Transfer happens asynchronously
- Doesn't block login UI
- Individual item failures don't stop batch transfer
- 1 second delay allows cart context to initialize
- Optimistic updates for better UX

---

## Security Notes

- Guest cart stored in browser localStorage (client-side)
- No sensitive data in guest cart (only product IDs and quantities)
- Transfer requires authentication
- Firestore security rules still apply
- User can only transfer to their own cart

---

## Browser Compatibility

✅ Chrome/Edge (tested)  
✅ Firefox (should work)  
✅ Safari (should work)  
⚠️ IE11 (localStorage supported but not recommended)  

---

## Next Steps After Testing

If all tests pass:
1. ✅ Feature is production-ready
2. Deploy to staging environment
3. Test in staging with real users
4. Monitor logs for any errors
5. Deploy to production

If tests fail:
1. Check console logs for errors
2. Verify all files were updated correctly
3. Restart development server
4. Clear browser cache and localStorage
5. Re-test with fresh browser session
