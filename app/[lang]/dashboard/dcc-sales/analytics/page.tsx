"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface AnalyticsData {
  summary: {
    totalSales: number
    totalRevenue: number
    totalCommission: number
    averageSalePrice: number
    uniqueDCCs: number
    uniqueProducts: number
  }
  topDCCs: Array<{
    dccId: string
    dccName: string
    totalSales: number
    totalRevenue: number
    totalCommission: number
    averageSaleValue: number
  }>
  topProducts: Array<{
  productId: string
  productName: string
  totalSales: number
  totalRevenue: number
    totalQuantity: number
    averagePrice: number
  }>
  dailyStats: Array<{
    date: string
    sales: number
    revenue: number
    commission: number
  }>
  monthlyStats: Array<{
    month: string
    sales: number
    revenue: number
    commission: number
  }>
  performanceMetrics: {
    averageSalesPerDCC: number
    averageRevenuePerDCC: number
    topPerformingDCC: string
    topSellingProduct: string
    conversionRate: number
  }
  recentSales: Array<{
    id: string
    dccName: string
    productName: string
    quantity: number
    totalRevenue: number
    saleDate: string
  }>
}

export default function DCCSalesAnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30') // days

  // Check if user has EMPLOYER, BRANCH_MANAGER, or DCC role
  useEffect(() => {
    if (user && user.role !== "EMPLOYER" && user.role !== "BRANCH_MANAGER" && user.role !== "DCC") {
      toast({
        title: "Access Denied",
        description: "Only EMPLOYER, BRANCH_MANAGER, and DCC users can access DCC sales analytics.",
        variant: "destructive"
      })
      router.push("/en/dashboard")
    }
  }, [user, router])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Fetch data for the selected time range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(timeRange))

      const response = await fetch(`/api/v1/employer/dcc-sales?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[DCC_SALES_ANALYTICS] API Response:", result)
      if (result.success) {
        // Process the data to create analytics
        const sales = result.data?.sales || []
        console.log("[DCC_SALES_ANALYTICS] Processing sales data:", sales.length, "sales")
        
        // Calculate top DCCs with more detailed metrics
        const dccStats = new Map()
        if (sales.length === 0) {
          console.log("[DCC_SALES_ANALYTICS] No sales data available")
        }
        sales.forEach((sale: any) => {
          const dccId = sale.dccId
          if (!dccStats.has(dccId)) {
            dccStats.set(dccId, {
              dccId,
              dccName: sale.dcc.name,
              totalSales: 0,
              totalRevenue: 0,
              totalCommission: 0,
              saleValues: []
            })
          }
          const stats = dccStats.get(dccId)
          stats.totalSales += 1
          stats.totalRevenue += sale.totalRevenue
          stats.totalCommission += sale.totalCommission
          stats.saleValues.push(sale.totalRevenue)
        })

        // Calculate average sale value for each DCC
        const topDCCs = Array.from(dccStats.values()).map(dcc => ({
          ...dcc,
          averageSaleValue: dcc.totalRevenue / dcc.totalSales
        })).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10)

        // Calculate top products with more detailed metrics
        const productStats = new Map()
        sales.forEach((sale: any) => {
          const productId = sale.productId
          if (!productStats.has(productId)) {
            productStats.set(productId, {
              productId,
              productName: sale.product.name,
              totalSales: 0,
              totalRevenue: 0,
              totalQuantity: 0,
              prices: []
            })
          }
          const stats = productStats.get(productId)
          stats.totalSales += 1
          stats.totalRevenue += sale.totalRevenue
          stats.totalQuantity += sale.quantity
          stats.prices.push(sale.salePrice)
        })

        const topProducts = Array.from(productStats.values()).map(product => ({
          ...product,
          averagePrice: product.totalRevenue / product.totalQuantity
        })).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10)

        // Calculate daily stats
        const dailyStats = new Map()
        sales.forEach((sale: any) => {
          const date = sale.saleDate.split('T')[0]
          if (!dailyStats.has(date)) {
            dailyStats.set(date, {
              date,
              sales: 0,
              revenue: 0,
              commission: 0
            })
          }
          const stats = dailyStats.get(date)
          stats.sales += 1
          stats.revenue += sale.totalRevenue
          stats.commission += sale.totalCommission
        })

        // Calculate monthly stats
        const monthlyStats = new Map()
        sales.forEach((sale: any) => {
          const date = new Date(sale.saleDate)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          if (!monthlyStats.has(monthKey)) {
            monthlyStats.set(monthKey, {
              month: monthKey,
              sales: 0,
              revenue: 0,
              commission: 0
            })
          }
          const stats = monthlyStats.get(monthKey)
          stats.sales += 1
          stats.revenue += sale.totalRevenue
          stats.commission += sale.totalCommission
        })

        // Calculate performance metrics
        const uniqueDCCs = new Set(sales.map((sale: any) => sale.dccId)).size
        const performanceMetrics = {
          averageSalesPerDCC: uniqueDCCs > 0 ? sales.length / uniqueDCCs : 0,
          averageRevenuePerDCC: uniqueDCCs > 0 ? (result.data.summary?.totalRevenue || 0) / uniqueDCCs : 0,
          topPerformingDCC: topDCCs[0]?.dccName || 'N/A',
          topSellingProduct: topProducts[0]?.productName || 'N/A',
          conversionRate: 85 // This would need to be calculated based on actual conversion data
        }

        const analyticsData: AnalyticsData = {
          summary: result.data.summary || {
            totalSales: 0,
            totalRevenue: 0,
            totalCommission: 0,
            averageSalePrice: 0,
            uniqueDCCs: 0,
            uniqueProducts: 0
          },
          topDCCs,
          topProducts,
          recentSales: sales.slice(0, 10).map((sale: any) => ({
            id: sale.id,
            dccName: sale.dcc.name,
            productName: sale.product.name,
            quantity: sale.quantity,
            totalRevenue: sale.totalRevenue,
            saleDate: sale.saleDate
          })),
          dailyStats: Array.from(dailyStats.values())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          monthlyStats: Array.from(monthlyStats.values())
            .sort((a, b) => a.month.localeCompare(b.month)),
          performanceMetrics
        }

        setData(analyticsData)
      } else {
        console.error("[DCC_SALES_ANALYTICS] API Error:", result.message)
        throw new Error(result.message || "Failed to fetch analytics data")
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch analytics data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === "EMPLOYER" || user?.role === "BRANCH_MANAGER" || user?.role === "DCC") {
      fetchAnalyticsData()
    }
  }, [user, timeRange])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }

  if (user?.role !== "EMPLOYER" && user?.role !== "BRANCH_MANAGER" && user?.role !== "DCC") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            <CardDescription className="text-center">
              Only EMPLOYER, BRANCH_MANAGER, and DCC users can access DCC sales analytics.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-blue-600">No Analytics Data</CardTitle>
            <CardDescription className="text-center">
              No analytics data available. This could be due to:
              <br />• No sales recorded yet
              <br />• API connection issues
              <br />• Access permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => fetchAnalyticsData()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="space-y-8 p-6">
        {/* Modern Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200/50 dark:border-gray-800/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-pink-950/50" />
          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
          <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Sales Analytics
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Comprehensive insights and performance metrics
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Live Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
          </div>
              
              {/* Time Range Selector */}
              <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <Button 
                  variant={timeRange === '7' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setTimeRange('7')}
                  className={timeRange === '7' ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
            >
                  7 Days
            </Button>
            <Button 
                  variant={timeRange === '30' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setTimeRange('30')}
                  className={timeRange === '30' ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
            >
                  30 Days
            </Button>
            <Button 
                  variant={timeRange === '90' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setTimeRange('90')}
                  className={timeRange === '90' ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
            >
                  90 Days
            </Button>
          </div>
        </div>
          </div>
      </div>

        {/* Key Performance Indicators */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Sales Card */}
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Sales
            </CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors duration-300">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
          </CardHeader>
          <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.summary.totalSales}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completed orders</p>
          </CardContent>
        </Card>

          {/* Total Revenue Card */}
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Revenue
            </CardTitle>
              <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors duration-300">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
          </CardHeader>
          <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(data.summary.totalRevenue)}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gross revenue</p>
          </CardContent>
        </Card>

          {/* Commission Card */}
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Commission
            </CardTitle>
              <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors duration-300">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
          </CardHeader>
          <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(data.summary.totalCommission)}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total earned</p>
          </CardContent>
        </Card>

          {/* Average Sale Price Card */}
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Avg Sale Price
            </CardTitle>
              <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors duration-300">
                <DollarSign className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(data.summary.averageSalePrice)}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Unique DCCs Card */}
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active DCCs
              </CardTitle>
              <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors duration-300">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.summary.uniqueDCCs}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Participating DCCs</p>
          </CardContent>
        </Card>

          {/* Unique Products Card */}
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900">
            <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Products Sold
            </CardTitle>
              <div className="p-2 bg-teal-500/20 rounded-lg group-hover:bg-teal-500/30 transition-colors duration-300">
                <Package className="h-4 w-4 text-teal-600" />
              </div>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.summary.uniqueProducts}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Different products</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Analytics Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Performing DCCs */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                Top Performing DCCs
              </CardTitle>
              <CardDescription>Best performing DCCs by revenue</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {data.topDCCs.slice(0, 5).map((dcc, index) => (
                  <div key={dcc.dccId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{dcc.dccName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{dcc.totalSales} sales</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(dcc.totalRevenue)}</div>
                      <div className="text-sm text-green-600">{formatCurrency(dcc.totalCommission)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                Top Selling Products
              </CardTitle>
              <CardDescription>Most popular products by sales</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {data.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{product.productName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{product.totalQuantity} sold</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(product.totalRevenue)}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(product.averagePrice)} avg</div>
                    </div>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>
        </div>

        {/* Performance Metrics Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Sales/DCC</CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.performanceMetrics.averageSalesPerDCC.toFixed(1)}</div>
              <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (data.performanceMetrics.averageSalesPerDCC / (data.summary.totalSales || 1)) * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Sales per DCC</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Revenue/DCC</CardTitle>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(data.performanceMetrics.averageRevenuePerDCC)}</div>
              <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${Math.min(100, (data.performanceMetrics.averageRevenuePerDCC / (data.summary.totalRevenue || 1)) * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Revenue per DCC</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Top DCC</CardTitle>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{data.performanceMetrics.topPerformingDCC}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Best performer</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Product</CardTitle>
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Package className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{data.performanceMetrics.topSellingProduct}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Best seller</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales Section */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gray-500/20 rounded-lg">
                <Activity className="h-6 w-6 text-gray-600" />
              </div>
              Recent Sales Activity
            </CardTitle>
            <CardDescription>Latest sales transactions and performance</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {data.recentSales.slice(0, 10).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {sale.dccName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{sale.dccName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{sale.productName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(sale.totalRevenue)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(sale.saleDate)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
