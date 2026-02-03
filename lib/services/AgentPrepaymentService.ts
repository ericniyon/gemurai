import { prisma } from "@/lib/prisma"

export interface AgentPrepaymentInput {
  farmerId: string
  agentId: string
  commodityId?: string
  batchId?: string
  amount: number
  currency?: string
  notes?: string
}

export interface SettlementInput {
  collectionId: string
  prepaymentIds: string[]
  totalValue: number
}

export class AgentPrepaymentService {
  /**
   * Record agent prepayment/advance
   */
  static async recordPrepayment(data: AgentPrepaymentInput, performedBy: string) {
    // Verify farmer ID is verified
    const idVerification = await prisma.id_verifications.findUnique({
      where: {
        entityType_entityId: {
          entityType: "farmer",
          entityId: data.farmerId,
        },
      },
    })

    if (!idVerification || idVerification.verificationStatus !== "VERIFIED") {
      throw new Error("Farmer ID must be verified before recording prepayment")
    }

    // Create prepayment
    const prepayment = await prisma.agent_prepayments.create({
      data: {
        farmerId: data.farmerId,
        agentId: data.agentId,
        commodityId: data.commodityId || null,
        batchId: data.batchId || null,
        amount: data.amount,
        currency: data.currency || "RWF",
        notes: data.notes || null,
        status: "PENDING",
      },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            nationalId: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        commodity: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    // Create audit log
    await this.createAuditLog(prepayment.id, "CREATED", performedBy, null, {
      amount: prepayment.amount,
      currency: prepayment.currency,
      farmerId: prepayment.farmerId,
      agentId: prepayment.agentId,
    })

    return prepayment
  }

  /**
   * Get pending prepayments for a farmer
   */
  static async getPendingPrepayments(farmerId: string, commodityId?: string) {
    const where: any = {
      farmerId,
      status: "PENDING",
    }

    if (commodityId) {
      where.commodityId = commodityId
    }

    return await prisma.agent_prepayments.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        commodity: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        recordedAt: "asc",
      },
    })
  }

  /**
   * Settle prepayments against a collection
   */
  static async settlePrepayments(
    data: SettlementInput,
    performedBy: string
  ) {
    // Verify farmer ID is verified
    const collection = await prisma.commodity_collections.findUnique({
      where: { id: data.collectionId },
      include: {
        farmer: true,
      },
    })

    if (!collection) {
      throw new Error("Collection not found")
    }

    const idVerification = await prisma.id_verifications.findUnique({
      where: {
        entityType_entityId: {
          entityType: "farmer",
          entityId: collection.farmerId,
        },
      },
    })

    if (!idVerification || idVerification.verificationStatus !== "VERIFIED") {
      throw new Error("Farmer ID must be verified before settlement/payout")
    }

    // Get prepayments to settle
    const prepayments = await prisma.agent_prepayments.findMany({
      where: {
        id: { in: data.prepaymentIds },
        status: "PENDING",
      },
    })

    if (prepayments.length === 0) {
      throw new Error("No pending prepayments found to settle")
    }

    const totalAdvance = prepayments.reduce((sum, p) => sum + p.amount, 0)
    const netPayout = data.totalValue - totalAdvance

    // Update prepayments to SETTLED
    const updatedPrepayments = await prisma.$transaction(
      prepayments.map((prepayment) =>
        prisma.agent_prepayments.update({
          where: { id: prepayment.id },
          data: {
            status: "SETTLED",
            collectionId: data.collectionId,
            settledAt: new Date(),
          },
        })
      )
    )

    // Create audit logs for each settled prepayment
    for (const prepayment of updatedPrepayments) {
      await this.createAuditLog(
        prepayment.id,
        "SETTLED",
        performedBy,
        { status: "PENDING" },
        {
          status: "SETTLED",
          collectionId: data.collectionId,
          settledAt: prepayment.settledAt,
        }
      )
    }

    // Update collection with agent advance
    await prisma.commodity_collections.update({
      where: { id: data.collectionId },
      data: {
        agentAdvance: totalAdvance,
        netPayment: netPayout,
      },
    })

    return {
      prepayments: updatedPrepayments,
      totalAdvance,
      totalValue: data.totalValue,
      netPayout,
    }
  }

  /**
   * Cancel a prepayment
   */
  static async cancelPrepayment(prepaymentId: string, performedBy: string, reason?: string) {
    const prepayment = await prisma.agent_prepayments.findUnique({
      where: { id: prepaymentId },
    })

    if (!prepayment) {
      throw new Error("Prepayment not found")
    }

    if (prepayment.status !== "PENDING") {
      throw new Error("Only pending prepayments can be cancelled")
    }

    const oldValue = {
      status: prepayment.status,
    }

    const updated = await prisma.agent_prepayments.update({
      where: { id: prepaymentId },
      data: {
        status: "CANCELLED",
        notes: reason ? `${prepayment.notes || ""}\nCancelled: ${reason}`.trim() : prepayment.notes,
      },
    })

    // Create audit log
    await this.createAuditLog(
      prepaymentId,
      "CANCELLED",
      performedBy,
      oldValue,
      {
        status: "CANCELLED",
        notes: updated.notes,
      },
      reason
    )

    return updated
  }

  /**
   * Get prepayment audit trail
   */
  static async getAuditTrail(prepaymentId: string) {
    return await prisma.agent_prepayment_audit.findMany({
      where: { prepaymentId },
      include: {
        performer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  /**
   * Create audit log entry
   */
  private static async createAuditLog(
    prepaymentId: string,
    action: string,
    performedBy: string,
    oldValue: any,
    newValue: any,
    notes?: string
  ) {
    return await prisma.agent_prepayment_audit.create({
      data: {
        prepaymentId,
        action,
        performedBy,
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
        notes: notes || null,
      },
    })
  }

  /**
   * Get all prepayments for farmers in an MCC
   */
  static async getPrepaymentsByMcc(mccId: string, filters?: { status?: string }) {
    const farmers = await prisma.farmers.findMany({
      where: { mccId },
      select: { id: true },
    })
    const farmerIds = farmers.map((f) => f.id)

    const where: any = { farmerId: { in: farmerIds } }
    if (filters?.status) where.status = filters.status

    return await prisma.agent_prepayments.findMany({
      where,
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            nationalId: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        commodity: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        batch: {
          select: {
            id: true,
            createdAt: true,
          },
        },
        collection: {
          select: {
            id: true,
            collectionDate: true,
            quantity: true,
          },
        },
      },
      orderBy: { recordedAt: "desc" },
    })
  }

  /**
   * Get all prepayments for an agent
   */
  static async getAgentPrepayments(agentId: string, filters?: {
    status?: string
    farmerId?: string
    commodityId?: string
  }) {
    const where: any = { agentId }
    
    if (filters?.status) where.status = filters.status
    if (filters?.farmerId) where.farmerId = filters.farmerId
    if (filters?.commodityId) where.commodityId = filters.commodityId

    return await prisma.agent_prepayments.findMany({
      where,
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            nationalId: true,
            phone: true,
          },
        },
        commodity: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        batch: {
          select: {
            id: true,
            createdAt: true,
          },
        },
        collection: {
          select: {
            id: true,
            collectionDate: true,
            quantity: true,
          },
        },
      },
      orderBy: {
        recordedAt: "desc",
      },
    })
  }
}
