import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { prisma } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Allow access for SUPER_ADMIN, ADMIN, and EMPLOYER roles
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'EMPLOYER']
    const hasPermission = user.permissions?.includes('*') || 
                         user.permissions?.includes('products.view') ||
                         allowedRoles.includes(user.role)
    
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { barcode: { contains: search, mode: 'insensitive' as const } },
          { internalReference: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(category && { category }),
      ...(isActive !== null && { isActive: isActive === 'true' })
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          brand: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              stockQuantities: true,
              variants: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    console.log('Fetched products with image data:', products.map(p => ({ 
      id: p.id, 
      name: p.name, 
      image: p.image, 
      images: p.images 
    })))
    
    console.log('Fetched products with commission data:', products.map(p => ({ 
      id: p.id, 
      name: p.name, 
      costPrice: p.costPrice, 
      price: p.price, 
      commission: p.commission 
    })))

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error("Error fetching products:", error)
    
    // Handle database connection errors specifically
    if (error.code === 'P1001') {
      return NextResponse.json(
        { 
          error: "Database connection failed. Please try again later.",
          details: "The database server is currently unreachable."
        },
        { status: 503 }
      )
    }
    
    // Handle other Prisma errors
    if (error.code && error.code.startsWith('P')) {
      return NextResponse.json(
        { 
          error: "Database operation failed",
          details: error.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Allow access for SUPER_ADMIN, ADMIN, and EMPLOYER roles
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'EMPLOYER']
    const hasPermission = user.permissions?.includes('*') || 
                         user.permissions?.includes('products.create') ||
                         allowedRoles.includes(user.role)
    
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await req.json()
    const {
      name,
      description,
      price,
      businessPrice,
      category,
      subcategory,
      image,
      images,
      stock,
      barcode,
      internalReference,
      brandId,
      productType,
      tracking,
      unitOfMeasure,
      reorderPoint,
      maxStockLevel,
      leadTime,
      costPrice,
      standardPrice,
      minOrderQuantity,
      maxOrderQuantity,
      isFragile,
      requiresSpecialHandling,
      shippingWeight,
      warrantyInfo,
      manufacturer,
      countryOfOrigin,
      certifications,
      volume,
      length,
      width,
      height,
      valuationMethod,
      customAttributes,
      commission
    } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      )
    }

    // Validate productType
    const validProductTypes = ['PHYSICAL', 'DIGITAL', 'SERVICE']
    if (productType && !validProductTypes.includes(productType)) {
      return NextResponse.json(
        { error: `Invalid productType. Must be one of: ${validProductTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if barcode or internal reference already exists (only if they have values)
    if ((barcode && barcode.trim()) || (internalReference && internalReference.trim())) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          OR: [
            ...(barcode && barcode.trim() ? [{ barcode: barcode.trim() }] : []),
            ...(internalReference && internalReference.trim() ? [{ internalReference: internalReference.trim() }] : [])
          ]
        }
      })

      if (existingProduct) {
        return NextResponse.json(
          { error: "Product with this barcode or internal reference already exists" },
          { status: 400 }
        )
      }
    }

    console.log('Creating product with data:', { name, image, images, category, commission, costPrice, price })
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: price || 0, // Set default price to 0 if not provided
        businessPrice: businessPrice ? parseFloat(businessPrice) : null,
        category,
        subcategory,
        image,
        images: images || [],
        stock: stock || 0,
        barcode: barcode && barcode.trim() ? barcode.trim() : null,
        internalReference: internalReference && internalReference.trim() ? internalReference.trim() : null,
        brandId,
        productType: productType || 'PHYSICAL',
        tracking: tracking || 'NONE',
        unitOfMeasure: unitOfMeasure || 'Units',
        reorderPoint: reorderPoint || 10,
        maxStockLevel,
        leadTime: leadTime || 7,
        costPrice,
        standardPrice,
        minOrderQuantity,
        maxOrderQuantity,
        isFragile: isFragile || false,
        requiresSpecialHandling: requiresSpecialHandling || false,
        shippingWeight,
        warrantyInfo,
        manufacturer,
        countryOfOrigin,
        certifications: certifications || [],
        volume,
        length,
        width,
        height,
        valuationMethod: valuationMethod || 'FIFO',
        customAttributes,
        sellerId: user.id,
        isActive: true,
        commission: commission || 0
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log('Created product result:', { 
      id: product.id, 
      name: product.name, 
      image: product.image, 
      images: product.images,
      commission: product.commission,
      costPrice: product.costPrice,
      price: product.price
    })
    
    return NextResponse.json({
      success: true,
      product
    })
  } catch (error: any) {
    console.error("Error creating product:", error)
    
    // Handle database connection errors specifically
    if (error.code === 'P1001') {
      return NextResponse.json(
        { 
          error: "Database connection failed. Please try again later.",
          details: "The database server is currently unreachable."
        },
        { status: 503 }
      )
    }
    
    // Handle other Prisma errors
    if (error.code && error.code.startsWith('P')) {
      return NextResponse.json(
        { 
          error: "Database operation failed",
          details: error.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    )
  }
} 