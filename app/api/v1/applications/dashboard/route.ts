import { NextRequest, NextResponse } from "next/server"
import { prisma, ensureDatabaseConnected } from "@/lib/database"
import { getAuthUser } from "@/lib/api-auth"

type NexgenRow = {
  id: string
  company_name: string
  applicant_name: string
  payload: Record<string, unknown> | null
  submitted_at: Date | string
}

function isAdminRole(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }
    if (!isAdminRole(user.role)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    await ensureDatabaseConnected()

    const { searchParams } = new URL(request.url)
    const search = (searchParams.get("search") || "").trim()
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
    const requestedLimit = parseInt(searchParams.get("limit") || "50", 10)
    const limit = Math.min(Math.max(requestedLimit, 1), 200)
    const skip = (page - 1) * limit

    const filters: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (search) {
      filters.push(`(
        company_name ILIKE $${idx} OR
        applicant_name ILIKE $${idx} OR
        COALESCE(payload->>'email', '') ILIKE $${idx} OR
        COALESCE(payload->>'phone', '') ILIKE $${idx}
      )`)
      values.push(`%${search}%`)
      idx += 1
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : ""

    const countRows = await prisma.$queryRawUnsafe<{ total: number }[]>(
      `SELECT COUNT(*)::int AS total FROM nexgen_forum_applications ${whereClause}`,
      ...values
    )
    const total = countRows[0]?.total ?? 0

    const rows = await prisma.$queryRawUnsafe<NexgenRow[]>(
      `
        SELECT
          id,
          company_name,
          applicant_name,
          payload,
          submitted_at
        FROM nexgen_forum_applications
        ${whereClause}
        ORDER BY submitted_at DESC
        LIMIT $${idx}
        OFFSET $${idx + 1}
      `,
      ...values,
      limit,
      skip
    )

    const data = rows.map((row) => {
      const formData = (row.payload ?? {}) as Record<string, unknown>
      const applicantEmail =
        (typeof formData.email === "string" && formData.email) ||
        (typeof formData.applicantEmail === "string" && formData.applicantEmail) ||
        ""
      const applicantPhone =
        (typeof formData.phone === "string" && formData.phone) ||
        (typeof formData.applicantPhone === "string" && formData.applicantPhone) ||
        ""

      return {
        id: row.id,
        status: "SUBMITTED",
        createdAt: row.submitted_at,
        updatedAt: row.submitted_at,
        formData,
        applicantName: row.applicant_name || "Unknown",
        applicantEmail,
        applicantPhone,
        companyName: row.company_name || "",
        user: {
          id: row.id,
          name: row.applicant_name || "Unknown",
          email: applicantEmail,
          phone: applicantPhone,
        },
        evaluations: [],
        interviewScores: [],
        totalScore: 0,
      }
    })

    const totalPages = Math.ceil(total / limit)
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      meta: {
        source: "nexgen_forum_applications",
        fetchedAt: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    const msg = String(error?.message || "")
    if (msg.includes("nexgen_forum_applications") && msg.toLowerCase().includes("does not exist")) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        meta: {
          source: "nexgen_forum_applications",
          fetchedAt: new Date().toISOString(),
        },
      })
    }

    console.error("GET /api/v1/applications/dashboard failed:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch applications", error: msg || "Unknown error" },
      { status: 500 }
    )
  }
}
