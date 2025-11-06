# Quick Setup Guide - Seed Database

## Issue
When adding a new product in the admin panel, the category dropdown is empty because the categories haven't been seeded to Firestore yet.

## Solution
You need to seed the database with categories (and optionally products) before using the admin panel.

## Steps to Fix

### 1. Start Development Server
```powershell
npm run dev
```

### 2. Seed Categories (REQUIRED)
Open your browser and visit:
```
http://localhost:3000/api/seed/categories
```

You should see a JSON response like:
```json
{
  "success": true,
  "message": "Successfully seeded 8 categories",
  "categoriesSeeded": 8
}
```

This will create 8 categories:
- 🍎 Fruits
- 🥕 Vegetables
- 🥛 Dairy
- 🍞 Bakery
- 🥩 Meat
- 🦐 Seafood
- 🥤 Beverages
- 🍿 Snacks

### 3. Seed Products (OPTIONAL but recommended)
Visit:
```
http://localhost:3000/api/seed/products
```

You should see:
```json
{
  "success": true,
  "message": "Successfully seeded 58 products across 8 categories",
  "productsSeeded": 58
}
```

This will create 58 products distributed across all 8 categories.

### 4. Verify in Admin Panel
1. Go to admin login: `http://localhost:3000/admin/login`
2. Login with credentials:
   - Username: `Admin`
   - Password: `Password@2025`
3. Navigate to Inventory
4. Click "Add New Product"
5. The category dropdown should now show all 8 categories ✅

## Troubleshooting

### Categories still not showing?
1. Check browser console for errors
2. Verify Firebase configuration in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```
3. Check Firestore database in Firebase Console to ensure categories collection exists
4. Make sure you're logged into admin (check localStorage for `adminSession`)

### Seed endpoints return errors?
- Ensure Firebase is properly configured
- Check Firestore rules allow writes
- Verify network connection

## Database Structure After Seeding

### Categories Collection
```
categories/
  {categoryId}/
    - name: string (e.g., "Fruits")
    - emoji: string (e.g., "🍎")
    - displayOrder: number (1-8)
    - createdAt: timestamp
```

### Products Collection (if seeded)
```
products/
  {productId}/
    - name: string (e.g., "Fresh Apple")
    - description: string
    - category: string (categoryId reference)
    - price: number
    - stockQuantity: number
    - emoji: string
    - createdAt: timestamp
    - updatedAt: timestamp
```

## What Changed
Updated `/api/seed/categories/route.ts` to support GET requests (in addition to POST) for easier browser-based seeding.

## Next Steps
After seeding:
1. ✅ Categories will appear in add/edit product forms
2. ✅ Products will appear on user-facing pages
3. ✅ Cart functionality will work with real products
4. Ready to test complete flow: Browse → Add to Cart → Checkout

---

**Quick Command**: Just visit these URLs in order:
1. `http://localhost:3000/api/seed/categories` ← **Do this first!**
2. `http://localhost:3000/api/seed/products` ← Optional but recommended
