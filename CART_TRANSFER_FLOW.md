# Cart Transfer Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     GUEST USER JOURNEY                          │
└─────────────────────────────────────────────────────────────────┘

1. Browse Products (Not Logged In)
   │
   ├─→ Click "Add to Cart" on Product
   │
   ├─→ ProductCard.handleAddToCart()
   │   │
   │   ├─→ Check: currentUser exists?
   │   │   │
   │   │   ├─→ NO (Guest User)
   │   │   │   │
   │   │   │   ├─→ saveGuestCartItem(productId, quantity)
   │   │   │   │   └─→ Save to localStorage
   │   │   │   │
   │   │   │   ├─→ Show Toast: "Please login to complete purchase"
   │   │   │   │
   │   │   │   └─→ Redirect to /login?returnUrl=/cart
   │   │   │
   │   │   └─→ YES (Logged In User)
   │   │       └─→ addToCart() → Save to Firestore
   │   │
   │   └─→ End
   │
   └─→ User Arrives at Login Page

2. Login Page
   │
   ├─→ User Enters Credentials
   │
   ├─→ Click "Login"
   │
   ├─→ onSubmit()
   │   │
   │   ├─→ await login(email, password)
   │   │   └─→ Firebase Authentication
   │   │
   │   ├─→ Check: hasGuestCartItems()?
   │   │   │
   │   │   ├─→ YES
   │   │   │   │
   │   │   │   ├─→ Show: "Transferring your cart items..."
   │   │   │   │
   │   │   │   ├─→ await transferGuestCart()
   │   │   │   │   │
   │   │   │   │   ├─→ Get items from localStorage
   │   │   │   │   │
   │   │   │   │   ├─→ For each item:
   │   │   │   │   │   └─→ await addToCart(productId, quantity)
   │   │   │   │   │       └─→ Save to Firestore user cart
   │   │   │   │   │
   │   │   │   │   └─→ clearGuestCart()
   │   │   │   │       └─→ Remove from localStorage
   │   │   │   │
   │   │   │   └─→ Show: "Cart items transferred successfully!"
   │   │   │
   │   │   └─→ NO
   │   │       └─→ Skip transfer
   │   │
   │   └─→ Redirect to returnUrl or home
   │
   └─→ User Sees Cart with All Items

┌─────────────────────────────────────────────────────────────────┐
│              AUTOMATIC TRANSFER (ALTERNATIVE FLOW)              │
└─────────────────────────────────────────────────────────────────┘

1. Guest Adds Items to Cart (Saved to localStorage)
   │
2. Guest Closes Browser / Navigates Away
   │
3. Guest Returns Later
   │
4. Guest Logs In Directly (Not via Add to Cart prompt)
   │
5. CartContext.useEffect() Detects Login
   │
   ├─→ Triggers: autoTransferGuestCart()
   │   │
   │   ├─→ Check: currentUser exists?
   │   │   │
   │   │   └─→ YES
   │   │       │
   │   │       ├─→ Check: getGuestCart().length > 0?
   │   │       │   │
   │   │       │   └─→ YES
   │   │       │       │
   │   │       │       └─→ await transferGuestCart()
   │   │       │           │
   │   │       │           ├─→ Transfer all items
   │   │       │           │
   │   │       │           └─→ Clear guest cart
   │   │       │
   │   │       └─→ Complete
   │   │
   │   └─→ User's Cart Updated Automatically
   │
   └─→ End

┌─────────────────────────────────────────────────────────────────┐
│                    DATA FLOW DIAGRAM                            │
└─────────────────────────────────────────────────────────────────┘

GUEST STATE:
┌──────────────────┐
│  localStorage    │
│  "guestCart"     │
│                  │
│  [{             │
│    productId: A  │
│    quantity: 2   │
│  }, {           │
│    productId: B  │
│    quantity: 1   │
│  }]             │
└──────────────────┘
        │
        │ (User Logs In)
        │
        ▼
   TRANSFER
        │
        ▼
LOGGED IN STATE:
┌──────────────────┐
│   Firestore      │
│   users/userId   │
│   /carts         │
│                  │
│   {              │
│     items: [{    │
│       productId:A│
│       quantity: 2│
│     }, {         │
│       productId:B│
│       quantity: 1│
│     }]           │
│   }              │
└──────────────────┘
        │
        ▼
┌──────────────────┐
│  localStorage    │
│  "guestCart"     │
│                  │
│  []              │ ← CLEARED
└──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     COMPONENT INTERACTION                       │
└─────────────────────────────────────────────────────────────────┘

ProductCard
    │
    ├─→ Click "Add to Cart"
    │
    ├─→ onAddToCart(productId, quantity)
    │
    └─→ Category Page Handler
            │
            ├─→ Check: currentUser?
            │
            ├─→ NO: saveGuestCartItem() + redirect to login
            │
            └─→ YES: CartContext.addToCart()

Login/Register Page
    │
    ├─→ User Submits Form
    │
    ├─→ AuthContext.login() / .register()
    │
    ├─→ Check: hasGuestCartItems()?
    │
    └─→ YES: CartContext.transferGuestCart()

CartContext (Auto-Transfer)
    │
    ├─→ useEffect: Watch currentUser changes
    │
    ├─→ User Logged In?
    │
    ├─→ Check: Guest cart items exist?
    │
    └─→ YES: Automatically transfer

┌─────────────────────────────────────────────────────────────────┐
│                    FUNCTION CALL STACK                          │
└─────────────────────────────────────────────────────────────────┘

handleAddToCart (Category Page)
    │
    ├─→ currentUser check
    │   │
    │   └─→ NULL (guest)
    │       │
    │       ├─→ saveGuestCartItem(productId, quantity)
    │       │   │
    │       │   └─→ localStorage.setItem("guestCart", JSON.stringify([...]))
    │       │
    │       └─→ router.push("/login?returnUrl=/cart")

onSubmit (Login Page)
    │
    ├─→ login(email, password)
    │
    ├─→ hasGuestCartItems()
    │   │
    │   └─→ localStorage.getItem("guestCart")
    │
    ├─→ transferGuestCart()
    │   │
    │   ├─→ getGuestCart()
    │   │   │
    │   │   └─→ JSON.parse(localStorage.getItem("guestCart"))
    │   │
    │   ├─→ for each item:
    │   │   │
    │   │   └─→ addToCart(productId, quantity)
    │   │       │
    │   │       └─→ updateDoc(cartRef, { items: [...] })
    │   │           │
    │   │           └─→ Firestore Write
    │   │
    │   └─→ clearGuestCart()
    │       │
    │       └─→ localStorage.removeItem("guestCart")
    │
    └─→ router.push(returnUrl || "/")
```

## Key Points

### 🔑 localStorage Key
- **Key**: `"guestCart"`
- **Value**: JSON array of `GuestCartItem[]`

### 🔄 Transfer Triggers
1. **Manual**: After login/register form submission
2. **Automatic**: When CartContext detects user login

### ✅ Success Indicators
- Toast message: "Cart items transferred successfully!"
- Items visible in cart page
- localStorage cleared
- Firestore cart updated

### 🛡️ Error Handling
- Transfer failures logged but don't block login
- Individual item failures don't stop batch transfer
- User can manually re-add items if needed

### 🎯 User Experience
- Seamless - no action required from user
- Fast - happens in background during login
- Reliable - multiple fallback mechanisms
- Clear - success/error messages shown
