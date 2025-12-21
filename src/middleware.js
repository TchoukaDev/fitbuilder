import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // ========================================
  // 1. Routes protégées (utilisateur non connecté → login)
  // ========================================
  const protectedRoutes = [
    "/dashboard",
    "/workouts",
    "/sessions",
    "/exercises",
    "/calendar",
    "/admin",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !token) {
    const url = new URL("/", req.url);
    url.searchParams.set("callbackUrl", pathname);
    url.searchParams.set("authError", "unauthorized");
    return NextResponse.redirect(url);
  }

  // ========================================
  // 2. Route Admin (réservée aux ADMIN uniquement)
  // ========================================
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute && token?.role !== "ADMIN") {
    const url = new URL("/dashboard", req.url);
    url.searchParams.set("authError", "forbidden");
    return NextResponse.redirect(url);
  }

  // ========================================
  // 3. Routes publiques (utilisateur connecté → dashboard)
  // ========================================
  const publicOnlyRoutes = ["/", "/signup"];

  const isPublicOnlyRoute = publicOnlyRoutes.includes(pathname);

  if (isPublicOnlyRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/signup",
    "/dashboard/:path*",
    "/workouts/:path*",
    "/sessions/:path*",
    "/exercises/:path*",
    "/calendar/:path*",
    "/admin/:path*",
  ],
};
