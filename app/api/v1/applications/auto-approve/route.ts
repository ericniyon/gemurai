import { NextResponse } from "next/server"
import { UserCreationService } from "@/lib/user-creation-service"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { applicationId, autoCreateUser = true } = await request.json()

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

    // Update application status to approved
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "APPROVED" },
    })

    let userCreated = false
    let userDetails: { id: string; email: string; name: string; role: string; tempPassword?: string } | null = null

    // Auto-create user account if requested and not already exists
    if (autoCreateUser && !application.userId) {
      const formData = application.formData || {}
      const userName = `${formData.q1 || ""} ${formData.q2 || ""}`.trim() || "Gemurai User"

      // Always create Consumer accounts - DCC requires manual admin review
      const userRole = "CONSUMER"

      const result = await UserCreationService.createUserFromApplication({
        email: application.email,
        name: userName,
        phone: application.phone,
        role: userRole, // Always Consumer
        applicationId: application.id,
        formData: formData,
      })

      if (result.success && result.user && result.passwordResetToken) {
        userCreated = true
        userDetails = result.user

        // Send welcome email
        const emailSent = await UserCreationService.sendWelcomeEmail(
          result.user.email,
          result.user.name,
          result.user.role as "DCC" | "CONSUMER",
          result.user.tempPassword!,
          result.passwordResetToken,
        )

        console.log(`Welcome email sent to ${result.user.email}:`, emailSent)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Application approved successfully",
      userCreated,
      user: userDetails,
    })
  } catch (error) {
    console.error("Error auto-approving application:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
