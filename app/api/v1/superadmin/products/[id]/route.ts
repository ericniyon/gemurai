import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { prisma } from "@/lib/database"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!user.permissions?.includes('*') && !user.permissions?.includes('products.view')) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { id } = params

    const product = await prisma.product.findUnique({
      where: { id },
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
        variants: true,
        specifications: true,
        _count: {
          select: {
            stockQuantities: true,
            variants: true,
            reviews: true,
            stockMoves: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!user.permissions?.includes('*') && !user.permissions?.includes('products.edit')) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { id } = params
    const body = await req.json()
    
    console.log('🔄 PATCH request for product:', id)
    console.log('📤 Request body:', body)
    console.log('🖼️ Image field in request:', body.image)
    console.log('🖼️ Image field type:', typeof body.image)
    console.log('🖼️ Image field length:', body.image?.length)

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if barcode or internal reference already exists (excluding current product)
    if ((body.barcode && body.barcode.trim()) || (body.internalReference && body.internalReference.trim())) {
      const duplicateProduct = await prisma.product.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(body.barcode && body.barcode.trim() ? [{ barcode: body.barcode.trim() }] : []),
                ...(body.internalReference && body.internalReference.trim() ? [{ internalReference: body.internalReference.trim() }] : [])
              ]
            }
          ]
        }
      })

      if (duplicateProduct) {
        return NextResponse.json(
          { error: "Product with this barcode or internal reference already exists" },
          { status: 400 }
        )
      }
    }

    // Clean up barcode and internalReference to handle empty strings
    // Filter out invalid fields that don't exist in the Product model
    const validProductFields = [
      'name', 'description', 'price', 'businessPrice', 'image', 'category', 'subcategory', 'images',
      'isActive', 'status', 'stock', 'brandId', 'countryOfOrigin', 'isFragile',
      'manufacturer', 'maxOrderQuantity', 'minOrderQuantity', 'requiresSpecialHandling',
      'shippingWeight', 'warrantyInfo', 'commission', 'certifications', 'barcode',
      'costPrice', 'customAttributes', 'height', 'internalReference', 'lastPurchasePrice',
      'leadTime', 'length', 'maxStockLevel', 'packagingId', 'productType',
      'purchaseUnitOfMeasure', 'reorderPoint', 'salesUnitOfMeasure', 'standardPrice',
      'supplierInfo', 'tracking', 'unitOfMeasure', 'valuationMethod', 'volume', 'width'
    ]

    const cleanData = Object.keys(body)
      .filter(key => validProductFields.includes(key))
      .reduce((obj, key) => {
        if (key === 'barcode') {
          obj[key] = body[key] && body[key].trim() ? body[key].trim() : null
        } else if (key === 'internalReference') {
          obj[key] = body[key] && body[key].trim() ? body[key].trim() : null
        } else {
          obj[key] = body[key]
        }
        return obj
      }, {} as any)

    cleanData.updatedAt = new Date()

    console.log('🧹 Clean data for update:', cleanData)
    console.log('🖼️ Image in clean data:', cleanData.image)
    console.log('🖼️ Image type in clean data:', typeof cleanData.image)
    console.log('💰 Commission in clean data:', cleanData.commission)
    console.log('💰 Cost price in clean data:', cleanData.costPrice)
    console.log('💰 Sales price in clean data:', cleanData.price)
    
    const product = await prisma.product.update({
      where: { id },
      data: cleanData,
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

    console.log('💾 Updated product result:', { 
      id: product.id, 
      name: product.name, 
      image: product.image, 
      imageType: typeof product.image,
      imageLength: product.image?.length,
      images: product.images,
      commission: product.commission,
      costPrice: product.costPrice,
      price: product.price
    })

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DELETE request received for product:", params.id)
    console.log("Request cookies:", req.cookies.getAll())
    console.log("Request headers:", Object.fromEntries(req.headers.entries()))
    
    const user = await getAuthUser(req)
    console.log("Auth user result:", user ? { id: user.id, email: user.email, role: user.role, permissions: user.permissions } : "null")
    
    if (!user) {
      console.log("No user found, returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Checking permissions for products.delete")
    console.log("User permissions:", user.permissions)
    console.log("Has * permission:", user.permissions?.includes('*'))
    console.log("Has products.delete permission:", user.permissions?.includes('products.delete'))
    
    if (!user.permissions?.includes('*') && !user.permissions?.includes('products.delete')) {
      console.log("Insufficient permissions, returning 403")
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { id } = params

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            stockQuantities: true,
            stockMoves: true,
            inventoryAdjustments: true
          }
        }
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete related records first to avoid foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete from sales
      await tx.sale.deleteMany({
        where: { productId: id }
      })

      // Delete from stock_order_products
      await tx.stockOrderProduct.deleteMany({
        where: { productId: id }
      })

      // Delete from dcc_stocks
      await tx.dCCStock.deleteMany({
        where: { productId: id }
      })

      // Delete from stock_quantities
      await tx.stockQuantity.deleteMany({
        where: { productId: id }
      })

      // Delete from stock_moves
      await tx.stockMove.deleteMany({
        where: { productId: id }
      })

      // Delete from inventory_adjustments
      await tx.inventoryAdjustment.deleteMany({
        where: { productId: id }
      })

      // Delete from product_variants
      await tx.productVariant.deleteMany({
        where: { productId: id }
      })

      // Delete from product_reviews
      await tx.productReview.deleteMany({
        where: { productId: id }
      })

      // Delete from product_specifications
      await tx.productSpecification.deleteMany({
        where: { productId: id }
      })

      // Finally delete the product
      await tx.product.delete({
        where: { id }
      })
    }, {
      timeout: 30000 // 30 seconds timeout
    })

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete product" },
      { status: 500 }
    )
  }
} 