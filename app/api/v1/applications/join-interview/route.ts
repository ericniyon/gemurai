import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"

// POST /api/v1/applications/join-interview
// Allows EMPLOYER users to assign interviewers to interviews
export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Assign interviewers API called")
    
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

    // Check if user has EMPLOYER or INTERVIEWER role
    if (user.role !== "EMPLOYER" && user.role !== "INTERVIEWER") {
      console.log("❌ Access denied - not employer or interviewer")
      return NextResponse.json(
        { success: false, message: "Access denied. Only EMPLOYER or INTERVIEWER can access this endpoint." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { applicationId, interviewerIds } = body

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      )
    }

    // Handle different user roles
    if (user.role === "EMPLOYER") {
      // EMPLOYER can either assign multiple interviewers OR join themselves
      if (interviewerIds && Array.isArray(interviewerIds) && interviewerIds.length > 0) {
        // If interviewerIds is provided, validate it's either multiple interviewers or the current user
        if (interviewerIds.length > 2) {
          return NextResponse.json(
            { success: false, message: "Maximum 2 interviewers can be assigned" },
            { status: 400 }
          )
        }
        
        // If it's just the current user, treat it as joining
        if (interviewerIds.length === 1 && interviewerIds[0] === user.id) {
          // EMPLOYER joining themselves
          body.interviewerIds = [user.id]
        }
        // If it's multiple interviewers, treat it as assignment (existing logic)
      } else {
        // If no interviewerIds provided, use current user (joining)
        body.interviewerIds = [user.id]
      }
    } else if (user.role === "INTERVIEWER") {
      // INTERVIEWER can only join themselves
      if (interviewerIds && Array.isArray(interviewerIds) && interviewerIds.length > 0) {
        // If interviewerIds is provided, validate it's the current user
        if (interviewerIds.length !== 1 || interviewerIds[0] !== user.id) {
          return NextResponse.json(
            { success: false, message: "Interviewers can only join themselves" },
            { status: 400 }
          )
        }
      } else {
        // If no interviewerIds provided, use current user
        body.interviewerIds = [user.id]
      }
    }

    console.log("✅ Employer authenticated, processing interviewer assignment for application:", applicationId)

    // Check if application exists and is invited to interview
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      console.log("❌ Application not found")
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    if (application.status !== "INTERVIEW_INVITED") {
      console.log("❌ Application not invited to interview")
      return NextResponse.json(
        { success: false, message: "Application is not invited to interview" },
        { status: 400 }
      )
    }

    // Check if interviews already exist for this application
    const existingInterviews = await prisma.applicationInterview.findMany({
      where: { applicationId: applicationId }
    })

    if (user.role === "EMPLOYER") {
      // EMPLOYER can only assign if no interviews exist yet, OR join if slots available
      if (existingInterviews.length > 0) {
        // Check if this is a join operation (single user joining)
        const finalInterviewerIds = body.interviewerIds || interviewerIds
        if (finalInterviewerIds.length === 1 && finalInterviewerIds[0] === user.id) {
          // EMPLOYER trying to join - check if slots available and not already joined
          if (existingInterviews.length >= 2) {
            console.log("❌ No available slots for this interview")
            return NextResponse.json(
              { success: false, message: "No available slots for this interview" },
              { status: 409 }
            )
          }

          // Check if current user already joined
          const userAlreadyJoined = existingInterviews.some(interview => interview.interviewerId === user.id)
          if (userAlreadyJoined) {
            console.log("❌ User already joined this interview")
            return NextResponse.json(
              { success: false, message: "You have already joined this interview" },
              { status: 409 }
            )
          }
        } else {
          // EMPLOYER trying to assign multiple interviewers when some already exist
          console.log("❌ Interviewers already assigned to this application")
          return NextResponse.json(
            { success: false, message: "Interviewers already assigned to this application" },
            { status: 409 }
          )
        }
      }
    } else if (user.role === "INTERVIEWER") {
      // INTERVIEWER can join if there are available slots and they haven't joined yet
      if (existingInterviews.length >= 2) {
        console.log("❌ No available slots for this interview")
        return NextResponse.json(
          { success: false, message: "No available slots for this interview" },
          { status: 409 }
        )
      }

      // Check if current user already joined
      const userAlreadyJoined = existingInterviews.some(interview => interview.interviewerId === user.id)
      if (userAlreadyJoined) {
        console.log("❌ User already joined this interview")
        return NextResponse.json(
          { success: false, message: "You have already joined this interview" },
          { status: 409 }
        )
      }
    }

    // Get the final interviewer IDs to use
    const finalInterviewerIds = body.interviewerIds || interviewerIds

    // Verify that all interviewer IDs are valid users with INTERVIEWER or EMPLOYER role
    const interviewers = await prisma.user.findMany({
      where: {
        id: { in: finalInterviewerIds },
        userRole: {
          role: {
            name: { in: ["INTERVIEWER", "EMPLOYER"] }
          }
        }
      }
    })

    if (interviewers.length !== finalInterviewerIds.length) {
      console.log("❌ Some interviewer IDs are invalid or users don't have INTERVIEWER or EMPLOYER role")
      return NextResponse.json(
        { success: false, message: "Some interviewer IDs are invalid or users don't have INTERVIEWER or EMPLOYER role" },
        { status: 400 }
      )
    }

    console.log(`✅ Found ${interviewers.length} valid interviewers`)

    // Create interview assignments for each interviewer
    const interviewAssignments = await Promise.all(
      interviewers.map(async (interviewer) => {
        return await prisma.applicationInterview.create({
          data: {
            applicationId: applicationId,
            interviewerId: interviewer.id,
            status: "SCHEDULED",
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            notes: user.role === "EMPLOYER" ? "Interviewer assigned by employer" : "Interviewer joined interview"
          },
          include: {
            interviewer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })
      })
    )

    console.log("✅ Interview assignments created:", interviewAssignments.length)
    console.log("👤 User role:", user.role)
    console.log("🔍 Final interviewer IDs:", body.interviewerIds || interviewerIds)
    console.log("🔍 Is single user join:", (body.interviewerIds?.length === 1 && body.interviewerIds[0] === user.id))

    const message = user.role === "EMPLOYER" 
      ? (body.interviewerIds?.length === 1 && body.interviewerIds[0] === user.id)
        ? "Successfully joined interview"
        : `Successfully assigned ${interviewAssignments.length} interviewer(s) to interview`
      : "Successfully joined interview"

    console.log("📝 Success message:", message)

    return NextResponse.json({ 
      success: true, 
      message: message,
      interviews: interviewAssignments
    })

  } catch (error) {
    console.error("❌ Error assigning interviewers:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/v1/applications/join-interview?applicationId=xxx
// Get interview status for an application
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Get interview status API called")
    
    // Verify authentication
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

    if (!user) {
      console.log("❌ Invalid token")
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 400 }
      )
    }

    const url = new URL(request.url)
    const applicationId = url.searchParams.get('applicationId')

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      )
    }

    // Check if application exists and is invited to interview
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      console.log("❌ Application not found")
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    if (application.status !== "INTERVIEW_INVITED") {
      console.log("❌ Application not invited to interview")
      return NextResponse.json(
        { success: false, message: "Application is not invited to interview" },
        { status: 400 }
      )
    }

    // Get all interviews for this application
    const interviews = await prisma.applicationInterview.findMany({
      where: { applicationId: applicationId },
      include: {
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // For EMPLOYER users, also get available interviewers
    let availableInterviewers = []
    if (user.role === "EMPLOYER") {
      availableInterviewers = await prisma.user.findMany({
        where: {
          userRole: {
            role: {
              name: "INTERVIEWER"
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
    }

    const remainingSlots = 2 - interviews.length

    return NextResponse.json({ 
      success: true, 
      interviews: interviews,
      remainingSlots: Math.max(0, remainingSlots),
      canAssign: user.role === "EMPLOYER" && interviews.length === 0,
      availableInterviewers: availableInterviewers
    })

  } catch (error) {
    console.error("❌ Error getting interview status:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 