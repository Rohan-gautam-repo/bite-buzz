# Address Management System - Technical Documentation

## Overview
The address management system allows users to store, manage, and use delivery addresses for their orders in the Bite Buzz food delivery application.

## Database Structure

### Firestore Collection: `addressBooks`
Each document in the `addressBooks` collection represents a user's address book.

**Document ID:** User's Firebase Auth UID

**Document Structure:**
```typescript
{
  userId: string;           // Firebase Auth UID
  addresses: Address[];     // Array of address objects
  createdAt: Timestamp;     // When the address book was created
  updatedAt: Timestamp;     // Last update timestamp
}
```

### Address Object Structure
```typescript
{
  id: string;              // Unique identifier (e.g., "addr_1699999999999_abc123")
  fullName: string;        // Recipient's full name
  phone: string;           // 10-digit phone number
  addressLine1: string;    // Primary address line (required)
  addressLine2?: string;   // Secondary address line (optional)
  city: string;            // City name
  state: string;           // State name (from predefined list)
  pinCode: string;         // 6-digit PIN code
  addressType: "Home" | "Work" | "Other";  // Address type
  isDefault: boolean;      // Whether this is the default address
}
```

## Firestore Security Rules

The address book data is protected with the following security rules:

```
match /addressBooks/{userId} {
  // Users can only access their own addresses
  allow read, write: if isOwner(userId);
}
```

This ensures:
- ✅ Users can only read their own addresses
- ✅ Users can only create/update/delete their own addresses
- ❌ Users cannot access other users' addresses
- ❌ Unauthenticated users cannot access any addresses

## Key Features

### 1. **Add Address**
- Users can add multiple addresses
- First address is automatically set as default
- Validation using Zod schema ensures data integrity
- Unique ID generation using timestamp + random string

### 2. **Edit Address**
- Users can update any field of an existing address
- If setting an address as default, all others are automatically unmarked
- Document existence check before updating

### 3. **Delete Address**
- Users can delete any address
- If deleted address was default, the first remaining address becomes default
- Prevents orphaned references

### 4. **Set Default Address**
- Only one address can be default at a time
- System automatically unsets previous default
- Used for quick checkout

### 5. **View Addresses**
- Grid display of all saved addresses
- Visual indicators for default address (orange ring + star badge)
- Color-coded icons based on address type

## Validation Rules

### Phone Number
- Must be exactly 10 digits
- Regex: `/^\d{10}$/`

### PIN Code
- Must be exactly 6 digits
- Regex: `/^\d{6}$/`

### Full Name
- Minimum 2 characters
- Required field

### Address Line 1
- Minimum 5 characters
- Required field

### City & State
- Minimum 2 characters
- Required fields
- State must be from predefined list of Indian states

## API Functions (addressUtils.ts)

### `fetchUserAddresses(userId: string): Promise<Address[]>`
Fetches all addresses for a user from Firebase.

**Returns:** Array of Address objects

**Throws:** Error if fetch fails

---

### `addAddress(userId, addressData, existingAddresses): Promise<Address[]>`
Adds a new address to the user's address book.

**Parameters:**
- `userId`: Firebase Auth UID
- `addressData`: Address data without ID
- `existingAddresses`: Current addresses array

**Returns:** Updated addresses array

**Logic:**
1. Generates unique ID
2. Unsets other defaults if new address is default
3. Sets as default if first address
4. Saves to Firebase with merge option

---

### `updateAddress(userId, addressId, addressData, existingAddresses): Promise<Address[]>`
Updates an existing address.

**Parameters:**
- `userId`: Firebase Auth UID
- `addressId`: ID of address to update
- `addressData`: Updated address data
- `existingAddresses`: Current addresses array

**Returns:** Updated addresses array

**Logic:**
1. Updates specified address
2. Unsets other defaults if updated address is default
3. Creates document if doesn't exist

---

### `deleteAddress(userId, addressId, existingAddresses): Promise<Address[]>`
Deletes an address from the user's address book.

**Parameters:**
- `userId`: Firebase Auth UID
- `addressId`: ID of address to delete
- `existingAddresses`: Current addresses array

**Returns:** Updated addresses array

**Logic:**
1. Removes address from array
2. Sets first remaining address as default if deleted was default
3. Updates Firebase document

---

### `setDefaultAddress(userId, addressId, existingAddresses): Promise<Address[]>`
Sets an address as the default delivery address.

**Parameters:**
- `userId`: Firebase Auth UID
- `addressId`: ID of address to set as default
- `existingAddresses`: Current addresses array

**Returns:** Updated addresses array

**Logic:**
1. Marks specified address as default
2. Unmarks all other addresses
3. Updates Firebase document

---

### `getDefaultAddress(userId: string): Promise<Address | null>`
Gets the default address for a user.

**Returns:** Default Address object or first address or null

---

### `getAddressById(userId, addressId): Promise<Address | null>`
Gets a specific address by ID.

**Returns:** Address object or null

---

### `validateUserAddress(userId, addressId): Promise<boolean>`
Validates if an address exists and belongs to the user.

**Returns:** Boolean indicating validity

## Integration Points

### 1. **Cart Page**
- Stores selected address ID in sessionStorage
- Redirects to checkout with address context

### 2. **Checkout Page**
- Retrieves address from sessionStorage
- Validates address exists and belongs to user
- Displays address details in order summary

### 3. **Order Placement**
- Address is embedded in order document
- Stored as `deliveryAddress` field
- Ensures order has complete delivery information

## Error Handling

All database operations include:
1. **Try-catch blocks** for error capturing
2. **User feedback** via toast notifications
3. **Console logging** for debugging
4. **Graceful degradation** (e.g., redirecting to cart if address not found)

## Best Practices Implemented

✅ **Data Validation:** Zod schema validation before submission  
✅ **Unique IDs:** Timestamp + random string for collision prevention  
✅ **Atomic Operations:** Using setDoc with merge for safety  
✅ **Document Checks:** Verify existence before updates  
✅ **Default Management:** Automatic default address logic  
✅ **Security:** Firestore rules enforce user ownership  
✅ **Error Messages:** Descriptive error feedback  
✅ **Loading States:** Visual feedback during operations  
✅ **Optimistic Updates:** Update UI immediately, sync with DB  

## Testing Checklist

- [ ] Add first address (should auto-set as default)
- [ ] Add second address without default (first should remain default)
- [ ] Add third address with default (should unset others)
- [ ] Edit address and change to default
- [ ] Edit default address fields
- [ ] Delete non-default address
- [ ] Delete default address (next should become default)
- [ ] Delete all addresses
- [ ] Phone validation (10 digits)
- [ ] PIN code validation (6 digits)
- [ ] Required fields validation
- [ ] State dropdown selection
- [ ] Cancel form (should not save)
- [ ] Select address in cart
- [ ] View selected address in checkout
- [ ] Complete order with address
- [ ] View address in order history

## Performance Considerations

1. **Batch Operations:** All addresses stored in single document
2. **No Pagination Needed:** Typical user has 2-5 addresses
3. **Local State Management:** Reduces Firebase reads
4. **Optimistic UI Updates:** Better user experience
5. **Indexed Queries:** Efficient order queries by userId

## Future Enhancements

- [ ] Address autocomplete using Google Places API
- [ ] GPS location picker
- [ ] Address verification service
- [ ] Saved location nicknames (e.g., "Mom's House")
- [ ] Multiple phone numbers per address
- [ ] Delivery instructions field
- [ ] Address usage analytics (most used address)

## Maintenance Notes

- Firestore security rules are in `firestore.rules`
- Firestore indexes are in `firestore.indexes.json`
- Deploy rules: `firebase deploy --only firestore:rules`
- Deploy indexes: `firebase deploy --only firestore:indexes`
