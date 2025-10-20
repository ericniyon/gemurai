import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export const runtime = "nodejs"

interface PasswordResetComplete {
  verificationToken: string
  newPassword: string
  confirmPassword: string
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Password reset completion with national ID verification")
    
    const body = await request.json()
    const { verificationToken, newPassword, confirmPassword }: PasswordResetComplete = body

    // Validate required fields
    if (!verificationToken || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Verification token, new password, and confirmation are required" 
        },
        { status: 400 }
      )
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: "New password and confirmation do not match" 
        },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Password must be at least 8 characters long" 
        },
        { status: 400 }
      )
    }

    // Password complexity validation
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumbers = /\d/.test(newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
        },
        { status: 400 }
      )
    }

    // Decode and verify the verification token
    let verificationData
    try {
      const decodedToken = Buffer.from(verificationToken, 'base64').toString('utf-8')
      verificationData = JSON.parse(decodedToken)
    } catch (decodeError) {
      console.error("❌ Error decoding verification token:", decodeError)
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid verification token" 
        },
        { status: 400 }
      )
    }

    const { email, nationalId, resetToken, verifiedAt } = verificationData

    // Verify the reset request is still valid
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        email: email,
        token: resetToken,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!resetRecord) {
      console.log("❌ Reset request not found or expired")
      return NextResponse.json(
        { 
          success: false, 
          message: "Reset request has expired or is invalid" 
        },
        { status: 400 }
      )
    }

    // Verify the user exists and national ID matches
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        national_id: nationalId,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        national_id: true
      }
    })

    if (!user) {
      console.log("❌ User not found or national ID mismatch")
      return NextResponse.json(
        { 
          success: false, 
          message: "User not found or national ID does not match" 
        },
        { status: 404 }
      )
    }

    console.log(`🔍 Updating password for user: ${user.name} (${user.email})`)

    // Hash the new password
    let hashedPassword
    try {
      hashedPassword = await hash(newPassword, 12)
    } catch (hashError) {
      console.error("❌ Password hashing error:", hashError)
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to process new password" 
        },
        { status: 500 }
      )
    }

    // Update the user's password
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      })

      console.log(`✅ Password updated successfully for ${user.name}`)
    } catch (updateError) {
      console.error("❌ Database error updating password:", updateError)
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to update password" 
        },
        { status: 500 }
      )
    }

    // Mark the reset token as used
    try {
      await prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { 
          used: true,
          updatedAt: new Date()
        }
      })

      console.log("✅ Reset token marked as used")
    } catch (updateError) {
      console.error("⚠️ Warning: Failed to mark reset token as used:", updateError)
      // Don't fail the request for this
    }

    // Clean up any unused OTP codes for this user
    try {
      const userPhone = await prisma.user.findUnique({
        where: { id: user.id },
        select: { phone: true }
      })

      if (userPhone?.phone) {
        await prisma.oTP.deleteMany({
          where: {
            phone: userPhone.phone,
            type: 'PASSWORD_RESET',
            isUsed: false
          }
        })
      }
    } catch (cleanupError) {
      console.error("⚠️ Warning: Failed to cleanup OTP codes:", cleanupError)
      // Don't fail the request for this
    }

    // Send confirmation notification
    try {
      const { sendPasswordResetConfirmationEmail } = await import("@/lib/email-service.server")
      
      await sendPasswordResetConfirmationEmail(user.email, user.name)
      console.log(`✅ Password reset confirmation email sent to ${user.email}`)
    } catch (emailError) {
      console.error("⚠️ Warning: Failed to send confirmation email:", emailError)
      // Don't fail the request for this
    }

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
      user: {
        name: user.name,
        email: user.email
      },
      resetAt: new Date().toISOString()
    })

  } catch (error) {
    console.error("❌ Password reset completion error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "An error occurred while resetting your password" 
      },
      { status: 500 }
    )
  }
}
