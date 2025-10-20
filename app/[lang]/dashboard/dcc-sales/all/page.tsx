"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog-safe"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  Clock,
  RefreshCw,
  MoreHorizontal,
  Sparkles,
  Zap,
  Star,
  Info,
  Maximize2,
  Minimize2,
  SortAsc,
  SortDesc,
  Share2,
  Bookmark,
  Bell,
  Settings,
  LineChart,
  AreaChart,
  TrendingUp as TrendingUpIcon,
  Minus,
  Plus,
  Filter as FilterIcon,
  Calendar as CalendarIcon,
  Download as DownloadIcon,
  Share2 as ShareIcon,
  Bookmark as BookmarkIcon,
  Bell as BellIcon,
  Settings as SettingsIcon,
  Grid3X3,
  List,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  FileText
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface DCCSalesData {
  sales: Array<{
    id: string
    dccId: string
    productId: string
    quantity: number
    salePrice: number
    totalRevenue: number
    profit: number
    totalCommission: number
    customerName?: string
    customerPhone?: string
    notes?: string
    saleDate: string
    product: {
      id: string
      name: string
      price: number
      commission: number
    }
    dcc: {
      id: string
      name: string
      email: string
      phone?: string
    }
    pricing: {
      salesPrice: number
      purchasePrice: number
      commission: number
    }
  }>
  summary: {
    totalSales: number
    totalRevenue: number
    totalCommission: number
    averageSalePrice: number
    uniqueDCCs: number
    uniqueProducts: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    dccs: Array<{
      id: string
      name: string
      email: string
      district?: string
    }>
    products: Array<{
      id: string
      name: string
      price: number
    }>
    districts?: string[]
  }
}

export default function AllDCCSalesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DCCSalesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'analytics'>('table')
  const [sortBy, setSortBy] = useState('saleDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedCards, setExpandedCards] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSales, setSelectedSales] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all')
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<any | null>(null)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
    startDate: '',
    endDate: '',
    productId: 'all',
    dccId: 'all',
    search: '',
    district: 'all'
  })

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

  const fetchDCCSales = async (isRefresh = false) => {
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

      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') queryParams.append(key, value.toString())
      })

      const response = await fetch(`/api/v1/employer/dcc-sales?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[DCC_SALES_ALL] API Response:", result)
      if (result.success) {
        // Ensure data has proper structure even if empty
        const processedData = result.data || {
          sales: [],
          summary: {
            totalSales: 0,
            totalRevenue: 0,
            totalProfit: 0,
            totalCommission: 0,
            averageOrderValue: 0
          },
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0
          },
          filters: {
            dccs: [],
            products: [],
            districts: []
          }
        }
        setData(processedData)
      } else {
        console.error("[DCC_SALES_ALL] API Error:", result.message)
        throw new Error(result.message || "Failed to fetch DCC sales")
      }
    } catch (error) {
      console.error("Error fetching DCC sales:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch DCC sales",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user?.role === "EMPLOYER" || user?.role === "BRANCH_MANAGER" || user?.role === "DCC") {
      fetchDCCSales()
    }
  }, [user, filters])

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
    handleFilterChange('search', searchInput.trim())
  }

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 100,
      startDate: '',
      endDate: '',
      productId: 'all',
      dccId: 'all',
      search: '',
      district: 'all'
    })
    setSearchQuery('')
    setSearchInput('')
  }

  const handleRefresh = () => {
    fetchDCCSales(true)
  }

  const handleExport = () => {
    if (!data) return
    const rows = (data.sales as any[]).filter(
      (s) => selectedDistrict === 'all' || (s?.dcc?.district ?? 'all') === selectedDistrict
    )

    const headers = [
      'Sale ID',
      'Date',
      'DCC Name',
      'District',
      'Product',
      'Quantity',
      'Sale Price',
      'Revenue',
      'Commission',
      'Customer Name',
      'Customer Phone',
    ]

    const escape = (val: any) => {
      if (val === null || val === undefined) return ''
      const str = String(val)
      if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"'
      }
      return str
    }

    const csvLines = [headers.join(',')]
    for (const s of rows) {
      csvLines.push(
        [
          s.id,
          new Date(s.saleDate).toISOString(),
          s?.dcc?.name ?? '',
          s?.dcc?.district ?? '',
          s?.product?.name ?? '',
          s.quantity,
          s.salePrice,
          s.totalRevenue,
          s.totalCommission,
          s.customerName ?? '',
          s.customerPhone ?? '',
        ]
          .map(escape)
          .join(',')
      )
    }

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    a.download = `dcc-sales-${selectedDistrict}-export-${dateStr}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Debounce search input updates to filters
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      handleFilterChange('search', searchInput.trim())
    }, 350)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [searchInput])

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  const handleViewDetails = (sale: any) => {
    setSelectedSale(sale)
    setIsDetailOpen(true)
  }

  const handleCopyDetails = async (sale: any) => {
    const details = `Sale ${sale.id}\nDCC: ${sale.dcc.name}${sale.dcc.phone ? ` (${sale.dcc.phone})` : ''}\nProduct: ${sale.product.name}\nQuantity: ${sale.quantity}\nRevenue: ${formatCurrency(sale.totalRevenue)}\nCommission: ${formatCurrency(sale.totalCommission)}`
    try {
      await navigator.clipboard.writeText(details)
      toast({ title: "Copied", description: "Sale details copied to clipboard." })
    } catch (error) {
      toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" })
    }
  }

  const getTrendIcon = (value: number, previousValue: number) => {
    if (value > previousValue) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (value < previousValue) return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
        </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-blue-600">No Data</CardTitle>
            <CardDescription className="text-center">
              No DCC sales data available. This could be due to:
              <br />• No sales recorded yet
              <br />• API connection issues
              <br />• Access permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => fetchDCCSales()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

        return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse bg-blue-400 dark:bg-blue-500"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 animate-pulse delay-1000 bg-purple-400 dark:bg-purple-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 animate-pulse delay-2000 bg-indigo-400 dark:bg-indigo-500"></div>
                </div>
        
        <div className="relative z-10 space-y-8 p-6">
          {/* View Controls */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              onClick={() => setViewMode('table')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <List className="h-4 w-4" />
              Table View
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-2 bg-white/50 dark:bg-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 border-white/30 dark:border-slate-600/30"
            >
              <Grid3X3 className="h-4 w-4" />
              Grid View
            </Button>
            <Button
              variant={viewMode === 'analytics' ? 'default' : 'outline'}
              onClick={() => setViewMode('analytics')}
              className="flex items-center gap-2 bg-white/50 dark:bg-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 border-white/30 dark:border-slate-600/30"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>

          {/* Enhanced Analytics Dashboard */}
          <div className="space-y-6">
            {/* Key Performance Metrics */}
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="group relative overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Sales</CardTitle>
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <TrendingUp className="h-4 w-4 text-white" />
              </div>
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 group-hover:scale-105 transition-transform duration-300">
                {data.summary.totalSales.toLocaleString()}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {data.summary.uniqueDCCs} active DCCs
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">+12.5%</span>
              </div>
          </CardContent>
        </Card>
        
                <Card className="group relative overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Total Revenue</CardTitle>
                    <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                      <DollarSign className="h-4 w-4 text-white" />
              </div>
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-green-900 dark:text-green-100 group-hover:scale-105 transition-transform duration-300">
                {formatCurrency(data.summary.totalRevenue)}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Avg: {formatCurrency(data.summary.averageSalePrice)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">+18.3%</span>
              </div>
          </CardContent>
        </Card>
        
                <Card className="group relative overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Commission</CardTitle>
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                      <Award className="h-4 w-4 text-white" />
              </div>
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 group-hover:scale-105 transition-transform duration-300">
                {formatCurrency(data.summary.totalCommission)}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      {data.summary.uniqueProducts} products
            </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">+8.7%</span>
              </div>
          </CardContent>
        </Card>
        
                <Card className="group relative overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">Avg Order</CardTitle>
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                      <Target className="h-4 w-4 text-white" />
              </div>
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 group-hover:scale-105 transition-transform duration-300">
                      {formatCurrency(data.summary.averageSalePrice)}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      Per transaction
            </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">+5.2%</span>
              </div>
          </CardContent>
        </Card>
              </div>
            </div>
          </div>

          {/* Advanced Filters & Search */}
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-700/50 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    Advanced Filters & Search
                  </CardTitle>
                  <CardDescription>Filter and search through sales data</CardDescription>
                </div>
              <Button
                variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
              >
                  <Filter className="h-4 w-4" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by DCC name, product, customer..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-10 bg-white/50 dark:bg-slate-700/50 border-white/30 dark:border-slate-600/30"
                      />
          </div>
        </div>
                  <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                    </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div>
                      <Label htmlFor="district-filter">District</Label>
                        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                        <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-white/30 dark:border-slate-600/30">
                          <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Districts</SelectItem>
                          {data.filters.districts?.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                    <div>
                      <Label htmlFor="dcc-filter">DCC</Label>
                      <Select value={filters.dccId} onValueChange={(value) => handleFilterChange('dccId', value)}>
                        <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-white/30 dark:border-slate-600/30">
                          <SelectValue placeholder="Select DCC" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All DCCs</SelectItem>
                          {data.filters.dccs.map((dcc) => (
                            <SelectItem key={dcc.id} value={dcc.id}>
                              {dcc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>

                    <div>
                      <Label htmlFor="product-filter">Product</Label>
                      <Select value={filters.productId} onValueChange={(value) => handleFilterChange('productId', value)}>
                        <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-white/30 dark:border-slate-600/30">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Products</SelectItem>
                          {data.filters.products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                </div>

                    <div>
                      <Label htmlFor="date-range">Date Range</Label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange('startDate', e.target.value)}
                          className="bg-white/50 dark:bg-slate-700/50 border-white/30 dark:border-slate-600/30"
                        />
                        <Input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange('endDate', e.target.value)}
                          className="bg-white/50 dark:bg-slate-700/50 border-white/30 dark:border-slate-600/30"
                        />
                      </div>
                    </div>
                  </div>
                )}
          </div>
              </CardContent>
            </Card>

          {/* Comprehensive Sales Table */}
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-700/50 shadow-xl">
            <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    All Sales Records
                          </CardTitle>
                  <CardDescription>
                    {data.pagination.total} total sales • Page {data.pagination.page} of {data.pagination.pages}
                  </CardDescription>
                        </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    onClick={() => setViewMode('table')}
                    className="flex items-center gap-2"
                  >
                    <List className="h-4 w-4" />
                    Table View
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    onClick={() => setViewMode('grid')}
                    className="flex items-center gap-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Grid View
                  </Button>
                      </div>
                    </div>
                  </CardHeader>
            <CardContent>
              {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300">Sale ID</TableHead>
                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300">Date & Time</TableHead>
                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300">DCC Information</TableHead>
                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300">Product Details</TableHead>
                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300">Quantity</TableHead>
                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300">Unit Price</TableHead>
                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300">Total Revenue</TableHead>
                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300">Commission</TableHead>
                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300">Profit</TableHead>
                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300">Customer</TableHead>
                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300">District</TableHead>
                        <TableHead className="font-semibold text-blue-700 dark:text-blue-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.sales.map((sale) => (
                        <TableRow key={sale.id} className="border-gray-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950 dark:hover:to-purple-950 transition-all duration-200">
                          <TableCell className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {sale.id.slice(-8)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{new Date(sale.saleDate).toLocaleDateString()}</span>
                        </div>
                              <div className="text-xs text-gray-500">
                                {new Date(sale.saleDate).toLocaleTimeString()}
                      </div>
                        </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                                  {sale.dcc.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">{sale.dcc.name}</div>
                                <div className="text-xs text-gray-500">{sale.dcc.email}</div>
                                {sale.dcc.phone && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {sale.dcc.phone}
                      </div>
                                )}
                    </div>
                            </div>
                          </TableCell>
                          <TableCell>
                      <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
                                <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                              <div>
                                <div className="font-medium text-sm">{sale.product.name}</div>
                                <div className="text-xs text-gray-500">ID: {sale.product.id.slice(-6)}</div>
                                <div className="text-xs text-gray-500">Base: {formatCurrency(sale.product.price)}</div>
                      </div>
                    </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-semibold text-lg px-3 py-1">
                              {sale.quantity}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-lg">
                            {formatCurrency(sale.salePrice)}
                          </TableCell>
                          <TableCell className="font-semibold text-lg text-green-600 dark:text-green-400">
                            {formatCurrency(sale.totalRevenue)}
                          </TableCell>
                          <TableCell className="font-semibold text-lg text-purple-600 dark:text-purple-400">
                            {formatCurrency(sale.totalCommission)}
                          </TableCell>
                          <TableCell className="font-semibold text-lg text-orange-600 dark:text-orange-400">
                            {formatCurrency(sale.profit)}
                          </TableCell>
                          <TableCell>
                            {sale.customerName ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs">
                              {sale.customerName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                                  <div className="font-medium text-sm">{sale.customerName}</div>
                            {sale.customerPhone && (
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {sale.customerPhone}
                              </div>
                            )}
                          </div>
                        </div>
                            ) : (
                              <span className="text-gray-400 text-sm italic">No customer info</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {(sale.dcc as any).district || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDetails(sale)}
                                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900 dark:hover:text-blue-400"
                                  >
                                    <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopyDetails(sale)}
                                    className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900 dark:hover:text-green-400"
                                  >
                                    <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                          </TableCell>
                        </TableRow>
              ))}
                    </TableBody>
                  </Table>
            </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.sales.map((sale) => (
                    <Card key={sale.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-mono text-xs">
                            {sale.id.slice(-8)}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(sale)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyDetails(sale)}
                              className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                    </div>
                      </div>
                </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {sale.dcc.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{sale.dcc.name}</div>
                            <div className="text-sm text-gray-500">{sale.dcc.email}</div>
                          </div>
                          </div>
                        
                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <Package className="h-4 w-4 text-green-500" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{sale.product.name}</div>
                            <div className="text-xs text-gray-500">Qty: {sale.quantity}</div>
                    </div>
                          </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                            <div className="text-sm font-semibold text-green-600">
                              {formatCurrency(sale.totalRevenue)}
                    </div>
                            <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                          <div className="text-center p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                            <div className="text-sm font-semibold text-purple-600">
                              {formatCurrency(sale.totalCommission)}
                      </div>
                            <div className="text-xs text-gray-500">Commission</div>
                      </div>
                    </div>
                    
                        {sale.customerName && (
                          <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <Users className="h-4 w-4 text-blue-500" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{sale.customerName}</div>
                              {sale.customerPhone && (
                                <div className="text-xs text-gray-500">{sale.customerPhone}</div>
                              )}
                        </div>
                      </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(sale.saleDate).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
                  ))}
            </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
        {data.pagination.pages > 1 && (
            <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/50 dark:border-slate-700/50 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                    {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                    {data.pagination.total} results
                  </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(data.pagination.page - 1)}
                      disabled={data.pagination.page === 1}
                  >
                      <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                        const pageNum = i + 1
                      return (
                        <Button
                          key={pageNum}
                          variant={data.pagination.page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(data.pagination.page + 1)}
                      disabled={data.pagination.page === data.pagination.pages}
                  >
                    Next
                      <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>

      {/* Sales Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Sale Details - {selectedSale?.id?.slice(-8)}
            </DialogTitle>
            <DialogDescription>
              Complete information about this sales transaction
            </DialogDescription>
            </DialogHeader>
          
            {selectedSale && (
              <div className="space-y-6">
              {/* Sale Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Sale Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Sale ID</div>
                      <div className="text-lg font-mono font-bold text-blue-900 dark:text-blue-100">{selectedSale.id}</div>
                  </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-sm font-medium text-green-700 dark:text-green-300">Sale Date</div>
                      <div className="text-lg font-bold text-green-900 dark:text-green-100">
                        {new Date(selectedSale.saleDate).toLocaleDateString()}
                  </div>
                </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Quantity</div>
                      <div className="text-lg font-bold text-purple-900 dark:text-purple-100">{selectedSale.quantity}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DCC Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    DCC Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                        {selectedSale.dcc.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="grid gap-2 md:grid-cols-2">
                        <div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</div>
                          <div className="text-lg font-semibold">{selectedSale.dcc.name}</div>
                  </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</div>
                          <div className="text-lg">{selectedSale.dcc.email}</div>
                  </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</div>
                          <div className="text-lg">{selectedSale.dcc.phone || 'Not provided'}</div>
                  </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">DCC ID</div>
                          <div className="text-lg font-mono">{selectedSale.dcc.id}</div>
                </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                    <div className="flex-1">
                      <div className="grid gap-2 md:grid-cols-2">
                        <div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Product Name</div>
                          <div className="text-lg font-semibold">{selectedSale.product.name}</div>
                  </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Product ID</div>
                          <div className="text-lg font-mono">{selectedSale.product.id}</div>
                </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Base Price</div>
                          <div className="text-lg">{formatCurrency(selectedSale.product.price)}</div>
              </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission Rate</div>
                          <div className="text-lg">{selectedSale.product.commission}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                      <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Sale Price</div>
                      <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(selectedSale.salePrice)}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">per unit</div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                      <div className="text-sm font-medium text-green-700 dark:text-green-300">Total Revenue</div>
                      <div className="text-xl font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(selectedSale.totalRevenue)}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">quantity × price</div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg text-center">
                      <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Commission</div>
                      <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                        {formatCurrency(selectedSale.totalCommission)}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">{selectedSale.product.commission}%</div>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg text-center">
                      <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Profit</div>
                      <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                        {formatCurrency(selectedSale.profit)}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-400">revenue - commission</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              {selectedSale.customerName && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xl">
                          {selectedSale.customerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="grid gap-2 md:grid-cols-2">
                          <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer Name</div>
                            <div className="text-lg font-semibold">{selectedSale.customerName}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</div>
                            <div className="text-lg">{selectedSale.customerPhone || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Notes */}
              {selectedSale.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      Additional Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">{selectedSale.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

            <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedSale && handleCopyDetails(selectedSale)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Details
            </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </TooltipProvider>
  )
}