import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  let prisma: PrismaClient | null = null
  
  try {
    console.log("🔍 Testing minimal database connection...")
    console.log("🔍 DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set")
    
    // Create a fresh Prisma client instance
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: ['query', 'error', 'warn']
    })
    
    console.log("✅ Prisma client created successfully")
    
    // Test connection
    console.log("🔌 Attempting to connect...")
    await prisma.$connect()
    console.log("✅ Database connected successfully")
    
    // Test simple query
    console.log("🔍 Testing simple query...")
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`
    console.log("✅ Database query successful:", result)
    
    return NextResponse.json({
      success: true,
      message: "Minimal database connection successful",
      data: result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("❌ Minimal database connection failed:", error)
    return NextResponse.json({
      success: false,
      message: "Minimal database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        name: error instanceof Error ? error.name : "Unknown",
        stack: error instanceof Error ? error.stack : "No stack trace"
      }
    }, { status: 500 })
  } finally {
    // Clean up
    if (prisma) {
      try {
        await prisma.$disconnect()
        console.log("✅ Database disconnected successfully")
      } catch (disconnectError) {
        console.error("❌ Error disconnecting:", disconnectError)
      }
    }
  }
}
