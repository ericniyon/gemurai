import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api-auth"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Branch Manager Dashboard API called")
    
    const auth = await verifyAuth(request)
    if (!auth.success) {
      console.log("❌ Auth failed:", auth.message)
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status })
    }

    console.log("✅ Auth successful for user:", auth.user.id)

    // Check if user has BRANCH_MANAGER role assignment
    console.log("🔍 Checking BRANCH_MANAGER role assignment...")
    const userRoleAssignment = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: auth.user.id,
        isActive: true,
        role: { name: "BRANCH_MANAGER" }
      },
      include: { role: true }
    })

    if (!userRoleAssignment) {
      console.log("❌ No BRANCH_MANAGER role assignment found")
      return NextResponse.json({ success: false, message: "Access denied. Only branch managers can access this endpoint." }, { status: 403 })
    }

    console.log("✅ BRANCH_MANAGER role assignment confirmed")

    try {
      // Test database connection
      console.log("🔍 Testing database connection...")
      await prisma.$connect()
      console.log("✅ Database connected successfully")

      // Get current date for filtering
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    console.log("🔍 Fetching applications data...")
    // Fetch applications data
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      applicationsThisMonth,
      applicationsLastMonth
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({
        where: {
          OR: [
            { status: "SUBMITTED" },
            { status: "UNDER_REVIEW" },
            { status: "PENDING_DOCUMENTS" }
          ]
        }
      }),
      prisma.application.count({ where: { status: "APPROVED" } }),
      prisma.application.count({ where: { status: "REJECTED" } }),
      prisma.application.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),
      prisma.application.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      })
    ])

    console.log("✅ Applications data fetched:", {
      total: totalApplications,
      pending: pendingApplications,
      approved: approvedApplications,
      rejected: rejectedApplications
    })

    console.log("🔍 Fetching inventory data...")
    // Fetch inventory data
    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue
    ] = await Promise.all([
      prisma.product.count(),
      prisma.stockQuantity.count({
        where: {
          quantity: { lt: 10 }
        }
      }),
      prisma.stockQuantity.count({
        where: {
          quantity: { lte: 0 }
        }
      }),
      prisma.stockQuantity.aggregate({
        _sum: {
          quantity: true
        }
      })
    ])

    console.log("✅ Inventory data fetched:", {
      totalProducts,
      lowStockProducts,
      outOfStockProducts
    })

    // Calculate stock value (simplified - would need product prices)
    const stockValue = totalStockValue._sum.quantity ? totalStockValue._sum.quantity * 1000 : 0 // Mock calculation

    // Fetch voucher data
    const [
      totalVouchers,
      activeVouchers,
      vouchersThisMonth,
      vouchersLastMonth
    ] = await Promise.all([
      prisma.voucher.count(),
      prisma.voucher.count({
        where: {
          OR: [
            { status: "ACTIVE" },
            { status: "PARTIALLY_USED" }
          ]
        }
      }),
      prisma.voucher.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),
      prisma.voucher.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      })
    ])

    console.log("🔍 Fetching DCC data...")
    
    // First get DCC user IDs
    const dccUsers = await prisma.user.findMany({
      where: {
        userRole: {
          role: { name: "DCC" }
        }
      },
      select: { id: true }
    })
    
    const dccUserIds = dccUsers.map(user => user.id)
    console.log("✅ Found DCC user IDs:", dccUserIds.length)
    
    // If no DCC users found, use empty array to avoid query errors
    const safeDccUserIds = dccUserIds.length > 0 ? dccUserIds : ['']
    
    // Fetch DCC data
    const [
      totalDCCs,
      activeDCCs,
      dccsThisMonth,
      dccsLastMonth,
      dccApplications,
      dccApprovedApplications,
      dccSales,
      dccProfits
    ] = await Promise.all([
      prisma.user.count({
        where: {
          userRole: {
            role: { name: "DCC" }
          }
        }
      }),
      prisma.user.count({
        where: {
          userRole: {
            role: { name: "DCC" }
          },
          isActive: true
        }
      }),
      prisma.user.count({
        where: {
          userRole: {
            role: { name: "DCC" }
          },
          createdAt: { gte: startOfMonth }
        }
      }),
      prisma.user.count({
        where: {
          userRole: {
            role: { name: "DCC" }
          },
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),
      prisma.application.count({
        where: {
          userId: {
            in: safeDccUserIds
          }
        }
      }),
      prisma.application.count({
        where: {
          userId: {
            in: safeDccUserIds
          },
          status: "APPROVED"
        }
      }),
      prisma.sale.aggregate({
        where: {
          dccId: {
            in: safeDccUserIds
          }
        },
        _sum: {
          totalRevenue: true
        }
      }),
      // Calculate DCC earnings based on sales profit
      prisma.sale.aggregate({
        where: {
          dccId: {
            in: safeDccUserIds
          }
        },
        _sum: {
          profit: true
        }
      })
    ])

    console.log("✅ DCC data fetched:", {
      totalDCCs,
      activeDCCs,
      dccsThisMonth,
      dccsLastMonth,
      dccApplications,
      dccApprovedApplications,
      totalSales: dccSales._sum.totalRevenue || 0,
      totalProfits: dccProfits._sum.profit || 0
    })

    // Calculate growth percentages
    const applicationsGrowth = applicationsLastMonth > 0 
      ? Math.round(((applicationsThisMonth - applicationsLastMonth) / applicationsLastMonth) * 100)
      : 0

    const vouchersGrowth = vouchersLastMonth > 0 
      ? Math.round(((vouchersThisMonth - vouchersLastMonth) / vouchersLastMonth) * 100)
      : 0

    const dccsGrowth = dccsLastMonth > 0 
      ? Math.round(((dccsThisMonth - dccsLastMonth) / dccsLastMonth) * 100)
      : 0

    // Calculate stock growth (mock data)
    const stockGrowth = Math.round(Math.random() * 20) + 5 // 5-25% growth

    // Prepare dashboard data
    const dashboardData = {
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
        thisMonth: applicationsThisMonth,
        growth: applicationsGrowth
      },
      inventory: {
        totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        inStock: totalProducts - lowStockProducts - outOfStockProducts,
        totalValue: stockValue,
        growth: stockGrowth
      },
      vouchers: {
        total: totalVouchers,
        active: activeVouchers,
        thisMonth: vouchersThisMonth,
        growth: vouchersGrowth,
        totalValue: activeVouchers * 5000 // Mock calculation
      },
      performance: {
        applicationApprovalRate: totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0,
        stockAvailability: totalProducts > 0 ? Math.round(((totalProducts - outOfStockProducts) / totalProducts) * 100) : 0,
        voucherUtilization: totalVouchers > 0 ? Math.round((activeVouchers / totalVouchers) * 100) : 0
      },
      alerts: {
        lowStockItems: lowStockProducts,
        pendingApplications: pendingApplications,
        outOfStockItems: outOfStockProducts
      },
      dcc: {
        total: totalDCCs,
        active: activeDCCs,
        thisMonth: dccsThisMonth,
        growth: dccsGrowth,
        applications: {
          total: dccApplications,
          approved: dccApprovedApplications,
          approvalRate: dccApplications > 0 ? Math.round((dccApprovedApplications / dccApplications) * 100) : 0
        },
        sales: {
          total: dccSales._sum.totalRevenue || 0,
          average: activeDCCs > 0 ? Math.round((dccSales._sum.totalRevenue || 0) / activeDCCs) : 0
        },
        earnings: {
          total: dccProfits._sum.profit || 0,
          average: activeDCCs > 0 ? Math.round((dccProfits._sum.profit || 0) / activeDCCs) : 0
        },
        performance: {
          activeRate: totalDCCs > 0 ? Math.round((activeDCCs / totalDCCs) * 100) : 0,
          averageSales: activeDCCs > 0 ? Math.round((dccSales._sum.totalRevenue || 0) / activeDCCs) : 0,
          averageEarnings: activeDCCs > 0 ? Math.round((dccProfits._sum.profit || 0) / activeDCCs) : 0
        }
      }
    }

      return NextResponse.json({
        success: true,
        data: dashboardData,
        message: "Branch manager dashboard data retrieved successfully"
      })

    } catch (dbError: any) {
      console.error("❌ Database query error:", dbError)
      return NextResponse.json({ 
        success: false, 
        message: "Database query failed", 
        error: dbError.message 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("❌ General error in branch manager dashboard:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch dashboard data", 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
