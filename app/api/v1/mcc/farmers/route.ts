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
    let mccId = searchParams.get("mccId")

    // If user is MCC_MANAGER, get their MCC ID
    if (!mccId && user.role === "MCC_MANAGER") {
      // Try to get mccId from user object first
      if (user.mccId) {
        mccId = user.mccId
      } else {
        // If not in user object, fetch from database
        try {
          const { prisma } = await import("@/lib/prisma")
          const mcc = await prisma.mccs.findFirst({
            where: {
              managerUserId: user.id
            },
            select: {
              id: true
            }
          })
          if (mcc) {
            mccId = mcc.id
          }
        } catch (error) {
          console.error("Error fetching MCC for manager:", error)
        }
      }
    }

    let farmers;
    try {
      if (mccId) {
        farmers = await MCCInventoryService.getMCCFarmers(mccId)
      } else {
        // Get all farmers if no mccId specified (only for admins)
        if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
          return NextResponse.json(
            { error: "MCC ID is required. Please provide mccId parameter or ensure the user is assigned to an MCC." },
            { status: 400 }
          )
        }
        farmers = await MCCInventoryService.getAllFarmers()
      }
    } catch (serviceError: any) {
      console.error("MCCInventoryService error:", serviceError)
      // Fallback: try direct prisma query
      try {
        const { prisma } = await import("@/lib/prisma")
        if (mccId) {
          farmers = await prisma.farmers.findMany({
            where: { mccId },
            orderBy: { name: 'asc' }
          })
        } else {
          farmers = await prisma.farmers.findMany({
            orderBy: { name: 'asc' }
          })
        }
      } catch (fallbackError) {
        console.error("Fallback query error:", fallbackError)
        throw serviceError // Throw original error
      }
    }

    return NextResponse.json({
      success: true,
      data: farmers || []
    })
  } catch (error) {
    console.error("Get farmers error:", error)
    return NextResponse.json(
      { error: "Failed to get farmers", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}


