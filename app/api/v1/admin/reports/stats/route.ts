import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/admin/reports/stats - Real DB stats for admin reports page
 */
export async function GET(req: NextRequest) {
  try {
    const authToken =
      req.headers.get("authorization")?.replace("Bearer ", "") ||
      req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalMCCs,
      totalFarmers,
      totalCollections,
      todayCollections,
      monthCollections,
      totalSalesCount,
      monthSalesCount,
      collectionsRevenue,
      todayRevenue,
      monthRevenue,
      paymentsCount,
      monthPaymentsCount,
      paymentsAmount,
      monthPaymentsAmount,
    ] = await Promise.all([
      prisma.mccs.count({ where: { isActive: true } }),
      prisma.farmers.count(),
      prisma.milk_collections.count(),
      prisma.milk_collections.count({
        where: { collectionDate: { gte: startOfToday } },
      }),
      prisma.milk_collections.count({
        where: { collectionDate: { gte: startOfMonth } },
      }),
      prisma.sales.count(),
      prisma.sales.count({
        where: { saleAt: { gte: startOfMonth } },
      }),
      prisma.milk_collections.aggregate({
        _sum: { totalAmount: true, totalLiters: true },
      }),
      prisma.milk_collections.aggregate({
        where: { collectionDate: { gte: startOfToday } },
        _sum: { totalAmount: true, totalLiters: true },
      }),
      prisma.milk_collections.aggregate({
        where: { collectionDate: { gte: startOfMonth } },
        _sum: { totalAmount: true, totalLiters: true },
      }),
      prisma.mcc_payments.count(),
      prisma.mcc_payments.count({
        where: { paymentDate: { gte: startOfMonth } },
      }),
      prisma.mcc_payments.aggregate({
        _sum: { netPayment: true },
      }),
      prisma.mcc_payments.aggregate({
        where: { paymentDate: { gte: startOfMonth } },
        _sum: { netPayment: true },
      }),
    ])

    const totalRevenue = Number(collectionsRevenue._sum.totalAmount ?? 0)
    const totalLiters = Number(collectionsRevenue._sum.totalLiters ?? 0)
    const totalPaymentsAmount = Number(paymentsAmount._sum.netPayment ?? 0)

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalMCCs,
          totalFarmers,
          totalCollections,
          totalSales: totalSalesCount,
          totalPayments: paymentsCount,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalLiters: Math.round(totalLiters * 100) / 100,
          totalPaymentsAmount: Math.round(totalPaymentsAmount * 100) / 100,
        },
        today: {
          collections: todayCollections,
          revenue: Math.round(Number(todayRevenue._sum.totalAmount ?? 0) * 100) / 100,
          liters: Math.round(Number(todayRevenue._sum.totalLiters ?? 0) * 100) / 100,
        },
        thisMonth: {
          collections: monthCollections,
          sales: monthSalesCount,
          payments: monthPaymentsCount,
          revenue: Math.round(Number(monthRevenue._sum.totalAmount ?? 0) * 100) / 100,
          liters: Math.round(Number(monthRevenue._sum.totalLiters ?? 0) * 100) / 100,
          paymentsAmount: Math.round(Number(monthPaymentsAmount._sum.netPayment ?? 0) * 100) / 100,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching admin report stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch report stats",
        details: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
