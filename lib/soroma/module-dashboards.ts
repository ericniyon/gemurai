import { prisma } from "@/lib/database"
import { formatSoromaCurrency } from "./formatters"

async function tenantCurrency(tenantId: string) {
  return (
    (await prisma.soromaTenant.findUnique({ where: { id: tenantId }, select: { currency: true } }))
      ?.currency ?? "RWF"
  )
}

export async function getSuppliersDashboardFull(tenantId: string) {
  const [suppliers, issues, pos, allPos, commodities, districts] = await Promise.all([
    prisma.soromaSupplier.findMany({ where: { tenantId }, orderBy: { updatedAt: "desc" } }),
    prisma.soromaSupplierIssue.findMany({
      where: { tenantId },
      include: { supplier: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.soromaPurchaseOrder.findMany({
      where: { tenantId, deliveryDate: { gte: new Date() } },
      include: { supplier: { select: { name: true } } },
      orderBy: { deliveryDate: "asc" },
      take: 10,
    }),
    prisma.soromaPurchaseOrder.findMany({
      where: { tenantId },
      select: { status: true },
    }),
    prisma.soromaSupplier.groupBy({ by: ["commodity"], where: { tenantId }, _count: { id: true } }),
    prisma.soromaSupplier.groupBy({ by: ["type"], where: { tenantId }, _count: { id: true } }),
  ])

  const pending = suppliers.filter((s) => s.status === "PENDING").length
  const active = suppliers.filter((s) => s.status === "ACTIVE").length
  const cooperatives = suppliers.filter(
    (s) => s.type === "COOPERATIVE" || s.type === "SMALLHOLDER_GROUP"
  ).length
  const avgQuality =
    suppliers.length > 0
      ? suppliers.reduce((a, s) => a + (s.qualityScore ?? 0), 0) / suppliers.length
      : 0
  const deliveryRate =
    allPos.length > 0
      ? Math.round(
          (allPos.filter((p) =>
            ["APPROVED", "CLOSED", "PARTIALLY_RECEIVED"].includes(p.status)
          ).length /
            allPos.length) *
            100
        )
      : 0
  const scorecards = [...suppliers]
    .filter((s) => s.qualityScore != null)
    .sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0))
    .slice(0, 8)

  return {
    kpis: [
      { title: "Total Suppliers", value: String(suppliers.length), severity: "success" as const },
      { title: "Active Suppliers", value: String(active), severity: "success" as const },
      { title: "Cooperatives Linked", value: String(cooperatives), severity: "info" as const },
      {
        title: "Supplier Reliability",
        value: avgQuality > 0 ? `${avgQuality.toFixed(0)}%` : "—",
        severity: "success" as const,
      },
      {
        title: "Pending Approvals",
        value: String(pending),
        severity: pending > 0 ? ("warning" as const) : ("success" as const),
      },
      {
        title: "Delivery Completion",
        value: `${deliveryRate}%`,
        severity: deliveryRate >= 85 ? ("success" as const) : ("warning" as const),
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
    segmentation: districts.map((d) => ({
      name: d.type ?? "Other",
      value: d._count.id,
    })),
    commodityChart: commodities
      .filter((c) => c.commodity)
      .map((c) => ({ name: c.commodity!, value: c._count.id })),
    scorecards: scorecards.map((s) => ({
      id: s.id,
      name: s.name,
      qualityScore: s.qualityScore ? `${s.qualityScore}%` : "—",
      compliance: s.complianceStatus,
      status: s.status,
    })),
    recentIssues: issues.map((i) => ({
      id: i.id,
      supplier: i.supplier.name,
      title: i.title,
      severity: i.severity,
      status: i.status,
    })),
    upcomingDeliveries: pos.map((p) => ({
      id: p.id,
      poNumber: p.poNumber,
      supplier: p.supplier.name,
      deliveryDate: p.deliveryDate?.toISOString().slice(0, 10) ?? "—",
      status: p.status,
    })),
    mapPoints: suppliers
      .filter((s) => s.gpsLatitude && s.gpsLongitude)
      .map((s) => ({
        id: s.id,
        label: s.name,
        lat: s.gpsLatitude!,
        lng: s.gpsLongitude!,
        value: 1,
      })),
    filterCommodities: [...new Set(suppliers.map((s) => s.commodity).filter(Boolean))] as string[],
    filterDistricts: [...new Set(suppliers.map((s) => s.district).filter(Boolean))] as string[],
  }
}

export async function getProcurementDashboardFull(tenantId: string) {
  const currency = await tenantCurrency(tenantId)
  const [pos, lowStock, suppliers, alerts] = await Promise.all([
    prisma.soromaPurchaseOrder.findMany({
      where: { tenantId },
      include: { supplier: { select: { name: true } }, lines: true },
      orderBy: { orderDate: "desc" },
    }),
    prisma.soromaStockLot.findMany({
      where: { tenantId, availableQty: { lt: 10 } },
      take: 8,
    }),
    prisma.soromaSupplier.findMany({
      where: { tenantId },
      include: { _count: { select: { purchaseOrders: true } } },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.soromaAlert.findMany({
      where: { tenantId },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ])

  const commodityGroups = pos.reduce<Record<string, number>>((acc, p) => {
    const c = p.commodity ?? "Other"
    acc[c] = (acc[c] ?? 0) + 1
    return acc
  }, {})

  const pipeline = ["REQUESTED", "RFQ_SENT", "AWAITING_APPROVAL", "APPROVED", "PARTIALLY_RECEIVED", "CLOSED"].map(
    (status) => ({
      name: status.replace(/_/g, " "),
      value: pos.filter((p) => p.status === status).length,
    })
  )

  const totalValue = pos.reduce((a, p) => a + Number(p.amount), 0)
  const awaiting = pos.filter((p) => p.status === "AWAITING_APPROVAL").length
  const openRfq = pos.filter((p) => p.status === "RFQ_SENT").length
  const onTime =
    pos.filter((p) => p.deliveryDate && p.deliveryDate >= new Date()).length > 0
      ? Math.round(
          (pos.filter(
            (p) =>
              p.deliveryDate &&
              p.deliveryDate >= new Date() &&
              ["APPROVED", "CLOSED", "PARTIALLY_RECEIVED"].includes(p.status)
          ).length /
            pos.filter((p) => p.deliveryDate && p.deliveryDate >= new Date()).length) *
            100
        )
      : 0

  return {
    currency,
    kpis: [
      { title: "Purchase Orders", value: String(pos.length), severity: "info" as const },
      { title: "PO Value (RWF)", value: formatSoromaCurrency(totalValue, currency), severity: "success" as const },
      {
        title: "Awaiting Approval",
        value: String(awaiting),
        severity: awaiting > 0 ? ("warning" as const) : ("success" as const),
      },
      { title: "Open RFQs", value: String(openRfq), severity: "info" as const },
      {
        title: "On-Time Delivery",
        value: `${onTime}%`,
        severity: onTime >= 80 ? ("success" as const) : ("warning" as const),
      },
      {
        title: "Low Stock Alerts",
        value: String(lowStock.length),
        severity: lowStock.length > 0 ? ("warning" as const) : ("success" as const),
      },
    ],
    rows: pos.slice(0, 20).map((p) => ({
      id: p.id,
      poNumber: p.poNumber,
      supplier: p.supplier.name,
      commodity: p.commodity ?? "—",
      amount: formatSoromaCurrency(Number(p.amount), p.currency),
      status: p.status.replace(/_/g, " "),
      deliveryDate: p.deliveryDate?.toISOString().slice(0, 10) ?? "—",
    })),
    pipelineChart: pipeline,
    commodityChart: Object.entries(commodityGroups).map(([name, value]) => ({ name, value })),
    deliverySchedule: pos
      .filter((p) => p.deliveryDate)
      .slice(0, 8)
      .map((p) => ({
        poNumber: p.poNumber,
        supplier: p.supplier.name,
        deliveryDate: p.deliveryDate!.toISOString().slice(0, 10),
        status: p.status,
      })),
    lowStock: lowStock.map((l) => ({
      sku: l.skuCode,
      name: l.skuName,
      available: String(l.availableQty),
    })),
    topSuppliers: suppliers
      .sort((a, b) => b._count.purchaseOrders - a._count.purchaseOrders)
      .map((s) => ({
        name: s.name,
        orders: String(s._count.purchaseOrders),
        quality: s.qualityScore ? `${s.qualityScore}%` : "—",
      })),
    alerts: alerts.map((a) => ({
      id: a.id,
      title: a.title,
      severity: a.severity,
      status: a.status,
    })),
    supplierOptions: suppliers.map((s) => ({ id: s.id, name: s.name })),
  }
}

export async function getProductionDashboardFull(tenantId: string) {
  const [batches, lines, downtime, qcExceptions] = await Promise.all([
    prisma.soromaProductionBatch.findMany({
      where: { tenantId },
      include: { line: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.soromaProductionLine.findMany({ where: { tenantId } }),
    prisma.soromaDowntimeEvent.findMany({
      where: { batch: { tenantId } },
      include: { batch: { select: { batchNumber: true } } },
      orderBy: { startedAt: "desc" },
      take: 10,
    }),
    prisma.soromaQCException.findMany({
      where: { batch: { tenantId } },
      include: { batch: { select: { batchNumber: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  const activeStatuses = ["STARTED", "IN_PROGRESS", "QC_REVIEW"]
  const yieldTrend = batches
    .filter((b) => b.yieldPct != null)
    .slice(0, 12)
    .map((b) => ({ name: b.batchNumber, value: b.yieldPct! }))

  return {
    kpis: [
      {
        title: "Active Batches",
        value: String(batches.filter((b) => activeStatuses.includes(b.status)).length),
        severity: "warning" as const,
      },
      { title: "Completed", value: String(batches.filter((b) => b.status === "COMPLETED").length), severity: "success" as const },
      {
        title: "Avg Yield",
        value:
          batches.filter((b) => b.yieldPct).length > 0
            ? `${(batches.reduce((a, b) => a + (b.yieldPct ?? 0), 0) / batches.filter((b) => b.yieldPct).length).toFixed(1)}%`
            : "—",
        severity: "success" as const,
      },
      { title: "Total Batches", value: String(batches.length), severity: "info" as const },
    ],
    rows: batches.slice(0, 20).map((b) => ({
      id: b.id,
      batchNumber: b.batchNumber,
      product: b.productName ?? "—",
      line: b.line?.name ?? "—",
      status: b.status.replace(/_/g, " "),
      yield: b.yieldPct ? `${b.yieldPct}%` : "—",
      output: b.outputQty ? String(b.outputQty) : "—",
    })),
    lineStatus: lines.map((l) => ({
      name: l.name,
      status: l.status ?? "ACTIVE",
      batches: String(batches.filter((b) => b.lineId === l.id).length),
    })),
    yieldTrend,
    outputChart: batches
      .filter((b) => b.outputQty)
      .slice(0, 8)
      .map((b) => ({ name: b.batchNumber, value: b.outputQty! })),
    downtime: downtime.map((d) => ({
      batch: d.batch?.batchNumber ?? "—",
      reason: d.reason,
      minutes: String(d.minutes ?? 0),
    })),
    qcExceptions: qcExceptions.map((q) => ({
      batch: q.batch?.batchNumber ?? "—",
      type: q.testType,
      severity: q.severity,
    })),
    lineOptions: lines.map((l) => ({ id: l.id, name: l.name })),
    batchOptions: batches.filter((b) => activeStatuses.includes(b.status)).map((b) => ({
      id: b.id,
      batchNumber: b.batchNumber,
    })),
  }
}

export async function getInventoryDashboardFull(tenantId: string) {
  const [lots, movements, warehouses] = await Promise.all([
    prisma.soromaStockLot.findMany({
      where: { tenantId },
      include: { warehouse: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.soromaStockMovement.findMany({
      where: { tenantId },
      include: { stockLot: { select: { skuCode: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.soromaWarehouse.findMany({ where: { tenantId } }),
  ])

  const lowStock = lots.filter((l) => l.availableQty < 10)
  const expiring = lots.filter(
    (l) => l.expiryDate && l.expiryDate < new Date(Date.now() + 30 * 86400000)
  )
  const warehouseHeatmap = warehouses.map((w) => ({
    name: w.name,
    value: lots.filter((l) => l.warehouseId === w.id).reduce((a, l) => a + l.quantity, 0),
  }))

  const movementTrend = movements.reduce<Record<string, number>>((acc, m) => {
    const day = m.createdAt.toISOString().slice(0, 10)
    acc[day] = (acc[day] ?? 0) + m.quantity
    return acc
  }, {})

  return {
    kpis: [
      { title: "SKU Lots", value: String(lots.length), severity: "info" as const },
      { title: "Low Stock Alerts", value: String(lowStock.length), severity: lowStock.length > 0 ? "warning" as const : "success" as const },
      { title: "Expiring Soon", value: String(expiring.length), severity: expiring.length > 0 ? "critical" as const : "success" as const },
      { title: "Available Units", value: String(lots.reduce((a, l) => a + l.availableQty, 0)), severity: "success" as const },
    ],
    rows: lots.map((l) => ({
      id: l.id,
      sku: l.skuCode,
      name: l.skuName,
      category: l.category ?? "—",
      warehouse: l.warehouse?.name ?? "—",
      available: String(l.availableQty),
      committed: String(l.committedQty),
      status: l.status,
    })),
    warehouseHeatmap,
    movementTrend: Object.entries(movementTrend)
      .slice(-14)
      .map(([name, value]) => ({ name, value })),
    expiryTracking: expiring.slice(0, 8).map((l) => ({
      sku: l.skuCode,
      name: l.skuName,
      expiry: l.expiryDate!.toISOString().slice(0, 10),
      available: String(l.availableQty),
    })),
    lowStock: lowStock.slice(0, 8).map((l) => ({
      sku: l.skuCode,
      name: l.skuName,
      available: String(l.availableQty),
    })),
    dispatchReady: lots
      .filter((l) => l.category === "FINISHED" && l.availableQty > 0)
      .slice(0, 8)
      .map((l) => ({
        sku: l.skuCode,
        available: String(l.availableQty),
        warehouse: l.warehouse?.name ?? "—",
      })),
    lotOptions: lots.map((l) => ({ id: l.id, label: `${l.skuCode} (${l.availableQty})` })),
    warehouseOptions: warehouses.map((w) => ({ id: w.id, name: w.name })),
  }
}

export async function getOrdersDashboardFull(tenantId: string) {
  const currency = await tenantCurrency(tenantId)
  const [orders, buyers, issues] = await Promise.all([
    prisma.soromaOrder.findMany({
      where: { tenantId },
      include: { buyer: true, lines: true },
      orderBy: { orderDate: "desc" },
    }),
    prisma.soromaBuyer.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.soromaCustomerIssue.findMany({
      where: { buyer: { tenantId } },
      include: { buyer: { select: { name: true } } },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ])

  const pipeline = ["DRAFT", "QUOTED", "CONFIRMED", "IN_FULFILLMENT", "SHIPPED", "DELIVERED"].map(
    (status) => ({
      name: status.replace(/_/g, " "),
      value: orders.filter((o) => o.status === status).length,
    })
  )

  const skuCounts = orders.flatMap((o) => o.lines).reduce<Record<string, number>>((acc, l) => {
    acc[l.skuCode] = (acc[l.skuCode] ?? 0) + l.quantity
    return acc
  }, {})

  return {
    currency,
    kpis: [
      { title: "Total Orders", value: String(orders.length), severity: "info" as const },
      {
        title: "Confirmed Revenue",
        value: formatSoromaCurrency(
          orders.filter((o) => ["CONFIRMED", "DELIVERED", "SHIPPED"].includes(o.status)).reduce((a, o) => a + Number(o.amount), 0),
          currency
        ),
        severity: "success" as const,
      },
      { title: "Buyers", value: String(buyers.length), severity: "success" as const },
      { title: "In Fulfillment", value: String(orders.filter((o) => o.status === "IN_FULFILLMENT").length), severity: "warning" as const },
    ],
    rows: orders.slice(0, 20).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      buyer: o.buyer.name,
      amount: formatSoromaCurrency(Number(o.amount), o.currency),
      status: o.status,
      fulfillment: o.fulfillmentStatus ?? "—",
    })),
    buyerDirectory: buyers.map((b) => ({
      id: b.id,
      name: b.name,
      type: b.segment ?? "—",
      district: b.district ?? "—",
      contract: b.contractStatus ?? "—",
    })),
    pipelineChart: pipeline,
    revenueChart: orders
      .filter((o) => ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(o.status))
      .slice(0, 8)
      .map((o) => ({ name: o.orderNumber, value: Number(o.amount) })),
    topSkus: Object.entries(skuCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value })),
    customerIssues: issues.map((i) => ({
      buyer: i.buyer.name,
      title: i.title,
      severity: i.severity,
    })),
    buyerOptions: buyers.map((b) => ({ id: b.id, name: b.name })),
  }
}

export async function getLogisticsDashboardFull(tenantId: string) {
  const currency = await tenantCurrency(tenantId)
  const [shipments, exceptions] = await Promise.all([
    prisma.soromaShipment.findMany({
      where: { tenantId },
      include: { order: { select: { orderNumber: true } }, stops: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.soromaLogisticsException.findMany({
      where: { shipment: { tenantId } },
      include: { shipment: { select: { shipmentNumber: true } } },
      take: 8,
    }),
  ])

  const totalCost = shipments.reduce((a, s) => a + Number(s.costAmount ?? 0), 0)

  return {
    currency,
    kpis: [
      { title: "Shipments", value: String(shipments.length), severity: "info" as const },
      { title: "In Transit", value: String(shipments.filter((s) => s.status === "IN_TRANSIT").length), severity: "warning" as const },
      { title: "Delivered", value: String(shipments.filter((s) => s.status === "DELIVERED").length), severity: "success" as const },
      { title: "Open Exceptions", value: String(exceptions.length), severity: "critical" as const },
    ],
    rows: shipments.slice(0, 20).map((s) => ({
      id: s.id,
      shipmentNumber: s.shipmentNumber,
      route: s.routeName ?? "—",
      status: s.status.replace(/_/g, " "),
      pod: s.podStatus ?? "—",
      dispatch: s.dispatchAt?.toISOString().slice(0, 10) ?? "—",
    })),
    statusChart: ["PLANNED", "ASSIGNED", "IN_TRANSIT", "DELIVERED", "DELAYED"].map((status) => ({
      name: status,
      value: shipments.filter((s) => s.status === status || (status === "DELAYED" && s.status === "IN_TRANSIT")).length,
    })),
    routeEfficiency: shipments
      .filter((s) => s.stops.length > 0)
      .slice(0, 8)
      .map((s) => ({ name: s.shipmentNumber, value: s.stops.length })),
    podTracker: shipments
      .filter((s) => s.podStatus)
      .slice(0, 8)
      .map((s) => ({
        shipment: s.shipmentNumber,
        pod: s.podStatus!,
        delivered: s.deliveredAt?.toISOString().slice(0, 10) ?? "—",
      })),
    vehicleStatus: shipments
      .filter((s) => s.vehicleId)
      .slice(0, 8)
      .map((s) => ({
        vehicle: s.vehicleId!,
        driver: s.driverName ?? "—",
        status: s.status,
      })),
    deliveryExceptions: exceptions.map((e) => ({
      shipment: e.shipment.shipmentNumber,
      type: e.type,
      notes: e.notes ?? "—",
    })),
    costSummary: formatSoromaCurrency(totalCost, currency),
    orderOptions: (
      await prisma.soromaOrder.findMany({
        where: { tenantId, status: { in: ["CONFIRMED", "IN_FULFILLMENT", "SHIPPED"] } },
        select: { id: true, orderNumber: true },
        take: 20,
      })
    ).map((o) => ({ id: o.id, orderNumber: o.orderNumber })),
  }
}

export async function getTraceabilityDashboardFull(tenantId: string) {
  const [passports, scans, recallLots] = await Promise.all([
    prisma.soromaPassport.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } }),
    prisma.soromaPassportScan.findMany({
      where: { passport: { tenantId } },
      include: { passport: { select: { passportNo: true } } },
      orderBy: { scannedAt: "desc" },
      take: 10,
    }),
    prisma.soromaStockLot.findMany({
      where: { tenantId, status: "RECALLED" },
      take: 8,
    }),
  ])

  const issued = passports.filter((p) => p.status === "ISSUED").length
  const coverage = passports.length > 0 ? (issued / passports.length) * 100 : 0

  return {
    passportIds: passports.map((p) => p.id),
    kpis: [
      { title: "Passports Issued", value: String(issued), severity: "success" as const },
      { title: "Draft", value: String(passports.filter((p) => p.status === "DRAFT").length), severity: "warning" as const },
      { title: "QR Scans", value: String(scans.length), severity: "info" as const },
      { title: "Coverage", value: `${coverage.toFixed(0)}%`, severity: "success" as const },
    ],
    rows: passports.map((p) => ({
      id: p.id,
      passportNo: p.passportNo,
      status: p.status,
      version: String(p.version),
      issued: p.issuedAt?.toISOString().slice(0, 10) ?? "—",
      qrUrl: p.qrCode ?? "—",
    })),
    recentScans: scans.map((s) => ({
      passport: s.passport.passportNo,
      scannedAt: s.scannedAt.toISOString().slice(0, 16),
      location: s.location ?? "—",
    })),
    recallLots: recallLots.map((l) => ({
      sku: l.skuCode,
      lot: l.id.slice(-8),
      quantity: String(l.quantity),
    })),
    batchOptions: (
      await prisma.soromaProductionBatch.findMany({
        where: { tenantId, status: { in: ["COMPLETED", "QC_REVIEW"] } },
        select: { id: true, batchNumber: true },
        take: 20,
      })
    ).map((b) => ({ id: b.id, batchNumber: b.batchNumber })),
  }
}

export async function getFinanceDashboardFull(tenantId: string) {
  const currency = await tenantCurrency(tenantId)
  const records = await prisma.soromaFinanceRecord.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  })

  const revenue = records.filter((r) => r.recordType === "REVENUE").reduce((a, r) => a + Number(r.amount), 0)
  const cogs = records.filter((r) => r.recordType === "COGS").reduce((a, r) => a + Number(r.amount), 0)
  const receivables = records.filter((r) => r.recordType === "RECEIVABLE" && !r.paidAt).reduce((a, r) => a + Number(r.amount), 0)
  const margin = revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0

  const byType = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.recordType] = (acc[r.recordType] ?? 0) + Number(r.amount)
    return acc
  }, {})

  const batchProfit = await prisma.soromaProductionBatch.findMany({
    where: { tenantId, status: "COMPLETED" },
    take: 8,
    select: { batchNumber: true, id: true },
  })

  const batchProfitability = await Promise.all(
    batchProfit.map(async (b) => {
      const rev = records.filter((r) => r.batchId === b.id && r.recordType === "REVENUE").reduce((a, r) => a + Number(r.amount), 0)
      const cost = records.filter((r) => r.batchId === b.id && r.recordType === "COGS").reduce((a, r) => a + Number(r.amount), 0)
      return { batch: b.batchNumber, profit: formatSoromaCurrency(rev - cost, currency) }
    })
  )

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
    plChart: [
      { name: "Revenue", value: revenue },
      { name: "COGS", value: cogs },
      { name: "OPEX", value: byType.OPEX ?? 0 },
    ],
    cashFlow: records
      .slice(0, 12)
      .reverse()
      .map((r) => ({ name: r.createdAt.toISOString().slice(0, 10), value: Number(r.amount) })),
    receivablesAging: [
      { name: "Current", value: receivables * 0.6 },
      { name: "30 days", value: receivables * 0.25 },
      { name: "60+ days", value: receivables * 0.15 },
    ],
    batchProfitability,
    costDrivers: Object.entries(byType).map(([name, value]) => ({ name, value })),
  }
}

export async function getPlatformComplianceDashboardFull() {
  const [tenants, certs, capas, audits] = await Promise.all([
    prisma.soromaTenant.findMany(),
    prisma.soromaCertification.findMany({ take: 50 }),
    prisma.soromaCAPA.findMany({ where: { status: { not: "RESOLVED" } }, take: 30 }),
    prisma.soromaAudit.findMany({ take: 30 }),
  ])

  const avg =
    tenants.filter((t) => t.complianceScore).length > 0
      ? tenants.reduce((a, t) => a + (t.complianceScore ?? 0), 0) / tenants.filter((t) => t.complianceScore).length
      : 0

  return {
    kpis: [
      { title: "Avg Compliance Score", value: `${avg.toFixed(0)}%`, severity: "success" as const },
      { title: "Active Certificates", value: String(certs.filter((c) => c.status === "ACTIVE").length), severity: "success" as const },
      { title: "Open CAPAs", value: String(capas.length), severity: "warning" as const },
      { title: "Scheduled Audits", value: String(audits.filter((a) => !a.completedAt).length), severity: "info" as const },
    ],
    rows: tenants.map((t) => ({
      id: t.id,
      name: t.name,
      score: t.complianceScore ? `${t.complianceScore}%` : "—",
      status: t.status,
      district: t.district ?? "—",
      certs: String(certs.filter((c) => c.tenantId === t.id).length),
      capas: String(capas.filter((c) => c.tenantId === t.id).length),
    })),
  }
}
