import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * GET /api/v1/mcc/dashboard
 * Get MCC dashboard data: daily milk volume, payout due, low stock alerts, rental assets out
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "") ?? null
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    // If user is MCC_MANAGER, get their MCC ID
    let targetMccId = mccId
    if (!targetMccId && user.role === "MCC_MANAGER" && user.mccId) {
      targetMccId = user.mccId
    }

    // Get today's date range
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    // Daily milk volume
    let dailyVolume: any = { _sum: { totalLiters: 0 }, _count: { id: 0 } }
    try {
      dailyVolume = await prisma.milk_collections.aggregate({
        where: {
          ...(targetMccId ? { mccId: targetMccId } : {}),
          collectionDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          totalLiters: true,
        },
        _count: {
          id: true,
        },
      })
    } catch (error) {
      console.warn("Could not fetch daily volume:", error)
    }

    // Payout due (collections not yet paid)
    let payoutDue: any = { _sum: { netPayment: 0, totalAmount: 0 }, _count: { id: 0 } }
    try {
      payoutDue = await prisma.milk_collections.aggregate({
        where: {
          ...(targetMccId ? { mccId: targetMccId } : {}),
          status: { in: ["PENDING", "APPROVED"] },
        },
        _sum: {
          netPayment: true,
          totalAmount: true,
        },
        _count: {
          id: true,
        },
      })
    } catch (error) {
      console.warn("Could not fetch payout due:", error)
    }

    // Low stock alerts (products with stock <= reorder threshold)
    let lowStockProducts: any[] = []
    try {
      const warehouseIds = targetMccId
        ? await prisma.mcc_warehouses
            .findMany({
              where: { mccId: targetMccId },
              select: { id: true },
            })
            .then((warehouses) => warehouses.map((w) => w.id))
        : []

      if (warehouseIds.length > 0 || !targetMccId) {
        lowStockProducts = await prisma.products.findMany({
          where: {
            ...(targetMccId && warehouseIds.length > 0
              ? {
                  mccWarehouseId: {
                    in: warehouseIds,
                  },
                }
              : {}),
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            barcode: true,
            stock: true,
            reorderPoint: true,
          },
          take: 100,
        })

        // Filter products where stock <= reorderPoint
        lowStockProducts = lowStockProducts.filter(
          (p) => (p.stock || 0) <= (p.reorderPoint || 0)
        ).slice(0, 10)
      }
    } catch (error) {
      console.warn("Could not fetch low stock products:", error)
      lowStockProducts = []
    }

    // Rental assets out (rentals not returned)
    let rentalAssetsOut: any[] = []
    try {
      const whereClause: any = {
        returned: false,
      }
      if (targetMccId) {
        whereClause.mccId = targetMccId
      }
      
      rentalAssetsOut = await (prisma as any).rentals.findMany({
        where: whereClause,
        include: {
          asset: {
            select: {
              id: true,
              serial: true,
              name: true,
              assetType: true,
            },
          },
          farmer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      })
    } catch (error) {
      console.warn("Could not fetch rental assets:", error)
      rentalAssetsOut = []
    }

    // Additional stats
    let totalFarmers = 0
    let activeFarmers = 0
    try {
      totalFarmers = await prisma.farmers.count({
        where: {
          ...(targetMccId ? { mccId: targetMccId } : {}),
          isActive: true,
        },
      })
    } catch (error) {
      console.warn("Could not count total farmers:", error)
    }

    try {
      activeFarmers = await prisma.farmers.count({
        where: {
          ...(targetMccId ? { mccId: targetMccId } : {}),
          isActive: true,
          lastCollectionDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      })
    } catch (error) {
      console.warn("Could not count active farmers:", error)
    }

    // Quality metrics
    let qualityMetrics: any[] = []
    try {
      const qualityWhere: any = {
        collectionDate: {
          gte: startDate,
          lte: endDate,
        },
      }
      
      if (targetMccId) {
        qualityWhere.mccId = targetMccId
      }
      
      qualityMetrics = await (prisma.milk_collections.groupBy as any)({
        by: ["qualityStatus"],
        where: qualityWhere,
        _count: {
          id: true,
        },
        _sum: {
          totalLiters: true,
        },
      })
    } catch (error) {
      console.warn("Could not fetch quality metrics:", error)
    }

    // Sales statistics
    let salesStats: any = {
      totalLiters: 0,
      totalRevenue: 0,
      totalSales: 0,
      acceptedSales: 0,
      rejectedSales: 0,
    }
    try {
      const salesWhere: any = {}
      if (targetMccId) {
        salesWhere.mccId = targetMccId
      }
      
      const salesAggregate = await prisma.mcc_sales.aggregate({
        where: salesWhere,
        _sum: {
          litersSold: true,
          totalAmount: true,
        },
        _count: {
          id: true,
        },
      })
      
      const acceptedCount = await prisma.mcc_sales.count({
        where: {
          ...salesWhere,
          paymentStatus: "paid",
        },
      })
      
      const rejectedCount = await prisma.mcc_sales.count({
        where: {
          ...salesWhere,
          paymentStatus: "rejected",
        },
      })
      
      salesStats = {
        totalLiters: salesAggregate._sum?.litersSold || 0,
        totalRevenue: salesAggregate._sum?.totalAmount || 0,
        totalSales: salesAggregate._count?.id || 0,
        acceptedSales: acceptedCount,
        rejectedSales: rejectedCount,
      }
    } catch (error) {
      console.warn("Could not fetch sales stats:", error)
    }

    // Customers statistics (from unique company names in sales)
    let customersStats: any = {
      total: 0,
      active: 0,
      avgPricePerLiter: 0,
      totalRevenue: 0,
    }
    try {
      const salesWhere: any = {}
      if (targetMccId) {
        salesWhere.mccId = targetMccId
      }
      
      const uniqueCustomers = await prisma.mcc_sales.findMany({
        where: salesWhere,
        select: {
          companyName: true,
          unitPrice: true,
          totalAmount: true,
          saleDate: true,
        },
        distinct: ["companyName"],
      })
      
      const recentSales = await prisma.mcc_sales.findMany({
        where: {
          ...salesWhere,
          saleDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        select: {
          companyName: true,
        },
        distinct: ["companyName"],
      })
      
      const avgPrice = await prisma.mcc_sales.aggregate({
        where: salesWhere,
        _avg: {
          unitPrice: true,
        },
      })
      
      customersStats = {
        total: uniqueCustomers.length,
        active: recentSales.length,
        avgPricePerLiter: avgPrice._avg?.unitPrice || 0,
        totalRevenue: salesStats.totalRevenue,
      }
    } catch (error) {
      console.warn("Could not fetch customers stats:", error)
    }

    // Suppliers statistics
    let suppliersStats: any = {
      total: 0,
      active: 0,
      avgPricePerLiter: 0,
      totalProduction: 0,
    }
    try {
      const suppliersWhere: any = {}
      const collectionsWhere: any = {}
      if (targetMccId) {
        collectionsWhere.mccId = targetMccId
      }
      
      // Count unique farmers as suppliers
      const uniqueFarmers = await prisma.farmers.findMany({
        where: {
          ...(targetMccId ? { mccId: targetMccId } : {}),
        },
        select: {
          id: true,
          lastCollectionDate: true,
        },
        distinct: ["id"],
      })
      
      const activeFarmers = uniqueFarmers.filter(
        (f) => f.lastCollectionDate && new Date(f.lastCollectionDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )
      
      const avgPrice = await prisma.milk_collections.aggregate({
        where: collectionsWhere,
        _avg: {
          unitPrice: true,
        },
      })
      
      const totalProduction = await prisma.milk_collections.aggregate({
        where: collectionsWhere,
        _sum: {
          totalLiters: true,
        },
      })
      
      suppliersStats = {
        total: uniqueFarmers.length,
        active: activeFarmers.length,
        avgPricePerLiter: avgPrice._avg?.unitPrice || 0,
        totalProduction: totalProduction._sum?.totalLiters || 0,
      }
    } catch (error) {
      console.warn("Could not fetch suppliers stats:", error)
    }

    // Collections statistics
    let collectionsStats: any = {
      total: 0,
      accepted: 0,
      pending: 0,
      totalVolume: 0,
    }
    try {
      const collectionsWhere: any = {}
      if (targetMccId) {
        collectionsWhere.mccId = targetMccId
      }
      
      const totalCollections = await prisma.milk_collections.count({
        where: collectionsWhere,
      })
      
      const acceptedCollections = await prisma.milk_collections.count({
        where: {
          ...collectionsWhere,
          status: "APPROVED",
        },
      })
      
      const pendingCollections = await prisma.milk_collections.count({
        where: {
          ...collectionsWhere,
          status: "PENDING",
        },
      })
      
      const totalVolume = await prisma.milk_collections.aggregate({
        where: collectionsWhere,
        _sum: {
          totalLiters: true,
        },
      })
      
      collectionsStats = {
        total: totalCollections,
        accepted: acceptedCollections,
        pending: pendingCollections,
        totalVolume: totalVolume._sum?.totalLiters || 0,
      }
    } catch (error) {
      console.warn("Could not fetch collections stats:", error)
    }

    // Recent activity (last 5 collections)
    let recentActivity: any[] = []
    try {
      const collectionsWhere: any = {}
      if (targetMccId) {
        collectionsWhere.mccId = targetMccId
      }
      
      recentActivity = await prisma.milk_collections.findMany({
        where: collectionsWhere,
        include: {
          farmers: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: {
          collectionDate: "desc",
        },
        take: 5,
      })
    } catch (error) {
      console.warn("Could not fetch recent activity:", error)
    }

    // Collection vs Sales trends (last 30 days)
    let trendsData: any = {
      collections: [],
      sales: [],
    }
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      // Get daily collections for last 30 days
      const dailyCollections = await prisma.milk_collections.findMany({
        where: {
          ...(targetMccId ? { mccId: targetMccId } : {}),
          collectionDate: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          collectionDate: true,
          totalLiters: true,
        },
      })
      
      // Get daily sales for last 30 days
      const dailySales = await prisma.mcc_sales.findMany({
        where: {
          ...(targetMccId ? { mccId: targetMccId } : {}),
          saleDate: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          saleDate: true,
          litersSold: true,
        },
      })
      
      // Group by day
      const collectionsByDay: Record<string, number> = {}
      const salesByDay: Record<string, number> = {}
      
      dailyCollections.forEach((c) => {
        const day = new Date(c.collectionDate).toISOString().split("T")[0]
        collectionsByDay[day] = (collectionsByDay[day] || 0) + c.totalLiters
      })
      
      dailySales.forEach((s) => {
        const day = new Date(s.saleDate).toISOString().split("T")[0]
        salesByDay[day] = (salesByDay[day] || 0) + s.litersSold
      })
      
      // Create array of last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        const day = date.toISOString().split("T")[0]
        trendsData.collections.push({
          date: day,
          liters: collectionsByDay[day] || 0,
        })
        trendsData.sales.push({
          date: day,
          liters: salesByDay[day] || 0,
        })
      }
    } catch (error) {
      console.warn("Could not fetch trends data:", error)
    }

    return NextResponse.json({
      success: true,
      data: {
        dailyVolume: {
          liters: dailyVolume._sum?.totalLiters || 0,
          collections: dailyVolume._count?.id || 0,
        },
        payoutDue: {
          amount: payoutDue._sum?.netPayment || 0,
          totalAmount: payoutDue._sum?.totalAmount || 0,
          collections: payoutDue._count?.id || 0,
        },
        lowStockAlerts: lowStockProducts.map((p) => ({
          id: p.id,
          name: p.name,
          barcode: p.barcode,
          currentStock: p.stock,
          reorderPoint: p.reorderPoint,
          alert: `Stock is below reorder point (${p.stock} <= ${p.reorderPoint})`,
        })),
        rentalAssetsOut: rentalAssetsOut.map((r) => ({
          id: r.id,
          asset: r.asset,
          farmer: r.farmer,
          rentStart: r.rentStart,
          rentEnd: r.rentEnd,
          daysOut: r.rentStart
            ? Math.floor(
                (Date.now() - new Date(r.rentStart).getTime()) / (1000 * 60 * 60 * 24)
              )
            : 0,
        })),
        farmers: {
          total: totalFarmers,
          active: activeFarmers,
        },
        qualityMetrics: qualityMetrics.reduce(
          (acc, q) => {
            acc[q.qualityStatus] = {
              count: q._count.id,
              liters: q._sum.totalLiters || 0,
            }
            return acc
          },
          {} as Record<string, { count: number; liters: number }>
        ),
        // New statistics
        sales: salesStats,
        customers: customersStats,
        suppliers: suppliersStats,
        collections: collectionsStats,
        recentActivity: recentActivity.map((a) => ({
          id: a.id,
          type: "collection",
          description: `collection from ${a.farmers?.name || "Unknown"}`,
          date: a.collectionDate,
          amount: a.netPayment || a.totalAmount || 0,
          farmer: a.farmers,
        })),
        trends: trendsData,
        date,
        mccId: targetMccId,
      },
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

