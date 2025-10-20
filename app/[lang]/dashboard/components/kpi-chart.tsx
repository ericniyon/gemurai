"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, TrendingUp, LineChart } from "lucide-react"

type ChartMetric =
  | "employeeGrowth"
  | "productivity"
  | "retention"
  | "jobCompletion"
  | "sales"
  | "performance"
  | "stockRatio"
  | "earnings"
  | "totalUsers"
  | "activeUsers"
  | "systemPerformance"
  | "revenue"
  | "transactions"
  | "growthRate"

interface ChartData {
  months: string[]
  employeeGrowth?: number[]
  productivity?: number[]
  retention?: number[]
  jobCompletion?: number[]
  sales?: number[]
  performance?: number[]
  stockRatio?: number[]
  earnings?: number[]
  totalUsers?: number[]
  activeUsers?: number[]
  systemPerformance?: number[]
  revenue?: number[]
  transactions?: number[]
  growthRate?: number[]
  [key: string]: any
}

interface KPIChartProps {
  data: ChartData
  title: string
  metric: ChartMetric
  format: "number" | "percentage" | "currency"
}

export function KPIChart({ data, title, metric, format }: KPIChartProps) {
  const formatValue = (value: number) => {
    switch (format) {
      case "currency":
        return `RWF ${value.toLocaleString()}`
      case "percentage":
        return `${value}%`
      default:
        return value.toLocaleString()
    }
  }

  const getIcon = () => {
    switch (metric) {
      case "employeeGrowth":
        return <Users className="h-4 w-4 text-blue-500" />
      case "productivity":
        return <Activity className="h-4 w-4 text-green-500" />
      case "retention":
        return <TrendingUp className="h-4 w-4 text-purple-500" />
      case "jobCompletion":
        return <LineChart className="h-4 w-4 text-orange-500" />
      case "sales":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "performance":
        return <Activity className="h-4 w-4 text-yellow-600" />
      case "stockRatio":
        return <LineChart className="h-4 w-4 text-blue-600" />
      case "earnings":
        return <TrendingUp className="h-4 w-4 text-emerald-600" />
      case "totalUsers":
        return <Users className="h-4 w-4 text-blue-500" />
      case "activeUsers":
        return <Users className="h-4 w-4 text-green-500" />
      case "systemPerformance":
        return <Activity className="h-4 w-4 text-purple-500" />
      case "revenue":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "transactions":
        return <LineChart className="h-4 w-4 text-blue-600" />
      case "growthRate":
        return <TrendingUp className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const values = data[metric] || []
  const maxValue = Math.max(...values)

  // Calculate SVG path for line chart
  const getLinePath = () => {
    if (values.length === 0) return ""
    
    const width = 300 // SVG width
    const height = 150 // SVG height
    const padding = 20
    const chartWidth = width - (padding * 2)
    const chartHeight = height - (padding * 2)
    
    const points = values.map((value: number, index: number) => {
      const x = padding + (index / (values.length - 1)) * chartWidth
      const y = padding + chartHeight - (value / maxValue) * chartHeight
      return `${x},${y}`
    })
    
    return `M ${points.join(' L ')}`
  }

  // Get line color based on metric
  const getLineColor = () => {
    switch (metric) {
      case "employeeGrowth": return "#3b82f6" // blue
      case "productivity": return "#10b981" // green
      case "retention": return "#8b5cf6" // purple
      case "jobCompletion": return "#f59e0b" // orange
      case "sales": return "#10b981" // green
      case "performance": return "#eab308" // yellow
      case "stockRatio": return "#3b82f6" // blue
      case "earnings": return "#059669" // emerald
      case "totalUsers": return "#3b82f6" // blue
      case "activeUsers": return "#10b981" // green
      case "systemPerformance": return "#8b5cf6" // purple
      case "revenue": return "#10b981" // green
      case "transactions": return "#3b82f6" // blue
      case "growthRate": return "#f59e0b" // orange
      default: return "#6b7280" // gray
    }
  }

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <CardDescription>Monthly trend analysis</CardDescription>
        </div>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <div className="relative h-full">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 300 150"
              className="absolute inset-0"
            >
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Line chart */}
              <path
                d={getLinePath()}
                fill="none"
                stroke={getLineColor()}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
              />
              
              {/* Data points */}
              {values.map((value: number, index: number) => {
                const x = 20 + (index / (values.length - 1)) * 260
                const y = 20 + 110 - (value / maxValue) * 110
                
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill={getLineColor()}
                      stroke="white"
                      strokeWidth="2"
                      className="hover:r-6 transition-all cursor-pointer"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="transparent"
                      className="hover:fill-current hover:opacity-20 transition-all cursor-pointer"
                    />
                  </g>
                )
              })}
            </svg>
            
            {/* Month labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-5 pb-2">
              {data.months.map((month: string, index: number) => (
                <div key={index} className="text-xs text-gray-500 text-center">
                  {month}
                </div>
              ))}
            </div>
            
            {/* Value labels on hover */}
            <div className="absolute top-0 left-0 right-0 flex justify-between px-5 pt-2">
              {values.map((value: number, index: number) => (
                <div key={index} className="text-xs text-gray-400 text-center opacity-0 hover:opacity-100 transition-opacity">
                  {formatValue(value)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 