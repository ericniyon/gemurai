import { prisma } from "@/lib/database"
import { formatSoromaCompact, formatSoromaPercent } from "./formatters"

export type SoromaDateScope = "7d" | "30d" | "90d" | "ytd"

export type KpiResult = {
  key: string
  title: string
  value: string
  severity: "success" | "warning" | "critical" | "info"
  drilldownKey: string
}

function getStartDate(scope: SoromaDateScope) {
  const now = new Date()
  if (scope === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  if (scope === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  if (scope === "90d") return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  return new Date(now.getFullYear(), 0, 1)
}

function severityFromPercent(value: number) {
  if (value >= 80) return "success" as const
  if (value >= 60) return "warning" as const
  return "critical" as const
}

function sanitizeScope(input: string | null | undefined): SoromaDateScope {
  if (input === "7d" || input === "30d" || input === "90d" || input === "ytd") {
    return input
  }
  return "30d"
}

export async function getTenantKpis(
  tenantId: string,
  scopeInput?: string | null
): Promise<{ scope: SoromaDateScope; kpis: KpiResult[] }> {
  const scope = sanitizeScope(scopeInput)
  const startDate = getStartDate(scope)

  const [revenueAgg, cogsAgg, batches, stockLots, suppliers, passports, orders, poTotal, poDigital, onTimeShipments, totalShipments, tenant] =
    await Promise.all([
      prisma.soromaFinanceRecord.aggregate({
        where: { tenantId, recordType: "REVENUE", createdAt: { gte: startDate } },
        _sum: { amount: true },
      }),
      prisma.soromaFinanceRecord.aggregate({
        where: { tenantId, recordType: "COGS", createdAt: { gte: startDate } },
        _sum: { amount: true },
      }),
      prisma.soromaProductionBatch.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate },
          expectedQty: { not: null },
          outputQty: { not: null },
        },
        select: { expectedQty: true, outputQty: true, yieldPct: true },
      }),
      prisma.soromaStockLot.findMany({
        where: { tenantId, createdAt: { gte: startDate } },
        select: { quantity: true, availableQty: true },
      }),
      prisma.soromaSupplier.findMany({
        where: { tenantId, updatedAt: { gte: startDate } },
        select: { qualityScore: true, status: true },
      }),
      prisma.soromaPassport.count({ where: { tenantId, createdAt: { gte: startDate } } }),
      prisma.soromaOrder.count({ where: { tenantId, orderDate: { gte: startDate } } }),
      prisma.soromaPurchaseOrder.count({ where: { tenantId, orderDate: { gte: startDate } } }),
      prisma.soromaPurchaseOrder.count({
        where: {
          tenantId,
          orderDate: { gte: startDate },
          status: { not: "REQUESTED" },
        },
      }),
      prisma.soromaShipment.count({
        where: {
          tenantId,
          dispatchAt: { gte: startDate },
          deliveredAt: { not: null },
        },
      }),
      prisma.soromaShipment.count({
        where: {
          tenantId,
          dispatchAt: { gte: startDate },
        },
      }),
      prisma.soromaTenant.findUnique({
        where: { id: tenantId },
        select: { complianceScore: true },
      }),
    ])

  const revenue = Number(revenueAgg._sum.amount ?? 0)
  const cogs = Number(cogsAgg._sum.amount ?? 0)
  const grossMargin = revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0

  const expectedQty = batches.reduce((a, b) => a + Number(b.expectedQty ?? 0), 0)
  const outputQty = batches.reduce((a, b) => a + Number(b.outputQty ?? 0), 0)
  const yieldEfficiency = expectedQty > 0 ? (outputQty / expectedQty) * 100 : 0

  const stockTotal = stockLots.reduce((a, s) => a + Number(s.quantity ?? 0), 0)
  const stockAvailable = stockLots.reduce((a, s) => a + Number(s.availableQty ?? 0), 0)
  const stockAccuracy = stockTotal > 0 ? (stockAvailable / stockTotal) * 100 : 0

  const activeSuppliers = suppliers.filter((s) => s.status === "ACTIVE")
  const supplierReliability =
    activeSuppliers.length > 0
      ? activeSuppliers.reduce((a, s) => a + Number(s.qualityScore ?? 0), 0) /
        activeSuppliers.length
      : 0

  const traceabilityCoverage = orders > 0 ? (passports / orders) * 100 : 0
  const onTimeDelivery = totalShipments > 0 ? (onTimeShipments / totalShipments) * 100 : 0
  const digitalPoAdoption = poTotal > 0 ? (poDigital / poTotal) * 100 : 0
  const complianceScore = Number(tenant?.complianceScore ?? 0)

  const kpis: KpiResult[] = [
    {
      key: "gross_margin",
      title: "Gross Margin",
      value: formatSoromaPercent(grossMargin, 1),
      severity: severityFromPercent(grossMargin),
      drilldownKey: "gross_margin",
    },
    {
      key: "yield_efficiency",
      title: "Yield Efficiency",
      value: formatSoromaPercent(yieldEfficiency, 1),
      severity: severityFromPercent(yieldEfficiency),
      drilldownKey: "yield_efficiency",
    },
    {
      key: "stock_accuracy",
      title: "Stock Accuracy",
      value: formatSoromaPercent(stockAccuracy, 1),
      severity: severityFromPercent(stockAccuracy),
      drilldownKey: "stock_accuracy",
    },
    {
      key: "supplier_reliability",
      title: "Supplier Reliability",
      value: formatSoromaPercent(supplierReliability, 1),
      severity: severityFromPercent(supplierReliability),
      drilldownKey: "supplier_reliability",
    },
    {
      key: "traceability_coverage",
      title: "Traceability Coverage",
      value: formatSoromaPercent(traceabilityCoverage, 1),
      severity: severityFromPercent(traceabilityCoverage),
      drilldownKey: "traceability_coverage",
    },
    {
      key: "on_time_delivery",
      title: "On-time Delivery",
      value: formatSoromaPercent(onTimeDelivery, 1),
      severity: severityFromPercent(onTimeDelivery),
      drilldownKey: "on_time_delivery",
    },
    {
      key: "digital_po_adoption",
      title: "Digital PO Adoption",
      value: formatSoromaPercent(digitalPoAdoption, 1),
      severity: severityFromPercent(digitalPoAdoption),
      drilldownKey: "digital_po_adoption",
    },
    {
      key: "compliance_score",
      title: "Compliance Score",
      value: formatSoromaPercent(complianceScore, 1),
      severity: severityFromPercent(complianceScore),
      drilldownKey: "compliance_score",
    },
  ]

  return { scope, kpis }
}

export async function getPlatformKpis(
  scopeInput?: string | null
): Promise<{ scope: SoromaDateScope; kpis: KpiResult[] }> {
  const scope = sanitizeScope(scopeInput)
  const startDate = getStartDate(scope)

  const [tradeValueAgg, ordersCount, activeTenants, onboardingCount, indicatorsCount] =
    await Promise.all([
      prisma.soromaOrder.aggregate({
        where: { orderDate: { gte: startDate } },
        _sum: { amount: true },
      }),
      prisma.soromaOrder.count({ where: { orderDate: { gte: startDate } } }),
      prisma.soromaTenant.count({ where: { status: "ACTIVE" } }),
      prisma.soromaOnboardingApplication.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.soromaIndicatorValue.count({ where: { recordedAt: { gte: startDate } } }),
    ])

  const tradeValue = Number(tradeValueAgg._sum.amount ?? 0)
  const avgTradePerOrder = ordersCount > 0 ? tradeValue / ordersCount : 0

  const kpis: KpiResult[] = [
    {
      key: "ecosystem_trade_value",
      title: "Ecosystem Trade Value",
      value: formatSoromaCompact(tradeValue),
      severity: "success",
      drilldownKey: "ecosystem_trade_value",
    },
    {
      key: "value_chain_analytics",
      title: "Avg Trade / Order",
      value: formatSoromaCompact(avgTradePerOrder),
      severity: "info",
      drilldownKey: "value_chain_analytics",
    },
    {
      key: "onboarding_metrics",
      title: "Onboarding Pipeline",
      value: String(onboardingCount),
      severity: onboardingCount > 0 ? "warning" : "success",
      drilldownKey: "onboarding_metrics",
    },
    {
      key: "me_analytics",
      title: "M&E Data Points",
      value: String(indicatorsCount),
      severity: "info",
      drilldownKey: "me_analytics",
    },
    {
      key: "active_tenants",
      title: "Active Tenants",
      value: String(activeTenants),
      severity: "success",
      drilldownKey: "active_tenants",
    },
  ]
  return { scope, kpis }
}

export async function getTenantKpiDrilldown(
  tenantId: string,
  kpi: string,
  scopeInput?: string | null
) {
  const scope = sanitizeScope(scopeInput)
  const startDate = getStartDate(scope)

  if (kpi === "gross_margin") {
    const rows = await prisma.soromaFinanceRecord.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate },
        recordType: { in: ["REVENUE", "COGS"] },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return {
      scope,
      columns: ["recordType", "amount", "currency", "reference", "createdAt"],
      rows,
    }
  }

  if (kpi === "yield_efficiency") {
    const rows = await prisma.soromaProductionBatch.findMany({
      where: { tenantId, createdAt: { gte: startDate } },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return {
      scope,
      columns: ["batchNumber", "status", "expectedQty", "outputQty", "yieldPct"],
      rows,
    }
  }

  if (kpi === "traceability_coverage") {
    const [orders, passports] = await Promise.all([
      prisma.soromaOrder.findMany({
        where: { tenantId, orderDate: { gte: startDate } },
        take: 100,
        orderBy: { orderDate: "desc" },
      }),
      prisma.soromaPassport.findMany({
        where: { tenantId, createdAt: { gte: startDate } },
        take: 100,
        orderBy: { createdAt: "desc" },
      }),
    ])
    return {
      scope,
      columns: ["orders", "passports"],
      rows: [
        { orders: orders.length, passports: passports.length },
        ...passports.map((p) => ({ passportNo: p.passportNo, status: p.status })),
      ],
    }
  }

  const rows = await prisma.soromaAlert.findMany({
    where: { tenantId, createdAt: { gte: startDate } },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  return {
    scope,
    columns: ["title", "type", "severity", "status", "createdAt"],
    rows,
  }
}

export async function getPlatformKpiDrilldown(kpi: string, scopeInput?: string | null) {
  const scope = sanitizeScope(scopeInput)
  const startDate = getStartDate(scope)

  if (kpi === "ecosystem_trade_value" || kpi === "value_chain_analytics") {
    const rows = await prisma.soromaOrder.findMany({
      where: { orderDate: { gte: startDate } },
      include: { tenant: { select: { name: true } } },
      take: 200,
      orderBy: { orderDate: "desc" },
    })
    return {
      scope,
      columns: ["tenant", "orderNumber", "amount", "currency", "status", "orderDate"],
      rows: rows.map((r) => ({
        tenant: r.tenant.name,
        orderNumber: r.orderNumber,
        amount: Number(r.amount),
        currency: r.currency,
        status: r.status,
        orderDate: r.orderDate,
      })),
    }
  }

  if (kpi === "onboarding_metrics") {
    const rows = await prisma.soromaOnboardingApplication.findMany({
      where: { createdAt: { gte: startDate } },
      take: 200,
      orderBy: { createdAt: "desc" },
    })
    return {
      scope,
      columns: ["orgName", "valueChain", "district", "stage", "createdAt"],
      rows,
    }
  }

  if (kpi === "me_analytics") {
    const rows = await prisma.soromaIndicatorValue.findMany({
      where: { recordedAt: { gte: startDate } },
      include: { indicator: true },
      take: 200,
      orderBy: { recordedAt: "desc" },
    })
    return {
      scope,
      columns: ["indicator", "period", "value", "recordedAt"],
      rows: rows.map((r) => ({
        indicator: r.indicator.name,
        period: r.period,
        value: r.value,
        recordedAt: r.recordedAt,
      })),
    }
  }

  const rows = await prisma.soromaTenant.findMany({
    where: { updatedAt: { gte: startDate } },
    orderBy: { name: "asc" },
  })
  return {
    scope,
    columns: ["name", "status", "valueChain", "region", "complianceScore"],
    rows,
  }
}
