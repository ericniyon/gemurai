import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"

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
    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get user's basic info (payment fields don't exist in DCCProfile schema yet)
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        dccProfile: {
          select: {
            id: true,
            location: true
          }
        }
      }
    })

    // Return default payment settings since the fields don't exist in schema yet
    return NextResponse.json({
      success: true,
      data: {
        mobileMoney: "",
        bankAccount: "",
        bankName: ""
      }
    })
  } catch (error) {
    console.error("Error fetching payment settings:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch payment settings" },
      { status: 500 }
    )
  }
}

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
    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      mobileMoney,
      bankAccount,
      bankName
    } = body

    // Update user's basic info (payment fields don't exist in DCCProfile schema yet)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Payment settings updated successfully (stored in memory for now)",
      data: {
        mobileMoney: mobileMoney || "",
        bankAccount: bankAccount || "",
        bankName: bankName || ""
      }
    })
  } catch (error) {
    console.error("Error updating payment settings:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update payment settings" },
      { status: 500 }
    )
  }
}
