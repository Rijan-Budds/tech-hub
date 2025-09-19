import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Define protected routes
const protectedRoutes = ["/admin", "/profile", "/cart", "/orders", "/wishlist"];
const adminRoutes = ["/admin"];

// Define public routes that don't need authentication
const publicRoutes = [
  "/login",
  "/register",
  "/",
  "/about",
  "/contact",
  "/services",
  "/privacy",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookies
  const token = request.cookies.get("token")?.value;

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if the current path is admin-only
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith("/product") ||
      pathname.startsWith("/categories") ||
      pathname.startsWith("/search"),
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists, verify it
  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "dev-secret-change-me",
      );

      const { payload } = await jwtVerify(token, secret);
      const userRole = (payload as any).role || "user";

      // If trying to access admin route but not admin, redirect to profile
      if (isAdminRoute && userRole !== "admin") {
        return NextResponse.redirect(new URL("/profile", request.url));
      }

      // If authenticated user tries to access login/register, redirect to profile
      if (pathname === "/login" || pathname === "/register") {
        return NextResponse.redirect(new URL("/profile", request.url));
      }
    } catch (error) {
      // Invalid token, clear it and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
