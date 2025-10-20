import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

// Map client status to database status
const statusMap = {
  "temporary": "TEMPORARY",
  "submitted": "SUBMITTED",
  "under_review": "UNDER_REVIEW",
  "pending_documents": "PENDING_DOCUMENTS",
  "approved": "APPROVED",
  "rejected": "REJECTED",
} as const

// Map database status to client status
const reverseStatusMap = {
  "TEMPORARY": "temporary",
  "SUBMITTED": "submitted",
  "UNDER_REVIEW": "under_review",
  "PENDING_DOCUMENTS": "pending_documents",
  "APPROVED": "approved",
  "REJECTED": "rejected",
} as const

async function updateStatus(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { status } = await request.json()

    // Dynamic import of database
    const { prisma } = await import("@/lib/database")

    // First check if the application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id },
      include: {
        formData: true, // Include form data to get applicant's name and email
      },
    })

    if (!existingApplication) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    // Convert status to lowercase for validation
    const normalizedStatus = status.toLowerCase()

    // Validate status
    const validStatuses = Object.keys(statusMap)
    if (!validStatuses.includes(normalizedStatus)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid status value. Must be one of: ${validStatuses.join(", ")}` 
        },
        { status: 400 }
      )
    }

    // Convert status to database format
    const dbStatus = statusMap[normalizedStatus as keyof typeof statusMap]

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: dbStatus,
        updatedAt: new Date(),
      },
      include: {
        formData: true, // Include form data in the response
      },
    })

    // If the application is approved, send an approval email
    if (normalizedStatus === "approved") {
      // Extract name from form data
      const formData = existingApplication.formData || {}
      let applicantName = "Applicant"
      
      // Try different field combinations for the name
      if (formData.q1 && formData.q2) {
        applicantName = `${formData.q1} ${formData.q2}`.trim()
      } else if (formData.firstName && formData.lastName) {
        applicantName = `${formData.firstName} ${formData.lastName}`.trim()
      } else if (formData.name) {
        applicantName = formData.name.trim()
      } else if (formData.q1) {
        applicantName = formData.q1.trim()
      } else if (formData.firstName) {
        applicantName = formData.firstName.trim()
      }

      // Get email from application or form data
      const applicantEmail = formData.q7 || formData.email || existingApplication.email

      if (applicantEmail) {
        try {
          // Dynamic import of email service
          const { sendApplicationApprovalEmail } = await import("@/lib/email-service.server")
          await sendApplicationApprovalEmail(applicantEmail, applicantName)
          console.log(`✅ Approval email sent to ${applicantEmail}`)
        } catch (emailError) {
          console.error("Failed to send approval email:", emailError)
          // Don't fail the status update if email fails
        }
      }
    }

    // Convert status back to client format
    const clientApplication = {
      ...updatedApplication,
      status: reverseStatusMap[updatedApplication.status as keyof typeof reverseStatusMap],
    }

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully",
      data: clientApplication,
    })
  } catch (error) {
    console.error("Error updating application status:", error)
    
    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return NextResponse.json(
            { success: false, message: "Application not found" },
            { status: 404 }
          )
        default:
          return NextResponse.json(
            { success: false, message: "Database error occurred" },
            { status: 500 }
          )
      }
    }
    
    // Handle other errors
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update application status" },
      { status: 500 }
    )
  }
}

// Support both PUT and PATCH methods
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Application ID is required",
        },
        { status: 400 }
      )
    }

    if (!body.status) {
      return NextResponse.json(
        {
          success: false,
          message: "Status is required",
        },
        { status: 400 }
      )
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: body.status,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error updating application status:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update application status",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Application ID is required",
        },
        { status: 400 }
      )
    }

    if (!body.status) {
      return NextResponse.json(
        {
          success: false,
          message: "Status is required",
        },
        { status: 400 }
      )
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: body.status,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error updating application status:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update application status",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
} 