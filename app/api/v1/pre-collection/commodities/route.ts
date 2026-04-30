import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/pre-collection/commodities
 * List active commodities for pre-collection signal form (any authenticated user: PCA, agent, MCC).
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

    const list = await prisma.commodities.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true, unitOfMeasure: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ success: true, data: list })
  } catch (error: any) {
    console.error("Get pre-collection commodities error:", error)
    return NextResponse.json(
      { error: "Failed to list commodities", message: process.env.NODE_ENV === "development" ? error?.message : undefined },
      { status: 500 }
    )
  }
}
