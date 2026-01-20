import { NextRequest, NextResponse } from "next/server"
import { CropProcessingService } from "@/lib/services/CropProcessingService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * POST /api/v1/mcc/crops/processing - Process crop
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const {
      mccId,
      rawCropProductId,
      processedProductId,
      inputQuantity,
      outputQuantity,
      processingDate,
      processingSteps,
      qualityMetrics,
    } = data

    if (!mccId || !rawCropProductId || !processedProductId || !inputQuantity || !outputQuantity) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: mccId, rawCropProductId, processedProductId, inputQuantity, outputQuantity",
        },
        { status: 400 }
      )
    }

    const processing = await CropProcessingService.processCrop({
      mccId,
      rawCropProductId,
      processedProductId,
      inputQuantity: parseFloat(inputQuantity),
      outputQuantity: parseFloat(outputQuantity),
      processingDate: processingDate ? new Date(processingDate) : new Date(),
      processingSteps,
      qualityMetrics,
    })

    return NextResponse.json({
      success: true,
      message: "Crop processing recorded successfully",
      data: processing,
    })
  } catch (error) {
    console.error("Process crop error:", error)
    return NextResponse.json(
      { error: "Failed to process crop" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/mcc/crops/processing - Get crop processing records
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")
    const rawProductId = searchParams.get("rawProductId")
    const processedProductId = searchParams.get("processedProductId")
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const records = await CropProcessingService.getProcessingRecords({
      mccId: mccId || undefined,
      rawProductId: rawProductId || undefined,
      processedProductId: processedProductId || undefined,
      status: status || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })

    return NextResponse.json({
      success: true,
      data: records,
    })
  } catch (error) {
    console.error("Get crop processing error:", error)
    return NextResponse.json(
      { error: "Failed to get crop processing records" },
      { status: 500 }
    )
  }
}
