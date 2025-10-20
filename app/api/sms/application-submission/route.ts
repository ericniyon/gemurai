import { NextResponse } from "next/server"
import twilio from "twilio"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // Initialize Twilio client only when handling requests
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    // Validate Twilio credentials
    if (!accountSid?.startsWith("AC") || !authToken) {
      console.error("Invalid or missing Twilio credentials")
      return NextResponse.json(
        { success: false, message: "SMS service not properly configured" },
        { status: 500 }
      )
    }

    // Initialize Twilio client
    const twilioClient = twilio(accountSid, authToken)

    const body = await request.json()
    const { applicationId, phone } = body

    // Validate inputs
    if (!applicationId || !phone) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Format phone number for Rwanda
    const formattedNumber = phone.startsWith("+") ? phone : `+250${phone.replace(/[^0-9]/g, "")}`

    // Prepare message
    const message = `Your application (ID: ${applicationId}) has been successfully submitted. We will review it and get back to you soon.`

    // Send SMS
    const result = await twilioClient.messages.create({
      body: message,
      to: formattedNumber,
      from: process.env.TWILIO_PHONE_NUMBER || "Gemurai"
    })

    return NextResponse.json({
      success: true,
      message: "Application submission SMS sent successfully",
      data: { messageId: result.sid }
    })
  } catch (error: any) {
    console.error("Error sending application submission SMS:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send application submission SMS" },
      { status: 500 }
    )
  }
}