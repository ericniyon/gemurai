import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { redirect } from "next/navigation"

export type AuthUser = {
  id: string
  name?: string | null
  email?: string | null
  role?: string | null
  permissions?: string[]
}

export async function getAuthenticatedUser(request?: Request): Promise<AuthUser | null> {
  try {
    // Try to get session from NextAuth
    const session = await getServerSession(authOptions)
    if (session?.user) {
      return session.user as AuthUser
    }

    // Try to get token from Authorization header if request is provided
    if (request) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        const user = await verifyAuthToken(token)
        if (user) {
          return user as AuthUser
        }
      }
    }

    // Try to get token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")?.value
    if (token) {
      const user = await verifyAuthToken(token)
      if (user) {
        return user as AuthUser
      }
    }

    return null
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function requireAuth(request: Request) {
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    // For API routes
    if (request.url.includes('/api/')) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // For page routes
    const url = new URL(request.url)
    const pathname = url.pathname
    const locale = pathname.split('/')[1]
    
    // Redirect to login without callback URL
    redirect(`/${locale}/login`)
  }

  return user
}

export async function requireAuthPage(request: Request) {
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    const url = new URL(request.url)
    const pathname = url.pathname
    const locale = pathname.split('/')[1]
    
    // Redirect to login without callback URL
    redirect(`/${locale}/login`)
  }

  return user
}

export async function withAuth(request: Request, handler: (user: AuthUser) => Promise<NextResponse>) {
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    if (request.url.includes('/api/')) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const url = new URL(request.url)
    const pathname = url.pathname
    const locale = pathname.split('/')[1]
    
    // Redirect to login without callback URL
    redirect(`/${locale}/login`)
  }

  return handler(user)
} 