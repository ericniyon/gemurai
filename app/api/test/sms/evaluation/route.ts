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

    const { phone, name, score } = await request.json()

    if (!phone || !name || score === undefined) {
      return NextResponse.json(
        { success: false, message: "Phone, name and score are required" },
        { status: 400 }
      )
    }

    // Format phone number for Rwanda
    const formattedNumber = phone.startsWith("+") ? phone : `+250${phone.replace(/[^0-9]/g, "")}`

    const message = `Hello ${name}, your evaluation score is ${score}. Thank you for participating!`

    // Send SMS
    const result = await twilioClient.messages.create({
      body: message,
      to: formattedNumber,
      from: process.env.TWILIO_PHONE_NUMBER || "Gemurai"
    })

    return NextResponse.json({
      success: true,
      message: "Evaluation SMS sent successfully",
      data: { messageId: result.sid }
    })
  } catch (error: any) {
    console.error("Evaluation SMS error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send evaluation SMS" },
      { status: 500 }
    )
  }
}
