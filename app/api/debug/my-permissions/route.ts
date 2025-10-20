import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"

export const runtime = "nodejs"

// Mark this route as dynamic since it uses request.headers
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Get token from multiple sources
    let token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = req.cookies.get("token")?.value
    }
    if (!token) {
      token = req.cookies.get("Gemurai_token")?.value
    }

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      )
    }

    // Verify the token
    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    const productPermissions = [
      'products.view',
      'products.create', 
      'products.edit',
      'products.delete',
      'products.manage'
    ]

    const hasProductPermissions = productPermissions.map(permission => ({
      permission,
      hasAccess: user.permissions.includes(permission)
    }))

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissionCount: user.permissions.length
      },
      permissions: user.permissions,
      productAccess: hasProductPermissions,
      canAccessMarketplace: user.permissions.includes('products.view'),
      tokenInfo: {
        hasToken: true,
        tokenLength: token.length
      }
    })

  } catch (error) {
    console.error('Debug permissions error:', error)
    
    return NextResponse.json({
      error: "Failed to check permissions",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 