"use client"

import { useState, useEffect, createElement } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { 
  type LucideIcon,
  Activity, ShoppingCart, Truck, UserPlus, BatteryCharging, GaugeCircle, Package, ClipboardList, PiggyBank, AlertTriangle, Wheat, Coffee, Settings, CheckCircle2, XCircle, DollarSign, Clock, Droplets, Users, Building2, Database, TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, CheckSquare, Calendar, Tractor, ShoppingBag, MapPin, Phone, Mail, User, Coins, Thermometer, Info, CreditCard, ChevronRight
} from "lucide-react"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { GeoIntelligenceWidgets } from "@/components/dashboard/geo-intelligence-widgets"
import { GeoMapViewer, type GeoEntity } from "@/components/ui/geo-map-viewer"
import { CommodityCollectionForm } from "@/components/mcc/CommodityCollectionForm"
import { AddCollectionForm } from "@/app/[lang]/dashboard/mcc/components/AddCollectionForm"
import { formatCurrency, getMCCCurrency, DEFAULT_CURRENCY } from "@/lib/utils/currency"
import dynamic from "next/dynamic"

const SalesPageEmbed = dynamic(
  () => import("@/app/[lang]/dashboard/mcc/sales/page").then((mod) => ({ default: mod.default })),
  { ssr: false }
)
const PaymentsPageEmbed = dynamic(
  () => import("@/app/[lang]/dashboard/mcc/payments/page").then((mod) => ({ default: mod.default })),
  { ssr: false }
)

export default function DashboardPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  
  // Check if user is MCC_MANAGER
  const isMCCManager = user?.role === "MCC_MANAGER"
  
  const [mccDashboardData, setMccDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [trendPeriod, setTrendPeriod] = useState<"7D" | "30D" | "90D">("30D")
  const [geoStats, setGeoStats] = useState<any>(null)
  const [geoEntities, setGeoEntities] = useState<GeoEntity[]>([])
  const [geoLoading, setGeoLoading] = useState(true)
  const [commodities, setCommodities] = useState<any[]>([])
  const [commodityStats, setCommodityStats] = useState<any>(null)
  const [commodityLoading, setCommodityLoading] = useState(true)
  const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false)
  const [addCollectionOpen, setAddCollectionOpen] = useState(false)
  const [sellMilkOpen, setSellMilkOpen] = useState(false)
  const [processPaymentsOpen, setProcessPaymentsOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [mccCurrency, setMccCurrency] = useState<string>(DEFAULT_CURRENCY)
  const [mccDetails, setMccDetails] = useState<{
    id: string
    name: string
    code: string | null
    location: string
    region: string | null
    address: string | null
    isActive: boolean
    manager?: { id: string; name: string; email: string; phone?: string } | null
    settings?: {
      currency?: string
      pricing?: { basePricePerLiter?: number }
      qualityRules?: { minFat?: number; minProtein?: number; maxTemp?: number }
    }
    _count?: { farmers: number; milk_collections: number; sales: number; staff: number }
  } | null>(null)

  const formatDate = (value?: string | null) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString()
  }
  const formatDisplayDate = (value?: string | null, fallback = "—") => {
    const formatted = formatDate(value)
    if (formatted) return formatted
    if (value) return value
    return fallback
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("Gemurai_token")
        
        // If MCC Manager, fetch MCC dashboard data
        if (isMCCManager && token) {
          try {
            const mccDashboardRes = await fetch("/api/v1/mcc/dashboard", {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            })
            if (mccDashboardRes.ok) {
              const mccData = await mccDashboardRes.json()
              if (mccData.success && mccData.data) {
                setMccDashboardData(mccData.data)
                // Extract currency from MCC settings if available
                if (mccData.data?.mccSettings?.currency) {
                  setMccCurrency(mccData.data.mccSettings.currency)
                }
              }
            }
          } catch (error) {
            console.error("Error fetching MCC dashboard:", error)
          }
          
          // Fetch full MCC details including settings and currency
          if (user?.mccId) {
            try {
              const mccSettingsRes = await fetch(`/api/v1/mcc/setup?id=${user.mccId}`, {
                headers: { "Authorization": `Bearer ${token}` }
              })
              if (mccSettingsRes.ok) {
                const settingsData = await mccSettingsRes.json()
                if (settingsData.success && settingsData.data) {
                  setMccDetails(settingsData.data)
                  if (settingsData.data?.settings?.currency) {
                    setMccCurrency(settingsData.data.settings.currency)
                  }
                }
              }
            } catch (error) {
              console.error("Error fetching MCC settings:", error)
            }
          }
        }

        // Fetch geo-intelligence data
        if (token) {
          try {
            setGeoLoading(true)
            const [geoStatsRes, geoEntitiesRes] = await Promise.all([
              fetch("/api/v1/geo/stats", {
                headers: {
                  "Authorization": `Bearer ${token}`
                }
              }),
              fetch("/api/v1/geo/entities", {
                headers: {
                  "Authorization": `Bearer ${token}`
                }
              })
            ])

            if (geoStatsRes.ok) {
              const statsData = await geoStatsRes.json()
              if (statsData.success && statsData.data) {
                setGeoStats(statsData.data)
              } else {
                // Set default empty stats if API returns error
                setGeoStats({
                  farmersWithGeo: 0,
                  agentsWithGeo: 0,
                  mccsWithGeo: 0,
                  warehousesWithGeo: 0,
                  customersWithGeo: 0,
                  suppliersWithGeo: 0,
                  averageFarmerToMCCDistance: null,
                  distanceBands: {
                    "0-2km": 0,
                    "2-5km": 0,
                    "5-10km": 0,
                    ">10km": 0,
                  },
                  totalEntitiesWithGeo: 0,
                })
              }
            } else {
              // Set default empty stats on API error
              setGeoStats({
                farmersWithGeo: 0,
                agentsWithGeo: 0,
                mccsWithGeo: 0,
                warehousesWithGeo: 0,
                customersWithGeo: 0,
                suppliersWithGeo: 0,
                averageFarmerToMCCDistance: null,
                distanceBands: {
                  "0-2km": 0,
                  "2-5km": 0,
                  "5-10km": 0,
                  ">10km": 0,
                },
                totalEntitiesWithGeo: 0,
              })
            }

            if (geoEntitiesRes.ok) {
              const entitiesData = await geoEntitiesRes.json()
              if (entitiesData.success && entitiesData.data) {
                setGeoEntities(entitiesData.data)
              } else {
                setGeoEntities([])
              }
            } else {
              setGeoEntities([])
            }
          } catch (error) {
            console.error("Error fetching geo data:", error)
          } finally {
            setGeoLoading(false)
          }

          // Fetch HarvestPlus commodity data
          try {
            setCommodityLoading(true)
            const [commoditiesRes, collectionsRes] = await Promise.all([
              fetch("/api/v1/admin/commodity-studio/commodities", {
                headers: {
                  "Authorization": `Bearer ${token}`
                }
              }),
              isMCCManager
                ? fetch(`/api/v1/mcc/commodities/collections${user?.mccId ? `?mccId=${user.mccId}` : ""}`, {
                    headers: {
                      "Authorization": `Bearer ${token}`
                    }
                  })
                : Promise.resolve(null)
            ])

            if (commoditiesRes.ok) {
              const commoditiesData = await commoditiesRes.json()
              if (commoditiesData.success) {
                setCommodities(commoditiesData.data || [])
              }
            }

            if (collectionsRes && collectionsRes.ok) {
              const collectionsData = await collectionsRes.json()
              if (collectionsData.success) {
                const collections = collectionsData.data || []
                // Calculate stats
                const stats = {
                  totalCollections: collections.length,
                  totalVolume: collections.reduce((sum: number, c: any) => sum + (c.quantity || 0), 0),
                  totalRevenue: collections.reduce((sum: number, c: any) => sum + (c.totalAmount || 0), 0),
                  byCommodity: collections.reduce((acc: any, c: any) => {
                    const name = c.commodity?.name || "Unknown"
                    if (!acc[name]) {
                      acc[name] = { count: 0, volume: 0, revenue: 0 }
                    }
                    acc[name].count++
                    acc[name].volume += c.quantity || 0
                    acc[name].revenue += c.totalAmount || 0
                    return acc
                  }, {}),
                  pendingCollections: collections.filter((c: any) => c.status === "PENDING").length,
                  approvedCollections: collections.filter((c: any) => c.status === "APPROVED").length,
                }
                setCommodityStats(stats)
              }
            }
          } catch (error) {
            console.error("Error fetching commodity data:", error)
          } finally {
            setCommodityLoading(false)
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, isMCCManager, refreshTrigger])

  if (!user) return null

  // Format data for charts
  const formatTrendData = () => {
    if (!mccDashboardData?.trends) return []
    const days = trendPeriod === "7D" ? 7 : trendPeriod === "30D" ? 30 : 90
    const collections = mccDashboardData.trends.collections || []
    const sales = mccDashboardData.trends.sales || []
    
    // Create a map of dates to liters for both collections and sales
    const collectionsMap = new Map<string, number>()
    const salesMap = new Map<string, number>()
    
    collections.forEach((item: any) => {
      const date = item.date || ""
      collectionsMap.set(date, (collectionsMap.get(date) || 0) + (item.liters || 0))
    })
    
    sales.forEach((item: any) => {
      const date = item.date || ""
      salesMap.set(date, (salesMap.get(date) || 0) + (item.liters || 0))
    })
    
    // Get all unique dates and sort them
    const allDates = Array.from(new Set([...collectionsMap.keys(), ...salesMap.keys()])).sort()
    
    // Take the last N days
    const recentDates = allDates.slice(-days)
    
    return recentDates.map((date, index) => ({
      day: `Day ${index + 1}`,
      collections: collectionsMap.get(date) || 0,
      sales: salesMap.get(date) || 0
    }))
  }

  // Format data for donut chart
  const formatDonutData = () => {
    const collectionsTotal = mccDashboardData?.collections?.totalVolume || 0
    const salesTotal = mccDashboardData?.sales?.totalLiters || 0
    
    return [
      { name: "Collections", value: collectionsTotal },
      { name: "Sales", value: salesTotal }
    ]
  }

  const donutData = formatDonutData()
  const donutTotal = donutData.reduce((sum, item) => sum + item.value, 0)
  const collectionsPercentage = donutTotal > 0 ? ((donutData[0]?.value || 0) / donutTotal * 100).toFixed(2) : "0"

  const COLORS = ["#0099f2", "#9ca3af"] // Brand blue for collections, grey for sales

  // Type definition for accent colors
  type Accent = "primary" | "emerald" | "purple" | "amber"

  // Helper function to get accent-specific CSS classes
  const getAccentClasses = (accent: Accent): {
    card: string
    iconBg: string
    iconBgHover: string
    icon: string
    textHover: string
    textColor: string
    bar: string
    pill: string
    shadow: string
    borderHover: string
    gradientBg: string
    gradientBgHover: string
    gradientBar: string
  } => {
    switch (accent) {
      case "primary":
        return {
          card: "hover:border-primary/50",
          iconBg: "bg-primary/10",
          iconBgHover: "group-hover:bg-primary/20",
          icon: "text-primary",
          textHover: "group-hover:text-primary",
          textColor: "text-primary",
          bar: "bg-primary",
          pill: "bg-primary/10 text-primary",
          shadow: "hover:shadow-[#0099f2]/10",
          borderHover: "hover:border-[#0099f2]/40",
          gradientBg: "from-[#0099f2]/5",
          gradientBgHover: "from-[#0099f2]/10",
          gradientBar: "from-[#0099f2] via-[#0082d9] to-[#0099f2]",
        }
      case "emerald":
        return {
          card: "hover:border-emerald-500/50",
          iconBg: "bg-emerald-500/10",
          iconBgHover: "group-hover:bg-emerald-500/20",
          icon: "text-emerald-600",
          textHover: "group-hover:text-emerald-600",
          textColor: "text-emerald-600",
          bar: "bg-emerald-500",
          pill: "bg-emerald-500/10 text-emerald-600",
          shadow: "hover:shadow-emerald-500/10",
          borderHover: "hover:border-emerald-300/60",
          gradientBg: "from-emerald-50/50",
          gradientBgHover: "from-emerald-50/30",
          gradientBar: "from-emerald-500 via-emerald-600 to-emerald-500",
        }
      case "purple":
        return {
          card: "hover:border-purple-500/50",
          iconBg: "bg-purple-500/10",
          iconBgHover: "group-hover:bg-purple-500/20",
          icon: "text-purple-600",
          textHover: "group-hover:text-purple-600",
          textColor: "text-purple-600",
          bar: "bg-purple-500",
          pill: "bg-purple-500/10 text-purple-600",
          shadow: "hover:shadow-purple-500/10",
          borderHover: "hover:border-purple-300/60",
          gradientBg: "from-purple-50/50",
          gradientBgHover: "from-purple-50/30",
          gradientBar: "from-purple-500 via-purple-600 to-purple-500",
        }
      case "amber":
        return {
          card: "hover:border-amber-500/50",
          iconBg: "bg-amber-500/10",
          iconBgHover: "group-hover:bg-amber-500/20",
          icon: "text-amber-600",
          textHover: "group-hover:text-amber-600",
          textColor: "text-amber-600",
          bar: "bg-amber-500",
          pill: "bg-amber-500/10 text-amber-600",
          shadow: "hover:shadow-amber-500/10",
          borderHover: "hover:border-amber-300/60",
          gradientBg: "from-amber-50/50",
          gradientBgHover: "from-amber-50/30",
          gradientBar: "from-amber-500 via-amber-600 to-amber-500",
        }
      default:
        return {
          card: "hover:border-primary/50",
          iconBg: "bg-primary/10",
          iconBgHover: "group-hover:bg-primary/20",
          icon: "text-primary",
          textHover: "group-hover:text-primary",
          textColor: "text-primary",
          bar: "bg-primary",
          pill: "bg-primary/10 text-primary",
          shadow: "hover:shadow-[#0099f2]/10",
          borderHover: "hover:border-[#0099f2]/40",
          gradientBg: "from-[#0099f2]/5",
          gradientBgHover: "from-[#0099f2]/10",
          gradientBar: "from-[#0099f2] via-[#0082d9] to-[#0099f2]",
        }
    }
  }

  // MCC Dashboard rendering
  if (isMCCManager) {
    // Map API response to expected structures (API returns lowStockAlerts, rentalAssetsOut, dailyVolume, payoutDue at top level)
    const apiLowStock = mccDashboardData?.lowStockAlerts ?? []
    const apiRentalAssets = mccDashboardData?.rentalAssetsOut ?? []
    const dailyVolume = mccDashboardData?.dailyVolume ?? { liters: 0, collections: 0 }
    const payoutDue = mccDashboardData?.payoutDue ?? { amount: 0, totalAmount: 0, collections: 0 }

    const collectionsVolume = mccDashboardData?.collections?.totalVolume ?? 0
    const collectionsCount = mccDashboardData?.collections?.total ?? 0
    const collectionsPending = mccDashboardData?.collections?.pending ?? 0
    const collectionsAccepted = mccDashboardData?.collections?.accepted ?? 0
    const salesLiters = mccDashboardData?.sales?.totalLiters ?? 0
    const salesCount = mccDashboardData?.sales?.totalSales ?? 0
    const salesRevenue = mccDashboardData?.sales?.totalRevenue ?? 0
    const suppliersActive = mccDashboardData?.suppliers?.active ?? 0
    const suppliersTotal = mccDashboardData?.suppliers?.total ?? 0
    const customersActive = mccDashboardData?.customers?.active ?? 0
    const customersTotal = mccDashboardData?.customers?.total ?? 0
    const farmersTotal = mccDashboardData?.farmers?.total ?? 0
    const farmersActive = mccDashboardData?.farmers?.active ?? 0
    const recentActivity = mccDashboardData?.recentActivity ?? []
    const payoutAmount = payoutDue?.amount ?? 0

    const vehiclesData = mccDashboardData?.vehicles ?? {}
    const vehiclesSummary = {
      total: vehiclesData?.total ?? vehiclesData?.count ?? 0,
      available: vehiclesData?.available ?? vehiclesData?.availableCount ?? 0,
      onRoute: vehiclesData?.onRoute ?? vehiclesData?.onRouteCount ?? 0,
      maintenance: vehiclesData?.maintenance ?? vehiclesData?.maintenanceCount ?? 0,
      nextService: vehiclesData?.nextService ?? vehiclesData?.next_service ?? null,
      updatedAt: vehiclesData?.updatedAt ?? vehiclesData?.updated_at ?? null,
    }

    const powerData = mccDashboardData?.powerAssets ?? {}
    const powerSummary = {
      total: powerData?.total ?? powerData?.count ?? 0,
      operational: powerData?.operational ?? powerData?.operationalCount ?? 0,
      maintenanceDue: powerData?.maintenanceDue ?? powerData?.maintenance_due ?? 0,
      lastTested: powerData?.lastTested ?? powerData?.last_tested ?? null,
    }

    const capacitySource = (() => {
      const data =
        mccDashboardData?.capacityAssessment ??
        mccDashboardData?.capacityAssessments ??
        null
      if (!data) return null
      if (Array.isArray(data)) {
        if (data.length === 0) return null
        return (
          data.find((item: any) => item?.latest) ??
          data[0]
        )
      }
      if (data?.latest) return data.latest
      return data
    })()

    const capacitySummary = capacitySource
      ? {
          staffCount:
            capacitySource?.staff_count ??
            capacitySource?.staffCount ??
            0,
          trainedStaff:
            capacitySource?.trained_staff_count ??
            capacitySource?.trainedStaffCount ??
            0,
          coolingCapacity:
            capacitySource?.cooling_capacity_liters ??
            capacitySource?.coolingCapacityLiters ??
            0,
          demand:
            capacitySource?.estimated_daily_demand_liters ??
            capacitySource?.estimatedDailyDemandLiters ??
            0,
          transportCapacity:
            capacitySource?.transport_capacity_liters ??
            capacitySource?.transportCapacityLiters ??
            0,
          powerOk:
            capacitySource?.power_ok ??
            capacitySource?.powerOk ??
            false,
          assessedAt:
            capacitySource?.assessed_at ??
            capacitySource?.assessedAt ??
            null,
        }
      : null
    const trainedStaffPercentage = capacitySummary && capacitySummary.staffCount > 0
      ? Math.round((capacitySummary.trainedStaff / capacitySummary.staffCount) * 100)
      : 0
    const coolingCapacityGap = capacitySummary
      ? (capacitySummary.coolingCapacity ?? 0) - (capacitySummary.demand ?? 0)
      : 0

    const inventoryData = mccDashboardData?.inventory ?? {}
    const rawLowStock =
      inventoryData?.lowStock ??
      inventoryData?.low_stock ??
      apiLowStock
    const rawExpiring =
      inventoryData?.expiringSoon ??
      inventoryData?.expiring_soon ??
      []
    const lowStockProducts = Array.isArray(rawLowStock)
      ? rawLowStock.map((p: any) => ({
          ...p,
          stock_qty: p.currentStock ?? p.stock ?? p.stock_qty ?? p.stockQty ?? 0,
          stockQty: p.currentStock ?? p.stock ?? p.stock_qty ?? p.stockQty ?? 0,
          sku: p.barcode ?? p.sku,
          name: p.name ?? "Product",
        }))
      : []
    const expiringProducts = Array.isArray(rawExpiring)
      ? rawExpiring
      : []
    const inventorySummary = {
      totalProducts:
        inventoryData?.totalProducts ??
        inventoryData?.total ??
        0,
      totalStock:
        inventoryData?.totalStock ??
        inventoryData?.total_stock ??
        0,
      lowStockCount: lowStockProducts.length,
      expiringCount: expiringProducts.length,
    }

    const rentalsData = mccDashboardData?.rentals ?? {}
    const rawActiveRentals =
      rentalsData?.active ??
      rentalsData?.activeRentals ??
      apiRentalAssets
    const rawOverdueRentals =
      rentalsData?.overdue ??
      rentalsData?.overdueRentals ??
      apiRentalAssets.filter((r: any) => (r.daysOut ?? 0) > 0)
    const activeRentals = Array.isArray(rawActiveRentals)
      ? rawActiveRentals.map((r: any) => ({
          ...r,
          asset_name: r.asset?.name ?? r.assetName ?? r.asset_name ?? "Asset",
          farmer_name: r.farmer?.name ?? r.farmerName ?? r.farmer_name ?? "Farmer",
          rent_end: r.rentEnd ?? r.rent_end,
          rentEnd: r.rentEnd ?? r.rent_end,
        }))
      : []
    const overdueRentals = Array.isArray(rawOverdueRentals)
      ? rawOverdueRentals.map((r: any) => ({
          ...r,
          asset_name: r.asset?.name ?? r.assetName ?? r.asset_name ?? "Asset",
          farmer_name: r.farmer?.name ?? r.farmerName ?? r.farmer_name ?? "Farmer",
          rent_end: r.rentEnd ?? r.rent_end,
          rentEnd: r.rentEnd ?? r.rent_end,
        }))
      : []
    const rentalsSummary = {
      activeCount: activeRentals.length,
      overdueCount: overdueRentals.length,
      returnedToday:
        rentalsData?.returnedToday ??
        rentalsData?.returned_today ??
        0,
    }

    const financialData = mccDashboardData?.financial ?? {}
    const pendingPayments =
      financialData?.pendingPayments ??
      financialData?.pending_payments ??
      payoutDue?.collections ??
      0
    const outstandingAmount =
      financialData?.outstandingAmount ??
      financialData?.outstanding_amount ??
      payoutDue?.amount ??
      0
    const farmerBalance =
      financialData?.farmerBalance ??
      financialData?.farmer_balance ??
      0

    const qualityData = mccDashboardData?.quality ?? {}
    const rejectionRate =
      qualityData?.rejectionRate ??
      qualityData?.rejection_rate ??
      0
    const qualityAlerts =
      qualityData?.alerts ??
      mccDashboardData?.alerts ??
      []
    const formattedQualityAlerts = Array.isArray(qualityAlerts)
      ? qualityAlerts
      : []

    const quickActions: Array<{
      title: string
      description: string
      icon: LucideIcon
      accent: Accent
      gradient: string
      iconBg: string
      onClick: () => void
    }> = [
      {
        title: "Collect Commodity",
        description: "Record commodity deliveries from farmers",
        icon: Package,
        accent: "purple",
        gradient: "from-purple-600 via-purple-500 to-indigo-600",
        iconBg: "bg-purple-100",
        onClick: () => setIsCollectionFormOpen(true),
      },
      {
        title: "Collect Milk",
        description: "Record milk collection from farmers",
        icon: Droplets,
        accent: "primary",
        gradient: "from-blue-600 via-blue-500 to-cyan-500",
        iconBg: "bg-blue-100",
        onClick: () => setAddCollectionOpen(true),
      },
      {
        title: "Sell Milk",
        description: "Process sales to buyers & customers",
        icon: ShoppingCart,
        accent: "emerald",
        gradient: "from-emerald-600 via-emerald-500 to-teal-500",
        iconBg: "bg-emerald-100",
        onClick: () => setSellMilkOpen(true),
      },
      {
        title: "Process Payments",
        description: "Pay farmers for their deliveries",
        icon: DollarSign,
        accent: "amber",
        gradient: "from-amber-500 via-orange-500 to-amber-600",
        iconBg: "bg-amber-100",
        onClick: () => setProcessPaymentsOpen(true),
      },
    ]

    const metricCards: Array<{
      label: string
      value: string
      subtitle: string
      meta: string
      icon: LucideIcon
      accent: Accent
    }> = [
      {
        label: "Milk Collections",
        value: `${collectionsVolume.toLocaleString(undefined, { maximumFractionDigits: 1 })}L`,
        subtitle: `${collectionsCount} total · ${collectionsPending} pending`,
        meta: `RF ${payoutAmount.toLocaleString()} due`,
        icon: Droplets,
        accent: "primary",
      },
      {
        label: "Milk Sales",
        value: `${salesLiters.toLocaleString(undefined, { maximumFractionDigits: 1 })}L`,
        subtitle: `${salesCount} sales`,
        meta: `RF ${salesRevenue.toLocaleString()} revenue`,
        icon: ShoppingCart,
        accent: "emerald",
      },
      {
        label: "Farmers",
        value: `${farmersTotal}`,
        subtitle: `${farmersActive} active (7d)`,
        meta: `${suppliersTotal} suppliers`,
        icon: Tractor,
        accent: "purple",
      },
      {
        label: "Customers",
        value: `${customersTotal}`,
        subtitle: `${customersActive} active`,
        meta: `RF ${(mccDashboardData?.customers?.totalRevenue ?? salesRevenue).toLocaleString()} revenue`,
        icon: ShoppingBag,
        accent: "amber",
      },
    ]

    // Loading state for MCC Manager
    if (loading && !mccDashboardData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
          <div className="relative z-10 mx-auto w-full px-0 py-10">
            <div className="mb-10 animate-pulse">
              <div className="h-9 w-64 bg-slate-200 rounded-lg mb-2" />
              <div className="h-5 w-96 bg-slate-100 rounded" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 rounded-3xl bg-slate-100/80 border border-slate-200/60 animate-pulse" />
              ))}
            </div>
            <div className="mt-10 flex items-center justify-center text-slate-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          </div>
        </div>
      )
    }

    // Render the MCC dashboard - design aligned with collections page
    const cardConfig: Record<string, { border: string; gradient: string; iconBg: string; labelColor: string; iconColor: string }> = {
      primary: { border: "border-blue-100", gradient: "from-blue-100/50 via-indigo-100/30 to-transparent", iconBg: "bg-blue-50", labelColor: "text-blue-600", iconColor: "text-blue-500" },
      emerald: { border: "border-emerald-100", gradient: "from-emerald-100/50 via-teal-100/30 to-transparent", iconBg: "bg-emerald-50", labelColor: "text-emerald-600", iconColor: "text-emerald-500" },
      purple: { border: "border-purple-100", gradient: "from-purple-100/50 via-indigo-100/30 to-transparent", iconBg: "bg-purple-50", labelColor: "text-purple-600", iconColor: "text-purple-500" },
      amber: { border: "border-amber-100", gradient: "from-amber-100/50 via-orange-100/30 to-transparent", iconBg: "bg-amber-50", labelColor: "text-amber-600", iconColor: "text-amber-500" },
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
            <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto w-full px-0 py-10">
            <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-1.5 shadow-sm ring-1 ring-gray-200">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    MCC Manager • Dashboard
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Welcome back, {user?.name?.split(' ')[0] || 'Manager'}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                    Overview of your MCC operations, collections, and key metrics
                  </p>
                </div>
                {/* Quick Actions - Big Buttons */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mt-6">
                  {quickActions.map((action) => {
                    const ActionContent = (
                      <div
                        className={`group flex items-center gap-3 rounded-2xl bg-gradient-to-r ${action.gradient} px-4 py-4 sm:px-5 sm:py-5 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:brightness-110 active:scale-[0.98] cursor-pointer`}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 rounded-xl bg-white/25 p-2.5 sm:p-3">
                          {createElement(action.icon, { className: "h-5 w-5 sm:h-6 sm:w-6 text-white" })}
                        </div>
                        
                        {/* Text */}
                        <span className="text-sm sm:text-base font-bold leading-tight">{action.title}</span>
                        
                        {/* Arrow */}
                        <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 ml-auto flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    )
                    
                    return (
                      <button
                        key={action.title}
                        type="button"
                        onClick={action.onClick}
                        className="block w-full text-left"
                      >
                        {ActionContent}
                      </button>
                    )
                  })}
                </div>
              </div>
            </header>

            {/* Collection Center Information Card */}
            {mccDetails && (
              <section className="mb-8">
                <Card className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/30 to-indigo-50/20 shadow-lg">
                  <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-sky-100/60 via-indigo-100/40 to-transparent" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-3 shadow-lg">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {mccDetails.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm text-gray-600">
                          {mccDetails.code && (
                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
                              {mccDetails.code}
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${mccDetails.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${mccDetails.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            {mccDetails.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Location & Address */}
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <MapPin className="h-4 w-4 text-sky-500" />
                          Location
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="font-medium text-gray-900">{mccDetails.location}</p>
                          {mccDetails.region && <p>{mccDetails.region}</p>}
                          {mccDetails.address && <p className="text-xs text-gray-500">{mccDetails.address}</p>}
                        </div>
                      </div>

                      {/* Manager Info */}
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <User className="h-4 w-4 text-indigo-500" />
                          Manager
                        </h4>
                        {mccDetails.manager ? (
                          <div className="space-y-1.5 text-sm">
                            <p className="font-medium text-gray-900">{mccDetails.manager.name}</p>
                            <p className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Mail className="h-3 w-3" />
                              {mccDetails.manager.email}
                            </p>
                            {mccDetails.manager.phone && (
                              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Phone className="h-3 w-3" />
                                {mccDetails.manager.phone}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No manager assigned</p>
                        )}
                      </div>

                      {/* Settings & Currency */}
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Settings className="h-4 w-4 text-purple-500" />
                          Settings
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2 shadow-sm">
                            <span className="flex items-center gap-2 text-gray-600">
                              <Coins className="h-3.5 w-3.5 text-amber-500" />
                              Currency
                            </span>
                            <span className="font-semibold text-gray-900">{mccCurrency}</span>
                          </div>
                          {mccDetails.settings?.pricing?.basePricePerLiter && (
                            <div className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2 shadow-sm">
                              <span className="flex items-center gap-2 text-gray-600">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                                Base Price
                              </span>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(mccDetails.settings.pricing.basePricePerLiter, mccCurrency)}/L
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <BarChart3 className="h-4 w-4 text-emerald-500" />
                          Statistics
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="rounded-lg bg-white/60 px-3 py-2 text-center shadow-sm">
                            <p className="text-lg font-bold text-gray-900">{mccDetails._count?.farmers ?? farmersTotal}</p>
                            <p className="text-xs text-gray-500">Farmers</p>
                          </div>
                          <div className="rounded-lg bg-white/60 px-3 py-2 text-center shadow-sm">
                            <p className="text-lg font-bold text-gray-900">{mccDetails._count?.milk_collections ?? collectionsCount}</p>
                            <p className="text-xs text-gray-500">Collections</p>
                          </div>
                          <div className="rounded-lg bg-white/60 px-3 py-2 text-center shadow-sm">
                            <p className="text-lg font-bold text-gray-900">{mccDetails._count?.sales ?? salesCount}</p>
                            <p className="text-xs text-gray-500">Sales</p>
                          </div>
                          <div className="rounded-lg bg-white/60 px-3 py-2 text-center shadow-sm">
                            <p className="text-lg font-bold text-gray-900">{mccDetails._count?.staff ?? capacitySummary?.staffCount ?? 0}</p>
                            <p className="text-xs text-gray-500">Staff</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quality Rules (if configured) */}
                    {mccDetails.settings?.qualityRules && (
                      <div className="mt-6 rounded-xl border border-gray-100 bg-white/60 p-4">
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Quality Standards
                        </h4>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {mccDetails.settings.qualityRules.minFat !== undefined && (
                            <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5">
                              <span className="text-amber-700">Min Fat:</span>
                              <span className="font-semibold text-amber-900">{mccDetails.settings.qualityRules.minFat}%</span>
                            </div>
                          )}
                          {mccDetails.settings.qualityRules.minProtein !== undefined && (
                            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
                              <span className="text-blue-700">Min Protein:</span>
                              <span className="font-semibold text-blue-900">{mccDetails.settings.qualityRules.minProtein}%</span>
                            </div>
                          )}
                          {mccDetails.settings.qualityRules.maxTemp !== undefined && (
                            <div className="flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5">
                              <Thermometer className="h-3.5 w-3.5 text-sky-600" />
                              <span className="text-sky-700">Max Temp:</span>
                              <span className="font-semibold text-sky-900">{mccDetails.settings.qualityRules.maxTemp}°C</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Summary Cards - matching collections page style */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                        Today&apos;s Collections
                      </CardTitle>
                      <p className="mt-1 text-3xl font-bold text-gray-900">
                        {(dailyVolume?.liters ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}<span className="text-lg text-gray-600">L</span>
                      </p>
                    </div>
                    <div className="rounded-2xl bg-blue-50 p-3">
                      <Droplets className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span><strong className="font-semibold text-gray-900">{dailyVolume?.collections ?? 0}</strong> collection{(dailyVolume?.collections ?? 0) !== 1 ? 's' : ''} today</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-amber-100/50 via-orange-100/30 to-transparent" />
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                        Payout Due
                      </CardTitle>
                      <p className="mt-1 text-3xl font-bold text-gray-900">
                        RF {(payoutDue?.amount ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-3">
                      <DollarSign className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span><strong className="font-semibold text-gray-900">{payoutDue?.collections ?? 0}</strong> collection{(payoutDue?.collections ?? 0) !== 1 ? 's' : ''} awaiting payment</span>
                  </div>
                </CardContent>
              </Card>

              {metricCards.slice(0, 2).map(({ label, value, subtitle, meta, icon: Icon, accent }) => {
                const config = cardConfig[accent] || cardConfig.primary
                return (
                  <Card key={label} className={`relative overflow-hidden rounded-3xl border ${config.border} bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                    <div className={`absolute right-0 top-0 h-full w-24 bg-gradient-to-b ${config.gradient}`} />
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className={`text-sm font-semibold uppercase tracking-wide ${config.labelColor}`}>
                            {label}
                          </CardTitle>
                          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
                        </div>
                        <div className={`rounded-2xl ${config.iconBg} p-3`}>
                          <Icon className={`h-6 w-6 ${config.iconColor}`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>{subtitle}</span>
                        <span><strong className="font-semibold text-gray-900">{meta}</strong></span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </section>

          {/* HarvestPlus Multi-Commodity Section */}
          {(user?.role === "MCC_MANAGER" || user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
            <section className="relative mt-12 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-[#0099f2] bg-clip-text text-transparent">
                    HarvestPlus by YDEN
                  </h2>
                  <p className="text-sm text-gray-600 font-medium">Multi-Commodity Aggregation & Settlement Platform</p>
                </div>
                <div className="flex gap-2">
                  {(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
                    <Link
                      href={`/${lang}/dashboard/admin/commodity-studio`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl text-sm font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-purple-500/20"
                    >
                      <Settings className="h-4 w-4" />
                      Commodity Studio
                    </Link>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {/* Commodity Stats Cards */}
                <Card className="relative overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-purple-100/50 via-indigo-100/30 to-transparent" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-purple-600">Total Commodities</CardTitle>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{commodities.length}</p>
                      </div>
                      <div className="rounded-2xl bg-purple-50 p-3">
                        <Wheat className="h-6 w-6 text-purple-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span>Active commodities</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-emerald-100/50 via-teal-100/30 to-transparent" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Collections</CardTitle>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{commodityStats?.totalCollections || 0}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 p-3">
                        <Package className="h-6 w-6 text-emerald-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span>Total recorded</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">Total Volume</CardTitle>
                        <p className="mt-1 text-3xl font-bold text-gray-900">
                          {commodityStats?.totalVolume ? commodityStats.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "0"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-blue-50 p-3">
                        <Activity className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span>Units collected</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-amber-100/50 via-orange-100/30 to-transparent" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-amber-600">Revenue</CardTitle>
                        <p className="mt-1 text-3xl font-bold text-gray-900">
                          RF {commodityStats?.totalRevenue ? commodityStats.totalRevenue.toLocaleString() : "0"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-amber-50 p-3">
                        <DollarSign className="h-6 w-6 text-amber-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span>Total revenue</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Commodity Breakdown */}
              {commodityStats?.byCommodity && Object.keys(commodityStats.byCommodity).length > 0 && (
                <Card className="mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900">Commodity Breakdown</CardTitle>
                    <CardDescription className="text-slate-600">Collections by commodity type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(commodityStats.byCommodity).map(([name, data]: [string, any]) => (
                        <div key={name} className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50/80 transition-colors">
                          <div className="flex items-center gap-3">
                            {name.toLowerCase().includes("milk") || name.toLowerCase().includes("Digital") ? (
                              <Droplets className="h-5 w-5 text-[#0099f2]" />
                            ) : name.toLowerCase().includes("coffee") ? (
                              <Coffee className="h-5 w-5 text-amber-600" />
                            ) : (
                              <Wheat className="h-5 w-5 text-green-600" />
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{name}</p>
                              <p className="text-xs text-gray-500">{data.count} collections</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{data.volume.toLocaleString(undefined, { maximumFractionDigits: 1 })} units</p>
                            <p className="text-xs text-gray-500">RF {data.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Collection Status */}
              {commodityStats && (
                <Card className="mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900">Collection Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 rounded-xl border border-[#0099f2]/20 bg-[#0099f2]/5 shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0099f2]/10">
                          <CheckCircle2 className="h-5 w-5 text-[#0099f2]" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-slate-900">{commodityStats.approvedCollections || 0}</p>
                          <p className="text-xs font-medium text-slate-600">Approved</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200/80 bg-amber-50/80 shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-slate-900">{commodityStats.pendingCollections || 0}</p>
                          <p className="text-xs font-medium text-slate-600">Pending</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Commodity Collection Form Dialog */}
              <CommodityCollectionForm
                open={isCollectionFormOpen}
                onOpenChange={setIsCollectionFormOpen}
                onSuccess={() => {
                  setIsCollectionFormOpen(false)
                  setRefreshTrigger((t) => t + 1)
                }}
              />
              {/* Collect Milk Dialog */}
              <AddCollectionForm
                open={addCollectionOpen}
                onOpenChange={setAddCollectionOpen}
                onSuccess={() => {
                  setAddCollectionOpen(false)
                  setRefreshTrigger((t) => t + 1)
                }}
              />
              {/* Sell Milk Dialog (embedded Sales page in dialog mode) */}
              {sellMilkOpen && (
                <SalesPageEmbed
                  embedMode
                  triggerOpenAddDialog
                  onClose={() => {
                    setSellMilkOpen(false)
                    setRefreshTrigger((t) => t + 1)
                  }}
                />
              )}
              {/* Process Payments Dialog – Select Farmer & Payment Summary */}
              <Dialog open={processPaymentsOpen} onOpenChange={setProcessPaymentsOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 rounded-3xl border border-slate-200 bg-white shadow-xl [&>button]:absolute [&>button]:right-5 [&>button]:top-5 [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:hover:bg-slate-100 [&>button]:rounded-full [&>button]:z-10 [&>button]:h-9 [&>button]:w-9">
                  <DialogTitle className="sr-only">Select Farmer &amp; Process Payment</DialogTitle>
                  <DialogDescription className="sr-only">Choose a farmer to view payment summary and process payment.</DialogDescription>
                  <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 pt-6 pb-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white border border-white/20 shadow-lg">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">Select Farmer</h2>
                        <p className="mt-1 text-sm text-slate-300">Choose a farmer to view payment summary and process payment</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-slate-50/80 to-white p-4 sm:p-6">
                  {processPaymentsOpen && (
                    <PaymentsPageEmbed
                      embedMode
                      triggerOpenProcessDialog
                      onClose={() => {
                        setProcessPaymentsOpen(false)
                        setRefreshTrigger((t) => t + 1)
                      }}
                    />
                  )}
                  </div>
                </DialogContent>
              </Dialog>
            </section>
          )}

        </div>
        </div>
      </div>
    )
  }

  // For ADMIN and SUPER_ADMIN users, show admin dashboard
  if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
    return <AdminDashboard lang={lang} />
  }

  // For other users, show a simplified dashboard - matches admin users style
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Dashboard</h1>
          <p className="text-gray-600 mt-1">Your dashboard is being prepared. Please check back soon.</p>
        </div>
        <Card className="border-2 border-blue-200 max-w-2xl">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0">
                {user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Admin Dashboard Component - Redesigned for ADMIN / SUPER_ADMIN
function AdminDashboard({ lang }: { lang: string }) {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("Gemurai_token")
        if (!token) return

        const response = await fetch("/api/v1/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setDashboardData(result.data)
          }
        }
      } catch (error) {
        console.error("Error fetching admin dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-indigo-600" />
          </div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const data = dashboardData || {
    overview: { totalUsers: 0, totalMCCs: 0, totalCommodities: 0, totalCategories: 0, totalFarmers: 0, totalAgents: 0, activeCommodities: 0 },
    collections: { total: 0, today: 0, thisMonth: 0, pending: 0, approved: 0, growth: "0" },
    revenue: { total: 0, today: 0, thisMonth: 0 },
    system: { totalQualityFields: 0, totalSeasonPlans: 0 },
    byCommodity: [],
    byStatus: [],
    recent: { collections: [], users: [] },
  }

  const statCards = [
    { title: "Users", value: data.overview.totalUsers, icon: Users, accent: "bg-indigo-500" },
    { title: "MCCs", value: data.overview.totalMCCs, icon: Building2, accent: "bg-slate-600" },
    { title: "Commodities", value: data.overview.totalCommodities, icon: Wheat, accent: "bg-emerald-500" },
    { title: "Farmers", value: data.overview.totalFarmers, icon: UserPlus, accent: "bg-sky-500" },
    { title: "Collections", value: data.collections.total, icon: Package, accent: "bg-violet-500", subtitle: `${data.collections.today} today`, change: data.collections.growth },
    { title: "Revenue", value: formatCurrency(data.revenue.total || 0, DEFAULT_CURRENCY), icon: DollarSign, accent: "bg-amber-500", subtitle: formatCurrency(data.revenue.thisMonth || 0, DEFAULT_CURRENCY) + " this month" },
  ]

  const quickLinks = [
    { href: `/${lang}/dashboard/admin/users`, label: "Manage Users", icon: Users },
    { href: `/${lang}/dashboard/admin/mccs`, label: "Manage MCCs", icon: Building2 },
    { href: `/${lang}/dashboard/admin/commodity-studio`, label: "Commodity Studio", icon: Wheat },
    { href: `/${lang}/dashboard/admin/reports`, label: "Reports", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
              <p className="mt-1 text-slate-600">
                {user?.name ? `Welcome back, ${user.name}` : "System overview"} · Key metrics at a glance
              </p>
            </div>
            <Badge variant="secondary" className="w-fit bg-slate-200 text-slate-700 hover:bg-slate-200 border-0 font-medium">
              {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
            </Badge>
          </div>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon
            return (
              <Card key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{stat.title}</p>
                      <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{stat.value}</p>
                      {stat.subtitle && <p className="mt-1 text-xs text-slate-500 truncate">{stat.subtitle}</p>}
                      {stat.change !== undefined && (
                        <div className="flex items-center gap-1 mt-2">
                          {parseFloat(stat.change) >= 0 ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />}
                          <span className={`text-xs font-medium ${parseFloat(stat.change) >= 0 ? "text-emerald-600" : "text-red-600"}`}>{Math.abs(parseFloat(stat.change))}%</span>
                        </div>
                      )}
                    </div>
                    <div className={`shrink-0 w-10 h-10 rounded-lg ${stat.accent} flex items-center justify-center text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </section>

        {/* Secondary metrics + Collection status */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
          {[
            { label: "Categories", value: data.overview.totalCategories, icon: Database },
            { label: "Agents", value: data.overview.totalAgents, icon: UserPlus },
            { label: "Quality Fields", value: data.system.totalQualityFields, icon: CheckSquare },
            { label: "Season Plans", value: data.system.totalSeasonPlans, icon: Calendar },
            { label: "Pending", value: data.collections.pending, icon: Clock, sub: "Awaiting approval" },
            { label: "Approved", value: data.collections.approved, icon: CheckCircle2, sub: "Ready for payment" },
            { label: "This month", value: data.collections.thisMonth, icon: TrendingUp, sub: "Current period" },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <Card key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-lg font-semibold text-slate-900 tabular-nums">{item.value}</p>
                      {item.sub && <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </section>

        {/* Recent activity + Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-600" />
                Recent Collections
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {data.recent.collections.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {data.recent.collections.slice(0, 5).map((collection: any) => (
                    <li key={collection.id} className="py-3 first:pt-0 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 truncate">{collection.commodity}</p>
                        <p className="text-sm text-slate-500 truncate">{collection.farmer} · {collection.mcc}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{new Date(collection.date).toLocaleDateString()} · {collection.quantity} units</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-slate-900">{formatCurrency(collection.amount || 0, DEFAULT_CURRENCY)}</p>
                        <Badge
                          className={`mt-1 text-xs ${
                            collection.status === "APPROVED" ? "bg-emerald-100 text-emerald-800 border-0" :
                            collection.status === "PENDING" ? "bg-amber-100 text-amber-800 border-0" :
                            "bg-slate-100 text-slate-700 border-0"
                          }`}
                        >
                          {collection.status}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <Package className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No recent collections</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-semibold text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 gap-2">
                  {quickLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-800 transition-colors"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                        <span className="font-medium flex-1">{link.label}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-600" />
                  Recent Users
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {data.recent.users.length > 0 ? (
                  <ul className="space-y-2">
                    {data.recent.users.slice(0, 4).map((u: any) => (
                      <li key={u.id} className="flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate text-sm">{u.name || "Unknown"}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email || "—"}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs bg-slate-100 text-slate-700 border-0">
                          {u.role}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-8 text-center text-slate-500 text-sm">No recent users</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}