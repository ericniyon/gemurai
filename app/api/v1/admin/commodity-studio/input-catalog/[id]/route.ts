import { NextRequest, NextResponse } from "next/server"
import { SeasonPlanService } from "@/lib/services/SeasonPlanService"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/database"

/**
 * PUT /api/v1/admin/commodity-studio/input-catalog/[id] - Update input catalog item
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, category, unit, pricingReference, description, isActive } = data

    const item = await prisma.input_catalog.update({
      where: { id: params.id },
      data: {
        name,
        category,
        unit,
        pricingReference: pricingReference ? parseFloat(pricingReference) : undefined,
        description,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Input catalog item updated successfully",
      data: item,
    })
  } catch (error: any) {
    console.error("Update input catalog item error:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Input catalog item not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update input catalog item" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/admin/commodity-studio/input-catalog/[id] - Delete input catalog item
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.input_catalog.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "Input catalog item deleted successfully",
    })
  } catch (error: any) {
    console.error("Delete input catalog item error:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Input catalog item not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Failed to delete input catalog item" },
      { status: 500 }
    )
  }
}
