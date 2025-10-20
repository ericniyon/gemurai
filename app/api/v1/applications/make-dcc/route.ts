import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/database"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user has permission to make DCC
    if (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { applicationId, userId } = body

    if (!applicationId || !userId) {
      return NextResponse.json(
        { success: false, message: "Application ID and User ID are required" },
        { status: 400 }
      )
    }

    // Get the application and user
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true
      }
    })

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    if (!application.user) {
      return NextResponse.json(
        { success: false, message: "User not found for this application" },
        { status: 404 }
      )
    }

    // Check if user is already a DCC
    if (application.user.role === "DCC") {
      return NextResponse.json(
        { success: false, message: "User is already a DCC" },
        { status: 400 }
      )
    }

    // Start a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // 1. Update user role to DCC
      await tx.user.update({
        where: { id: userId },
        data: {
          role: "DCC",
          permissions: [
            "dashboard.view",
            "products.view",
            "products.purchase",
            "orders.view",
            "orders.create",
            "learning.view",
            "learning.enroll",
            "jobs.view",
            "jobs.apply",
            "finance.view",
            "finance.request",
            "profile.view",
            "profile.edit",
            "dcc.dashboard",
            "dcc.services",
            "stock.create"
          ]
        }
      })

      // 2. Update application status to APPROVED and mark as DCC created
      await tx.application.update({
        where: { id: applicationId },
        data: {
          status: "APPROVED",
          dccCreated: true
        }
      })

      // 3. Create DCC profile
      await tx.dCCProfile.create({
        data: {
          userId: userId,
          applicationId: applicationId,
          level: "LEVEL_C", // Start at Level C
          rating: 5.0, // Start with perfect rating
          totalSales: "RWF 0",
          monthlySales: "RWF 0",
          productsAvailable: 0,
          status: "active",
          location: application.formData?.location || application.formData?.q11?.district || "Unknown",
          specialties: [],
          performance: {},
          recentActivity: []
        }
      })

      // 4. Create wallet for the DCC
      await tx.wallet.create({
        data: {
          userId: userId,
          balance: 0,
          minimumBalance: 1000,
          status: "ACTIVE"
        }
      })

      // 5. Auto-create initial voucher for this DCC
      const voucherValue = 30000 // Default initial voucher value (RWF)
      const code = `VCHR-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8).toUpperCase()}`

      const voucher = await tx.voucher.create({
        data: {
          code,
          value: voucherValue,
          remainingBalance: voucherValue,
          status: 'ACTIVE',
          dccId: userId,
          createdBy: session.user.id,
          expiresAt: null
        }
      })

      await tx.voucherTransaction.create({
        data: {
          voucherId: voucher.id,
          type: 'CREATED',
          amount: voucherValue,
          remainingBalance: voucherValue,
          description: `Voucher auto-created on DCC approval`
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: "Successfully converted applicant to DCC",
      data: {
        applicationId,
        userId,
        newRole: "DCC"
      }
    })

  } catch (error) {
    console.error("Error making DCC:", error)
    return NextResponse.json(
      { success: false, message: "Failed to convert applicant to DCC" },
      { status: 500 }
    )
  }
} 