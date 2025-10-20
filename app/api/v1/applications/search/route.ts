import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export const runtime = "nodejs"

// Mark this route as dynamic since it uses searchParams
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get("email")
    const phone = searchParams.get("phone")
    const status = searchParams.get("status")

    if (!email && !phone && !status) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one search parameter is required: email, phone, or status",
        },
        { status: 400 },
      )
    }

    const filter: any = {}

    if (email) {
      filter.email = {
        contains: email,
        mode: "insensitive",
      }
    }

    if (phone) {
      // Clean phone number for comparison
      const cleanPhone = phone
        .replace(/\s/g, "")
        .replace(/^\+250/, "")
        .replace(/^0/, "")

      filter.phone = {
        contains: cleanPhone,
        mode: "insensitive",
      }
    }

    if (status) {
      filter.status = status.toUpperCase()
    }

    const applications = await prisma.application.findMany({
      where: filter,
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Applications retrieved successfully",
      data: applications,
    })
  } catch (error: any) {
    console.error("Application search error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to search applications",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
