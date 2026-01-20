import { NextRequest, NextResponse } from "next/server"
import { CommodityStudioService } from "@/lib/services/CommodityStudioService"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/admin/commodity-studio/categories - Get commodity categories
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
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get("activeOnly") !== "false"

    const categories = await CommodityStudioService.getCategories(activeOnly)

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error: any) {
    console.error("Get commodity categories error:", error)
    return NextResponse.json(
      { 
        error: "Failed to get commodity categories",
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/admin/commodity-studio/categories - Create commodity category
 */
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
    const { name, description, defaultStorageType, status } = data

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      )
    }

    const category = await CommodityStudioService.createCategory({
      name,
      description,
      defaultStorageType,
      status,
    })

    return NextResponse.json({
      success: true,
      message: "Commodity category created successfully",
      data: category,
    })
  } catch (error: any) {
    console.error("Create commodity category error:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Category name already exists" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create commodity category" },
      { status: 500 }
    )
  }
}
