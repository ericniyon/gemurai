import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// PUT /api/v1/applications/update-status
// Allows EMPLOYER users to update application status
export async function PUT(request: NextRequest) {
  try {
    console.log("🔍 Update status API called")
    
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
        { success: false, message: "Access denied. Only EMPLOYER can update application status." },
        { status: 403 }
      )
    }

    const { applicationId, status } = await request.json()

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, message: "Application ID and status are required" },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['TEMPORARY', 'SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS', 'APPROVED', 'REJECTED', 'INTERVIEW_INVITED', 'INTERVIEWED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      )
    }

    console.log("✅ Employer authenticated, updating application status:", applicationId, "to", status)

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

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { 
        status: status,
        updatedAt: new Date()
      }
    })

    console.log("✅ Application status updated successfully")

    return NextResponse.json({ 
      success: true, 
      message: "Application status updated successfully",
      application: updatedApplication
    })

  } catch (error) {
    console.error("❌ Error updating application status:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 