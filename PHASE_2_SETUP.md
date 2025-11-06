# Phase 2 Setup Instructions

## Prerequisites

Before starting, make sure you have:
1. ✅ Node.js installed (v18 or higher)
2. ✅ Firebase project created at https://console.firebase.google.com
3. ✅ Email/Password authentication enabled in Firebase Console

## Step 1: Install Dependencies

All required dependencies are already installed. If you need to reinstall:

```bash
npm install
```

Required packages:
- `zod` - Schema validation
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod integration for react-hook-form
- `lucide-react` - Icons

## Step 2: Configure Firebase

### 2.1 Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Enable **Email/Password** authentication
5. Save changes

### 2.2 Set Up Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Select your web app (or create one)
   - Copy the config values

3. Update `.env.local` with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abcdef
   ```

### 2.3 Set Up Firestore

1. Go to **Firestore Database** in Firebase Console
2. Click **Create database**
3. Choose **Start in test mode** (we'll update rules later)
4. Select a location close to your users
5. Click **Enable**

## Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 4: Test Authentication

### Register a New User

1. Navigate to http://localhost:3000/register
2. Fill in the form:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `Test123!@#` (must meet all requirements)
   - Confirm Password: `Test123!@#`
3. Click "Register"
4. You should be redirected to the home page with a welcome message

### Login

1. Navigate to http://localhost:3000/login
2. Enter the credentials you just created
3. Click "Login"
4. You should be redirected to home and see your username

### Test Protected Routes

1. Logout (click the logout button on home page)
2. Try to access http://localhost:3000/cart
3. You should be redirected to `/login?redirect=/cart`
4. After logging in, you'll be sent back to `/cart`

### Test Admin Routes

1. Create an admin account:
   - Email: `admin@bitebuzz.com`
   - Any password (meeting requirements)
2. Login with this account
3. You can now access `/admin/*` routes
4. Try logging in with a non-admin account and accessing `/admin` - you'll be redirected to home

## Implemented Features ✅

### Authentication Context
- ✅ Global auth state management
- ✅ Register, login, logout functionality
- ✅ Update username and password
- ✅ Loading states
- ✅ Error handling with descriptive messages

### Registration Page
- ✅ Form validation with Zod
- ✅ Real-time password strength indicator
- ✅ Show/hide password toggles
- ✅ Responsive design
- ✅ Creates user document in Firestore

### Login Page
- ✅ Form validation
- ✅ Error handling
- ✅ Responsive design
- ✅ Redirect to intended page after login

### Middleware Protection
- ✅ Server-side route protection
- ✅ Protected routes: `/cart`, `/checkout`, `/orders`, `/settings`, `/addresses`
- ✅ Admin-only routes: `/admin/*`
- ✅ Automatic redirects

### Password Validation
- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter
- ✅ At least 1 lowercase letter
- ✅ At least 1 number
- ✅ At least 1 special character (!@#$%^&*)

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Registration page
│   ├── layout.tsx                   # Root layout with AuthProvider
│   └── page.tsx                     # Home page (updated with auth status)
├── components/
│   └── ProtectedRoute.tsx           # Client-side route protection
├── contexts/
│   └── AuthContext.tsx              # Authentication context
├── hooks/
│   └── useAuth.ts                   # Custom auth hook
├── lib/
│   ├── firebase/
│   │   └── config.ts                # Firebase initialization
│   └── validators.ts                # Zod validation schemas
├── middleware.ts                    # Server-side route protection
└── types/
    └── index.ts                     # TypeScript types
```

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that your `.env.local` file exists
- Verify all Firebase config values are correct
- Restart the dev server after changing env variables

### "Firebase: Error (auth/operation-not-allowed)"
- Enable Email/Password authentication in Firebase Console
- Go to Authentication → Sign-in method → Email/Password → Enable

### "User document not created"
- Check Firestore rules (should allow authenticated writes)
- Verify Firestore is initialized in your Firebase project

### Middleware not working
- Clear browser cookies
- Check that the middleware.ts file is in the correct location (src/)
- Verify the matcher config in middleware.ts

### "Module not found" errors
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder: `rm -rf .next` (or `Remove-Item -Recurse -Force .next` on Windows)
- Restart dev server

## Next Steps

Phase 2 is complete! You can now:
1. ✅ Register and login users
2. ✅ Protect routes with authentication
3. ✅ Manage user sessions
4. ✅ Update user profiles

Ready for **Phase 3: Product Catalog and Category System**!

## Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify Firebase configuration
3. Ensure all dependencies are installed
4. Review the `AUTHENTICATION_GUIDE.md` for usage examples
