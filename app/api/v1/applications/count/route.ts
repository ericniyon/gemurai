import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    await prisma.$connect()

    // Count applications using Prisma
    const count = await prisma.application.count()

    return NextResponse.json({
      success: true,
      count,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error counting applications:", error)

    // Return detailed error information for debugging
    return NextResponse.json(
      {
        success: false,
        message: "Failed to count applications",
        error: error.message,
        details: {
          name: error.name,
          code: error.code,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
