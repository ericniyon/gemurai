import { NextRequest, NextResponse } from "next/server"
import { prisma, ensureDatabaseConnected } from "@/lib/database"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing database connection...")
    
    // Test connection
    try {
      await ensureDatabaseConnected()
      console.log("✅ Database connection ensured")
    } catch (connectionError) {
      console.error("❌ Database connection failed:", connectionError)
      return NextResponse.json({
        success: false,
        message: "Database connection failed",
        error: connectionError instanceof Error ? connectionError.message : "Unknown connection error",
        details: {
          name: connectionError instanceof Error ? connectionError.name : "Unknown",
          stack: connectionError instanceof Error ? connectionError.stack : "No stack trace"
        }
      }, { status: 503 })
    }
    
    // Test simple query
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`
      console.log("✅ Database query successful:", result)
      
      return NextResponse.json({
        success: true,
        message: "Database connection successful",
        data: result,
        timestamp: new Date().toISOString()
      })
    } catch (queryError) {
      console.error("❌ Database query failed:", queryError)
      return NextResponse.json({
        success: false,
        message: "Database query failed",
        error: queryError instanceof Error ? queryError.message : "Unknown query error",
        details: {
          name: queryError instanceof Error ? queryError.name : "Unknown",
          stack: queryError instanceof Error ? queryError.stack : "No stack trace"
        }
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error("❌ Unexpected error in db-connection test:", error)
    return NextResponse.json({
      success: false,
      message: "Unexpected error",
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        name: error instanceof Error ? error.name : "Unknown",
        stack: error instanceof Error ? error.stack : "No stack trace"
      }
    }, { status: 500 })
  }
}
