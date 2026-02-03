import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ReconciliationService } from "@/lib/services/ReconciliationService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * POST /api/v1/mcc/reconciliation/run - Run reconciliation
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

    let data: { mccId?: string; periodId?: string; type?: string }
    try {
      data = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    const { mccId, periodId, type } = data

    if (!mccId || !type) {
      return NextResponse.json(
        { error: "Missing required fields: mccId, type" },
        { status: 400 }
      )
    }

    // Verify MCC exists
    const mcc = await prisma.mccs.findUnique({ where: { id: mccId } })
    if (!mcc) {
      return NextResponse.json(
        { error: "MCC not found" },
        { status: 400 }
      )
    }

    let result
    try {
      if (type === "COLLECTION") {
        result = await ReconciliationService.reconcileCollections(mccId, periodId)
      } else if (type === "INVENTORY") {
        const warehouseId = data.warehouseId
        result = await ReconciliationService.reconcileInventory(mccId, warehouseId)
      } else {
        return NextResponse.json(
          { error: "Invalid reconciliation type" },
          { status: 400 }
        )
      }
    } catch (err: any) {
      console.error("Reconciliation step error:", err)
      throw new Error(`Reconciliation failed: ${err?.message || String(err)}`)
    }

    // Create reconciliation record
    let record
    try {
      record = await ReconciliationService.createReconciliationRecord(
        mccId,
        periodId || null,
        type,
        result,
        user.id
      )
    } catch (err: any) {
      console.error("Create reconciliation record error:", err)
      throw new Error(`Failed to save record: ${err?.message || String(err)}`)
    }

    return NextResponse.json({
      success: true,
      message: "Reconciliation completed",
      data: {
        result,
        record,
      },
    })
  } catch (error: any) {
    console.error("Run reconciliation error:", error)
    const message = error?.message || String(error)
    const isValidation =
      /not found|foreign key|unique constraint|invalid/i.test(message) ||
      message.includes("Record to update not found")
    return NextResponse.json(
      {
        error: isValidation ? message : "Failed to run reconciliation",
        details: message,
      },
      { status: isValidation ? 400 : 500 }
    )
  }
}

/**
 * GET /api/v1/mcc/reconciliation - Get reconciliation records
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
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const records = await ReconciliationService.getReconciliationRecords({
      mccId: mccId || undefined,
      type: type || undefined,
      status: status || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })

    return NextResponse.json({
      success: true,
      data: records,
    })
  } catch (error) {
    console.error("Get reconciliation records error:", error)
    return NextResponse.json(
      { error: "Failed to get reconciliation records" },
      { status: 500 }
    )
  }
}
