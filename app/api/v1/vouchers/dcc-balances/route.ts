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

    // Check if user has permission to view DCC balances
    const userRole = user.role
    if (!["ADMIN", "SUPER_ADMIN", "EMPLOYER"].includes(userRole)) {
      return NextResponse.json({ 
        success: false, 
        message: "Access denied. Insufficient permissions." 
      }, { status: 403 })
    }

    console.log("[DCC_BALANCES_GET] User:", user.id, "Role:", userRole)

    // Support environments where the Prisma Client hasn't regenerated yet
    const hasVoucherModel = Boolean((prisma as any).voucher)
    const hasUserModel = Boolean((prisma as any).user)

    let dccBalances: any[] = []

    if (hasVoucherModel && hasUserModel) {
      // Get all DCCs with their voucher statistics
      const dccsWithVouchers = await (prisma as any).user.findMany({
        where: {
          userRole: {
            role: {
              name: "DCC"
            }
          }
        },
        include: {
          vouchers: {
            select: {
              id: true,
              value: true,
              remainingBalance: true,
              status: true,
              createdAt: true
            }
          }
        }
      })

      dccBalances = dccsWithVouchers.map((dcc: any) => {
        const vouchers = dcc.vouchers || []
        const totalVouchers = vouchers.length
        const activeVouchers = vouchers.filter((v: any) => v.status === 'ACTIVE').length
        const totalValue = vouchers.reduce((sum: number, v: any) => sum + v.value, 0)
        const remainingBalance = vouchers.reduce((sum: number, v: any) => sum + v.remainingBalance, 0)
        const usedBalance = totalValue - remainingBalance
        const usagePercentage = totalValue > 0 ? (usedBalance / totalValue) * 100 : 0

        return {
          id: dcc.id,
          name: dcc.name,
          email: dcc.email,
          totalVouchers,
          activeVouchers,
          totalValue,
          remainingBalance,
          usedBalance,
          usagePercentage: Math.round(usagePercentage * 100) / 100,
          lastActivity: vouchers.length > 0 ? Math.max(...vouchers.map((v: any) => new Date(v.createdAt).getTime())) : null
        }
      }).filter((dcc: any) => dcc.totalVouchers > 0) // Only show DCCs with vouchers
    } else {
      // Fallback to raw SQL queries
      const dccBalancesRaw: any[] = await (prisma as any).$queryRawUnsafe(`
        SELECT 
          u.id,
          u.name,
          u.email,
          COUNT(v.id) as total_vouchers,
          COUNT(CASE WHEN v.status = 'ACTIVE' THEN 1 END) as active_vouchers,
          COALESCE(SUM(v.value), 0) as total_value,
          COALESCE(SUM(v."remainingBalance"), 0) as remaining_balance,
          COALESCE(SUM(v.value - v."remainingBalance"), 0) as used_balance,
          CASE 
            WHEN COALESCE(SUM(v.value), 0) > 0 
            THEN ROUND((COALESCE(SUM(v.value - v."remainingBalance"), 0) / SUM(v.value)) * 100, 2)
            ELSE 0 
          END as usage_percentage,
          MAX(v."createdAt") as last_activity
        FROM "users" u
        JOIN "user_role_assignments" ura ON u.id = ura."userId"
        JOIN "roles" r ON ura."roleId" = r.id
        LEFT JOIN "vouchers" v ON u.id = v."dccId"
        WHERE r.name = 'DCC' AND ura."isActive" = true
        GROUP BY u.id, u.name, u.email
        HAVING COUNT(v.id) > 0
        ORDER BY total_value DESC
      `)

      dccBalances = dccBalancesRaw.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        totalVouchers: parseInt(row.total_vouchers),
        activeVouchers: parseInt(row.active_vouchers),
        totalValue: parseFloat(row.total_value),
        remainingBalance: parseFloat(row.remaining_balance),
        usedBalance: parseFloat(row.used_balance),
        usagePercentage: parseFloat(row.usage_percentage),
        lastActivity: row.last_activity
      }))
    }

    console.log("[DCC_BALANCES_GET] Successfully fetched DCC balances:", dccBalances.length)
    
    return NextResponse.json({
      success: true,
      data: dccBalances
    })
  } catch (error) {
    console.error("[DCC_BALANCES_GET] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}
