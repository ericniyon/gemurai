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
import { Navigation, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  calculateIntakeByDistanceBand,
  getDefaultDistanceBands,
  type DistanceBandStats,
  type EntityWithLocation,
  type Coordinates,
} from "@/lib/utils/geo-reporting"

export interface IntakeByDistanceBandReportProps {
  entities: EntityWithLocation[]
  center: Coordinates
  intakeField?: string
  amountField?: string
  title?: string
  description?: string
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

export function IntakeByDistanceBandReport({
  entities,
  center,
  intakeField = "totalLiters",
  amountField = "totalAmount",
  title = "Intake by Distance Band",
  description = "Milk intake aggregated by distance from collection center",
}: IntakeByDistanceBandReportProps) {
  const bands = getDefaultDistanceBands()
  const bandStats = calculateIntakeByDistanceBand(
    entities,
    center,
    bands,
    intakeField,
    amountField
  )

  const chartData = bandStats.map((stat) => ({
    band: stat.band,
    intake: stat.totalIntake,
    amount: stat.totalAmount,
    entities: stat.entityCount,
    avgDistance: stat.averageDistance.toFixed(1),
  }))

  const totalIntake = bandStats.reduce(
    (sum, stat) => sum + stat.totalIntake,
    0
  )
  const totalAmount = bandStats.reduce(
    (sum, stat) => sum + stat.totalAmount,
    0
  )
  const totalEntities = bandStats.reduce(
    (sum, stat) => sum + stat.entityCount,
    0
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
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
            <div className="text-sm text-blue-600 font-medium">Total Intake</div>
            <div className="text-2xl font-bold text-blue-900">
              {totalIntake.toLocaleString()} L
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
                  dataKey="band"
                  stroke="#6b7280"
                  fontSize={12}
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
                    "Intake",
                  ]}
                />
                <Legend />
                <Bar dataKey="intake" name="Intake (Liters)" fill="#10b981" radius={[8, 8, 0, 0]}>
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
                <TableHead>Distance Band</TableHead>
                <TableHead className="text-right">Entities</TableHead>
                <TableHead className="text-right">Intake (L)</TableHead>
                <TableHead className="text-right">Amount (RWF)</TableHead>
                <TableHead className="text-right">Avg Distance</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bandStats.map((stat, index) => {
                const percentage =
                  totalIntake > 0
                    ? ((stat.totalIntake / totalIntake) * 100).toFixed(1)
                    : "0.0"
                return (
                  <TableRow key={stat.band}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium">{stat.band}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{stat.entityCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {stat.totalIntake.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {stat.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-600">
                      {stat.averageDistance.toFixed(1)} km
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
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
