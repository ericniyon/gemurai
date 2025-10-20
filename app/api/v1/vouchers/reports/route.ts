import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/token"

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: "Authentication required" 
      }, { status: 401 })
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid token" 
      }, { status: 401 })
    }

    // Check if user has permission to view reports
    const userRole = user.role
    if (!["ADMIN", "SUPER_ADMIN", "EMPLOYER"].includes(userRole)) {
      return NextResponse.json({ 
        success: false, 
        message: "Access denied. Insufficient permissions." 
      }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')

    console.log("[VOUCHERS_REPORTS_GET] User:", user.id, "Role:", userRole, "Days:", days)

    // Support environments where the Prisma Client hasn't regenerated yet
    const hasVoucherModel = Boolean((prisma as any).voucher)
    const hasUserModel = Boolean((prisma as any).user)

    let report: any = {}

    if (hasVoucherModel && hasUserModel) {
      // Get overall statistics
      const totalVouchers = await (prisma as any).voucher.count()
      const activeVouchers = await (prisma as any).voucher.count({ where: { status: 'ACTIVE' } })
      const usedVouchers = await (prisma as any).voucher.count({ where: { status: 'USED' } })
      const expiredVouchers = await (prisma as any).voucher.count({ where: { status: 'EXPIRED' } })

      // Get value statistics
      const valueStats = await (prisma as any).voucher.aggregate({
        _sum: {
          value: true,
          remainingBalance: true
        },
        _avg: {
          value: true
        }
      })

      const totalValue = valueStats._sum.value || 0
      const remainingValue = valueStats._sum.remainingBalance || 0
      const usedValue = totalValue - remainingValue
      const averageVoucherValue = valueStats._avg.value || 0
      const usageRate = totalValue > 0 ? (usedValue / totalValue) * 100 : 0

      // Get DCC count
      const totalDCCs = await (prisma as any).user.count({ 
        where: { 
          userRole: {
            role: {
              name: 'DCC'
            }
          }
        } 
      })

      // Get top DCCs by usage
      const topDCCs = await (prisma as any).user.findMany({
        where: { 
          userRole: {
            role: {
              name: 'DCC'
            }
          }
        },
        include: {
          vouchers: {
            select: {
              value: true,
              remainingBalance: true
            }
          }
        }
      })

      const dccStats = topDCCs.map((dcc: any) => {
        const vouchers = dcc.vouchers || []
        const totalVouchers = vouchers.length
        const totalValue = vouchers.reduce((sum: number, v: any) => sum + v.value, 0)
        const remainingBalance = vouchers.reduce((sum: number, v: any) => sum + v.remainingBalance, 0)
        const usedBalance = totalValue - remainingBalance
        const usagePercentage = totalValue > 0 ? (usedBalance / totalValue) * 100 : 0

        return {
          id: dcc.id,
          name: dcc.name,
          totalVouchers,
          totalValue,
          usagePercentage: Math.round(usagePercentage * 100) / 100
        }
      }).filter((dcc: any) => dcc.totalVouchers > 0)
        .sort((a: any, b: any) => b.totalValue - a.totalValue)
        .slice(0, 10)

      // Get status distribution
      const statusDistribution = await (prisma as any).voucher.groupBy({
        by: ['status'],
        _count: { status: true }
      })

      const statusStats = statusDistribution.map((status: any) => ({
        status: status.status,
        count: status._count.status,
        percentage: (status._count.status / totalVouchers) * 100
      }))

      // Get monthly trends (last 6 months)
      const monthlyStats = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        const monthVouchers = await (prisma as any).voucher.findMany({
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        })

        const created = monthVouchers.length
        const used = monthVouchers.filter((v: any) => v.status === 'USED').length
        const expired = monthVouchers.filter((v: any) => v.status === 'EXPIRED').length
        const value = monthVouchers.reduce((sum: number, v: any) => sum + v.value, 0)

        monthlyStats.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          created,
          used,
          expired,
          value
        })
      }

      report = {
        totalVouchers,
        activeVouchers,
        usedVouchers,
        expiredVouchers,
        totalValue,
        remainingValue,
        usedValue,
        totalDCCs,
        averageVoucherValue,
        usageRate: Math.round(usageRate * 100) / 100,
        monthlyStats,
        topDCCs: dccStats,
        statusDistribution: statusStats
      }
    } else {
      // Fallback to raw SQL queries
      const overallStats: any[] = await (prisma as any).$queryRawUnsafe(`
        SELECT 
          COUNT(*) as total_vouchers,
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_vouchers,
          COUNT(CASE WHEN status = 'USED' THEN 1 END) as used_vouchers,
          COUNT(CASE WHEN status = 'EXPIRED' THEN 1 END) as expired_vouchers,
          COALESCE(SUM(value), 0) as total_value,
          COALESCE(SUM("remainingBalance"), 0) as remaining_value,
          COALESCE(AVG(value), 0) as avg_value
        FROM "vouchers"
      `)

      const stats = overallStats[0]
      const totalVouchers = parseInt(stats.total_vouchers)
      const activeVouchers = parseInt(stats.active_vouchers)
      const usedVouchers = parseInt(stats.used_vouchers)
      const expiredVouchers = parseInt(stats.expired_vouchers)
      const totalValue = parseFloat(stats.total_value)
      const remainingValue = parseFloat(stats.remaining_value)
      const usedValue = totalValue - remainingValue
      const averageVoucherValue = parseFloat(stats.avg_value)
      const usageRate = totalValue > 0 ? (usedValue / totalValue) * 100 : 0

      // Get DCC count
      const dccCount: any[] = await (prisma as any).$queryRawUnsafe(`
        SELECT COUNT(*) as total_dccs 
        FROM "users" u
        JOIN "user_role_assignments" ura ON u.id = ura."userId"
        JOIN "roles" r ON ura."roleId" = r.id
        WHERE r.name = 'DCC' AND ura."isActive" = true
      `)
      const totalDCCs = parseInt(dccCount[0].total_dccs)

      // Get top DCCs
      const topDCCsRaw: any[] = await (prisma as any).$queryRawUnsafe(`
        SELECT 
          u.id,
          u.name,
          COUNT(v.id) as total_vouchers,
          COALESCE(SUM(v.value), 0) as total_value,
          CASE 
            WHEN COALESCE(SUM(v.value), 0) > 0 
            THEN ROUND((COALESCE(SUM(v.value - v."remainingBalance"), 0) / SUM(v.value)) * 100, 2)
            ELSE 0 
          END as usage_percentage
        FROM "users" u
        JOIN "user_role_assignments" ura ON u.id = ura."userId"
        JOIN "roles" r ON ura."roleId" = r.id
        LEFT JOIN "vouchers" v ON u.id = v."dccId"
        WHERE r.name = 'DCC' AND ura."isActive" = true
        GROUP BY u.id, u.name
        HAVING COUNT(v.id) > 0
        ORDER BY total_value DESC
        LIMIT 10
      `)

      const topDCCs = topDCCsRaw.map(row => ({
        id: row.id,
        name: row.name,
        totalVouchers: parseInt(row.total_vouchers),
        totalValue: parseFloat(row.total_value),
        usagePercentage: parseFloat(row.usage_percentage)
      }))

      // Get status distribution
      const statusDistributionRaw: any[] = await (prisma as any).$queryRawUnsafe(`
        SELECT 
          status,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "vouchers")), 2) as percentage
        FROM "vouchers"
        GROUP BY status
      `)

      const statusDistribution = statusDistributionRaw.map(row => ({
        status: row.status,
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage)
      }))

      // Get monthly trends
      const monthlyStatsRaw: any[] = await (prisma as any).$queryRawUnsafe(`
        SELECT 
          TO_CHAR("createdAt", 'Mon YYYY') as month,
          COUNT(*) as created,
          COUNT(CASE WHEN status = 'USED' THEN 1 END) as used,
          COUNT(CASE WHEN status = 'EXPIRED' THEN 1 END) as expired,
          COALESCE(SUM(value), 0) as value
        FROM "vouchers"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon YYYY')
        ORDER BY MIN("createdAt")
      `)

      const monthlyStats = monthlyStatsRaw.map(row => ({
        month: row.month,
        created: parseInt(row.created),
        used: parseInt(row.used),
        expired: parseInt(row.expired),
        value: parseFloat(row.value)
      }))

      report = {
        totalVouchers,
        activeVouchers,
        usedVouchers,
        expiredVouchers,
        totalValue,
        remainingValue,
        usedValue,
        totalDCCs,
        averageVoucherValue,
        usageRate: Math.round(usageRate * 100) / 100,
        monthlyStats,
        topDCCs,
        statusDistribution
      }
    }

    console.log("[VOUCHERS_REPORTS_GET] Successfully generated report")
    
    return NextResponse.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error("[VOUCHERS_REPORTS_GET] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}
