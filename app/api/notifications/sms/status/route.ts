import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const messageId = data.get("MessageSid")
    const status = data.get("MessageStatus")

    // Log the status update
    console.log(`SMS ${messageId} status updated to: ${status}`)

    return NextResponse.json({
      success: true,
      message: "Status update received",
      data: { messageId, status }
    })
  } catch (error: any) {
    console.error("Error handling SMS status callback:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process status update" },
      { status: 500 }
    )
  }
} 