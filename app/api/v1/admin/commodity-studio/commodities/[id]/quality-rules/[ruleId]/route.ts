import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"
import { logQualityAudit } from "@/lib/services/QualityAuditService"

/**
 * GET /api/v1/admin/commodity-studio/commodities/[id]/quality-rules/[ruleId] - Get quality rule
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  try {
    const { ruleId } = await params
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const qualityRule = await prisma.quality_rules.findUnique({
      where: { id: ruleId },
      include: { qualityField: true },
    })

    if (!qualityRule) {
      return NextResponse.json({ error: "Quality rule not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: qualityRule,
    })
  } catch (error) {
    console.error("Get quality rule error:", error)
    return NextResponse.json(
      { error: "Failed to get quality rule" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/v1/admin/commodity-studio/commodities/[id]/quality-rules/[ruleId] - Update quality rule
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  try {
    const { id: commodityId, ruleId } = await params
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

    // Check if rule exists
    const existingRule = await prisma.quality_rules.findUnique({
      where: { id: ruleId },
    })

    if (!existingRule) {
      return NextResponse.json({ error: "Quality rule not found" }, { status: 404 })
    }

    // Update the rule
    const updatedRule = await prisma.quality_rules.update({
      where: { id: ruleId },
      data: {
        ...(qualityFieldId !== undefined && { qualityFieldId }),
        ...(ruleName !== undefined && { ruleName }),
        ...(ruleType !== undefined && { ruleType }),
        ...(thresholdValue !== undefined && { thresholdValue }),
        ...(thresholdOperator !== undefined && { thresholdOperator }),
        ...(impactOnPricing !== undefined && { impactOnPricing }),
        ...(pricingMultiplier !== undefined && { pricingMultiplier }),
        ...(errorMessage !== undefined && { errorMessage }),
        updatedAt: new Date(),
      },
      include: { qualityField: true },
    })

    await logQualityAudit({
      entityType: "quality_rule",
      entityId: ruleId,
      commodityId,
      action: "QUALITY_RULE_UPDATED",
      previousValue: existingRule,
      newValue: updatedRule,
      userId: user?.id,
    })

    return NextResponse.json({
      success: true,
      message: "Quality rule updated successfully",
      data: updatedRule,
    })
  } catch (error) {
    console.error("Update quality rule error:", error)
    return NextResponse.json(
      { error: "Failed to update quality rule" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/admin/commodity-studio/commodities/[id]/quality-rules/[ruleId] - Delete quality rule
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  try {
    const { id: commodityId, ruleId } = await params
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if rule exists
    const existingRule = await prisma.quality_rules.findUnique({
      where: { id: ruleId },
    })

    if (!existingRule) {
      return NextResponse.json({ error: "Quality rule not found" }, { status: 404 })
    }

    // Delete the rule
    await prisma.quality_rules.delete({
      where: { id: ruleId },
    })

    await logQualityAudit({
      entityType: "quality_rule",
      entityId: ruleId,
      commodityId,
      action: "QUALITY_RULE_DELETED",
      previousValue: existingRule,
      userId: user?.id,
    })

    return NextResponse.json({
      success: true,
      message: "Quality rule deleted successfully",
    })
  } catch (error) {
    console.error("Delete quality rule error:", error)
    return NextResponse.json(
      { error: "Failed to delete quality rule" },
      { status: 500 }
    )
  }
}
