import { prisma } from "@/lib/prisma"
import { sendSMS } from "@/lib/services/twilio-service"

export interface MCCNotificationData {
  type: "payment" | "stock" | "rental" | "collection" | "quality" | "bulking"
  farmerId?: string
  mccId?: string
  data: any
}

export class MCCNotificationService {
  /**
   * Send payment notification to farmer
   */
  static async notifyPayment(
    farmerId: string,
    amount: number,
    paymentMethod: string,
    reference?: string
  ) {
    const farmer = await prisma.farmers.findUnique({
      where: { id: farmerId },
      select: {
        id: true,
        name: true,
        phone: true,
        farmerCode: true,
      },
    })

    if (!farmer || !farmer.phone) {
      return { success: false, message: "Farmer not found or no phone number" }
    }

    const message = `Murakoze! Payment yanyu y'RWF ${amount.toLocaleString()} yagiye mu konti. Ubwoba: ${paymentMethod}${reference ? `, Ref: ${reference}` : ""}. Gemurai`

    try {
      const result = await sendSMS(farmer.phone, message)
      return { success: result.success, messageId: result.messageId }
    } catch (error) {
      console.error("Payment notification error:", error)
      return { success: false, message: "Failed to send notification" }
    }
  }

  /**
   * Send stock alert to MCC manager
   */
  static async notifyLowStock(mccId: string, productId: string, currentStock: number) {
    const mcc = await prisma.mccs.findUnique({
      where: { id: mccId },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    })

    if (!mcc || !mcc.manager) {
      return { success: false, message: "MCC or manager not found" }
    }

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sku: true },
    })

    if (!product) {
      return { success: false, message: "Product not found" }
    }

    const message = `Alert: ${product.name} (${product.sku}) stock is low: ${currentStock} units remaining. Please reorder. Gemurai`

    if (mcc.manager.phone) {
      try {
        const result = await sendSMS(mcc.manager.phone, message)
        return { success: result.success, messageId: result.messageId }
      } catch (error) {
        console.error("Stock alert error:", error)
        return { success: false, message: "Failed to send notification" }
      }
    }

    return { success: false, message: "Manager phone number not available" }
  }

  /**
   * Send rental reminder to farmer
   */
  static async notifyRentalReminder(rentalId: string) {
    const rental = await prisma.rentals.findUnique({
      where: { id: rentalId },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
            serial: true,
          },
        },
      },
    })

    if (!rental || !rental.farmer || !rental.farmer.phone) {
      return { success: false, message: "Rental or farmer not found" }
    }

    const daysOut = rental.rentStart
      ? Math.ceil((Date.now() - new Date(rental.rentStart).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    const message = `Mwibuke: Equipment ${rental.asset.name} (${rental.asset.serial}) yanyu yari yarazwe iminsi ${daysOut}. Murakwiye kuyisubiza. Gemurai`

    try {
      const result = await sendSMS(rental.farmer.phone, message)
      return { success: result.success, messageId: result.messageId }
    } catch (error) {
      console.error("Rental reminder error:", error)
      return { success: false, message: "Failed to send notification" }
    }
  }

  /**
   * Send collection quality rejection notification
   */
  static async notifyQualityRejection(collectionId: string, reason: string) {
    const collection = await prisma.milk_collections.findUnique({
      where: { id: collectionId },
      include: {
        farmers: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    if (!collection || !collection.farmers || !collection.farmers.phone) {
      return { success: false, message: "Collection or farmer not found" }
    }

    const message = `Ikibazo: Amata yanyu yanze kuko ${reason}. Mwongere mugihe gikurikira. Gemurai`

    try {
      const result = await sendSMS(collection.farmers.phone, message)
      return { success: result.success, messageId: result.messageId }
    } catch (error) {
      console.error("Quality rejection notification error:", error)
      return { success: false, message: "Failed to send notification" }
    }
  }

  /**
   * Send bulking dispatch notification
   */
  static async notifyBulkingDispatch(batchId: string) {
    const batch = await prisma.bulk_batches.findUnique({
      where: { id: batchId },
      include: {
        mccs: {
          include: {
            manager: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    if (!batch || !batch.mccs || !batch.mccs.manager) {
      return { success: false, message: "Batch or MCC manager not found" }
    }

    const message = `Batch ${batchId} yagiye kuri processor. Total: ${batch.totalLiters}L. Gemurai`

    if (batch.mccs.manager.phone) {
      try {
        const result = await sendSMS(batch.mccs.manager.phone, message)
        return { success: result.success, messageId: result.messageId }
      } catch (error) {
        console.error("Bulking dispatch notification error:", error)
        return { success: false, message: "Failed to send notification" }
      }
    }

    return { success: false, message: "Manager phone number not available" }
  }

  /**
   * Send payment due reminder
   */
  static async notifyPaymentDue(farmerId: string, amount: number) {
    const farmer = await prisma.farmers.findUnique({
      where: { id: farmerId },
      include: {
        farmer_account: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        farmerCode: true,
      },
    })

    if (!farmer || !farmer.phone) {
      return { success: false, message: "Farmer not found or no phone number" }
    }

    const balance = farmer.farmer_account?.balance || 0
    const message = `Mwibuke: Murakwiye RWF ${amount.toLocaleString()}. Balance yanyu: RWF ${balance.toLocaleString()}. Gemurai`

    try {
      const result = await sendSMS(farmer.phone, message)
      return { success: result.success, messageId: result.messageId }
    } catch (error) {
      console.error("Payment due reminder error:", error)
      return { success: false, message: "Failed to send notification" }
    }
  }

  /**
   * Send bulk notification to multiple farmers
   */
  static async sendBulkNotification(
    farmerIds: string[],
    message: string
  ): Promise<{ success: number; failed: number }> {
    const farmers = await prisma.farmers.findMany({
      where: { id: { in: farmerIds } },
      select: {
        id: true,
        phone: true,
      },
    })

    let success = 0
    let failed = 0

    for (const farmer of farmers) {
      if (farmer.phone) {
        try {
          const result = await sendSMS(farmer.phone, message)
          if (result.success) {
            success++
          } else {
            failed++
          }
        } catch (error) {
          console.error(`Failed to send SMS to ${farmer.phone}:`, error)
          failed++
        }
      } else {
        failed++
      }
    }

    return { success, failed }
  }
}

