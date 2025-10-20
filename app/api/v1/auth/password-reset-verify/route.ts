import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

interface PasswordResetVerify {
  email: string
  resetToken: string
  nationalId: string
  verificationCode?: string // For SMS verification
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Password reset verification with national ID")
    
    const body = await request.json()
    const { email, resetToken, nationalId, verificationCode }: PasswordResetVerify = body

    // Validate required fields
    if (!email || !resetToken || !nationalId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Email, reset token, and national ID are required" 
        },
        { status: 400 }
      )
    }

    console.log(`🔍 Verifying reset request for ${email} with national ID: ${nationalId}`)

    // Find the reset request
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        email: email,
        token: resetToken,
        used: false,
        expiresAt: {
          gt: new Date() // Not expired
        }
      }
    })

    if (!resetRecord) {
      console.log("❌ Invalid or expired reset token")
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid or expired reset token" 
        },
        { status: 400 }
      )
    }

    // Parse metadata to verify national ID
    let metadata
    try {
      metadata = JSON.parse(resetRecord.metadata || '{}')
    } catch (parseError) {
      console.error("❌ Error parsing reset metadata:", parseError)
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid reset request data" 
        },
        { status: 400 }
      )
    }

    // Verify national ID matches
    if (metadata.nationalId !== nationalId) {
      console.log("❌ National ID does not match reset request")
      return NextResponse.json(
        { 
          success: false, 
          message: "National ID does not match the reset request" 
        },
        { status: 400 }
      )
    }

    // If SMS verification code is provided, verify it
    if (verificationCode) {
      console.log(`🔍 Verifying SMS code: ${verificationCode}`)
      
      // Find user to get phone number
      const user = await prisma.user.findUnique({
        where: { email: email },
        select: { phone: true }
      })

      if (!user?.phone) {
        return NextResponse.json(
          { 
            success: false, 
            message: "No phone number associated with this account" 
          },
          { status: 400 }
        )
      }

      // Verify SMS code
      const otpRecord = await prisma.oTP.findFirst({
        where: {
          phone: user.phone,
          otp: verificationCode,
          type: 'PASSWORD_RESET',
          isUsed: false,
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (!otpRecord) {
        console.log("❌ Invalid or expired SMS verification code")
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid or expired verification code" 
          },
          { status: 400 }
        )
      }

      // Mark SMS code as used
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true }
      })

      console.log("✅ SMS verification code verified")
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

    console.log(`✅ Reset verification successful for ${user.name}`)

    // Generate a secure verification token for the next step
    const verificationToken = Buffer.from(JSON.stringify({
      email: email,
      nationalId: nationalId,
      resetToken: resetToken,
      verifiedAt: new Date().toISOString()
    })).toString('base64')

    return NextResponse.json({
      success: true,
      message: "National ID and reset token verified successfully",
      verificationToken: verificationToken,
      user: {
        name: user.name,
        email: user.email
      },
      nextStep: "set_new_password"
    })

  } catch (error) {
    console.error("❌ Password reset verification error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "An error occurred while verifying your request" 
      },
      { status: 500 }
    )
  }
}
