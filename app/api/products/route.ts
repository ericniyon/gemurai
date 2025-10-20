import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { ProductService } from "../../lib/services/ProductService"
import { writeFile } from "fs/promises"
import { join } from "path"
import { prisma } from "@/lib/prisma"
import { uploadImage } from "@/lib/upload"
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

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "8")
    const search = url.searchParams.get("search") || ""
    const category = url.searchParams.get("category")
    const status = url.searchParams.get("status")

    // Build filter
    const filter: any = {
      isActive: true,
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

    if (status) {
      filter.status = status
    }

    // Get products
    const products = await prisma.product.findMany({
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        businessPrice: true,
        commission: true,
        category: true,
        subcategory: true,
        stock: true,
        image: true,
        images: true,
        status: true,
        sellerId: true,
        isActive: true,
        brandId: true,
        manufacturer: true,
        countryOfOrigin: true,
        warrantyInfo: true,
        minOrderQuantity: true,
        maxOrderQuantity: true,
        shippingWeight: true,
        isFragile: true,
        requiresSpecialHandling: true,
        certifications: true,
        createdAt: true,
        updatedAt: true,
        variants: {
          select: {
            id: true,
            sku: true,
            color: true,
            size: true,
            stock: true,
            price: true,
          }
        },
        specifications: {
          select: {
            id: true,
            name: true,
            value: true,
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        dccStocks: {
          select: {
            id: true,
            quantity: true,
            dcc: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Get total count for pagination
    const total = await prisma.product.count({ where: filter })

    // Get user token and role
    let token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = req.cookies.get("Gemurai_token")?.value
    }

    let userRole = "CONSUMER"
    if (token) {
      try {
        const user = await verifyAuthToken(token)
        if (user) {
          userRole = user.role
        }
      } catch (error) {
        console.error("Error verifying token:", error)
      }
    }

    return NextResponse.json({
      success: true,
      products: products.map(product => ({
        ...product,
        image: product.image ? 
          (product.image.startsWith('http') ? product.image : 
           product.image.startsWith('/') ? product.image : `/uploads/${product.image}`)
          : getDefaultProductImage(product.name, product.category),
        images: getProductImages(product),
        // Only include DCC stock information if the user is not a DCC
        dccStockTotal: userRole !== "DCC" ? product.dccStocks.reduce((total, stock) => total + stock.quantity, 0) : 0,
        // Remove the detailed DCC stock information from the response
        dccStocks: undefined
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Get token from multiple sources
    let token: string | undefined

    // 1. Try Authorization header first
    const authHeader = req.headers.get("Authorization")
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    // 2. Try cookies if no Authorization header
    if (!token) {
      const cookies = req.headers.get("cookie")
      // Try NextAuth session token
      token = cookies?.match(/next-auth.session-token=([^;]+)/)?.[1]
      
      // Try development token if no session token
      if (!token) {
        token = cookies?.match(/Gemurai_token=([^;]+)/)?.[1]
      }
    }

    if (!token) {
      return NextResponse.json({ 
        error: "Unauthorized - No token found",
        message: "Please log in to continue"
      }, { status: 401 })
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json({ 
        error: "Unauthorized - Invalid token",
        message: "Your session has expired. Please log in again."
      }, { status: 401 })
    }

    // Check if user has required role and permissions
    if (user.role !== "EMPLOYER") {
      return NextResponse.json({ 
        error: "Unauthorized - Invalid role",
        message: "Only employers can create products",
        role: user.role,
        requiredRole: "EMPLOYER"
      }, { status: 403 })
    }

    // Add required permissions if they don't exist
    if (!user.permissions.includes("products.create")) {
      user.permissions.push("products.create")
    }

    let productData: any = {}
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      // Handle form data
      const formData = await req.formData()
      console.log("API: Received form data:", Object.fromEntries(formData))
      
      // Basic Information - Required fields
      productData.name = formData.get("name") as string || ""
      productData.description = formData.get("description") as string || ""
      productData.price = formData.get("price") as string || ""
      productData.businessPrice = formData.get("businessPrice") as string || ""
      productData.category = formData.get("category") as string || ""
      productData.stock = formData.get("stock") as string || ""
      productData.commission = formData.get("commission") as string || ""

      // Handle image uploads
      const mainImage = formData.get("image") as File
      if (mainImage && mainImage.size > 0) {
        productData.image = await uploadImage(mainImage)
        console.log("API: Uploaded main image:", productData.image)
      }

      const additionalImages = formData.getAll("images") as File[]
      if (additionalImages.length > 0) {
        productData.images = await Promise.all(
          additionalImages.filter(img => img.size > 0).map(image => uploadImage(image))
        )
        console.log("API: Uploaded additional images:", productData.images)
      }
    } else {
      // Handle JSON data
      productData = await req.json()
    }

    // Debug log
    console.log("API received data:", productData)
      
    // Validate required fields with detailed error messages
    const errors: Record<string, string | null> = {
      name: !productData.name?.trim() ? "Name is required" : null,
      description: !productData.description?.trim() ? "Description is required" : null,
      price: !productData.price ? "Price is required" : null,
      category: !productData.category?.trim() ? "Category is required" : null,
      stock: productData.stock === undefined ? "Stock is required" : null,
      commission: productData.commission === undefined ? "Commission is required" : null
    }

    // Filter out null errors
    const validationErrors = Object.entries(errors)
      .filter(([_, value]) => value !== null)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

    if (Object.keys(validationErrors).length > 0) {
      console.error("Validation errors:", validationErrors)
      return NextResponse.json({ 
        error: "Missing or invalid required fields",
        details: validationErrors
      }, { status: 400 })
    }

    // Create the product with proper data
    const product = await ProductService.createProduct(productData, user)

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ 
      error: "Failed to create product",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = await verifyAuthToken(token)

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await req.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      )
    }

    const product = await ProductService.updateProduct(id, updateData, user)
    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error("Error in PUT /api/products:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update product"
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = await verifyAuthToken(token)

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      )
    }

    await ProductService.deleteProduct(id, user)
    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    })
  } catch (error) {
    console.error("Error in DELETE /api/products:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete product"
      },
      { status: 500 }
    )
  }
} 