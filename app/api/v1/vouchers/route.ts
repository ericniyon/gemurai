import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { randomBytes } from "crypto"

// Generate unique voucher code
function generateVoucherCode(): string {
  const prefix = "VOUCHER"
  const timestamp = Date.now().toString(36)
  const random = randomBytes(4).toString('hex').toUpperCase()
  return `${prefix}${timestamp}${random}`
}

// GET /api/v1/vouchers - Get all vouchers (for admin/employer) or user's vouchers (for DCC)
export async function GET(req: Request) {
  try {
    console.log("[VOUCHERS_GET] Starting request...")
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
    console.log("[VOUCHERS_GET] User role:", userRole);

    // Get URL parameters
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const dccId = searchParams.get('dccId')

    const skip = (page - 1) * limit

    // Build where clause based on user role
    let whereClause: any = {}

    if (userRole === "DCC") {
      // DCC can only see their own vouchers
      whereClause.dccId = user.id
    } else if (userRole === "EMPLOYER" || userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "BRANCH_MANAGER") {
      // Admin/Employer can see all vouchers or filter by DCC
      if (dccId) {
        whereClause.dccId = dccId
      }
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Access denied. Insufficient permissions." 
      }, { status: 403 })
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status
    }

    // Support environments where the Prisma Client hasn't regenerated yet
    const hasVoucherModel = Boolean((prisma as any).voucher)

    let vouchers: any[] = []
    let total = 0

    if (hasVoucherModel) {
      const [found, cnt] = await Promise.all([
        (prisma as any).voucher.findMany({
          where: whereClause,
          include: {
            dcc: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true, email: true } },
            transactions: { orderBy: { createdAt: 'desc' }, take: 5 }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        (prisma as any).voucher.count({ where: whereClause })
      ])
      vouchers = found
      total = cnt
    } else {
      // Fallback to raw SQL queries
      let whereSql = '1=1'
      const params: any[] = []
      let idx = 1

      if (userRole === 'DCC') {
        whereSql += ` AND "dccId" = $${idx++}`
        params.push(user.id)
      } else if (dccId) {
        whereSql += ` AND "dccId" = $${idx++}`
        params.push(dccId)
      }
      if (status) {
        whereSql += ` AND status = $${idx++}`
        params.push(status)
      }

      const totalRows: any[] = await (prisma as any).$queryRawUnsafe(
        `SELECT COUNT(*)::int AS count FROM "vouchers" WHERE ${whereSql}`,
        ...params
      )
      total = totalRows?.[0]?.count || 0

      const vouchersRaw: any[] = await (prisma as any).$queryRawUnsafe(
        `SELECT id, code, value, "remainingBalance", status, "createdAt", "expiresAt" 
         FROM "vouchers" 
         WHERE ${whereSql}
         ORDER BY "createdAt" DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        ...params, limit, skip
      )
      vouchers = vouchersRaw
    }

    console.log("[VOUCHERS_GET] Successfully fetched vouchers:", vouchers.length)
    
    return NextResponse.json({
      success: true,
      data: {
        vouchers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error("[VOUCHERS_GET] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch vouchers" 
    }, { status: 500 })
  }
}

// POST /api/v1/vouchers - Create a new voucher (admin/employer only)
export async function POST(req: Request) {
  try {
    console.log("[VOUCHERS_POST] Starting request...")
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
    console.log("[VOUCHERS_POST] User role:", userRole);

    // Only admin/employer can create vouchers
    if (userRole !== "EMPLOYER" && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ 
        success: false, 
        message: "Access denied. Only admins and employers can create vouchers." 
      }, { status: 403 })
    }

    const body = await req.json()
    const { dccId, value, expiresAt, customCode } = body

    // Validate required fields
    if (!dccId || !value || value <= 0) {
      return NextResponse.json({
        success: false,
        message: "DCC ID and positive value are required"
      }, { status: 400 })
    }

    // Verify DCC exists and has DCC role
    const dccUser = await prisma.user.findUnique({
      where: { 
        id: dccId,
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

    if (!dccUser || dccUser.userRole?.role?.name !== "DCC") {
      return NextResponse.json({
        success: false,
        message: "Invalid DCC ID or user is not a DCC"
      }, { status: 400 })
    }

    // Generate voucher code
    const voucherCode = customCode || generateVoucherCode()

    // Check if code already exists
    const existingVoucher = await prisma.voucher.findUnique({
      where: { code: voucherCode }
    })

    if (existingVoucher) {
      return NextResponse.json({
        success: false,
        message: "Voucher code already exists. Please try again."
      }, { status: 400 })
    }

    // Create voucher
    const voucher = await prisma.voucher.create({
      data: {
        code: voucherCode,
        value: value,
        remainingBalance: value,
        status: "ACTIVE",
        dccId: dccId,
        createdBy: user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        dcc: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Create initial transaction record
    await prisma.voucherTransaction.create({
      data: {
        voucherId: voucher.id,
        type: "CREATED",
        amount: value,
        remainingBalance: value,
        description: `Voucher created with value ${value} RWF`
      }
    })

    console.log("[VOUCHERS_POST] Successfully created voucher:", voucher.code)
    
    return NextResponse.json({
      success: true,
      message: "Voucher created successfully",
      data: voucher
    })
  } catch (error) {
    console.error("[VOUCHERS_POST] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to create voucher" 
    }, { status: 500 })
  }
}
