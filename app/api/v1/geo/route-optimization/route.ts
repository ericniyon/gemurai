import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"
import {
  optimizeRouteNearestNeighbor,
  groupFarmersByProximity,
  calculateAgentCoverage,
  assignFarmersToAgents,
  type RoutePoint,
} from "@/lib/utils/geo-route-optimization"

/**
 * POST /api/v1/geo/route-optimization - Optimize collection route
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { mccId, agentId, farmerIds, optimizationType } = data

    if (!mccId) {
      return NextResponse.json({ error: "mccId is required" }, { status: 400 })
    }

    // Get MCC location
    const mcc = await prisma.mccs.findUnique({
      where: { id: mccId },
      select: {
        id: true,
        name: true,
        gpsLatitude: true,
        gpsLongitude: true,
      },
    })

    if (!mcc || !mcc.gpsLatitude || !mcc.gpsLongitude) {
      return NextResponse.json(
        { error: "MCC location not available" },
        { status: 400 }
      )
    }

    const mccLocation = {
      latitude: mcc.gpsLatitude,
      longitude: mcc.gpsLongitude,
    }

    // Get farmers
    const farmersWhere: any = { mccId }
    if (farmerIds && farmerIds.length > 0) {
      farmersWhere.id = { in: farmerIds }
    }

    const farmers = await prisma.farmers.findMany({
      where: {
        ...farmersWhere,
        gpsLatitude: { not: null },
        gpsLongitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        gpsLatitude: true,
        gpsLongitude: true,
      },
    })

    const farmerPoints: RoutePoint[] = farmers
      .filter((f) => f.gpsLatitude && f.gpsLongitude)
      .map((f) => ({
        id: f.id,
        name: f.name,
        type: "farmer" as const,
        latitude: f.gpsLatitude!,
        longitude: f.gpsLongitude!,
      }))

    if (optimizationType === "route") {
      // Route optimization
      const optimizedRoute = optimizeRouteNearestNeighbor(mccLocation, farmerPoints)

      return NextResponse.json({
        success: true,
        data: {
          route: optimizedRoute,
          mcc: {
            id: mcc.id,
            name: mcc.name,
            location: mccLocation,
          },
        },
      })
    } else if (optimizationType === "proximity") {
      // Group by proximity
      const groups = groupFarmersByProximity(mccLocation, farmerPoints)

      return NextResponse.json({
        success: true,
        data: {
          nearby: groups.nearby,
          far: groups.far,
          mcc: {
            id: mcc.id,
            name: mcc.name,
            location: mccLocation,
          },
        },
      })
    } else if (optimizationType === "coverage" && agentId) {
      // Agent coverage
      const agent = await prisma.user.findUnique({
        where: { id: agentId },
        select: {
          id: true,
          name: true,
          gpsLatitude: true,
          gpsLongitude: true,
        },
      })

      if (!agent || !agent.gpsLatitude || !agent.gpsLongitude) {
        return NextResponse.json(
          { error: "Agent location not available" },
          { status: 400 }
        )
      }

      const coverage = calculateAgentCoverage(
        {
          latitude: agent.gpsLatitude,
          longitude: agent.gpsLongitude,
        },
        farmerPoints
      )

      return NextResponse.json({
        success: true,
        data: {
          coverage,
          agent: {
            id: agent.id,
            name: agent.name,
            location: {
              latitude: agent.gpsLatitude,
              longitude: agent.gpsLongitude,
            },
          },
        },
      })
    } else if (optimizationType === "assignment") {
      // Assign farmers to agents
      const agents = await prisma.user.findMany({
        where: {
          mccId,
          gpsLatitude: { not: null },
          gpsLongitude: { not: null },
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
        },
      })

      const agentPoints: Array<RoutePoint & { capacity?: number }> = agents
        .filter((a) => a.gpsLatitude && a.gpsLongitude)
        .map((a) => ({
          id: a.id,
          name: a.name,
          type: "mcc" as const,
          latitude: a.gpsLatitude!,
          longitude: a.gpsLongitude!,
          capacity: 20, // Default capacity
        }))

      const assignments = assignFarmersToAgents(agentPoints, farmerPoints)

      return NextResponse.json({
        success: true,
        data: {
          assignments: Array.from(assignments.entries()).map(([agentId, farmers]) => {
            const agent = agentPoints.find((a) => a.id === agentId)
            return {
              agentId,
              agentName: agent?.name,
              farmers,
              count: farmers.length,
            }
          }),
        },
      })
    }

    return NextResponse.json(
      { error: "Invalid optimization type" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Route optimization error:", error)
    return NextResponse.json(
      { error: "Failed to optimize route" },
      { status: 500 }
    )
  }
}
