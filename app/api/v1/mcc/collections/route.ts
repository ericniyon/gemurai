import { NextRequest, NextResponse } from "next/server"
import { MCCInventoryService } from "@/lib/services/MCCInventoryService"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

// POST /api/v1/mcc/collections - Record milk collection
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()
    
    // Validate required fields
    if (!data.farmerId || !data.totalLiters || !data.unitPrice) {
      return NextResponse.json(
        { error: "Missing required fields: farmerId, totalLiters, unitPrice" },
        { status: 400 }
      )
    }

    // Add collectedBy field
    const collectionData = {
      ...data,
      collectionDate: data.collectionDate ? new Date(data.collectionDate) : new Date(),
      collectedBy: user.id
    }

    const result = await MCCInventoryService.recordMilkCollection(collectionData)

    return NextResponse.json({
      success: true,
      message: "Milk collection recorded successfully",
      data: result
    })
  } catch (error) {
    console.error("Milk collection error:", error)
    return NextResponse.json(
      { error: "Failed to record milk collection" },
      { status: 500 }
    )
  }
}

// GET /api/v1/mcc/collections - Get milk collections
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
    const farmerId = searchParams.get("farmerId")
    const limit = parseInt(searchParams.get("limit") || "10")

    if (farmerId) {
      const collections = await MCCInventoryService.getFarmerCollectionHistory(farmerId, limit)
      return NextResponse.json({
        success: true,
        data: collections
      })
    }

    // If no farmerId, return all collections (admin only)
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all collections with pagination
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    console.log("Attempting to query milk_collections table...")
    
    // First, let's check if the table exists and has any data
    const tableExists = await prisma.$queryRaw`SELECT COUNT(*) as count FROM milk_collections LIMIT 1`
    console.log("Table check result:", tableExists)

    const collections = await prisma.milk_collections.findMany({
      include: {
        farmers: true,
        products: true,
        warehouses: true,
        locations: true,
        stock_moves: true
      },
      orderBy: { collectionDate: 'desc' },
      skip,
      take: limit
    })

    console.log("Collections found:", collections.length)

    const total = await prisma.milk_collections.count()

    return NextResponse.json({
      success: true,
      data: collections,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Get collections error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: "Failed to get collections" },
      { status: 500 }
    )
  }
}


