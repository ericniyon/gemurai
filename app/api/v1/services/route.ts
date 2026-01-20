import { NextRequest, NextResponse } from "next/server"
import { ServiceDeliveryService } from "@/lib/services/ServiceDeliveryService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * GET /api/v1/services - Get services catalog
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
    const activeOnly = searchParams.get("activeOnly") !== "false"

    const services = await ServiceDeliveryService.getServices(activeOnly)

    return NextResponse.json({
      success: true,
      data: services,
    })
  } catch (error) {
    console.error("Get services error:", error)
    return NextResponse.json(
      { error: "Failed to get services" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/services - Create service
 */
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
    const { name, code, type, description, pricing, duration, sla } = data

    if (!name || !code || !type || !pricing) {
      return NextResponse.json(
        { error: "Missing required fields: name, code, type, pricing" },
        { status: 400 }
      )
    }

    const service = await ServiceDeliveryService.createService({
      name,
      code,
      type,
      description,
      pricing,
      duration,
      sla,
    })

    return NextResponse.json({
      success: true,
      message: "Service created successfully",
      data: service,
    })
  } catch (error: any) {
    console.error("Create service error:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Service code already exists" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    )
  }
}
