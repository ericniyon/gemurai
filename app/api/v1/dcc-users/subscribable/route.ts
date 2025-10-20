import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { verifyAuth } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      )
    }

    const user = authResult.user
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const skip = (page - 1) * limit

    // Build where clause for DCC users
    const whereClause: any = {
      isActive: true,
      userRole: {
        role: {
          name: "DCC"
        }
      }
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } }
      ]
    }

    // Get DCC users with their profiles
    const [dccUsers, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          userRole: {
            include: {
              role: true
            }
          },
          dccProfile: {
            select: {
              level: true,
              rating: true,
              location: true,
              specialties: true,
              totalSales: true,
              monthlySales: true,
              productsAvailable: true,
              status: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where: whereClause })
    ])

    // If user is a CUSTOMER, check which DCCs they're already subscribed to
    let subscribedDccIds: string[] = []
    if (user.role === "CUSTOMER") {
      const subscriptions = await prisma.subscription.findMany({
        where: {
          subscriberId: user.id,
          status: "ACTIVE"
        },
        select: { dccId: true }
      })
      subscribedDccIds = subscriptions.map(sub => sub.dccId)
    }

    // Add subscription status to each DCC user
    const dccUsersWithSubscriptionStatus = dccUsers.map(dccUser => ({
      ...dccUser,
      isSubscribed: subscribedDccIds.includes(dccUser.id)
    }))

    return NextResponse.json({
      success: true,
      data: dccUsersWithSubscriptionStatus,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error("Error fetching subscribable DCC users:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch DCC users" },
      { status: 500 }
    )
  }
}
