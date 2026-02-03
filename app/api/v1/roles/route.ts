import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"

// Get all roles with their permissions and user counts
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication (cookie or Bearer token)
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get("Gemurai_token")
    const authHeader = request.headers.get("Authorization")
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
    const token = cookieToken?.value || bearerToken

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token found" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)

    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    // Get all roles with their permissions and user counts
    const roles = await prisma.role.findMany({
      where: {
        isActive: true
      },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        },
        userRoles: {
          where: {
            isActive: true
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Transform the data for the frontend
    const transformedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      isSystem: role.isSystem,
      userCount: role.userRoles.length,
      permissionCount: role.rolePermissions.length,
      createdAt: role.createdAt.toISOString(),
      permissions: role.rolePermissions.map(rp => rp.permission.name),
      users: role.userRoles.map(ur => ({
        id: ur.user.id,
        name: ur.user.name,
        email: ur.user.email
      }))
    }))

    return NextResponse.json({
      success: true,
      roles: transformedRoles,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch roles",
      },
      { status: 500 }
    )
  }
}

// Create a new role
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication (cookie or Bearer token)
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get("Gemurai_token")
    const authHeader = request.headers.get("Authorization")
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
    const token = cookieToken?.value || bearerToken

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)

    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, permissions } = body

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Role name is required" },
        { status: 400 }
      )
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    })

    if (existingRole) {
      return NextResponse.json(
        { success: false, message: "Role with this name already exists" },
        { status: 400 }
      )
    }

    // Create the role
    const newRole = await prisma.role.create({
      data: {
        name,
        description: description || "",
        isSystem: false
      }
    })

    // Add permissions to the role if provided
    if (permissions && permissions.length > 0) {
      // Get permission IDs
      const permissionIds = await prisma.permission.findMany({
        where: {
          name: {
            in: permissions
          }
        },
        select: { id: true }
      })

      // Create role-permission relationships
      await prisma.rolePermission.createMany({
        data: permissionIds.map(p => ({
          roleId: newRole.id,
          permissionId: p.id
        }))
      })
    }

    return NextResponse.json({
      success: true,
      message: "Role created successfully",
      data: {
        id: newRole.id,
        name: newRole.name,
        description: newRole.description
      }
    })
  } catch (error) {
    console.error("Error creating role:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create role" },
      { status: 500 }
    )
  }
}