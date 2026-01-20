/**
 * Geo-audit service for logging geo-location access and changes
 */

import { prisma } from "@/lib/prisma"

export interface GeoAuditLogData {
  userId: string
  userName?: string
  userRole?: string
  action: string // CREATE, UPDATE, DELETE, VIEW, EXPORT, CONSENT_GRANTED, CONSENT_REVOKED, ACCESS_DENIED
  entityType: string // farmer, agent, mcc, warehouse, customer, supplier, milk_collection
  entityId: string
  entityName?: string
  oldValue?: { latitude: number; longitude: number } | null
  newValue?: { latitude: number; longitude: number } | null
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

export class GeoAuditService {
  /**
   * Log a geo-location action
   */
  static async logAction(data: GeoAuditLogData): Promise<void> {
    try {
      await prisma.geoAuditLog.create({
        data: {
          userId: data.userId,
          userName: data.userName,
          userRole: data.userRole,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          entityName: data.entityName,
          oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
          newValue: data.newValue ? JSON.stringify(data.newValue) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        },
      })
    } catch (error) {
      console.error("Failed to log geo-audit action:", error)
      // Don't throw - audit logging should not break the main flow
    }
  }

  /**
   * Log geo-location creation
   */
  static async logCreation(
    userId: string,
    userName: string | undefined,
    userRole: string | undefined,
    entityType: string,
    entityId: string,
    entityName: string | undefined,
    coordinates: { latitude: number; longitude: number },
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      userName,
      userRole,
      action: "CREATE",
      entityType,
      entityId,
      entityName,
      newValue: coordinates,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Log geo-location update
   */
  static async logUpdate(
    userId: string,
    userName: string | undefined,
    userRole: string | undefined,
    entityType: string,
    entityId: string,
    entityName: string | undefined,
    oldCoordinates: { latitude: number; longitude: number } | null,
    newCoordinates: { latitude: number; longitude: number },
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      userName,
      userRole,
      action: "UPDATE",
      entityType,
      entityId,
      entityName,
      oldValue: oldCoordinates,
      newValue: newCoordinates,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Log consent granted
   */
  static async logConsentGranted(
    userId: string,
    userName: string | undefined,
    userRole: string | undefined,
    entityType: string,
    entityId: string,
    entityName: string | undefined,
    coordinates: { latitude: number; longitude: number },
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      userName,
      userRole,
      action: "CONSENT_GRANTED",
      entityType,
      entityId,
      entityName,
      newValue: coordinates,
      ipAddress,
      userAgent,
    })
  }

  /**
   * Log access denied
   */
  static async logAccessDenied(
    userId: string,
    userName: string | undefined,
    userRole: string | undefined,
    entityType: string,
    entityId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logAction({
      userId,
      userName,
      userRole,
      action: "ACCESS_DENIED",
      entityType,
      entityId,
      metadata: { reason },
      ipAddress,
      userAgent,
    })
  }
}
