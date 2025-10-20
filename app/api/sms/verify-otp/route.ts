import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"
export const preferredRegion = "auto"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  console.log("🔄 OTP Verification API called")

  try {
    const body = await request.json()
    console.log("📋 Request body:", body)

    const { phone, otp, type = 'PASSWORD_RESET' } = body

    if (!phone) {
      console.log("❌ Missing phone in request")
      return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400 })
    }

    if (!otp) {
      console.log("❌ Missing OTP in request")
      return NextResponse.json({ success: false, message: "OTP is required" }, { status: 400 })
    }

    // Import OTP service for database verification
    const { verifyOTP } = await import("@/lib/services/otp-service")
    
    console.log(`🔍 Verifying OTP via database for ${phone}: ${otp}`)

    try {
      // Verify OTP using database
      const verificationResult = await verifyOTP(phone, otp, 'PASSWORD_RESET')

      console.log("📊 Database OTP verification result:", verificationResult)

      if (verificationResult.success && verificationResult.isValid) {
        console.log("✅ OTP verified successfully via database")
        return NextResponse.json({
          success: true,
          message: "OTP verified successfully",
          isValid: true,
          databaseData: verificationResult.data,
          demo: false,
        })
      } else {
        console.log("❌ OTP verification failed via database")
        return NextResponse.json({
          success: true,
          message: verificationResult.message || "Invalid or expired OTP",
          isValid: false,
          databaseError: verificationResult.data,
          demo: false,
        })
      }
    } catch (dbError) {
      console.error("❌ Database verification error:", dbError)
      
      // Fallback to demo verification for development
      if (process.env.NODE_ENV === 'development') {
        console.log("🔄 Falling back to demo verification")
        if (otp && otp.length === 4 && /^\d{4}$/.test(otp)) {
          return NextResponse.json({
            success: true,
            message: "OTP verified successfully (demo mode)",
            isValid: true,
            demo: true,
            fallback: true,
          })
        } else {
          return NextResponse.json({
            success: true,
            message: "Invalid OTP format. Please enter a 4-digit code.",
            isValid: false,
            demo: true,
            fallback: true,
          })
        }
      } else {
        return NextResponse.json({
          success: false,
          message: "Database verification failed. Please try again.",
          isValid: false,
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
        })
      }
    }

  } catch (error: any) {
    console.error("❌ OTP Verification API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to verify OTP: ${error.message}`,
        error: error.toString(),
      },
      { status: 500 },
    )
  }
}
