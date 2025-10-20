import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Load environment variables
    const envVars = {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? 
        process.env.TWILIO_ACCOUNT_SID.substring(0, 10) + '...' : 'NOT SET',
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET',
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.substring(0, 20) + '...' : 'NOT SET'
    };

    console.log('🔍 Environment variables in API context:');
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    return NextResponse.json({
      success: true,
      message: "Environment variables check",
      data: envVars,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to check environment variables",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 