import { NextRequest, NextResponse } from "next/server"
import { MCCInventoryService } from "@/lib/services/MCCInventoryService"
import { verifyAuthToken } from "@/lib/api-auth"

// GET /api/v1/mcc/setup - Setup MCC with warehouses and products
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()
    const result = await MCCInventoryService.setupMCC(data)

    return NextResponse.json({
      success: true,
      message: "MCC setup completed successfully",
      data: result
    })
  } catch (error) {
    console.error("MCC setup error:", error)
    return NextResponse.json(
      { error: "Failed to setup MCC" },
      { status: 500 }
    )
  }
}




