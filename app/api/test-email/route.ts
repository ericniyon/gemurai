import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Test email API called")

    // Dynamic import of email service
    const { sendTestEmail } = await import("@/lib/email-service.server")

    const testEmail = "niyoeri6@gmail.com"
    const subject = "Gemurai Test Email"
    const content = "This is a test email from Gemurai platform to verify email functionality."

    console.log(`📧 Sending test email to: ${testEmail}`)

    const result = await sendTestEmail(testEmail, subject, content)

    console.log("📊 Test email result:", result)

    if (result.success) {
      console.log("✅ Test email sent successfully")
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully to niyoeri6@gmail.com",
        email: testEmail,
      })
    } else {
      console.log("❌ Failed to send test email:", result.message)
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          email: testEmail,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("❌ Test email API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to send test email: ${error.message}`,
        error: error.toString(),
      },
      { status: 500 }
    )
  }
} 