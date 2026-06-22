import Link from "next/link"
import {
  Users,
  ShoppingCart,
  Factory,
  Package,
  ClipboardList,
  Truck,
  QrCode,
  ShieldCheck,
  Plug,
  Wallet,
  ChevronRight,
  Sprout,
  AlertTriangle,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SoromaKpiCard } from "../kpi-card"
import { SoromaChartCard } from "../chart-card"
import { SoromaAlertStrip } from "../alert-strip"
import { SoromaDashboardCard } from "../dashboard-card"
import { SoromaDataTable } from "../data-table"
import { SoromaMapWidget } from "../map-widget"
import { SOROMA_ROUTES } from "@/lib/soroma/constants"
import type { SoromaDateScope } from "@/lib/soroma/kpi-engine"
import type { ChartPoint } from "../chart-card"
import type { AlertStripItem } from "../alert-strip"

const SCOPES: { value: SoromaDateScope; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "ytd", label: "YTD" },
]

const MODULES = [
  { tag: "T-01", label: "Suppliers", desc: "Network & scorecards", icon: Users, hrefKey: "suppliers" as const },
  { tag: "T-02", label: "Procurement", desc: "POs & RFQs", icon: ShoppingCart, hrefKey: "procurement" as const },
  { tag: "T-03", label: "Production", desc: "Batches & yield", icon: Factory, hrefKey: "production" as const },
  { tag: "T-04", label: "Inventory", desc: "Stock & expiry", icon: Package, hrefKey: "inventory" as const },
  { tag: "T-05", label: "Orders", desc: "Buyers & sales", icon: ClipboardList, hrefKey: "orders" as const },
  { tag: "T-06", label: "Logistics", desc: "Dispatch & POD", icon: Truck, hrefKey: "logistics" as const },
  { tag: "T-07", label: "Traceability", desc: "Passports & QR", icon: QrCode, hrefKey: "traceability" as const },
  { tag: "T-08", label: "Compliance", desc: "Audits & CAPA", icon: ShieldCheck, hrefKey: "compliance" as const },
  { tag: "T-09", label: "Integrations", desc: "Connectors & sync", icon: Plug, hrefKey: "integrations" as const },
  { tag: "T-10", label: "Finance", desc: "P&L & receivables", icon: Wallet, hrefKey: "finance" as const },
]

type Kpi = {
  title: string
  value: string
  severity?: "success" | "warning" | "critical" | "info"
  drilldownUrl?: string
}

type Snapshot = Awaited<
  ReturnType<typeof import("@/lib/soroma/dashboard-data").getTenantOverviewSnapshot>
>

export function TenantOverviewModule({
  tenantId,
  tenantName,
  scope,
  kpis,
  charts,
  alerts,
  snapshot,
}: {
  tenantId: string
  tenantName?: string
  scope: SoromaDateScope
  kpis: Kpi[]
  charts: {
    title: string
    description?: string
    type?: "bar" | "donut"
    data: ChartPoint[]
  }[]
  alerts: AlertStripItem[]
  snapshot: Snapshot
}) {
  const routes = SOROMA_ROUTES.tenant(tenantId)
  const tenant = snapshot.tenant

  return (
    <div className="space-y-6">
      {/* Branded hero */}
      <section className="sf-overview-hero">
        <div className="sf-overview-hero-content">
          <div className="sf-overview-hero-top">
            <div>
              <p className="sf-overview-hero-eyebrow">
                <Sprout className="h-3.5 w-3.5" />
                Agroprocessor workspace
              </p>
              <h1 className="sf-overview-hero-title">
                Overview
                {tenantName && (
                  <span className="sf-overview-hero-tenant">· {tenantName}</span>
                )}
              </h1>
              <p className="sf-overview-hero-desc">
                Farm-to-market snapshot — suppliers, production batches, orders, traceability
                passports, and compliance for your agroprocessing operation in Rwanda.
              </p>
            </div>
            <div className="sf-overview-scope-pills">
              {SCOPES.map((s) => (
                <Link
                  key={s.value}
                  href={`?scope=${s.value}`}
                  className={cn(
                    "sf-overview-scope-pill",
                    scope === s.value && "sf-overview-scope-pill--active"
                  )}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="sf-overview-hero-meta">
            {tenant?.district && (
              <span className="sf-overview-meta-chip">
                <MapPin className="h-3 w-3" />
                {tenant.district}
                {tenant.region ? `, ${tenant.region}` : ""}
              </span>
            )}
            {tenant?.valueChain && (
              <span className="sf-overview-meta-chip sf-overview-meta-chip--orange">
                {tenant.valueChain}
              </span>
            )}
            <span className="sf-overview-meta-chip">
              Currency: {tenant?.currency ?? "RWF"}
            </span>
            {tenant?.complianceScore != null && (
              <span className="sf-overview-meta-chip sf-overview-meta-chip--green">
                Compliance {tenant.complianceScore.toFixed(0)}%
              </span>
            )}
            <span className="sf-overview-meta-chip">
              {snapshot.counts.activeSuppliers} active suppliers
            </span>
            <span className="sf-overview-meta-chip">
              {snapshot.counts.passports} passports
            </span>
            {snapshot.counts.openAlerts > 0 && (
              <Link href={routes.alerts} className="sf-overview-meta-chip sf-overview-meta-chip--alert">
                <AlertTriangle className="h-3 w-3" />
                {snapshot.counts.openAlerts} open alerts
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <SoromaAlertStrip
          title="Operational alerts"
          alerts={alerts.map((a) => ({
            ...a,
            href: routes.alerts,
          }))}
          viewAllHref={routes.alerts}
        />
      )}

      {/* KPI grid — 4 per row */}
      <div className="sf-dashboard-grid">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="sf-col-3">
            <SoromaKpiCard
              title={kpi.title}
              value={kpi.value}
              severity={kpi.severity}
              drilldownUrl={kpi.drilldownUrl}
            />
          </div>
        ))}
      </div>

      {/* Module navigation */}
      <div>
        <div className="sf-overview-section-head">
          <h2 className="sf-overview-section-title">Operational modules</h2>
          <p className="sf-overview-section-desc">
            Jump into suppliers, procurement, production, traceability, and more
          </p>
        </div>
        <div className="sf-module-nav-grid">
          {MODULES.map((mod) => (
            <Link
              key={mod.tag}
              href={routes[mod.hrefKey]}
              className="sf-module-nav-tile"
            >
              <div className="sf-module-nav-icon">
                <mod.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="sf-module-nav-tag">{mod.tag}</p>
                <p className="sf-module-nav-label">{mod.label}</p>
                <p className="sf-module-nav-desc">{mod.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-40" />
            </Link>
          ))}
        </div>
      </div>

      {/* Charts */}
      {charts.length > 0 && (
        <div className="sf-dashboard-grid">
          {charts.slice(0, 2).map((chart) => (
            <div key={chart.title} className="sf-col-6">
              <SoromaChartCard
                title={chart.title}
                description={chart.description}
                type={chart.type}
                data={chart.data}
              />
            </div>
          ))}
        </div>
      )}

      {/* Activity + map */}
      <div className="sf-dashboard-grid">
        <div className="sf-col-7">
          <SoromaDashboardCard
            title="Recent activity"
            description="Latest batches, orders, and purchase orders"
          >
            <SoromaDataTable
              columns={[
                { key: "type", header: "Type" },
                { key: "ref", header: "Reference" },
                { key: "detail", header: "Detail" },
                { key: "status", header: "Status", status: true },
                { key: "updatedLabel", header: "Updated" },
              ]}
              rows={snapshot.activity}
              emptyMessage="No recent operational activity"
            />
          </SoromaDashboardCard>
        </div>
        <div className="sf-col-5">
          {snapshot.mapPoints.length > 0 ? (
            <SoromaMapWidget
              title="Supplier footprint"
              description="Active suppliers by district"
              metricLabel="suppliers"
              points={snapshot.mapPoints}
            />
          ) : (
            <SoromaDashboardCard
              title="Workspace health"
              description="Operational readiness indicators"
            >
              <ul className="space-y-3 p-1">
                {[
                  {
                    label: "Active supplier network",
                    value: String(snapshot.counts.activeSuppliers),
                    tone: "green" as const,
                  },
                  {
                    label: "Traceability passports",
                    value: String(snapshot.counts.passports),
                    tone: "green" as const,
                  },
                  {
                    label: "Open alerts",
                    value: String(snapshot.counts.openAlerts),
                    tone: snapshot.counts.openAlerts > 0 ? ("orange" as const) : ("green" as const),
                  },
                  {
                    label: "Compliance score",
                    value:
                      tenant?.complianceScore != null
                        ? `${tenant.complianceScore.toFixed(0)}%`
                        : "—",
                    tone: "green" as const,
                  },
                ].map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-[var(--sf-border)] bg-[var(--sf-green-50)] px-4 py-3"
                  >
                    <span className="text-sm text-[var(--sf-text-secondary)]">{item.label}</span>
                    <span
                      className={cn(
                        "text-lg font-bold tabular-nums",
                        item.tone === "orange"
                          ? "text-[var(--sf-orange-600)]"
                          : "text-[var(--sf-green-700)]"
                      )}
                    >
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={routes.reports} className="sf-overview-link-pill">
                  Reports
                </Link>
                <Link href={routes.analyticsDrilldown} className="sf-overview-link-pill">
                  KPI drilldown
                </Link>
                <Link href={routes.audit} className="sf-overview-link-pill">
                  Audit log
                </Link>
              </div>
            </SoromaDashboardCard>
          )}
        </div>
      </div>

      {/* Value chain footer strip */}
      <div className="sf-overview-value-strip">
        <span className="sf-overview-value-word sf-overview-value-word--green">Source</span>
        <ChevronRight className="h-4 w-4 text-[var(--sf-text-muted)]" aria-hidden />
        <span className="sf-overview-value-word">Process</span>
        <ChevronRight className="h-4 w-4 text-[var(--sf-text-muted)]" aria-hidden />
        <span className="sf-overview-value-word sf-overview-value-word--orange">Produce</span>
        <ChevronRight className="h-4 w-4 text-[var(--sf-text-muted)]" aria-hidden />
        <span className="sf-overview-value-word">Perform</span>
        <span className="ml-auto text-xs text-[var(--sf-text-muted)]">
          SOROMA FOODS · All amounts in {tenant?.currency ?? "RWF"}
        </span>
      </div>
    </div>
  )
}
