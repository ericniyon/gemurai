import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"

// POST /api/v1/mcc/reports - Generate a report
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
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

    switch (reportType) {
      case 'summary':
        reportData = await generateSummaryReport(mccId, startDate, endDate)
        break
      case 'farmer':
        reportData = await generateFarmerReport(mccId, startDate, endDate, data.farmerId)
        break
      case 'financial':
        reportData = await generateFinancialReport(mccId, startDate, endDate)
        break
      case 'period':
        reportData = await generatePeriodReport(mccId, startDate, endDate)
        break
      case 'analytics':
        reportData = await generateAnalyticsReport(mccId, startDate, endDate)
        break
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    // Generate report file (simplified - in production you'd use libraries like puppeteer for PDF, xlsx for Excel)
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return NextResponse.json({
      success: true,
      message: "Report generated successfully",
      data: {
        reportId,
        reportType,
        format,
        generatedAt: new Date().toISOString(),
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
async function generateSummaryReport(mccId: string, startDate: string, endDate: string) {
  const collections = await prisma.milk_collections.findMany({
    where: {
      mccId,
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
      mccId,
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

async function generateFarmerReport(mccId: string, startDate: string, endDate: string, farmerId?: string) {
  const whereClause: any = {
    mccId,
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

async function generateFinancialReport(mccId: string, startDate: string, endDate: string) {
  const collections = await prisma.milk_collections.findMany({
    where: {
      mccId,
      collectionDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
  })

  const payments = await prisma.mcc_payments.findMany({
    where: {
      mccId,
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

async function generatePeriodReport(mccId: string, startDate: string, endDate: string) {
  const collections = await prisma.milk_collections.findMany({
    where: {
      mccId,
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

async function generateAnalyticsReport(mccId: string, startDate: string, endDate: string) {
  const collections = await prisma.milk_collections.findMany({
    where: {
      mccId,
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
