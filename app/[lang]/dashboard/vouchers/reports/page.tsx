"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Users, 
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  EyeOff
} from "lucide-react"
import { toast } from "sonner"

interface VoucherReport {
  totalVouchers: number
  activeVouchers: number
  usedVouchers: number
  expiredVouchers: number
  totalValue: number
  remainingValue: number
  usedValue: number
  totalDCCs: number
  averageVoucherValue: number
  usageRate: number
  monthlyStats: {
    month: string
    created: number
    used: number
    expired: number
    value: number
  }[]
  topDCCs: {
    id: string
    name: string
    totalVouchers: number
    totalValue: number
    usagePercentage: number
  }[]
  statusDistribution: {
    status: string
    count: number
    percentage: number
  }[]
}

export default function VoucherReportsPage() {
  const { user, isAuthenticated } = useAuth()
  const [report, setReport] = useState<VoucherReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState("30")
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchReport()
    }
  }, [isAuthenticated, dateRange])

  const fetchReport = async () => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem("Gemurai_token")
      const res = await fetch(`/api/v1/vouchers/reports?days=${dateRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      const data = await res.json()
      
      if (data.success) {
        setReport(data.data)
      } else {
        setError(data.message || "Failed to load voucher report")
      }
    } catch (e: any) {
      setError(e.message || "Failed to load voucher report")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const exportReport = () => {
    if (!report) return

    const csvContent = [
      ["Voucher Report", `Generated on ${new Date().toLocaleDateString()}`],
      [""],
      ["Overview"],
      ["Total Vouchers", report.totalVouchers.toString()],
      ["Active Vouchers", report.activeVouchers.toString()],
      ["Used Vouchers", report.usedVouchers.toString()],
      ["Expired Vouchers", report.expiredVouchers.toString()],
      ["Total Value", formatCurrency(report.totalValue)],
      ["Remaining Value", formatCurrency(report.remainingValue)],
      ["Used Value", formatCurrency(report.usedValue)],
      ["Usage Rate", `${report.usageRate.toFixed(1)}%`],
      [""],
      ["Top DCCs by Usage"],
      ["DCC Name", "Total Vouchers", "Total Value", "Usage %"],
      ...report.topDCCs.map(dcc => [
        dcc.name,
        dcc.totalVouchers.toString(),
        formatCurrency(dcc.totalValue),
        `${dcc.usagePercentage.toFixed(1)}%`
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `voucher-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Voucher report exported successfully!")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No report data available</h3>
          <p className="text-gray-600">Voucher report data will appear here once vouchers are created</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Voucher Reports
          </h1>
          <p className="text-gray-600 text-lg">
            Comprehensive analytics and insights on voucher usage and performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48 h-12 !bg-white !border-gray-300 border-2 rounded-xl">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent className="!bg-white border border-gray-300">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={fetchReport}
            disabled={refreshing}
            className="h-12 px-4 border-2 border-gray-200 rounded-xl"
          >
            {refreshing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          <Button
            onClick={exportReport}
            className="h-12 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Vouchers</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {report.totalVouchers}
                </p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Active Vouchers</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {report.activeVouchers}
                </p>
                <p className="text-xs text-gray-500">Ready to use</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {formatCurrency(report.totalValue)}
                </p>
                <p className="text-xs text-gray-500">Combined value</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Usage Rate</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {report.usageRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Of total value</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              Voucher Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of vouchers by their current status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.statusDistribution.map((status) => (
              <div key={status.status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`px-2 py-1 text-xs ${
                      status.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : status.status === 'USED'
                        ? 'bg-gray-100 text-gray-800 border-gray-200'
                        : status.status === 'EXPIRED'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {status.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-600">{status.count} vouchers</span>
                  </div>
                  <span className="text-sm font-medium">{status.percentage.toFixed(1)}%</span>
                </div>
                <Progress value={status.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top DCCs */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Top DCCs by Usage
            </CardTitle>
            <CardDescription>
              DCCs with the highest voucher usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.topDCCs.slice(0, 5).map((dcc, index) => (
              <div key={dcc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{dcc.name}</p>
                    <p className="text-sm text-gray-600">
                      {dcc.totalVouchers} vouchers • {formatCurrency(dcc.totalValue)}
                    </p>
                  </div>
                </div>
                <Badge className={`px-2 py-1 text-xs ${
                  dcc.usagePercentage > 80 
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : dcc.usagePercentage > 50
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-green-100 text-green-800 border-green-200'
                }`}>
                  {dcc.usagePercentage.toFixed(1)}% used
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      {showDetails && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Detailed Analytics
            </CardTitle>
            <CardDescription>
              In-depth analysis of voucher performance and trends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Average Voucher Value</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(report.averageVoucherValue)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total DCCs</p>
                <p className="text-2xl font-bold text-green-600">{report.totalDCCs}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Remaining Value</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(report.remainingValue)}</p>
              </div>
            </div>

            {/* Monthly Trends */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
              <div className="space-y-3">
                {report.monthlyStats.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-900">{month.month}</span>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>Created: {month.created}</span>
                        <span>Used: {month.used}</span>
                        <span>Expired: {month.expired}</span>
                      </div>
                    </div>
                    <span className="font-medium text-blue-600">{formatCurrency(month.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toggle Details Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
          className="h-12 px-6 border-2 border-gray-200 rounded-xl"
        >
          {showDetails ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Details
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show Details
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
