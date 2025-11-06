# Authentication System - Quick Reference Guide

## Using Authentication in Components

### 1. Import the Hook
```tsx
import { useAuth } from "@/contexts/AuthContext";
```

### 2. Access Auth State and Methods
```tsx
function MyComponent() {
  const { currentUser, loading, login, logout, register } = useAuth();

  // Check if user is logged in
  if (loading) return <div>Loading...</div>;
  if (!currentUser) return <div>Please login</div>;

  return <div>Welcome {currentUser.displayName}!</div>;
}
```

## Available Auth Methods

### Register a New User
```tsx
const { register } = useAuth();

try {
  await register(email, password, username);
  // User is registered and logged in
  // User document created in Firestore
} catch (error) {
  // Handle error (email already exists, weak password, etc.)
}
```

### Login
```tsx
const { login } = useAuth();

try {
  await login(email, password);
  // User is logged in
} catch (error) {
  // Handle error (wrong credentials, user not found, etc.)
}
```

### Logout
```tsx
const { logout } = useAuth();

try {
  await logout();
  // User is logged out
} catch (error) {
  // Handle error
}
```

### Update Username
```tsx
const { updateUsername } = useAuth();

try {
  await updateUsername("newUsername");
  // Username updated in Firebase Auth and Firestore
} catch (error) {
  // Handle error
}
```

### Change Password
```tsx
const { updatePassword } = useAuth();

try {
  await updatePassword(currentPassword, newPassword);
  // Password changed successfully
} catch (error) {
  // Handle error (wrong current password, weak new password, etc.)
}
```

## Current User Object

```tsx
const { currentUser } = useAuth();

// Access user properties
currentUser?.uid           // User ID
currentUser?.email         // User email
currentUser?.displayName   // Username
currentUser?.emailVerified // Email verification status
```

## Protecting Routes

### Server-Side (Middleware)
Already configured in `src/middleware.ts`. Protected routes:
- `/cart`
- `/checkout`
- `/orders`
- `/settings`
- `/addresses`

Admin routes (require admin@bitebuzz.com):
- `/admin/*`

### Client-Side (Component)
Use the `ProtectedRoute` component:

```tsx
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CartPage() {
  return (
    <ProtectedRoute>
      <div>Cart content here...</div>
    </ProtectedRoute>
  );
}
```

For admin-only pages:
```tsx
<ProtectedRoute requireAdmin>
  <div>Admin content here...</div>
</ProtectedRoute>
```

## Form Validation

### Using Zod Schemas
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators";

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});
```

### Available Schemas
- `registerSchema` - For registration forms
- `loginSchema` - For login forms
- `changePasswordSchema` - For password change forms
- `passwordSchema` - For standalone password validation

### Password Strength Checker
```tsx
import { getPasswordStrength } from "@/lib/validators";

const strength = getPasswordStrength(password);
// Returns: { minLength, hasUppercase, hasLowercase, hasNumber, hasSpecial }
```

## Error Handling

All auth methods throw descriptive errors:

```tsx
try {
  await login(email, password);
} catch (error) {
  // error.message contains user-friendly error message
  console.error(error.message);
}
```

Common error messages:
- "This email is already registered. Please login instead."
- "No account found with this email. Please register first."
- "Incorrect password. Please try again."
- "Current password is incorrect."
- "Password is too weak. Please choose a stronger password."

## Checking Authentication Status

### In a Component
```tsx
const { currentUser, loading } = useAuth();

if (loading) {
  return <Loader />; // Show loading state
}

if (currentUser) {
  return <AuthenticatedView />;
} else {
  return <UnauthenticatedView />;
}
```

### Conditional Rendering
```tsx
const { currentUser } = useAuth();

return (
  <div>
    {currentUser ? (
      <button onClick={logout}>Logout</button>
    ) : (
      <Link href="/login">Login</Link>
    )}
  </div>
);
```

## Firestore User Document Structure

When a user registers, a document is created in the `users` collection:

```typescript
{
  email: string;
  username: string;
  role: "user" | "admin";
  createdAt: string (ISO date);
  updatedAt?: string (ISO date);
}
```

## Testing Authentication

### Test Account
Create a test user:
- Email: `test@example.com`
- Password: `Test123!@#` (meets all requirements)
- Username: `testuser`

### Admin Access
To test admin features, use:
- Email: `admin@bitebuzz.com`
- Create this account and it will have admin access

## Middleware Configuration

The middleware automatically handles:
1. ✅ Redirects unauthenticated users to `/login` for protected routes
2. ✅ Adds `redirect` parameter to return users to intended page after login
3. ✅ Checks admin status for `/admin/*` routes
4. ✅ Redirects authenticated users away from `/login` and `/register`
5. ✅ Sets and validates Firebase auth cookies

## Tips

1. **Always check loading state** before rendering protected content
2. **Use try-catch** when calling auth methods
3. **Display user-friendly error messages** from caught errors
4. **Redirect after successful authentication** for better UX
5. **Clear sensitive data** after logout
6. **Validate forms** using Zod schemas for consistency

## Example: Complete Login Flow

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/"); // Redirect to home
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* Form fields here */}
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

## Need Help?

- Check Firebase console for auth errors
- Verify environment variables in `.env.local`
- Ensure Firebase project has Email/Password auth enabled
- Check browser console for detailed error messages
- Review `src/contexts/AuthContext.tsx` for implementation details
