import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"
import type { GeoEntity } from "@/components/ui/geo-map-viewer"

/**
 * GET /api/v1/geo/entities - Get all entities with geo-location data
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

    const { searchParams } = new URL(req.url)
    const entityType = searchParams.get("type")
    const mccId = searchParams.get("mccId")

    const entities: GeoEntity[] = []

    // Fetch farmers
    if (!entityType || entityType === "farmer") {
      const farmers = await prisma.farmers.findMany({
        where: {
          gpsLatitude: { not: null },
          gpsLongitude: { not: null },
          ...(mccId ? { mccId } : {}),
        },
        select: {
          id: true,
          name: true,
          gpsLatitude: true,
          gpsLongitude: true,
          mccId: true,
          mccs: {
            select: {
              name: true,
            },
          },
        },
      })

      farmers.forEach((farmer) => {
        if (farmer.gpsLatitude && farmer.gpsLongitude) {
          entities.push({
            id: farmer.id,
            name: farmer.name,
            type: "farmer",
            latitude: farmer.gpsLatitude,
            longitude: farmer.gpsLongitude,
            mccId: farmer.mccId,
            mccName: farmer.mccs?.name,
          })
        }
      })
    }

    // Fetch agents
    if (!entityType || entityType === "agent") {
      const agents = await prisma.user.findMany({
        where: {
          gpsLatitude: { not: null },
          gpsLongitude: { not: null },
          ...(mccId ? { mccId } : {}),
        },
        select: {
          id: true,
          name: true,
          gpsLatitude: true,
          gpsLongitude: true,
          mccId: true,
          mcc: {
            select: {
              name: true,
            },
          },
        },
      })

      agents.forEach((agent) => {
        if (agent.gpsLatitude && agent.gpsLongitude) {
          entities.push({
            id: agent.id,
            name: agent.name,
            type: "agent",
            latitude: agent.gpsLatitude,
            longitude: agent.gpsLongitude,
            mccId: agent.mccId || undefined,
            mccName: agent.mcc?.name,
          })
        }
      })
    }

    // Fetch MCCs
    if (!entityType || entityType === "mcc") {
      const mccs = await prisma.mccs.findMany({
        where: {
          gpsLatitude: { not: null },
          gpsLongitude: { not: null },
          ...(mccId ? { id: mccId } : {}),
        },
        select: {
          id: true,
          name: true,
          gpsLatitude: true,
          gpsLongitude: true,
        },
      })

      mccs.forEach((mcc) => {
        if (mcc.gpsLatitude && mcc.gpsLongitude) {
          entities.push({
            id: mcc.id,
            name: mcc.name,
            type: "mcc",
            latitude: mcc.gpsLatitude,
            longitude: mcc.gpsLongitude,
            mccId: mcc.id,
            mccName: mcc.name,
          })
        }
      })
    }

    // Fetch warehouses
    if (!entityType || entityType === "warehouse") {
      const warehouses = await prisma.warehouse.findMany({
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
      })

      warehouses.forEach((warehouse) => {
        if (warehouse.gpsLatitude && warehouse.gpsLongitude) {
          entities.push({
            id: warehouse.id,
            name: warehouse.name,
            type: "warehouse",
            latitude: warehouse.gpsLatitude,
            longitude: warehouse.gpsLongitude,
          })
        }
      })
    }

    // Fetch customers
    if (!entityType || entityType === "customer") {
      const customers = await prisma.mcc_customers.findMany({
        where: {
          gpsLatitude: { not: null },
          gpsLongitude: { not: null },
          ...(mccId ? { mccId } : {}),
        },
        select: {
          id: true,
          name: true,
          gpsLatitude: true,
          gpsLongitude: true,
          mccId: true,
          mccs: {
            select: {
              name: true,
            },
          },
        },
      })

      customers.forEach((customer) => {
        if (customer.gpsLatitude && customer.gpsLongitude) {
          entities.push({
            id: customer.id,
            name: customer.name,
            type: "customer",
            latitude: customer.gpsLatitude,
            longitude: customer.gpsLongitude,
            mccId: customer.mccId,
            mccName: customer.mccs?.name,
          })
        }
      })
    }

    // Fetch suppliers
    if (!entityType || entityType === "supplier") {
      const suppliers = await prisma.suppliers.findMany({
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
      })

      suppliers.forEach((supplier) => {
        if (supplier.gpsLatitude && supplier.gpsLongitude) {
          entities.push({
            id: supplier.id,
            name: supplier.name,
            type: "supplier",
            latitude: supplier.gpsLatitude,
            longitude: supplier.gpsLongitude,
          })
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: entities,
    })
  } catch (error: any) {
    console.error("Error fetching geo entities:", error)
    // Return empty array if tables don't exist yet (migration not run)
    if (error.message?.includes("does not exist") || error.code === "P2021") {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }
    return NextResponse.json(
      { error: "Failed to fetch geo entities", details: error.message },
      { status: 500 }
    )
  }
}
