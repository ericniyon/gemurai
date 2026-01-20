import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"
import {
  calculateFarmerToMCCDistance,
  groupByDistanceBand,
  calculateAverageDistance,
} from "@/lib/utils/geo-calculations"

/**
 * GET /api/v1/geo/stats - Get geo-intelligence statistics
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

    // Get all entities with geo-location data
    const [farmers, agents, mccs, warehouses, customers, suppliers] = await Promise.all([
      prisma.farmers.findMany({
        where: {
          gpsLatitude: { not: null },
          gpsLongitude: { not: null },
        },
        select: {
          id: true,
          name: true,
          gpsLatitude: true,
          gpsLongitude: true,
          mccId: true,
        },
      }),
      prisma.user.findMany({
        where: {
          gpsLatitude: { not: null },
          gpsLongitude: { not: null },
          // Filter for agents/field agents
          roleAssignments: {
            some: {
              role: {
                name: {
                  in: ["FIELD_AGENT", "AGENT"],
                },
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          gpsLatitude: true,
          gpsLongitude: true,
          mccId: true,
        },
      }),
      prisma.mccs.findMany({
        where: {
          gpsLatitude: { not: null },
          gpsLongitude: { not: null },
        },
        select: {
          id: true,
          name: true,
          gpsLatitude: true,
          gpsLongitude: true,
        },
      }),
      prisma.warehouse.findMany({
        where: {
          gpsLatitude: { not: null },
          gpsLongitude: { not: null },
        },
        select: {
          id: true,
          name: true,
          gpsLatitude: true,
          gpsLongitude: true,
        },
      }),
      prisma.mcc_customers.findMany({
        where: {
          gpsLatitude: { not: null },
          gpsLongitude: { not: null },
        },
        select: {
          id: true,
          name: true,
          gpsLatitude: true,
          gpsLongitude: true,
          mccId: true,
        },
      }),
      prisma.suppliers.findMany({
        where: {
          gpsLatitude: { not: null },
          gpsLongitude: { not: null },
        },
        select: {
          id: true,
          name: true,
          gpsLatitude: true,
          gpsLongitude: true,
        },
      }),
    ])

    // Calculate distance bands for farmers to their MCCs
    const farmerDistances: Array<{ farmer: any; distance: number }> = []
    const mccMap = new Map(mccs.map((mcc) => [mcc.id, mcc]))

    farmers.forEach((farmer) => {
      if (farmer.mccId && farmer.gpsLatitude && farmer.gpsLongitude) {
        const mcc = mccMap.get(farmer.mccId)
        if (mcc && mcc.gpsLatitude && mcc.gpsLongitude) {
          const distance = calculateFarmerToMCCDistance(
            farmer.gpsLatitude,
            farmer.gpsLongitude,
            mcc.gpsLatitude,
            mcc.gpsLongitude
          )
          if (distance != null) {
            farmerDistances.push({ farmer, distance })
          }
        }
      }
    })

    // Calculate average distance
    const averageDistance =
      farmerDistances.length > 0
        ? farmerDistances.reduce((sum, item) => sum + item.distance, 0) /
          farmerDistances.length
        : null

    // Group by distance bands
    const distanceBands = {
      "0-2km": 0,
      "2-5km": 0,
      "5-10km": 0,
      ">10km": 0,
    }

    farmerDistances.forEach(({ distance }) => {
      if (distance <= 2) distanceBands["0-2km"]++
      else if (distance <= 5) distanceBands["2-5km"]++
      else if (distance <= 10) distanceBands["5-10km"]++
      else distanceBands[">10km"]++
    })

    const stats = {
      farmersWithGeo: farmers.length,
      agentsWithGeo: agents.length,
      mccsWithGeo: mccs.length,
      warehousesWithGeo: warehouses.length,
      customersWithGeo: customers.length,
      suppliersWithGeo: suppliers.length,
      averageFarmerToMCCDistance: averageDistance,
      distanceBands,
      totalEntitiesWithGeo:
        farmers.length +
        agents.length +
        mccs.length +
        warehouses.length +
        customers.length +
        suppliers.length,
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error: any) {
    console.error("Error fetching geo stats:", error)
    // Return empty stats if tables don't exist yet (migration not run)
    if (error.message?.includes("does not exist") || error.code === "P2021") {
      return NextResponse.json({
        success: true,
        data: {
          farmersWithGeo: 0,
          agentsWithGeo: 0,
          mccsWithGeo: 0,
          warehousesWithGeo: 0,
          customersWithGeo: 0,
          suppliersWithGeo: 0,
          averageFarmerToMCCDistance: null,
          distanceBands: {
            "0-2km": 0,
            "2-5km": 0,
            "5-10km": 0,
            ">10km": 0,
          },
          totalEntitiesWithGeo: 0,
        },
      })
    }
    return NextResponse.json(
      { error: "Failed to fetch geo statistics", details: error.message },
      { status: 500 }
    )
  }
}
