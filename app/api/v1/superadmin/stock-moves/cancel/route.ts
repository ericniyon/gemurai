import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { getAuthUser } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  console.log("=== STOCK MOVE CANCEL API ===")
  
  try {
    // Get authenticated user
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to cancel stock moves
    if (!["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await req.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json({ error: "Stock move ID is required" }, { status: 400 })
    }
    
    console.log("Cancelling stock move ID:", id)
    console.log("User:", user.name, "Role:", user.role)
    
    // Step 1: Find the stock move
    const stockMove = await prisma.stockMove.findUnique({
      where: { id },
      select: {
        id: true,
        state: true,
        moveType: true,
        quantity: true
      }
    })
    
    if (!stockMove) {
      return NextResponse.json({ error: "Stock move not found" }, { status: 404 })
    }
    
    if (stockMove.state === 'DONE') {
      return NextResponse.json({ 
        error: "Cannot cancel a completed stock move", 
        currentState: stockMove.state 
      }, { status: 400 })
    }
    
    if (stockMove.state === 'CANCELLED') {
      return NextResponse.json({ 
        error: "Stock move is already cancelled", 
        currentState: stockMove.state 
      }, { status: 400 })
    }
    
    // Step 2: Update stock move to cancelled
    const updatedMove = await prisma.stockMove.update({
      where: { id },
      data: {
        state: 'CANCELLED',
        processedBy: user.id,
        processedAt: new Date()
      },
      include: {
        product: {
          select: { id: true, name: true, image: true }
        }
      }
    })
    
    console.log("Stock move cancelled successfully")
    
    return NextResponse.json({
      success: true,
      message: "Stock move cancelled successfully",
      stockMove: updatedMove
    })
    
  } catch (error) {
    console.error("Error cancelling stock move:", error)
    return NextResponse.json({
      error: "Failed to cancel stock move",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 