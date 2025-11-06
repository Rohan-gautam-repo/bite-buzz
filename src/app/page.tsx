import { redirect } from "next/navigation";

export default function RootPage() {
  // The home page with categories is in (shop)/page.tsx
  // Since (shop) is a route group, it's already accessible at "/"
  // This file shouldn't exist, but if accessed directly, redirect to avoid conflicts
  // In Next.js App Router, (shop)/page.tsx already handles the "/" route
  // So we'll just export a redirect as fallback
  return null;
}

