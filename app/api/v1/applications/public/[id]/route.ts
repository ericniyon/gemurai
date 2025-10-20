import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log("🔍 Fetching public application:", id)

    // Check if this is a temporary application (starts with APP-)
    if (id.startsWith('APP-')) {
      // For temporary applications, return a simplified response
      return NextResponse.json({
        success: true,
        application: {
          id,
          status: 'submitted',
          formData: {}, // The actual form data will be in localStorage on the client side
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    }

    // If not a temporary application, try to fetch from database
    const application = await prisma.application.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
        currentStep: true,
        createdAt: true,
        updatedAt: true,
        formData: true,
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
            createdAt: "desc"
          }
        }
      },
    })

    if (!application) {
      console.log("❌ Application not found:", id)
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    console.log("✅ Public application found:", application.id)
    return NextResponse.json({
      success: true,
      application: {
        ...application,
        status: application.status.toLowerCase()
      }
    })
  } catch (error) {
    console.error("❌ Error fetching public application:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}