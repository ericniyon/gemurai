import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = params

    // Get the application with full details
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        evaluations: {
          include: {
            evaluator: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: "desc",
          },
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    // Access control
    if (
      user.role === "EMPLOYER" ||
      hasPermission(user, "applications.view") ||
      application.userId === user.id
    ) {
      return NextResponse.json({
        success: true,
        application
      })
    }

    return NextResponse.json(
      { success: false, message: "Access denied" },
      { status: 403 }
    )
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch application" },
      { status: 500 }
    )
  }
} 