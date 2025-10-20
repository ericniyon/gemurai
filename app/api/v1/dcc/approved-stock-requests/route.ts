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
    console.log("[DCC_APPROVED_STOCK_REQUESTS_GET] Starting request...")
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
      console.log("[DCC_APPROVED_STOCK_REQUESTS_GET] No user found, token verification failed");
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized. Please log in." 
      }, { status: 401 })
    }
    
    console.log("[DCC_APPROVED_STOCK_REQUESTS_GET] User authenticated:", user.id, user.email);

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
    console.log("[DCC_APPROVED_STOCK_REQUESTS_GET] User role:", userRole);

    // Only allow DCC users to access this endpoint
    if (userRole !== "DCC") {
      console.log("[DCC_APPROVED_STOCK_REQUESTS_GET] Access denied for role:", userRole);
      return NextResponse.json({ 
        success: false, 
        message: "Only DCC users can access approved stock requests" 
      }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get stock orders with payment confirmed status for this DCC
    const stockOrders = await prisma.stockOrder.findMany({
      where: {
        dccId: user.id,
        status: "payment_confirmed" // Orders with payment confirmed by DCC
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                image: true,
                images: true,
                category: true,
                seller: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            method: true,
            paidAt: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const total = await prisma.stockOrder.count({
      where: {
        dccId: user.id,
        status: "payment_confirmed"
      }
    })

    // Transform data to include product details with stock request info
    const transformedData = stockOrders.map(order => ({
      orderId: order.id,
      orderStatus: order.status,
      totalAmount: order.totalAmount,
      requestDate: order.requestDate,
      notes: order.notes,
      payment: order.payment,
      products: order.products.map(product => ({
        productId: product.product.id,
        productName: product.product.name,
        productDescription: product.product.description,
        productPrice: product.product.price,
        productImage: product.product.image || getDefaultProductImage(product.product.name, product.product.category),
        productImages: getProductImages(product.product),
        productCategory: product.product.category,
        currentStock: product.currentStock,
        requestedStock: product.requestedStock,
        orderPrice: product.price,
        seller: product.product.seller,
        stockRequestInfo: {
          quantity: product.quantity,
          currentStock: product.currentStock,
          requestedStock: product.requestedStock,
          price: product.price,
          totalValue: product.price * product.quantity
        }
      }))
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalOrders: total,
        totalProducts: transformedData.reduce((sum, order) => sum + order.products.length, 0),
        totalValue: transformedData.reduce((sum, order) => sum + order.totalAmount, 0)
      }
    })

  } catch (error) {
    console.error("[DCC_APPROVED_STOCK_REQUESTS_GET] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to fetch approved stock requests" 
    }, { status: 500 })
  }
}
