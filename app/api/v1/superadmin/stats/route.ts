import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Verify superadmin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    // Get user stats
    const [
      totalUsers,
      dccUsers,
      employerUsers,
      consumerUsers,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "DCC" } }),
      prisma.user.count({ where: { role: "EMPLOYER" } }),
      prisma.user.count({ where: { role: "CONSUMER" } }),
      prisma.application.count(),
      prisma.application.count({
        where: {
          OR: [
            { status: "SUBMITTED" },
            { status: "UNDER_REVIEW" },
            { status: "PENDING_DOCUMENTS" },
          ],
        },
      }),
      prisma.application.count({ where: { status: "APPROVED" } }),
      prisma.application.count({ where: { status: "REJECTED" } }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          dcc: dccUsers,
          employer: employerUsers,
          consumer: consumerUsers,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
        },
        roles: {
          total: 5, // SUPER_ADMIN, ADMIN, DCC, EMPLOYER, CONSUMER
        },
      },
    })
  } catch (error) {
    console.error("Error fetching superadmin stats:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 