import { NextRequest, NextResponse } from "next/server"
import { withDatabase, testDatabaseConnection } from "@/lib/db-utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing database utility...")
    
    // Test connection
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        message: "Database connection test failed",
        error: connectionTest.message
      }, { status: 503 })
    }
    
    // Test with database utility
    const result = await withDatabase(async (prisma) => {
      return await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`
    })
    
    console.log("✅ Database utility test successful:", result)
    
    return NextResponse.json({
      success: true,
      message: "Database utility working correctly",
      data: result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("❌ Database utility test failed:", error)
    return NextResponse.json({
      success: false,
      message: "Database utility test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        name: error instanceof Error ? error.name : "Unknown",
        stack: error instanceof Error ? error.stack : "No stack trace"
      }
    }, { status: 500 })
  }
}
