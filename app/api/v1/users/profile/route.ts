import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/token"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Get current user's profile
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    let token = null

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No authentication token provided" },
        { status: 401 }
      )
    }

    // Verify token and get user data
    const userData = await verifyAuthToken(token)
    if (!userData) {
      return NextResponse.json(
        { success: false, message: "Invalid authentication token" },
        { status: 401 }
      )
    }

    // Get full user profile from database
    const user = await prisma.user.findUnique({
      where: { id: userData.id },
      include: {
        userRole: {
          include: {
            role: true
          }
        },
        dccProfile: true
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Return user profile data
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.userRole?.role?.name || "USER",
        permissions: [], // Will be populated from token
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Additional profile fields
        bio: "", // Not available in current schema
        location: user.dccProfile?.location || "",
        // Commission info for DCC users
        commission: 0, // Default commission rate
        // Payment info - not available in current schema
        mobileMoney: "",
        bankAccount: "",
        bankName: "",
      }
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch user profile" },
      { status: 500 }
    )
  }
}

// Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    let token = null

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No authentication token provided" },
        { status: 401 }
      )
    }

    // Verify token and get user data
    const userData = await verifyAuthToken(token)
    if (!userData) {
      return NextResponse.json(
        { success: false, message: "Invalid authentication token" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userData.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        avatar: body.avatar,
        updatedAt: new Date(),
      },
      include: {
        userRole: {
          include: {
            role: true
          }
        },
        dccProfile: true
      },
    })

    // Update DCC profile location if user is DCC
    if (body.location && updatedUser.dccProfile) {
      await prisma.dCCProfile.update({
        where: { id: updatedUser.dccProfile.id },
        data: {
          location: body.location,
          updatedAt: new Date(),
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.userRole?.role?.name || "USER",
        permissions: [],
        bio: "",
        location: updatedUser.dccProfile?.location || "",
        mobileMoney: "",
        bankAccount: "",
        bankName: "",
        updatedAt: updatedUser.updatedAt,
      }
    })
  } catch (error: any) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user profile",
        error: error.message,
      },
      { status: 500 }
    )
  }
}
