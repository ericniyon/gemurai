import { NextRequest, NextResponse } from "next/server"
import { ServiceDeliveryService } from "@/lib/services/ServiceDeliveryService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * PUT /api/v1/services/deliveries/[id] - Update service delivery status
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { status, completedDate } = data

    if (!status) {
      return NextResponse.json(
        { error: "Missing required field: status" },
        { status: 400 }
      )
    }

    const delivery = await ServiceDeliveryService.updateDeliveryStatus(
      params.id,
      status,
      completedDate ? new Date(completedDate) : undefined
    )

    return NextResponse.json({
      success: true,
      message: "Service delivery updated successfully",
      data: delivery,
    })
  } catch (error) {
    console.error("Update service delivery error:", error)
    return NextResponse.json(
      { error: "Failed to update service delivery" },
      { status: 500 }
    )
  }
}
