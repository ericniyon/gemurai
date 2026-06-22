import { prisma } from "@/lib/database"
import { formatSoromaCompact, formatSoromaCurrency } from "./formatters"

export async function getTenantOverviewKpis(tenantId: string) {
  const [
    supplierCount,
    activePOs,
    activeBatches,
    openOrders,
    openAlerts,
    complianceScore,
  ] = await Promise.all([
    prisma.soromaSupplier.count({ where: { tenantId, status: "ACTIVE" } }),
    prisma.soromaPurchaseOrder.count({
      where: {
        tenantId,
        status: { in: ["APPROVED", "PARTIALLY_RECEIVED", "AWAITING_APPROVAL"] },
      },
    }),
    prisma.soromaProductionBatch.count({
      where: { tenantId, status: "IN_PROGRESS" },
    }),
    prisma.soromaOrder.count({
      where: { tenantId, status: { in: ["CONFIRMED", "IN_FULFILLMENT"] } },
    }),
    prisma.soromaAlert.count({
      where: { tenantId, status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    prisma.soromaTenant.findUnique({
      where: { id: tenantId },
      select: { complianceScore: true, currency: true },
    }),
  ])

  const revenue = await prisma.soromaFinanceRecord.aggregate({
    where: { tenantId, recordType: "REVENUE" },
    _sum: { amount: true },
  })

  const currency = complianceScore?.currency ?? "RWF"
  const rev = Number(revenue._sum.amount ?? 0)

  return {
    currency,
    kpis: [
      { title: "Active Suppliers", value: String(supplierCount), severity: "success" as const },
      { title: "Open POs", value: String(activePOs), severity: "warning" as const },
      { title: "Batches In Progress", value: String(activeBatches), severity: "info" as const },
      { title: "Orders In Fulfillment", value: String(openOrders), severity: "info" as const },
      {
        title: "Revenue (all time)",
        value: formatSoromaCompact(rev, currency),
        severity: "success" as const,
      },
      {
        title: "Compliance Score",
        value: complianceScore?.complianceScore
          ? `${complianceScore.complianceScore.toFixed(0)}%`
          : "—",
        severity: "success" as const,
      },
      { title: "Open Alerts", value: String(openAlerts), severity: openAlerts > 0 ? "warning" as const : "success" as const },
    ],
  }
}

export async function getPlatformOverviewKpis() {
  const [
    tenantCount,
    activeTenants,
    openAlerts,
    onboardingCount,
    totalOrders,
  ] = await Promise.all([
    prisma.soromaTenant.count(),
    prisma.soromaTenant.count({ where: { status: "ACTIVE" } }),
    prisma.soromaAlert.count({
      where: { scope: "PLATFORM", status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    prisma.soromaOnboardingApplication.count({
      where: { stage: { notIn: ["COMPLETED", "REJECTED"] } },
    }),
    prisma.soromaOrder.count(),
  ])

  const tradeValue = await prisma.soromaOrder.aggregate({ _sum: { amount: true } })

  return {
    kpis: [
      { title: "Agroprocessors", value: String(tenantCount), severity: "success" as const },
      { title: "Active Tenants", value: String(activeTenants), severity: "success" as const },
      { title: "Onboarding Pipeline", value: String(onboardingCount), severity: "warning" as const },
      { title: "Platform Orders", value: String(totalOrders), severity: "info" as const },
      {
        title: "Trade Value",
        value: formatSoromaCompact(Number(tradeValue._sum.amount ?? 0)),
        severity: "success" as const,
      },
      { title: "Open Alerts", value: String(openAlerts), severity: openAlerts > 0 ? "critical" as const : "success" as const },
    ],
  }
}

export async function getSuppliersDashboard(tenantId: string) {
  const suppliers = await prisma.soromaSupplier.findMany({
    where: { tenantId },
    take: 20,
    orderBy: { updatedAt: "desc" },
  })
  const pending = suppliers.filter((s) => s.status === "PENDING").length
  const active = suppliers.filter((s) => s.status === "ACTIVE").length
  return {
    kpis: [
      { title: "Total Suppliers", value: String(suppliers.length), severity: "success" as const },
      { title: "Active", value: String(active), severity: "success" as const },
      { title: "Pending Approval", value: String(pending), severity: "warning" as const },
      {
        title: "Avg Quality Score",
        value:
          suppliers.length > 0
            ? `${(
                suppliers.reduce((a, s) => a + (s.qualityScore ?? 0), 0) /
                suppliers.length
              ).toFixed(0)}%`
            : "—",
        severity: "info" as const,
      },
    ],
    rows: suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      commodity: s.commodity ?? "—",
      district: s.district ?? "—",
      qualityScore: s.qualityScore ? `${s.qualityScore}%` : "—",
      status: s.status,
    })),
  }
}

export async function getProcurementDashboard(tenantId: string) {
  const pos = await prisma.soromaPurchaseOrder.findMany({
    where: { tenantId },
    include: { supplier: { select: { name: true } } },
    take: 20,
    orderBy: { orderDate: "desc" },
  })
  const currency = (await prisma.soromaTenant.findUnique({ where: { id: tenantId } }))?.currency ?? "RWF"
  const totalValue = pos.reduce((a, p) => a + Number(p.amount), 0)
  return {
    currency,
    kpis: [
      { title: "Purchase Orders", value: String(pos.length), severity: "info" as const },
      {
        title: "PO Value",
        value: formatSoromaCurrency(totalValue, currency),
        severity: "success" as const,
      },
      {
        title: "Awaiting Approval",
        value: String(pos.filter((p) => p.status === "AWAITING_APPROVAL").length),
        severity: "warning" as const,
      },
      {
        title: "Approved",
        value: String(pos.filter((p) => p.status === "APPROVED").length),
        severity: "success" as const,
      },
    ],
    rows: pos.map((p) => ({
      id: p.id,
      poNumber: p.poNumber,
      supplier: p.supplier.name,
      commodity: p.commodity ?? "—",
      amount: formatSoromaCurrency(Number(p.amount), p.currency),
      status: p.status.replace(/_/g, " "),
      deliveryDate: p.deliveryDate?.toISOString().slice(0, 10) ?? "—",
    })),
  }
}

export async function getProductionDashboard(tenantId: string) {
  const batches = await prisma.soromaProductionBatch.findMany({
    where: { tenantId },
    include: { line: true },
    take: 20,
    orderBy: { updatedAt: "desc" },
  })
  return {
    kpis: [
      { title: "Active Batches", value: String(batches.filter((b) => b.status === "IN_PROGRESS").length), severity: "warning" as const },
      { title: "Completed", value: String(batches.filter((b) => b.status === "COMPLETED").length), severity: "success" as const },
      {
        title: "Avg Yield",
        value:
          batches.filter((b) => b.yieldPct).length > 0
            ? `${(
                batches.reduce((a, b) => a + (b.yieldPct ?? 0), 0) /
                batches.filter((b) => b.yieldPct).length
              ).toFixed(1)}%`
            : "—",
        severity: "success" as const,
      },
      { title: "Total Batches", value: String(batches.length), severity: "info" as const },
    ],
    rows: batches.map((b) => ({
      id: b.id,
      batchNumber: b.batchNumber,
      product: b.productName ?? "—",
      line: b.line?.name ?? "—",
      status: b.status.replace(/_/g, " "),
      yield: b.yieldPct ? `${b.yieldPct}%` : "—",
      output: b.outputQty ? String(b.outputQty) : "—",
    })),
  }
}

export async function getInventoryDashboard(tenantId: string) {
  const lots = await prisma.soromaStockLot.findMany({
    where: { tenantId },
    include: { warehouse: true },
    take: 30,
  })
  const lowStock = lots.filter((l) => l.availableQty < 10).length
  const expiring = lots.filter(
    (l) =>
      l.expiryDate &&
      l.expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length
  return {
    kpis: [
      { title: "SKU Lots", value: String(lots.length), severity: "info" as const },
      { title: "Low Stock Alerts", value: String(lowStock), severity: lowStock > 0 ? "warning" as const : "success" as const },
      { title: "Expiring Soon", value: String(expiring), severity: expiring > 0 ? "critical" as const : "success" as const },
      {
        title: "Available Units",
        value: String(lots.reduce((a, l) => a + l.availableQty, 0)),
        severity: "success" as const,
      },
    ],
    rows: lots.map((l) => ({
      id: l.id,
      sku: l.skuCode,
      name: l.skuName,
      category: l.category ?? "—",
      warehouse: l.warehouse?.name ?? "—",
      available: String(l.availableQty),
      status: l.status,
    })),
  }
}

export async function getOrdersDashboard(tenantId: string) {
  const orders = await prisma.soromaOrder.findMany({
    where: { tenantId },
    include: { buyer: true },
    take: 20,
    orderBy: { orderDate: "desc" },
  })
  const currency = (await prisma.soromaTenant.findUnique({ where: { id: tenantId } }))?.currency ?? "RWF"
  return {
    currency,
    kpis: [
      { title: "Total Orders", value: String(orders.length), severity: "info" as const },
      {
        title: "Confirmed Revenue",
        value: formatSoromaCurrency(
          orders
            .filter((o) => ["CONFIRMED", "DELIVERED", "SHIPPED"].includes(o.status))
            .reduce((a, o) => a + Number(o.amount), 0),
          currency
        ),
        severity: "success" as const,
      },
      { title: "Buyers", value: String(new Set(orders.map((o) => o.buyerId)).size), severity: "success" as const },
      {
        title: "In Fulfillment",
        value: String(orders.filter((o) => o.status === "IN_FULFILLMENT").length),
        severity: "warning" as const,
      },
    ],
    rows: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      buyer: o.buyer.name,
      amount: formatSoromaCurrency(Number(o.amount), o.currency),
      status: o.status,
      fulfillment: o.fulfillmentStatus ?? "—",
    })),
  }
}

export async function getLogisticsDashboard(tenantId: string) {
  const shipments = await prisma.soromaShipment.findMany({
    where: { tenantId },
    take: 20,
    orderBy: { createdAt: "desc" },
  })
  const onTime = shipments.filter((s) => s.status === "DELIVERED").length
  return {
    kpis: [
      { title: "Shipments", value: String(shipments.length), severity: "info" as const },
      { title: "In Transit", value: String(shipments.filter((s) => s.status === "IN_TRANSIT").length), severity: "warning" as const },
      { title: "Delivered", value: String(onTime), severity: "success" as const },
      {
        title: "Open Exceptions",
        value: String(
          await prisma.soromaLogisticsException.count({
            where: { shipment: { tenantId } },
          })
        ),
        severity: "critical" as const,
      },
    ],
    rows: shipments.map((s) => ({
      id: s.id,
      shipmentNumber: s.shipmentNumber,
      route: s.routeName ?? "—",
      status: s.status.replace(/_/g, " "),
      pod: s.podStatus ?? "—",
      dispatch: s.dispatchAt?.toISOString().slice(0, 10) ?? "—",
    })),
  }
}

export async function getTraceabilityDashboard(tenantId: string) {
  const passports = await prisma.soromaPassport.findMany({
    where: { tenantId },
    take: 20,
    orderBy: { createdAt: "desc" },
  })
  const scans = await prisma.soromaPassportScan.count({
    where: { passport: { tenantId } },
  })
  return {
    passportIds: passports.map((p) => p.id),
    kpis: [
      { title: "Passports Issued", value: String(passports.filter((p) => p.status === "ISSUED").length), severity: "success" as const },
      { title: "Draft", value: String(passports.filter((p) => p.status === "DRAFT").length), severity: "warning" as const },
      { title: "QR Scans", value: String(scans), severity: "info" as const },
      { title: "Total Passports", value: String(passports.length), severity: "info" as const },
    ],
    rows: passports.map((p) => ({
      id: p.id,
      passportNo: p.passportNo,
      status: p.status,
      version: String(p.version),
      issued: p.issuedAt?.toISOString().slice(0, 10) ?? "—",
      qrUrl: p.qrCode ?? "—",
    })),
  }
}

export async function getComplianceDashboard(tenantId: string) {
  const [certs, audits, capas] = await Promise.all([
    prisma.soromaCertification.findMany({ where: { tenantId }, take: 10 }),
    prisma.soromaAudit.findMany({ where: { tenantId }, take: 10 }),
    prisma.soromaCAPA.findMany({ where: { tenantId, status: "OPEN" }, take: 10 }),
  ])
  return {
    kpis: [
      { title: "Active Certificates", value: String(certs.filter((c) => c.status === "ACTIVE").length), severity: "success" as const },
      { title: "Expiring Soon", value: String(certs.filter((c) => c.expiryDate && c.expiryDate < new Date(Date.now() + 30 * 86400000)).length), severity: "warning" as const },
      { title: "Open CAPAs", value: String(capas.length), severity: capas.length > 0 ? "critical" as const : "success" as const },
      { title: "Audits Scheduled", value: String(audits.filter((a) => !a.completedAt).length), severity: "info" as const },
    ],
    rows: certs.map((c) => ({
      id: c.id,
      standard: c.standard,
      certificateNo: c.certificateNo ?? "—",
      status: c.status,
      expiry: c.expiryDate?.toISOString().slice(0, 10) ?? "—",
    })),
  }
}

export async function getIntegrationsDashboard(tenantId: string) {
  const connections = await prisma.soromaTenantConnection.findMany({
    where: { tenantId },
    include: { connector: true },
  })
  return {
    kpis: [
      { title: "Connected Channels", value: String(connections.filter((c) => c.status === "CONNECTED").length), severity: "success" as const },
      { title: "Pending", value: String(connections.filter((c) => c.status === "PENDING").length), severity: "warning" as const },
      { title: "Down", value: String(connections.filter((c) => c.status === "DOWN").length), severity: "critical" as const },
      { title: "Product Mappings", value: String(await prisma.soromaProductMapping.count({ where: { connection: { tenantId } } })), severity: "info" as const },
    ],
    rows: connections.map((c) => ({
      id: c.id,
      channel: c.connector.name,
      status: c.status,
      lastSync: c.lastSyncAt?.toISOString().slice(0, 16) ?? "—",
      successRate: c.successRate ? `${c.successRate}%` : "—",
    })),
  }
}

export async function getFinanceDashboard(tenantId: string) {
  const records = await prisma.soromaFinanceRecord.findMany({
    where: { tenantId },
    take: 50,
  })
  const currency = (await prisma.soromaTenant.findUnique({ where: { id: tenantId } }))?.currency ?? "RWF"
  const revenue = records.filter((r) => r.recordType === "REVENUE").reduce((a, r) => a + Number(r.amount), 0)
  const cogs = records.filter((r) => r.recordType === "COGS").reduce((a, r) => a + Number(r.amount), 0)
  const receivables = records.filter((r) => r.recordType === "RECEIVABLE" && !r.paidAt).reduce((a, r) => a + Number(r.amount), 0)
  const margin = revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0
  return {
    currency,
    kpis: [
      { title: "Revenue", value: formatSoromaCurrency(revenue, currency), severity: "success" as const },
      { title: "COGS", value: formatSoromaCurrency(cogs, currency), severity: "info" as const },
      { title: "Gross Margin", value: `${margin.toFixed(1)}%`, severity: "success" as const },
      { title: "Receivables Due", value: formatSoromaCurrency(receivables, currency), severity: receivables > 0 ? "warning" as const : "success" as const },
    ],
    rows: records.slice(0, 15).map((r) => ({
      id: r.id,
      type: r.recordType,
      amount: formatSoromaCurrency(Number(r.amount), r.currency),
      reference: r.reference ?? "—",
      due: r.dueDate?.toISOString().slice(0, 10) ?? "—",
    })),
  }
}

export async function getPlatformTenantsDashboard() {
  const tenants = await prisma.soromaTenant.findMany({ orderBy: { name: "asc" } })
  return {
    kpis: [
      { title: "Total Tenants", value: String(tenants.length), severity: "success" as const },
      { title: "Active", value: String(tenants.filter((t) => t.status === "ACTIVE").length), severity: "success" as const },
      { title: "Onboarding", value: String(tenants.filter((t) => t.status === "ONBOARDING").length), severity: "warning" as const },
      { title: "Suspended", value: String(tenants.filter((t) => t.status === "SUSPENDED").length), severity: "critical" as const },
    ],
    rows: tenants.map((t) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      valueChain: t.valueChain ?? "—",
      district: t.district ?? "—",
      compliance: t.complianceScore ? `${t.complianceScore}%` : "—",
    })),
  }
}

export async function getPlatformOnboardingDashboard() {
  const apps = await prisma.soromaOnboardingApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  })
  return {
    kpis: [
      { title: "Applications", value: String(apps.length), severity: "info" as const },
      { title: "Under Review", value: String(apps.filter((a) => a.stage === "UNDER_REVIEW").length), severity: "warning" as const },
      { title: "In Setup", value: String(apps.filter((a) => a.stage === "SETUP").length), severity: "warning" as const },
      { title: "Completed", value: String(apps.filter((a) => a.stage === "COMPLETED").length), severity: "success" as const },
    ],
    rows: apps.map((a) => ({
      id: a.id,
      orgName: a.orgName,
      valueChain: a.valueChain ?? "—",
      district: a.district ?? "—",
      stage: a.stage.replace(/_/g, " "),
      contact: a.contactEmail ?? "—",
    })),
  }
}

export async function getPlatformProgramTargetsDashboard() {
  const programs = await prisma.soromaProgram.findMany({
    include: { indicators: true, targets: true },
  })
  const program = programs[0]
  const indicators = program?.indicators ?? []
  const targets = program?.targets ?? []
  return {
    kpis: [
      { title: "Programs", value: String(programs.length), severity: "info" as const },
      { title: "Indicators", value: String(indicators.length), severity: "info" as const },
      {
        title: "Targets On Track",
        value: String(targets.filter((t) => t.status === "ON_TRACK").length),
        severity: "success" as const,
      },
      {
        title: "At Risk",
        value: String(targets.filter((t) => t.status === "AT_RISK").length),
        severity: "warning" as const,
      },
    ],
    rows: targets.map((t) => ({
      id: t.id,
      period: t.period,
      year: String(t.year),
      target: String(t.targetValue),
      actual: t.actualValue != null ? String(t.actualValue) : "—",
      status: t.status ?? "—",
    })),
  }
}

export async function getPlatformMEDashboard() {
  const indicators = await prisma.soromaProgramIndicator.findMany({ take: 10 })
  const pos = await prisma.soromaPurchaseOrder.count()
  const digitalPos = await prisma.soromaPurchaseOrder.count({
    where: { status: { not: "REQUESTED" } },
  })
  const adoption = pos > 0 ? (digitalPos / pos) * 100 : 0
  return {
    kpis: [
      { title: "POs Issued", value: String(pos), severity: "info" as const },
      { title: "Digital PO Adoption", value: `${adoption.toFixed(0)}%`, severity: "success" as const },
      { title: "Program Indicators", value: String(indicators.length), severity: "info" as const },
      {
        title: "Value to Farmers",
        value: formatSoromaCompact(
          Number(
            (
              await prisma.soromaFinanceRecord.aggregate({
                where: { recordType: "REVENUE" },
                _sum: { amount: true },
              })
            )._sum.amount ?? 0
          )
        ),
        severity: "success" as const,
      },
    ],
    rows: indicators.map((i) => ({
      id: i.id,
      name: i.name,
      code: i.code,
      unit: i.unit ?? "—",
      target: i.targetValue != null ? String(i.targetValue) : "—",
    })),
  }
}

export async function getPlatformEcosystemDashboard() {
  const tenants = await prisma.soromaTenant.count({ where: { status: "ACTIVE" } })
  const orders = await prisma.soromaOrder.count()
  const suppliers = await prisma.soromaSupplier.count()
  const trade = await prisma.soromaOrder.aggregate({ _sum: { amount: true } })
  return {
    kpis: [
      { title: "Active Agroprocessors", value: String(tenants), severity: "success" as const },
      { title: "Ecosystem Orders", value: String(orders), severity: "info" as const },
      { title: "Farmers/Suppliers Linked", value: String(suppliers), severity: "success" as const },
      {
        title: "Trade Value",
        value: formatSoromaCompact(Number(trade._sum.amount ?? 0)),
        severity: "success" as const,
      },
    ],
    rows: (
      await prisma.soromaTenant.findMany({
        take: 10,
        orderBy: { name: "asc" },
      })
    ).map((t) => ({
      id: t.id,
      name: t.name,
      region: t.region ?? "—",
      valueChain: t.valueChain ?? "—",
      status: t.status,
      compliance: t.complianceScore ? `${t.complianceScore}%` : "—",
    })),
  }
}

export async function getPlatformComplianceDashboard() {
  const tenants = await prisma.soromaTenant.findMany()
  const avg =
    tenants.filter((t) => t.complianceScore).length > 0
      ? tenants.reduce((a, t) => a + (t.complianceScore ?? 0), 0) /
        tenants.filter((t) => t.complianceScore).length
      : 0
  const atRisk = tenants.filter(
    (t) => t.complianceScore != null && t.complianceScore < 70
  ).length
  return {
    kpis: [
      { title: "Avg Compliance Score", value: `${avg.toFixed(0)}%`, severity: "success" as const },
      { title: "Compliant Tenants", value: String(tenants.filter((t) => (t.complianceScore ?? 0) >= 80).length), severity: "success" as const },
      { title: "At Risk", value: String(atRisk), severity: "warning" as const },
      { title: "Non-Compliant", value: String(tenants.filter((t) => (t.complianceScore ?? 100) < 50).length), severity: "critical" as const },
    ],
    rows: tenants.map((t) => ({
      id: t.id,
      name: t.name,
      score: t.complianceScore ? `${t.complianceScore}%` : "—",
      status: t.status,
      district: t.district ?? "—",
    })),
  }
}

export async function getPlatformIntegrationsDashboard() {
  const connectors = await prisma.soromaConnector.findMany()
  const connections = await prisma.soromaTenantConnection.findMany({
    include: { connector: true, tenant: true },
    take: 20,
  })
  return {
    kpis: [
      { title: "Connector Types", value: String(connectors.length), severity: "info" as const },
      { title: "Tenant Connections", value: String(connections.length), severity: "info" as const },
      { title: "Connected", value: String(connections.filter((c) => c.status === "CONNECTED").length), severity: "success" as const },
      { title: "Down", value: String(connections.filter((c) => c.status === "DOWN").length), severity: "critical" as const },
    ],
    rows: connections.map((c) => ({
      id: c.id,
      tenant: c.tenant.name,
      connector: c.connector.name,
      status: c.status,
      lastSync: c.lastSyncAt?.toISOString().slice(0, 16) ?? "—",
    })),
  }
}

export async function getPlatformIntegrationHealthDashboard() {
  const tenants = await prisma.soromaTenant.findMany({
    where: { status: "ACTIVE" },
    include: {
      connections: { include: { connector: true } },
    },
    take: 15,
  })
  return {
    kpis: [
      { title: "Active Tenants", value: String(tenants.length), severity: "success" as const },
      {
        title: "Healthy Syncs",
        value: String(
          tenants.flatMap((t) => t.connections).filter((c) => c.status === "CONNECTED").length
        ),
        severity: "success" as const,
      },
      {
        title: "Failed/Down",
        value: String(
          tenants.flatMap((t) => t.connections).filter((c) => c.status === "DOWN").length
        ),
        severity: "critical" as const,
      },
      { title: "Total Connections", value: String(tenants.flatMap((t) => t.connections).length), severity: "info" as const },
    ],
    rows: tenants.flatMap((t) =>
      t.connections.length > 0
        ? t.connections.map((c) => ({
            id: `${t.id}-${c.id}`,
            tenant: t.name,
            connector: c.connector.name,
            status: c.status,
            successRate: c.successRate ? `${c.successRate}%` : "—",
          }))
        : [{ id: t.id, tenant: t.name, connector: "—", status: "NO_CONNECTIONS", successRate: "—" }]
    ),
  }
}

export async function getPlatformAlertsDashboard() {
  const alerts = await prisma.soromaAlert.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { tenant: { select: { name: true } } },
  })
  return {
    kpis: [
      { title: "Open", value: String(alerts.filter((a) => a.status === "OPEN").length), severity: "critical" as const },
      { title: "In Progress", value: String(alerts.filter((a) => a.status === "IN_PROGRESS").length), severity: "warning" as const },
      { title: "Critical", value: String(alerts.filter((a) => a.severity === "CRITICAL").length), severity: "critical" as const },
      { title: "Total", value: String(alerts.length), severity: "info" as const },
    ],
    rows: alerts.map((a) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      severity: a.severity,
      status: a.status,
      tenantId: a.tenantId,
      metadata: a.metadata,
      tenant: a.tenant?.name ?? "Platform",
      tenantName: a.tenant?.name ?? null,
    })),
  }
}

export async function getTenantAlertsDashboard(tenantId: string) {
  const alerts = await prisma.soromaAlert.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return {
    kpis: [
      {
        title: "Open Alerts",
        value: String(alerts.filter((a) => a.status === "OPEN").length),
        severity: "critical" as const,
      },
      {
        title: "In Progress",
        value: String(alerts.filter((a) => a.status === "IN_PROGRESS").length),
        severity: "warning" as const,
      },
      {
        title: "Critical",
        value: String(alerts.filter((a) => a.severity === "CRITICAL").length),
        severity: "critical" as const,
      },
      { title: "Total", value: String(alerts.length), severity: "info" as const },
    ],
    rows: alerts.map((a) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      severity: a.severity,
      status: a.status,
      tenantId: a.tenantId,
      metadata: a.metadata,
    })),
  }
}

export async function getTenantRecentAlerts(tenantId: string, limit = 5) {
  const alerts = await prisma.soromaAlert.findMany({
    where: { tenantId, status: { in: ["OPEN", "IN_PROGRESS"] } },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
  return alerts.map((a) => ({
    id: a.id,
    title: a.title,
    severity: a.severity,
    status: a.status,
  }))
}

export async function getPlatformRecentAlerts(limit = 5) {
  const alerts = await prisma.soromaAlert.findMany({
    where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
  return alerts.map((a) => ({
    id: a.id,
    title: a.title,
    severity: a.severity,
    status: a.status,
  }))
}

function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function getTenantOverviewSnapshot(tenantId: string) {
  const [tenant, batches, orders, pos, supplierCount, passportCount, openAlerts, districts] =
    await Promise.all([
      prisma.soromaTenant.findUnique({
        where: { id: tenantId },
        select: {
          name: true,
          district: true,
          region: true,
          valueChain: true,
          currency: true,
          complianceScore: true,
          status: true,
        },
      }),
      prisma.soromaProductionBatch.findMany({
        where: { tenantId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, batchNumber: true, status: true, updatedAt: true, productName: true },
      }),
      prisma.soromaOrder.findMany({
        where: { tenantId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, orderNumber: true, status: true, updatedAt: true, amount: true },
      }),
      prisma.soromaPurchaseOrder.findMany({
        where: { tenantId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, poNumber: true, status: true, updatedAt: true, commodity: true },
      }),
      prisma.soromaSupplier.count({ where: { tenantId, status: "ACTIVE" } }),
      prisma.soromaPassport.count({ where: { tenantId } }),
      prisma.soromaAlert.count({
        where: { tenantId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      prisma.soromaSupplier.groupBy({
        by: ["district"],
        where: { tenantId },
        _count: { id: true },
      }),
    ])

  type ActivityRow = {
    id: string
    type: string
    ref: string
    detail: string
    status: string
    updatedAt: string
    updatedLabel: string
  }

  const formatActivityDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-RW", { month: "short", day: "numeric" })

  const activity: ActivityRow[] = [
    ...batches.map((b) => ({
      id: b.id,
      type: "Production",
      ref: b.batchNumber,
      detail: b.productName ?? "Batch",
      status: b.status,
      updatedAt: b.updatedAt.toISOString(),
      updatedLabel: formatActivityDate(b.updatedAt.toISOString()),
    })),
    ...orders.map((o) => ({
      id: o.id,
      type: "Order",
      ref: o.orderNumber,
      detail: "Buyer order",
      status: o.status,
      updatedAt: o.updatedAt.toISOString(),
      updatedLabel: formatActivityDate(o.updatedAt.toISOString()),
    })),
    ...pos.map((p) => ({
      id: p.id,
      type: "Procurement",
      ref: p.poNumber,
      detail: p.commodity ?? "Purchase order",
      status: p.status,
      updatedAt: p.updatedAt.toISOString(),
      updatedLabel: formatActivityDate(p.updatedAt.toISOString()),
    })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8)

  const mapPoints = districts
    .filter((d) => d.district)
    .map((d) => ({
      id: d.district!,
      label: d.district!,
      value: d._count.id,
    }))

  return {
    tenant,
    activity,
    mapPoints,
    counts: {
      activeSuppliers: supplierCount,
      passports: passportCount,
      openAlerts,
    },
  }
}

export async function getTenantOverviewCharts(tenantId: string) {
  const [poGroups, orderGroups, suppliersByType] = await Promise.all([
    prisma.soromaPurchaseOrder.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: { id: true },
    }),
    prisma.soromaOrder.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: { id: true },
    }),
    prisma.soromaSupplier.groupBy({
      by: ["type"],
      where: { tenantId },
      _count: { id: true },
    }),
  ])

  return [
    {
      title: "Purchase Order Pipeline",
      description: "POs by workflow state",
      type: "bar" as const,
      data: poGroups.map((g) => ({
        name: formatStatusLabel(g.status),
        value: g._count.id,
      })),
    },
    {
      title: "Order Status",
      description: "Buyer orders by fulfillment state",
      type: "donut" as const,
      data: orderGroups.map((g) => ({
        name: formatStatusLabel(g.status),
        value: g._count.id,
      })),
    },
    {
      title: "Supplier Segmentation",
      description: "Network by supplier type",
      type: "donut" as const,
      data: suppliersByType.map((g) => ({
        name: g.type ?? "Other",
        value: g._count.id,
      })),
    },
  ].filter((c) => c.data.length > 0)
}

export async function getPlatformOverviewCharts() {
  const [tenantGroups, onboardingGroups, connections] = await Promise.all([
    prisma.soromaTenant.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.soromaOnboardingApplication.groupBy({
      by: ["stage"],
      _count: { id: true },
    }),
    prisma.soromaTenantConnection.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ])

  return [
    {
      title: "Tenant Status",
      description: "Agroprocessors by lifecycle state",
      type: "bar" as const,
      data: tenantGroups.map((g) => ({
        name: formatStatusLabel(g.status),
        value: g._count.id,
      })),
    },
    {
      title: "Onboarding Pipeline",
      description: "Applications by stage",
      type: "donut" as const,
      data: onboardingGroups.map((g) => ({
        name: formatStatusLabel(g.stage),
        value: g._count.id,
      })),
    },
    {
      title: "Integration Health",
      description: "Connections ecosystem-wide",
      type: "donut" as const,
      data: connections.map((g) => ({
        name: formatStatusLabel(g.status),
        value: g._count.id,
      })),
    },
  ].filter((c) => c.data.length > 0)
}
