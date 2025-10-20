import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search") || ""
    const category = url.searchParams.get("category")

    // Build filter for products
    const filter: any = {
      isActive: true,
      status: "active"
    }

    if (search) {
      filter.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      filter.category = category
    }

    // Get all products (not just DCC stock)
    const products = await prisma.product.findMany({
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        stockQuantities: {
          select: {
            quantity: true,
            warehouse: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Get total count for pagination
    const total = await prisma.product.count({ where: filter })

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
        return product.images.map((img: string) => 
          img.startsWith('http') ? img : 
          img.startsWith('/') ? img : `/uploads/${img}`
        )
      }
      
      // If product has a single image, use it
      if (product.image) {
        const processedImage = product.image.startsWith('http') ? product.image : 
                              product.image.startsWith('/') ? product.image : `/uploads/${product.image}`
        return [processedImage]
      }
      
      // Generate default images based on product
      const defaultImage = getDefaultProductImage(product.name, product.category)
      return [defaultImage]
    }

    // Use stock field value directly - no calculations
    const productsWithStock = products.map(product => {
      // Debug: Log the original image URL
      console.log(`[DCC Products] Product ${product.name} - Original image:`, product.image)
      // Use product.stock field value directly - no calculations
      const totalStock = product.stock || 0

      const processedImage = product.image && product.image !== "/placeholder.jpg" ? 
        (product.image.startsWith('http') ? product.image : 
         product.image.startsWith('/') ? product.image : `/uploads/${product.image}`)
        : getDefaultProductImage(product.name, product.category)
      
      // Debug: Log the processed image URL
      console.log(`[DCC Products] Product ${product.name} - Processed image:`, processedImage)
      
      return {
        ...product,
        stock: totalStock,
        image: processedImage,
        images: getProductImages(product),
        // Mock DCC data since we're showing all products
        dcc: {
          id: "system",
          name: "System",
          email: "system@djyh.rw"
        }
      }
    })

    return NextResponse.json({
      success: true,
      products: productsWithStock,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error("Error fetching DCC products:", error)
    
    // Return a more detailed error response for debugging
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch DCC products",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 