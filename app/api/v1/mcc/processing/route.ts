import { NextRequest, NextResponse } from "next/server"
import { MCCInventoryService } from "@/lib/services/MCCInventoryService"
import { checkMCCPermission } from "@/lib/mcc-auth"
import { prisma } from "@/lib/prisma"

// POST /api/v1/mcc/processing - Process milk from raw to processed
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.inventory.manage"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    let targetMccId = data.mccId
    if (!targetMccId && user.role === "MCC_MANAGER" && user.mccId) {
      targetMccId = user.mccId
    }

    // Validate required fields
    if (!targetMccId || !data.rawMilkProductId || !data.processedProductId ||
        !data.inputQuantity || !data.outputQuantity) {
      return NextResponse.json(
        { error: "Missing required fields: mccId (or user MCC), rawMilkProductId, processedProductId, inputQuantity, outputQuantity" },
        { status: 400 }
      )
    }

    // MCC_MANAGER can only process for their own MCC
    if (user.role === "MCC_MANAGER" && user.mccId && targetMccId !== user.mccId) {
      return NextResponse.json({ error: "Access denied to this MCC" }, { status: 403 })
    }

    const processingData = {
      ...data,
      mccId: targetMccId,
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

// GET /api/v1/mcc/processing - Get processing history and products for form
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.inventory.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    let mccId = searchParams.get("mccId")
    if (!mccId && user.role === "MCC_MANAGER" && user.mccId) {
      mccId = user.mccId
    }
    const limit = parseInt(searchParams.get("limit") || "50")

    if (!mccId) {
      return NextResponse.json(
        { error: "mccId parameter required, or user must be assigned to an MCC" },
        { status: 400 }
      )
    }

    // MCC_MANAGER can only access their own MCC
    if (user.role === "MCC_MANAGER" && user.mccId && mccId !== user.mccId) {
      return NextResponse.json({ error: "Access denied to this MCC" }, { status: 403 })
    }

    const [processingHistoryRaw, warehouses] = await Promise.all([
      prisma.milk_processing.findMany({
        where: { mccId },
        include: {
          products_milk_processing_rawMilkProductIdToproducts: true,
          products_milk_processing_processedProductIdToproducts: true
        },
        orderBy: { processingDate: "desc" },
        take: limit
      }),
      prisma.mcc_warehouses.findMany({
        where: { mccId, isActive: true },
        include: {
          products: {
            where: {
              mccProductType: { in: ["RAW_MILK", "PROCESSED_MILK"] },
              isActive: true
            }
          }
        }
      })
    ])

    const processingHistory = processingHistoryRaw.map((r) => {
      const { products_milk_processing_rawMilkProductIdToproducts, products_milk_processing_processedProductIdToproducts, ...rest } = r
      return {
        ...rest,
        rawMilkProduct: products_milk_processing_rawMilkProductIdToproducts,
        processedProduct: products_milk_processing_processedProductIdToproducts
      }
    })

    const allProducts = warehouses.flatMap((w) => w.products || [])
    const rawMilkProducts = allProducts.filter((p) => p.mccProductType === "RAW_MILK")
    const processedMilkProducts = allProducts.filter((p) => p.mccProductType === "PROCESSED_MILK")

    return NextResponse.json({
      success: true,
      data: processingHistory,
      products: {
        rawMilk: rawMilkProducts.map((p) => ({ id: p.id, name: p.name, unit: p.unitOfMeasure || "Liters" })),
        processedMilk: processedMilkProducts.map((p) => ({ id: p.id, name: p.name, unit: p.unitOfMeasure || "Liters" }))
      }
    })
  } catch (error) {
    console.error("Get processing history error:", error)
    return NextResponse.json(
      { error: "Failed to get processing history" },
      { status: 500 }
    )
  }
}





















