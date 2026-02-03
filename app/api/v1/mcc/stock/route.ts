import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"

// GET /api/v1/mcc/stock - Get MCC stock data
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")

    if (!mccId) {
      return NextResponse.json({ 
        success: false, 
        error: "MCC ID is required" 
      }, { status: 400 })
    }

    // Check if user has access to this MCC
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      const userRecord = await prisma.user.findFirst({
        where: {
          id: user.id,
          mccId: mccId
        }
      })

      if (!userRecord) {
        return NextResponse.json({ error: "Access denied to this MCC" }, { status: 403 })
      }
    }

    // Get MCC warehouses and their products (products use "stock" not "quantity")
    const warehouses = await prisma.mcc_warehouses.findMany({
      where: {
        mccId: mccId,
        isActive: true
      },
      include: {
        products: {
          where: {
            stock: {
              gt: 0
            }
          }
        }
      }
    })

    // Transform the data to match our StockItem interface
    const stockItems = warehouses.flatMap(warehouse =>
      warehouse.products.map(product => ({
        id: product.id,
        productName: product.name,
        productType: product.mccProductType || "RAW_MILK",
        currentQuantity: product.stock ?? 0,
        unit: product.unitOfMeasure || "Liters",
        unitPrice: product.price ?? 0,
        totalValue: (product.stock ?? 0) * (product.price ?? 0),
        warehouseName: warehouse.name,
        warehouseType: warehouse.type,
        lastUpdated: product.updatedAt?.toISOString() ?? new Date().toISOString(),
        expiryDate: product.expiryDate?.toISOString(),
        qualityStatus: "GOOD" as const,
        source: "COLLECTION" as const
      }))
    )

    // Get milk collections to calculate raw milk stock
    const milkCollections = await prisma.milk_collections.findMany({
      where: {
        farmers: {
          mccId: mccId
        },
        status: 'APPROVED'
      },
      include: {
        farmers: true
      },
      orderBy: {
        collectionDate: 'desc'
      },
      take: 100 // Get recent collections
    })

    // Calculate raw milk stock from collections
    const totalRawMilkCollected = milkCollections.reduce((sum, collection) => 
      sum + (collection.totalLiters || 0), 0
    )

    // Add raw milk stock item if we have collections
    if (totalRawMilkCollected > 0) {
      stockItems.unshift({
        id: 'raw-milk-collected',
        productName: 'Fresh Raw Milk',
        productType: 'RAW_MILK',
        currentQuantity: totalRawMilkCollected,
        unit: 'Liters',
        unitPrice: 1200, // Default price per liter
        totalValue: totalRawMilkCollected * 1200,
        warehouseName: 'Collection Center',
        warehouseType: 'COLLECTION_CENTER',
        lastUpdated: new Date().toISOString(),
        qualityStatus: 'EXCELLENT',
        source: 'COLLECTION'
      })
    }

    return NextResponse.json({
      success: true,
      data: stockItems,
      summary: {
        totalProducts: stockItems.length,
        totalQuantity: stockItems.reduce((sum, item) => sum + item.currentQuantity, 0),
        totalValue: stockItems.reduce((sum, item) => sum + item.totalValue, 0),
        rawMilkStock: stockItems
          .filter(item => item.productType === 'RAW_MILK')
          .reduce((sum, item) => sum + item.currentQuantity, 0),
        processedMilkStock: stockItems
          .filter(item => item.productType === 'PROCESSED_MILK')
          .reduce((sum, item) => sum + item.currentQuantity, 0),
        milkProductsStock: stockItems
          .filter(item => item.productType === 'MILK_PRODUCTS')
          .reduce((sum, item) => sum + item.currentQuantity, 0),
        byproductsStock: stockItems
          .filter(item => item.productType === 'BYPRODUCTS')
          .reduce((sum, item) => sum + item.currentQuantity, 0)
      }
    })
  } catch (error) {
    console.error("Get stock error:", error)
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    )
  }
}



















