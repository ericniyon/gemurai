"use client"

import { KPIChart } from "./kpi-chart"

interface ChartData {
  months: string[]
  orders: number[]
  sales: number[]
  stockRatio: number[]
  commission: number[]
}

export function DCCCharts({ data }: { data: ChartData }) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Performance Analytics</h2>
        <p className="text-sm text-muted-foreground">Track your key performance indicators</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <KPIChart 
          data={data} 
          title="Sales Performance" 
          metric="sales"
          format="currency"
        />
        <KPIChart 
          data={data} 
          title="Stock Ratio" 
          metric="stockRatio"
          format="number"
        />
      </div>
    </div>
  )
} 