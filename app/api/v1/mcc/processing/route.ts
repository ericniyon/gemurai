import { NextRequest, NextResponse } from "next/server"
import { MCCInventoryService } from "@/lib/services/MCCInventoryService"
import { verifyAuthToken } from "@/lib/api-auth"

// POST /api/v1/mcc/processing - Process milk from raw to processed
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
    if (!data.mccId || !data.rawMilkProductId || !data.processedProductId || 
        !data.inputQuantity || !data.outputQuantity) {
      return NextResponse.json(
        { error: "Missing required fields: mccId, rawMilkProductId, processedProductId, inputQuantity, outputQuantity" },
        { status: 400 }
      )
    }

    // Add processedBy field
    const processingData = {
      ...data,
      processingDate: data.processingDate ? new Date(data.processingDate) : new Date(),
      processedBy: user.id
    }

    const result = await MCCInventoryService.processMilk(processingData)

    return NextResponse.json({
      success: true,
      message: "Milk processing completed successfully",
      data: result
    })
  } catch (error) {
    console.error("Milk processing error:", error)
    return NextResponse.json(
      { error: "Failed to process milk" },
      { status: 500 }
    )
  }
}

// GET /api/v1/mcc/processing - Get processing history
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")
    const limit = parseInt(searchParams.get("limit") || "10")

    if (!mccId) {
      return NextResponse.json(
        { error: "mccId parameter is required" },
        { status: 400 }
      )
    }

    const processingHistory = await MCCInventoryService.getMCCProcessingHistory(mccId, limit)

    return NextResponse.json({
      success: true,
      data: processingHistory
    })
  } catch (error) {
    console.error("Get processing history error:", error)
    return NextResponse.json(
      { error: "Failed to get processing history" },
      { status: 500 }
    )
  }
}





















