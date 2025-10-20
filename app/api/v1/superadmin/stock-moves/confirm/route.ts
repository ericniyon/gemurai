import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { getAuthUser } from "@/lib/api-auth"
import { InventoryService } from "@/lib/services/InventoryService"

export async function POST(req: NextRequest) {
  console.log("=== STOCK MOVE CONFIRM API ===")
  
  try {
    // Get authenticated user
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to confirm stock moves
    if (!["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await req.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json({ error: "Stock move ID is required" }, { status: 400 })
    }
    
    console.log("Confirming stock move ID:", id)
    console.log("User:", user.name, "Role:", user.role)
    
    // Use InventoryService to handle the complete confirmation process
    // This will handle state transitions and stock quantity updates
    const updatedMove = await InventoryService.confirmStockMove(id, user)
    
    console.log("Stock move confirmed successfully")
    
    return NextResponse.json({
      success: true,
      message: "Stock move confirmed successfully",
      stockMove: updatedMove
    })
    
  } catch (error) {
    console.error("Error confirming stock move:", error)
    return NextResponse.json({
      error: "Failed to confirm stock move",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 