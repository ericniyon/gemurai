import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/token"

export async function POST(req: NextRequest) {
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

    // Check if user has permission to create vouchers
    const userRole = user.role
    if (!["ADMIN", "SUPER_ADMIN", "EMPLOYER"].includes(userRole)) {
      return NextResponse.json({ 
        success: false, 
        message: "Access denied. Insufficient permissions." 
      }, { status: 403 })
    }

    const body = await req.json()
    const { dccId, value, quantity = 1, expiresAt, description } = body

    // Validate required fields
    if (!dccId || !value || !expiresAt) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields: dccId, value, expiresAt" 
      }, { status: 400 })
    }

    // Validate value
    if (value <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Voucher value must be greater than 0" 
      }, { status: 400 })
    }

    // Validate quantity
    if (quantity <= 0 || quantity > 100) {
      return NextResponse.json({ 
        success: false, 
        message: "Quantity must be between 1 and 100" 
      }, { status: 400 })
    }

    // Validate expiry date
    const expiryDate = new Date(expiresAt)
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      return NextResponse.json({ 
        success: false, 
        message: "Expiry date must be a valid future date" 
      }, { status: 400 })
    }

    console.log("[VOUCHERS_CREATE] User:", user.id, "Creating", quantity, "vouchers for DCC:", dccId)

    // Verify DCC exists
    const dcc = await (prisma as any).user.findFirst({
      where: { 
        id: dccId,
        userRole: {
          role: {
            name: "DCC"
          }
        }
      }
    })

    if (!dcc) {
      return NextResponse.json({ 
        success: false, 
        message: "DCC not found" 
      }, { status: 404 })
    }

    // Support environments where the Prisma Client hasn't regenerated yet
    const hasVoucherModel = Boolean((prisma as any).voucher)

    let createdVouchers: any[] = []

    if (hasVoucherModel) {
      // Create multiple vouchers
      const voucherData = Array.from({ length: quantity }, () => ({
        code: generateVoucherCode(),
        value: value,
        remainingBalance: value,
        status: "ACTIVE",
        dccId: dccId,
        createdBy: user.id,
        expiresAt: expiryDate
      }))

      createdVouchers = await (prisma as any).voucher.createMany({
        data: voucherData
      })

      // Fetch the created vouchers for response
      const vouchers = await (prisma as any).voucher.findMany({
        where: {
          dccId: dccId,
          createdBy: user.id,
          createdAt: {
            gte: new Date(Date.now() - 1000) // Get vouchers created in the last second
          }
        },
        orderBy: { createdAt: 'desc' },
        take: quantity
      })

      createdVouchers = vouchers
    } else {
      // Fallback to raw SQL queries
      const voucherCodes = Array.from({ length: quantity }, () => generateVoucherCode())
      
      for (const code of voucherCodes) {
        const result: any[] = await (prisma as any).$queryRawUnsafe(`
          INSERT INTO "vouchers" (
            id, code, value, "remainingBalance", status, "dccId", "createdBy", "expiresAt", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $2, 'ACTIVE', $3, $4, $5, NOW(), NOW()
          ) RETURNING *
        `, code, value, dccId, user.id, expiryDate)
        
        createdVouchers.push(result[0])
      }
    }

    console.log("[VOUCHERS_CREATE] Successfully created", createdVouchers.length, "vouchers")
    
    return NextResponse.json({
      success: true,
      message: `Successfully created ${quantity} voucher(s) for ${dcc.name}`,
      data: {
        vouchers: createdVouchers,
        totalValue: value * quantity,
        dcc: {
          id: dcc.id,
          name: dcc.name,
          email: dcc.email
        }
      }
    })
  } catch (error) {
    console.error("[VOUCHERS_CREATE] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}

// Generate a unique voucher code
function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
