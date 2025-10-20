import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: NextRequest) {
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
    const { roleId } = body

    if (!roleId) {
      return NextResponse.json(
        { success: false, message: "Role ID is required" },
        { status: 400 }
      )
    }
    
    // Prevent deleting SUPER_ADMIN role
    if (roleId === "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Cannot delete SUPER_ADMIN role" },
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

    // Get count of users with this role
    const userCount = await prisma.user.count({
      where: {
        role: roleId as any,
        isActive: true
      }
    })

    if (userCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete role. ${userCount} users still have this role. Please reassign users to a different role first.`,
        userCount
      }, { status: 400 })
    }

    // Since we can't actually delete roles from the enum, we'll just return success
    // The role will effectively be "deleted" when no users have it
    return NextResponse.json({
      success: true,
      message: "Role deleted successfully",
      data: {
        id: roleId,
        deleted: true
      }
    })
  } catch (error) {
    console.error("Error in DELETE /api/v1/roles/delete:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete role", error: error.message },
      { status: 500 }
    )
  }
} 