import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching DCC users with their products...")

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const includeProducts = searchParams.get("includeProducts") === "true"
    const includeDCCProfile = searchParams.get("includeDCCProfile") === "true"
    const includeDCCStock = searchParams.get("includeDCCStock") === "true"

    // Build the where clause for filtering
    const whereClause: any = {
      isActive: true,
      userRole: {
        isActive: true,
        role: {
          name: "DCC"
        }
      }
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } }
      ]
    }

    // Build the include clause
    const includeClause: any = {
      userRole: {
        include: {
          role: true
        }
      }
    }

    // Include products if requested
    if (includeProducts) {
      includeClause.products = {
        where: {
          isActive: true
        },
        include: {
          brand: true,
          reviews: {
            where: {
              verified: true
            },
            take: 5,
            orderBy: {
              createdAt: "desc"
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }

    // Include DCC profile if requested
    if (includeDCCProfile) {
      includeClause.dccProfile = true
    }

    // Include DCC stock if requested
    if (includeDCCStock) {
      includeClause.dccStocks = {
        where: {
          quantity: {
            gt: 0
          }
        },
        include: {
          product: {
            include: {
              brand: true,
              reviews: {
                where: {
                  verified: true
                },
                take: 5,
                orderBy: {
                  createdAt: "desc"
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: "desc"
        }
      }
    }

    // Fetch DCC users with their data
    const dccUsers = await prisma.user.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: {
        createdAt: "desc"
      }
    })

    // Transform the data to include product statistics
    const transformedUsers = dccUsers.map(user => {
      const userData: any = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: user.userRole?.role?.name || "DCC",
        roleAssignedAt: user.userRole?.assignedAt,
        roleExpiresAt: user.userRole?.expiresAt
      }

      // Add DCC profile data if included
      if (includeDCCProfile && user.dccProfile) {
        userData.dccProfile = {
          id: user.dccProfile.id,
          level: user.dccProfile.level,
          rating: user.dccProfile.rating,
          totalSales: user.dccProfile.totalSales,
          monthlySales: user.dccProfile.monthlySales,
          productsAvailable: user.dccProfile.productsAvailable
        }
      }

      // Add products data if included
      if (includeProducts && user.products) {
        userData.products = user.products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image || getDefaultProductImage(product.name, product.category),
          images: getProductImages(product),
          category: product.category,
          subcategory: product.subcategory,
          stock: product.stock,
          status: product.status,
          isActive: product.isActive,
          commission: product.commission,
          brand: product.brand ? {
            id: product.brand.id,
            name: product.brand.name
          } : null,
          averageRating: product.reviews.length > 0 
            ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length 
            : 0,
          reviewCount: product.reviews.length,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }))

        // Add product statistics
        userData.productStats = {
          totalProducts: user.products.length,
          activeProducts: user.products.filter(p => p.isActive).length,
          totalStock: user.products.reduce((acc, p) => acc + p.stock, 0),
          averagePrice: user.products.length > 0 
            ? user.products.reduce((acc, p) => acc + p.price, 0) / user.products.length 
            : 0,
          totalValue: user.products.reduce((acc, p) => acc + (p.price * p.stock), 0)
        }
      }

      // Add DCC stock data if included
      if (includeDCCStock && user.dccStocks) {
        userData.dccStock = user.dccStocks.map(stock => ({
          id: stock.id,
          quantity: stock.quantity,
          product: {
            id: stock.product.id,
            name: stock.product.name,
            description: stock.product.description,
            price: stock.product.price,
            image: stock.product.image || getDefaultProductImage(stock.product.name, stock.product.category),
            images: getProductImages(stock.product),
            category: stock.product.category,
            subcategory: stock.product.subcategory,
            status: stock.product.status,
            isActive: stock.product.isActive,
            commission: stock.product.commission,
            brand: stock.product.brand ? {
              id: stock.product.brand.id,
              name: stock.product.brand.name
            } : null,
            averageRating: stock.product.reviews.length > 0 
              ? stock.product.reviews.reduce((acc, review) => acc + review.rating, 0) / stock.product.reviews.length 
              : 0,
            reviewCount: stock.product.reviews.length,
            createdAt: stock.product.createdAt,
            updatedAt: stock.product.updatedAt
          },
          totalValue: stock.quantity * stock.product.price,
          updatedAt: stock.updatedAt
        }))

        // Add DCC stock statistics
        userData.dccStockStats = {
          totalItems: user.dccStocks.length,
          totalQuantity: user.dccStocks.reduce((acc, s) => acc + s.quantity, 0),
          totalValue: user.dccStocks.reduce((acc, s) => acc + (s.quantity * s.product.price), 0),
          averagePrice: user.dccStocks.length > 0 
            ? user.dccStocks.reduce((acc, s) => acc + s.product.price, 0) / user.dccStocks.length 
            : 0
        }
      }

      return userData
    })

    console.log(`✅ Found ${dccUsers.length} DCC users with their data`)

    return NextResponse.json({
      success: true,
      data: {
        users: transformedUsers
      },
      message: `Successfully retrieved ${dccUsers.length} DCC users`
    })

  } catch (error) {
    console.error("❌ Error fetching DCC users:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch DCC users",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed",
      message: "This endpoint only supports GET requests"
    },
    { status: 405 }
  )
}
