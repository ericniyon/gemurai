import { type NextRequest, NextResponse } from "next/server"
export const runtime = "nodejs"
import twilio from "twilio"

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json()

    if (!phone || !message) {
      return NextResponse.json({ success: false, message: "Phone and message are required" }, { status: 400 })
    }

    // Check Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    console.log('📱 Twilio: Checking configuration:', {
      hasSid: !!accountSid,
      hasToken: !!authToken,
      hasPhone: !!fromNumber,
      sid: accountSid?.substring(0, 5) + '...',
    })

    if (!accountSid || !authToken || !fromNumber) {
      console.error('❌ Twilio: Missing configuration')
      return NextResponse.json({ 
        success: false, 
        message: "SMS service not configured properly",
        details: {
          hasSid: !!accountSid,
          hasToken: !!authToken,
          hasPhone: !!fromNumber
        }
      }, { status: 500 })
    }

    // Initialize Twilio client
    const twilioClient = twilio(accountSid, authToken)

    // Format phone number for international use (Rwanda: +250)
    const formattedPhone = phone.startsWith("+") ? phone : `+250${phone.replace(/^0/, "")}`
    console.log('📱 Twilio: Sending SMS to:', formattedPhone)

    // Send the message
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: formattedPhone,
    })

    console.log('📱 Twilio: Message sent successfully:', twilioMessage.sid)

    return NextResponse.json({
      success: true,
      message: "Custom SMS sent successfully!",
      sid: twilioMessage.sid,
    })
  } catch (error: any) {
    console.error('❌ Twilio Error:', {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo
    })

    // Handle specific Twilio errors
    if (error.code === 20003) {
      return NextResponse.json({ 
        success: false, 
        message: "Authentication failed. Please check Twilio credentials.",
        error: error.message
      }, { status: 401 })
    } else if (error.code === 21211) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid phone number format",
        error: error.message
      }, { status: 400 })
    } else if (error.code === 21608) {
      return NextResponse.json({ 
        success: false, 
        message: "Phone number not verified with Twilio",
        error: error.message
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: false, 
      message: "Failed to send SMS",
      error: error.message
    }, { status: 500 })
  }
}
