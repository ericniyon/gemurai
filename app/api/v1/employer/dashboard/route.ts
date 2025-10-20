import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/api-auth"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 EMPLOYER Dashboard API called")
    
    const auth = await verifyAuth(request)
    if (!auth.success) {
      console.log("❌ Auth failed:", auth.message)
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status })
    }

    console.log("✅ Auth successful for user:", auth.user.id)

    // Check if user has EMPLOYER role
    if (auth.user.role !== "EMPLOYER") {
      console.log("❌ User is not EMPLOYER:", auth.user.role)
      return NextResponse.json(
        { success: false, message: "Access denied - EMPLOYER role required" },
        { status: 403 }
      )
    }

    console.log("🔍 Starting to fetch dashboard data...")
    
    // Get current month boundaries
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    
    console.log("📅 Date boundaries:", { startOfMonth, startOfLastMonth, endOfLastMonth })

    console.log("🔍 Fetching dashboard data from database...")
    
    // Check if required tables exist
    try {
      await prisma.user.findFirst()
      await prisma.stockOrder.findFirst()
      await prisma.product.findFirst()
      await prisma.voucher.findFirst()
      await prisma.application.findFirst()
      console.log("✅ All required tables exist")
    } catch (error) {
      console.error("❌ Some tables don't exist:", error)
      return NextResponse.json(
        { 
          success: false, 
          message: "Database tables not found",
          error: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      )
    }
    
    // Fetch all dashboard data in parallel with error handling
    const [
      // Stock Orders
      totalStockOrders,
      completedStockOrders,
      pendingStockOrders,
      stockOrdersThisMonth,
      stockOrdersLastMonth,
      
      // DCC Users
      totalDCCs,
      activeDCCs,
      dccsThisMonth,
      dccsLastMonth,
      
      // Inventory
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockQuantity,
      
      // Vouchers
      totalVouchers,
      activeVouchers,
      vouchersThisMonth,
      vouchersLastMonth,
      voucherValueStats,
      
      // Applications
      totalApplications,
      pendingApplications,
      approvedApplications,
      applicationsThisMonth,
      applicationsLastMonth,
      
      // Revenue (from transactions)
      revenueStats
    ] = await Promise.allSettled([
      // Stock Orders
      prisma.stockOrder.count(),
      prisma.stockOrder.count({ where: { status: "COMPLETED" } }),
      prisma.stockOrder.count({ where: { status: "PENDING" } }),
      prisma.stockOrder.count({ 
        where: { 
          createdAt: { gte: startOfMonth } 
        } 
      }),
      prisma.stockOrder.count({ 
        where: { 
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        } 
      }),
      
      // DCC Users
      prisma.user.count({ 
        where: { 
          userRole: {
            isActive: true,
            role: {
              name: "DCC"
            }
          },
          isActive: true
        } 
      }),
      prisma.user.count({ 
        where: { 
          userRole: {
            isActive: true,
            role: {
              name: "DCC"
            }
          },
          isActive: true
        } 
      }), // For now, all DCCs are considered active
      prisma.user.count({ 
        where: { 
          userRole: {
            isActive: true,
            role: {
              name: "DCC"
            }
          },
          createdAt: { gte: startOfMonth }
        } 
      }),
      prisma.user.count({ 
        where: { 
          userRole: {
            isActive: true,
            role: {
              name: "DCC"
            }
          },
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        } 
      }),
      
      // Inventory
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
      }),
      
      // Vouchers
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
      }),
      prisma.voucher.aggregate({
        _sum: {
          value: true,
          remainingBalance: true
        }
      }),
      
      // Applications
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
      prisma.application.count({ 
        where: { 
          status: "APPROVED" 
        } 
      }),
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
      }),
      
      // Revenue (from transactions)
      prisma.transaction.aggregate({
        where: {
          type: "DEPOSIT",
          status: "COMPLETED"
        },
        _sum: {
          amount: true
        }
      })
    ])

    // Extract values from Promise.allSettled results
    const extractValue = (result: PromiseSettledResult<any>, defaultValue: any = 0) => {
      return result.status === 'fulfilled' ? result.value : defaultValue
    }

    const extractedData = {
      totalStockOrders: extractValue(totalStockOrders),
      completedStockOrders: extractValue(completedStockOrders),
      pendingStockOrders: extractValue(pendingStockOrders),
      stockOrdersThisMonth: extractValue(stockOrdersThisMonth),
      stockOrdersLastMonth: extractValue(stockOrdersLastMonth),
      totalDCCs: extractValue(totalDCCs),
      activeDCCs: extractValue(activeDCCs),
      dccsThisMonth: extractValue(dccsThisMonth),
      dccsLastMonth: extractValue(dccsLastMonth),
      totalProducts: extractValue(totalProducts),
      lowStockProducts: extractValue(lowStockProducts),
      outOfStockProducts: extractValue(outOfStockProducts),
      totalStockQuantity: extractValue(totalStockQuantity),
      totalVouchers: extractValue(totalVouchers),
      activeVouchers: extractValue(activeVouchers),
      vouchersThisMonth: extractValue(vouchersThisMonth),
      vouchersLastMonth: extractValue(vouchersLastMonth),
      voucherValueStats: extractValue(voucherValueStats, { _sum: { value: 0, remainingBalance: 0 } }),
      totalApplications: extractValue(totalApplications),
      pendingApplications: extractValue(pendingApplications),
      approvedApplications: extractValue(approvedApplications),
      applicationsThisMonth: extractValue(applicationsThisMonth),
      applicationsLastMonth: extractValue(applicationsLastMonth),
      revenueStats: extractValue(revenueStats, { _sum: { amount: 0 } })
    }

    console.log("✅ Dashboard data fetched successfully")
    console.log("📊 Data summary:", {
      totalStockOrders: extractedData.totalStockOrders,
      totalDCCs: extractedData.totalDCCs,
      totalProducts: extractedData.totalProducts,
      totalVouchers: extractedData.totalVouchers,
      totalApplications: extractedData.totalApplications
    })

    // Calculate growth rates
    const stockOrdersGrowth = extractedData.stockOrdersLastMonth > 0 
      ? Math.round(((extractedData.stockOrdersThisMonth - extractedData.stockOrdersLastMonth) / extractedData.stockOrdersLastMonth) * 100)
      : extractedData.stockOrdersThisMonth > 0 ? 100 : 0

    const dccsGrowth = extractedData.dccsLastMonth > 0 
      ? Math.round(((extractedData.dccsThisMonth - extractedData.dccsLastMonth) / extractedData.dccsLastMonth) * 100)
      : extractedData.dccsThisMonth > 0 ? 100 : 0

    const vouchersGrowth = extractedData.vouchersLastMonth > 0 
      ? Math.round(((extractedData.vouchersThisMonth - extractedData.vouchersLastMonth) / extractedData.vouchersLastMonth) * 100)
      : extractedData.vouchersThisMonth > 0 ? 100 : 0

    const applicationsGrowth = extractedData.applicationsLastMonth > 0 
      ? Math.round(((extractedData.applicationsThisMonth - extractedData.applicationsLastMonth) / extractedData.applicationsLastMonth) * 100)
      : extractedData.applicationsThisMonth > 0 ? 100 : 0

    // Calculate voucher usage rate
    const totalVoucherValue = extractedData.voucherValueStats._sum.value || 0
    const remainingVoucherValue = extractedData.voucherValueStats._sum.remainingBalance || 0
    const usedVoucherValue = totalVoucherValue - remainingVoucherValue
    const voucherUsageRate = totalVoucherValue > 0 
      ? Math.round((usedVoucherValue / totalVoucherValue) * 100)
      : 0

    // Calculate DCC active rate (simplified - could be enhanced with actual activity tracking)
    const dccActiveRate = extractedData.totalDCCs > 0 ? Math.round((extractedData.activeDCCs / extractedData.totalDCCs) * 100) : 0

    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          total: extractedData.revenueStats._sum.amount || 0,
          transactions: extractedData.totalStockOrders // Using stock orders as transaction count
        },
        stockOrders: {
          total: extractedData.totalStockOrders,
          completed: extractedData.completedStockOrders,
          pending: extractedData.pendingStockOrders,
          growth: stockOrdersGrowth
        },
        dccs: {
          total: extractedData.totalDCCs,
          active: extractedData.activeDCCs,
          activeRate: dccActiveRate,
          growth: dccsGrowth
        },
        inventory: {
          totalProducts: extractedData.totalProducts,
          totalQuantity: extractedData.totalStockQuantity._sum?.quantity || 0,
          lowStock: extractedData.lowStockProducts,
          outOfStock: extractedData.outOfStockProducts
        },
        vouchers: {
          total: extractedData.totalVouchers,
          active: extractedData.activeVouchers,
          totalValue: totalVoucherValue,
          usedValue: usedVoucherValue,
          usageRate: voucherUsageRate,
          growth: vouchersGrowth
        },
        applications: {
          total: extractedData.totalApplications,
          pending: extractedData.pendingApplications,
          approved: extractedData.approvedApplications,
          growth: applicationsGrowth
        }
      }
    })

  } catch (error) {
    console.error("Error fetching EMPLOYER dashboard data:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
