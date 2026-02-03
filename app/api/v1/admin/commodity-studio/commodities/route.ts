import { NextRequest, NextResponse } from "next/server"
import { CommodityStudioService } from "@/lib/services/CommodityStudioService"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/admin/commodity-studio/commodities - Get commodities
 */
export async function GET(req: NextRequest) {
  try {
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1 as test`
    } catch (dbError: any) {
      console.error("Database connection error:", dbError)
      const errorCode = dbError?.code || 'UNKNOWN'
      const errorMessage = dbError?.message || 'Unknown database error'
      
      // Check if it's a connection error
      if (errorCode === 'P1001' || errorMessage.includes("Can't reach database server")) {
        return NextResponse.json(
          { 
            error: "Database connection failed",
            message: "Cannot reach the database server. Please check if your Railway database is running and accessible.",
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
            suggestion: "Check your Railway dashboard to ensure the database service is active and not paused."
          },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      )
    }

    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get("activeOnly") !== "false"

    const commodities = await CommodityStudioService.getCommodities(activeOnly)

    return NextResponse.json({
      success: true,
      data: commodities,
    })
  } catch (error: any) {
    console.error("Get commodities error:", error)
    return NextResponse.json(
      { 
        error: "Failed to get commodities",
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/admin/commodity-studio/commodities - Create commodity
 */
export async function POST(req: NextRequest) {
  try {
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1 as test`
    } catch (dbError: any) {
      console.error("Database connection error:", dbError)
      const errorCode = dbError?.code || 'UNKNOWN'
      const errorMessage = dbError?.message || 'Unknown database error'
      
      // Check if it's a connection error
      if (errorCode === 'P1001' || errorMessage.includes("Can't reach database server")) {
        return NextResponse.json(
          { 
            error: "Database connection failed",
            message: "Cannot reach the database server. Please check if your Railway database is running and accessible.",
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
            suggestion: "Check your Railway dashboard to ensure the database service is active and not paused."
          },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      )
    }

    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()
    const {
      name,
      code,
      categoryId,
      unitOfMeasure,
      pricingMethod,
      storageType,
      isPerishable,
      defaultCollectionCenterType,
      defaultCollectionFrequency,
      metadata,
    } = data

    if (!name || !code || !categoryId || !unitOfMeasure || !pricingMethod || !storageType) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, code, categoryId, unitOfMeasure, pricingMethod, storageType",
        },
        { status: 400 }
      )
    }

    // Validate category exists
    const category = await prisma.commodity_categories.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        {
          error: "Category not found",
          details: `Category with ID ${categoryId} does not exist`,
        },
        { status: 400 }
      )
    }

    // Validate pricing method enum
    const validPricingMethods = ["SPOT", "GRADE_BASED", "DEFERRED", "POST_SALE"]
    if (!validPricingMethods.includes(pricingMethod)) {
      return NextResponse.json(
        {
          error: "Invalid pricing method",
          details: `Pricing method must be one of: ${validPricingMethods.join(", ")}`,
        },
        { status: 400 }
      )
    }

    const commodity = await CommodityStudioService.createCommodity({
      name,
      code,
      categoryId,
      unitOfMeasure,
      pricingMethod,
      storageType,
      isPerishable: isPerishable ?? false,
      defaultCollectionCenterType,
      defaultCollectionFrequency,
      metadata,
    })

    return NextResponse.json({
      success: true,
      message: "Commodity created successfully",
      data: commodity,
    })
  } catch (error: any) {
    console.error("Create commodity error:", error)
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    })
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Commodity code already exists" },
        { status: 409 }
      )
    }
    
    if (error.code === "P2003") {
      return NextResponse.json(
        { 
          error: "Invalid category reference",
          details: process.env.NODE_ENV === 'development' ? error?.meta : undefined
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: "Failed to create commodity",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        code: process.env.NODE_ENV === 'development' ? error?.code : undefined,
        details: process.env.NODE_ENV === 'development' ? error?.meta : undefined,
      },
      { status: 500 }
    )
  }
}
