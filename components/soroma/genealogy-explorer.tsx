import { SoromaDashboardCard } from "./dashboard-card"
import { SoromaStatusBadge } from "./status-badge"
import {
  Sprout,
  Factory,
  Warehouse,
  Truck,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react"

type GenealogyData = {
  passport: {
    passportNo: string
    status: string
    issuedAt: Date | null
    version: number
  }
  supplierLots: Array<{
    lotNumber: string
    supplierName: string
    purchaseOrderNo: string
    commodity: string | null
  }>
  batch: {
    batchNumber: string
    status: string
    line: string
  } | null
  finishedLots: Array<{
    skuCode: string
    skuName: string
    quantity: number
    warehouse: string
    stockStatus: string
  }>
  orders: Array<{
    orderNumber: string
    buyer: string
    status: string
    shipments: Array<{
      shipmentNumber: string
      status: string
    }>
  }>
}

export function SoromaGenealogyExplorer({
  data,
}: {
  data: GenealogyData | null
}) {
  if (!data) {
    return (
      <SoromaDashboardCard
        title="Genealogy Explorer"
        description="Supplier → PO → Raw Lot → Batch → SKU → Inventory → Order → Shipment"
      >
        <p className="text-sm text-[var(--sf-text-muted)] py-4 text-center">
          Select or issue a passport to inspect recall-ready lineage.
        </p>
      </SoromaDashboardCard>
    )
  }

  return (
    <SoromaDashboardCard
      title={`Genealogy · ${data.passport.passportNo}`}
      description="Recall-ready audit chain from farm to dispatch"
    >
      <div className="space-y-6">
        {/* Passport Status Overview */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[var(--sf-surface-soft)] p-4 border border-[var(--sf-green-100)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--sf-green-100)] text-[var(--sf-green-700)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--sf-text-muted)]">
                Active Product Passport
              </p>
              <h4 className="text-sm font-bold text-[var(--sf-text-primary)]">
                {data.passport.passportNo}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SoromaStatusBadge status={data.passport.status} />
            <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
              v{data.passport.version}.0
            </span>
            {data.passport.issuedAt && (
              <span className="flex items-center gap-1 text-xs text-[var(--sf-text-muted)]">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(data.passport.issuedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Visual Lineage Timeline Flow */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-3 items-stretch relative">
          
          {/* STEP 1: SUPPLIERS */}
          <div className="genealogy-node-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sf-text-muted)]">
                  1. Source Cooperatives
                </span>
                <Sprout className="h-4 w-4 text-[var(--sf-green-600)]" />
              </div>
              <ul className="space-y-2">
                {data.supplierLots.length === 0 ? (
                  <li className="text-xs text-[var(--sf-text-muted)]">No lots linked.</li>
                ) : (
                  data.supplierLots.slice(0, 3).map((lot) => (
                    <li key={lot.lotNumber} className="border-b border-slate-100 pb-1.5 last:border-b-0">
                      <p className="text-xs font-bold text-[var(--sf-text-primary)]">
                        {lot.lotNumber}
                      </p>
                      <p className="text-[10px] text-[var(--sf-text-muted)] truncate">
                        {lot.supplierName} · {lot.purchaseOrderNo}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="mt-3 text-[10px] text-[var(--sf-green-600)] font-semibold flex items-center gap-1 justify-end lg:hidden">
              Next Stage <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* STEP 2: BATCH */}
          <div className="genealogy-node-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sf-text-muted)]">
                  2. Processing Batch
                </span>
                <Factory className="h-4 w-4 text-[var(--sf-green-700)]" />
              </div>
              {data.batch ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-[var(--sf-text-primary)]">
                    {data.batch.batchNumber}
                  </p>
                  <p className="text-[10px] text-[var(--sf-text-muted)]">
                    Milling Line: {data.batch.line}
                  </p>
                  <div className="pt-1">
                    <SoromaStatusBadge status={data.batch.status} />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--sf-text-muted)]">No active batch linked.</p>
              )}
            </div>
            <div className="mt-3 text-[10px] text-[var(--sf-green-600)] font-semibold flex items-center gap-1 justify-end lg:hidden">
              Next Stage <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* STEP 3: SKUS INVENTORY */}
          <div className="genealogy-node-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sf-text-muted)]">
                  3. Finished SKU Goods
                </span>
                <Warehouse className="h-4 w-4 text-[var(--sf-green-700)]" />
              </div>
              <ul className="space-y-2">
                {data.finishedLots.length === 0 ? (
                  <li className="text-xs text-[var(--sf-text-muted)]">No SKUs generated.</li>
                ) : (
                  data.finishedLots.slice(0, 2).map((lot) => (
                    <li key={`${lot.skuCode}-${lot.warehouse}`} className="border-b border-slate-100 pb-1.5 last:border-b-0">
                      <p className="text-xs font-bold text-[var(--sf-text-primary)] truncate">
                        {lot.skuCode} · {lot.skuName}
                      </p>
                      <p className="text-[10px] text-[var(--sf-text-muted)]">
                        Qty: {lot.quantity} · {lot.warehouse}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="mt-3 text-[10px] text-[var(--sf-green-600)] font-semibold flex items-center gap-1 justify-end lg:hidden">
              Next Stage <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* STEP 4: ORDERS & LOGISTICS */}
          <div className="genealogy-node-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sf-text-muted)]">
                  4. Dispatch & Orders
                </span>
                <Truck className="h-4 w-4 text-[var(--sf-green-700)]" />
              </div>
              <ul className="space-y-2">
                {data.orders.length === 0 ? (
                  <li className="text-xs text-[var(--sf-text-muted)]">Pending dispatch.</li>
                ) : (
                  data.orders.slice(0, 2).map((order) => (
                    <li key={order.orderNumber} className="border-b border-slate-100 pb-1.5 last:border-b-0">
                      <p className="text-xs font-bold text-[var(--sf-text-primary)] truncate">
                        {order.orderNumber} · {order.buyer}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {order.shipments.map((shipment) => (
                          <span
                            key={shipment.shipmentNumber}
                            className="rounded bg-slate-100 border border-slate-200 px-1 py-0.5 text-[9px] font-semibold text-[var(--sf-text-secondary)]"
                          >
                            {shipment.shipmentNumber} ({shipment.status})
                          </span>
                        ))}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </SoromaDashboardCard>
  )
}
