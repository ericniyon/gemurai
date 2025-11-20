import { NextRequest, NextResponse } from "next/server"
import { MCCNotificationService } from "@/lib/services/MCCNotificationService"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * POST /api/v1/mcc/notifications - Send notification
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.notifications.send"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { type, farmerId, mccId, message, bulk } = data

    if (!type) {
      return NextResponse.json(
        { error: "Missing required field: type" },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case "payment":
        if (!farmerId || !data.amount || !data.paymentMethod) {
          return NextResponse.json(
            { error: "Missing required fields: farmerId, amount, paymentMethod" },
            { status: 400 }
          )
        }
        result = await MCCNotificationService.notifyPayment(
          farmerId,
          data.amount,
          data.paymentMethod,
          data.reference
        )
        break

      case "stock":
        if (!mccId || !data.productId || !data.currentStock) {
          return NextResponse.json(
            { error: "Missing required fields: mccId, productId, currentStock" },
            { status: 400 }
          )
        }
        result = await MCCNotificationService.notifyLowStock(
          mccId,
          data.productId,
          data.currentStock
        )
        break

      case "rental":
        if (!data.rentalId) {
          return NextResponse.json(
            { error: "Missing required field: rentalId" },
            { status: 400 }
          )
        }
        result = await MCCNotificationService.notifyRentalReminder(data.rentalId)
        break

      case "quality":
        if (!data.collectionId || !data.reason) {
          return NextResponse.json(
            { error: "Missing required fields: collectionId, reason" },
            { status: 400 }
          )
        }
        result = await MCCNotificationService.notifyQualityRejection(
          data.collectionId,
          data.reason
        )
        break

      case "bulking":
        if (!data.batchId) {
          return NextResponse.json(
            { error: "Missing required field: batchId" },
            { status: 400 }
          )
        }
        result = await MCCNotificationService.notifyBulkingDispatch(data.batchId)
        break

      case "payment_due":
        if (!farmerId || !data.amount) {
          return NextResponse.json(
            { error: "Missing required fields: farmerId, amount" },
            { status: 400 }
          )
        }
        result = await MCCNotificationService.notifyPaymentDue(farmerId, data.amount)
        break

      case "bulk":
        if (!data.farmerIds || !Array.isArray(data.farmerIds) || !message) {
          return NextResponse.json(
            { error: "Missing required fields: farmerIds (array), message" },
            { status: 400 }
          )
        }
        result = await MCCNotificationService.sendBulkNotification(
          data.farmerIds,
          message
        )
        break

      default:
        return NextResponse.json(
          { error: "Invalid notification type" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result.success !== false,
      message: result.message || "Notification sent successfully",
      data: result,
    })
  } catch (error) {
    console.error("Send notification error:", error)
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    )
  }
}

