import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, phone, tinNumber } = await request.json()

    // Check if user already exists with the same email
    let existingUserByEmail = null
    if (email) {
      try {
        existingUserByEmail = await prisma.user.findFirst({
          where: { email: email.toLowerCase() }
        })
      } catch (dbError) {
        console.error("Database error checking email:", dbError)
        // If database is not available, assume email doesn't exist to allow registration
        existingUserByEmail = null
      }
    }

    // Check if user already exists with the same phone
    let existingUserByPhone = null
    if (phone) {
      try {
        existingUserByPhone = await prisma.user.findFirst({
          where: { phone }
        })
      } catch (dbError) {
        console.error("Database error checking phone:", dbError)
        // If database is not available, assume phone doesn't exist to allow registration
        existingUserByPhone = null
      }
    }

    // Check if user already exists with the same TIN (for company registration)
    // Note: TIN is not stored in the User model, so this check is not implemented
    const existingUserByTin = null // TODO: Implement TIN check if TIN field is added to User model

    return NextResponse.json({
      success: true,
      emailExists: !!existingUserByEmail,
      phoneExists: !!existingUserByPhone,
      tinNumberExists: !!existingUserByTin,
    })
  } catch (error) {
    console.error("Check uniqueness error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "An error occurred while checking uniqueness" 
      },
      { status: 500 }
    )
  }
} 