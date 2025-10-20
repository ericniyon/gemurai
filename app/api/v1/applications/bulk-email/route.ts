import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { applicationIds, subject, message } = await request.json()

    if (!applicationIds || !Array.isArray(applicationIds) || !subject || !message) {
      return new NextResponse("Invalid request data", { status: 400 })
    }

    // Fetch applications with user data to get email addresses
    const applications = await prisma.application.findMany({
      where: {
        id: {
          in: applicationIds
        }
      },
      include: {
        user: true
      }
    })

    // Filter out applications without user email
    const validApplications = applications.filter(app => app.user?.email)

    if (validApplications.length === 0) {
      return new NextResponse("No valid email addresses found", { status: 400 })
    }

    // Dynamic import of email service
    const { sendEmail } = await import("@/lib/email-service.server")

    // Send emails in parallel
    await Promise.all(
      validApplications.map(async (application) => {
        if (!application.user?.email) return // TypeScript safety check

        await sendEmail({
          to: application.user.email,
          subject: subject,
          html: message.replace(/\n/g, "<br/>"), // Basic text to HTML conversion
          template: "bulk-email"
        })
      })
    )

    return NextResponse.json({
      success: true,
      message: `Emails sent to ${validApplications.length} applicants`
    })

  } catch (error) {
    console.error("Error sending bulk emails:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 