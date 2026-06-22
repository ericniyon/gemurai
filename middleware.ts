import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { verifyAuthToken } from "@/lib/token"

// List of all supported locales
const locales = ["en", "rw"]

// List of public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
  "/api/v1/auth/verify",
  "/superadmin/login",
  "/application",
  "/nexgen-forum",
  "/api/v1/applications/public",
  "/en",
  "/rw",
  "/about",
  "/marketplace",
  "/jobs",
  "/learning",
  "/programs",
  "/youth",
  "/partners",
  "/resources",
  "/news",
  "/contact",
  "/terms",
  "/privacy",
  "/soroma/login",
]

// List of public routes that should also be public with locale prefixes
const localizedPublicRoutes = [
  "/application",
  "/en/application",
  "/rw/application",
  "/en/about",
  "/rw/about",
  "/en/marketplace",
  "/rw/marketplace",
  "/en/jobs",
  "/rw/jobs",
  "/en/learning",
  "/rw/learning",
  "/en/terms",
  "/rw/terms",
  "/en/privacy",
  "/rw/privacy",
  "/en/login",
  "/rw/login",
  "/en/register",
  "/rw/register",
  "/en/forgot-password",
  "/rw/forgot-password",
  "/en/reset-password",
  "/rw/reset-password",
  // Training portal – fully public (no auth required)
  "/en/trainings",
  "/rw/trainings",
]

// Training portal and all subpaths are public (no auth)
function isTrainingsPath(pathname: string): boolean {
  return pathname.startsWith("/en/trainings") || pathname.startsWith("/rw/trainings")
}

// List of routes that require specific roles
const roleProtectedRoutes = new Map([
  ["/dashboard/applications", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER", "INTERVIEWER"]],
  ["/en/dashboard/applications", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER", "INTERVIEWER"]],
  ["/rw/dashboard/applications", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER", "INTERVIEWER"]],
  // Inventory routes
  ["/dashboard/inventory", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC", "BRANCH_MANAGER"]],
  ["/en/dashboard/inventory", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC", "BRANCH_MANAGER"]],
  ["/rw/dashboard/inventory", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC", "BRANCH_MANAGER"]],
  // Voucher routes
  ["/dashboard/vouchers", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER"]],
  ["/en/dashboard/vouchers", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER"]],
  ["/rw/dashboard/vouchers", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER"]],
  // DCC Sales routes
  ["/dashboard/dcc-sales", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER"]],
  ["/en/dashboard/dcc-sales", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER"]],
  ["/rw/dashboard/dcc-sales", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "BRANCH_MANAGER"]],
  ["/en/dashboard/stock", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/rw/dashboard/stock", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/dashboard/stock/orders", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/en/dashboard/stock/orders", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/rw/dashboard/stock/orders", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/dashboard/stock/add", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/en/dashboard/stock/add", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/rw/dashboard/stock/add", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/dashboard/stock/list", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/en/dashboard/stock/list", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/rw/dashboard/stock/list", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  // Marketplace stock routes
  ["/dashboard/marketplace/stock", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/en/dashboard/marketplace/stock", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/rw/dashboard/marketplace/stock", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/dashboard/marketplace/stock/orders", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/en/dashboard/marketplace/stock/orders", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/rw/dashboard/marketplace/stock/orders", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/dashboard/marketplace/stock/add", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/en/dashboard/marketplace/stock/add", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/rw/dashboard/marketplace/stock/add", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/dashboard/marketplace/stock/list", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/en/dashboard/marketplace/stock/list", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]],
  ["/rw/dashboard/marketplace/stock/list", ["EMPLOYER", "ADMIN", "SUPER_ADMIN", "DCC"]]
])

// Helper function to check if a route is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.includes(pathname) || localizedPublicRoutes.includes(pathname)
}

// Helper function to get locale from request
function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language")
  if (acceptLanguage?.includes("rw")) return "rw"
  return "en"
}

// Helper function to check role-based access
function checkRoleAccess(pathname: string, role: string | null): boolean {
  // Superadmin routes
  if (pathname.startsWith("/superadmin") && pathname !== "/superadmin/login") {
    return role === "SUPER_ADMIN"
  }

  // Check role-protected routes - use exact matching or most specific matching
  for (const [route, allowedRoles] of roleProtectedRoutes.entries()) {
    // Check for exact match first
    if (pathname === route) {
      return role ? allowedRoles.includes(role) : false
    }
    // Check for pathname starts with route (more specific than includes)
    if (pathname.startsWith(route + "/")) {
      return role ? allowedRoles.includes(role) : false
    }
  }

  return true
}

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Store the URL in cookies for redirects
  const response = NextResponse.next()
  response.cookies.set("NEXT_PATH", path)

  // Skip auth check for login page and API routes
  if (
    path.startsWith("/api/") ||
    path === "/superadmin/login" ||
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password"
  ) {
    return response
  }

  // Training portal: fully public, no auth required
  if (isTrainingsPath(path)) {
    return response
  }

  // Check if this is a public route
  if (isPublicRoute(path) || path.startsWith("/en") || path.startsWith("/rw")) {
    // For public routes, allow access without authentication
    // Only check auth for protected routes
    if (path.startsWith("/dashboard/") || path.startsWith("/en/dashboard/") || path.startsWith("/rw/dashboard/")) {
      const token = request.cookies.get("Gemurai_token")?.value
      
      if (!token) {
        console.log("🔒 No token found, redirecting to login")
        // Redirect to regular login for dashboard routes
        const locale = path.startsWith("/en/") ? "en" : path.startsWith("/rw/") ? "rw" : "en"
        return Response.redirect(new URL(`/${locale}/login`, request.url))
      }
      
      try {
        console.log("🔍 Verifying token in middleware for path:", path)
        const userData = await verifyAuthToken(token)
        if (!userData) {
          console.log("❌ Token verification failed in middleware")
          throw new Error("Invalid token")
        }
        
        console.log("✅ Token verification successful in middleware for user:", userData.email)
        
        // Check role-based access
        if (!checkRoleAccess(path, userData.role)) {
          console.log("🚫 Role access denied for user:", userData.role, "on path:", path)
          return Response.redirect(new URL("/", request.url))
        }
        
        return response
      } catch (error) {
        console.error("❌ Middleware token verification error:", error)
        const locale = path.startsWith("/en/") ? "en" : path.startsWith("/rw/") ? "rw" : "en"
        return Response.redirect(new URL(`/${locale}/login`, request.url))
      }
    }
    
    return response
  }

  // SOROMA FOODS — standalone product routes
  if (path.startsWith("/soroma")) {
    if (path === "/soroma/login" || path.startsWith("/soroma/login/")) {
      return response
    }
    const token = request.cookies.get("Gemurai_token")?.value
    if (!token) {
      return Response.redirect(new URL("/soroma/login", request.url))
    }
    try {
      const userData = await verifyAuthToken(token)
      if (!userData) throw new Error("Invalid token")
      const soromaResponse = NextResponse.next()
      soromaResponse.headers.set("x-pathname", path)
      return soromaResponse
    } catch {
      return Response.redirect(new URL("/soroma/login", request.url))
    }
  }

  // Handle superadmin routes specifically
  if (path.startsWith("/superadmin")) {
    console.log("🔍 Middleware: Processing superadmin route:", path)
    
    // Debug JWT_SECRET in middleware
    const jwtSecret = process.env.JWT_SECRET;
    console.log("🔑 Middleware JWT_SECRET available:", !!jwtSecret);
    console.log("🔑 Middleware JWT_SECRET length:", jwtSecret?.length || 0);
    console.log("🔑 Middleware JWT_SECRET starts with:", jwtSecret?.substring(0, 10) + "...");
    
    const token = request.cookies.get("Gemurai_token")?.value

    if (!token) {
      console.log("🔒 No token found for superadmin route, redirecting to superadmin login")
      return Response.redirect(new URL("/superadmin/login", request.url))
    }

    console.log("🔍 Token found for superadmin route, length:", token.length)
    console.log("🔍 Token starts with:", token.substring(0, 20) + "...")

    try {
      console.log("🔍 Verifying token for superadmin route:", path)
      const userData = await verifyAuthToken(token)

      if (!userData) {
        console.log("❌ Token verification failed for superadmin route")
        throw new Error("Invalid token")
      }

      console.log("✅ Token verification successful for superadmin route, user:", userData.email, "role:", userData.role)

      // Check if user has SUPER_ADMIN role for superadmin routes
      if (userData.role !== "SUPER_ADMIN") {
        console.log("🚫 Superadmin access denied for user:", userData.role)
        // Redirect to appropriate dashboard based on role
        const roleDashboards: Record<string, string> = {
          EMPLOYER: "/dashboard/employer",
          DCC: "/dashboard/dcc",
          AGENT: "/dashboard/agent",
          CUSTOMER: "/dashboard",
          ADMIN: "/admin/dashboard",
        }

        const redirectPath = roleDashboards[userData.role] || "/"
        console.log("🔄 Redirecting to:", redirectPath)
        return Response.redirect(new URL(redirectPath, request.url))
      }

      console.log("✅ Superadmin access granted, allowing request")
      return response
    } catch (error) {
      console.error("❌ Middleware error for superadmin route:", path, error)
      return Response.redirect(new URL("/superadmin/login", request.url))
    }
  }

  // For other protected routes, check authentication
  const token = request.cookies.get("Gemurai_token")?.value

  if (!token) {
    console.log("🔒 No token found for protected route:", path)
    // Redirect to regular login for other protected routes
    return Response.redirect(new URL("/en/login", request.url))
  }

  try {
    console.log("🔍 Verifying token for protected route:", path)
    // Verify token and get user data
    const userData = await verifyAuthToken(token)

    if (!userData) {
      console.log("❌ Token verification failed for protected route")
      throw new Error("Invalid token")
    }

    console.log("✅ Token verification successful for protected route, user:", userData.email)

    return response
  } catch (error) {
    console.error("❌ Middleware error for protected route:", path, error)
    return Response.redirect(new URL("/en/login", request.url))
  }
}

// Configure the paths that should be handled by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/* (all API routes)
     * 2. /_next/* (Next.js internals)
     * 3. /static/* (static files)
     * 4. /*.* (files with extensions)
     */
    "/((?!api|_next|static|.*\\.[^/]*$).*)",
  ],
}
