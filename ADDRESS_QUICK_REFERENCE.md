# Address System - Quick Reference

## 📦 Import Statements

```typescript
// Types
import { Address, AddressType } from "@/types";

// Firebase
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Utility Functions
import { 
  fetchUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
  getAddressById,
  validateUserAddress 
} from "@/lib/addressUtils";
```

## 🔧 Common Operations

### Fetch User Addresses
```typescript
const addresses = await fetchUserAddresses(userId);
```

### Add New Address
```typescript
const addressData = {
  fullName: "John Doe",
  phone: "9876543210",
  addressLine1: "123 Main Street",
  addressLine2: "Apartment 4B",
  city: "Mumbai",
  state: "Maharashtra",
  pinCode: "400001",
  addressType: "Home",
  isDefault: false
};

const updatedAddresses = await addAddress(userId, addressData, existingAddresses);
```

### Update Address
```typescript
const updatedData = {
  fullName: "John Doe Updated",
  phone: "9876543211",
  addressLine1: "456 New Street",
  addressLine2: "",
  city: "Delhi",
  state: "Delhi",
  pinCode: "110001",
  addressType: "Work",
  isDefault: true
};

const updatedAddresses = await updateAddress(
  userId, 
  addressId, 
  updatedData, 
  existingAddresses
);
```

### Delete Address
```typescript
const updatedAddresses = await deleteAddress(userId, addressId, existingAddresses);
```

### Set Default Address
```typescript
const updatedAddresses = await setDefaultAddress(userId, addressId, existingAddresses);
```

### Get Default Address
```typescript
const defaultAddress = await getDefaultAddress(userId);
```

### Get Address by ID
```typescript
const address = await getAddressById(userId, addressId);
```

### Validate Address
```typescript
const isValid = await validateUserAddress(userId, addressId);
```

## 📋 Address Object Template

```typescript
const address: Address = {
  id: "addr_1699999999999_abc123",
  fullName: "John Doe",
  phone: "9876543210",
  addressLine1: "123 Main Street, Apartment 4B",
  addressLine2: "Near Central Park",
  city: "Mumbai",
  state: "Maharashtra",
  pinCode: "400001",
  addressType: "Home",
  isDefault: true
};
```

## 🔒 Firestore Security Rules

```
match /addressBooks/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## 📝 Validation Rules

```typescript
{
  fullName: "Min 2 chars, required",
  phone: "Exactly 10 digits, required",
  addressLine1: "Min 5 chars, required",
  addressLine2: "Optional",
  city: "Min 2 chars, required",
  state: "From predefined list, required",
  pinCode: "Exactly 6 digits, required",
  addressType: "'Home' | 'Work' | 'Other', required",
  isDefault: "Boolean, required"
}
```

## 🎨 UI Components

### AddressForm
```tsx
<AddressForm
  address={editingAddress}          // Optional: for editing
  onSubmit={handleAddOrEditAddress} // Called with Omit<Address, "id">
  onCancel={handleCancel}           // Called when cancelled
/>
```

### Address Card Display
```tsx
{addresses.map((address) => (
  <div key={address.id} className={address.isDefault ? "ring-2 ring-orange-500" : ""}>
    {address.isDefault && <span>Default</span>}
    <h3>{address.fullName}</h3>
    <p>{address.phone}</p>
    <p>{address.addressLine1}</p>
    {address.addressLine2 && <p>{address.addressLine2}</p>}
    <p>{address.city}, {address.state} - {address.pinCode}</p>
  </div>
))}
```

## 🚀 Page Routes

- **Address Management:** `/addresses`
- **Cart (select address):** `/cart`
- **Checkout (use address):** `/checkout`

## 💡 Best Practices

1. **Always validate user authentication before operations**
   ```typescript
   if (!currentUser) {
     router.push("/login");
     return;
   }
   ```

2. **Handle errors gracefully**
   ```typescript
   try {
     await addAddress(userId, addressData, addresses);
     toast.success("Address added successfully");
   } catch (error) {
     console.error("Error:", error);
     toast.error(error.message || "Failed to add address");
   }
   ```

3. **Use loading states**
   ```typescript
   const [loading, setLoading] = useState(false);
   
   setLoading(true);
   try {
     // operation
   } finally {
     setLoading(false);
   }
   ```

4. **Provide user feedback**
   ```typescript
   toast.success("Operation successful");
   toast.error("Operation failed");
   ```

5. **Keep local state in sync**
   ```typescript
   const [addresses, setAddresses] = useState<Address[]>([]);
   
   // After DB operation
   setAddresses(updatedAddresses);
   ```

## 🐛 Debugging

### Check Firebase Console
```
1. Open Firebase Console
2. Go to Firestore Database
3. Navigate to addressBooks/{userId}
4. Verify document structure
```

### Check Browser Console
```typescript
console.log("User ID:", userId);
console.log("Addresses:", addresses);
console.log("Selected Address:", selectedAddress);
```

### Common Error Messages
- "Failed to fetch addresses" - Check Firebase config
- "Address book not found" - User may not have saved addresses
- "Failed to add address" - Check validation or Firebase rules
- "Permission denied" - Check security rules and authentication

## 📱 Testing Quick Commands

```bash
# Start dev server
npm run dev

# Open browser
http://localhost:3000/addresses

# Check Firebase
firebase login
firebase projects:list
firebase firestore:indexes
```

## 🔗 Related Files

- Types: `src/types/index.ts`
- Utils: `src/lib/addressUtils.ts`
- Form: `src/components/AddressForm.tsx`
- Page: `src/app/(shop)/addresses/page.tsx`
- Rules: `firestore.rules`
- Config: `src/lib/firebase/config.ts`

## 📊 Indian States List

```typescript
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", 
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];
```

## 🎯 Success Indicators

✅ Addresses save to Firebase  
✅ Only user can access their addresses  
✅ Validation prevents bad data  
✅ Default logic works correctly  
✅ UI updates immediately  
✅ Toast notifications appear  
✅ No console errors  

## 📞 Support

For issues or questions:
1. Check console for errors
2. Verify Firebase connection
3. Check security rules
4. Review validation logic
5. Test with different data
