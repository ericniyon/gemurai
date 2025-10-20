import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// POST /api/v1/applications/invite-to-interview
// Allows EMPLOYER users to invite applications to interviews
export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Invite-to-interview API called")
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")
    console.log("🍪 Token found:", !!token)
    if (!token) {
      console.log("❌ No token found")
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    const user = await verifyAuthToken(token.value)
    console.log("👤 User verified:", user?.role)
    if (!user) {
      console.log("❌ Invalid token")
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      )
    }
    // Check if user has EMPLOYER role
    if (user.role !== "EMPLOYER") {
      console.log("❌ Access denied - not employer")
      return NextResponse.json(
        { success: false, message: "Access denied. Only EMPLOYER can invite to interviews." },
        { status: 403 }
      )
    }
    const { applicationId } = await request.json()
    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      )
    }
    console.log("✅ Employer authenticated, processing interview invitation for application:", applicationId)
    // Since database application ID is the same as Apps Script ID, find directly by ID
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })
    if (!application) {
      console.log("❌ Application not found in database:", applicationId)
      return NextResponse.json(
        { success: false, message: "Application not found in database" },
        { status: 404 }
      )
    }
    console.log("✅ Found application in database:", application.id)
    console.log("✅ Application status:", application.status)
    // Use the application ID directly (same as Apps Script ID)
    const databaseApplicationId = application.id
    console.log("🔄 Using application ID:", databaseApplicationId)
    // Check if interview already exists for this application
    const existingInterview = await prisma.applicationInterview.findFirst({
      where: { applicationId: databaseApplicationId }
    })
    if (existingInterview) {
      console.log("✅ Interview already exists, returning existing interview")
      return NextResponse.json({ 
        success: true, 
        message: "Interview already exists",
        interview: existingInterview
      })
    }
    // Get available interviewers (first 2 available)
    const interviewers = await prisma.user.findMany({
      where: {
        userRole: {
          role: {
            name: "INTERVIEWER"
          }
        }
      },
      take: 2,
      orderBy: {
        createdAt: 'asc'
      }
    })
    if (interviewers.length === 0) {
      console.log("❌ No interviewers available")
      return NextResponse.json(
        { success: false, message: "No interviewers available" },
        { status: 400 }
      )
    }
    console.log(`✅ Found ${interviewers.length} interviewers`)
    // Create interview assignments for each interviewer
    const interviewAssignments = await Promise.all(
      interviewers.map(async (interviewer) => {
        return await prisma.applicationInterview.create({
          data: {
            applicationId: databaseApplicationId,
            interviewerId: interviewer.id,
            status: "SCHEDULED",
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            notes: "Interview scheduled by employer"
          }
        })
      })
    )
    console.log("✅ Interview assignments created:", interviewAssignments.length)
    // Update application status to INTERVIEW_INVITED
    console.log("🔄 Updating application status to INTERVIEW_INVITED")
    const updatedApplication = await prisma.application.update({
      where: { id: databaseApplicationId },
      data: { 
        status: "INTERVIEW_INVITED",
        updatedAt: new Date()
      }
    })
    console.log("✅ Application status updated to:", updatedApplication.status)
    return NextResponse.json({ 
      success: true, 
      message: `Successfully invited application to interview with ${interviewers.length} interviewer(s) and updated status to INTERVIEW_INVITED`,
      interviews: interviewAssignments,
      applicationStatus: updatedApplication.status
    })
  } catch (error) {
    console.error("❌ Error inviting to interview:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 