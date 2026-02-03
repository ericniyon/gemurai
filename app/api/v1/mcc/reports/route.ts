import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"
import { cacheService } from "@/lib/services/redis-service"
import { CACHE_TTL } from "@/lib/services/cache-config"

// POST /api/v1/mcc/reports - Generate a report
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.reports.generate"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    
    // Validate required fields
    if (!data.reportType || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: "Missing required fields: reportType, startDate, endDate" },
        { status: 400 }
      )
    }

    const { reportType, startDate, endDate, mccId, format = 'pdf' } = data

    // Fetch data based on report type
    let reportData = {}

    // If user is MCC_MANAGER, verify they own this MCC
    if (user.role === "MCC_MANAGER" && mccId && user.mccId !== mccId) {
      return NextResponse.json({ error: "Unauthorized for this MCC" }, { status: 403 })
    }

    reportData = await generateReportData({ reportType, mccId, startDate, endDate, farmerId: data.farmerId })

    // Generate report file (simplified - in production you'd use libraries like puppeteer for PDF, xlsx for Excel)
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const generatedAt = new Date().toISOString()

    // Store report in cache for download (1 hour TTL)
    const reportPayload = {
      reportId,
      reportType,
      format,
      generatedAt,
      mccId,
      startDate,
      endDate,
      ...reportData
    }
    await cacheService.set(`mcc_report:${reportId}`, reportPayload, CACHE_TTL.LONG)

    return NextResponse.json({
      success: true,
      message: "Report generated successfully",
      data: {
        reportId,
        reportType,
        format,
        generatedAt,
        downloadUrl: `/api/v1/mcc/reports/${reportId}/download`,
        ...reportData
      }
    })
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate report",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions for different report types
async function generateSummaryReport(mccId: string | undefined, startDate: string, endDate: string) {
  const collections = await prisma.milk_collections.findMany({
    where: {
      ...(mccId && { mccId }),
      collectionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    include: {
      farmers: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      }
    }
  })

  const payments = await prisma.mcc_payments.findMany({
    where: {
      ...(mccId && { mccId }),
      paymentDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
  })

  const totalCollections = collections.length
  const totalLiters = collections.reduce((sum, c) => sum + (c.totalLiters || 0), 0)
  const totalAmount = collections.reduce((sum, c) => sum + (c.totalAmount || 0), 0)
  const totalPayments = payments.reduce((sum, p) => sum + (p.netPayment || 0), 0)
  const uniqueFarmers = new Set(collections.map(c => c.farmerId)).size

  return {
    summary: {
      totalCollections,
      totalLiters,
      totalAmount,
      totalPayments,
      uniqueFarmers,
      averagePerFarmer: uniqueFarmers > 0 ? totalAmount / uniqueFarmers : 0
    },
    collections: collections.slice(0, 100), // Limit for performance
    payments: payments.slice(0, 100)
  }
}

async function generateFarmerReport(mccId: string | undefined, startDate: string, endDate: string, farmerId?: string) {
  const whereClause: any = {
    ...(mccId && { mccId }),
    collectionDate: {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  }

  if (farmerId) {
    whereClause.farmerId = farmerId
  }

  const collections = await prisma.milk_collections.findMany({
    where: whereClause,
    include: {
      farmers: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      }
    },
    orderBy: { collectionDate: 'desc' }
  })

  // Group by farmer
  const farmerStats = collections.reduce((acc: any, collection) => {
    const farmerId = collection.farmerId
    if (!acc[farmerId]) {
      acc[farmerId] = {
        farmer: collection.farmers,
        totalLiters: 0,
        totalAmount: 0,
        collections: 0,
        collectionsList: []
      }
    }
    acc[farmerId].totalLiters += collection.totalLiters || 0
    acc[farmerId].totalAmount += collection.totalAmount || 0
    acc[farmerId].collections += 1
    acc[farmerId].collectionsList.push(collection)
    return acc
  }, {})

  return {
    farmerStats: Object.values(farmerStats),
    totalFarmers: Object.keys(farmerStats).length
  }
}

async function generateFinancialReport(mccId: string | undefined, startDate: string, endDate: string) {
  const collections = await prisma.milk_collections.findMany({
    where: {
      ...(mccId && { mccId }),
      collectionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
  })

  const payments = await prisma.mcc_payments.findMany({
    where: {
      ...(mccId && { mccId }),
      paymentDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
  })

  const totalRevenue = collections.reduce((sum, c) => sum + (c.totalAmount || 0), 0)
  const totalDeductions = collections.reduce((sum, c) => sum + (c.totalDeductions || 0), 0)
  const totalPayments = payments.reduce((sum, p) => sum + (p.netPayment || 0), 0)
  const netRevenue = totalRevenue - totalDeductions

  return {
    financial: {
      totalRevenue,
      totalDeductions,
      totalPayments,
      netRevenue,
      paymentRate: totalRevenue > 0 ? (totalPayments / totalRevenue) * 100 : 0
    },
    collections,
    payments
  }
}

async function generatePeriodReport(mccId: string | undefined, startDate: string, endDate: string) {
  const collections = await prisma.milk_collections.findMany({
    where: {
      ...(mccId && { mccId }),
      collectionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    include: {
      farmers: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { collectionDate: 'desc' }
  })

  // Group by date
  const dailyStats = collections.reduce((acc: any, collection) => {
    const date = collection.collectionDate.toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = {
        date,
        totalLiters: 0,
        totalAmount: 0,
        collections: 0,
        farmers: new Set()
      }
    }
    acc[date].totalLiters += collection.totalLiters || 0
    acc[date].totalAmount += collection.totalAmount || 0
    acc[date].collections += 1
    acc[date].farmers.add(collection.farmerId)
    return acc
  }, {})

  // Convert Set to count
  Object.values(dailyStats).forEach((day: any) => {
    day.uniqueFarmers = day.farmers.size
    delete day.farmers
  })

  return {
    period: {
      startDate,
      endDate,
      totalDays: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)),
      totalCollections: collections.length
    },
    dailyStats: Object.values(dailyStats),
    collections
  }
}

async function generateAnalyticsReport(mccId: string | undefined, startDate: string, endDate: string) {
  const collections = await prisma.milk_collections.findMany({
    where: {
      ...(mccId && { mccId }),
      collectionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    include: {
      farmers: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  // Calculate trends
  const monthlyData: { [key: string]: { liters: number, amount: number, collections: number } } = {}
  collections.forEach(collection => {
    const date = new Date(collection.collectionDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { liters: 0, amount: 0, collections: 0 }
    }
    monthlyData[monthKey].liters += collection.totalLiters || 0
    monthlyData[monthKey].amount += collection.totalAmount || 0
    monthlyData[monthKey].collections += 1
  })

  const monthlyTrend = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      ...data
    }))

  // Top farmers
  const farmerStats = collections.reduce((acc: any, collection) => {
    const farmerId = collection.farmerId
    if (!acc[farmerId]) {
      acc[farmerId] = {
        farmer: collection.farmers,
        totalLiters: 0,
        totalAmount: 0,
        collections: 0
      }
    }
    acc[farmerId].totalLiters += collection.totalLiters || 0
    acc[farmerId].totalAmount += collection.totalAmount || 0
    acc[farmerId].collections += 1
    return acc
  }, {})

  const topFarmers = Object.values(farmerStats)
    .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
    .slice(0, 10)

  return {
    analytics: {
      totalCollections: collections.length,
      totalLiters: collections.reduce((sum, c) => sum + (c.totalLiters || 0), 0),
      totalAmount: collections.reduce((sum, c) => sum + (c.totalAmount || 0), 0),
      uniqueFarmers: Object.keys(farmerStats).length
    },
    monthlyTrend,
    topFarmers
  }
}

// Quality report: rejection rates, antibiotic fails, quality metrics
async function generateQualityReport(mccId: string | undefined, startDate: string, endDate: string) {
  const collections = await prisma.milk_collections.findMany({
    where: {
      ...(mccId && { mccId }),
      collectionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
  })

  const totalLiters = collections.reduce((sum, c) => sum + (c.totalLiters || 0), 0)
  const rejectedLiters = collections
    .filter(c => c.qualityStatus === "rejected")
    .reduce((sum, c) => sum + (c.totalLiters || 0), 0)
  
  const rejectionRate = totalLiters > 0 ? (rejectedLiters / totalLiters) * 100 : 0
  
  const antibioticFails = collections.filter(c => c.antibioticTest === true).length
  const antibioticFailRate = collections.length > 0 ? (antibioticFails / collections.length) * 100 : 0

  const avgFat = collections
    .filter(c => c.fat !== null)
    .reduce((sum, c, _, arr) => sum + (c.fat || 0) / arr.length, 0)
  
  const avgProtein = collections
    .filter(c => c.protein !== null)
    .reduce((sum, c, _, arr) => sum + (c.protein || 0) / arr.length, 0)

  return {
    quality: {
      totalCollections: collections.length,
      totalLiters,
      rejectedLiters,
      rejectionRate: parseFloat(rejectionRate.toFixed(2)),
      antibioticFails,
      antibioticFailRate: parseFloat(antibioticFailRate.toFixed(2)),
      avgFat: parseFloat(avgFat.toFixed(3)),
      avgProtein: parseFloat(avgProtein.toFixed(3)),
    },
    qualityBreakdown: {
      accepted: collections.filter(c => c.qualityStatus === "accepted").length,
      rejected: collections.filter(c => c.qualityStatus === "rejected").length,
      pending: collections.filter(c => c.qualityStatus === "pending").length,
    }
  }
}

// Sales report: product sales, top products, sales by category
async function generateSalesReport(mccId: string | undefined, startDate: string, endDate: string) {
  const sales = await prisma.sales.findMany({
    where: {
      ...(mccId && { mccId }),
      saleAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              category: true,
            }
          }
        }
      }
    }
  })

  const totalSales = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  const cashSales = sales.filter(s => s.paymentMethod === "CASH").reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  const creditSales = sales.filter(s => s.paymentMethod === "CREDIT").reduce((sum, s) => sum + (s.totalAmount || 0), 0)

  // Top products by sales
  const productSales: { [key: string]: { product: any, qty: number, amount: number } } = {}
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const productId = item.productId
      if (!productSales[productId]) {
        productSales[productId] = {
          product: item.product,
          qty: 0,
          amount: 0
        }
      }
      productSales[productId].qty += item.qty
      productSales[productId].amount += item.qty * item.unitPrice
    })
  })

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)

  return {
    sales: {
      totalSales,
      totalTransactions: sales.length,
      cashSales,
      creditSales,
      averageTransaction: sales.length > 0 ? totalSales / sales.length : 0
    },
    topProducts,
    salesByCategory: Object.values(productSales).reduce((acc: any, ps) => {
      const category = ps.product.category || "Other"
      if (!acc[category]) acc[category] = { amount: 0, qty: 0 }
      acc[category].amount += ps.amount
      acc[category].qty += ps.qty
      return acc
    }, {})
  }
}

// Rentals report: rental income, active rentals, returns
async function generateRentalsReport(mccId: string | undefined, startDate: string, endDate: string) {
  const rentals = await prisma.rentals.findMany({
    where: {
      ...(mccId && { mccId }),
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    include: {
      asset: {
        select: {
          id: true,
          serial: true,
          name: true,
          assetType: true,
        }
      },
      farmer: {
        select: {
          id: true,
          name: true,
          farmerCode: true,
        }
      }
    }
  })

  const activeRentals = rentals.filter(r => !r.returned)
  const returnedRentals = rentals.filter(r => r.returned)

  // Calculate rental income
  const rentalIncome = rentals.reduce((sum, r) => {
    if (r.rentStart && r.rentFeePerDay) {
      const daysRented = r.returned && r.returnedAt
        ? Math.ceil((new Date(r.returnedAt).getTime() - new Date(r.rentStart).getTime()) / (1000 * 60 * 60 * 24))
        : Math.ceil((Date.now() - new Date(r.rentStart).getTime()) / (1000 * 60 * 60 * 24))
      return sum + (daysRented * r.rentFeePerDay)
    }
    return sum
  }, 0)

  return {
    rentals: {
      totalRentals: rentals.length,
      activeRentals: activeRentals.length,
      returnedRentals: returnedRentals.length,
      rentalIncome: parseFloat(rentalIncome.toFixed(2)),
    },
    activeRentals: activeRentals.map(r => ({
      ...r,
      daysOut: r.rentStart
        ? Math.ceil((Date.now() - new Date(r.rentStart).getTime()) / (1000 * 60 * 60 * 24))
        : 0
    })),
    returnedRentals: returnedRentals.slice(0, 50)
  }
}

// Daily report: volumes, quality, sales for a specific day
async function generateDailyReport(mccId: string | undefined, startDate: string, endDate: string) {
  const date = new Date(startDate)
  const dayStart = new Date(date.setHours(0, 0, 0, 0))
  const dayEnd = new Date(date.setHours(23, 59, 59, 999))

  const collections = await prisma.milk_collections.findMany({
    where: {
      ...(mccId && { mccId }),
      collectionDate: {
        gte: dayStart,
        lte: dayEnd
      }
    }
  })

  const sales = await prisma.sales.findMany({
    where: {
      ...(mccId && { mccId }),
      saleAt: {
        gte: dayStart,
        lte: dayEnd
      }
    }
  })

  const payments = await prisma.mcc_payments.findMany({
    where: {
      ...(mccId && { mccId }),
      paymentDate: {
        gte: dayStart,
        lte: dayEnd
      }
    }
  })

  return {
    date: dayStart.toISOString().split("T")[0],
    volumes: {
      totalLiters: collections.reduce((sum, c) => sum + (c.totalLiters || 0), 0),
      collections: collections.length,
      acceptedLiters: collections
        .filter(c => c.qualityStatus === "accepted")
        .reduce((sum, c) => sum + (c.totalLiters || 0), 0),
      rejectedLiters: collections
        .filter(c => c.qualityStatus === "rejected")
        .reduce((sum, c) => sum + (c.totalLiters || 0), 0),
    },
    quality: {
      rejectionRate: collections.length > 0
        ? (collections.filter(c => c.qualityStatus === "rejected").length / collections.length) * 100
        : 0,
      antibioticFails: collections.filter(c => c.antibioticTest === true).length,
    },
    sales: {
      totalAmount: sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
      transactions: sales.length,
    },
    payments: {
      totalAmount: payments.reduce((sum, p) => sum + (p.netPayment || 0), 0),
      transactions: payments.length,
    }
  }
}

// Weekly report: aggregated weekly data
async function generateWeeklyReport(mccId: string | undefined, startDate: string, endDate: string) {
  const collections = await prisma.milk_collections.findMany({
    where: {
      ...(mccId && { mccId }),
      collectionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
  })

  // Group by week
  const weeklyData: { [key: string]: any } = {}
  collections.forEach(collection => {
    const date = new Date(collection.collectionDate)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split("T")[0]

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        week: weekKey,
        totalLiters: 0,
        totalAmount: 0,
        collections: 0,
        rejectedLiters: 0,
      }
    }
    weeklyData[weekKey].totalLiters += collection.totalLiters || 0
    weeklyData[weekKey].totalAmount += collection.totalAmount || 0
    weeklyData[weekKey].collections += 1
    if (collection.qualityStatus === "rejected") {
      weeklyData[weekKey].rejectedLiters += collection.totalLiters || 0
    }
  })

  return {
    weeklyData: Object.values(weeklyData).sort((a: any, b: any) => a.week.localeCompare(b.week)),
    summary: {
      totalWeeks: Object.keys(weeklyData).length,
      avgWeeklyLiters: Object.values(weeklyData).reduce((sum: number, w: any) => sum + w.totalLiters, 0) / Object.keys(weeklyData).length,
    }
  }
}

// Monthly report: aggregated monthly data
async function generateMonthlyReport(mccId: string | undefined, startDate: string, endDate: string) {
  const collections = await prisma.milk_collections.findMany({
    where: {
      ...(mccId && { mccId }),
      collectionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
  })

  const sales = await prisma.sales.findMany({
    where: {
      ...(mccId && { mccId }),
      saleAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
  })

  const payments = await prisma.mcc_payments.findMany({
    where: {
      ...(mccId && { mccId }),
      paymentDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
  })

  // Group by month
  const monthlyData: { [key: string]: any } = {}
  
  collections.forEach(collection => {
    const date = new Date(collection.collectionDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        totalLiters: 0,
        totalAmount: 0,
        collections: 0,
        rejectedLiters: 0,
        sales: 0,
        payments: 0,
      }
    }
    monthlyData[monthKey].totalLiters += collection.totalLiters || 0
    monthlyData[monthKey].totalAmount += collection.totalAmount || 0
    monthlyData[monthKey].collections += 1
    if (collection.qualityStatus === "rejected") {
      monthlyData[monthKey].rejectedLiters += collection.totalLiters || 0
    }
  })

  sales.forEach(sale => {
    const date = new Date(sale.saleAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].sales += sale.totalAmount || 0
    }
  })

  payments.forEach(payment => {
    const date = new Date(payment.paymentDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].payments += payment.netPayment || 0
    }
  })

  return {
    monthlyData: Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month)),
    summary: {
      totalMonths: Object.keys(monthlyData).length,
      totalLiters: collections.reduce((sum, c) => sum + (c.totalLiters || 0), 0),
      totalSales: sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
      totalPayments: payments.reduce((sum, p) => sum + (p.netPayment || 0), 0),
    }
  }
}

/** Exported for use by download route - re-generates report when cache miss */
export async function generateReportData(params: {
  reportType: string
  mccId?: string
  startDate: string
  endDate: string
  farmerId?: string
}) {
  const { reportType, mccId, startDate, endDate, farmerId } = params
  // Use mccId when provided; undefined/"all" means no MCC filter
  const mccFilter = mccId && mccId !== "all" ? mccId : undefined
  switch (reportType) {
    case "summary":
      return generateSummaryReport(mccFilter, startDate, endDate)
    case "farmer":
      return generateFarmerReport(mccFilter, startDate, endDate, farmerId)
    case "financial":
      return generateFinancialReport(mccFilter, startDate, endDate)
    case "period":
      return generatePeriodReport(mccFilter, startDate, endDate)
    case "analytics":
      return generateAnalyticsReport(mccFilter, startDate, endDate)
    case "quality":
      return generateQualityReport(mccFilter, startDate, endDate)
    case "sales":
      return generateSalesReport(mccFilter, startDate, endDate)
    case "rentals":
      return generateRentalsReport(mccFilter, startDate, endDate)
    case "daily":
      return generateDailyReport(mccFilter, startDate, endDate)
    case "weekly":
      return generateWeeklyReport(mccFilter, startDate, endDate)
    case "monthly":
      return generateMonthlyReport(mccFilter, startDate, endDate)
    default:
      throw new Error("Invalid report type")
  }
}
