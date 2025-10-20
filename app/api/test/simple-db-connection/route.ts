import { NextRequest, NextResponse } from "next/server"
import { prisma, ensureDatabaseConnected } from "@/lib/database-simple"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing simple database connection...")
    
    // Test connection
    try {
      await ensureDatabaseConnected()
      console.log("✅ Simple database connection successful")
    } catch (connectionError) {
      console.error("❌ Simple database connection failed:", connectionError)
      return NextResponse.json({
        success: false,
        message: "Simple database connection failed",
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
      console.log("✅ Simple database query successful:", result)
      
      return NextResponse.json({
        success: true,
        message: "Simple database connection successful",
        data: result,
        timestamp: new Date().toISOString()
      })
    } catch (queryError) {
      console.error("❌ Simple database query failed:", queryError)
      return NextResponse.json({
        success: false,
        message: "Simple database query failed",
        error: queryError instanceof Error ? queryError.message : "Unknown query error",
        details: {
          name: queryError instanceof Error ? queryError.name : "Unknown",
          stack: queryError instanceof Error ? queryError.stack : "No stack trace"
        }
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error("❌ Unexpected error in simple-db-connection test:", error)
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
