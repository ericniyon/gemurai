import { prisma } from "@/lib/database"
import type { SoromaSession } from "./auth"
import { SOROMA_PERMISSIONS } from "./permissions"
import { getAvailableActions } from "./workflows/engine"
import { CAPA_TRANSITIONS } from "./workflows/compliance"

export async function getCurrentCapaStageMap(
  tenantId: string,
  capaIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (capaIds.length === 0) return map

  const events = await prisma.soromaWorkflowEvent.findMany({
    where: {
      tenantId,
      entityType: "SoromaCAPA",
      entityId: { in: capaIds },
    },
    orderBy: { createdAt: "desc" },
  })

  for (const event of events) {
    if (!map.has(event.entityId)) {
      map.set(event.entityId, event.toStatus)
    }
  }
  return map
}

export async function createComplianceAlertsForTenant(tenantId: string) {
  const [expiringCerts, failedQc] = await Promise.all([
    prisma.soromaCertification.findMany({
      where: {
        tenantId,
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
      take: 20,
    }),
    prisma.soromaQCTest.findMany({
      where: { tenantId, passed: false },
      orderBy: { testedAt: "desc" },
      take: 20,
    }),
  ])

  for (const cert of expiringCerts) {
    const exists = await prisma.soromaAlert.findFirst({
      where: {
        tenantId,
        type: "CERTIFICATION_EXPIRING",
        entityType: "SoromaCertification",
        entityId: cert.id,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
      select: { id: true },
    })
    if (!exists) {
      await prisma.soromaAlert.create({
        data: {
          scope: "TENANT",
          tenantId,
          severity: "MEDIUM",
          type: "CERTIFICATION_EXPIRING",
          title: `Certification expiring: ${cert.standard}`,
          entityType: "SoromaCertification",
          entityId: cert.id,
          metadata: {
            expiryDate: cert.expiryDate,
            certificateNo: cert.certificateNo,
          },
        },
      })
    }
  }

  for (const qc of failedQc) {
    const exists = await prisma.soromaAlert.findFirst({
      where: {
        tenantId,
        type: "QC_FAILED",
        entityType: "SoromaQCTest",
        entityId: qc.id,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
      select: { id: true },
    })
    if (!exists) {
      await prisma.soromaAlert.create({
        data: {
          scope: "TENANT",
          tenantId,
          severity: "HIGH",
          type: "QC_FAILED",
          title: `QC failed: ${qc.testType}`,
          entityType: "SoromaQCTest",
          entityId: qc.id,
          metadata: {
            batchId: qc.batchId,
            testedAt: qc.testedAt,
            result: qc.result,
          },
        },
      })
    }
  }
}

export async function getComplianceOperationalData(
  tenantId: string,
  session: SoromaSession
) {
  const [certifications, audits, qcTests, capas] = await Promise.all([
    prisma.soromaCertification.findMany({
      where: { tenantId },
      orderBy: { expiryDate: "asc" },
      take: 30,
    }),
    prisma.soromaAudit.findMany({
      where: { tenantId },
      orderBy: { scheduledAt: "asc" },
      take: 30,
    }),
    prisma.soromaQCTest.findMany({
      where: { tenantId },
      orderBy: { testedAt: "desc" },
      take: 30,
    }),
    prisma.soromaCAPA.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ])

  const stageMap = await getCurrentCapaStageMap(
    tenantId,
    capas.map((c) => c.id)
  )
  const recentEvents = await prisma.soromaWorkflowEvent.findMany({
    where: { tenantId, entityType: "SoromaCAPA" },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const capaItems = capas.map((capa) => {
    const stage =
      stageMap.get(capa.id) ?? (capa.status === "RESOLVED" ? "CLOSED" : "OPEN")
    return {
      id: capa.id,
      label: capa.title,
      status: stage,
      entityType: "SoromaCAPA" as const,
      actions: getAvailableActions(stage, CAPA_TRANSITIONS, session),
    }
  })

  const failedQc = qcTests.filter((q) => !q.passed).length
  const expiringCerts = certifications.filter(
    (c) =>
      c.expiryDate &&
      c.expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length
  const openCapas = capas.filter((c) => c.status !== "RESOLVED").length

  const supplierRankings = await prisma.soromaSupplier.findMany({
    where: { tenantId },
    select: { id: true, name: true, qualityScore: true, complianceStatus: true },
    orderBy: { qualityScore: "desc" },
    take: 10,
  })

  return {
    kpis: [
      {
        title: "Open CAPAs",
        value: String(openCapas),
        severity: openCapas > 0 ? ("critical" as const) : ("success" as const),
      },
      {
        title: "Failed QC",
        value: String(failedQc),
        severity: failedQc > 0 ? ("critical" as const) : ("success" as const),
      },
      {
        title: "Expiring Certifications",
        value: String(expiringCerts),
        severity: expiringCerts > 0 ? ("warning" as const) : ("success" as const),
      },
      {
        title: "Audit Calendar",
        value: String(audits.filter((a) => !a.completedAt).length),
        severity: "info" as const,
      },
    ],
    certificationRows: certifications.map((c) => ({
      id: c.id,
      standard: c.standard,
      certificateNo: c.certificateNo ?? "—",
      status: c.status,
      expiry: c.expiryDate?.toISOString().slice(0, 10) ?? "—",
    })),
    auditRows: audits.map((a) => ({
      id: a.id,
      auditType: a.auditType,
      scheduledAt: a.scheduledAt.toISOString().slice(0, 10),
      result: a.result ?? "Scheduled",
    })),
    supplierRows: supplierRankings.map((s) => ({
      id: s.id,
      supplier: s.name,
      qualityScore: s.qualityScore ? `${s.qualityScore}%` : "—",
      compliance: s.complianceStatus,
    })),
    qcRows: qcTests.map((q) => ({
      id: q.id,
      testType: q.testType,
      result: q.result,
      passed: q.passed ? "PASS" : "FAIL",
      testedAt: q.testedAt.toISOString().slice(0, 10),
    })),
    capaItems,
    recentEvents,
    alertsPermission: SOROMA_PERMISSIONS.COMPLIANCE_MANAGE,
  }
}
