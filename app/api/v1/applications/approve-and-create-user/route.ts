import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Dynamic import of auth module
    const { verifyAuth } = await import("@/lib/api-auth")

    // Verify admin authentication
    const authResult = await verifyAuth(request, ["admin.users", "applications.manage"])
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status })
    }

    const { applicationId } = await request.json()

    if (!applicationId) {
      return NextResponse.json({ success: false, message: "Application ID is required" }, { status: 400 })
    }

    // Get application data
    const { prisma } = await import("@/lib/database")
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return NextResponse.json({ success: false, message: "Application not found" }, { status: 404 })
    }

    if (application.userId) {
      return NextResponse.json(
        { success: false, message: "User account already exists for this application" },
        { status: 400 },
      )
    }

    // Extract user data from application
    const formData = application.formData || {}
    const userName = `${formData.q1 || ""} ${formData.q2 || ""}`.trim() || "Gemurai User"

    // Always create Consumer accounts - DCC requires manual review
    const userRole = "CONSUMER"

    // Dynamic import of user creation service
    const { UserCreationService } = await import("@/lib/user-creation-service")

    // Create user account
    const result = await UserCreationService.createUserFromApplication({
      email: application.email,
      name: userName,
      phone: application.phone,
      role: userRole, // Always Consumer
      applicationId: application.id,
      formData: formData,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 })
    }

    // Send welcome email
    if (result.user && result.passwordResetToken) {
      const emailSent = await UserCreationService.sendWelcomeEmail(
        result.user.email,
        result.user.name,
        result.user.role as "DCC" | "CONSUMER",
        result.user.tempPassword!,
        result.passwordResetToken,
      )

      if (!emailSent) {
        console.warn("Failed to send welcome email to:", result.user.email)
      }
    }

    return NextResponse.json({
      success: true,
      message: "User account created with Consumer role. DCC role requires manual admin review.",
      user: {
        id: result.user!.id,
        email: result.user!.email,
        name: result.user!.name,
        role: result.user!.role,
      },
      emailSent: !!result.passwordResetToken,
    })
  } catch (error) {
    console.error("Error creating user from application:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
