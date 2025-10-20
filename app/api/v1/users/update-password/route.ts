import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"
import { cookies } from "next/headers"
import { hash, compare } from "bcryptjs"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Password update API called")
    
    // Get authentication token
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      console.log("❌ No authentication token found")
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    console.log("✅ Token found, verifying user...")

    // Verify user authentication with better error handling
    let user;
    try {
      user = await verifyAuthToken(token.value)
    } catch (authError) {
      console.error("❌ Authentication error:", authError)
      return NextResponse.json(
        { success: false, message: "Authentication verification failed" },
        { status: 401 }
      )
    }

    if (!user) {
      console.log("❌ User verification failed")
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      )
    }

    console.log(`🔍 Password update request from user: ${user.email}`)

    // Get request body with error handling
    let body;
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error("❌ JSON parsing error:", jsonError)
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword, confirmPassword } = body

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      console.log("❌ Missing required fields")
      return NextResponse.json(
        { success: false, message: "All password fields are required" },
        { status: 400 }
      )
    }

    // Validate new password and confirmation match
    if (newPassword !== confirmPassword) {
      console.log("❌ Password confirmation mismatch")
      return NextResponse.json(
        { success: false, message: "New password and confirmation do not match" },
        { status: 400 }
      )
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      console.log("❌ Password too short")
      return NextResponse.json(
        { success: false, message: "New password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Password complexity validation
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumbers = /\d/.test(newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      console.log("❌ Password doesn't meet complexity requirements")
      return NextResponse.json(
        { 
          success: false, 
          message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
        },
        { status: 400 }
      )
    }

    // Get current user data to verify current password
    let currentUser;
    try {
      currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, password: true }
      })
    } catch (dbError) {
      console.error("❌ Database error finding user:", dbError)
      return NextResponse.json(
        { success: false, message: "Database error occurred" },
        { status: 500 }
      )
    }

    if (!currentUser) {
      console.log("❌ User not found in database")
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Verify current password
    let isCurrentPasswordValid;
    try {
      isCurrentPasswordValid = await compare(currentPassword, currentUser.password)
    } catch (compareError) {
      console.error("❌ Password comparison error:", compareError)
      return NextResponse.json(
        { success: false, message: "Password verification failed" },
        { status: 500 }
      )
    }

    if (!isCurrentPasswordValid) {
      console.log("❌ Current password is incorrect")
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 }
      )
    }

    // Hash new password
    let hashedNewPassword;
    try {
      hashedNewPassword = await hash(newPassword, 12)
    } catch (hashError) {
      console.error("❌ Password hashing error:", hashError)
      return NextResponse.json(
        { success: false, message: "Password processing failed" },
        { status: 500 }
      )
    }

    // Update password in database
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      })
    } catch (updateError) {
      console.error("❌ Database update error:", updateError)
      return NextResponse.json(
        { success: false, message: "Failed to update password in database" },
        { status: 500 }
      )
    }

    console.log(`✅ Password updated successfully for user: ${user.email}`)

    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    })

  } catch (error) {
    console.error("❌ Password update error:", error)
    console.error("❌ Error stack:", error.stack)
    return NextResponse.json(
      { 
        success: false, 
        message: "An error occurred while updating your password" 
      },
      { status: 500 }
    )
  }
} 