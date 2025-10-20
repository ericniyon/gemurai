import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import crypto from "crypto"

export const runtime = "nodejs"

interface PasswordResetRequest {
  email?: string
  phone?: string
  nationalId: string
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Password reset request with national ID verification")
    
    const body = await request.json()
    const { email, phone, nationalId }: PasswordResetRequest = body

    // Validate required fields
    if (!nationalId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "National ID is required for password reset" 
        },
        { status: 400 }
      )
    }

    // At least one contact method is required
    if (!email && !phone) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Either email or phone number is required" 
        },
        { status: 400 }
      )
    }

    console.log(`🔍 Looking up user with national ID: ${nationalId}`)

    // Find user by national ID and contact method
    const user = await prisma.user.findFirst({
      where: {
        national_id: nationalId,
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        national_id: true,
        isActive: true
      }
    })

    if (!user) {
      console.log("❌ User not found with provided national ID and contact information")
      return NextResponse.json(
        { 
          success: false, 
          message: "No account found with the provided national ID and contact information" 
        },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      console.log("❌ User account is inactive")
      return NextResponse.json(
        { 
          success: false, 
          message: "Account is inactive. Please contact support." 
        },
        { status: 403 }
      )
    }

    console.log(`✅ User found: ${user.name} (${user.email})`)

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store reset request in database
    try {
      // Delete any existing reset requests for this user
      await prisma.passwordReset.deleteMany({
        where: { email: user.email }
      })

      // Create new reset request
      await prisma.passwordReset.create({
        data: {
          email: user.email,
          token: resetToken,
          expiresAt: expiresAt,
          used: false,
          metadata: JSON.stringify({
            nationalId: nationalId,
            phone: user.phone,
            requestedAt: new Date().toISOString()
          })
        }
      })

      console.log(`✅ Password reset token generated for ${user.email}`)

      // Send verification code via SMS if phone is available
      if (user.phone) {
        try {
          const { sendSMS } = await import("@/lib/services/twilio-service")
          const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
          
          // Store verification code temporarily
          await prisma.oTP.create({
            data: {
              phone: user.phone,
              otp: verificationCode,
              type: 'PASSWORD_RESET',
              expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
              isUsed: false
            }
          })

          const smsMessage = `Your password reset verification code is: ${verificationCode}. This code expires in 10 minutes. Do not share this code with anyone.`
          
          const smsResult = await sendSMS(user.phone, smsMessage)
          
          if (smsResult.success) {
            console.log(`✅ SMS verification code sent to ${user.phone}`)
          } else {
            console.log(`⚠️ Failed to send SMS: ${smsResult.message}`)
          }
        } catch (smsError) {
          console.error("❌ SMS sending failed:", smsError)
          // Continue with email fallback
        }
      }

      // Send email notification if email is available
      if (user.email) {
        try {
          const { sendPasswordResetEmail } = await import("@/lib/email-service.server")
          
          const emailResult = await sendPasswordResetEmail(user.email, resetToken)
          
          if (emailResult.success) {
            console.log(`✅ Password reset email sent to ${user.email}`)
          } else {
            console.log(`⚠️ Failed to send email: ${emailResult.message}`)
          }
        } catch (emailError) {
          console.error("❌ Email sending failed:", emailError)
        }
      }

      return NextResponse.json({
        success: true,
        message: "Password reset instructions have been sent to your registered contact methods",
        resetToken: resetToken, // Include for testing purposes
        expiresAt: expiresAt.toISOString(),
        contactMethods: {
          email: !!user.email,
          phone: !!user.phone
        }
      })

    } catch (dbError) {
      console.error("❌ Database error creating reset request:", dbError)
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to process password reset request" 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("❌ Password reset request error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "An error occurred while processing your request" 
      },
      { status: 500 }
    )
  }
}
