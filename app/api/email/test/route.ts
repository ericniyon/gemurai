import { type NextRequest, NextResponse } from "next/server"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { to, subject, content } = await request.json()

    if (!to) {
      return NextResponse.json({ success: false, message: "Recipient email is required" }, { status: 400 })
    }

    // Dynamic import of email service
    const { sendTestEmail } = await import("@/lib/email-service.server")
    const result = await sendTestEmail(to, subject, content)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Test email API error:", error)
    return NextResponse.json(
      { success: false, message: `Failed to send test email: ${error.message}` },
      { status: 500 },
    )
  }
}
