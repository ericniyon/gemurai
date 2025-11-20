"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Milk, 
  Users, 
  DollarSign,
  Package,
  TrendingUp,
  Activity,
  Settings, 
  Bell,
  AlertTriangle,
  ShoppingCart,
  Building2,
  MapPin,
  LineChart,
  ClipboardList,
  ShieldCheck,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formatStatusLabel = (status: string) =>
  status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

const pageBackgroundClasses = "bg-gradient-to-br from-slate-50 via-white to-blue-50/40"
const cardBaseClasses =
  "relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md shadow-xl shadow-blue-100/50 transition hover:shadow-2xl hover:shadow-blue-100/70"
const sectionCardClasses =
  "rounded-[32px] border-2 border-blue-100/70 bg-white/80 backdrop-blur-xl shadow-[0_25px_70px_rgba(15,23,42,0.08)] p-4 sm:p-6 space-y-4"
const quickActionButtonClasses =
  "w-full justify-start rounded-xl border border-white/60 bg-white/70 backdrop-blur text-xs sm:text-sm md:text-base h-12 sm:h-10 md:h-11 px-3 sm:px-4 shadow-sm transition hover:bg-white hover:shadow-lg"

interface DashboardData {
  totalMCCs: number
  totalFarmers: number
  dailyVolume: {
    liters: number
    collections: number
  }
  payoutDue: {
    amount: number
    collections: number
  }
  lowStockAlerts: Array<{
    id: string
    name: string
    sku: string
    currentStock: number
    reorderPoint: number
    alert: string
  }>
  rentalAssetsOut: Array<{
    id: string
    asset: {
      name: string
      serial: string
    }
    farmer: {
      name: string
      farmerCode: string
    }
    daysOut: number
  }>
  recentCollections: Array<{
    id: string
    collectionDate: string
    totalLiters: number
    farmers: {
      name: string
      farmerCode: string
    }
    mccs: {
      id: string
      name: string
      code: string
    }
  }>
  mccPerformance?: Array<{
    id: string
    name: string
    code: string
    region: string
    dailyVolume: number
    totalFarmers: number
    activeFarmers: number
    collections: number
    payoutDue: number
  }>
  regionalStats?: Array<{
    region: string
    mccCount: number
    totalFarmers: number
    dailyVolume: number
  }>
  qualityMetrics?: {
    accepted: { count: number; liters: number }
    rejected: { count: number; liters: number }
    pending: { count: number; liters: number }
  }
  farmersSummary?: {
    total: number
    active: number
  }
  collectionsStats?: {
    total: number
    accepted: number
    pending: number
    totalVolume: number
  }
  sales?: {
    totalLiters: number
    totalRevenue: number
    totalSales: number
    acceptedSales: number
    rejectedSales: number
  }
  customers?: {
    total: number
    active: number
    avgPricePerLiter: number
    totalRevenue: number
  }
  suppliers?: {
    total: number
    active: number
    avgPricePerLiter: number
    totalProduction: number
  }
  trends?: {
    collections: Array<{ date: string; liters: number }>
    sales: Array<{ date: string; liters: number }>
  }
  recentActivity?: Array<{
    id: string
    type: string
    description: string
    date: string
    amount: number
    farmer?: {
      id: string
      name: string
      phone: string
    }
  }>
}

export default function SuperadminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [performanceSort, setPerformanceSort] = useState<"volume" | "farmers" | "payout">("volume")
  const [trendWindow, setTrendWindow] = useState<"7" | "14" | "30">("7")
  const alertsSectionRef = useRef<HTMLDivElement | null>(null)
  const managerToolkitRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const sortedPerformance = useMemo(() => {
    if (!dashboardData?.mccPerformance) {
      return []
    }
    return [...dashboardData.mccPerformance].sort((a, b) => {
      switch (performanceSort) {
        case "farmers":
          return (b.totalFarmers || 0) - (a.totalFarmers || 0)
        case "payout":
          return (b.payoutDue || 0) - (a.payoutDue || 0)
        default:
          return (b.dailyVolume || 0) - (a.dailyVolume || 0)
      }
    })
  }, [dashboardData?.mccPerformance, performanceSort])

  const trendSummary = useMemo(() => {
    if (!dashboardData?.trends) {
      return null
    }
    const windowSize = Number(trendWindow)
    const collectionsSeries = dashboardData.trends.collections.slice(-windowSize)
    const salesSeries = dashboardData.trends.sales.slice(-windowSize)
    if (collectionsSeries.length === 0 && salesSeries.length === 0) {
      return null
    }
    const salesMap = new Map(salesSeries.map((entry) => [entry.date, entry.liters]))
    const latestRows = collectionsSeries.slice(-5).map((entry) => ({
      date: entry.date,
      collections: entry.liters,
      sales: salesMap.get(entry.date) || 0,
    }))
    const collectionsTotal = collectionsSeries.reduce((sum, entry) => sum + entry.liters, 0)
    const salesTotal = salesSeries.reduce((sum, entry) => sum + entry.liters, 0)
    return {
      collectionsTotal,
      salesTotal,
      collectionsAvg: collectionsSeries.length ? collectionsTotal / collectionsSeries.length : 0,
      salesAvg: salesSeries.length ? salesTotal / salesSeries.length : 0,
      rows: latestRows,
    }
  }, [dashboardData?.trends, trendWindow])

  const qualitySummary = useMemo(() => {
    if (!dashboardData?.qualityMetrics) {
      return null
    }
    const entries = Object.entries(dashboardData.qualityMetrics)
    if (entries.length === 0) {
      return null
    }
    const totalLiters = entries.reduce((sum, [, data]) => sum + (data?.liters || 0), 0)
    return {
      totalLiters,
      statuses: entries.map(([status, data]) => ({
        status,
        count: data?.count || 0,
        liters: data?.liters || 0,
        percentage: totalLiters ? (((data?.liters || 0) / totalLiters) * 100) : 0,
      })),
    }
  }, [dashboardData?.qualityMetrics])

  const formatDateLabel = (dateString: string) =>
    new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })

  const collectionsStats = dashboardData?.collectionsStats
  const salesStats = dashboardData?.sales
  const customersStats = dashboardData?.customers
  const suppliersStats = dashboardData?.suppliers
  const farmerStats = dashboardData?.farmersSummary
  const pendingCollections = collectionsStats?.pending || 0
  const rejectedSales = salesStats?.rejectedSales || 0
  const acceptanceRate = collectionsStats?.total
    ? Math.round(((collectionsStats.accepted || 0) / (collectionsStats.total || 1)) * 100)
    : 0
  const salesConversionRate = salesStats?.totalSales
    ? Math.round((((salesStats.acceptedSales || 0) / (salesStats.totalSales || 1)) * 100))
    : 0

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        router.push("/superadmin/login")
        return
      }

      // Fetch MCCs count
      const mccsResponse = await fetch("/api/v1/mcc/setup", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const mccsData = await mccsResponse.json()
      const totalMCCs = mccsData.data?.length || 0

      // Fetch dashboard data (aggregated across all MCCs)
      const dashboardResponse = await fetch("/api/v1/mcc/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const dashboardResult = await dashboardResponse.json()

      // Fetch recent collections
      const collectionsResponse = await fetch("/api/v1/mcc/collections?limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const collectionsData = await collectionsResponse.json()

      // Calculate total farmers
      let totalFarmers = 0
      try {
        const farmersResponse = await fetch("/api/v1/mcc/farmers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const farmersData = await farmersResponse.json()
        if (farmersData.success && Array.isArray(farmersData.data)) {
          totalFarmers = farmersData.data.length
        }
      } catch (error) {
        console.warn("Could not fetch total farmers:", error)
      }

      if (typeof dashboardResult.data?.farmers?.total === "number") {
        totalFarmers = dashboardResult.data.farmers.total
      }

      // Fetch MCC performance data (for SUPER_ADMIN only)
      let mccPerformance: any[] = []
      let regionalStats: any[] = []
      try {
        const mccsList = mccsData.data || []
        if (mccsList.length > 0) {
          // Get performance data for each MCC
          const performancePromises = mccsList.slice(0, 10).map(async (mcc: any) => {
            try {
              const perfResponse = await fetch(`/api/v1/mcc/dashboard?mccId=${mcc.id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              const perfData = await perfResponse.json()
              return {
                id: mcc.id,
                name: mcc.name,
                code: mcc.code,
                region: mcc.region || "N/A",
                dailyVolume: perfData.data?.dailyVolume?.liters || 0,
                totalFarmers: mcc._count?.farmers || 0,
                activeFarmers: perfData.data?.farmers?.active || 0,
                collections: perfData.data?.dailyVolume?.collections || 0,
                payoutDue: perfData.data?.payoutDue?.amount || 0,
              }
            } catch (error) {
              console.warn(`Could not fetch performance for MCC ${mcc.id}:`, error)
              return null
            }
          })
          mccPerformance = (await Promise.all(performancePromises)).filter((p) => p !== null)

          // Calculate regional stats
          const regionMap: Record<string, any> = {}
          mccsList.forEach((mcc: any) => {
            const region = mcc.region || "Unknown"
            if (!regionMap[region]) {
              regionMap[region] = {
                region,
                mccCount: 0,
                totalFarmers: 0,
                dailyVolume: 0,
              }
            }
            regionMap[region].mccCount++
            regionMap[region].totalFarmers += mcc._count?.farmers || 0
          })
          regionalStats = Object.values(regionMap)
        }
      } catch (error) {
        console.warn("Could not fetch MCC performance:", error)
      }

      setDashboardData({
        totalMCCs,
        totalFarmers,
        dailyVolume: dashboardResult.data?.dailyVolume || { liters: 0, collections: 0 },
        payoutDue: dashboardResult.data?.payoutDue || { amount: 0, collections: 0 },
        lowStockAlerts: dashboardResult.data?.lowStockAlerts || [],
        rentalAssetsOut: dashboardResult.data?.rentalAssetsOut || [],
        recentCollections: collectionsData.data || [],
        mccPerformance,
        regionalStats,
        qualityMetrics: dashboardResult.data?.qualityMetrics || {
          accepted: { count: 0, liters: 0 },
          rejected: { count: 0, liters: 0 },
          pending: { count: 0, liters: 0 },
        },
        farmersSummary: dashboardResult.data?.farmers,
        collectionsStats: dashboardResult.data?.collections,
        sales: dashboardResult.data?.sales,
        customers: dashboardResult.data?.customers,
        suppliers: dashboardResult.data?.suppliers,
        trends: dashboardResult.data?.trends,
        recentActivity: dashboardResult.data?.recentActivity || [],
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Activity className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className={`relative min-h-screen overflow-hidden ${pageBackgroundClasses}`}>
      <div className="pointer-events-none absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
      <div className="relative z-10 flex-1 p-2 sm:p-4 md:p-6 lg:p-8 max-w-[2000px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 break-words">
            MCC Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Overview of all Milk Collection Centers
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Link href="/superadmin/settings" className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 sm:h-9 px-4"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Settings</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* System KPIs */}
      <section className="mb-4 sm:mb-6">
        <div className={sectionCardClasses}>
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-blue-700">Monitor system KPIs</p>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Live operations snapshot</h2>
            </div>
            <Badge className="bg-blue-50/80 text-blue-700 border border-blue-100/80">
              MCC Network • {dashboardData?.totalMCCs || 0} centers
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <Card className={`${cardBaseClasses} hover:shadow-xl transition-shadow`}>
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total MCCs</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 break-words">
                    {dashboardData?.totalMCCs || 0}
                  </h3>
                </div>
                <div className="p-2 sm:p-3 bg-blue-50 rounded-full shrink-0">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4">
                <Link href="/superadmin/mccs">
                  <Button variant="link" className="text-xs sm:text-sm p-0 h-auto">
                    View all MCCs →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className={`${cardBaseClasses} hover:shadow-xl transition-shadow`}>
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Farmers</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 break-words">
                    {dashboardData?.totalFarmers || 0}
                  </h3>
                </div>
                <div className="p-2 sm:p-3 bg-green-50 rounded-full shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-500" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4 flex items-center text-xs sm:text-sm text-gray-500">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 sm:mr-2 shrink-0" />
                <span className="truncate">
                  {farmerStats?.active || 0} active this week
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={`${cardBaseClasses} hover:shadow-xl transition-shadow`}>
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Daily Milk Volume</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 break-words">
                    {dashboardData?.dailyVolume.liters.toFixed(1) || "0"}L
                  </h3>
                </div>
                <div className="p-2 sm:p-3 bg-purple-50 rounded-full shrink-0">
                  <Milk className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm text-gray-500">
                <p className="truncate">
                  {dashboardData?.dailyVolume.collections || 0} collection{dashboardData?.dailyVolume.collections !== 1 ? "s" : ""}
                </p>
                <p className="truncate">
                  Avg{" "}
                  {dashboardData?.dailyVolume.collections
                    ? (dashboardData.dailyVolume.liters / dashboardData.dailyVolume.collections).toFixed(1)
                    : "0"}
                  L / collection
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={`${cardBaseClasses} hover:shadow-xl transition-shadow`}>
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Payout Due</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 break-words">
                    RWF {dashboardData?.payoutDue.amount.toLocaleString() || "0"}
                  </h3>
                </div>
                <div className="p-2 sm:p-3 bg-orange-50 rounded-full shrink-0">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-500" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4 flex items-center text-xs sm:text-sm text-gray-500">
                <span className="truncate">
                  {dashboardData?.payoutDue.collections || 0} pending payment{dashboardData?.payoutDue.collections !== 1 ? "s" : ""}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-3">
          <Card className={cardBaseClasses}>
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Collections Health</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {(collectionsStats?.totalVolume || 0).toFixed(0)}L
              </p>
              <p className="text-xs text-gray-500">
                {collectionsStats?.total || 0} total • {acceptanceRate}% approved • {pendingCollections} pending
              </p>
            </CardContent>
          </Card>
          <Card className={cardBaseClasses}>
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Sales & Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                RWF {salesStats?.totalRevenue?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-gray-500">
                {salesStats?.totalSales || 0} sales • {salesConversionRate}% cleared
              </p>
            </CardContent>
          </Card>
          <Card className={cardBaseClasses}>
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Customer Engagement</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {customersStats?.active || 0}/{customersStats?.total || 0}
              </p>
              <p className="text-xs text-gray-500">
                Avg price {customersStats?.avgPricePerLiter?.toFixed(2) || 0} RWF/L
              </p>
            </CardContent>
          </Card>
          <Card className={cardBaseClasses}>
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Supplier Productivity</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {(suppliersStats?.totalProduction || 0).toFixed(0)}L
              </p>
              <p className="text-xs text-gray-500">
                {suppliersStats?.active || 0}/{suppliersStats?.total || 0} active farmers
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
      </section>

      {/* Content Grid */}
      <div className={`${sectionCardClasses} mb-4 sm:mb-6`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Quick Actions */}
          <Card className={cardBaseClasses}>
            <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">Quick Actions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Drive lifecycle tasks without leaving this screen</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 pt-0">
              <div className="grid gap-2 sm:gap-3 md:gap-4">
                <Button variant="outline" className={quickActionButtonClasses} onClick={() => router.push("/superadmin/mccs")}>
                  <Building2 className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 shrink-0" />
                  <span className="truncate">Manage All MCCs</span>
                </Button>
                <Button variant="outline" className={quickActionButtonClasses} onClick={() => router.push("/superadmin/mccs/new")}>
                  <Milk className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-purple-500 shrink-0" />
                  <span className="truncate">Create New MCC</span>
                </Button>
                <Button
                  variant="outline"
                  className={quickActionButtonClasses}
                  onClick={() => router.push("/superadmin/users?role=MCC_MANAGER")}
                >
                  <Users className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
                  <span className="truncate">Assign MCC Managers</span>
                </Button>
                <Button variant="outline" className={quickActionButtonClasses} onClick={() => router.push("/superadmin/roles")}>
                  <Settings className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-purple-500 shrink-0" />
                  <span className="truncate">Manage Roles</span>
                </Button>
                <Button
                  variant="outline"
                  className={quickActionButtonClasses}
                  onClick={() => alertsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  <AlertTriangle className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-orange-500 shrink-0" />
                  <span className="truncate">Review Alerts</span>
                </Button>
                <Button
                  variant="outline"
                  className={quickActionButtonClasses}
                  onClick={() => managerToolkitRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  <ClipboardList className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 shrink-0" />
                  <span className="truncate">Open Manager Toolkit</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trend Card */}
          <Card className={cardBaseClasses}>
            <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2L flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-purple-500" />
                    Collections vs Sales Trend
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Align production with demand in the last {trendWindow} days
                  </CardDescription>
                </div>
                <Select value={trendWindow} onValueChange={(value) => setTrendWindow(value as "7" | "14" | "30")}>
                  <SelectTrigger className="w-24 h-8 text-xs rounded-lg border border-white/60 bg-white/80 backdrop-blur">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7d</SelectItem>
                    <SelectItem value="14">14d</SelectItem>
                    <SelectItem value="30">30d</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 pt-0">
              {trendSummary ? (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase text-gray-500 tracking-widest">Collections</p>
                      <p className="text-2xl font-bold text-gray-900">{trendSummary.collectionsTotal.toFixed(0)}L</p>
                      <p className="text-xs text-gray-500">
                        Avg {trendSummary.collectionsAvg.toFixed(1)}L / day
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 tracking-widest">Sales</p>
                      <p className="text-2xl font-bold text-gray-900">{trendSummary.salesTotal.toFixed(0)}L</p>
                      <p className="text-xs text-gray-500">
                        Avg {trendSummary.salesAvg.toFixed(1)}L / day
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
                    {trendSummary.rows.map((row) => {
                      const maxValue = Math.max(row.collections, row.sales, 1)
                      const collectionWidth = Math.min(100, (row.collections / maxValue) * 100)
                      const salesWidth = Math.min(100, (row.sales / maxValue) * 100)
                      return (
                        <div key={row.date} className="text-xs sm:text-sm">
                          <div className="flex items-center justify-between text-gray-500">
                            <span>{formatDateLabel(row.date)}</span>
                            <span>
                              {row.collections.toFixed(1)}L • {row.sales.toFixed(1)}L
                            </span>
                          </div>
                          <div className="mt-1 space-y-1">
                            <div className="h-1.5 bg-purple-100 rounded-full">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${collectionWidth}%` }}
                              />
                            </div>
                            <div className="h-1.5 bg-blue-100 rounded-full">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${salesWidth}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Not enough historical data to plot this window.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      

      {/* Alerts Section */}
      <div ref={alertsSectionRef} className={`${sectionCardClasses} mb-8`}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Low Stock Alerts */}
        <Card className={cardBaseClasses}>
          <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Products that need restocking
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 pt-0">
            {dashboardData?.lowStockAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No low stock alerts</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {dashboardData?.lowStockAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center p-2 sm:p-3 bg-orange-50 rounded-lg"
                  >
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mr-2 sm:mr-3 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate">
                        {alert.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Stock: {alert.currentStock} (Reorder: {alert.reorderPoint})
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Rental Assets Out */}
        <Card className={cardBaseClasses}>
          <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl flex items-center gap-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              Rental Assets Out
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Equipment currently rented to farmers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 pt-0">
            {dashboardData?.rentalAssetsOut.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active rentals</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {dashboardData?.rentalAssetsOut.slice(0, 5).map((rental) => (
                  <div
                    key={rental.id}
                    className="flex items-center p-2 sm:p-3 bg-blue-50 rounded-lg"
                  >
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 sm:mr-3 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate">
                        {rental.asset.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {rental.farmer.name} • {rental.daysOut} days out
                      </p>
            </div>
          </div>
                ))}
              </div>
            )}
        </CardContent>
      </Card>

      {/* Financial & Compliance Alerts */}
      <Card className={cardBaseClasses}>
        <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl flex items-center gap-2">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
            Financial & Compliance Alerts
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Actionable follow-ups across MCC finance and QA
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 pt-0">
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Pending collections</span>
              <Badge variant="secondary">{pendingCollections}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Rejected sales</span>
              <Badge variant="secondary">{rejectedSales}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Payout exposure</span>
              <span className="font-semibold text-gray-900">
                RWF {dashboardData?.payoutDue.amount.toLocaleString() || "0"}
              </span>
            </div>
            <Button
              variant="link"
              className="px-0 h-auto justify-start text-blue-600"
              onClick={() => router.push("/superadmin/mccs?focus=alerts")}
            >
              Go to alert center →
            </Button>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
      </div>
    </div>
  )
}
