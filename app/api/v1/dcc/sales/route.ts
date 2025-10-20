import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { safeTransaction } from "@/lib/transaction"

export async function POST(req: Request) {
  try {
    console.log("[DCC_SALES_POST] Starting request...")
    let user = null;
    
    // Try token auth first (for DCC users)
    const authHeader = req.headers.get("Authorization")
    let token = null

    // Check Authorization header
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }
    
    // Try cookie if no Authorization header
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

    // If no token auth, try NextAuth session
    if (!user) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        user = session.user
      }
    }

    if (!user?.id) {
      console.log("[DCC_SALES_POST] No user found, token verification failed");
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized. Please log in." 
      }, { status: 401 })
    }
    
    console.log("[DCC_SALES_POST] User authenticated:", user.id, user.email);

    // Get user with role and permissions
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

    // Get user's role from the new role system
    const userRole = dbUser.userRole?.role?.name;
    console.log("[DCC_SALES_POST] User role:", userRole);

    // Only allow DCC users to record sales
    if (userRole !== "DCC") {
      console.log("[DCC_SALES_POST] Access denied for role:", userRole);
      return NextResponse.json({ 
        success: false, 
        message: "Only DCC users can record sales" 
      }, { status: 403 })
    }

    const body = await req.json()
    const { productId, quantity, salePrice, customerName, customerPhone, notes, offSystem } = body

    // Validate required fields
    if (!productId || !quantity || !salePrice) {
      return NextResponse.json({ 
        success: false, 
        message: "Product ID, quantity, and sale price are required" 
      }, { status: 400 })
    }

    if (quantity <= 0 || salePrice <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Quantity and sale price must be greater than 0" 
      }, { status: 400 })
    }

    // Process the sale in a transaction - using safe transaction utility for production
    const result = await safeTransaction(async (tx) => {
      let salesPrice = 0
      let commission = 0
      let purchasePrice = 0
      let totalCost = 0
      let totalRevenue = 0
      let totalCommission = 0
      let updatedStock: any = null

      if (offSystem) {
        // Off-system sale: do not require stock presence or deduction
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { id: true, name: true, price: true, commission: true }
        })
        if (!product) {
          throw new Error("Product not found")
        }
        salesPrice = product.price
        commission = product.commission || 0
        purchasePrice = salesPrice - commission
        totalCost = purchasePrice * quantity
        totalRevenue = salePrice * quantity
        totalCommission = (totalRevenue) - (totalCost)

        // Create sales record without stock deduction
        const sale = await tx.sale.create({
          data: {
            dccId: user.id,
            productId: productId,
            quantity: quantity,
            salePrice: salePrice,
            totalRevenue: totalRevenue,
            costPrice: purchasePrice,
            totalCost: totalCost,
            profit: totalCommission,
            customerName: customerName || null,
            customerPhone: customerPhone || null,
            notes: notes ? `[OFF_SYSTEM] ${notes}` : `[OFF_SYSTEM]`,
            saleDate: new Date()
          },
          include: {
            product: {
              select: {
                name: true,
                price: true
              }
            }
          }
        })

        // Wallet and transaction handling continues below
        // 5. Get or create DCC wallet
        let dccWallet = await tx.wallet.findUnique({
          where: { userId: user.id }
        })
        if (!dccWallet) {
          dccWallet = await tx.wallet.create({
            data: { userId: user.id, balance: 0, minimumBalance: 1000, status: "ACTIVE" }
          })
        }
        await tx.wallet.update({
          where: { id: dccWallet.id },
          data: { balance: { increment: totalRevenue } }
        })
        const transaction = await tx.transaction.create({
          data: {
            walletId: dccWallet.id,
            type: "DEPOSIT",
            amount: totalRevenue,
            status: "COMPLETED",
            description: `[OFF_SYSTEM] Sale of ${quantity} units of ${sale.product.name} - Revenue: ${totalRevenue} RWF`
          }
        })

        return {
          sale,
          updatedStock: null,
          totalCommission,
          transaction,
          pricing: { salesPrice: salePrice, purchasePrice, commission, totalCost }
        }
      }

      // On-system sale: validate and deduct stock
      const dccStock = await tx.dCCStock.findUnique({
        where: { dccId_productId: { dccId: user.id, productId: productId } },
        include: {
          product: { select: { id: true, name: true, price: true, commission: true } }
        }
      })

      if (!dccStock) {
        throw new Error(`Product not found in your stock`)
      }

      if (dccStock.quantity < quantity) {
        throw new Error(`Insufficient stock. Available: ${dccStock.quantity}, Requested: ${quantity}`)
      }

      salesPrice = dccStock.product.price
      commission = dccStock.product.commission || 0
      purchasePrice = salesPrice - commission
      totalCost = purchasePrice * quantity
      totalRevenue = salePrice * quantity
      totalCommission = (totalRevenue) - (totalCost)

      updatedStock = await tx.dCCStock.update({
        where: { dccId_productId: { dccId: user.id, productId: productId } },
        data: { quantity: { decrement: quantity } },
        include: { product: { select: { name: true, price: true } } }
      })

      const sale = await tx.sale.create({
        data: {
          dccId: user.id,
          productId: productId,
          quantity: quantity,
          salePrice: salePrice,
          totalRevenue: totalRevenue,
          costPrice: purchasePrice,
          totalCost: totalCost,
          profit: totalCommission,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          notes: notes || null,
          saleDate: new Date()
        },
        include: { product: { select: { name: true, price: true } } }
      })

      // 5. Get or create DCC wallet
      let dccWallet = await tx.wallet.findUnique({
        where: { userId: user.id }
      })

      if (!dccWallet) {
        dccWallet = await tx.wallet.create({
          data: {
            userId: user.id,
            balance: 0,
            minimumBalance: 1000,
            status: "ACTIVE"
          }
        })
      }

      // 6. Add sale revenue to DCC wallet
      await tx.wallet.update({
        where: { id: dccWallet.id },
        data: {
          balance: {
            increment: totalRevenue
          }
        }
      })

      // 7. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          walletId: dccWallet.id,
          type: "DEPOSIT",
          amount: totalRevenue,
          status: "COMPLETED",
          description: `Sale of ${quantity} units of ${sale.product.name} - Revenue: ${totalRevenue} RWF`
        }
      })

      console.log(`[DCC_SALES_POST] Sale recorded successfully: ${quantity} units of ${sale.product.name} for ${totalRevenue} RWF`)

      return {
        sale,
        updatedStock,
        totalCommission,
        transaction,
        pricing: { salesPrice: salePrice, purchasePrice: purchasePrice, commission: commission, totalCost: totalCost }
      }
    }, "DCC Sale Processing")

    return NextResponse.json({
      success: true,
      message: "Sale recorded successfully",
      data: {
        saleId: result.sale.id,
        productName: result.sale.product.name,
        quantity: result.sale.quantity,
        salePrice: result.sale.salePrice,
        totalRevenue: result.sale.totalRevenue,
        profit: result.totalCommission,
        totalCommission: result.totalCommission,
        remainingStock: result.updatedStock ? result.updatedStock.quantity : null,
        transactionId: result.transaction.id,
        pricing: result.pricing
      }
    })

  } catch (error) {
    console.error("[DCC_SALES_POST] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to record sale" 
    }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    console.log("[DCC_SALES_GET] Starting request...")
    let user = null;
    
    // Try token auth first (for DCC users)
    const authHeader = req.headers.get("Authorization")
    let token = null

    // Check Authorization header
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }
    
    // Try cookie if no Authorization header
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

    // If no token auth, try NextAuth session
    if (!user) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        user = session.user
      }
    }

    if (!user?.id) {
      console.log("[DCC_SALES_GET] No user found, token verification failed");
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized. Please log in." 
      }, { status: 401 })
    }
    
    console.log("[DCC_SALES_GET] User authenticated:", user.id, user.email);

    // Get user with role and permissions
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

    // Get user's role from the new role system
    const userRole = dbUser.userRole?.role?.name;
    console.log("[DCC_SALES_GET] User role:", userRole);

    // Only allow DCC users to view sales
    if (userRole !== "DCC") {
      console.log("[DCC_SALES_GET] Access denied for role:", userRole);
      return NextResponse.json({ 
        success: false, 
        message: "Only DCC users can view sales" 
      }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const productId = searchParams.get('productId')

    // Build where conditions
    const whereConditions: any = {
      dccId: user.id
    }

    if (startDate && endDate) {
      whereConditions.saleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (productId) {
      whereConditions.productId = productId
    }

    // Get sales with product details
    const sales = await prisma.sale.findMany({
      where: whereConditions,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            commission: true
          }
        }
      },
      orderBy: {
        saleDate: 'desc'
      },
      skip,
      take: limit
    })

    // Transform sales to include three-tier pricing
    const transformedSales = sales.map(sale => {
      const salesPrice = sale.product.price
      const commission = sale.product.commission || 0
      const purchasePrice = salesPrice - commission // Purchase price = sales price - commission
      const totalCommission = (sale.totalRevenue || 0) - (sale.totalCost || 0)
      
      return {
        ...sale,
        profit: sale.profit, // Keep original profit field for backward compatibility
        totalCommission: totalCommission,
        pricing: {
          salesPrice,
          purchasePrice,
          commission
        }
      }
    })

    // Get total count for pagination
    const total = await prisma.sale.count({
      where: whereConditions
    })

    // Calculate summary statistics
    const summary = {
      totalSales: total,
      totalRevenue: transformedSales.reduce((sum, sale) => sum + sale.totalRevenue, 0),
      totalCommission: transformedSales.reduce((sum, sale) => sum + sale.totalCommission, 0), // Use the calculated totalCommission
      averageSalePrice: transformedSales.length > 0 ? transformedSales.reduce((sum, sale) => sum + sale.salePrice, 0) / transformedSales.length : 0
    }

    return NextResponse.json({
      success: true,
      data: {
        sales: transformedSales,
        summary,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error("[DCC_SALES_GET] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to fetch sales" 
    }, { status: 500 })
  }
}
