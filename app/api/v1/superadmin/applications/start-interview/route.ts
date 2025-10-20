import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// POST /api/v1/superadmin/applications/start-interview
export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Assign Interviewers API called")
    
    // Verify superadmin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      console.log("❌ No token found")
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)
    console.log("👤 User verified:", user?.role)

    if (!user || user.role !== "SUPER_ADMIN") {
      console.log("❌ Access denied - not super admin")
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { applicationId } = body

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      )
    }

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    })

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    // Get available interviewers (EMPLOYER role or specific interviewers)
    const availableInterviewers = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          {
            roleAssignments: {
              some: {
                role: {
                  name: "EMPLOYER"
                },
                isActive: true
              }
            }
          },
          {
            email: {
              in: ["interviewer1@djyh.rw", "interviewer2@djyh.rw"]
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: { name: 'asc' }
    })

    if (availableInterviewers.length < 2) {
      return NextResponse.json(
        { success: false, message: "At least 2 interviewers are required" },
        { status: 400 }
      )
    }

    // Select the first 2 interviewers
    const selectedInterviewers = availableInterviewers.slice(0, 2)

    // Check if interviews already exist for this application
    const existingInterviews = await prisma.applicationInterview.findMany({
      where: { applicationId },
      include: {
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        application: {
          select: {
            id: true,
            email: true,
            phone: true
          }
        }
      }
    })

    // If interviews already exist, return them instead of creating new ones
    if (existingInterviews.length > 0) {
      console.log(`✅ Found ${existingInterviews.length} existing interview assignments for application ${applicationId}`)
      return NextResponse.json({
        success: true,
        message: `Found ${existingInterviews.length} existing interview assignments`,
        interviews: existingInterviews.map(interview => ({
          id: interview.id,
          status: interview.status,
          scheduledDate: interview.scheduledDate,
          interviewer: interview.interviewer,
          application: interview.application
        }))
      })
    }

    // Create interview assignments for both interviewers (not started yet)
    const createdInterviews = []
    
    for (const interviewer of selectedInterviewers) {
      const interview = await prisma.applicationInterview.create({
        data: {
          applicationId,
          interviewerId: interviewer.id,
          scheduledDate: new Date(), // Set to current date but not started
          status: "SCHEDULED", // Not started yet, just assigned
          notes: "Application assigned to interviewer by super admin"
        },
        include: {
          interviewer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          application: {
            select: {
              id: true,
              email: true,
              phone: true
            }
          }
        }
      })
      
      createdInterviews.push(interview)
      console.log(`✅ Application assigned to interviewer ${interviewer.email}`)
    }

    console.log(`✅ Successfully assigned application ${applicationId} to ${createdInterviews.length} interviewers`)

    // Update application status to INTERVIEW_INVITED
    console.log("🔄 Updating application status to INTERVIEW_INVITED")
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { 
        status: "INTERVIEW_INVITED",
        updatedAt: new Date()
      }
    })

    console.log("✅ Application status updated to:", updatedApplication.status)

    return NextResponse.json({
      success: true,
      message: `Successfully assigned application to ${createdInterviews.length} interviewers and updated status to INTERVIEW_INVITED`,
      interviews: createdInterviews.map(interview => ({
        id: interview.id,
        status: interview.status,
        scheduledDate: interview.scheduledDate,
        interviewer: interview.interviewer,
        application: interview.application
      })),
      applicationStatus: updatedApplication.status
    })

  } catch (error) {
    console.error("❌ Error assigning interviewers:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 