import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes that require authentication
const protectedRoutes = [
  "/cart",
  "/checkout",
  "/orders",
  "/settings",
  "/addresses",
];

// Admin routes that require admin role
const adminRoutes = ["/admin"];

// Public admin routes (don't require authentication)
const publicAdminRoutes = ["/admin/login"];

// Auth routes (should redirect to home if already authenticated)
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get Firebase Auth token from cookies (set by Firebase client SDK)
  // Firebase stores the token in localStorage/sessionStorage on the client
  // For server-side checking, we'll rely on the __session cookie or custom implementation
  const sessionCookie = request.cookies.get("__session")?.value;
  const firebaseToken = request.cookies.get("firebase-token")?.value;
  const userEmail = request.cookies.get("user-email")?.value;
  const adminSession = request.cookies.get("adminSession")?.value;

  // Check if user is authenticated (has any auth token)
  const isAuthenticated = !!(sessionCookie || firebaseToken);
  
  // Check if user is admin (has admin session)
  const isAdmin = adminSession === "true";

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Check if the current path is a public admin route
  const isPublicAdminRoute = publicAdminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Handle admin routes (excluding public admin routes)
  if (isAdminRoute && !isPublicAdminRoute) {
    // Check if user has admin session
    if (!isAdmin) {
      // Not an admin or not logged in, redirect to admin login
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }

    // User is admin, allow access
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute) {
    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // User is authenticated, allow access
    return NextResponse.next();
  }

  // Handle auth routes (login, register)
  if (isAuthRoute && isAuthenticated) {
    // Already authenticated, redirect to home or the redirect URL
    const redirectTo = request.nextUrl.searchParams.get("redirect") || "/";
    const url = new URL(redirectTo, request.url);
    return NextResponse.redirect(url);
  }

  // Allow all other routes
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
