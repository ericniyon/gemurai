import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"

async function getAuthenticatedUser(request: NextRequest) {
  // Try NextAuth session first
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return { userId: session.user.id, method: 'session' }
  }

  // Try custom token
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  const user = await verifyAuthToken(token)
  if (!user) {
    return null
  }

  return { userId: user.id, method: 'token' }
}

async function checkSuperAdminAccess(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        userRole: {
          select: {
            role: {
              select: {
                name: true,
                description: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return { hasAccess: false, error: "User not found" }
    }

    const userRole = user.userRole?.role?.name
    if (userRole !== "SUPER_ADMIN") {
      return { 
        hasAccess: false, 
        error: "Access denied. Only SUPER_ADMIN can access all applications." 
      }
    }

    return { hasAccess: true, user }
  } catch (error) {
    console.error("Error checking superadmin access:", error)
    return { hasAccess: false, error: "Failed to verify access" }
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 All Applications API called")
    
    // Authenticate user
    const auth = await getAuthenticatedUser(request)
    if (!auth) {
      console.log("❌ Authentication failed")
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("✅ User authenticated:", auth.userId)

    // Check superadmin access
    const accessCheck = await checkSuperAdminAccess(auth.userId)
    if (!accessCheck.hasAccess) {
      console.log("❌ Access denied:", accessCheck.error)
      return NextResponse.json(
        { success: false, message: accessCheck.error },
        { status: 403 }
      )
    }

    console.log("✅ Super admin authenticated, fetching all applications...")

    // Parse query parameters (removed pagination parameters)
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const search = url.searchParams.get("search") || ""
    const sortBy = url.searchParams.get("sortBy") || "createdAt"
    const sortOrder = url.searchParams.get("sortOrder") || "desc"

    // Build where clause
    const where: any = {}

    // Add status filter if provided
    if (status) {
      where.status = status
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { user: { 
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ]
    }

    console.log("📝 Query parameters:", { status, search, sortBy, sortOrder })

    // Fetch all applications (no pagination)
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        select: {
          id: true,
          userId: true,
          phone: true,
          email: true,
          status: true,
          formData: true,
          nationalId: true,
          currentStep: true,
          notes: true,
          dccCreated: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              userRole: {
                select: {
                  role: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          },
          evaluations: {
            select: {
              id: true,
              type: true,
              score: true,
              totalScore: true,
              overallLevel: true,
              createdAt: true,
              evaluator: {
                select: {
                  id: true,
                  email: true,
                  name: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          dccProfile: {
            select: {
              id: true,
              level: true,
              rating: true,
              status: true,
              location: true,
              approvedBy: true,
              approvedDate: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      prisma.application.count({ where })
    ])

    console.log("📊 Found", applications.length, "applications, total:", total)

    // Transform applications data
    const transformedApplications = applications.map(app => ({
      id: app.id,
      userId: app.userId,
      phone: app.phone,
      email: app.email,
      status: app.status,
      formData: app.formData,
      nationalId: app.nationalId,
      currentStep: app.currentStep,
      notes: app.notes,
      dccCreated: app.dccCreated,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      user: app.user ? {
        id: app.user.id,
        email: app.user.email,
        name: app.user.name,
        role: app.user.userRole?.role?.name
      } : null,
      evaluations: app.evaluations.map(appEvaluation => ({
        id: appEvaluation.id,
        type: appEvaluation.type,
        score: appEvaluation.score,
        totalScore: appEvaluation.totalScore,
        overallLevel: appEvaluation.overallLevel,
        createdAt: appEvaluation.createdAt,
        evaluator: {
          id: appEvaluation.evaluator.id,
          email: appEvaluation.evaluator.email,
          name: appEvaluation.evaluator.name
        }
      })),
      dccProfile: app.dccProfile ? {
        id: app.dccProfile.id,
        level: app.dccProfile.level,
        rating: app.dccProfile.rating,
        status: app.dccProfile.status,
        location: app.dccProfile.location,
        approvedBy: app.dccProfile.approvedBy,
        approvedDate: app.dccProfile.approvedDate
      } : null
    }))

    // Generate statistics
    const stats = {
      total,
      byStatus: {
        SUBMITTED: applications.filter(app => app.status === 'SUBMITTED').length,
        APPROVED: applications.filter(app => app.status === 'APPROVED').length,
        REJECTED: applications.filter(app => app.status === 'REJECTED').length,
        PENDING: applications.filter(app => app.status === 'PENDING').length
      },
      withEvaluations: applications.filter(app => app.evaluations.length > 0).length,
      withDccProfile: applications.filter(app => app.dccProfile !== null).length,
      dccCreated: applications.filter(app => app.dccCreated).length
    }

    return NextResponse.json({
      success: true,
      data: transformedApplications,
      meta: {
        total,
        stats
      },
      message: `Retrieved all ${transformedApplications.length} applications`
    })

  } catch (error) {
    console.error("❌ Error fetching all applications:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch applications", error: error.message },
      { status: 500 }
    )
  }
} 