import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get user with role info
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

// Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        avatar: body.avatar,
        role: body.role,
        permissions: body.permissions,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
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
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
