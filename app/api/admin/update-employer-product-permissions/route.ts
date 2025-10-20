import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    // Verify admin access
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = await verifyAuthToken(token)

    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Update all users with EMPLOYER role to have product management permissions
    const updatedUsers = await prisma.user.updateMany({
      where: {
        role: "EMPLOYER"
      },
      data: {
        permissions: {
          push: [
            "products.create",
            "products.edit",
            "products.delete",
            "products.view"
          ]
        }
      }
    })

    console.log("Updated employer permissions:", {
      count: updatedUsers.count,
      permissions: [
        "products.create",
        "products.edit",
        "products.delete",
        "products.view"
      ]
    })

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedUsers.count} employers with product management permissions`,
      updatedCount: updatedUsers.count
    })
  } catch (error) {
    console.error("Error updating employer permissions:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update permissions"
      },
      { status: 500 }
    )
  }
} 