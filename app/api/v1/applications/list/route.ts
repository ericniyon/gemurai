import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ]
    }

    // Get applications with pagination
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          evaluations: {
            include: {
              evaluator: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1, // Get only the latest evaluation
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch applications" },
      { status: 500 }
    )
  }
} 