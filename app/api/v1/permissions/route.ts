import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"

// Get all permissions
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

    // Get all permissions
    const permissions = await prisma.permission.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        category: permission.category,
        isActive: permission.isActive
      })
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      success: true,
      permissions: permissions.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        isActive: p.isActive
      })),
      groupedPermissions,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch permissions",
      },
      { status: 500 }
    )
  }
}

// Create a new permission
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
    const { name, description, category } = body

    if (!name || !category) {
      return NextResponse.json(
        { success: false, message: "Permission name and category are required" },
        { status: 400 }
      )
    }

    // Check if permission already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { name }
    })

    if (existingPermission) {
      return NextResponse.json(
        { success: false, message: "Permission with this name already exists" },
        { status: 400 }
      )
    }

    // Create the permission
    const newPermission = await prisma.permission.create({
      data: {
        name,
        description: description || "",
        category
      }
    })

    return NextResponse.json({
      success: true,
      message: "Permission created successfully",
      data: {
        id: newPermission.id,
        name: newPermission.name,
        description: newPermission.description,
        category: newPermission.category
      }
    })
  } catch (error) {
    console.error("Error creating permission:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create permission" },
      { status: 500 }
    )
  }
} 