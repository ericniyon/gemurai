import { prisma } from "@/lib/prisma"

export interface CropProcessingInput {
  mccId: string
  rawCropProductId: string
  processedProductId: string
  inputQuantity: number
  outputQuantity: number
  processingDate: Date
  processingSteps?: Record<string, any>
  qualityMetrics?: Record<string, any>
}

export class CropProcessingService {
  /**
   * Process crop
   */
  static async processCrop(data: CropProcessingInput) {
    return await prisma.crop_processing.create({
      data: {
        mccId: data.mccId,
        rawCropProductId: data.rawCropProductId,
        processedProductId: data.processedProductId,
        inputQuantity: data.inputQuantity,
        outputQuantity: data.outputQuantity,
        processingDate: data.processingDate,
        processingSteps: data.processingSteps || {},
        qualityMetrics: data.qualityMetrics || {},
        status: "PENDING",
      },
      include: {
        mcc: {
          select: {
            id: true,
            name: true,
          },
        },
        rawProduct: {
          select: {
            id: true,
            name: true,
          },
        },
        processedProduct: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  /**
   * Get crop processing records
   */
  static async getProcessingRecords(filters?: {
    mccId?: string
    rawProductId?: string
    processedProductId?: string
    status?: string
    startDate?: Date
    endDate?: Date
  }) {
    const where: any = {}

    if (filters?.mccId) where.mccId = filters.mccId
    if (filters?.rawProductId) where.rawCropProductId = filters.rawProductId
    if (filters?.processedProductId) where.processedProductId = filters.processedProductId
    if (filters?.status) where.status = filters.status
    if (filters?.startDate || filters?.endDate) {
      where.processingDate = {}
      if (filters.startDate) where.processingDate.gte = filters.startDate
      if (filters.endDate) where.processingDate.lte = filters.endDate
    }

    return await prisma.crop_processing.findMany({
      where,
      include: {
        mcc: {
          select: {
            id: true,
            name: true,
          },
        },
        rawProduct: {
          select: {
            id: true,
            name: true,
          },
        },
        processedProduct: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { processingDate: "desc" },
    })
  }
}
