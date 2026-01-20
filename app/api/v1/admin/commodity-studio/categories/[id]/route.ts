import { NextRequest, NextResponse } from "next/server"
import { CommodityStudioService } from "@/lib/services/CommodityStudioService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * GET /api/v1/admin/commodity-studio/categories/[id] - Get category by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params
    const category = await CommodityStudioService.getCategoryById(id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error("Get category error:", error)
    return NextResponse.json(
      { error: "Failed to get category" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/v1/admin/commodity-studio/categories/[id] - Update commodity category
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params
    const data = await req.json()
    const { name, description, defaultStorageType, status } = data

    const category = await CommodityStudioService.updateCategory(id, {
      name,
      description,
      defaultStorageType,
      status,
    })

    return NextResponse.json({
      success: true,
      message: "Commodity category updated successfully",
      data: category,
    })
  } catch (error: any) {
    console.error("Update commodity category error:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Category name already exists" },
        { status: 409 }
      )
    }
    if (error.message === "Category not found") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || "Failed to update commodity category" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/admin/commodity-studio/categories/[id] - Delete commodity category
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params
    await CommodityStudioService.deleteCategory(id)

    return NextResponse.json({
      success: true,
      message: "Commodity category deleted successfully",
    })
  } catch (error: any) {
    console.error("Delete commodity category error:", error)
    if (error.message === "Category not found") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }
    if (error.message?.includes("Cannot delete category")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to delete commodity category" },
      { status: 500 }
    )
  }
}
