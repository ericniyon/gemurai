import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching interview criteria...")
    
    const criteria = await prisma.interviewCriteria.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        maxScore: true,
        weight: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      criteria
    })

  } catch (error) {
    console.error("❌ Error fetching interview criteria:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to fetch interview criteria",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 