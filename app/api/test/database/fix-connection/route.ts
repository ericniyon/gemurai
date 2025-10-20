import { NextResponse } from "next/server"
import { neonConfig } from "@neondatabase/serverless"
import { testDatabaseConnection } from "@/lib/database"

export const runtime = "nodejs"

export async function POST() {
  try {
    // Apply fixes to Neon configuration
    neonConfig.fetchConnectionCache = true
    neonConfig.wsProxy = (host) => `${host}:5432/v1`
    neonConfig.useSecureWebSocket = true
    neonConfig.pipelineConnect = false

    // Test if the connection works after fixes
    const connected = await testDatabaseConnection()

    return NextResponse.json({
      success: connected,
      message: connected ? "Connection fixed successfully" : "Attempted fixes but connection still failing",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
