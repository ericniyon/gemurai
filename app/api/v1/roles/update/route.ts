import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest) {
  try {
    // Get authentication token
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    // Verify user is super admin
    const user = await verifyAuthToken(token.value)
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Super admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { roleId, permissions, name, description, level } = body

    if (!roleId) {
      return NextResponse.json(
        { success: false, message: "Role ID is required" },
        { status: 400 }
      )
    }
    
    // Prevent modifying SUPER_ADMIN role
    if (roleId === "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Cannot modify SUPER_ADMIN role" },
        { status: 400 }
      )
    }

    // Validate that the role ID is a valid system role
    const validRoles = ["SUPER_ADMIN", "ADMIN", "DCC", "EMPLOYER", "CONSUMER", "AGENT"]
    if (!validRoles.includes(roleId)) {
      return NextResponse.json(
        { success: false, message: "Invalid role ID" },
        { status: 400 }
      )
    }

    // Update all users with this role to have the new permissions
    if (permissions && Array.isArray(permissions)) {
      const updateResult = await prisma.user.updateMany({
        where: {
          role: roleId as any, // Cast to UserRole enum
          isActive: true
        },
        data: {
          permissions: permissions
        }
      })

      console.log(`Updated ${updateResult.count} users with role ${roleId} to have new permissions:`, {
        roleId,
        permissions,
        updatedCount: updateResult.count
      })

      return NextResponse.json({
        success: true,
        message: `Role updated successfully. ${updateResult.count} users affected.`,
        data: {
          id: roleId,
          permissions,
          name,
          description,
          level,
          updatedUserCount: updateResult.count
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Permissions array is required"
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in PUT /api/v1/roles/update:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update role", error: error.message },
      { status: 500 }
    )
  }
} 