import { SoromaKpiCard } from "./kpi-card"
import { SoromaDashboardCard } from "./dashboard-card"
import { SoromaDataTable, type SoromaColumn } from "./data-table"
import { SoromaQuickActions, type QuickAction } from "./quick-actions"
import { SoromaScopeBanner } from "./scope-banner"
import { SoromaPageHeader } from "./page-header"
import { SoromaChartCard, type ChartPoint } from "./chart-card"
import { SoromaAlertStrip, type AlertStripItem } from "./alert-strip"
import type { StatusSeverity } from "@/lib/soroma/status"
import type { LucideIcon } from "lucide-react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PermissionGuard } from "./permission-guard"

type Kpi = {
  title: string
  value: string
  subtitle?: string
  delta?: number
  severity?: StatusSeverity
  icon?: LucideIcon
  drilldownUrl?: string
}

type ChartConfig = {
  title: string
  description?: string
  type?: "bar" | "donut"
  data: ChartPoint[]
  valueFormatter?: (v: number) => string
}

export function SoromaModuleDashboard<T extends Record<string, unknown>>({
  title,
  description,
  moduleTag,
  tenantName,
  showScopeBanner = true,
  kpis,
  tableTitle,
  tableDescription,
  columns,
  rows,
  quickActions,
  charts,
  alerts,
  alertsViewAllHref,
  headerActions,
  onExport,
  emptyMessage,
  kpiColumns = 3,
}: {
  title: string
  description?: string
  moduleTag?: string
  tenantName?: string
  showScopeBanner?: boolean
  kpis: Kpi[]
  tableTitle?: string
  tableDescription?: string
  columns?: SoromaColumn<T>[]
  rows?: T[]
  quickActions?: QuickAction[]
  charts?: ChartConfig[]
  alerts?: AlertStripItem[]
  alertsViewAllHref?: string
  headerActions?: React.ReactNode
  onExport?: () => void
  exportPermission?: string
  emptyMessage?: string
  /** KPI grid span per card on 12-col layout (default 3 = 4 per row, 2 = 6 per row) */
  kpiColumns?: 2 | 3 | 4 | 6
}) {
  const kpiSpanClass =
    kpiColumns === 2 ? "sf-col-2" : kpiColumns === 6 ? "sf-col-6" : kpiColumns === 4 ? "sf-col-4" : "sf-col-3"

  const exportButton = onExport ? (
    <Button variant="outline" size="sm" onClick={onExport} className="h-8 text-xs border-[var(--sf-border)] bg-[var(--sf-surface)]">
      <Download className="mr-2 h-4 w-4 text-[var(--sf-green-600)]" />
      Export
    </Button>
  ) : null

  const defaultHeaderActions = exportButton

  return (
    <div className="space-y-6">
      <SoromaPageHeader
        title={title}
        description={description}
        moduleTag={moduleTag}
        tenantName={tenantName}
        actions={headerActions ?? defaultHeaderActions}
      />

      {tenantName && showScopeBanner && <SoromaScopeBanner tenantName={tenantName} />}

      {/* Alerts strip — Placed first for immediate operator visibility */}
      {alerts && alerts.length > 0 && (
        <SoromaAlertStrip
          alerts={alerts}
          viewAllHref={alertsViewAllHref}
        />
      )}

      {/* KPI strip — 12-column grid, 3 cols each */}
      <div className="sf-dashboard-grid">
        {kpis.map((kpi) => (
          <div key={kpi.title} className={kpiSpanClass}>
            <SoromaKpiCard
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              delta={kpi.delta}
              severity={kpi.severity}
              icon={kpi.icon}
              drilldownUrl={kpi.drilldownUrl}
            />
          </div>
        ))}
      </div>

      {/* Charts row */}
      {charts && charts.length > 0 && (
        <div className="sf-dashboard-grid">
          {charts.map((chart) => (
            <div
              key={chart.title}
              className={charts.length === 1 ? "sf-col-12" : "sf-col-6"}
            >
              <SoromaChartCard
                title={chart.title}
                description={chart.description}
                type={chart.type}
                data={chart.data}
                valueFormatter={chart.valueFormatter}
              />
            </div>
          ))}
        </div>
      )}

      {/* Main content: table + quick actions */}
      <div className="sf-dashboard-grid">
        {columns && rows && (
          <div
            className={
              quickActions && quickActions.length > 0 ? "sf-col-8" : "sf-col-12"
            }
          >
            <SoromaDashboardCard
              title={tableTitle ?? "Records"}
              description={tableDescription}
            >
              <SoromaDataTable
                columns={columns}
                rows={rows}
                emptyMessage={emptyMessage}
              />
            </SoromaDashboardCard>
          </div>
        )}
        {quickActions && quickActions.length > 0 && (
          <div className={columns && rows ? "sf-col-4" : "sf-col-12"}>
            <SoromaQuickActions actions={quickActions} layout="tiles" />
          </div>
        )}
      </div>
    </div>
  )
}
