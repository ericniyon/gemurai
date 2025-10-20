import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Dynamic import of auth module
    const { verifyAuth } = await import("@/lib/api-auth")
    // Verify admin authentication
    const authResult = await verifyAuth(request, ["admin.users", "users.manage"])
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: authResult.status })
    }

    const { userId, applicationId, reason } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    // Get user and application data
    const { prisma } = await import("@/lib/database")

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    if (user.role === "DCC") {
      return NextResponse.json({ success: false, message: "User is already a DCC" }, { status: 400 })
    }

    let formData = {}
    if (applicationId) {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
      })
      formData = application?.formData || {}
    }

    // Dynamic import of user creation service
    const { UserCreationService } = await import("@/lib/user-creation-service")
    // Upgrade user to DCC
    const result = await UserCreationService.upgradeUserToDCC(userId, applicationId || "", formData)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 })
    }

    // Log the upgrade
    console.log(`User ${userId} upgraded to DCC by admin. Reason: ${reason || "No reason provided"}`)

    // Send DCC upgrade email
    try {
      const emailResponse = await fetch("/api/email/dcc-upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          reason: reason || "Your application has been reviewed and approved for DCC status",
        }),
      })

      const emailResult = await emailResponse.json()
      console.log(`DCC upgrade email sent to ${user.email}:`, emailResult.success)
    } catch (emailError) {
      console.warn("Failed to send DCC upgrade email:", emailError)
    }

    return NextResponse.json({
      success: true,
      message: "User successfully upgraded to DCC",
      user: {
        id: result.user!.id,
        email: result.user!.email,
        name: result.user!.name,
        role: result.user!.role,
      },
    })
  } catch (error) {
    console.error("Error upgrading user to DCC:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
