import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Email configuration check requested")

    // Dynamic import of email service
    const { checkEmailConfiguration } = await import("@/lib/email-service.server")
    
    const config = checkEmailConfiguration()
    
    console.log("📊 Email configuration:", config)

    return NextResponse.json(config)
  } catch (error: any) {
    console.error("❌ Email configuration check error:", error)
    return NextResponse.json(
      {
        configured: false,
        issues: ["Failed to check email configuration"],
        recommendations: ["Check server logs for more details"],
      },
      { status: 500 }
    )
  }
} 