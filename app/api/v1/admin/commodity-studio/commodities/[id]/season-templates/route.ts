import { NextRequest, NextResponse } from "next/server"
import { SeasonPlanService } from "@/lib/services/SeasonPlanService"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/admin/commodity-studio/commodities/[id]/season-templates - Get season templates
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate commodity exists
    const commodity = await prisma.commodities.findUnique({
      where: { id },
    })

    if (!commodity) {
      return NextResponse.json(
        {
          error: "Commodity not found",
          details: `Commodity with ID ${id} does not exist`,
        },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(req.url)
    const season = searchParams.get("season")
    const region = searchParams.get("region")

    const templates = await SeasonPlanService.getSeasonTemplates(id, {
      season: season || undefined,
      region: region || undefined,
    })

    return NextResponse.json({
      success: true,
      data: templates,
    })
  } catch (error: any) {
    console.error("Get season templates error:", error)
    return NextResponse.json(
      {
        error: "Failed to get season templates",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/admin/commodity-studio/commodities/[id]/season-templates - Create season template
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commodityId } = await params
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate commodity exists
    const commodity = await prisma.commodities.findUnique({
      where: { id: commodityId },
    })

    if (!commodity) {
      return NextResponse.json(
        {
          error: "Commodity not found",
          details: `Commodity with ID ${commodityId} does not exist`,
        },
        { status: 404 }
      )
    }

    const data = await req.json()
    const {
      season,
      expectedHarvestStartDate,
      expectedHarvestEndDate,
      collectionFrequency,
      region,
      notes,
    } = data

    if (!season || !expectedHarvestStartDate || !expectedHarvestEndDate) {
      return NextResponse.json(
        {
          error: "Missing required fields: season, expectedHarvestStartDate, expectedHarvestEndDate",
        },
        { status: 400 }
      )
    }

    const template = await SeasonPlanService.createSeasonTemplate({
      commodityId,
      season,
      expectedHarvestStartDate: new Date(expectedHarvestStartDate),
      expectedHarvestEndDate: new Date(expectedHarvestEndDate),
      collectionFrequency,
      region,
      notes,
    })

    return NextResponse.json({
      success: true,
      message: "Season template created successfully",
      data: template,
    })
  } catch (error: any) {
    console.error("Create season template error:", error)
    return NextResponse.json(
      {
        error: "Failed to create season template",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
