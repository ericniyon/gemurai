import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/admin/dashboard - Get admin dashboard statistics
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get current date boundaries
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch all statistics in parallel
    const [
      totalUsers,
      totalMCCs,
      totalCommodities,
      totalCategories,
      totalFarmers,
      totalAgents,
      totalCollections,
      todayCollections,
      monthCollections,
      totalRevenue,
      todayRevenue,
      monthRevenue,
      pendingCollections,
      approvedCollections,
      totalQualityFields,
      totalSeasonPlans,
      activeCommodities,
      recentCollections,
      recentUsers,
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      
      // MCCs
      prisma.mccs.count(),
      
      // Commodities
      prisma.commodities.count(),
      prisma.commodity_categories.count(),
      
      // Farmers
      prisma.farmers.count(),
      
      // Agents (users with AGENT, FIELD_AGENT roles)
      prisma.user.count({
        where: {
          userRole: {
            role: {
              name: {
                in: ["AGENT", "FIELD_AGENT", "EXTENSION_AGENT"]
              }
            }
          }
        }
      }),
      
      // Collections
      prisma.commodity_collections.count(),
      prisma.commodity_collections.count({
        where: {
          collectionDate: { gte: startOfToday }
        }
      }),
      prisma.commodity_collections.count({
        where: {
          collectionDate: { gte: startOfMonth }
        }
      }),
      
      // Revenue
      prisma.commodity_collections.aggregate({
        _sum: { totalAmount: true }
      }),
      prisma.commodity_collections.aggregate({
        where: {
          collectionDate: { gte: startOfToday }
        },
        _sum: { totalAmount: true }
      }),
      prisma.commodity_collections.aggregate({
        where: {
          collectionDate: { gte: startOfMonth }
        },
        _sum: { totalAmount: true }
      }),
      
      // Collection status
      prisma.commodity_collections.count({
        where: { status: "PENDING" }
      }),
      prisma.commodity_collections.count({
        where: { status: "APPROVED" }
      }),
      
      // Quality fields
      prisma.commodity_quality_fields.count(),
      
      // Season plans
      prisma.season_plans.count(),
      
      // Active commodities
      prisma.commodities.count({
        where: { isActive: true }
      }),
      
      // Recent collections (last 10)
      prisma.commodity_collections.findMany({
        take: 10,
        orderBy: { collectionDate: "desc" },
        include: {
          commodity: {
            select: { name: true, code: true }
          },
          farmer: {
            select: { name: true, phone: true }
          },
          mcc: {
            select: { name: true, code: true }
          }
        }
      }),
      
      // Recent users (last 5)
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          userRole: {
            select: {
              role: { select: { name: true } }
            }
          }
        }
      }),
    ])

    // Calculate trends (month over month)
    const lastMonthCollections = await prisma.commodity_collections.count({
      where: {
        collectionDate: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      }
    })

    const collectionsGrowth = lastMonthCollections > 0
      ? ((monthCollections - lastMonthCollections) / lastMonthCollections * 100).toFixed(1)
      : "0"

    // Get collections by commodity
    const collectionsByCommodity = await prisma.commodity_collections.groupBy({
      by: ["commodityId"],
      _count: { id: true },
      _sum: { quantity: true, totalAmount: true },
      orderBy: { _count: { id: "desc" } },
      take: 5
    })

    const commodityDetails = await Promise.all(
      collectionsByCommodity.map(async (item) => {
        const commodity = await prisma.commodities.findUnique({
          where: { id: item.commodityId },
          select: { name: true, code: true }
        })
        return {
          commodity: commodity?.name || "Unknown",
          code: commodity?.code || "",
          collections: item._count.id,
          volume: item._sum.quantity || 0,
          revenue: item._sum.totalAmount || 0
        }
      })
    )

    // Get collections by status
    const collectionsByStatus = await prisma.commodity_collections.groupBy({
      by: ["status"],
      _count: { id: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalMCCs,
          totalCommodities,
          totalCategories,
          totalFarmers,
          totalAgents,
          activeCommodities,
        },
        collections: {
          total: totalCollections,
          today: todayCollections,
          thisMonth: monthCollections,
          pending: pendingCollections,
          approved: approvedCollections,
          growth: collectionsGrowth,
        },
        revenue: {
          total: totalRevenue._sum.totalAmount || 0,
          today: todayRevenue._sum.totalAmount || 0,
          thisMonth: monthRevenue._sum.totalAmount || 0,
        },
        system: {
          totalQualityFields,
          totalSeasonPlans,
        },
        byCommodity: commodityDetails,
        byStatus: collectionsByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        recent: {
          collections: recentCollections.map(c => ({
            id: c.id,
            date: c.collectionDate,
            commodity: c.commodity?.name || "Unknown",
            farmer: c.farmer?.name || "Unknown",
            mcc: c.mcc?.name || "Unknown",
            quantity: c.quantity,
            amount: c.totalAmount,
            status: c.status,
          })),
          users: recentUsers.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.userRole?.role?.name ?? "UNASSIGNED",
            createdAt: u.createdAt,
          })),
        },
      },
    })
  } catch (error: any) {
    console.error("Error fetching admin dashboard:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
