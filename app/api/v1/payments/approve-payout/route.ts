import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/v1/payments/approve-payout - Approve payout for farmers
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

    const data = await req.json()
    const { batchId, date, collectionIds } = data

    const where: any = {
      status: { in: ["APPROVED", "PENDING"] },
    }

    if (collectionIds && Array.isArray(collectionIds)) {
      where.id = { in: collectionIds }
    } else {
      if (batchId && batchId !== "all") {
        where.batchId = batchId
      }

      if (date) {
        const startDate = new Date(date)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(date)
        endDate.setHours(23, 59, 59, 999)
        where.collectionDate = {
          gte: startDate,
          lte: endDate,
        }
      }

      if (user.mccId) {
        where.mccId = user.mccId
      }
    }

    // Get collections to approve
    const collections = await prisma.commodity_collections.findMany({
      where,
      include: {
        farmer: true,
      },
    })

    if (collections.length === 0) {
      return NextResponse.json(
        { error: "No collections found to approve" },
        { status: 400 }
      )
    }

    // Verify all farmers have verified IDs
    const farmerIds = [...new Set(collections.map(c => c.farmerId))]
    const idVerifications = await prisma.id_verifications.findMany({
      where: {
        entityType: "farmer",
        entityId: { in: farmerIds },
        verificationStatus: "VERIFIED",
      },
    })

    const verifiedFarmerIds = new Set(idVerifications.map(v => v.entityId))
    const unverifiedFarmers = collections.filter(c => !verifiedFarmerIds.has(c.farmerId))

    if (unverifiedFarmers.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot approve payout: Some farmers have unverified IDs",
          unverifiedFarmers: unverifiedFarmers.map(c => ({
            farmerId: c.farmerId,
            farmerName: c.farmer?.name,
          })),
        },
        { status: 400 }
      )
    }

    // Process payouts in transaction
    const result = await prisma.$transaction(async (tx) => {
      const approvedCollections = []
      const payments = []

      for (const collection of collections) {
        // Update collection status
        const updated = await tx.commodity_collections.update({
          where: { id: collection.id },
          data: {
            status: "PAID",
          },
        })
        approvedCollections.push(updated)

        // Create payment record (use commodityCollectionId for commodity collections)
        if (collection.netPayment > 0) {
          const payment = await tx.mcc_payments.create({
            data: {
              farmerId: collection.farmerId,
              commodityCollectionId: collection.id,
              mccId: collection.mccId,
              totalAmount: collection.totalAmount,
              deductions: collection.totalDeductions,
              advances: collection.advances || 0,
              netPayment: collection.netPayment,
              paymentMethod: collection.farmer?.paymentMethod || "cash",
              paymentStatus: "paid",
              paymentDate: new Date(),
              processedBy: user.id,
              notes: `Approved payout for collection ${collection.id}`,
            },
          })
          payments.push(payment)

          // Update farmer account
          await tx.farmer_accounts.upsert({
            where: { farmerId: collection.farmerId },
            create: {
              farmerId: collection.farmerId,
              balance: collection.netPayment,
            },
            update: {
              balance: {
                increment: collection.netPayment,
              },
              lastUpdated: new Date(),
            },
          })

          // Update total volume collected
          await tx.farmers.update({
            where: { id: collection.farmerId },
            data: {
              totalVolumeCollected: {
                increment: collection.quantity || 0,
              },
            },
          })
        }
      }

      return {
        approvedCollections,
        payments,
      }
    })

    return NextResponse.json({
      success: true,
      message: `Payout approved for ${result.approvedCollections.length} collections`,
      data: result,
    })
  } catch (error: any) {
    console.error("Approve payout error:", error)
    return NextResponse.json(
      {
        error: "Failed to approve payout",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
