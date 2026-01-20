import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * PUT /api/v1/rentals/[id]/contract - Update rental contract
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const {
      contractTerms,
      contractStart,
      contractEnd,
      autoRenew,
      renewalPeriod,
      contractStatus,
      signedBy,
    } = data

    const updateData: any = {}

    if (contractTerms !== undefined) updateData.contractTerms = contractTerms
    if (contractStart !== undefined) updateData.contractStart = contractStart ? new Date(contractStart) : null
    if (contractEnd !== undefined) updateData.contractEnd = contractEnd ? new Date(contractEnd) : null
    if (autoRenew !== undefined) updateData.autoRenew = autoRenew
    if (renewalPeriod !== undefined) updateData.renewalPeriod = renewalPeriod
    if (contractStatus !== undefined) updateData.contractStatus = contractStatus
    if (signedBy !== undefined) {
      updateData.signedBy = signedBy
      updateData.signedAt = new Date()
    }

    const rental = await prisma.rentals.update({
      where: { id: params.id },
      data: updateData,
      include: {
        asset: true,
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        mcc: {
          select: {
            id: true,
            name: true,
          },
        },
        signedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Rental contract updated successfully",
      data: rental,
    })
  } catch (error) {
    console.error("Update rental contract error:", error)
    return NextResponse.json(
      { error: "Failed to update rental contract" },
      { status: 500 }
    )
  }
}
