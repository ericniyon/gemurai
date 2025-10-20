import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Count applications in the database
    const count = await prisma.application.count()

    // Get the most recent 5 applications
    const recentApplications = await prisma.application.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        phone: true,
        status: true,
        currentStep: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      count,
      recentApplications,
      message: count > 0 ? `Found ${count} applications in the database` : "No applications found in the database",
    })
  } catch (error: any) {
    console.error("Database application count error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to count applications",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
