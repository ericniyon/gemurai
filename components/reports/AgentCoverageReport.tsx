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
} from "recharts"
import { Users, MapPin, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  calculateAgentCoverage,
  type AgentCoverage,
  type EntityWithLocation,
} from "@/lib/utils/geo-reporting"

export interface AgentCoverageReportProps {
  agents: Array<EntityWithLocation & { name?: string }>
  entities: EntityWithLocation[]
  productionField?: string
  title?: string
  description?: string
}

export function AgentCoverageReport({
  agents,
  entities,
  productionField = "totalLiters",
  title = "Agent Coverage Summary",
  description = "Coverage analysis for field agents",
}: AgentCoverageReportProps) {
  const coverage = calculateAgentCoverage(agents, entities, productionField)

  const chartData = coverage.map((agent) => ({
    name: agent.agentName,
    entities: agent.entitiesCovered,
    production: agent.totalProduction,
    radius: agent.coverageRadius.toFixed(1),
  }))

  const totalCoverage = coverage.reduce(
    (sum, agent) => sum + agent.entitiesCovered,
    0
  )
  const totalProduction = coverage.reduce(
    (sum, agent) => sum + agent.totalProduction,
    0
  )
  const avgCoverage = coverage.length > 0 ? totalCoverage / coverage.length : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
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
            <div className="text-sm text-blue-600 font-medium">Total Agents</div>
            <div className="text-2xl font-bold text-blue-900">
              {coverage.length}
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium">Total Coverage</div>
            <div className="text-2xl font-bold text-green-900">
              {totalCoverage} entities
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Avg per Agent</div>
            <div className="text-2xl font-bold text-purple-900">
              {avgCoverage.toFixed(1)}
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
                  dataKey="name"
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
                />
                <Legend />
                <Bar
                  dataKey="entities"
                  name="Entities Covered"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="production"
                  name="Production (L)"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Entities Covered</TableHead>
                <TableHead className="text-right">Production (L)</TableHead>
                <TableHead className="text-right">Coverage Radius</TableHead>
                <TableHead className="text-right">Avg Distance</TableHead>
                <TableHead>Zones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coverage.map((agent) => (
                <TableRow key={agent.agentId}>
                  <TableCell>
                    <div className="font-medium">{agent.agentName}</div>
                    <div className="text-xs text-gray-500">
                      ID: {agent.agentId.slice(-6)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-medium">
                      {agent.entitiesCovered}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {agent.totalProduction.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-600">
                    {agent.coverageRadius.toFixed(1)} km
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-600">
                    {agent.averageDistance.toFixed(1)} km
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {agent.zones.slice(0, 3).map((zone) => (
                        <Badge
                          key={zone}
                          variant="secondary"
                          className="text-xs"
                        >
                          {zone.replace("Zone ", "").replace(/\(.*?\)/, "").trim()}
                        </Badge>
                      ))}
                      {agent.zones.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{agent.zones.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
