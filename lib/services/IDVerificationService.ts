import { prisma } from "@/lib/prisma"

export interface IDVerificationInput {
  entityType: "farmer" | "agent" | "user"
  entityId: string
  nationalId: string
  agentId?: string
  verificationMethod?: string
  verificationNotes?: string
}

export class IDVerificationService {
  /**
   * Create or update ID verification
   */
  static async verifyID(
    data: IDVerificationInput,
    verifiedBy: string
  ) {
    // Check if verification exists
    const existing = await prisma.id_verifications.findUnique({
      where: {
        entityType_entityId: {
          entityType: data.entityType,
          entityId: data.entityId,
        },
      },
    })

    if (existing) {
      return await prisma.id_verifications.update({
        where: { id: existing.id },
        data: {
          nationalId: data.nationalId,
          agentId: data.agentId,
          verificationStatus: "VERIFIED",
          verifiedBy,
          verifiedAt: new Date(),
          verificationMethod: data.verificationMethod || "MANUAL",
          verificationNotes: data.verificationNotes,
        },
      })
    }

    return await prisma.id_verifications.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        nationalId: data.nationalId,
        agentId: data.agentId,
        verificationStatus: "VERIFIED",
        verifiedBy,
        verifiedAt: new Date(),
        verificationMethod: data.verificationMethod || "MANUAL",
        verificationNotes: data.verificationNotes,
      },
    })
  }

  /**
   * Get verification status
   */
  static async getVerificationStatus(
    entityType: string,
    entityId: string
  ) {
    return await prisma.id_verifications.findUnique({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
    })
  }

  /**
   * Check if entity can receive payment (ID must be verified)
   */
  static async canReceivePayment(
    entityType: string,
    entityId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const verification = await this.getVerificationStatus(entityType, entityId)

    if (!verification) {
      return {
        allowed: false,
        reason: "National ID not verified",
      }
    }

    if (verification.verificationStatus !== "VERIFIED") {
      return {
        allowed: false,
        reason: `ID verification status: ${verification.verificationStatus}`,
      }
    }

    return { allowed: true }
  }

  /**
   * Get all unverified entities
   */
  static async getUnverifiedEntities(entityType?: string) {
    const where: any = {
      verificationStatus: { not: "VERIFIED" },
    }
    if (entityType) where.entityType = entityType

    return await prisma.id_verifications.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })
  }
}
