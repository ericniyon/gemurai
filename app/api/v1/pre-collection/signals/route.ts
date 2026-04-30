import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/database"

// Prisma client types may omit this model after schema add; access at runtime (POST has raw SQL fallback when missing).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const signalsDelegate = (prisma as any).pre_collection_availability_signals as
  | { findMany: (args: unknown) => Promise<unknown[]>; create: (args: unknown) => Promise<unknown> }
  | undefined

/**
 * GET /api/v1/pre-collection/signals
 * List availability signals. For aggregators: filter by status=ACTIVE, commodityId, mccId.
 * Query: status, commodityId, mccId, fromDate, toDate
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
    const status = searchParams.get("status")
    const commodityId = searchParams.get("commodityId")
    const mccId = searchParams.get("mccId")
    const fromDate = searchParams.get("fromDate")
    const toDate = searchParams.get("toDate")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100)

    const where: any = {}
    if (status) where.status = status
    else where.status = "ACTIVE" // default: only active signals
    if (commodityId) where.commodityId = commodityId
    if (mccId) where.mccId = mccId
    where.createdByUserId = user.id
    if (fromDate || toDate) {
      where.readinessAt = {}
      if (fromDate) where.readinessAt.gte = new Date(fromDate)
      if (toDate) where.readinessAt.lte = new Date(toDate)
    }

    if (signalsDelegate?.findMany) {
      const signals = await signalsDelegate.findMany({
        where,
        include: {
          commodity: { select: { id: true, name: true, code: true, unitOfMeasure: true } },
          farmer: { select: { id: true, name: true, farmerCode: true, village: true } },
          mcc: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { readinessAt: "asc" },
        take: limit,
      })
      return NextResponse.json({ success: true, data: signals })
    }

    // Fallback: Prisma client may not have the model (e.g. before regenerate) – use raw SQL like POST
    const statusVal = where.status || "ACTIVE"
    const params: any[] = [user.id, statusVal, limit]
    let paramIdx = 4
    let extraConditions = ""
    if (commodityId) {
      extraConditions += ` AND s."commodityId" = $${paramIdx}`
      params.push(commodityId)
      paramIdx++
    }
    if (mccId) {
      extraConditions += ` AND s."mccId" = $${paramIdx}`
      params.push(mccId)
      paramIdx++
    }
    if (fromDate) {
      extraConditions += ` AND s."readinessAt" >= $${paramIdx}`
      params.push(new Date(fromDate))
      paramIdx++
    }
    if (toDate) {
      extraConditions += ` AND s."readinessAt" <= $${paramIdx}`
      params.push(new Date(toDate))
      paramIdx++
    }
    // status is enum AvailabilitySignalStatus in DB; cast so comparison works
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT s.*, c.id as "c_id", c.name as "c_name", c.code as "c_code", c."unitOfMeasure" as "c_unit"
       FROM "pre_collection_availability_signals" s
       LEFT JOIN commodities c ON c.id = s."commodityId"
       WHERE s."createdByUserId" = $1 AND s.status::text = $2${extraConditions}
       ORDER BY s."readinessAt" ASC
       LIMIT $3`,
      ...params
    )
    const signals = (rows || []).map((row) => ({
      id: row.id,
      commodityId: row.commodityId,
      farmerId: row.farmerId,
      createdByUserId: row.createdByUserId,
      sourceType: row.sourceType,
      status: row.status,
      estimatedQuantity: row.estimatedQuantity,
      unit: row.unit,
      readinessAt: row.readinessAt,
      qualityIndicators: row.qualityIndicators ?? {},
      locationDescription: row.locationDescription,
      gpsLatitude: row.gpsLatitude,
      gpsLongitude: row.gpsLongitude,
      storageCondition: row.storageCondition,
      mccId: row.mccId,
      expiresAt: row.expiresAt,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      commodity: row.c_id
        ? { id: row.c_id, name: row.c_name, code: row.c_code, unitOfMeasure: row.c_unit }
        : null,
      farmer: null,
      mcc: null,
      createdBy: null,
    }))
    return NextResponse.json({ success: true, data: signals })
  } catch (error: any) {
    console.error("Get pre-collection signals error:", error)
    // If table/relation missing (e.g. migration not run), return empty list so UI doesn't break
    const code = error?.code ?? ""
    const msg = error?.message ?? ""
    if (
      code === "P2021" ||
      code === "P2010" ||
      msg.includes("does not exist") ||
      msg.includes("relation") ||
      msg.includes("Unknown table")
    ) {
      return NextResponse.json({ success: true, data: [] })
    }
    return NextResponse.json(
      { error: "Failed to list signals", message: process.env.NODE_ENV === "development" ? error?.message : undefined },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/pre-collection/signals
 * Create a pre-collection availability signal (PCA, farmer self-report, or coop scout).
 * Body: commodityId, farmerId?, sourceType (PCA|FARMER_SELF|COOP_SCOUT), estimatedQuantity, unit, readinessAt,
 *       qualityIndicators?, locationDescription?, gpsLatitude?, gpsLongitude?, storageCondition (cold|ambient), mccId?, expiresAt?, notes?
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

    const body = await req.json()
    const {
      commodityId,
      farmerId,
      sourceType,
      estimatedQuantity,
      unit,
      readinessAt,
      qualityIndicators,
      locationDescription,
      gpsLatitude,
      gpsLongitude,
      storageCondition,
      mccId,
      expiresAt,
      notes,
    } = body

    if (!commodityId || !sourceType || estimatedQuantity == null || !unit || !readinessAt || !storageCondition) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: commodityId, sourceType, estimatedQuantity, unit, readinessAt, storageCondition",
        },
        { status: 400 }
      )
    }

    const validSource = ["PCA", "FARMER_SELF", "COOP_SCOUT"].includes(sourceType)
    if (!validSource) {
      return NextResponse.json({ error: "sourceType must be PCA, FARMER_SELF, or COOP_SCOUT" }, { status: 400 })
    }

    const storage = storageCondition === "cold" ? "cold" : "ambient"
    const estimatedQty = parseFloat(estimatedQuantity)
    const readiness = new Date(readinessAt)
    const qualityJson = JSON.stringify(qualityIndicators || {})
    const now = new Date()

    if (signalsDelegate?.create) {
      const signal = await signalsDelegate.create({
        data: {
          commodityId,
          farmerId: farmerId || undefined,
          createdByUserId: user.id,
          sourceType,
          status: "ACTIVE",
          estimatedQuantity: estimatedQty,
          unit,
          readinessAt: readiness,
          qualityIndicators: qualityIndicators || {},
          locationDescription: locationDescription || undefined,
          gpsLatitude: gpsLatitude != null ? parseFloat(gpsLatitude) : undefined,
          gpsLongitude: gpsLongitude != null ? parseFloat(gpsLongitude) : undefined,
          storageCondition: storage,
          mccId: mccId || undefined,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          notes: notes || undefined,
        },
        include: {
          commodity: { select: { id: true, name: true, code: true } },
          farmer: { select: { id: true, name: true, farmerCode: true } },
          mcc: { select: { id: true, name: true } },
        },
      })
      return NextResponse.json({ success: true, data: signal })
    }

    // Fallback: Prisma delegate missing (e.g. Next.js bundling) – use raw SQL
    const id = randomUUID()
    await prisma.$executeRawUnsafe(
      `INSERT INTO "pre_collection_availability_signals" (
        id, "commodityId", "farmerId", "createdByUserId", "sourceType", status,
        "estimatedQuantity", unit, "readinessAt", "qualityIndicators", "locationDescription",
        "gpsLatitude", "gpsLongitude", "storageCondition", "mccId", "expiresAt", notes,
        "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5::"AvailabilitySignalSource", 'ACTIVE'::"AvailabilitySignalStatus", $6, $7, $8, $9::jsonb, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      id,
      commodityId,
      farmerId || null,
      user.id,
      sourceType,
      estimatedQty,
      unit,
      readiness,
      qualityJson,
      locationDescription || null,
      gpsLatitude != null ? parseFloat(gpsLatitude) : null,
      gpsLongitude != null ? parseFloat(gpsLongitude) : null,
      storage,
      mccId || null,
      expiresAt ? new Date(expiresAt) : null,
      notes || null,
      now,
      now
    )
    const inserted = await prisma.$queryRawUnsafe<any[]>(
      `SELECT s.*, c.id as "c_id", c.name as "c_name", c.code as "c_code"
       FROM "pre_collection_availability_signals" s
       LEFT JOIN commodities c ON c.id = s."commodityId"
       WHERE s.id = $1`,
      id
    )
    const row = Array.isArray(inserted) ? inserted[0] : inserted
    const signal = row
      ? {
          id: row.id,
          commodityId: row.commodityId,
          farmerId: row.farmerId,
          createdByUserId: row.createdByUserId,
          sourceType: row.sourceType,
          status: row.status,
          estimatedQuantity: row.estimatedQuantity,
          unit: row.unit,
          readinessAt: row.readinessAt,
          qualityIndicators: row.qualityIndicators ?? {},
          locationDescription: row.locationDescription,
          gpsLatitude: row.gpsLatitude,
          gpsLongitude: row.gpsLongitude,
          storageCondition: row.storageCondition,
          mccId: row.mccId,
          expiresAt: row.expiresAt,
          notes: row.notes,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          commodity: row.c_id
            ? { id: row.c_id, name: row.c_name, code: row.c_code }
            : null,
          farmer: null,
          mcc: null,
        }
      : null
    if (!signal) {
      return NextResponse.json({ error: "Failed to create signal" }, { status: 500 })
    }
    return NextResponse.json({ success: true, data: signal })
  } catch (error: any) {
    console.error("Create pre-collection signal error:", error)
    const code = error?.code ?? ""
    const msg = error?.message ?? ""
    if (
      code === "P2021" ||
      code === "P2010" ||
      msg.includes("does not exist") ||
      msg.includes("relation") ||
      msg.includes("Unknown table") ||
      msg.includes("reading 'create'") ||
      msg.includes("Cannot read properties of undefined")
    ) {
      return NextResponse.json(
        {
          error: "Pre-collection is not available. Run 'npx prisma generate' and restart the server.",
          message: msg || "Prisma client may be missing the pre_collection_availability_signals model.",
        },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create signal", message: process.env.NODE_ENV === "development" ? error?.message : undefined },
      { status: 500 }
    )
  }
}
