import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { generateWarehouseCode } from "@/lib/utils/warehouse-utils"

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to create warehouses
    if (!user.permissions?.includes('*') && !user.permissions?.includes('inventory.warehouse.create')) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const code = await generateWarehouseCode()

    return NextResponse.json({
      success: true,
      code
    })
  } catch (error) {
    console.error("Error generating warehouse code:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate warehouse code" },
      { status: 500 }
    )
  }
} 