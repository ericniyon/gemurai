import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * PUT /api/v1/mcc/farmers/[id]/location
 * Update farmer geo-location (Admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { latitude, longitude } = body

    // Validate coordinates
    if (latitude !== null && latitude !== undefined) {
      if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
        return NextResponse.json(
          { error: "Invalid latitude. Must be between -90 and 90." },
          { status: 400 }
        )
      }
    }

    if (longitude !== null && longitude !== undefined) {
      if (typeof longitude !== "number" || longitude < -180 || longitude > 180) {
        return NextResponse.json(
          { error: "Invalid longitude. Must be between -180 and 180." },
          { status: 400 }
        )
      }
    }

    // Check if farmer exists
    const farmer = await prisma.farmers.findUnique({
      where: { id: params.id },
    })

    if (!farmer) {
      return NextResponse.json(
        { error: "Farmer not found" },
        { status: 404 }
      )
    }

    // Update location
    const updated = await prisma.farmers.update({
      where: { id: params.id },
      data: {
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Location updated successfully",
      data: {
        id: updated.id,
        latitude: updated.latitude,
        longitude: updated.longitude,
      },
    })
  } catch (error) {
    console.error("Update farmer location error:", error)
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/mcc/farmers/[id]/location
 * Get farmer geo-location (Read-only, all authenticated users)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      )
    }

    const farmer = await prisma.farmers.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        latitude: true,
        longitude: true,
      },
    })

    if (!farmer) {
      return NextResponse.json(
        { error: "Farmer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: farmer.id,
        latitude: farmer.latitude,
        longitude: farmer.longitude,
      },
    })
  } catch (error) {
    console.error("Get farmer location error:", error)
    return NextResponse.json(
      { error: "Failed to get location" },
      { status: 500 }
    )
  }
}
