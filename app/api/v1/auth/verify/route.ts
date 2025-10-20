import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROLES, getRolePermissions } from "@/lib/roles"

export async function GET(request: NextRequest) {
  try {
    // Try NextAuth session first
    const session = await getServerSession(authOptions)
    
    // Try custom token if no session
    const authHeader = request.headers.get("authorization")
    const customToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

    // If no session and no custom token, return unauthorized
    if (!session?.user?.id && !customToken) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 })
    }

    let userId: string | undefined;
    let customUser: any | null = null;

    // If we have a custom token, verify it
    if (customToken) {
      customUser = await verifyAuthToken(customToken)
      if (!customUser) {
        return NextResponse.json({ 
          success: false, 
          message: "Invalid token" 
        }, { status: 401 })
      }
      userId = customUser.id
    } else {
      userId = session!.user!.id
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        avatar: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 })
    }

    // Get role permissions from the roles configuration
    const rolePermissions = getRolePermissions(user.role)

    // Combine user permissions and role permissions
    const allPermissions = [
      ...user.permissions,
      ...rolePermissions
    ]

    // Add default permissions based on role
    if (user.role === "EMPLOYER") {
      allPermissions.push(
        "applications.view",
        "applications.create",
        "applications.evaluate",
        "applications.manage",
        "applications.review",
        "applications.delete",
        "applications.update",
        "applications.process",
        "applications.approve",
        "applications.reject",
        "stock.view",
        "stock.manage",
        "stock.order",
        "stock.create",
        "stock.edit",
        "stock.delete",
        "stock.orders.view",
        "stock.orders.create",
        "stock.orders.manage"
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: [...new Set(allPermissions)],
        avatar: customUser?.avatar || user.avatar || null
      }
    })
  } catch (error) {
    console.error("Error verifying auth:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 