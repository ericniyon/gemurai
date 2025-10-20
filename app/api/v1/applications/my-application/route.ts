import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"

export const runtime = "nodejs"

// Mark this route as dynamic since it uses request.headers
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Get token from multiple sources
    let token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = req.cookies.get("token")?.value
    }
    if (!token) {
      token = req.cookies.get("Gemurai_token")?.value
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Verify the token
    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    // Check if user is DCC
    if (user.role !== "DCC") {
      return NextResponse.json(
        { error: "Access denied. DCC role required." },
        { status: 403 }
      )
    }

    // Mock application data based on user ID
    const applicationId = `APP-2024-${user.id.slice(-6).toUpperCase()}`
    
    // Generate realistic application data
    const submittedDate = new Date('2024-01-15T10:00:00Z')
    const lastUpdated = new Date('2024-01-22T14:30:00Z')
    const estimatedCompletion = new Date('2024-02-15T00:00:00Z')

    const mockApplication = {
      id: applicationId,
      status: "under_review",
      submittedDate: submittedDate.toISOString(),
      lastUpdated: lastUpdated.toISOString(),
      currentStep: "Document Verification",
      completionPercentage: 65,
      estimatedCompletion: estimatedCompletion.toISOString(),
      reviewer: {
        name: "Sarah Uwimana",
        email: "sarah.uwimana@Gemurai.rw"
      },
      documents: [
        {
          name: "National ID",
          status: "verified",
          uploadedDate: "2024-01-15T10:00:00Z"
        },
        {
          name: "Education Certificate",
          status: "verified",
          uploadedDate: "2024-01-15T10:05:00Z"
        },
        {
          name: "CV/Resume",
          status: "pending",
          uploadedDate: "2024-01-15T10:10:00Z"
        },
        {
          name: "Profile Photo",
          status: "verified",
          uploadedDate: "2024-01-15T10:15:00Z"
        },
        {
          name: "Community Reference Letter",
          status: "under_review",
          uploadedDate: "2024-01-15T10:20:00Z"
        }
      ],
      timeline: [
        {
          step: "Application Submitted",
          date: "2024-01-15T10:00:00Z",
          status: "completed",
          description: "Your DCC application has been successfully submitted and assigned ID: " + applicationId
        },
        {
          step: "Initial Review",
          date: "2024-01-16T09:00:00Z",
          status: "completed",
          description: "Application passed initial screening and eligibility check."
        },
        {
          step: "Document Verification",
          date: "2024-01-18T11:00:00Z",
          status: "in_progress",
          description: "Verifying submitted documents and credentials. Most documents approved."
        },
        {
          step: "Background Check",
          date: null,
          status: "pending",
          description: "Community background verification and reference checks."
        },
        {
          step: "Interview Scheduling",
          date: null,
          status: "pending",
          description: "Schedule interview with DCC coordinator and local team."
        },
        {
          step: "Final Approval",
          date: null,
          status: "pending",
          description: "Final review and approval decision by regional manager."
        }
      ],
      notes: [
        {
          date: "2024-01-22T14:30:00Z",
          author: "Sarah Uwimana",
          message: "Your application is progressing well! Please update your CV to include more details about your community involvement and digital literacy experience. This will strengthen your application significantly.",
          type: "feedback"
        },
        {
          date: "2024-01-20T16:45:00Z",
          author: "System",
          message: "Document verification in progress. Most documents have been approved. Expected completion by January 28th.",
          type: "update"
        },
        {
          date: "2024-01-18T11:00:00Z",
          author: "James Mutoni",
          message: "Application has been assigned to reviewer. Initial assessment shows strong potential.",
          type: "info"
        },
        {
          date: "2024-01-15T10:00:00Z",
          author: "System",
          message: "Application submitted successfully. You will receive updates on your progress via email and through this portal.",
          type: "confirmation"
        }
      ]
    }

    return NextResponse.json(mockApplication, { status: 200 })
  } catch (error) {
    console.error("Error fetching DCC application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 