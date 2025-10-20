"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Package, 
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  Clock,
  Eye,
  Download,
  RefreshCw,
  Filter,
  MoreHorizontal,
  Sparkles,
  Zap,
  Star,
  TrendingUp as TrendingUpIcon,
  Info,
  ChevronRight,
  BarChart,
  PieChart as PieChartIcon,
  LineChart,
  AreaChart,
  TrendingUp as TrendingUpChart,
  Minus,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Filter as FilterIcon,
  Calendar as CalendarIcon,
  Download as DownloadIcon,
  Share2,
  Bookmark,
  Bell,
  Settings,
  Maximize2,
  Minimize2
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface OverviewData {
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
  }>
  topProducts: Array<{
    productId: string
    productName: string
    totalSales: number
    totalRevenue: number
    totalQuantity: number
  }>
  recentSales: Array<{
    id: string
    dccName: string
    productName: string
    quantity: number
    totalRevenue: number
    saleDate: string
  }>
  dailyStats: Array<{
    date: string
    sales: number
    revenue: number
    commission: number
  }>
}

export default function DCCSalesOverviewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30') // days
  const [refreshing, setRefreshing] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('revenue')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedCards, setExpandedCards] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Check if user has EMPLOYER, BRANCH_MANAGER, or DCC role
  useEffect(() => {
    if (user && user.role !== "EMPLOYER" && user.role !== "BRANCH_MANAGER" && user.role !== "DCC") {
      toast({
        title: "Access Denied",
        description: "Only EMPLOYER, BRANCH_MANAGER, and DCC users can access DCC sales data.",
        variant: "destructive"
      })
      router.push("/en/dashboard")
    }
  }, [user, router])

  const fetchOverviewData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
      setLoading(true)
      }
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Fetch data for the selected time range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(timeRange))

      const response = await fetch(`/api/v1/employer/dcc-sales?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        // Process the data to create overview statistics
        const sales = result.data.sales
        
        // Calculate top DCCs
        const dccStats = new Map()
        sales.forEach((sale: any) => {
          const dccId = sale.dccId
          if (!dccStats.has(dccId)) {
            dccStats.set(dccId, {
              dccId,
              dccName: sale.dcc.name,
              totalSales: 0,
              totalRevenue: 0,
              totalCommission: 0
            })
          }
          const stats = dccStats.get(dccId)
          stats.totalSales += 1
          stats.totalRevenue += sale.totalRevenue
          stats.totalCommission += sale.totalCommission
        })

        // Calculate top products
        const productStats = new Map()
        sales.forEach((sale: any) => {
          const productId = sale.productId
          if (!productStats.has(productId)) {
            productStats.set(productId, {
              productId,
              productName: sale.product.name,
              totalSales: 0,
              totalRevenue: 0,
              totalQuantity: 0
            })
          }
          const stats = productStats.get(productId)
          stats.totalSales += 1
          stats.totalRevenue += sale.totalRevenue
          stats.totalQuantity += sale.quantity
        })

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

        const overviewData: OverviewData = {
          summary: result.data.summary,
          topDCCs: Array.from(dccStats.values())
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5),
          topProducts: Array.from(productStats.values())
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5),
          recentSales: sales.slice(0, 10).map((sale: any) => ({
            id: sale.id,
            dccName: sale.dcc.name,
            productName: sale.product.name,
            quantity: sale.quantity,
            totalRevenue: sale.totalRevenue,
            saleDate: sale.saleDate
          })),
          dailyStats: Array.from(dailyStats.values())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        }

        setData(overviewData)
      } else {
        throw new Error(result.message || "Failed to fetch overview data")
      }
    } catch (error) {
      console.error("Error fetching overview data:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch overview data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user?.role === "EMPLOYER" || user?.role === "BRANCH_MANAGER" || user?.role === "DCC") {
      fetchOverviewData()
    }
  }, [user, timeRange])

  const handleRefresh = () => {
    fetchOverviewData(true)
  }

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  const getTrendIcon = (value: number, previousValue: number) => {
    if (value > previousValue) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (value < previousValue) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = (value: number, previousValue: number) => {
    if (value > previousValue) return "text-green-600"
    if (value < previousValue) return "text-red-600"
    return "text-gray-600"
  }

  const formatPercentage = (value: number, previousValue: number) => {
    if (previousValue === 0) return "0%"
    const percentage = ((value - previousValue) / previousValue) * 100
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (user?.role !== "EMPLOYER" && user?.role !== "BRANCH_MANAGER" && user?.role !== "DCC") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            <CardDescription className="text-center">
              Only EMPLOYER, BRANCH_MANAGER, and DCC users can access DCC sales data.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="relative overflow-hidden border-0 shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gray-200/20 rounded-full -translate-y-10 translate-x-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Analytics Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-t-lg">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-32 mb-2" />
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-6 w-24 mb-1" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
            <CardDescription className="text-center">
              Failed to load overview data.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        {/* Header removed as requested */}

        {/* Advanced Filters Panel */}
        {showFilters && (
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 animate-in slide-in-from-top-2 duration-300">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Metric</label>
                    <select 
                      value={selectedMetric} 
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="revenue">Revenue</option>
                      <option value="sales">Sales Count</option>
                      <option value="commission">Commission</option>
                      <option value="dccs">Active DCCs</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="revenue">Revenue</option>
                      <option value="sales">Sales</option>
                      <option value="commission">Commission</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Order</label>
                    <div className="flex gap-2">
                      <Button
                        variant={sortOrder === 'desc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortOrder('desc')}
                        className="flex-1"
                      >
                        <SortDesc className="h-4 w-4 mr-1" />
                        Desc
                      </Button>
                      <Button
                        variant={sortOrder === 'asc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortOrder('asc')}
                        className="flex-1"
                      >
                        <SortAsc className="h-4 w-4 mr-1" />
                        Asc
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quick Actions</label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Bookmark className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Bell className="h-4 w-4 mr-1" />
                        Alert
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Ultra-Modern Summary Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative overflow-hidden border-0 shadow-2xl bg-white dark:bg-gray-900 hover:shadow-3xl transition-all duration-700 hover:scale-110 hover:-rotate-1 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
            {/* Advanced Background Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-right delay-100"></div>
          
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-sm font-bold text-blue-700 dark:text-blue-300 cursor-help group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors duration-300">Total Sales</CardTitle>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total number of sales transactions completed in the selected period</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex items-center gap-3">
                  {getTrendIcon(data.summary.totalSales, data.summary.totalSales * 0.9)}
                  <span className={`text-xs font-semibold ${getTrendColor(data.summary.totalSales, data.summary.totalSales * 0.9)}`}>
                    {formatPercentage(data.summary.totalSales, data.summary.totalSales * 0.9)} vs last period
                  </span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl group-hover:from-blue-500/30 group-hover:to-indigo-500/30 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                <TrendingUp className="h-7 w-7 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="text-5xl font-black text-blue-900 dark:text-blue-100 group-hover:scale-110 transition-transform duration-500 group-hover:text-blue-800 dark:group-hover:text-blue-200">
                {data.summary.totalSales.toLocaleString()}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {data.summary.uniqueDCCs} active DCCs
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-blue-500/20 rounded-xl"
                  onClick={() => toggleCardExpansion('sales')}
                >
                  {expandedCards.includes('sales') ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
              {expandedCards.includes('sales') && (
                <div className="space-y-3 pt-3 border-t border-blue-200/50 dark:border-blue-800/50 animate-in slide-in-from-top-2 duration-500">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600 font-medium">Avg per DCC:</span>
                    <span className="font-bold">{(data.summary.totalSales / data.summary.uniqueDCCs).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600 font-medium">Growth Rate:</span>
                    <span className="font-bold text-green-600">+12.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600 font-medium">Conversion:</span>
                    <span className="font-bold text-purple-600">85.2%</span>
                  </div>
                </div>
              )}
            </CardContent>
        </Card>
        
          <Card className="group relative overflow-hidden border-0 shadow-2xl bg-white dark:bg-gray-900 hover:shadow-3xl transition-all duration-700 hover:scale-110 hover:rotate-1 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
            {/* Advanced Background Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400/10 to-transparent rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-right delay-100"></div>
          
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-sm font-bold text-green-700 dark:text-green-300 cursor-help group-hover:text-green-800 dark:group-hover:text-green-200 transition-colors duration-300">Total Revenue</CardTitle>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total revenue generated from all sales transactions</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex items-center gap-3">
                  {getTrendIcon(data.summary.totalRevenue, data.summary.totalRevenue * 0.85)}
                  <span className={`text-xs font-semibold ${getTrendColor(data.summary.totalRevenue, data.summary.totalRevenue * 0.85)}`}>
                    {formatPercentage(data.summary.totalRevenue, data.summary.totalRevenue * 0.85)} vs last period
                  </span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                <DollarSign className="h-7 w-7 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="text-5xl font-black text-green-900 dark:text-green-100 group-hover:scale-110 transition-transform duration-500 group-hover:text-green-800 dark:group-hover:text-green-200">
                {formatCurrency(data.summary.totalRevenue)}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                    Avg: {formatCurrency(data.summary.averageSalePrice)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-green-500/20 rounded-xl"
                  onClick={() => toggleCardExpansion('revenue')}
                >
                  {expandedCards.includes('revenue') ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
              {expandedCards.includes('revenue') && (
                <div className="space-y-3 pt-3 border-t border-green-200/50 dark:border-green-800/50 animate-in slide-in-from-top-2 duration-500">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">Revenue per DCC:</span>
                    <span className="font-bold">{formatCurrency(data.summary.totalRevenue / data.summary.uniqueDCCs)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">Growth Rate:</span>
                    <span className="font-bold text-green-600">+18.3%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">Profit Margin:</span>
                    <span className="font-bold text-blue-600">24.5%</span>
                  </div>
                </div>
              )}
            </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 cursor-help">Total Commission</CardTitle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total commission earned by DCCs</p>
              </TooltipContent>
            </Tooltip>
            <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors duration-300">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 group-hover:scale-110 transition-transform duration-300">
              {formatCurrency(data.summary.totalCommission)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <p className="text-sm text-purple-700 dark:text-purple-300">
              DCC earnings
            </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-400">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 cursor-help">Active DCCs</CardTitle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Number of DCCs with sales activity</p>
              </TooltipContent>
            </Tooltip>
            <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors duration-300">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 group-hover:scale-110 transition-transform duration-300">
              {data.summary.uniqueDCCs}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Activity className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-orange-700 dark:text-orange-300">
              With sales activity
            </p>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Ultra-Modern Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-500">
          {/* Enhanced Revenue Trend Chart */}
          <Card className="lg:col-span-2 border-0 shadow-2xl bg-white dark:bg-gray-900 hover:shadow-3xl transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-slate-50 via-blue-50 to-purple-50 dark:from-slate-800 dark:via-blue-900 dark:to-purple-900 rounded-t-lg border-b border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg">
                    <LineChart className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Revenue Trend Analysis</CardTitle>
                    <CardDescription className="text-base font-medium">Real-time daily revenue performance tracking</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white/80 border-blue-200 hover:border-blue-300">
                    <AreaChart className="h-4 w-4 mr-2" />
                    Area
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white/80 border-purple-200 hover:border-purple-300">
                    <BarChart className="h-4 w-4 mr-2" />
                    Bar
                  </Button>
                </div>
              </div>
            </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUpChart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Interactive Chart</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Revenue trend visualization would appear here</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Target</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-800 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <PieChartIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversion Rate</span>
                <span className="text-lg font-bold text-green-600">85.2%</span>
              </div>
              <Progress value={85.2} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Order Value</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(data.summary.averageSalePrice)}</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Customer Satisfaction</span>
                <span className="text-lg font-bold text-purple-600">4.8/5</span>
              </div>
              <Progress value={96} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Retention Rate</span>
                <span className="text-lg font-bold text-orange-600">92.1%</span>
              </div>
              <Progress value={92.1} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-600">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Growth Rate</div>
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">+12.5%</div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-green-700 dark:text-green-300">Conversion</div>
              <div className="text-lg font-bold text-green-900 dark:text-green-100">85.2%</div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Avg Rating</div>
              <div className="text-lg font-bold text-purple-900 dark:text-purple-100">4.8/5</div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <TrendingUpIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Trend</div>
              <div className="text-lg font-bold text-orange-900 dark:text-orange-100">↗ Rising</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analytics with Tabs */}
      <Tabs defaultValue="dccs" className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-600">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="dccs" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            <Users className="h-4 w-4" />
            Top DCCs
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            <Package className="h-4 w-4" />
            Top Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dccs" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-white dark:bg-gray-900 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              Top Performing DCCs
            </CardTitle>
              <CardDescription className="text-base">
                DCCs with highest revenue performance in the last {timeRange} days
            </CardDescription>
          </CardHeader>
            <CardContent className="p-6">
            <div className="space-y-4">
                {data.topDCCs.map((dcc, index) => {
                  const maxRevenue = Math.max(...data.topDCCs.map(d => d.totalRevenue))
                  const percentage = (dcc.totalRevenue / maxRevenue) * 100
                  
                  return (
                    <div key={dcc.dccId} className="group p-4 border rounded-xl hover:shadow-md transition-all duration-200 hover:border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Badge 
                              variant={index < 3 ? "default" : "secondary"} 
                              className={`w-8 h-8 flex items-center justify-center p-0 text-sm font-bold ${
                                index === 0 ? 'bg-yellow-500 hover:bg-yellow-600' :
                                index === 1 ? 'bg-gray-400 hover:bg-gray-500' :
                                index === 2 ? 'bg-amber-600 hover:bg-amber-700' :
                                'bg-gray-200 hover:bg-gray-300'
                              }`}
                            >
                      {index + 1}
                    </Badge>
                            {index < 3 && (
                              <div className="absolute -top-1 -right-1">
                                <Award className="h-3 w-3 text-yellow-500" />
                              </div>
                            )}
                          </div>
                    <div>
                            <div className="font-semibold text-lg">{dcc.dccName}</div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                        {dcc.totalSales} sales
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {formatCurrency(dcc.totalRevenue / dcc.totalSales)} avg
                              </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(dcc.totalRevenue)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                      {formatCurrency(dcc.totalCommission)} commission
                    </div>
                  </div>
                </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Performance</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-white dark:bg-gray-900 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              Top Selling Products
            </CardTitle>
              <CardDescription className="text-base">
                Products with highest sales performance in the last {timeRange} days
            </CardDescription>
          </CardHeader>
            <CardContent className="p-6">
            <div className="space-y-4">
                {data.topProducts.map((product, index) => {
                  const maxRevenue = Math.max(...data.topProducts.map(p => p.totalRevenue))
                  const percentage = (product.totalRevenue / maxRevenue) * 100
                  
                  return (
                    <div key={product.productId} className="group p-4 border rounded-xl hover:shadow-md transition-all duration-200 hover:border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Badge 
                              variant={index < 3 ? "default" : "secondary"} 
                              className={`w-8 h-8 flex items-center justify-center p-0 text-sm font-bold ${
                                index === 0 ? 'bg-yellow-500 hover:bg-yellow-600' :
                                index === 1 ? 'bg-gray-400 hover:bg-gray-500' :
                                index === 2 ? 'bg-amber-600 hover:bg-amber-700' :
                                'bg-gray-200 hover:bg-gray-300'
                              }`}
                            >
                      {index + 1}
                    </Badge>
                            {index < 3 && (
                              <div className="absolute -top-1 -right-1">
                                <Award className="h-3 w-3 text-yellow-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-lg">{product.productName}</div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                {product.totalQuantity} units sold
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                {product.totalSales} sales
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(product.totalRevenue)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(product.totalRevenue / product.totalQuantity)} per unit
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Performance</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Daily Performance Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-white dark:bg-gray-900 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            Daily Sales Performance
          </CardTitle>
          <CardDescription className="text-base">
            Sales and revenue trends over the last {timeRange} days
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {data.dailyStats.slice(-14).map((day) => {
              const maxRevenue = Math.max(...data.dailyStats.map(d => d.revenue))
              const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
              
              return (
                <div key={day.date} className="group p-4 border rounded-xl hover:shadow-md transition-all duration-200 hover:border-indigo-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                    <div>
                        <div className="font-semibold text-lg">{formatDate(day.date)}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {day.sales} sales
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {formatCurrency(day.commission)} commission
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-indigo-600">
                        {formatCurrency(day.revenue)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Revenue
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              )
            })}
          </div>
          
          {data.dailyStats.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Daily Data</h3>
              <p className="text-gray-500 dark:text-gray-400">No sales data available for the selected time period.</p>
            </div>
          )}
          </CardContent>
        </Card>

      {/* Enhanced Recent Sales */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-white dark:bg-gray-900 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
      </div>
            Recent Sales Activity
          </CardTitle>
              <CardDescription className="text-base mt-2">
                Latest sales transactions across all DCCs in the last {timeRange} days
          </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="transition-all duration-200">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {data.recentSales.map((sale, index) => (
              <div key={sale.id} className="group p-4 border rounded-xl hover:shadow-md transition-all duration-200 hover:border-purple-200 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                  </div>
                  <div>
                      <div className="font-semibold text-lg">{sale.productName}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {sale.dccName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {sale.quantity} units
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(sale.saleDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(sale.totalRevenue)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Completed</span>
                </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {data.recentSales.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Recent Sales</h3>
              <p className="text-gray-500 dark:text-gray-400">No sales activity found for the selected time period.</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  )
}
