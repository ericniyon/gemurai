import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export interface MilkCollectionInput {
  farmerId: string
  mccId?: string
  agentId?: string
  collectionDate?: Date
  totalLiters: number
  
  // Quality test fields
  fat?: number
  protein?: number
  lactometerReading?: number
  antibioticTest?: boolean
  tempCelsius?: number
  timeSinceMilkingHours?: number
  
  // Traceability fields
  sampleTag?: string
  photoUrl?: string
  geolocation?: { lat: number; lng: number }
  
  // Price calculation
  basePricePerLiter?: number
  qualityMultiplier?: number
  
  // Payment options
  immediatePayment?: boolean
  paymentMethod?: "cash" | "mobile_money" | "credit"
  
  // Other fields
  period?: number
  mccPeriodId?: string
  warehouseId?: string
  locationId?: string
  productId?: string
  deductions?: any
  advances?: number
  notes?: string
}

export interface QualityValidationResult {
  passed: boolean
  rejected: boolean
  rejectionReason?: string
  qualityStatus: "pending" | "accepted" | "rejected"
  qualityMultiplier: number
  finalPricePerLiter: number
}

export class MilkCollectionService {
  /**
   * Validate milk quality based on MCC settings and business rules
   */
  static async validateQuality(
    data: MilkCollectionInput,
    mccId?: string
  ): Promise<QualityValidationResult> {
    const mcc = mccId
      ? await prisma.mccs.findUnique({
          where: { id: mccId },
          select: { settings: true },
        })
      : null

    const settings = (mcc?.settings as any) || {}
    const qualityRules = settings.qualityRules || {}

    // Default quality rules
    const minLactometer = qualityRules.minLactometer || 1.025
    const maxTemp = qualityRules.maxTemp || 4.0
    const maxTimeSinceMilking = qualityRules.maxTimeSinceMilking || 2.0
    const basePrice = qualityRules.basePricePerLiter || 500
    const fatFactor = qualityRules.fatFactor || 0.1
    const baselineFat = qualityRules.baselineFat || 3.5

    let rejected = false
    const rejectionReasons: string[] = []

    // Rule 1: Reject if antibiotic test is positive
    if (data.antibioticTest === true) {
      rejected = true
      rejectionReasons.push("Antibiotic test positive")
    }

    // Rule 2: Reject if lactometer reading is too low
    if (data.lactometerReading && data.lactometerReading < minLactometer) {
      rejected = true
      rejectionReasons.push(
        `Lactometer reading too low: ${data.lactometerReading} < ${minLactometer}`
      )
    }

    // Rule 3: Reject if temperature is too high
    if (data.tempCelsius && data.tempCelsius > maxTemp) {
      rejected = true
      rejectionReasons.push(
        `Temperature too high: ${data.tempCelsius}°C > ${maxTemp}°C`
      )
    }

    // Rule 4: Reject if time since milking is too long
    if (
      data.timeSinceMilkingHours &&
      data.timeSinceMilkingHours > maxTimeSinceMilking
    ) {
      rejected = true
      rejectionReasons.push(
        `Time since milking too long: ${data.timeSinceMilkingHours}h > ${maxTimeSinceMilking}h`
      )
    }

    // Calculate quality multiplier based on fat content
    let qualityMultiplier = 1.0
    if (data.fat && !rejected) {
      const fatDifference = data.fat - baselineFat
      qualityMultiplier = 1 + fatFactor * fatDifference
      // Ensure multiplier is within reasonable bounds
      qualityMultiplier = Math.max(0.8, Math.min(1.2, qualityMultiplier))
    }

    const finalPricePerLiter =
      (data.basePricePerLiter || basePrice) * qualityMultiplier

    return {
      passed: !rejected,
      rejected,
      rejectionReason: rejectionReasons.join("; "),
      qualityStatus: rejected ? "rejected" : "accepted",
      qualityMultiplier,
      finalPricePerLiter,
    }
  }

  /**
   * Generate unique sample tag
   */
  static generateSampleTag(farmerId: string, collectionDate: Date): string {
    const dateStr = collectionDate.toISOString().split("T")[0].replace(/-/g, "")
    const timeStr = collectionDate
      .toTimeString()
      .split(" ")[0]
      .replace(/:/g, "")
    const farmerCode = farmerId.substring(0, 6).toUpperCase()
    const randomId = randomBytes(4).toString("hex").toUpperCase()
    return `MLK-${dateStr}-${timeStr}-${farmerCode}-${randomId}`
  }

  /**
   * Record milk collection with quality validation
   */
  static async recordCollection(
    data: MilkCollectionInput
  ): Promise<{
    collection: any
    qualityResult: QualityValidationResult
    payment?: any
  }> {
    // Get farmer to determine MCC
    const farmer = await prisma.farmers.findUnique({
      where: { id: data.farmerId },
      select: { mccId: true },
    })

    if (!farmer) {
      throw new Error("Farmer not found")
    }

    const mccId = data.mccId || farmer.mccId

    // Validate quality
    const qualityResult = await this.validateQuality(data, mccId)

    // Generate sample tag if not provided
    const sampleTag =
      data.sampleTag ||
      this.generateSampleTag(
        data.farmerId,
        data.collectionDate || new Date()
      )

    // Check for duplicate sample tag
    const existingCollection = await prisma.milk_collections.findUnique({
      where: { sampleTag },
    })

    if (existingCollection) {
      throw new Error("Sample tag already exists")
    }

    // Calculate amounts
    const collectionDate = data.collectionDate || new Date()
    const totalLiters = data.totalLiters
    const unitPrice = qualityResult.finalPricePerLiter
    const totalAmount = totalLiters * unitPrice

    // Calculate deductions and advances
    const deductions = data.deductions || {}
    const advances = data.advances || 0

    // Calculate product deductions total
    const productDeductionsTotal =
      deductions.products?.reduce(
        (sum: number, product: any) => sum + (product.totalPrice || 0),
        0
      ) || 0

    // Calculate other deductions total
    const othersTotal =
      deductions.others
        ? Object.values(deductions.others).reduce(
            (sum: number, amount: any) => sum + (amount || 0),
            0
          )
        : 0

    const totalDeductions = productDeductionsTotal + othersTotal
    const netPayment = totalAmount - totalDeductions - advances

    // Create collection record
    const collection = await prisma.milk_collections.create({
      data: {
        farmerId: data.farmerId,
        mccId: mccId,
        mccPeriodId: data.mccPeriodId,
        agentId: data.agentId,
        collectionDate,
        period: data.period || 1,
        totalLiters,
        unitPrice,
        totalAmount,
        deductions: deductions as any,
        advances,
        totalDeductions,
        netPayment,
        status: qualityResult.rejected ? "PENDING" : "APPROVED",
        
        // Quality fields
        fat: data.fat,
        protein: data.protein,
        lactometerReading: data.lactometerReading,
        antibioticTest: data.antibioticTest || false,
        tempCelsius: data.tempCelsius,
        timeSinceMilkingHours: data.timeSinceMilkingHours,
        qualityStatus: qualityResult.qualityStatus,
        qualityNotes: qualityResult.rejectionReason,
        
        // Traceability fields
        sampleTag,
        photoUrl: data.photoUrl,
        geolocation: data.geolocation as any,
        synced: true,
        
        // Other fields
        warehouseId: data.warehouseId,
        locationId: data.locationId,
        productId: data.productId,
      },
      include: {
        farmers: true,
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mccs: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    // Update farmer's last collection date
    await prisma.farmers.update({
      where: { id: data.farmerId },
      data: { lastCollectionDate: collectionDate },
    })

    // Handle immediate payment if requested
    let payment = null
    if (data.immediatePayment && !qualityResult.rejected && netPayment > 0) {
      payment = await prisma.mcc_payments.create({
        data: {
          farmerId: data.farmerId,
          collectionId: collection.id,
          mccId: mccId,
          totalAmount: totalAmount,
          deductions: totalDeductions,
          advances: advances,
          netPayment: netPayment,
          paymentMethod: data.paymentMethod?.toUpperCase() as any || "CASH",
          paymentStatus: "paid",
          paymentDate: new Date(),
          processedBy: data.agentId || "",
          notes: data.notes || "",
        },
      })

      // Update collection status
      await prisma.milk_collections.update({
        where: { id: collection.id },
        data: { status: "PAID" },
      })

      // Update farmer account and ledger
      await this.updateFarmerAccount(data.farmerId, netPayment, "COLLECTION", collection.id)
    } else if (!qualityResult.rejected) {
      // If credit, update farmer account
      await this.updateFarmerAccount(data.farmerId, netPayment, "COLLECTION", collection.id)
    }

    return {
      collection,
      qualityResult,
      payment,
    }
  }

  /**
   * Update farmer account and ledger
   */
  static async updateFarmerAccount(
    farmerId: string,
    amount: number,
    type: string,
    refId: string
  ) {
    // Get or create farmer account
    let account = await prisma.farmer_accounts.findUnique({
      where: { farmerId },
    })

    if (!account) {
      account = await prisma.farmer_accounts.create({
        data: {
          farmerId,
          balance: 0,
        },
      })
    }

    // Update balance
    const newBalance = account.balance + amount

    await prisma.farmer_accounts.update({
      where: { farmerId },
      data: {
        balance: newBalance,
        lastUpdated: new Date(),
      },
    })

    // Create ledger entry
    await prisma.farmer_ledger.create({
      data: {
        farmerId,
        type,
        amount,
        balanceAfter: newBalance,
        refId,
        notes: `Milk collection ${type}`,
      },
    })
  }

  /**
   * Accept or reject a collection
   */
  static async updateCollectionStatus(
    collectionId: string,
    status: "accepted" | "rejected",
    notes?: string
  ) {
    const collection = await prisma.milk_collections.update({
      where: { id: collectionId },
      data: {
        qualityStatus: status,
        qualityNotes: notes,
        status: status === "accepted" ? "APPROVED" : "PENDING",
      },
    })

    return collection
  }
}

