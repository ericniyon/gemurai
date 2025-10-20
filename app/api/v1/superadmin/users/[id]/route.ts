import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

// GET /api/v1/superadmin/users/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const admin = await verifyAuthToken(token.value)

    if (!admin || admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    const { id } = params

    // Try new schema first, fallback to old schema if it fails
    try {
      // Get user with role information (new schema)
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          userRole: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                }
              }
            }
          }
        },
      })

      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        )
      }

      // Transform user to include role name for compatibility
      const transformedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.userRole?.role?.name || 'CONSUMER',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isActive: user.isActive,
      }

      return NextResponse.json({ success: true, user: transformedUser })
    } catch (newSchemaError) {
      console.log("New schema failed, trying old schema:", newSchemaError)
      
      // Fallback to old schema if new schema fails
      try {
        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true, // Old schema has role directly on user
            createdAt: true,
            updatedAt: true,
            isActive: true,
          },
        })

        if (!user) {
          return NextResponse.json(
            { success: false, message: "User not found" },
            { status: 404 }
          )
        }

        return NextResponse.json({ success: true, user })
      } catch (oldSchemaError) {
        console.error("Both schemas failed:", { newSchemaError, oldSchemaError })
        throw oldSchemaError
      }
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        debug: {
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

// PATCH /api/v1/superadmin/users/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const admin = await verifyAuthToken(token.value)

    if (!admin || admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { email, name, phone, role, password, isActive } = body

    // Prepare update data
    const updateData: any = {}
    if (email !== undefined) updateData.email = email
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (password !== undefined) updateData.password = await hash(password, 12)
    if (isActive !== undefined) updateData.isActive = isActive

    // Try new schema first, fallback to old schema if it fails
    try {
      // Update user with new schema
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      })

      // Handle role update if provided (new schema)
      if (role !== undefined) {
        // First, remove existing role assignments
        await prisma.userRoleAssignment.deleteMany({
          where: { userId: id }
        })

        // Then assign new role
        const roleRecord = await prisma.role.findUnique({
          where: { name: role }
        })

        if (roleRecord) {
          await prisma.userRoleAssignment.create({
            data: {
              userId: id,
              roleId: roleRecord.id,
              assignedBy: admin.id,
              assignedAt: new Date()
            }
          })
        }
      }

      // Get updated user with role information
      const updatedUser = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          userRole: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                }
              }
            }
          }
        },
      })

      // Transform user to include role name for compatibility
      const transformedUser = {
        id: updatedUser!.id,
        email: updatedUser!.email,
        name: updatedUser!.name,
        phone: updatedUser!.phone,
        role: updatedUser!.userRole?.role?.name || 'CONSUMER',
        createdAt: updatedUser!.createdAt,
        updatedAt: updatedUser!.updatedAt,
        isActive: updatedUser!.isActive,
      }

      return NextResponse.json({ success: true, user: transformedUser })
    } catch (newSchemaError) {
      console.log("New schema failed, trying old schema:", newSchemaError)
      
      // Fallback to old schema if new schema fails
      try {
        // Add role to update data if provided (old schema)
        if (role !== undefined) updateData.role = role

        const user = await prisma.user.update({
          where: { id },
          data: updateData,
        })

        return NextResponse.json({ success: true, user })
      } catch (oldSchemaError) {
        console.error("Both schemas failed:", { newSchemaError, oldSchemaError })
        throw oldSchemaError
      }
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        debug: {
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/superadmin/users/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
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

    const admin = await verifyAuthToken(token.value)

    if (!admin || admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    const { id } = params

    // Validate user exists and is not the current admin
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    if (user.id === admin.id) {
      return NextResponse.json(
        { success: false, message: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 