import { NextResponse } from 'next/server';
import twilio from 'twilio';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

    const body = await request.json();
    const { to, message } = body;

    // Validate inputs
    if (!to || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format phone number for Rwanda
    const formattedNumber = to.startsWith("+") ? to : `+250${to.replace(/[^0-9]/g, "")}`;

    // Send SMS
    const result = await twilioClient.messages.create({
      body: message,
      to: formattedNumber,
      from: process.env.TWILIO_PHONE_NUMBER || "Gemurai"
    });

    return NextResponse.json({
      success: true,
      message: "SMS sent successfully",
      data: { messageId: result.sid }
    });
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send SMS" },
      { status: 500 }
    );
  }
} 