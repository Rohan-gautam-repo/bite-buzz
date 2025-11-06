# 🍔 Bite-Buzz - Quick Food Delivery App

A modern, fast food delivery application built with Next.js 14, TypeScript, Firebase, and Tailwind CSS.

## 🚀 Features

- **User Authentication**: Email/password authentication with Firebase
- **Product Catalog**: Browse food items by categories
- **Shopping Cart**: Add items, manage quantities
- **Multiple Addresses**: Save and manage delivery addresses
- **Order Tracking**: Track orders from preparation to delivery
- **Admin Panel**: Manage products, categories, and orders
- **Responsive Design**: Works seamlessly on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Firebase (Authentication + Firestore)
- **Form Handling**: React Hook Form + Zod
- **Animations**: Framer Motion

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18.x or higher installed
- A Firebase account
- Git installed on your machine

## 🔧 Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `bite-buzz` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Enable **Email/Password** authentication
5. Click "Save"

### 3. Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Select "Start in production mode"
4. Choose a location closest to your users
5. Click "Enable"

### 4. Set Up Firestore Security Rules

1. In Firestore Database, go to "Rules" tab
2. Copy the contents from `firestore.rules` file in this project
3. Paste into the rules editor
4. Click "Publish"

### 5. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register app with nickname: `bite-buzz-web`
5. Copy the configuration object

### 6. Add Environment Variables

1. Copy `.env.local` in the project root
2. Replace the placeholder values with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 7. Create Admin User

To create an admin user:

1. Register a new user through the app
2. Go to Firestore Database in Firebase Console
3. Navigate to `users` collection
4. Find your user document
5. Edit the document and change `role` field from `"user"` to `"admin"`
6. Save changes

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bite-buzz
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see Firebase Setup above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## � Seeding Initial Data

### Seed Categories

The project includes a seed script to populate initial categories in Firestore.

**Option 1: Using API Endpoint**

1. Start the development server:
```bash
npm run dev
```

2. Make a POST request to the seed endpoint:
```bash
# Using curl
curl -X POST http://localhost:3000/api/seed/categories

# Using PowerShell
Invoke-WebRequest -Uri http://localhost:3000/api/seed/categories -Method POST
```

**Option 2: Using the Script Directly** (requires ts-node)

```bash
npm install -D ts-node esbuild-register
npm run seed:categories
```

The seed script will create 8 categories:
- 🍎 Fruits
- 🥕 Vegetables
- 🥛 Dairy
- 🍞 Bakery
- 🍖 Meat
- 🐟 Seafood
- 🥤 Beverages
- 🍿 Snacks

**Note**: The script will check if categories already exist and won't duplicate them.

## �🏗️ Project Structure

```
bite-buzz/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   ├── contexts/              # React contexts (Auth, Cart, etc.)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and configurations
│   │   └── firebase/          # Firebase configuration and helpers
│   │       ├── config.ts      # Firebase initialization
│   │       ├── auth.ts        # Authentication functions
│   │       └── firestore.ts   # Firestore CRUD operations
│   └── types/                 # TypeScript type definitions
│       └── index.ts           # All type definitions
├── public/                    # Static files
├── .env.local                 # Environment variables (not in git)
├── firestore.rules           # Firestore security rules
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## 🎨 Color Theme

The app uses a vibrant, food-themed color palette:

- **Primary (Orange)**: `#FF6B35` - Main brand color
- **Secondary (Green)**: `#4CAF50` - Success states, healthy options
- **Accent (Yellow)**: `#FFC107` - Highlights and CTAs

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed:categories` - Seed initial categories to Firestore

## 🔒 Security Rules Overview

The Firestore security rules ensure:

- ✅ Users can only access their own cart, addresses, and orders
- ✅ Products and categories are read-only for regular users
- ✅ Only admins can manage products, categories, and update orders
- ✅ Users can create orders only for themselves
- ✅ All write operations require authentication

## 🌟 Key Features

### For Users
- Browse products by category
- Add items to cart
- Save multiple delivery addresses
- Place and track orders
- View order history

### For Admins
- Add/edit/delete products
- Manage categories
- Update order status
- Assign delivery partners
- View all orders

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed on any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- DigitalOcean App Platform

## 📚 Next Steps

After setup, you can:

1. Create sample categories and products as admin
2. Test the ordering flow
3. Customize the theme colors in `tailwind.config.ts`
4. Add more features like:
   - Payment integration
   - Real-time order tracking
   - Push notifications
   - User reviews and ratings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Open an issue in this repository

---

Made with ❤️ and 🍕
