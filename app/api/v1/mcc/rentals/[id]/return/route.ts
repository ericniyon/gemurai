import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * PATCH /api/v1/mcc/rentals/[id]/return
 * Return equipment rental
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.rentals.manage"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const rentalId = params.id
    const data = await req.json()
    const { condition, notes } = data

    // Get rental
    const rental = await prisma.rentals.findUnique({
      where: { id: rentalId },
      include: {
        asset: true,
        mcc: true,
      },
    })

    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 })
    }

    if (rental.returned) {
      return NextResponse.json(
        { error: "Rental already returned" },
        { status: 400 }
      )
    }

    // Check access permissions
    if (user.role === "MCC_MANAGER" && user.mccId !== rental.mccId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Return rental
    const updatedRental = await prisma.$transaction(async (tx) => {
      // Update rental
      const rentalRecord = await tx.rentals.update({
        where: { id: rentalId },
        data: {
          returned: true,
          returnedAt: new Date(),
        },
      })

      // Update asset status
      await tx.assets.update({
        where: { id: rental.assetId },
        data: {
          status: condition === "damaged" ? "maintenance" : "available",
          currentHolderType: null,
          currentHolderId: null,
          notes: notes || null,
        },
      })

      return rentalRecord
    })

    return NextResponse.json({
      success: true,
      message: "Rental returned successfully",
      data: updatedRental,
    })
  } catch (error) {
    console.error("Return rental error:", error)
    return NextResponse.json(
      { error: "Failed to return rental" },
      { status: 500 }
    )
  }
}

