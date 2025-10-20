import { type NextRequest, NextResponse } from "next/server"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ success: false, message: "Email and name are required" }, { status: 400 })
    }

    // Dynamic import of email service
    const { sendApplicationSubmissionEmail } = await import("@/lib/email-service.server")
    const result = await sendApplicationSubmissionEmail(email, name)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Application submission email API error:", error)
    return NextResponse.json(
      { success: false, message: `Failed to send application submission email: ${error.message}` },
      { status: 500 },
    )
  }
}
