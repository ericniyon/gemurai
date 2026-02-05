import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

function getToken(req: NextRequest): string | null {
  const fromHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")?.trim() || ""
  if (fromHeader && fromHeader !== "null" && fromHeader !== "undefined") return fromHeader
  return req.cookies.get("Gemurai_token")?.value?.trim() ?? null
}

/**
 * GET /api/v1/mcc/global-warehouses?mccId=...
 * Returns global Warehouse records assigned to this MCC (each MCC has its own global warehouses).
 * Only warehouses where mccId = current MCC or mccId is null (platform-wide) are returned.
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = getToken(req)
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }
    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")
    if (!mccId) {
      return NextResponse.json({ error: "mccId is required" }, { status: 400 })
    }

    const warehouses = await prisma.warehouse.findMany({
      where: {
        isActive: true,
        OR: [
          { mccId: mccId },
          { mccId: null },
        ],
      },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ success: true, data: warehouses })
  } catch (error) {
    console.error("Get global warehouses error:", error)
    return NextResponse.json(
      { error: "Failed to get warehouses", details: error instanceof Error ? error.message : undefined },
      { status: 500 }
    )
  }
}
