import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching available interviewers...")
    
    // Get users with EMPLOYER role
    const interviewers = await prisma.user.findMany({
      where: {
        roleAssignments: {
          some: {
            role: {
              name: "EMPLOYER"
            },
            isActive: true
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      interviewers
    })

  } catch (error) {
    console.error("❌ Error fetching interviewers:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to fetch interviewers",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 