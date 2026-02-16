import { NextRequest, NextResponse } from "next/server"
import { MilkCollectionService } from "@/lib/services/MilkCollectionService"
import { checkMCCPermission } from "@/lib/mcc-auth"
import { prisma } from "@/lib/prisma"

// POST /api/v1/mcc/collections - Record milk collection with quality tests
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.collections.create"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    
    // Validate required fields
    if (!data.farmerId || !data.totalLiters) {
      return NextResponse.json(
        { error: "Missing required fields: farmerId, totalLiters" },
        { status: 400 }
      )
    }

    // Validate farmerId format
    if (typeof data.farmerId !== "string" || data.farmerId.trim() === "") {
      return NextResponse.json(
        { error: "Invalid farmerId: must be a non-empty string" },
        { status: 400 }
      )
    }

    // Try to verify farmer exists before processing
    try {
      const farmerExists = await prisma.farmers.findFirst({
        where: {
          OR: [
            { id: data.farmerId },
            { farmerCode: data.farmerId },
            { phone: data.farmerId },
          ]
        },
        select: { id: true, name: true, farmerCode: true },
      })

      if (!farmerExists) {
        return NextResponse.json(
          { 
            error: "Farmer not found",
            details: `No farmer found with ID, code, or phone: ${data.farmerId}. Please register the farmer first.`
          },
          { status: 404 }
        )
      }

      // Use the actual farmer ID for the collection
      data.farmerId = farmerExists.id
    } catch (farmerCheckError) {
      console.error("Error checking farmer:", farmerCheckError)
      // Continue anyway - let the service handle it
    }

    // agentId = who brought the collection to the center (Umucunda/agent) or null if farmer delivered.
    // Only default to current user when agentId is not sent at all (backward compatibility).
    if (data.agentId === undefined && user.id) {
      data.agentId = user.id
    }
    // When agentId is provided, farmer must be identified (already required above).
    if (data.agentId && !data.farmerId) {
      return NextResponse.json(
        { error: "When collection is brought by an agent, farmer (farmer code) is required." },
        { status: 400 }
      )
    }

    // Set collection date if not provided
    if (!data.collectionDate) {
      data.collectionDate = new Date()
    } else {
      data.collectionDate = new Date(data.collectionDate)
    }

    try {
      const result = await MilkCollectionService.recordCollection(data)
      
      return NextResponse.json({
        success: true,
        message: result.qualityResult.rejected
          ? "Milk collection recorded but rejected due to quality issues"
          : "Milk collection recorded successfully",
        data: {
          collection: result.collection,
          qualityResult: result.qualityResult,
          payment: result.payment,
        },
      })
    } catch (serviceError: any) {
      console.error("MilkCollectionService error:", serviceError)
      
      // Handle duplicate sample tag
      if (serviceError.message?.includes("Sample tag")) {
        return NextResponse.json(
          { error: serviceError.message },
          { status: 409 }
        )
      }
      
      throw serviceError
    }
  } catch (error) {
    console.error("Milk collection error:", error)
    return NextResponse.json(
      { 
        error: "Failed to record milk collection",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}


// GET /api/v1/mcc/collections - Get milk collections
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.collections.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const farmerId = searchParams.get("farmerId")
    const mccId = searchParams.get("mccId")
    const qualityStatus = searchParams.get("qualityStatus")
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // If user is MCC_MANAGER, filter by their MCC
    let targetMccId = mccId
    if (!targetMccId && user.role === "MCC_MANAGER" && user.mccId) {
      targetMccId = user.mccId
    }

    // If user is FARMER, only show their own collections
    if (user.role === "FARMER" && user.id) {
      try {
        const farmer = await prisma.farmers.findFirst({
          where: { phone: user.phone || "" },
          select: { id: true },
        })
        if (farmer) {
          let collections: any[] = []
          try {
            collections = await prisma.milk_collections.findMany({
              where: { farmerId: farmer.id },
              orderBy: { collectionDate: "desc" },
              skip,
              take: limit,
            })
          } catch (error) {
            console.error("Error fetching farmer collections:", error)
            collections = []
          }

          // Fetch related data separately
          const collectionsWithRelations = await Promise.all(
            collections.map(async (collection) => {
              const result: any = { ...collection }

              // Fetch farmer
              try {
                result.farmers = await prisma.farmers.findUnique({
                  where: { id: collection.farmerId },
                })
              } catch (error) {
                result.farmers = null
              }

              // Fetch agent
              if (collection.agentId) {
                try {
                  result.agent = await prisma.users.findUnique({
                    where: { id: collection.agentId },
                    select: {
                      id: true,
                      name: true,
                    },
                  })
                } catch (error) {
                  result.agent = null
                }
              }

              // Fetch MCC
              if (collection.mccId) {
                try {
                  result.mccs = await prisma.mccs.findUnique({
                    where: { id: collection.mccId },
                    select: {
                      id: true,
                      name: true,
                      code: true,
                    },
                  })
                } catch (error) {
                  result.mccs = null
                }
              }

              return result
            })
          )

          let total = 0
          try {
            total = await prisma.milk_collections.count({
              where: { farmerId: farmer.id },
            })
          } catch (error) {
            console.warn("Could not count farmer collections:", error)
          }

          return NextResponse.json({
            success: true,
            data: collectionsWithRelations,
            meta: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
            },
          })
        }
      } catch (error) {
        console.error("Error fetching farmer:", error)
        // Continue to regular flow if farmer lookup fails
      }
    }

    // Build where clause
    const where: any = {}
    if (farmerId) where.farmerId = farmerId
    if (targetMccId) where.mccId = targetMccId
    if (qualityStatus) where.qualityStatus = qualityStatus

    // Try to fetch collections with error handling
    let collections: any[] = []
    try {
      collections = await prisma.milk_collections.findMany({
        where,
        orderBy: { collectionDate: "desc" },
        skip,
        take: limit,
      })
    } catch (error) {
      console.error("Error fetching collections:", error)
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

    // Fetch related data separately to avoid relation issues
    const collectionsWithRelations = await Promise.all(
      collections.map(async (collection) => {
        const result: any = { ...collection }

        // Fetch farmer
        if (collection.farmerId) {
          try {
            const farmer = await prisma.farmers.findUnique({
              where: { id: collection.farmerId },
              select: {
                id: true,
                name: true,
                farmerCode: true,
                phone: true,
              },
            })
            result.farmers = farmer
          } catch (error) {
            console.warn(`Could not fetch farmer for collection ${collection.id}:`, error)
            result.farmers = null
          }
        }

        // Fetch agent
        if (collection.agentId) {
          try {
            const agent = await prisma.users.findUnique({
              where: { id: collection.agentId },
              select: {
                id: true,
                name: true,
                email: true,
              },
            })
            result.agent = agent
          } catch (error) {
            console.warn(`Could not fetch agent for collection ${collection.id}:`, error)
            result.agent = null
          }
        }

        // Fetch MCC
        if (collection.mccId) {
          try {
            const mcc = await prisma.mccs.findUnique({
              where: { id: collection.mccId },
              select: {
                id: true,
                name: true,
                code: true,
              },
            })
            result.mccs = mcc
          } catch (error) {
            console.warn(`Could not fetch MCC for collection ${collection.id}:`, error)
            result.mccs = null
          }
        }

        return result
      })
    )

    // Get total count
    let total = 0
    try {
      total = await prisma.milk_collections.count({ where })
    } catch (error) {
      console.warn("Could not count collections:", error)
    }

    return NextResponse.json({
      success: true,
      data: collectionsWithRelations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get collections error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { 
        error: "Failed to get collections",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}


