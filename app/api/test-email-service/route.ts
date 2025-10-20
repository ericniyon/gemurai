import { type NextRequest, NextResponse } from "next/server"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Dynamic import of email service
    const { sendPasswordResetEmail, sendTestEmail } = await import("@/lib/email-service.server")

    let result

    if (type === "password-reset") {
      console.log("🧪 Testing password reset email service directly")
      result = await sendPasswordResetEmail(email, "test-token-" + Date.now())
    } else {
      console.log("🧪 Testing basic email service")
      result = await sendTestEmail(email, "Email Service Test", "This is a direct test of the email service.")
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString(),
      testType: type || "basic",
    })
  } catch (error: any) {
    console.error("❌ Email service test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Email service test failed: ${error.message}`,
        error: error.toString(),
      },
      { status: 500 },
    )
  }
}
