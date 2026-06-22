import crypto from "crypto"
import { prisma } from "@/lib/database"
import { logSoromaAudit } from "./audit"

function hashSecret(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex")
}

type ConnectionConfig = Record<string, unknown> & {
  credentials?: {
    apiKeyHash?: string
    apiSecretHash?: string
  }
}

function withCredentialHashes(
  config: Record<string, unknown> | undefined,
  apiKey?: string,
  apiSecret?: string
): ConnectionConfig {
  const base = (config ?? {}) as ConnectionConfig
  const credentials = {
    ...(base.credentials ?? {}),
    ...(apiKey ? { apiKeyHash: hashSecret(apiKey) } : {}),
    ...(apiSecret ? { apiSecretHash: hashSecret(apiSecret) } : {}),
  }
  return { ...base, credentials }
}

export async function registerConnector(params: {
  code: string
  name: string
  type: string
  authMethod?: string
  capabilities?: Record<string, unknown>
  status?: string
  userId?: string
}) {
  const connector = await prisma.soromaConnector.upsert({
    where: { code: params.code },
    create: {
      code: params.code,
      name: params.name,
      type: params.type,
      authMethod: params.authMethod,
      capabilities: params.capabilities,
      status: (params.status as "PENDING" | "CONNECTED" | "DOWN") ?? "PENDING",
    },
    update: {
      name: params.name,
      type: params.type,
      authMethod: params.authMethod,
      capabilities: params.capabilities,
      status: (params.status as "PENDING" | "CONNECTED" | "DOWN") ?? "PENDING",
    },
  })

  await logSoromaAudit({
    userId: params.userId,
    workspaceType: "PLATFORM",
    action: "integration.connector.upserted",
    entityType: "SoromaConnector",
    entityId: connector.id,
    afterState: { code: connector.code, name: connector.name, status: connector.status },
  })
  return connector
}

export async function connectTenantToConnector(params: {
  tenantId: string
  connectorId: string
  externalAccountId?: string
  config?: Record<string, unknown>
  apiKey?: string
  apiSecret?: string
  userId?: string
}) {
  const nextConfig = withCredentialHashes(params.config, params.apiKey, params.apiSecret)

  const connection = await prisma.soromaTenantConnection.upsert({
    where: {
      tenantId_connectorId: {
        tenantId: params.tenantId,
        connectorId: params.connectorId,
      },
    },
    create: {
      tenantId: params.tenantId,
      connectorId: params.connectorId,
      externalAccountId: params.externalAccountId,
      status: "PENDING",
      config: nextConfig,
    },
    update: {
      externalAccountId: params.externalAccountId,
      config: nextConfig,
      status: "PENDING",
    },
  })

  await logSoromaAudit({
    userId: params.userId,
    tenantId: params.tenantId,
    workspaceType: "TENANT",
    action: "integration.connection.upserted",
    entityType: "SoromaTenantConnection",
    entityId: connection.id,
    afterState: {
      connectorId: params.connectorId,
      externalAccountId: params.externalAccountId,
    },
  })
  return connection
}

export async function enqueueSyncJob(params: {
  connectionId: string
  jobType: string
  payload?: Record<string, unknown>
  userId?: string
}) {
  const job = await prisma.soromaSyncJob.create({
    data: {
      connectionId: params.connectionId,
      jobType: params.jobType,
      status: "PENDING",
      logs: params.payload
        ? {
            create: [
              {
                level: "INFO",
                message: "Sync job queued",
                payload: params.payload,
              },
            ],
          }
        : undefined,
    },
  })

  await logSoromaAudit({
    userId: params.userId,
    action: "integration.sync_job.queued",
    entityType: "SoromaSyncJob",
    entityId: job.id,
    afterState: { jobType: job.jobType, status: job.status },
  })
  return job
}

async function appendSyncLog(jobId: string, level: string, message: string, payload?: unknown) {
  await prisma.soromaSyncLog.create({
    data: {
      jobId,
      level,
      message,
      payload: payload ? JSON.parse(JSON.stringify(payload)) : undefined,
    },
  })
}

export async function processSyncJob(jobId: string, userId?: string) {
  const job = await prisma.soromaSyncJob.findUnique({
    where: { id: jobId },
    include: { connection: { include: { connector: true, tenant: true } } },
  })
  if (!job) return null

  await prisma.soromaSyncJob.update({
    where: { id: job.id },
    data: { status: "RUNNING", startedAt: new Date(), errorMessage: null },
  })
  await appendSyncLog(job.id, "INFO", "Sync started")

  try {
    // Simulated connector execution hook - replace with actual connector adapters
    const successRate = Number((Math.random() * (98 - 80) + 80).toFixed(1))

    await prisma.soromaTenantConnection.update({
      where: { id: job.connectionId },
      data: {
        status: "CONNECTED",
        lastSyncAt: new Date(),
        successRate,
      },
    })
    const completed = await prisma.soromaSyncJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    })
    await appendSyncLog(job.id, "INFO", "Sync completed", { successRate })

    await logSoromaAudit({
      userId,
      tenantId: job.connection.tenantId,
      workspaceType: "TENANT",
      action: "integration.sync_job.completed",
      entityType: "SoromaSyncJob",
      entityId: job.id,
      afterState: { status: completed.status, successRate },
    })
    return completed
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed"
    const failed = await prisma.soromaSyncJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errorMessage: message,
      },
    })
    await prisma.soromaTenantConnection.update({
      where: { id: job.connectionId },
      data: { status: "DOWN" },
    })
    await appendSyncLog(job.id, "ERROR", "Sync failed", { message })

    await logSoromaAudit({
      userId,
      tenantId: job.connection.tenantId,
      workspaceType: "TENANT",
      action: "integration.sync_job.failed",
      entityType: "SoromaSyncJob",
      entityId: job.id,
      afterState: { status: failed.status, error: message },
    })
    return failed
  }
}

export async function retrySyncJob(jobId: string, userId?: string) {
  const job = await prisma.soromaSyncJob.findUnique({ where: { id: jobId } })
  if (!job) return null

  const retry = await prisma.soromaSyncJob.create({
    data: {
      connectionId: job.connectionId,
      jobType: job.jobType,
      status: "RETRYING",
      logs: {
        create: [
          {
            level: "WARN",
            message: "Retry job created",
            payload: { parentJobId: job.id },
          },
        ],
      },
    },
  })

  await logSoromaAudit({
    userId,
    action: "integration.sync_job.retried",
    entityType: "SoromaSyncJob",
    entityId: retry.id,
    afterState: { parentJobId: job.id, status: retry.status },
  })
  return retry
}

export async function pushToDeadLetter(jobId: string, reason: string, userId?: string) {
  const dead = await prisma.soromaSyncJob.update({
    where: { id: jobId },
    data: {
      status: "DEAD_LETTER",
      completedAt: new Date(),
      errorMessage: reason,
    },
  })
  await appendSyncLog(jobId, "ERROR", "Moved to dead-letter queue", { reason })
  await logSoromaAudit({
    userId,
    action: "integration.sync_job.dead_letter",
    entityType: "SoromaSyncJob",
    entityId: jobId,
    afterState: { reason, status: "DEAD_LETTER" },
  })
  return dead
}

export async function handleConnectorWebhook(params: {
  connectorCode: string
  tenantId?: string
  externalAccountId?: string
  eventType: string
  payload?: Record<string, unknown>
}) {
  const connector = await prisma.soromaConnector.findUnique({
    where: { code: params.connectorCode },
  })
  if (!connector) return null

  const connection = await prisma.soromaTenantConnection.findFirst({
    where: {
      connectorId: connector.id,
      ...(params.tenantId ? { tenantId: params.tenantId } : {}),
      ...(params.externalAccountId
        ? { externalAccountId: params.externalAccountId }
        : {}),
    },
  })

  if (!connection) return null

  const job = await enqueueSyncJob({
    connectionId: connection.id,
    jobType: `WEBHOOK_${params.eventType}`,
    payload: params.payload,
  })

  await appendSyncLog(job.id, "INFO", "Webhook received", {
    connectorCode: params.connectorCode,
    eventType: params.eventType,
  })

  return { connector, connection, job }
}
