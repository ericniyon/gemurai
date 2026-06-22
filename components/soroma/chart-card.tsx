"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { SoromaDashboardCard } from "./dashboard-card"

export type ChartPoint = { name: string; value: number; fill?: string }

const CHART_COLORS = [
  "var(--sf-green-700)",
  "var(--sf-green-600)",
  "var(--sf-orange-600)",
  "var(--sf-blue-600)",
  "var(--sf-amber-500)",
  "var(--sf-text-muted)",
]

export function SoromaChartCard({
  title,
  description,
  type = "bar",
  data,
  loading,
  height = 220,
  valueFormatter,
}: {
  title: string
  description?: string
  type?: "bar" | "donut"
  data: ChartPoint[]
  loading?: boolean
  height?: number
  valueFormatter?: (v: number) => string
}) {
  const format = valueFormatter ?? ((v: number) => String(v))

  const chartData = data.map((d, i) => ({
    ...d,
    fill: d.fill ?? CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <SoromaDashboardCard
      title={title}
      description={description}
      loading={loading}
      emptyState={
        !loading && data.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: "var(--sf-text-muted)" }}>
            No chart data for the selected period.
          </p>
        ) : undefined
      }
    >
      {data.length > 0 && (
        <div style={{ height }} className="w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            {type === "donut" ? (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => format(v)} />
              </PieChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--sf-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--sf-text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--sf-text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={format}
                />
                <Tooltip
                  formatter={(v: number) => format(v)}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--sf-border)",
                    background: "var(--sf-surface)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </SoromaDashboardCard>
  )
}
