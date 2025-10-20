import { type NextRequest, NextResponse } from "next/server"
import { sendApplicationSubmissionEmail } from "@/lib/email-service"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ success: false, message: "Email and name are required" }, { status: 400 })
    }

    const result = await sendApplicationSubmissionEmail(email, name)

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ success: false, message: `Test email failed: ${error.message}` }, { status: 500 })
  }
}
