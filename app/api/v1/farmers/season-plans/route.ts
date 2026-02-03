import { NextRequest, NextResponse } from "next/server"
import { SeasonPlanService } from "@/lib/services/SeasonPlanService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * POST /api/v1/farmers/season-plans - Create season plan
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
    const {
      farmerId,
      commodityId,
      season,
      plotHerdReference,
      expectedHarvestVolume,
      expectedHarvestStartDate,
      expectedHarvestEndDate,
      collectionFrequency,
      region,
      notes,
    } = data

    if (
      !farmerId ||
      !commodityId ||
      !season ||
      !expectedHarvestVolume ||
      !expectedHarvestStartDate ||
      !expectedHarvestEndDate
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: farmerId, commodityId, season, expectedHarvestVolume, expectedHarvestStartDate, expectedHarvestEndDate",
        },
        { status: 400 }
      )
    }

    const seasonPlan = await SeasonPlanService.createSeasonPlan({
      farmerId,
      commodityId,
      season,
      plotHerdReference,
      expectedHarvestVolume: parseFloat(expectedHarvestVolume),
      expectedHarvestStartDate: new Date(expectedHarvestStartDate),
      expectedHarvestEndDate: new Date(expectedHarvestEndDate),
      collectionFrequency,
      region,
      notes,
    })

    return NextResponse.json({
      success: true,
      message: "Season plan created successfully",
      data: seasonPlan,
    })
  } catch (error) {
    console.error("Create season plan error:", error)
    return NextResponse.json(
      { error: "Failed to create season plan" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/farmers/season-plans - Get season plans
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
    const farmerId = searchParams.get("farmerId")
    const commodityId = searchParams.get("commodityId")
    const season = searchParams.get("season")
    const status = searchParams.get("status")
    const region = searchParams.get("region")

    const mccId = user.mccId ?? user.staff?.mccId

    let plans
    if (farmerId) {
      plans = await SeasonPlanService.getFarmerSeasonPlans(farmerId, {
        commodityId: commodityId || undefined,
        season: season || undefined,
        status: status || undefined,
        region: region || undefined,
      })
    } else if (mccId) {
      plans = await SeasonPlanService.getAllSeasonPlansForMcc(mccId, {
        commodityId: commodityId || undefined,
        season: season || undefined,
        status: status || undefined,
        region: region || undefined,
      })
    } else {
      return NextResponse.json(
        { error: "farmerId is required when user has no MCC scope" },
        { status: 400 }
      )
    }

    // Deduplicate by id (defensive - Prisma shouldn't return duplicates)
    const uniquePlans = [...new Map(plans.map((p) => [p.id, p])).values()]

    return NextResponse.json({
      success: true,
      data: uniquePlans,
    })
  } catch (error) {
    console.error("Get season plans error:", error)
    return NextResponse.json(
      { error: "Failed to get season plans" },
      { status: 500 }
    )
  }
}
