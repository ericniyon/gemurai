import { NextRequest, NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/v1/superadmin/applications
// RETURNS ALL APPLICATIONS - NO FILTERS, NO PAGINATION, NO LIMITS
// OR GET SINGLE APPLICATION IF ID PROVIDED IN QUERY PARAM
export async function GET(request: NextRequest) {
  try {
    // Check if this is a request for a single application
    const url = new URL(request.url)
    const applicationId = url.searchParams.get('id')
    
    console.log("🔍 Applications API called", applicationId ? `for ID: ${applicationId}` : "for all applications")
    
    // Verify superadmin authentication
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

    if (!user || user.role !== "SUPER_ADMIN") {
      console.log("❌ Access denied - not super admin")
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    // Handle single application request
    if (applicationId) {
      console.log("✅ Super admin authenticated, fetching single application:", applicationId)
      
      const application = await prisma.$queryRaw`
        SELECT 
          id,
          "userId",
          phone,
          email,
          status,
          "formData",
          "nationalId",
          "currentStep",
          notes,
          "dccCreated",
          application_score as "applicationScore",
          vulnerability_category as "vulnerabilityCategory",
          "createdAt",
          "updatedAt"
        FROM applications
        WHERE id = ${applicationId}
      ` as any[]

      const app = application[0]

      if (!app) {
        console.log("❌ Application not found:", applicationId)
        return NextResponse.json(
          { success: false, message: "Application not found" },
          { status: 404 }
        )
      }

      // Get interviews for this application
      const interviews = await prisma.applicationInterview.findMany({
        where: { applicationId: applicationId },
        include: {
          interviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          scores: {
            include: {
              criteria: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      console.log("✅ Application found:", app.id)
      return NextResponse.json({ 
        success: true, 
        application: {
          ...app,
          interviews: interviews
        }
      })
    }

    console.log("✅ Super admin authenticated, fetching ALL applications...")

    // CRITICAL: Return ALL applications from database
    // NO WHERE clause = NO FILTERS
    // NO skip/take = NO PAGINATION  
    // NO limits = ALL RECORDS
    // Use raw SQL to avoid Prisma client field recognition issues
    const applications = await prisma.$queryRaw`
      SELECT 
        a.id,
        a."userId",
        a.phone,
        a.email,
        a.status,
        a."formData",
        a."nationalId",
        a."currentStep",
        a.notes,
        a."dccCreated",
        a.application_score as "applicationScore",
        a.vulnerability_category as "vulnerabilityCategory",
        a."createdAt",
        a."updatedAt"
      FROM applications a
      ORDER BY a."createdAt" DESC
    ` as any[]

    // Get user data for each application
    const userIds = applications.map(app => app.userId).filter(Boolean)
    const users = userIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        name: true,
        userRole: {
          select: {
            role: {
              select: {
                name: true
              }
            }
          }
        }
      }
    }) : []

    // Get evaluations for each application
    const applicationIds = applications.map(app => app.id)
    const evaluations = applicationIds.length > 0 ? await prisma.applicationEvaluation.findMany({
      where: { applicationId: { in: applicationIds } },
      select: {
        applicationId: true,
        id: true,
        type: true,
        score: true,
        questionScores: true,
        metadata: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    }) : []

    // Get interviews for each application
    const interviews = applicationIds.length > 0 ? await prisma.applicationInterview.findMany({
      where: { applicationId: { in: applicationIds } },
      select: {
        applicationId: true,
        id: true,
        status: true,
        createdAt: true,
        interviewer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) : []

    // Create lookup maps
    const usersMap = new Map(users.map(user => [user.id, user]))
    const evaluationsMap = new Map()
    const interviewsMap = new Map()

    evaluations.forEach(evaluation => {
      if (!evaluationsMap.has(evaluation.applicationId)) {
        evaluationsMap.set(evaluation.applicationId, [])
      }
      evaluationsMap.get(evaluation.applicationId).push(evaluation)
    })

    interviews.forEach(interview => {
      if (!interviewsMap.has(interview.applicationId)) {
        interviewsMap.set(interview.applicationId, [])
      }
      interviewsMap.get(interview.applicationId).push(interview)
    })

    // Combine all data
    const applicationsWithRelations = applications.map(app => ({
      ...app,
      user: app.userId ? usersMap.get(app.userId) || null : null,
      evaluations: evaluationsMap.get(app.id) || [],
      interviews: interviewsMap.get(app.id) || []
    }))

    console.log(`📊 Found ${applicationsWithRelations.length} applications`)
    console.log("📋 Applications:", applicationsWithRelations.map(app => ({
      id: app.id,
      user: app.user?.email,
      status: app.status,
      interviewsCount: app.interviews?.length || 0,
      applicationScore: app.applicationScore
    })))

    // Transform applications data for consistent response format
    const transformedApplications = applicationsWithRelations.map(app => ({
      id: app.id,
      userId: app.userId,
      phone: app.phone,
      email: app.email,
      status: app.status,
      formData: app.formData,
      nationalId: app.nationalId,
      currentStep: app.currentStep,
      notes: app.notes,
      dccCreated: app.dccCreated,
      applicationScore: app.applicationScore,
      vulnerabilityCategory: app.vulnerabilityCategory,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      user: app.user ? {
        id: app.user.id,
        email: app.user.email,
        name: app.user.name,
        role: app.user.userRole?.role?.name
      } : null,
      evaluations: app.evaluations || [],
      interviews: app.interviews || []
    }))

    console.log(`✅ RETURNING ALL ${transformedApplications.length} APPLICATIONS - NO FILTERS APPLIED`)

    return NextResponse.json({ 
      success: true, 
      applications: transformedApplications,
      total: transformedApplications.length,
      message: `Retrieved ALL ${transformedApplications.length} applications from database without any filters, pagination, or limits`,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error("❌ Error fetching applications:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/v1/superadmin/applications (for creating interviews)
// Usage: POST /api/v1/superadmin/applications?action=create-interview
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    
    console.log(`🔍 POST request, action: ${action}`)
    
    if (action !== 'create-interview') {
      return NextResponse.json(
        { success: false, message: "Invalid action. Only 'create-interview' is supported." },
        { status: 400 }
      )
    }
    
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
      console.log("❌ Access denied - not superadmin")
      return NextResponse.json(
        { success: false, message: "Access denied. Only SUPER_ADMIN can create interviews." },
        { status: 403 }
      )
    }

    const { applicationId, interviewerId, scheduledDate, notes } = await request.json()

    if (!applicationId || !interviewerId || !scheduledDate) {
      return NextResponse.json(
        { success: false, message: "Application ID, interviewer ID, and scheduled date are required" },
        { status: 400 }
      )
    }

    // Check if application exists
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

    // Check if interviewer exists
    const interviewer = await prisma.user.findUnique({
      where: { id: interviewerId },
    })

    if (!interviewer) {
      console.log("❌ Interviewer not found")
      return NextResponse.json(
        { success: false, message: "Interviewer not found" },
        { status: 404 }
      )
    }

    // Check if interview already exists for this application and interviewer
    const existingInterview = await prisma.applicationInterview.findFirst({
      where: {
        applicationId: applicationId,
        interviewerId: interviewerId,
      }
    })

    if (existingInterview) {
      console.log("❌ Interview already exists for this application and interviewer")
      return NextResponse.json(
        { success: false, message: "Interview already exists for this application and interviewer" },
        { status: 409 }
      )
    }

    // Create the interview
    const interview = await prisma.applicationInterview.create({
      data: {
        applicationId: applicationId,
        interviewerId: interviewerId,
        scheduledDate: new Date(scheduledDate),
        notes: notes || "",
        status: "SCHEDULED"
      },
      include: {
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    console.log("✅ Interview created successfully:", interview.id)

    return NextResponse.json({
      success: true,
      message: "Interview created successfully",
      interview: interview
    })

  } catch (error) {
    console.error("❌ Error creating interview:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error while creating interview" 
      },
      { status: 500 }
    )
  }
}

// PUT /api/v1/superadmin/applications (for status updates and interview scoring)
// Usage: PUT /api/v1/superadmin/applications?id=APPLICATION_ID&action=status
// Usage: PUT /api/v1/superadmin/applications?id=INTERVIEW_ID&action=submit-scores
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const action = url.searchParams.get('action')
    
    console.log(`🔍 PUT request for ID: ${id}, action: ${action}`)
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      )
    }

    if (action === 'status') {
      // Handle status update
      return await handleStatusUpdate(request, id)
    } else if (action === 'submit-scores') {
      // Handle interview scoring
      return await handleInterviewScoring(request, id)
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action. Only 'status' or 'submit-scores' are supported." },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("❌ Error in PUT request:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    )
  }
}

async function handleStatusUpdate(request: NextRequest, applicationId: string) {
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
    console.log("❌ Access denied - not superadmin")
    return NextResponse.json(
      { success: false, message: "Access denied. Only SUPER_ADMIN can update application status." },
      { status: 403 }
    )
  }

  const { status } = await request.json()

  if (!status) {
    return NextResponse.json(
      { success: false, message: "Status is required" },
      { status: 400 }
    )
  }

  // Validate status
  const validStatuses = ["TEMPORARY", "SUBMITTED", "UNDER_REVIEW", "INTERVIEW_INVITED", "INTERVIEWED", "PENDING_DOCUMENTS", "APPROVED", "REJECTED"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { 
        success: false, 
        message: `Invalid status value. Must be one of: ${validStatuses.join(", ")}` 
      },
      { status: 400 }
    )
  }

  // Check if application exists
  const existingApplication = await prisma.application.findUnique({
    where: { id: applicationId },
  })

  if (!existingApplication) {
    console.log("❌ Application not found")
    return NextResponse.json(
      { success: false, message: "Application not found" },
      { status: 404 }
    )
  }

  console.log("✅ Application found, updating status from", existingApplication.status, "to", status)

  // Update application status
  const updatedApplication = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status,
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        }
      }
    }
  })

  console.log("✅ Application status updated successfully")

  return NextResponse.json({
    success: true,
    message: "Application status updated successfully",
    application: {
      id: updatedApplication.id,
      status: updatedApplication.status,
      updatedAt: updatedApplication.updatedAt,
      user: updatedApplication.user
    }
  })
}

async function handleInterviewScoring(request: NextRequest, interviewId: string) {
  // Verify authentication (can be interviewer or superadmin)
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

  // Check if interview exists and user is authorized
  const interview = await prisma.applicationInterview.findUnique({
    where: { id: interviewId },
    include: {
      interviewer: true,
      application: true
    }
  })

  if (!interview) {
    console.log("❌ Interview not found")
    return NextResponse.json(
      { success: false, message: "Interview not found" },
      { status: 404 }
    )
  }

  // Only interviewer or superadmin can submit scores
  if (user.role !== "SUPER_ADMIN" && interview.interviewerId !== user.id) {
    console.log("❌ Access denied - not authorized to submit scores for this interview")
    return NextResponse.json(
      { success: false, message: "Access denied. Only the assigned interviewer or superadmin can submit scores." },
      { status: 403 }
    )
  }

  const { scores, overallComment, interviewNotes } = await request.json()

  if (!scores || !Array.isArray(scores)) {
    return NextResponse.json(
      { success: false, message: "Scores array is required" },
      { status: 400 }
    )
  }

  // Validate scores
  for (const score of scores) {
    if (!score.criteriaId || typeof score.score !== 'number' || score.score < 0 || score.score > 10) {
      return NextResponse.json(
        { success: false, message: "Each score must have a criteriaId and a score between 0 and 10" },
        { status: 400 }
      )
    }
  }

  // Calculate total score
  const totalScore = scores.reduce((sum, score) => sum + score.score, 0)
  const averageScore = totalScore / scores.length

  // Update interview with scores
  const updatedInterview = await prisma.applicationInterview.update({
    where: { id: interviewId },
    data: {
      status: "COMPLETED",
      overallScore: averageScore,
      overallComment: overallComment || "",
      interviewNotes: interviewNotes || "",
      completedAt: new Date(),
      scores: {
        create: scores.map(score => ({
          criteriaId: score.criteriaId,
          score: score.score,
          comments: score.comments || ""
        }))
      }
    },
    include: {
      interviewer: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      scores: {
        include: {
          criteria: true
        }
      }
    }
  })

  // Check if application has been scored 2 times and update status to INTERVIEWED
  const totalScoresForApplication = await prisma.interviewScores.count({
    where: {
      applicationId: interview.applicationId
    }
  })

  if (totalScoresForApplication >= 2) {
    await prisma.application.update({
      where: {
        id: interview.applicationId
      },
      data: {
        status: "INTERVIEWED",
        updatedAt: new Date()
      }
    })
    console.log(`✅ Application ${interview.applicationId} status updated to INTERVIEWED after ${totalScoresForApplication} scores`)
  }

  console.log("✅ Interview scores submitted successfully")

  return NextResponse.json({
    success: true,
    message: "Interview scores submitted successfully",
    interview: updatedInterview
  })
}

// DELETE /api/v1/superadmin/applications (for deleting applications)
// Usage: DELETE /api/v1/superadmin/applications?id=APPLICATION_ID&action=delete
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const applicationId = url.searchParams.get('id')
    const action = url.searchParams.get('action')
    
    console.log(`🔍 DELETE request for application: ${applicationId}, action: ${action}`)
    
    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      )
    }

    if (action !== 'delete') {
      return NextResponse.json(
        { success: false, message: "Invalid action. Only 'delete' is supported." },
        { status: 400 }
      )
    }
    
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
      console.log("❌ Access denied - not superadmin")
      return NextResponse.json(
        { success: false, message: "Access denied. Only SUPER_ADMIN can delete applications." },
        { status: 403 }
      )
    }

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!existingApplication) {
      console.log("❌ Application not found")
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    console.log("✅ Application found, deleting:", applicationId)

    // Delete the application (this will cascade delete related records)
    await prisma.application.delete({
      where: { id: applicationId },
    })

    console.log("✅ Application deleted successfully")

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
      deletedId: applicationId
    })

  } catch (error) {
    console.error("❌ Error deleting application:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error while deleting application" 
      },
      { status: 500 }
    )
  }
} 