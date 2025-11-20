import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * PATCH /api/v1/mcc/procurements/[id]/receive
 * Receive procurement and update stock
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.procurements.manage"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const procurementId = params.id
    const data = await req.json()
    const { warehouseId, locationId, expiryDates } = data

    // Get procurement
    const procurement = await prisma.procurements.findUnique({
      where: { id: procurementId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        mcc: true,
      },
    })

    if (!procurement) {
      return NextResponse.json({ error: "Procurement not found" }, { status: 404 })
    }

    if (procurement.status === "received") {
      return NextResponse.json(
        { error: "Procurement already received" },
        { status: 400 }
      )
    }

    // Check access permissions
    if (user.role === "MCC_MANAGER" && user.mccId !== procurement.mccId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Receive procurement and update stock
    const updatedProcurement = await prisma.$transaction(async (tx) => {
      // Update procurement status
      const procurementRecord = await tx.procurements.update({
        where: { id: procurementId },
        data: {
          status: "received",
          procuredAt: new Date(),
        },
      })

      // Update stock for each item
      for (const item of procurement.items) {
        // Update product stock
        await tx.products.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.qty,
            },
          },
        })

        // Create lot number if expiry date provided (for medicines)
        if (expiryDates && expiryDates[item.productId]) {
          await tx.lotNumbers.create({
            data: {
              productId: item.productId,
              lotNumber: `LOT-${Date.now()}-${item.productId.substring(0, 6)}`,
              expiryDate: new Date(expiryDates[item.productId]),
              quantity: item.qty,
              warehouseId: warehouseId || null,
              locationId: locationId || null,
            },
          })
        }
      }

      return procurementRecord
    })

    return NextResponse.json({
      success: true,
      message: "Procurement received and stock updated successfully",
      data: updatedProcurement,
    })
  } catch (error) {
    console.error("Receive procurement error:", error)
    return NextResponse.json(
      { error: "Failed to receive procurement" },
      { status: 500 }
    )
  }
}

