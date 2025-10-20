import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"

// Get permissions for a specific role
export async function GET(
  request: NextRequest,
  { params }: { params: { roleId: string } }
) {
  try {
    // Verify superadmin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    const { roleId } = params

    // Get the role with its permissions
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!role) {
      return NextResponse.json(
        { success: false, message: "Role not found" },
        { status: 404 }
      )
    }

    const permissions = role.rolePermissions.map(rp => ({
      id: rp.permission.id,
      name: rp.permission.name,
      description: rp.permission.description,
      category: rp.permission.category
    }))

    return NextResponse.json({
      success: true,
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem
      },
      permissions,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching role permissions:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch role permissions",
      },
      { status: 500 }
    )
  }
}

// Assign permissions to a role
export async function PUT(
  request: NextRequest,
  { params }: { params: { roleId: string } }
) {
  try {
    // Verify superadmin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    const { roleId } = params
    const body = await request.json()
    const { permissions } = body

    if (!permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, message: "Permissions array is required" },
        { status: 400 }
      )
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    })

    if (!role) {
      return NextResponse.json(
        { success: false, message: "Role not found" },
        { status: 404 }
      )
    }

    // Check if it's a system role (can't modify)
    if (role.isSystem) {
      return NextResponse.json(
        { success: false, message: "Cannot modify system roles" },
        { status: 403 }
      )
    }

    // Get permission IDs
    const permissionIds = await prisma.permission.findMany({
      where: {
        name: {
          in: permissions
        }
      },
      select: { id: true }
    })

    // Delete existing role permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId }
    })

    // Create new role permissions
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map(p => ({
          roleId,
          permissionId: p.id
        }))
      })
    }

    return NextResponse.json({
      success: true,
      message: "Permissions assigned successfully",
      data: {
        roleId,
        permissions: permissionIds.length
      }
    })
  } catch (error) {
    console.error("Error assigning permissions:", error)
    return NextResponse.json(
      { success: false, message: "Failed to assign permissions" },
      { status: 500 }
    )
  }
} 