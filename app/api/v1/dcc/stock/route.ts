import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"

// Default product images mapping
const getDefaultProductImage = (productName: string, category: string): string => {
  const name = productName.toLowerCase()
  const cat = category.toLowerCase()
  
  // Map based on product name
  if (name.includes('bleach') || name.includes('cleaning')) {
    return '/img/Bleach_Household.png'
  }
  if (name.includes('oil') || name.includes('cooking')) {
    return '/img/Cooking_Oil_Vegetable.png'
  }
  if (name.includes('sugar') || name.includes('sweet')) {
    return '/img/Sugar_White_Refined.png'
  }
  if (name.includes('salt')) {
    return '/img/Salt_Iodized.png'
  }
  if (name.includes('toothpaste') || name.includes('dental')) {
    return '/img/Toothpaste_Fresh_Mint.png'
  }
  if (name.includes('toilet') || name.includes('paper')) {
    return '/img/Toilet_Paper_Soft.png'
  }
  if (name.includes('rice')) {
    return '/img/Rice_Premium_Quality.png'
  }
  if (name.includes('soap') || name.includes('wash')) {
    return '/img/Soap_Bar_Antibacterial.png'
  }
  if (name.includes('detergent') || name.includes('omo')) {
    return '/img/OMO_Detergent_Powder.png'
  }
  if (name.includes('condom') || name.includes('protection')) {
    return '/img/Condom_Premium.png'
  }
  
  // Map based on category
  if (cat.includes('household') || cat.includes('cleaning')) {
    return '/img/Bleach_Household.png'
  }
  if (cat.includes('cooking') || cat.includes('food')) {
    return '/img/Cooking_Oil_Vegetable.png'
  }
  if (cat.includes('personal') || cat.includes('hygiene')) {
    return '/img/Toothpaste_Fresh_Mint.png'
  }
  if (cat.includes('health') || cat.includes('medical')) {
    return '/img/Condom_Premium.png'
  }
  
  // Default fallback
  return '/img/Cooking_Oil_Vegetable.png'
}

// Helper function to get product images
const getProductImages = (product: any): string[] => {
  // If product has images, use them
  if (product.images && product.images.length > 0) {
    return product.images
  }
  
  // If product has a single image, use it
  if (product.image) {
    return [product.image]
  }
  
  // Generate default images based on product
  const defaultImage = getDefaultProductImage(product.name, product.category)
  return [defaultImage]
}

export async function GET(req: Request) {
  try {
    console.log("[DCC_STOCK_GET] Starting request...")
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
      console.log("[DCC_STOCK_GET] No user found, token verification failed");
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized. Please log in." 
      }, { status: 401 })
    }
    
    console.log("[DCC_STOCK_GET] User authenticated:", user.id, user.email);

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
    console.log("[DCC_STOCK_GET] User role:", userRole);

    // Only allow DCC users to access this endpoint
    if (userRole !== "DCC") {
      console.log("[DCC_STOCK_GET] Access denied for role:", userRole);
      return NextResponse.json({ 
        success: false, 
        message: "Only DCC users can access their stock" 
      }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const minStock = parseInt(searchParams.get('minStock') || '0')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Build where conditions for DCC stock
    const whereConditions: any = {
      dccId: user.id,
      quantity: {
        gte: minStock
      }
    }

    // Add search condition if provided
    if (search) {
      whereConditions.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    // Add category filter if provided
    if (category) {
      whereConditions.product = {
        ...whereConditions.product,
        category: { equals: category, mode: 'insensitive' }
      }
    }

    // Build order by conditions
    let orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.product = { name: sortOrder }
    } else if (sortBy === 'quantity') {
      orderBy.quantity = sortOrder
    } else if (sortBy === 'price') {
      orderBy.product = { price: sortOrder }
    } else {
      orderBy.updatedAt = 'desc'
    }

    // Get DCC stock with product details
    const dccStock = await prisma.dCCStock.findMany({
      where: whereConditions,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            businessPrice: true,
            stock: true,
            image: true,
            images: true,
            category: true,
            commission: true,
            seller: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy,
      skip,
      take: limit
    })

    // Get total count for pagination
    const total = await prisma.dCCStock.count({
      where: whereConditions
    })

    // Transform data to include raw pricing values
    const transformedData = dccStock.map(stock => {
      const salesPrice = stock.product.price
      const commission = stock.product.commission || 0
      const purchasePrice = salesPrice - commission
      const totalValue = purchasePrice * stock.quantity
      
      return {
        stockId: stock.id,
        productId: stock.product.id,
        productName: stock.product.name,
        productDescription: stock.product.description,
        productPrice: stock.product.price,
        productBusinessPrice: stock.product.businessPrice,
        productImage: stock.product.image || getDefaultProductImage(stock.product.name, stock.product.category),
        productImages: getProductImages(stock.product),
        productCategory: stock.product.category,
        productCommission: stock.product.commission || 0,
        currentStock: stock.quantity,
        purchasePrice: purchasePrice,
        salesPrice: salesPrice,
        commission: commission,
        totalValue: totalValue,
        seller: stock.product.seller,
        lastUpdated: stock.updatedAt,
        stockInfo: {
          purchasePrice: purchasePrice,
          salesPrice: salesPrice,
          commission: commission,
          quantity: stock.quantity,
          totalValue: totalValue
        }
      }
    })

    // Calculate summary statistics
    const summary = {
      totalProducts: total,
      totalQuantity: transformedData.reduce((sum, item) => sum + item.currentStock, 0),
      totalValue: transformedData.reduce((sum, item) => sum + item.totalValue, 0),
      averagePrice: transformedData.length > 0 ? transformedData.reduce((sum, item) => sum + item.purchasePrice, 0) / transformedData.length : 0
    }

    // Get unique categories for filtering
    const categories = await prisma.dCCStock.findMany({
      where: { dccId: user.id },
      include: {
        product: {
          select: { category: true }
        }
      }
    })

    const uniqueCategories = [...new Set(categories.map(item => item.product.category).filter(Boolean))]

    return NextResponse.json({
      success: true,
      data: {
        dccStock: transformedData,
        summary,
        categories: uniqueCategories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error("[DCC_STOCK_GET] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to fetch DCC stock" 
    }, { status: 500 })
  }
}

// POST method to add/update stock (when orders are completed)
export async function POST(req: Request) {
  try {
    console.log("[DCC_STOCK_POST] Starting request...")
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

    // Verify user is DCC
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

    if (!dbUser || dbUser.userRole?.role?.name !== "DCC") {
      return NextResponse.json({ 
        success: false, 
        message: "Only DCC users can manage stock" 
      }, { status: 403 })
    }

    const body = await req.json()
    const { productId, quantity, action = 'add' } = body

    if (!productId || typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid productId or quantity" 
      }, { status: 400 })
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ 
        success: false, 
        message: "Product not found" 
      }, { status: 404 })
    }

    // Update or create DCC stock
    const existingStock = await prisma.dCCStock.findUnique({
      where: {
        dccId_productId: {
          dccId: user.id,
          productId: productId
        }
      }
    })

    let updatedStock
    if (existingStock) {
      // Update existing stock
      const newQuantity = action === 'add' 
        ? existingStock.quantity + quantity
        : Math.max(0, existingStock.quantity - quantity)

      updatedStock = await prisma.dCCStock.update({
        where: { id: existingStock.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              businessPrice: true,
              commission: true
            }
          }
        }
      })
    } else if (action === 'add' && quantity > 0) {
      // Create new stock entry
      updatedStock = await prisma.dCCStock.create({
        data: {
          dccId: user.id,
          productId: productId,
          quantity: quantity
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              businessPrice: true,
              commission: true
            }
          }
        }
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Cannot remove stock from non-existent entry" 
      }, { status: 400 })
    }

    const purchasePrice = updatedStock.product.price - (updatedStock.product.commission || 0)
    const salesPrice = updatedStock.product.price
    const commission = updatedStock.product.commission || 0
    const totalValue = purchasePrice * updatedStock.quantity

    return NextResponse.json({
      success: true,
      message: `Stock ${action === 'add' ? 'added' : 'removed'} successfully`,
      data: {
        stockId: updatedStock.id,
        productId: updatedStock.product.id,
        productName: updatedStock.product.name,
        quantity: updatedStock.quantity,
        purchasePrice: purchasePrice,
        salesPrice: salesPrice,
        commission: commission,
        totalValue: totalValue,
        action: action,
        updatedAt: updatedStock.updatedAt
      }
    })

  } catch (error) {
    console.error("[DCC_STOCK_POST] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update DCC stock" 
    }, { status: 500 })
  }
}
