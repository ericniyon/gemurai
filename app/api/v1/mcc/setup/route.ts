import { NextRequest, NextResponse } from "next/server"
import { MCCInventoryService } from "@/lib/services/MCCInventoryService"
import { checkMCCPermission } from "@/lib/mcc-auth"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

// GET /api/v1/mcc/setup - Get MCCs list or single MCC
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const mccId = searchParams.get("mccId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // If fetching single MCC
    if (id || mccId) {
      // Handle "new" route - return empty data for new MCC form
      if ((id || mccId) === "new") {
        return NextResponse.json({
          success: true,
          data: null,
          isNew: true,
        })
      }

      let mcc: any = null
      try {
        // First try to fetch MCC without manager relation
        mcc = await prisma.mccs.findUnique({
          where: { id: id || mccId || "" },
        })
      } catch (error) {
        console.error("Error fetching MCC:", error)
        return NextResponse.json(
          { error: "Failed to fetch MCC", details: error instanceof Error ? error.message : "Unknown error" },
          { status: 500 }
        )
      }

      if (!mcc) {
        return NextResponse.json({ error: "MCC not found" }, { status: 404 })
      }

      // Fetch manager separately if managerUserId exists
      let manager = null
      if (mcc.managerUserId) {
        try {
          manager = await prisma.users.findUnique({
            where: { id: mcc.managerUserId },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          })
        } catch (error) {
          console.warn("Could not fetch manager:", error)
        }
      }

      // Add manager to mcc object
      mcc.manager = manager

      // Get counts separately
      const counts: any = {
        farmers: 0,
        milk_collections: 0,
        sales: 0,
        staff: 0,
      }

      try {
        counts.farmers = await prisma.farmers.count({
          where: { mccId: mcc.id },
        })
      } catch (error) {
        console.warn("Could not count farmers:", error)
      }

      try {
        counts.milk_collections = await prisma.milk_collections.count({
          where: { mccId: mcc.id },
        })
      } catch (error) {
        console.warn("Could not count milk_collections:", error)
      }

      try {
        counts.sales = await prisma.sales.count({
          where: { mccId: mcc.id },
        })
      } catch (error) {
        console.warn("Could not count sales:", error)
      }

      try {
        counts.staff = await prisma.staff.count({
          where: { mccId: mcc.id },
        })
      } catch (error) {
        console.warn("Could not count staff:", error)
      }

      return NextResponse.json({
        success: true,
        data: {
          ...mcc,
          _count: counts,
        },
      })
    }

    // Fetch all MCCs
    const where: any = {}
    
    // If user is MCC_MANAGER, filter by their MCC
    if (user.role === "MCC_MANAGER" && user.mccId) {
      where.id = user.mccId
    }

    // Try to fetch MCCs with error handling
    let mccs: any[] = []
    try {
      mccs = await prisma.mccs.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
      })
    } catch (error) {
      console.error("Error fetching MCCs:", error)
      // If table doesn't exist or query fails, return empty array
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      })
    }

    // Fetch managers separately for each MCC
    const mccsWithManagers = await Promise.all(
      mccs.map(async (mcc) => {
        let manager = null
        if (mcc.managerUserId) {
          try {
            manager = await prisma.users.findUnique({
              where: { id: mcc.managerUserId },
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            })
          } catch (error) {
            console.warn(`Could not fetch manager for MCC ${mcc.id}:`, error)
          }
        }
        return {
          ...mcc,
          manager,
        }
      })
    )

    // Get counts separately to avoid relation issues
    const mccsWithCounts = await Promise.all(
      mccsWithManagers.map(async (mcc) => {
        const counts: any = {
          farmers: 0,
          milk_collections: 0,
          sales: 0,
          staff: 0,
        }

        try {
          counts.farmers = await prisma.farmers.count({
            where: { mccId: mcc.id },
          })
        } catch (error) {
          console.warn("Could not count farmers:", error)
        }

        try {
          counts.milk_collections = await prisma.milk_collections.count({
            where: { mccId: mcc.id },
          })
        } catch (error) {
          console.warn("Could not count milk_collections:", error)
        }

        try {
          counts.sales = await prisma.sales.count({
            where: { mccId: mcc.id },
          })
        } catch (error) {
          console.warn("Could not count sales:", error)
        }

        try {
          counts.staff = await prisma.staff.count({
            where: { mccId: mcc.id },
          })
        } catch (error) {
          console.warn("Could not count staff:", error)
        }

        return {
          ...mcc,
          _count: counts,
        }
      })
    )

    let total = 0
    try {
      total = await prisma.mccs.count({ where })
    } catch (error) {
      console.warn("Could not count total MCCs:", error)
    }

    // Combine managers with counts
    const mccsWithManagersAndCounts = mccsWithManagers.map((mcc, index) => ({
      ...mcc,
      _count: mccsWithCounts[index]?._count || {
        farmers: 0,
        milk_collections: 0,
        sales: 0,
        staff: 0,
      },
    }))

    return NextResponse.json({
      success: true,
      data: mccsWithManagersAndCounts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get MCCs error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { 
        error: "Failed to get MCCs",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// POST /api/v1/mcc/setup - Create new MCC
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
    const mccData = data.mcc || data

    // Create MCC
    const mcc = await prisma.mccs.create({
      data: {
        name: mccData.name,
        code: mccData.code || undefined,
        location: mccData.location,
        region: mccData.region || undefined,
        address: mccData.address || undefined,
        managerUserId: mccData.managerUserId || undefined,
        settings: mccData.settings || {},
        contactInfo: mccData.contactInfo || {},
      },
    })

    return NextResponse.json({
      success: true,
      message: "MCC created successfully",
      data: { mcc }
    })
  } catch (error: any) {
    console.error("MCC creation error:", error)
    
    // Handle unique constraint violations
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "MCC code already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        error: "Failed to create MCC",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// PUT /api/v1/mcc/setup - Update MCC
export async function PUT(req: NextRequest) {
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
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json({ error: "MCC ID is required" }, { status: 400 })
    }

    // Update MCC
    const mcc = await prisma.mccs.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.code !== undefined && { code: updateData.code || null }),
        ...(updateData.location && { location: updateData.location }),
        ...(updateData.region !== undefined && { region: updateData.region || null }),
        ...(updateData.address !== undefined && { address: updateData.address || null }),
        ...(updateData.managerUserId !== undefined && { managerUserId: updateData.managerUserId || null }),
        ...(updateData.settings && { settings: updateData.settings }),
        ...(updateData.contactInfo && { contactInfo: updateData.contactInfo }),
      },
    })

    return NextResponse.json({
      success: true,
      message: "MCC updated successfully",
      data: mcc
    })
  } catch (error: any) {
    console.error("MCC update error:", error)
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "MCC not found" },
        { status: 404 }
      )
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "MCC code already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        error: "Failed to update MCC",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}







