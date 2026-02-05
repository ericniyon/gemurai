import { prisma } from "@/lib/prisma"

export type QualityAuditAction =
  | "QUALITY_FIELD_ADDED"
  | "QUALITY_FIELD_UPDATED"
  | "QUALITY_FIELD_REMOVED"
  | "QUALITY_RULE_ADDED"
  | "QUALITY_RULE_UPDATED"
  | "QUALITY_RULE_REMOVED"
  | "QUALITY_SCHEMA_UPDATE"
  | "QUALITY_OVERRIDE"

export interface LogQualityAuditParams {
  entityType: "quality_field" | "quality_rule" | "quality_result"
  entityId: string
  commodityId?: string
  collectionId?: string
  action: QualityAuditAction
  oldValue?: object
  newValue?: object
  userId?: string
  notes?: string
}

/**
 * Write an entry to quality_audit_log for compliance and traceability.
 */
export async function logQualityAudit(params: LogQualityAuditParams): Promise<void> {
  try {
    await prisma.quality_audit_log.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        commodityId: params.commodityId ?? undefined,
        collectionId: params.collectionId ?? undefined,
        action: params.action,
        oldValue: params.oldValue ? (params.oldValue as object) : undefined,
        newValue: params.newValue ? (params.newValue as object) : undefined,
        userId: params.userId ?? undefined,
        notes: params.notes ?? undefined,
      },
    })
  } catch (e) {
    console.error("QualityAuditService.logQualityAudit failed:", e)
    // Do not throw - audit failure should not break the main operation
  }
}
