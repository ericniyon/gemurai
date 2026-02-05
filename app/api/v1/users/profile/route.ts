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

    // Format DCC level for display (e.g. LEVEL_A -> "Level A")
    const dccLevelDisplay = user.dccProfile?.level
      ? `Level ${user.dccProfile.level.replace("LEVEL_", "")}`
      : null

    // Return user profile data (real fields from User + DCCProfile)
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        avatar: user.avatar,
        role: user.userRole?.role?.name || "USER",
        permissions: [],
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // User profile fields from schema
        nationalId: user.national_id ?? "",
        gender: user.gender ?? "",
        district: user.district ?? "",
        // DCC profile
        location: user.dccProfile?.location || "",
        dccLevel: dccLevelDisplay,
        totalSales: user.dccProfile?.totalSales ?? "RWF 0",
        monthlySales: user.dccProfile?.monthlySales ?? "RWF 0",
        productsAvailable: user.dccProfile?.productsAvailable ?? 0,
        mccId: user.mccId ?? null,
        bio: "",
        commission: 0,
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

    // Build update data from allowed fields
    const userUpdate: {
      name?: string
      email?: string
      phone?: string | null
      avatar?: string | null
      national_id?: string | null
      gender?: string | null
      district?: string | null
      updatedAt: Date
    } = {
      updatedAt: new Date(),
    }
    if (body.name !== undefined) userUpdate.name = body.name
    if (body.email !== undefined) userUpdate.email = body.email
    if (body.phone !== undefined) userUpdate.phone = body.phone || null
    if (body.avatar !== undefined) userUpdate.avatar = body.avatar || null
    if (body.nationalId !== undefined) userUpdate.national_id = body.nationalId || null
    if (body.gender !== undefined) userUpdate.gender = body.gender || null
    if (body.district !== undefined) userUpdate.district = body.district || null

    const updatedUser = await prisma.user.update({
      where: { id: userData.id },
      data: userUpdate,
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

    const dccLevelDisplay = updatedUser.dccProfile?.level
      ? `Level ${updatedUser.dccProfile.level.replace("LEVEL_", "")}`
      : null

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone ?? "",
        avatar: updatedUser.avatar,
        role: updatedUser.userRole?.role?.name || "USER",
        permissions: [],
        nationalId: updatedUser.national_id ?? "",
        gender: updatedUser.gender ?? "",
        district: updatedUser.district ?? "",
        bio: "",
        location: updatedUser.dccProfile?.location || "",
        dccLevel: dccLevelDisplay,
        totalSales: updatedUser.dccProfile?.totalSales ?? "RWF 0",
        monthlySales: updatedUser.dccProfile?.monthlySales ?? "RWF 0",
        productsAvailable: updatedUser.dccProfile?.productsAvailable ?? 0,
        mccId: updatedUser.mccId ?? null,
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
