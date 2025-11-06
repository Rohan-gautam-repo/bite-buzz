# 🧪 PHASE 4 Testing Guide

## Quick Test Checklist

Follow this guide to test all Phase 4 admin features.

---

## ✅ Pre-requisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Ensure Firebase is configured:**
   - Check `.env.local` has all Firebase keys
   - Firestore database is accessible

3. **Categories must exist:**
   - Run seed categories if not done: `http://localhost:3000/api/seed/categories`

---

## 🔐 Test 1: Admin Login

### Test Case 1.1: Successful Login
1. Go to: `http://localhost:3000/login`
2. Click "🔐 Admin Access" link at bottom
3. Enter credentials:
   - Username: `Admin`
   - Password: `Password@2025`
4. Click "Admin Login"

**Expected Result:**
- ✅ Redirects to `/admin/inventory`
- ✅ Session saved in localStorage and cookies

### Test Case 1.2: Failed Login (Wrong Credentials)
1. Go to: `http://localhost:3000/admin/login`
2. Enter incorrect credentials:
   - Username: `admin` (lowercase)
   - Password: `wrong`
3. Click "Admin Login"

**Expected Result:**
- ❌ Error message: "Invalid credentials. Please try again."
- ❌ Stays on login page

### Test Case 1.3: Session Persistence
1. Login successfully
2. Refresh the page
3. Navigate to other admin pages

**Expected Result:**
- ✅ Remains logged in
- ✅ No redirect to login page

### Test Case 1.4: Logout
1. From inventory page, click "Logout" button

**Expected Result:**
- ✅ Redirects to `/admin/login`
- ✅ Session cleared from localStorage and cookies
- ✅ Cannot access admin pages without logging in again

---

## 🌱 Test 2: Product Seeding

### Test Case 2.1: First Time Seeding
1. Go to: `http://localhost:3000/api/seed/products`

**Expected Result:**
- ✅ JSON response: `{ "success": true, "message": "Successfully seeded X products", "count": 58 }`
- ✅ 58 products created in Firestore

### Test Case 2.2: Duplicate Prevention
1. Visit seed endpoint again: `http://localhost:3000/api/seed/products`

**Expected Result:**
- ✅ JSON response: `{ "success": true, "message": "Skipped: X products already exist", "count": X }`
- ✅ No duplicate products created

---

## 📊 Test 3: Inventory Dashboard

### Test Case 3.1: View All Products
1. Login as admin
2. View inventory dashboard at `/admin/inventory`

**Expected Result:**
- ✅ Products displayed grouped by category
- ✅ 8 category sections shown
- ✅ Statistics cards show correct counts
- ✅ Products show emoji, name, description, price, stock, status

### Test Case 3.2: Search Products
1. In search bar, type "apple"

**Expected Result:**
- ✅ Only products with "apple" in name or category shown
- ✅ Other products hidden

### Test Case 3.3: Filter by Category
1. Select "Fruits" from category dropdown

**Expected Result:**
- ✅ Only fruit products shown
- ✅ Other categories hidden

### Test Case 3.4: Stock Status Badges
1. Find a product with stock > 0
2. Find a product with stock = 0 (you may need to edit one first)

**Expected Result:**
- ✅ Products with stock > 0 show green "In Stock" badge
- ✅ Products with stock = 0 show red "Out of Stock" badge

### Test Case 3.5: Real-time Updates
1. Open inventory in two browser windows
2. In window 1, edit a product
3. Watch window 2

**Expected Result:**
- ✅ Window 2 updates automatically without refresh

---

## ➕ Test 4: Add Product

### Test Case 4.1: Successful Product Creation
1. Click "Add New Product" button
2. Fill form:
   - Name: "Test Product"
   - Description: "This is a test product"
   - Category: Select any category
   - Price: 100
   - Stock: 50
   - Emoji: 🧪
3. Click "Add Product"

**Expected Result:**
- ✅ Redirects to inventory page
- ✅ New product appears in the list
- ✅ Product saved in Firestore with timestamps

### Test Case 4.2: Form Validation
1. Click "Add New Product"
2. Try to submit empty form

**Expected Result:**
- ❌ Error messages appear for required fields
- ❌ Form doesn't submit

### Test Case 4.3: Invalid Price
1. Enter negative price: `-10`

**Expected Result:**
- ❌ Error: "Price must be positive"

### Test Case 4.4: Cancel Button
1. Click "Add New Product"
2. Start filling form
3. Click "Cancel"

**Expected Result:**
- ✅ Returns to inventory without saving
- ✅ No product created

---

## ✏️ Test 5: Edit Product

### Test Case 5.1: Successful Product Update
1. From inventory, click Edit icon on any product
2. Change name to "Updated Product"
3. Change price to 200
4. Click "Update Product"

**Expected Result:**
- ✅ Redirects to inventory
- ✅ Product shows updated values
- ✅ `updatedAt` timestamp changed in Firestore

### Test Case 5.2: Pre-filled Form
1. Click Edit on any product

**Expected Result:**
- ✅ All fields pre-filled with current product data
- ✅ Category dropdown shows correct selection
- ✅ Page title shows "Edit Product"

### Test Case 5.3: Form Validation on Edit
1. Edit a product
2. Clear the name field
3. Try to submit

**Expected Result:**
- ❌ Error: "Product name is required"
- ❌ Form doesn't submit

### Test Case 5.4: Cancel Edit
1. Click Edit on any product
2. Make changes
3. Click "Cancel"

**Expected Result:**
- ✅ Returns to inventory
- ✅ Changes not saved
- ✅ Product remains unchanged

---

## 🗑️ Test 6: Delete Product

### Test Case 6.1: Delete Confirmation
1. Click Delete icon on any product

**Expected Result:**
- ✅ Confirmation modal appears
- ✅ Modal shows warning message
- ✅ "Cancel" and "Delete" buttons visible

### Test Case 6.2: Cancel Delete
1. Click Delete icon
2. In confirmation modal, click "Cancel"

**Expected Result:**
- ✅ Modal closes
- ✅ Product not deleted
- ✅ Product still in inventory

### Test Case 6.3: Confirm Delete
1. Click Delete icon
2. In confirmation modal, click "Delete"

**Expected Result:**
- ✅ Modal closes
- ✅ Product removed from list immediately
- ✅ Product deleted from Firestore
- ✅ Statistics updated

---

## 📱 Test 7: Responsive Design

### Test Case 7.1: Mobile View (< 640px)
1. Resize browser to mobile width or use DevTools
2. Check all admin pages

**Expected Result:**
- ✅ Table scrollable horizontally
- ✅ Form fields stacked vertically
- ✅ Buttons full width
- ✅ Text readable, no overflow

### Test Case 7.2: Tablet View (640px - 1024px)
1. Resize browser to tablet width

**Expected Result:**
- ✅ 2-column form layout
- ✅ Optimized table spacing
- ✅ Flexible button layout

### Test Case 7.3: Desktop View (> 1024px)
1. Use full desktop width

**Expected Result:**
- ✅ Full table with all columns
- ✅ Proper spacing
- ✅ Statistics cards in row

---

## 🔒 Test 8: Route Protection

### Test Case 8.1: Access Admin Route Without Login
1. Clear localStorage: `localStorage.clear()`
2. Clear cookies
3. Try to access: `http://localhost:3000/admin/inventory`

**Expected Result:**
- ✅ Redirects to `/admin/login`
- ✅ Cannot view inventory

### Test Case 8.2: Access After Session Expiry
1. Login successfully
2. Manually clear session: `localStorage.removeItem("adminSession")`
3. Refresh page or navigate to another admin page

**Expected Result:**
- ✅ Redirects to `/admin/login`

---

## 🐛 Test 9: Error Handling

### Test Case 9.1: Network Error
1. Disconnect internet
2. Try to add product

**Expected Result:**
- ❌ Error alert or message shown
- ❌ Form doesn't clear
- ❌ Loading spinner stops

### Test Case 9.2: Invalid Product ID (Edit)
1. Manually navigate to: `/admin/inventory/edit/invalid-id`

**Expected Result:**
- ✅ Alert: "Product not found"
- ✅ Redirects to inventory

### Test Case 9.3: Firestore Permission Error
1. If Firestore rules deny access (test environment)

**Expected Result:**
- ❌ Error caught and displayed
- ❌ No app crash

---

## 📊 Test Results Template

Use this template to track your testing:

```
✅ = Pass
❌ = Fail
⚠️ = Partial Pass

ADMIN LOGIN:
[ ] Test 1.1: Successful Login
[ ] Test 1.2: Failed Login
[ ] Test 1.3: Session Persistence
[ ] Test 1.4: Logout

PRODUCT SEEDING:
[ ] Test 2.1: First Time Seeding
[ ] Test 2.2: Duplicate Prevention

INVENTORY DASHBOARD:
[ ] Test 3.1: View All Products
[ ] Test 3.2: Search Products
[ ] Test 3.3: Filter by Category
[ ] Test 3.4: Stock Status Badges
[ ] Test 3.5: Real-time Updates

ADD PRODUCT:
[ ] Test 4.1: Successful Creation
[ ] Test 4.2: Form Validation
[ ] Test 4.3: Invalid Price
[ ] Test 4.4: Cancel Button

EDIT PRODUCT:
[ ] Test 5.1: Successful Update
[ ] Test 5.2: Pre-filled Form
[ ] Test 5.3: Form Validation
[ ] Test 5.4: Cancel Edit

DELETE PRODUCT:
[ ] Test 6.1: Delete Confirmation
[ ] Test 6.2: Cancel Delete
[ ] Test 6.3: Confirm Delete

RESPONSIVE DESIGN:
[ ] Test 7.1: Mobile View
[ ] Test 7.2: Tablet View
[ ] Test 7.3: Desktop View

ROUTE PROTECTION:
[ ] Test 8.1: Access Without Login
[ ] Test 8.2: Access After Expiry

ERROR HANDLING:
[ ] Test 9.1: Network Error
[ ] Test 9.2: Invalid Product ID
[ ] Test 9.3: Permission Error
```

---

## 🎯 Success Criteria

**Phase 4 passes testing if:**
- All login scenarios work correctly
- Products seed without errors
- Inventory displays and updates in real-time
- CRUD operations work for products
- Forms validate properly
- Responsive on all devices
- Routes are protected
- Errors are handled gracefully

---

## 🐛 Common Issues & Fixes

### Issue 1: "Cannot read properties of undefined"
**Cause:** Firestore not initialized or categories missing
**Fix:** Check Firebase config and seed categories first

### Issue 2: Products not appearing
**Cause:** Not seeded yet
**Fix:** Visit `/api/seed/products`

### Issue 3: Edit page shows 404
**Cause:** Invalid product ID in URL
**Fix:** Use Edit button from inventory, don't manually type URL

### Issue 4: Session not persisting
**Cause:** Browser blocking localStorage or cookies
**Fix:** Check browser privacy settings, allow cookies

---

**Happy Testing! 🧪**

Report any issues found with:
- Test case number
- Expected vs actual result
- Browser and device used
- Steps to reproduce
