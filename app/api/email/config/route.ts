import { type NextRequest, NextResponse } from "next/server"
export const runtime = "nodejs"

export async function GET() {
  try {
    // Dynamic import of email service
    const { checkEmailConfiguration } = await import("@/lib/email-service.server")
    const config = checkEmailConfiguration()

    return NextResponse.json({
      ...config,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        configured: false,
        issues: [`Configuration check failed: ${error.message}`],
        recommendations: [],
        error: error.message,
      },
      { status: 500 },
    )
  }
}
