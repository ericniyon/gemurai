import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Initialize Twilio client only when handling requests
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    // Validate Twilio credentials
    if (!accountSid?.startsWith("AC") || !authToken) {
      console.error("Invalid or missing Twilio credentials");
      return NextResponse.json(
        { success: false, message: "SMS service not properly configured" },
        { status: 500 }
      );
    }

    // Initialize Twilio client
    const twilioClient = twilio(accountSid, authToken);

    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    // Generate a test application ID
    const testAppId = `APP-TEST-${Date.now()}`;
    
    // Create test message
    const message = `Your application (ID: ${testAppId}) has been successfully submitted. We will review it and get back to you soon.`;

    // Format phone number for Rwanda
    const formattedNumber = phone.startsWith("+") ? phone : `+250${phone.replace(/[^0-9]/g, "")}`;

    // Send SMS
    const result = await twilioClient.messages.create({
      body: message,
      to: formattedNumber,
      from: process.env.TWILIO_PHONE_NUMBER || "Gemurai"
    });

    return NextResponse.json({
      success: true,
      message: "Test SMS sent successfully",
      data: {
        applicationId: testAppId,
        phone: formattedNumber,
        smsMessage: message,
        messageId: result.sid,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("Test SMS error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to send test SMS"
      },
      { status: 500 }
    );
  }
}
