import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"

export async function GET(req: Request) {
  try {
    console.log("[EMPLOYER_DCC_SALES_GET] Starting request...")
    let user = null;
    
    // Try token auth first
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
      console.log("[EMPLOYER_DCC_SALES_GET] No user found, token verification failed");
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized. Please log in." 
      }, { status: 401 })
    }
    
    console.log("[EMPLOYER_DCC_SALES_GET] User authenticated:", user.id, user.email);

    // Get user with role and permissions
    const dbUser = await prisma.user.findFirst({
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
    console.log("[EMPLOYER_DCC_SALES_GET] User role:", userRole);

    // Only allow EMPLOYER, BRANCH_MANAGER, and DCC users to view DCC sales
    if (userRole !== "EMPLOYER" && userRole !== "BRANCH_MANAGER" && userRole !== "DCC") {
      console.log("[EMPLOYER_DCC_SALES_GET] Access denied for role:", userRole);
      return NextResponse.json({ 
        success: false, 
        message: "Only EMPLOYER, BRANCH_MANAGER, and DCC users can view DCC sales" 
      }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const productId = searchParams.get('productId')
    const dccId = searchParams.get('dccId')
    const search = searchParams.get('search')
    const district = searchParams.get('district')

    // Build where conditions - EMPLOYER can see all DCC sales, DCC can only see their own
    const whereConditions: any = {}

    // If user is DCC, only show their own sales
    if (userRole === "DCC") {
      whereConditions.dccId = user.id
    }

    if (startDate && endDate) {
      whereConditions.saleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (productId && productId !== 'all') {
      whereConditions.productId = productId
    }

    // Only apply dccId filter for EMPLOYER and BRANCH_MANAGER (not for DCC users)
    if (userRole !== "DCC" && dccId && dccId !== 'all') {
      whereConditions.dccId = dccId
    }

    if (district && district !== 'all') {
      whereConditions.dcc = {
        is: {
          district: district
        }
      }
    }

    if (search && search.trim().length > 0) {
      const query = search.trim()
      whereConditions.OR = [
        { customerName: { contains: query, mode: 'insensitive' } },
        { customerPhone: { contains: query, mode: 'insensitive' } },
        { id: { contains: query, mode: 'insensitive' } },
        { product: { is: { name: { contains: query, mode: 'insensitive' } } } },
        { dcc: { is: { name: { contains: query, mode: 'insensitive' } } } }
      ]
    }

    // Get sales with product and DCC details
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
        },
        dcc: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            district: true
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

    // Calculate summary statistics from ALL sales (not just current page)
    const allSalesForSummary = await prisma.sale.findMany({
      where: whereConditions,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            commission: true
          }
        },
        dcc: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            district: true
          }
        }
      }
    })

    // Transform all sales for summary calculation
    const allTransformedSales = allSalesForSummary.map(sale => {
      const salesPrice = sale.product.price
      const commission = sale.product.commission || 0
      const purchasePrice = salesPrice - commission
      const totalCommission = (sale.totalRevenue || 0) - (sale.totalCost || 0)
      
      return {
        ...sale,
        profit: sale.profit,
        totalCommission: totalCommission,
        pricing: {
          salesPrice,
          purchasePrice,
          commission
        }
      }
    })

    const summary = {
      totalSales: total,
      totalRevenue: allTransformedSales.reduce((sum, sale) => sum + sale.totalRevenue, 0),
      totalCommission: allTransformedSales.reduce((sum, sale) => sum + sale.totalCommission, 0),
      averageSalePrice: allTransformedSales.length > 0 ? allTransformedSales.reduce((sum, sale) => sum + sale.salePrice, 0) / allTransformedSales.length : 0,
      uniqueDCCs: new Set(allTransformedSales.map(sale => sale.dccId)).size,
      uniqueProducts: new Set(allTransformedSales.map(sale => sale.productId)).size
    }

    // Get DCC list for filtering (only for EMPLOYER and BRANCH_MANAGER)
    let dccs = []
    let districts = []
    
    if (userRole !== "DCC") {
      dccs = await prisma.user.findMany({
        where: {
          userRole: {
            role: {
              name: "DCC"
            }
          },
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          district: true
        },
        orderBy: {
          name: 'asc'
        }
      })

      // Build unique district list from DCCs
      districts = Array.from(new Set((dccs || []).map(d => d.district).filter(Boolean))) as string[]
    } else {
      // For DCC users, only show their own info
      const currentDcc = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          district: true
        }
      })
      dccs = currentDcc ? [currentDcc] : []
      districts = currentDcc?.district ? [currentDcc.district] : []
    }

    // Get products list for filtering
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true
      },
      orderBy: {
        name: 'asc'
      }
    })

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
        },
        filters: {
          dccs,
          products,
          districts
        }
      }
    })

  } catch (error) {
    console.error("[EMPLOYER_DCC_SALES_GET] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to fetch DCC sales" 
    }, { status: 500 })
  }
}
