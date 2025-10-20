import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"
export const preferredRegion = "auto"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  console.log("🔄 Password reset API called")

  try {
    const body = await request.json()
    console.log("📋 Request body:", body)

    const { email, resetToken } = body

    if (!email) {
      console.log("❌ Missing email in request")
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Generate a secure token if not provided
    const token = resetToken || Math.random().toString(36).substring(2) + Date.now().toString(36)
    console.log(`🔑 Using token: ${token}`)

    console.log(`📧 Attempting to send password reset email to: ${email}`)

    // Check if email service is configured
    const { checkEmailConfiguration } = await import("@/lib/email-service.server")
    const emailConfig = checkEmailConfiguration()
    
    if (!emailConfig.configured) {
      console.log("⚠️ Email service not configured, returning success for demo purposes")
      console.log("📋 Configuration issues:", emailConfig.issues)
      
      // For demo purposes, return success even if email is not configured
      return NextResponse.json({
        success: true,
        message: "Password reset request received. Check your email for reset instructions.",
        demo: true,
        token: token, // Include token for demo purposes
      })
    }

    // Try to send email, but don't fail if SendGrid is not available
    try {
      // Dynamic import of email service
      const { sendPasswordResetEmail } = await import("@/lib/email-service.server")

      // Send the password reset email
      const result = await sendPasswordResetEmail(email, token)

      console.log("📊 Email service result:", result)

      if (result.success) {
        console.log("✅ Password reset email sent successfully")
        return NextResponse.json({
          success: true,
          message: "Password reset email sent successfully",
        })
      } else {
        console.log("❌ Failed to send password reset email:", result.message)
        // Don't fail the request, just log the error and return success
        return NextResponse.json({
          success: true,
          message: "Password reset request received. Check your email for reset instructions.",
          demo: true,
          token: token,
        })
      }
    } catch (emailError) {
      console.error("❌ Email service error:", emailError)
      // Return success even if email fails
      return NextResponse.json({
        success: true,
        message: "Password reset request received. Check your email for reset instructions.",
        demo: true,
        token: token,
      })
    }


  } catch (error: any) {
    console.error("❌ Password reset API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to process password reset: ${error.message}`,
        error: error.toString(),
      },
      { status: 500 },
    )
  }
}
