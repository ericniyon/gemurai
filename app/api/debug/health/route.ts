import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "unknown"
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Server health check failed",
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {
  // Also allow POST requests for testing
  return GET()
} 