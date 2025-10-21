import { NextRequest, NextResponse } from "next/server"
import { MCCInventoryService } from "@/lib/services/MCCInventoryService"
import { verifyAuthToken } from "@/lib/api-auth"

// POST /api/v1/mcc/farmers - Create farmer
export async function POST(req: NextRequest) {
  try {
    console.log("=== Farmer Creation API Called ===")
    
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    console.log("Auth token present:", !!authToken)
    
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    console.log("Verifying auth token...")
    const user = await verifyAuthToken(authToken)
    console.log("User verified:", !!user, "Role:", user?.role)
    
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()
    console.log("Request data:", data)
    
    // Validate required fields
    if (!data.mccId || !data.name || !data.phone || !data.location) {
      return NextResponse.json(
        { error: "Missing required fields: mccId, name, phone, location" },
        { status: 400 }
      )
    }

    console.log("Creating farmer...")
    const farmer = await MCCInventoryService.createFarmer(data)
    console.log("Farmer created successfully:", farmer.id)

    return NextResponse.json({
      success: true,
      message: "Farmer created successfully",
      data: farmer
    })
  } catch (error) {
    console.error("Create farmer error:", error)
    return NextResponse.json(
      { error: "Failed to create farmer", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// GET /api/v1/mcc/farmers - Get MCC farmers
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")

    let farmers;
    if (mccId) {
      farmers = await MCCInventoryService.getMCCFarmers(mccId)
    } else {
      // Get all farmers if no mccId specified
      farmers = await MCCInventoryService.getAllFarmers()
    }

    return NextResponse.json({
      success: true,
      data: farmers
    })
  } catch (error) {
    console.error("Get farmers error:", error)
    return NextResponse.json(
      { error: "Failed to get farmers" },
      { status: 500 }
    )
  }
}


