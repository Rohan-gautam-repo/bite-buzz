# PHASE 4: Admin Portal Flow Guide

## 🔄 User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER LOGIN PAGE                          │
│                  /login (User Access)                        │
│                                                              │
│  [Email Input]                                              │
│  [Password Input]                                           │
│  [Login Button]                                             │
│                                                              │
│  Don't have an account? [Register]                         │
│  🔐 Admin Access  ← NEW LINK                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Click Admin Access
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ADMIN LOGIN PAGE                           │
│                /admin/login (Admin Only)                     │
│                                                              │
│  🛡️ Admin Portal                                            │
│  [Username: Admin]                                          │
│  [Password: Password@2025]                                  │
│  [🛡️ Admin Login Button]                                    │
│                                                              │
│  🔒 Secure admin portal. Unauthorized access prohibited.    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Successful Login
                         │ (Session stored for 24hrs)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ADMIN INVENTORY DASHBOARD                       │
│            /admin/inventory (Protected)                      │
│                                                              │
│  📦 Product Inventory Management           [Logout]         │
│  Manage your store's product catalog                        │
│                                                              │
│  [+ Add New Product]                                        │
│                                                              │
│  ┌───────────────────────────────────────┐                 │
│  │ [🔍 Search...]  [Category Filter ▼]  │                 │
│  └───────────────────────────────────────┘                 │
│                                                              │
│  ┌────────┬────────┬────────┐                              │
│  │Total: 58│In: 55  │Out: 3  │  Stats Cards                │
│  └────────┴────────┴────────┘                              │
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │ FRUITS                                          │       │
│  │ 🍎 Apple    ₹120   50 units  [In Stock] ✏️🗑️  │       │
│  │ 🍌 Banana   ₹40    80 units  [In Stock] ✏️🗑️  │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │ VEGETABLES                                       │       │
│  │ 🍅 Tomato   ₹30   100 units  [In Stock] ✏️🗑️   │       │
│  └─────────────────────────────────────────────────┘       │
│  ... (more categories)                                      │
└─────────┬───────────────────────────────┬──────────────────┘
          │                               │
          │ Click Add New Product         │ Click Edit
          ▼                               ▼
┌──────────────────────┐     ┌───────────────────────────┐
│  ADD PRODUCT PAGE    │     │   EDIT PRODUCT PAGE       │
│  /admin/inventory/   │     │   /admin/inventory/       │
│       add            │     │     edit/[id]             │
│                      │     │                           │
│  📦 Add New Product  │     │  📦 Edit Product         │
│                      │     │                           │
│  [Product Name*]     │     │  [Product Name*] (filled)│
│  [Description*]      │     │  [Description*] (filled) │
│  [Category* ▼]       │     │  [Category* ▼] (filled)  │
│  [Price (₹)*]        │     │  [Price (₹)*] (filled)   │
│  [Stock Quantity*]   │     │  [Stock Quantity*](fill) │
│  [Emoji*] 🍎         │     │  [Emoji*] (filled)       │
│                      │     │                           │
│  [Cancel] [Add]      │     │  [Cancel] [Update]       │
└──────────────────────┘     └───────────────────────────┘
```

## 📊 Product Categories & Seeding

```
SEED PRODUCTS API: /api/seed/products
├── Check if products exist
├── Fetch all categories from Firestore
└── Batch create products:
    │
    ├── 🍎 FRUITS (8 products)
    │   Apple, Banana, Orange, Mango, Grapes,
    │   Watermelon, Strawberries, Pineapple
    │
    ├── 🥕 VEGETABLES (8 products)
    │   Tomato, Carrot, Potato, Onion, Broccoli,
    │   Bell Pepper, Cucumber, Spinach
    │
    ├── 🥛 DAIRY (6 products)
    │   Milk, Cheese, Yogurt, Butter, Paneer, Ice Cream
    │
    ├── 🍞 BAKERY (7 products)
    │   Bread, Croissant, Bagel, Muffin, Cake,
    │   Whole Wheat Bread, Danish Pastry
    │
    ├── 🍗 MEAT (6 products)
    │   Chicken, Beef, Lamb, Pork, Turkey, Ground Beef
    │
    ├── 🐟 SEAFOOD (6 products)
    │   Salmon, Shrimp, Tuna, Crab, Lobster, Sea Bass
    │
    ├── ☕ BEVERAGES (7 products)
    │   Coffee, Tea, Juice, Soda, Water, Energy Drink, Smoothie
    │
    └── 🍪 SNACKS (8 products)
        Chips, Cookies, Popcorn, Nuts, Candy,
        Pretzels, Granola Bar, Nachos

TOTAL: 58 PRODUCTS
```

## 🔐 Authentication Flow

```
┌──────────────────┐
│  Admin Attempts  │
│     Login        │
└────────┬─────────┘
         │
         ▼
    ┌─────────────────────────┐
    │ Check Credentials       │
    │ Username === "Admin"?   │
    │ Password === "Password@ │
    │         2025"?          │
    └───────┬─────────┬───────┘
            │         │
        ✅ YES      ❌ NO
            │         │
            ▼         ▼
    ┌──────────┐  ┌────────────────┐
    │ Set      │  │ Show Error:    │
    │ Session: │  │ "Invalid       │
    │          │  │  credentials"  │
    │ - Local  │  └────────────────┘
    │   Storage│
    │ - Cookie │
    │   (24hrs)│
    └─────┬────┘
          │
          ▼
    ┌──────────────┐
    │ Redirect to  │
    │ /admin/      │
    │  inventory   │
    └──────────────┘

┌──────────────────────────────────────┐
│  Protected Route Check               │
│  (All Admin Pages)                   │
│                                      │
│  useEffect(() => {                   │
│    const session =                   │
│      localStorage.getItem(           │
│        "adminSession"                │
│      );                              │
│                                      │
│    if (!session) {                   │
│      router.push("/admin/login");    │
│    }                                 │
│  }, []);                             │
└──────────────────────────────────────┘
```

## 🗄️ Database Operations

```
FIRESTORE STRUCTURE:

products (collection)
├── [productId] (auto-generated)
│   ├── name: string
│   ├── description: string
│   ├── price: number
│   ├── category: string (categoryId reference)
│   ├── stockQuantity: number
│   ├── emoji: string
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp

categories (collection)
├── fruits
├── vegetables
├── dairy
├── bakery
├── meat
├── seafood
├── beverages
└── snacks

OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE (Add Product)
→ addDoc(collection(db, "products"), data)
→ Auto-generates ID
→ Sets createdAt & updatedAt

READ (View Inventory)
→ onSnapshot(query(collection(db, "products")))
→ Real-time updates
→ Ordered by name

UPDATE (Edit Product)
→ updateDoc(doc(db, "products", id), data)
→ Updates updatedAt timestamp

DELETE (Remove Product)
→ deleteDoc(doc(db, "products", id))
→ With confirmation dialog

BATCH (Seed Products)
→ writeBatch(db)
→ Multiple set operations
→ Single commit
```

## 🎨 Color Coding

```
COLOR SCHEME:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin Theme:    Purple (#9333ea)
User Theme:     Orange (#f97316)

Status Badges:
✅ In Stock:    Green (#16a34a)
❌ Out of Stock: Red (#dc2626)

Action Buttons:
✏️ Edit:        Blue (#2563eb)
🗑️ Delete:      Red (#dc2626)
➕ Add:         Purple (#9333ea)
```

## 📱 Responsive Breakpoints

```
MOBILE (< 640px)
- Stacked form fields
- Scrollable tables
- Full-width buttons

TABLET (640px - 1024px)
- 2-column form layout
- Optimized table spacing
- Flexible button groups

DESKTOP (> 1024px)
- Full table display
- Side-by-side layouts
- Expanded statistics
```

---

## 🚀 Quick Commands

### Start Development Server
```bash
npm run dev
```

### Seed Products (First Time)
```bash
# Visit in browser:
http://localhost:3000/api/seed/products

# Or use curl:
curl http://localhost:3000/api/seed/products
```

### Access Admin Portal
```
URL: http://localhost:3000/admin/login
Username: Admin
Password: Password@2025
```

---

**Phase 4 Complete! 🎉**
