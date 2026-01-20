import { NextRequest, NextResponse } from "next/server"
import { IDVerificationService } from "@/lib/services/IDVerificationService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * POST /api/v1/admin/id-verification - Verify ID
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()
    const { entityType, entityId, nationalId, agentId, verificationMethod, verificationNotes } =
      data

    if (!entityType || !entityId || !nationalId) {
      return NextResponse.json(
        { error: "Missing required fields: entityType, entityId, nationalId" },
        { status: 400 }
      )
    }

    const verification = await IDVerificationService.verifyID(
      {
        entityType,
        entityId,
        nationalId,
        agentId,
        verificationMethod,
        verificationNotes,
      },
      user.id
    )

    return NextResponse.json({
      success: true,
      message: "ID verified successfully",
      data: verification,
    })
  } catch (error) {
    console.error("Verify ID error:", error)
    return NextResponse.json(
      { error: "Failed to verify ID" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/admin/id-verification - Get verification status
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
    const entityType = searchParams.get("entityType")
    const entityId = searchParams.get("entityId")

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "Missing required parameters: entityType, entityId" },
        { status: 400 }
      )
    }

    const verification = await IDVerificationService.getVerificationStatus(entityType, entityId)

    return NextResponse.json({
      success: true,
      data: verification,
    })
  } catch (error) {
    console.error("Get verification status error:", error)
    return NextResponse.json(
      { error: "Failed to get verification status" },
      { status: 500 }
    )
  }
}
