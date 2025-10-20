import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { generateLocationCode } from "@/lib/utils/location-utils"

export async function POST(req: NextRequest) {
  console.log("🔍 Location code generation API called")
  
  try {
    const user = await getAuthUser(req)
    console.log("👤 Auth user:", user ? "Found" : "Not found")
    
    if (!user) {
      console.log("❌ Unauthorized - no user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to create locations
    console.log("🔐 User permissions:", user.permissions)
    if (!user.permissions?.includes('*') && !user.permissions?.includes('inventory.location.create')) {
      console.log("❌ Insufficient permissions")
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await req.json()
    const { warehouseId } = body
    console.log("🏭 Warehouse ID:", warehouseId)

    if (!warehouseId) {
      console.log("❌ Missing warehouse ID")
      return NextResponse.json(
        { error: "Warehouse ID is required" },
        { status: 400 }
      )
    }

    console.log("🔄 Generating location code...")
    const code = await generateLocationCode(warehouseId)
    console.log("✅ Generated code:", code)

    return NextResponse.json({
      success: true,
      code
    })
  } catch (error) {
    console.error("❌ Error generating location code:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate location code" },
      { status: 500 }
    )
  }
} 