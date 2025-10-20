import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"

// POST /api/v1/vouchers/validate - Validate a voucher code
export async function POST(req: Request) {
  try {
    console.log("[VOUCHER_VALIDATE] Starting request...")
    let user = null;
    
    // Try token auth first
    const authHeader = req.headers.get("Authorization")
    let token = null

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }
    
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get("Gemurai_token")?.value || cookieStore.get("token")?.value
    }

    if (token) {
      const verifiedUser = await verifyAuthToken(token)
      if (verifiedUser) {
        user = verifiedUser
      }
    }

    if (!user) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        user = session.user
      }
    }

    if (!user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized. Please log in." 
      }, { status: 401 })
    }

    // Get user with role
    const dbUser = await prisma.user.findUnique({
      where: { 
        id: user.id,
        isActive: true
      },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    })

    if (!dbUser) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found or inactive" 
      }, { status: 404 })
    }

    const userRole = dbUser.userRole?.role?.name;
    console.log("[VOUCHER_VALIDATE] User role:", userRole);

    // Only DCC can validate vouchers
    if (userRole !== "DCC") {
      return NextResponse.json({ 
        success: false, 
        message: "Access denied. Only DCC users can validate vouchers." 
      }, { status: 403 })
    }

    const body = await req.json()
    const { voucherCode, amount } = body

    // Validate required fields
    if (!voucherCode) {
      return NextResponse.json({
        success: false,
        message: "Voucher code is required"
      }, { status: 400 })
    }

    // Support environments where the Prisma Client hasn't regenerated yet
    const hasVoucherModel = Boolean((prisma as any).voucher)

    let voucher = null

    if (hasVoucherModel) {
      voucher = await (prisma as any).voucher.findUnique({
        where: { code: voucherCode },
        include: {
          dcc: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    } else {
      // Fallback to raw SQL query
      const voucherRaw: any[] = await (prisma as any).$queryRawUnsafe(
        `SELECT v.id, v.code, v.value, v."remainingBalance", v.status, v."dccId", v."expiresAt", 
                u.id as "dccId", u.name as "dccName", u.email as "dccEmail"
         FROM "vouchers" v
         LEFT JOIN "users" u ON v."dccId" = u.id
         WHERE v.code = $1`,
        voucherCode
      )
      
      if (voucherRaw.length > 0) {
        const v = voucherRaw[0]
        voucher = {
          id: v.id,
          code: v.code,
          value: v.value,
          remainingBalance: v.remainingBalance,
          status: v.status,
          dccId: v.dccId,
          expiresAt: v.expiresAt,
          dcc: {
            id: v.dccId,
            name: v.dccName,
            email: v.dccEmail
          }
        }
      }
    }

    if (!voucher) {
      return NextResponse.json({
        success: false,
        message: "Invalid voucher code"
      }, { status: 404 })
    }

    // Check if voucher belongs to the requesting DCC
    if (voucher.dccId !== user.id) {
      return NextResponse.json({
        success: false,
        message: "This voucher does not belong to you"
      }, { status: 403 })
    }

    // Check voucher status
    if (voucher.status === "USED") {
      return NextResponse.json({
        success: false,
        message: "This voucher has already been fully used"
      }, { status: 400 })
    }

    if (voucher.status === "EXPIRED") {
      return NextResponse.json({
        success: false,
        message: "This voucher has expired"
      }, { status: 400 })
    }

    if (voucher.status === "INACTIVE") {
      return NextResponse.json({
        success: false,
        message: "This voucher is inactive"
      }, { status: 400 })
    }

    // Check expiration date
    if (voucher.expiresAt && new Date() > voucher.expiresAt) {
      // Update voucher status to expired
      if (hasVoucherModel) {
        await (prisma as any).voucher.update({
          where: { id: voucher.id },
          data: { status: "EXPIRED" }
        })
      } else {
        // Fallback to raw SQL update
        await (prisma as any).$queryRawUnsafe(
          `UPDATE "vouchers" SET status = 'EXPIRED'::"VoucherStatus" WHERE id = $1`,
          voucher.id
        )
      }

      return NextResponse.json({
        success: false,
        message: "This voucher has expired"
      }, { status: 400 })
    }

    // If amount is provided, check if voucher has sufficient balance
    if (amount && amount > 0) {
      if (voucher.remainingBalance < amount) {
        return NextResponse.json({
          success: false,
          message: `Insufficient voucher balance. Available: ${voucher.remainingBalance} RWF, Required: ${amount} RWF`
        }, { status: 400 })
      }
    }

    console.log("[VOUCHER_VALIDATE] Voucher validated successfully:", voucher.code)
    
    return NextResponse.json({
      success: true,
      message: "Voucher is valid",
      data: {
        voucher: {
          id: voucher.id,
          code: voucher.code,
          value: voucher.value,
          remainingBalance: voucher.remainingBalance,
          status: voucher.status,
          expiresAt: voucher.expiresAt,
          dcc: voucher.dcc
        },
        canUse: amount ? voucher.remainingBalance >= amount : true,
        availableAmount: voucher.remainingBalance
      }
    })
  } catch (error) {
    console.error("[VOUCHER_VALIDATE] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to validate voucher" 
    }, { status: 500 })
  }
}
