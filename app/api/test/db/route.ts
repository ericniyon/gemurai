import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { Prisma } from "@prisma/client"

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
})

type TimestampResult = {
  now: Date
}

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Try a simple query
    const result = await prisma.$queryRaw<TimestampResult[]>`SELECT NOW() as now`
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      timestamp: result[0].now,
      database_url: process.env.DATABASE_URL ? "Set" : "Not set",
      direct_url: process.env.DIRECT_URL ? "Set" : "Not set"
    })
  } catch (error) {
    console.error('Database Connection Error:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      database_url: process.env.DATABASE_URL ? "Set" : "Not set",
      direct_url: process.env.DIRECT_URL ? "Set" : "Not set"
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 