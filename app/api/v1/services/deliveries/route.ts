import { NextRequest, NextResponse } from "next/server"
import { ServiceDeliveryService } from "@/lib/services/ServiceDeliveryService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * POST /api/v1/services/deliveries - Create service delivery request
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
    const { serviceId, farmerId, mccId, scheduledDate, notes, cost } = data

    if (!serviceId || !scheduledDate) {
      return NextResponse.json(
        { error: "Missing required fields: serviceId, scheduledDate" },
        { status: 400 }
      )
    }

    const delivery = await ServiceDeliveryService.createDelivery({
      serviceId,
      farmerId,
      mccId,
      requestedBy: user.id,
      scheduledDate: new Date(scheduledDate),
      notes,
      cost: cost ? parseFloat(cost) : undefined,
    })

    return NextResponse.json({
      success: true,
      message: "Service delivery requested successfully",
      data: delivery,
    })
  } catch (error) {
    console.error("Create service delivery error:", error)
    return NextResponse.json(
      {
        error: "Failed to create service delivery",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/services/deliveries - Get service deliveries
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
    const serviceId = searchParams.get("serviceId")
    const farmerId = searchParams.get("farmerId")
    const mccId = searchParams.get("mccId")
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const deliveries = await ServiceDeliveryService.getDeliveries({
      serviceId: serviceId || undefined,
      farmerId: farmerId || undefined,
      mccId: mccId || undefined,
      status: status || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })

    return NextResponse.json({
      success: true,
      data: deliveries,
    })
  } catch (error) {
    console.error("Get service deliveries error:", error)
    return NextResponse.json(
      { error: "Failed to get service deliveries" },
      { status: 500 }
    )
  }
}
