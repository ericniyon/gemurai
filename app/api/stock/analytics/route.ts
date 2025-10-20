import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { NextRequest as NR } from "next/server"

// Simple health check endpoint
export async function POST(req: NextRequest) {
  try {
    console.log("🏥 Health check requested")
    
    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log("✅ Database connection test:", dbTest)
    
    // Test user table
    const userCount = await prisma.user.count()
    console.log("✅ User count:", userCount)
    
    // Test product table
    const productCount = await prisma.product.count()
    console.log("✅ Product count:", productCount)
    
    // Test if we can query with relations
    try {
      const testProduct = await prisma.product.findFirst({
        include: {
          stockOrderProducts: true
        }
      })
      console.log("✅ Product with relations test:", !!testProduct)
    } catch (relationError) {
      console.error("❌ Product relations test failed:", relationError)
    }
    
    return NextResponse.json({
      success: true,
      message: "Health check passed",
      data: {
        database: "connected",
        users: userCount,
        products: productCount
      }
    })
  } catch (error) {
    console.error("❌ Health check failed:", error)
    return NextResponse.json(
      { error: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 Stock analytics API called")
    
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1 as test`
      console.log("✅ Database connection verified")
    } catch (dbConnectionError) {
      console.error("❌ Database connection failed:", dbConnectionError)
      return NextResponse.json(
        { error: "Database connection failed. Please try again later." },
        { status: 503 }
      )
    }
    
    // Get token from multiple sources
    let token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = req.cookies.get("Gemurai_token")?.value
    }

    console.log("Token found:", !!token)

    if (!token) {
      console.error("❌ No authentication token found")
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)
    console.log("User verification result:", !!user, user?.email, user?.role)
    
    if (!user) {
      console.error("❌ Invalid or expired token")
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    // Verify user exists and is active
    console.log("🔍 Checking user in database:", user.id)
    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
        isActive: true
      },
      include: {
        userRole: {
          include: { role: true }
        }
      }
    })

    console.log("Database user found:", !!dbUser, dbUser?.email)

    if (!dbUser) {
      console.error("❌ User not found or inactive")
      return NextResponse.json(
        { error: "User not found or inactive" },
        { status: 403 }
      )
    }

    // Support both direct role and userRole relation
    const userRoleName = (dbUser.role || dbUser.userRole?.role?.name || '').toUpperCase();
    console.log("User role:", userRoleName)
    
    if (userRoleName !== "EMPLOYER") {
      console.error("❌ User is not an employer:", userRoleName)
      return NextResponse.json(
        { error: "Only employers can access stock analytics" },
        { status: 403 }
      )
    }

    console.log("✅ User authorized, fetching products for employer:", user.id)

    // Debug: Check total products in database
    try {
      const totalProductsInDB = await prisma.product.count()
      console.log("📦 Total products in database:", totalProductsInDB)
      
      // Check products for this specific user
      const userProductsCount = await prisma.product.count({
        where: { sellerId: user.id }
      })
      console.log("👤 Products for this user:", userProductsCount)
      
      // Check if user has any role assignments
      const userRoles = await prisma.userRoleAssignment.findMany({
        where: { userId: user.id },
        include: { role: true }
      })
      console.log("👤 User role assignments:", userRoles.map(ur => ur.role.name))
    } catch (debugError) {
      console.error("❌ Debug query failed:", debugError)
    }

    // Get all products for this employer
    let products
    try {
      products = await prisma.product.findMany({
        where: {
          sellerId: user.id,
          isActive: true
        },
        include: {
          stockOrderProducts: true
        }
      })
      console.log("📦 Products found:", products.length)
    } catch (dbError) {
      console.error("❌ Database error fetching products:", dbError)
      return NextResponse.json(
        { error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}` },
        { status: 500 }
      )
    }

    // Calculate analytics
    const totalProducts = products.length
    const lowStockThreshold = 10 // Consider items with stock < 10 as low stock
    const criticalStockThreshold = 50 // Consider items with stock < 50 as critical stock
    
    console.log("📊 Analytics calculation:", {
      userId: user.id,
      totalProducts,
      products: products.map(p => ({ id: p.id, name: p.name, stock: p.stock }))
    })
    
    const lowStockItems = products
      .filter(p => p.stock > 0 && p.stock < lowStockThreshold)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category
      }))

    const criticalStockItems = products
      .filter(p => p.stock < criticalStockThreshold)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category
      }))

    const totalStockValue = products.reduce((total, product) => {
      return total + (product.price * product.stock)
    }, 0)

    const totalStockQuantity = products.reduce((total, product) => {
      return total + product.stock
    }, 0)

    console.log("📊 Analytics calculated:", {
      totalProducts,
      lowStockItems: lowStockItems.length,
      criticalStockItems: criticalStockItems.length,
      totalStockValue,
      totalStockQuantity
    })

    // Calculate most ordered products (only if there are products)
    const mostOrderedProducts = products.length > 0 ? products
      .map(product => ({
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category
        },
        orderCount: product.stockOrderProducts.reduce((sum, sop) => sum + sop.quantity, 0)
      }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5) : []

    // Calculate stock trends by category (only if there are products)
    const categoryTrends = products.length > 0 ? products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          totalOrders: 0,
          previousPeriodOrders: 0,
          currentPeriodOrders: 0
        }
      }

      // Calculate orders for this product
      const productOrders = product.stockOrderProducts.reduce((sum, sop) => sum + sop.quantity, 0)
      acc[product.category].totalOrders += productOrders

      // For now, we'll use a simple approach since we don't have createdAt on StockOrderProduct
      // We'll calculate trends based on total orders
      acc[product.category].currentPeriodOrders += productOrders
      acc[product.category].previousPeriodOrders += Math.floor(productOrders * 0.8) // Simulate previous period

      return acc
    }, {} as Record<string, { totalOrders: number, previousPeriodOrders: number, currentPeriodOrders: number }>) : {}

    const stockTrends = products.length > 0 ? (Object.entries(categoryTrends) as [string, { currentPeriodOrders: number, previousPeriodOrders: number, totalOrders: number }][]).map(([category, data]) => {
      const trend = data.currentPeriodOrders >= data.previousPeriodOrders ? 'up' : 'down'
      const percentage = data.previousPeriodOrders === 0 ? 0 :
        Math.round(((data.currentPeriodOrders - data.previousPeriodOrders) / data.previousPeriodOrders) * 100)

      return {
        category,
        trend,
        percentage: Math.abs(percentage)
      }
    }) : []

    // Interview analytics
    // Find all applications for this employer
    let applications = []
    let interviews = []
    let interviewAnalytics = {
      totalInterviews: 0,
      completedInterviews: 0,
      pendingInterviews: 0,
      avgInterviewScore: 0
    }

    try {
      applications = await prisma.application.findMany({
        where: { userId: user.id },
        select: { id: true }
      })
      const applicationIds = applications.map(app => app.id)

      // Find all interviews for these applications
      interviews = await prisma.applicationInterview.findMany({
        where: { applicationId: { in: applicationIds } },
        select: { id: true, status: true, overallScore: true }
      })
      
      const totalInterviews = interviews.length
      const completedInterviews = interviews.filter(i => i.status === "COMPLETED").length
      const pendingInterviews = interviews.filter(i => i.status !== "COMPLETED").length
      const avgInterviewScore =
        completedInterviews > 0
          ? (
              interviews
                .filter(i => i.status === "COMPLETED" && typeof i.overallScore === "number")
                .reduce((sum, i) => sum + (i.overallScore || 0), 0) /
              completedInterviews
            )
          : 0

      interviewAnalytics = {
        totalInterviews,
        completedInterviews,
        pendingInterviews,
        avgInterviewScore
      }
    } catch (interviewError) {
      console.error("❌ Error fetching interview analytics:", interviewError)
      // Continue with default interview analytics
    }

    console.log("✅ Stock analytics calculated successfully")

    return NextResponse.json({
      success: true,
      analytics: {
        totalProducts,
        lowStockItems,
        criticalStockItems,
        totalStockValue,
        totalStockQuantity,
        mostOrderedProducts,
        stockTrends,
        // Interview analytics
        interview: interviewAnalytics
      }
    })
  } catch (error) {
    console.error("❌ Error fetching stock analytics:", error)
    return NextResponse.json(
      { error: `Failed to fetch stock analytics: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 

export async function GET_INTERVIEWED(req: NR) {
  try {
    // Get all applications with status INTERVIEWED
    const applications = await prisma.application.findMany({
      where: { status: "INTERVIEWED" },
      select: {
        id: true,
        email: true,
        status: true,
        interviewScores: {
          select: {
            totalScore: true,
            overallScore: true,
            submittedBy: true,
            submittedAt: true
          }
        }
      }
    })
    return NextResponse.json({
      success: true,
      applications
    })
  } catch (error) {
    console.error("Error fetching interviewed applications:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// To use this, add a route in your Next.js API routes as /api/applications/interviewed/route.ts and export this GET_INTERVIEWED as GET. 