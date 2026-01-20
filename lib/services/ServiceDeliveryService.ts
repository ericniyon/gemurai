import { PrismaClient } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export interface ServiceDeliveryInput {
  serviceId: string
  farmerId?: string
  mccId?: string
  requestedBy: string
  scheduledDate: Date
  notes?: string
  cost?: number
}

export class ServiceDeliveryService {
  /**
   * Create service delivery request
   */
  static async createDelivery(data: ServiceDeliveryInput) {
    // Get service to calculate cost if not provided
    const service = await prisma.services.findUnique({
      where: { id: data.serviceId },
    })

    if (!service) {
      throw new Error("Service not found")
    }

    // Calculate cost if not provided
    let cost = data.cost
    if (!cost && service.pricing) {
      const pricing = service.pricing as any
      if (pricing.type === "FIXED") {
        cost = pricing.amount
      } else if (pricing.type === "HOURLY" && service.duration) {
        cost = pricing.amount * service.duration
      }
    }

    return await prisma.service_deliveries.create({
      data: {
        serviceId: data.serviceId,
        farmerId: data.farmerId,
        mccId: data.mccId,
        requestedBy: data.requestedBy,
        scheduledDate: data.scheduledDate,
        notes: data.notes,
        cost: cost || null,
        status: "SCHEDULED",
      },
      include: {
        service: true,
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
        requestedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  /**
   * Update service delivery status
   */
  static async updateDeliveryStatus(
    deliveryId: string,
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
    completedDate?: Date
  ) {
    const updateData: any = { status }

    if (status === "COMPLETED" && !completedDate) {
      updateData.completedDate = new Date()
    } else if (completedDate) {
      updateData.completedDate = completedDate
    }

    return await prisma.service_deliveries.update({
      where: { id: deliveryId },
      data: updateData,
      include: {
        service: true,
        farmer: true,
        mcc: true,
      },
    })
  }

  /**
   * Get service deliveries
   */
  static async getDeliveries(filters?: {
    serviceId?: string
    farmerId?: string
    mccId?: string
    status?: string
    startDate?: Date
    endDate?: Date
  }) {
    const where: any = {}

    if (filters?.serviceId) where.serviceId = filters.serviceId
    if (filters?.farmerId) where.farmerId = filters.farmerId
    if (filters?.mccId) where.mccId = filters.mccId
    if (filters?.status) where.status = filters.status
    if (filters?.startDate || filters?.endDate) {
      where.scheduledDate = {}
      if (filters.startDate) where.scheduledDate.gte = filters.startDate
      if (filters.endDate) where.scheduledDate.lte = filters.endDate
    }

    return await prisma.service_deliveries.findMany({
      where,
      include: {
        service: true,
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
        requestedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { scheduledDate: "desc" },
    })
  }

  /**
   * Get services catalog
   */
  static async getServices(activeOnly: boolean = true) {
    return await prisma.services.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { name: "asc" },
    })
  }

  /**
   * Create service
   */
  static async createService(data: {
    name: string
    code: string
    type: string
    description?: string
    pricing: any
    duration?: number
    sla?: any
  }) {
    return await prisma.services.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type as any,
        description: data.description,
        pricing: data.pricing,
        duration: data.duration,
        sla: data.sla,
        isActive: true,
      },
    })
  }
}
