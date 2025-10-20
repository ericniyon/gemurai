import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 My Application API called")
    
    // Get the token from cookies
    const token = request.cookies.get("Gemurai_token")?.value
    
    if (!token) {
      console.log("❌ No authentication token found")
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      )
    }

    console.log("✅ Token found, verifying...")

    // Verify the token
    const userData = await verifyAuthToken(token)
    
    if (!userData) {
      console.log("❌ Invalid authentication token")
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      )
    }

    console.log("✅ Token verified for user:", userData.email)

    // Get userId from query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      console.log("❌ User ID is required")
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    console.log("🔍 Looking for application for user:", userId)

    // Verify the user is requesting their own application
    if (userData.id !== userId) {
      console.log("❌ User ID mismatch:", userData.id, "vs", userId)
      return NextResponse.json(
        { error: "You can only view your own application" },
        { status: 403 }
      )
    }

    // Find the user's application
    console.log("🔍 Searching for application in database...")
    const application = await prisma.application.findFirst({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!application) {
      console.log("❌ No application found for user:", userId)
      return NextResponse.json(
        { error: "No application found for this user" },
        { status: 404 }
      )
    }

    console.log("✅ Application found:", application.id)

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        formData: application.formData,
        user: application.user
      }
    })

  } catch (error) {
    console.error("Error fetching user application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 