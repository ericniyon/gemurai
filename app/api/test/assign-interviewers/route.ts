import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Assigning interviewers to application...")
    
    const { applicationId, interviewerIds } = await request.json()

    if (!applicationId || !interviewerIds || !Array.isArray(interviewerIds)) {
      return NextResponse.json({
        success: false,
        message: "Application ID and interviewer IDs array are required"
      }, { status: 400 })
    }

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    })

    if (!application) {
      return NextResponse.json({
        success: false,
        message: "Application not found"
      }, { status: 404 })
    }

    // Check if interviewers exist and have EMPLOYER role
    const interviewers = await prisma.user.findMany({
      where: {
        id: { in: interviewerIds },
        roleAssignments: {
          some: {
            role: { name: "EMPLOYER" },
            isActive: true
          }
        }
      }
    })

    if (interviewers.length !== interviewerIds.length) {
      return NextResponse.json({
        success: false,
        message: "One or more interviewers not found or don't have proper permissions"
      }, { status: 400 })
    }

    // Create interview records
    const interviews = await Promise.all(
      interviewerIds.map(interviewerId =>
        prisma.applicationInterview.create({
          data: {
            applicationId,
            interviewerId,
            status: "SCHEDULED"
          }
        })
      )
    )

    console.log("✅ Interviewers assigned successfully")

    return NextResponse.json({
      success: true,
      message: "Interviewers assigned successfully",
      interviews
    })

  } catch (error) {
    console.error("❌ Error assigning interviewers:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to assign interviewers",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 