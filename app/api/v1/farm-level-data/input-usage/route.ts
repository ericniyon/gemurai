import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { SeasonPlanService } from "@/lib/services/SeasonPlanService"

/**
 * GET /api/v1/farm-level-data/input-usage - Get all input usage logs
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

    const { prisma } = await import("@/lib/prisma")
    
    const logs = await prisma.input_usage_logs.findMany({
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        seasonPlan: {
          include: {
            commodity: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
        inputCatalog: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
          },
        },
      },
      orderBy: {
        usageDate: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: logs,
    })
  } catch (error: any) {
    console.error("Get input usage logs error:", error)
    return NextResponse.json(
      {
        error: "Failed to get input usage logs",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/farm-level-data/input-usage - Log input usage
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
      seasonPlanId,
      inputCatalogId,
      quantity,
      unit,
      cost,
      notes,
    } = data

    if (!farmerId || !seasonPlanId || !inputCatalogId || !quantity || !unit) {
      return NextResponse.json(
        {
          error: "Missing required fields: farmerId, seasonPlanId, inputCatalogId, quantity, unit",
        },
        { status: 400 }
      )
    }

    const log = await SeasonPlanService.logInputUsage({
      seasonPlanId,
      inputCatalogId,
      farmerId,
      quantity: parseFloat(quantity),
      unit,
      cost: cost ? parseFloat(cost) : undefined,
      notes,
    })

    return NextResponse.json({
      success: true,
      message: "Input usage logged successfully",
      data: log,
    })
  } catch (error: any) {
    console.error("Log input usage error:", error)
    return NextResponse.json(
      {
        error: "Failed to log input usage",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
