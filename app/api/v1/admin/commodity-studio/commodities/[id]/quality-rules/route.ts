import { NextRequest, NextResponse } from "next/server"
import { CommodityStudioService } from "@/lib/services/CommodityStudioService"
import { logQualityAudit } from "@/lib/services/QualityAuditService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * POST /api/v1/admin/commodity-studio/commodities/[id]/quality-rules - Add quality rule
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

    const data = await req.json()
    const {
      qualityFieldId,
      ruleName,
      ruleType,
      thresholdValue,
      thresholdOperator,
      impactOnPricing,
      pricingMultiplier,
      errorMessage,
    } = data

    if (!ruleName || !ruleType) {
      return NextResponse.json(
        { error: "Missing required fields: ruleName, ruleType" },
        { status: 400 }
      )
    }

    const qualityRule = await CommodityStudioService.addQualityRule({
      commodityId,
      qualityFieldId: qualityFieldId || undefined,
      ruleName,
      ruleType,
      thresholdValue: thresholdValue || undefined,
      thresholdOperator: thresholdOperator || undefined,
      impactOnPricing: impactOnPricing || false,
      pricingMultiplier: pricingMultiplier || undefined,
      errorMessage,
    })

    await logQualityAudit({
      entityType: "quality_rule",
      entityId: qualityRule.id,
      commodityId,
      action: "QUALITY_RULE_ADDED",
      newValue: { ruleName, ruleType, thresholdValue, impactOnPricing: impactOnPricing ?? false },
      userId: user?.id,
    })

    return NextResponse.json({
      success: true,
      message: "Quality rule added successfully",
      data: qualityRule,
    })
  } catch (error) {
    console.error("Add quality rule error:", error)
    return NextResponse.json(
      { error: "Failed to add quality rule" },
      { status: 500 }
    )
  }
}
