import { NextRequest, NextResponse } from "next/server"
import { MCCInventoryService } from "@/lib/services/MCCInventoryService"
import { verifyAuthToken } from "@/lib/api-auth"

// GET /api/v1/mcc/farmers/[id] - Get farmer by id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const farmer = await MCCInventoryService.getFarmerById(params.id)
    if (!farmer) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: farmer })
  } catch (error) {
    console.error("Get farmer error:", error)
    return NextResponse.json({ error: "Failed to get farmer" }, { status: 500 })
  }
}

// PUT /api/v1/mcc/farmers/[id] - Update farmer
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const updated = await MCCInventoryService.updateFarmer(params.id, body)
    return NextResponse.json({ success: true, message: "Farmer updated", data: updated })
  } catch (error) {
    console.error("Update farmer error:", error)
    return NextResponse.json({ error: "Failed to update farmer" }, { status: 500 })
  }
}

// DELETE /api/v1/mcc/farmers/[id] - Delete farmer
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await MCCInventoryService.deleteFarmer(params.id)
    return NextResponse.json({ success: true, message: "Farmer deleted" })
  } catch (error) {
    console.error("Delete farmer error:", error)
    return NextResponse.json({ error: "Failed to delete farmer" }, { status: 500 })
  }
}


