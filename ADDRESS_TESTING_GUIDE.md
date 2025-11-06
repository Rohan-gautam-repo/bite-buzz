# Address Feature Testing Guide

## Prerequisites
- Firebase project must be set up and configured
- User must be authenticated
- Firestore rules must be deployed

## Manual Testing Steps

### 1. Test: Add First Address (Auto-Default)

**Steps:**
1. Login to the application
2. Navigate to `/addresses`
3. Click "Add New Address"
4. Fill in all required fields:
   - Full Name: "John Doe"
   - Phone: "9876543210"
   - Address Line 1: "123 Main Street, Apartment 4B"
   - Address Line 2: "Near Central Park" (optional)
   - City: "Mumbai"
   - State: "Maharashtra"
   - PIN Code: "400001"
   - Address Type: "Home"
   - Do NOT check "Set as default"
5. Click "Save Address"

**Expected Result:**
- ✅ Address is saved successfully
- ✅ Toast notification: "Address added successfully"
- ✅ Address appears in the list
- ✅ Address has "Default" badge (automatically set)
- ✅ Orange ring around the address card

**Verify in Firebase Console:**
- Document exists at `addressBooks/{userId}`
- Contains `addresses` array with 1 item
- First address has `isDefault: true`

---

### 2. Test: Add Second Address (Non-Default)

**Steps:**
1. Click "Add New Address" again
2. Fill in different details:
   - Full Name: "John Doe"
   - Phone: "9876543211"
   - Address Line 1: "456 Office Plaza, Floor 12"
   - City: "Mumbai"
   - State: "Maharashtra"
   - PIN Code: "400002"
   - Address Type: "Work"
   - Do NOT check "Set as default"
3. Click "Save Address"

**Expected Result:**
- ✅ Second address is saved
- ✅ First address still shows "Default" badge
- ✅ Second address does NOT have "Default" badge
- ✅ Both addresses visible in grid

**Verify in Firebase:**
- `addresses` array has 2 items
- Only first address has `isDefault: true`

---

### 3. Test: Set Second Address as Default

**Steps:**
1. On the second (Work) address card
2. Click "Set as Default" button

**Expected Result:**
- ✅ Toast: "Default address updated"
- ✅ Work address now has "Default" badge
- ✅ Home address no longer has "Default" badge
- ✅ Orange ring moves to Work address

**Verify in Firebase:**
- Work address has `isDefault: true`
- Home address has `isDefault: false`

---

### 4. Test: Edit Address

**Steps:**
1. Click "Edit" on any address
2. Modify some fields:
   - Change phone to "9876543299"
   - Change Address Line 1
   - Check "Set as default" (if not already)
3. Click "Update Address"

**Expected Result:**
- ✅ Toast: "Address updated successfully"
- ✅ Changes are reflected immediately
- ✅ Address becomes default if checkbox was checked

**Verify in Firebase:**
- Address fields are updated
- `updatedAt` timestamp is current

---

### 5. Test: Delete Non-Default Address

**Steps:**
1. Ensure you have at least 2 addresses
2. Click "Delete" on a non-default address
3. Click "Delete" in confirmation modal

**Expected Result:**
- ✅ Toast: "Address deleted successfully"
- ✅ Address is removed from grid
- ✅ Other addresses remain unchanged
- ✅ Default address remains default

**Verify in Firebase:**
- Address removed from `addresses` array
- Other addresses intact

---

### 6. Test: Delete Default Address

**Steps:**
1. Ensure you have at least 2 addresses
2. Click "Delete" on the default address
3. Click "Delete" in confirmation modal

**Expected Result:**
- ✅ Toast: "Address deleted successfully"
- ✅ Default address is removed
- ✅ First remaining address automatically becomes default
- ✅ "Default" badge appears on first remaining address

**Verify in Firebase:**
- Default address removed
- First address in array has `isDefault: true`

---

### 7. Test: Form Validation - Phone Number

**Steps:**
1. Click "Add New Address"
2. Enter phone numbers with different lengths:
   - "123" (too short)
   - "12345678901" (too long)
   - "abcd123456" (contains letters)

**Expected Result:**
- ✅ Error message: "Phone number must be exactly 10 digits"
- ❌ Form submission is blocked
- ✅ Input field shows red border

**Valid Input:**
- "9876543210" (exactly 10 digits)
- ✅ No error message
- ✅ Form can be submitted

---

### 8. Test: Form Validation - PIN Code

**Steps:**
1. Try different PIN codes:
   - "123" (too short)
   - "1234567" (too long)
   - "abc123" (contains letters)

**Expected Result:**
- ✅ Error: "PIN Code must be exactly 6 digits"
- ❌ Form blocked

**Valid Input:**
- "400001" (exactly 6 digits)
- ✅ No error

---

### 9. Test: Form Validation - Required Fields

**Steps:**
1. Leave each required field empty one at a time
2. Try to submit

**Expected Results:**
- Full Name empty: "Full name is required"
- Phone empty: (caught by regex)
- Address Line 1 empty: "Address Line 1 is required"
- City empty: "City is required"
- State not selected: "State is required"
- PIN Code empty: (caught by regex)

---

### 10. Test: Address Type Selection

**Steps:**
1. Click "Add New Address"
2. Try selecting each address type:
   - Home (house icon, orange highlight)
   - Work (briefcase icon, orange highlight)
   - Other (pin icon, orange highlight)

**Expected Result:**
- ✅ Selected type is highlighted
- ✅ Only one type can be selected
- ✅ Icon changes based on selection

---

### 11. Test: Address in Cart/Checkout Flow

**Steps:**
1. Add items to cart
2. Go to Cart page
3. Verify addresses are available for selection
4. Select an address
5. Click "Proceed to Checkout"
6. Verify address appears in checkout page

**Expected Result:**
- ✅ All saved addresses appear in cart
- ✅ Default address is pre-selected
- ✅ Selected address carries to checkout
- ✅ Address details are displayed correctly

---

### 12. Test: Order Placement with Address

**Steps:**
1. Complete checkout with a selected address
2. Place order
3. View order in Order History
4. Check delivery address

**Expected Result:**
- ✅ Order is placed successfully
- ✅ Delivery address is embedded in order
- ✅ Address shows correctly in order details

**Verify in Firebase:**
- Order document has `deliveryAddress` object
- Address data is complete

---

### 13. Test: Security - Access Other User's Addresses

**Steps:**
1. Login as User A
2. Note User A's UID
3. Logout
4. Login as User B
5. Try to access User A's addressBook via Firebase Console or API

**Expected Result:**
- ❌ Permission denied
- ✅ Security rules prevent access

---

### 14. Test: Concurrent Updates

**Steps:**
1. Open application in two browser tabs
2. Add address in Tab 1
3. Without refreshing, try to add address in Tab 2
4. Refresh Tab 2
5. Both addresses should appear

**Expected Result:**
- ✅ Both addresses are saved
- ✅ No data loss
- ✅ Latest state reflects in both tabs after refresh

---

## Automated Testing Checklist

Create test files for:

- [ ] AddressForm validation
- [ ] Address CRUD operations
- [ ] Default address logic
- [ ] Address ID generation
- [ ] Security rules
- [ ] Cart integration
- [ ] Checkout integration

## Performance Testing

**Test with:**
- 1 address (typical)
- 5 addresses (normal)
- 20 addresses (edge case)

**Measure:**
- Load time for addresses page
- Time to add/update/delete address
- Firebase read/write operations count

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Design Testing

Test on:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## Common Issues & Solutions

### Issue: "Failed to add address"
**Solution:** Check Firebase configuration and security rules

### Issue: "Address book not found" during update
**Solution:** Document may not exist; code now handles with setDoc fallback

### Issue: No default address after deletion
**Solution:** Code automatically sets first remaining address as default

### Issue: Multiple default addresses
**Solution:** Code enforces single default by unsetting others

### Issue: Validation errors not showing
**Solution:** Check Zod schema and error state handling

## Firebase Console Verification

After each test, verify in Firebase Console:

1. Go to Firestore Database
2. Navigate to `addressBooks` collection
3. Find document with your user ID
4. Verify:
   - `userId` matches your UID
   - `addresses` array is correct
   - `isDefault` values are correct
   - `updatedAt` timestamp is recent

## Regression Testing

When making changes to address system, re-run:
- All validation tests
- CRUD operation tests
- Default address logic tests
- Integration tests (cart, checkout, orders)

## Success Criteria

✅ All addresses are stored in Firebase  
✅ Only authenticated users can access their addresses  
✅ Validation prevents invalid data  
✅ Default address logic works correctly  
✅ Address deletion handles default reassignment  
✅ Cart/checkout integration works seamlessly  
✅ Order placement includes correct address  
✅ No console errors  
✅ Toast notifications appear appropriately  
✅ UI is responsive and accessible  
