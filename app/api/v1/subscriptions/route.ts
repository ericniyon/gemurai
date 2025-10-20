import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { verifyAuth } from "@/lib/api-auth"

// GET /api/v1/subscriptions - Get user's subscriptions
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
    const type = searchParams.get("type") || "subscribed"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    let subscriptions
    let total

    if (type === "subscribed") {
      [subscriptions, total] = await Promise.all([
        prisma.subscription.findMany({
          where: {
            subscriberId: user.id,
            status: "ACTIVE"
          },
          include: {
            dcc: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                dccProfile: {
                  select: {
                    level: true,
                    rating: true,
                    location: true,
                    specialties: true,
                    totalSales: true,
                    monthlySales: true,
                    productsAvailable: true
                  }
                }
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" }
        }),
        prisma.subscription.count({
          where: {
            subscriberId: user.id,
            status: "ACTIVE"
          }
        })
      ])
    } else {
      if (user.role !== "DCC") {
        return NextResponse.json(
          { success: false, message: `Only DCC users can view their subscribers. User role: ${user.role}` },
          { status: 403 }
        )
      }

      [subscriptions, total] = await Promise.all([
        prisma.subscription.findMany({
          where: {
            dccId: user.id,
            status: "ACTIVE"
          },
          include: {
            subscriber: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                createdAt: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" }
        }),
        prisma.subscription.count({
          where: {
            dccId: user.id,
            status: "ACTIVE"
          }
        })
      ])
    }

    return NextResponse.json({
      success: true,
      data: subscriptions,
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
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscriptions" },
      { status: 500 }
    )
  }
}

// POST /api/v1/subscriptions - Subscribe to a DCC
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      )
    }

    const user = authResult.user

    console.log("Debug - User from auth:", {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    })

    console.log("Debug - Role comparison:", {
      userRole: user.role,
      userRoleType: typeof user.role,
      comparison: user.role !== "CUSTOMER",
      userRoleUpperCase: user.role?.toUpperCase(),
      expectedRole: "CUSTOMER"
    })

    if (user.role !== "CONSUMER") {
      return NextResponse.json(
        { success: false, message: `Only CONSUMER users can subscribe to DCC users. User role: ${user.role}` },
        { status: 403 }
      )
    }

    const { dccId } = await request.json()

    if (!dccId) {
      return NextResponse.json(
        { success: false, message: "DCC ID is required" },
        { status: 400 }
      )
    }

    const dccUser = await prisma.user.findUnique({
      where: { id: dccId },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    })

    if (!dccUser || !dccUser.isActive) {
      return NextResponse.json(
        { success: false, message: "User not found or not active" },
        { status: 404 }
      )
    }

    const dccRole = dccUser.userRole?.role?.name
    if (dccRole !== "DCC") {
      return NextResponse.json(
        { success: false, message: "Target user is not a DCC" },
        { status: 400 }
      )
    }

    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_dccId: {
          subscriberId: user.id,
          dccId: dccId
        }
      }
    })

    if (existingSubscription) {
      if (existingSubscription.status === "ACTIVE") {
        return NextResponse.json(
          { success: false, message: "Already subscribed to this DCC" },
          { status: 400 }
        )
      } else {
        const updatedSubscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: { status: "ACTIVE" },
          include: {
            dcc: {
              select: {
                id: true,
                name: true,
                email: true,
                dccProfile: {
                  select: {
                    level: true,
                    rating: true,
                    location: true
                  }
                }
              }
            }
          }
        })

        return NextResponse.json({
          success: true,
          message: "Subscription reactivated successfully",
          data: updatedSubscription
        })
      }
    }

    const subscription = await prisma.subscription.create({
      data: {
        subscriberId: user.id,
        dccId: dccId,
        status: "ACTIVE"
      },
      include: {
        dcc: {
          select: {
            id: true,
            name: true,
            email: true,
            dccProfile: {
              select: {
                level: true,
                rating: true,
                location: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to DCC",
      data: subscription
    })

  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create subscription" },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/subscriptions - Unsubscribe from a DCC
export async function DELETE(request: NextRequest) {
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
    const dccId = searchParams.get("dccId")

    if (!dccId) {
      return NextResponse.json(
        { success: false, message: "DCC ID is required" },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_dccId: {
          subscriberId: user.id,
          dccId: dccId
        }
      }
    })

    if (!subscription || subscription.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Active subscription not found" },
        { status: 404 }
      )
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "INACTIVE" }
    })

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from DCC"
    })

  } catch (error) {
    console.error("Error deleting subscription:", error)
    return NextResponse.json(
      { success: false, message: "Failed to unsubscribe" },
      { status: 500 }
    )
  }
}
