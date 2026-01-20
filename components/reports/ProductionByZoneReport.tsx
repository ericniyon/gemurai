"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { MapPin, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  calculateProductionByZone,
  getDefaultZones,
  type ZoneStats,
  type EntityWithLocation,
  type Coordinates,
} from "@/lib/utils/geo-reporting"

export interface ProductionByZoneReportProps {
  entities: EntityWithLocation[]
  center: Coordinates
  productionField?: string
  amountField?: string
  title?: string
  description?: string
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function ProductionByZoneReport({
  entities,
  center,
  productionField = "totalLiters",
  amountField = "totalAmount",
  title = "Production by Zone",
  description = "Milk production aggregated by geographic zones",
}: ProductionByZoneReportProps) {
  const zones = getDefaultZones(center)
  const zoneStats = calculateProductionByZone(
    entities,
    zones,
    productionField,
    amountField
  )

  const chartData = zoneStats.map((stat) => ({
    zone: stat.zone.replace("Zone ", "").replace(/\(.*?\)/, "").trim(),
    production: stat.totalProduction,
    amount: stat.totalAmount,
    entities: stat.entityCount,
    average: stat.averagePerEntity,
  }))

  const totalProduction = zoneStats.reduce(
    (sum, stat) => sum + stat.totalProduction,
    0
  )
  const totalAmount = zoneStats.reduce(
    (sum, stat) => sum + stat.totalAmount,
    0
  )
  const totalEntities = zoneStats.reduce(
    (sum, stat) => sum + stat.entityCount,
    0
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Total Production</div>
            <div className="text-2xl font-bold text-blue-900">
              {totalProduction.toLocaleString()} L
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium">Total Amount</div>
            <div className="text-2xl font-bold text-green-900">
              RWF {totalAmount.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Total Entities</div>
            <div className="text-2xl font-bold text-purple-900">
              {totalEntities}
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="zone"
                  stroke="#6b7280"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()} L`,
                    "Production",
                  ]}
                />
                <Legend />
                <Bar dataKey="production" name="Production (Liters)" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone</TableHead>
                <TableHead className="text-right">Entities</TableHead>
                <TableHead className="text-right">Production (L)</TableHead>
                <TableHead className="text-right">Amount (RWF)</TableHead>
                <TableHead className="text-right">Avg per Entity</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zoneStats.map((stat, index) => {
                const percentage =
                  totalProduction > 0
                    ? ((stat.totalProduction / totalProduction) * 100).toFixed(1)
                    : "0.0"
                return (
                  <TableRow key={stat.zone}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium">{stat.zone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{stat.entityCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {stat.totalProduction.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {stat.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-600">
                      {stat.averagePerEntity.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
