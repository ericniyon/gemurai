"use client"

import { SoromaChartCard } from "./chart-card"
import { SoromaDashboardCard } from "./dashboard-card"
import { SoromaDataTable, type SoromaColumn } from "./data-table"
import { SoromaMapWidget } from "./map-widget"

type PanelTable = {
  title: string
  description?: string
  columns: SoromaColumn<Record<string, unknown>>[]
  rows: Record<string, unknown>[]
  span?: 4 | 6 | 8 | 12
}

type PanelChart = {
  title: string
  description?: string
  type?: "bar" | "donut"
  data: { name: string; value: number }[]
  span?: 4 | 6 | 8 | 12
}

type PanelMap = {
  title: string
  description?: string
  points: { id: string; label: string; value: number }[]
  span?: 4 | 6 | 8 | 12
}

const spanClass = (span = 6) =>
  span === 12 ? "sf-col-12" : span === 8 ? "sf-col-8" : span === 4 ? "sf-col-4" : "sf-col-6"

export function SoromaModuleExtraGrid({
  tables = [],
  charts = [],
  maps = [],
}: {
  tables?: PanelTable[]
  charts?: PanelChart[]
  maps?: PanelMap[]
}) {
  if (tables.length === 0 && charts.length === 0 && maps.length === 0) return null

  return (
    <div className="sf-dashboard-grid">
      {charts.map((chart) => (
        <div key={chart.title} className={spanClass(chart.span)}>
          <SoromaChartCard
            title={chart.title}
            description={chart.description}
            type={chart.type ?? "bar"}
            data={chart.data}
          />
        </div>
      ))}
      {maps.map((map) => (
        <div key={map.title} className={spanClass(map.span)}>
          <SoromaMapWidget
            title={map.title}
            description={map.description}
            points={map.points}
          />
        </div>
      ))}
      {tables.map((table) => (
        <div key={table.title} className={spanClass(table.span)}>
          <SoromaDashboardCard title={table.title} description={table.description}>
            <SoromaDataTable columns={table.columns} rows={table.rows} />
          </SoromaDashboardCard>
        </div>
      ))}
    </div>
  )
}
