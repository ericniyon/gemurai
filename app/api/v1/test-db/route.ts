import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    console.log("=== DATABASE TEST API CALLED ===")
    
    // Test database connection
    await prisma.$connect()
    console.log("Database connected successfully")
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as version`
    console.log("Query result:", result)
    
    // Test stock move query
    const stockMoveCount = await prisma.stockMove.count()
    console.log("Stock move count:", stockMoveCount)
    
    // Test specific stock move
    const specificStockMove = await prisma.stockMove.findUnique({
      where: { id: 'cmcry38zv0001ddpgg1pna0fo' },
      include: {
        product: true,
        warehouse: true,
        location: true,
        destinationLocation: true
      }
    })
    console.log("Specific stock move found:", specificStockMove ? "Yes" : "No")
    
    return NextResponse.json({
      success: true,
      message: "Database connection and queries working",
      timestamp: result[0]?.current_time,
      version: result[0]?.version,
      stockMoveCount,
      specificStockMoveExists: !!specificStockMove,
      stockMoveDetails: specificStockMove ? {
        id: specificStockMove.id,
        state: specificStockMove.state,
        moveType: specificStockMove.moveType,
        quantity: specificStockMove.quantity
      } : null
    })
  } catch (error) {
    console.error("=== ERROR IN DATABASE TEST API ===")
    console.error("Error:", error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Database test failed",
        details: error instanceof Error ? error.stack : "No stack trace"
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 