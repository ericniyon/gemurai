"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { 
  type LucideIcon,
  Activity, ShoppingCart, Truck, UserPlus, BatteryCharging, GaugeCircle, Package, ClipboardList, PiggyBank, AlertTriangle
} from "lucide-react"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function DashboardPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  
  // Check if user is MCC_MANAGER
  const isMCCManager = user?.role === "MCC_MANAGER"
  
  const [mccDashboardData, setMccDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [trendPeriod, setTrendPeriod] = useState<"7D" | "30D" | "90D">("30D")

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
              }
            }
          } catch (error) {
            console.error("Error fetching MCC dashboard:", error)
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
  }, [user, isMCCManager])

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

  const COLORS = ["#2563eb", "#9ca3af"] // Blue for collections, grey for sales

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
          shadow: "hover:shadow-blue-500/10",
          borderHover: "hover:border-blue-300/60",
          gradientBg: "from-blue-50/50",
          gradientBgHover: "from-blue-50/30",
          gradientBar: "from-blue-500 via-blue-600 to-blue-500",
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
          shadow: "hover:shadow-blue-500/10",
          borderHover: "hover:border-blue-300/60",
          gradientBg: "from-blue-50/50",
          gradientBgHover: "from-blue-50/30",
          gradientBar: "from-blue-500 via-blue-600 to-blue-500",
        }
    }
  }

  // MCC Dashboard rendering
  if (isMCCManager) {
    const collectionsVolume = mccDashboardData?.collections?.totalVolume ?? 0
    const collectionsCount = mccDashboardData?.collections?.total ?? 0
    const salesLiters = mccDashboardData?.sales?.totalLiters ?? 0
    const salesCount = mccDashboardData?.sales?.totalSales ?? 0
    const salesRevenue = mccDashboardData?.sales?.totalRevenue ?? 0
    const suppliersActive = mccDashboardData?.suppliers?.active ?? 0
    const suppliersTotal = mccDashboardData?.suppliers?.total ?? 0
    const customersActive = mccDashboardData?.customers?.active ?? 0
    const customersTotal = mccDashboardData?.customers?.total ?? 0
    const recentActivity = mccDashboardData?.recentActivity ?? []
    const collectionsRevenue = collectionsVolume * 385

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
      []
    const rawExpiring =
      inventoryData?.expiringSoon ??
      inventoryData?.expiring_soon ??
      []
    const lowStockProducts = Array.isArray(rawLowStock)
      ? rawLowStock
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
      []
    const rawOverdueRentals =
      rentalsData?.overdue ??
      rentalsData?.overdueRentals ??
      []
    const activeRentals = Array.isArray(rawActiveRentals)
      ? rawActiveRentals
      : []
    const overdueRentals = Array.isArray(rawOverdueRentals)
      ? rawOverdueRentals
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
      0
    const outstandingAmount =
      financialData?.outstandingAmount ??
      financialData?.outstanding_amount ??
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
      href: string
      icon: LucideIcon
      accent: Accent
    }> = [
      {
        title: "Collect Milk",
        href: `/${lang}/dashboard/mcc/collections`,
        icon: Truck,
        accent: "primary",
      },
      {
        title: "Sell Milk",
        href: `/${lang}/dashboard/mcc/sales`,
        icon: ShoppingCart,
        accent: "primary",
      },
      {
        title: "Add Supplier",
        href: `/${lang}/dashboard/mcc/suppliers`,
        icon: UserPlus,
        accent: "primary",
      },
      {
        title: "Add Customer",
        href: `/${lang}/dashboard/mcc/customers`,
        icon: UserPlus,
        accent: "primary",
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
        subtitle: `${collectionsCount} Collections`,
        meta: `RF ${collectionsRevenue.toLocaleString()}`,
        icon: Truck,
        accent: "primary",
      },
      {
        label: "Milk Sales",
        value: `${salesLiters.toLocaleString(undefined, { maximumFractionDigits: 1 })}L`,
        subtitle: `${salesCount} Sales`,
        meta: `RF ${salesRevenue.toLocaleString()}`,
        icon: ShoppingCart,
        accent: "emerald",
      },
      {
        label: "Active Suppliers",
        value: `${suppliersActive}`,
        subtitle: `${Math.max(suppliersTotal - suppliersActive, 0)} Inactive`,
        meta: `${suppliersTotal} Total`,
        icon: UserPlus,
        accent: "purple",
      },
      {
        label: "Active Customers",
        value: `${customersActive}`,
        subtitle: `${Math.max(customersTotal - customersActive, 0)} Inactive`,
        meta: `${customersTotal} Total`,
        icon: UserPlus,
        accent: "amber",
      },
    ]

    // Render the MCC dashboard
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
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    MCC Manager • Dashboard
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">MCC Dashboard</h1>
                  <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">Monitor operations, track performance, and manage your milk collection center</p>
                </div>
              </div>
            </header>
        
        <div className="w-full px-2 sm:px-3 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Quick Actions Section */}
          <section id="inventory-rentals" className="relative mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-600">Get started with common tasks</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map(({ title, href, icon: Icon, accent }) => {
                const accentClasses = getAccentClasses(accent)
                return (
                  <Link key={title} href={href} className="group">
                    <Card className="relative bg-gradient-to-br from-white via-white to-blue-50/30 border border-blue-100/60 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 hover:scale-[1.02]">
                      {/* Top gradient bar - always visible */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600"></div>
                      
                      <CardContent className="relative p-3 sm:p-4">
                        {/* Icon container */}
                        <div className="mb-3 flex justify-center">
                          <div className="relative">
                            <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm group-hover:shadow-md transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-6`}>
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white relative z-10" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Text content */}
                        <div className="text-center space-y-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-blue-700 transition-colors duration-300">
                            {title}
                          </h3>
                          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                            <span>Get Started</span>
                            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Summary Cards Section */}
          <section className="relative mt-12">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metricCards.map(({ label, value, subtitle, meta, icon: Icon, accent }) => {
                const accentClasses = getAccentClasses(accent)
                const borderColors = {
                  primary: "border-blue-100",
                  emerald: "border-emerald-100",
                  purple: "border-purple-100",
                  amber: "border-amber-100"
                }
                return (
                  <Card key={label} className={`group relative overflow-hidden rounded-3xl ${borderColors[accent]} bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                    <div className={`absolute right-0 top-0 h-full w-24 bg-gradient-to-b ${accent === 'primary' ? 'from-blue-100/50 via-indigo-100/30' : accent === 'emerald' ? 'from-emerald-100/50 via-teal-100/30' : accent === 'purple' ? 'from-purple-100/60 via-indigo-100/30' : 'from-amber-100/50 via-orange-100/30'} to-transparent`} />
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className={`text-sm font-semibold uppercase tracking-wide ${accentClasses.textColor}`}>
                            {label}
                          </CardTitle>
                          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
                        </div>
                        <div className={`rounded-2xl ${accent === 'primary' ? 'bg-blue-50' : accent === 'emerald' ? 'bg-emerald-50' : accent === 'purple' ? 'bg-purple-50' : 'bg-amber-50'} p-3`}>
                          <Icon className={`h-6 w-6 ${accentClasses.icon}`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>
                          <strong className="font-semibold text-gray-900">{subtitle}</strong>
                        </span>
                        <span>
                          <strong className={`font-semibold ${accentClasses.textColor}`}>{meta}</strong>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* Operational Readiness Section */}
          <section className="relative mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Operational Readiness</h2>
                <p className="text-sm text-gray-600">Stay ahead on transport, power, and workforce capacity</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Vehicles Overview */}
              <Card className="group bg-white border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500"></div>
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <CardHeader className="border-b-2 border-slate-100 pb-3 sm:pb-4 bg-gradient-to-r from-slate-50/80 to-sky-50/60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500 text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-bold text-gray-900">Fleet Status</CardTitle>
                        <p className="text-xs font-semibold text-gray-500">Total vehicles: {vehiclesSummary.total}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/30 shadow-sm">
                      Updated {formatDisplayDate(vehiclesSummary.updatedAt, "Recently")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-5">
                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-gray-700">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2 shadow-sm">
                      <p className="text-[11px] text-blue-500 font-bold uppercase tracking-wide">Available</p>
                      <p className="text-lg sm:text-xl text-blue-700 font-black">{vehiclesSummary.available}</p>
                    </div>
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 px-3 py-2 shadow-sm">
                      <p className="text-[11px] text-indigo-500 font-bold uppercase tracking-wide">On Route</p>
                      <p className="text-lg sm:text-xl text-indigo-700 font-black">{vehiclesSummary.onRoute}</p>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2 shadow-sm col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-amber-500 font-bold uppercase tracking-wide">Under Maintenance</p>
                          <p className="text-lg sm:text-xl text-amber-600 font-black">{vehiclesSummary.maintenance}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">Next Service</span>
                          <span className="text-xs sm:text-sm font-bold text-gray-700">
                            {formatDisplayDate(vehiclesSummary.nextService, "Schedule pending")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Power Assets */}
              <Card className="group bg-white border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/15 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <CardHeader className="border-b-2 border-slate-100 pb-3 sm:pb-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <BatteryCharging className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-bold text-gray-900">Power Assets</CardTitle>
                        <p className="text-xs font-semibold text-gray-500">Total assets: {powerSummary.total}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 shadow-sm">
                      Last Tested {formatDisplayDate(powerSummary.lastTested, "N/A")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-5">
                  <div className="space-y-3 text-xs sm:text-sm font-semibold text-gray-700">
                    <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/40 px-3 py-2 shadow-sm">
                      <span className="text-emerald-600 uppercase tracking-wide text-[11px] font-bold">Operational</span>
                      <span className="text-lg sm:text-xl font-black text-emerald-700">{powerSummary.operational}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/40 px-3 py-2 shadow-sm">
                      <span className="text-amber-600 uppercase tracking-wide text-[11px] font-bold">Maintenance Due</span>
                      <span className="text-lg sm:text-xl font-black text-amber-600">{powerSummary.maintenanceDue}</span>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white/60 px-3 py-2 shadow-sm">
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">Power Readiness</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Reliable power keeps milk chilled and operations running. Track testing schedules to avoid downtime.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Capacity Snapshot */}
              <Card className="group bg-white border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:shadow-purple-500/15 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <CardHeader className="border-b-2 border-slate-100 pb-3 sm:pb-4 bg-gradient-to-r from-purple-50/80 to-indigo-50/60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <GaugeCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-bold text-gray-900">Capacity Snapshot</CardTitle>
                        <p className="text-xs font-semibold text-gray-500">
                          {capacitySummary?.assessedAt ? `Assessed ${formatDisplayDate(capacitySummary.assessedAt)}` : "No recent assessment"}
                        </p>
                      </div>
                    </div>
                    <Badge className={`border ${capacitySummary?.powerOk ? "bg-green-500/10 text-green-600 border-green-500/40" : "bg-red-500/10 text-red-600 border-red-500/40"}`}>
                      {capacitySummary?.powerOk ? "Power OK" : "Power Risk"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-5">
                  {capacitySummary ? (
                    <div className="space-y-3 text-xs sm:text-sm font-semibold text-gray-700">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 px-3 py-2 shadow-sm">
                          <p className="text-[11px] text-indigo-500 font-bold uppercase tracking-wide">Staff</p>
                          <p className="text-lg sm:text-xl text-indigo-700 font-black">{capacitySummary.staffCount}</p>
                          <p className="text-[11px] text-gray-500 font-semibold">Trained {trainedStaffPercentage}%</p>
                        </div>
                        <div className="rounded-xl border border-sky-100 bg-sky-50/40 px-3 py-2 shadow-sm">
                          <p className="text-[11px] text-sky-500 font-bold uppercase tracking-wide">Transport</p>
                          <p className="text-lg sm:text-xl text-sky-700 font-black">
                            {(capacitySummary.transportCapacity ?? 0).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-gray-500 font-semibold">Liters capacity</p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] text-purple-500 font-bold uppercase tracking-wide">Cooling Capacity</p>
                            <p className="text-lg sm:text-xl text-purple-700 font-black">
                              {(capacitySummary.coolingCapacity ?? 0).toLocaleString()} L
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] text-gray-500 font-semibold">Demand</p>
                            <p className="text-sm sm:text-base text-gray-700 font-bold">
                              {(capacitySummary.demand ?? 0).toLocaleString()} L
                            </p>
                          </div>
                        </div>
                        <p className={`mt-2 text-xs sm:text-sm font-bold ${coolingCapacityGap >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {coolingCapacityGap >= 0
                            ? `Surplus of ${coolingCapacityGap.toLocaleString()} L`
                            : `Gap of ${(Math.abs(coolingCapacityGap)).toLocaleString()} L`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-gray-500 font-semibold">
                      No capacity assessment recorded yet. Schedule one to unlock insights.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Inventory & Rentals Section */}
          <section className="relative mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Inventory & Rentals</h2>
                <p className="text-sm text-gray-600">Keep stock healthy and equipment circulating smoothly</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/${lang}/dashboard/mcc/products`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Manage Inventory
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7v14" />
                  </svg>
                </Link>
                <Link
                  href={`/${lang}/dashboard/mcc/assets`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  View Rentals
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Inventory Snapshot */}
              <Card className="group bg-white border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <CardHeader className="border-b-2 border-slate-100 pb-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-bold text-gray-900">Inventory Snapshot</CardTitle>
                        <p className="text-xs font-semibold text-gray-500">
                          {inventorySummary.totalProducts} products · {(inventorySummary.totalStock ?? 0).toLocaleString()} units
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 shadow-sm">
                      {inventorySummary.lowStockCount} low stock
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-emerald-100 bg-white/70 shadow-sm p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Low Stock Alerts</h3>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                          {inventorySummary.lowStockCount}
                        </Badge>
                      </div>
                      {lowStockProducts.length > 0 ? (
                        <div className="space-y-3">
                          {lowStockProducts.slice(0, 4).map((product: any, index: number) => (
                            <div
                              key={product?.id ?? product?.sku ?? index}
                              className="flex items-start justify-between rounded-xl border border-emerald-100/60 bg-emerald-50/40 px-3 py-2 shadow-sm"
                            >
                              <div>
                                <p className="text-sm font-bold text-emerald-700">{product?.name ?? "Product"}</p>
                                <p className="text-xs text-gray-500 font-semibold">
                                  {product?.sku ? `SKU ${product.sku}` : "SKU pending"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-black text-emerald-600">
                                  {(product?.stock_qty ?? product?.stockQty ?? 0).toLocaleString()}
                                </p>
                                <p className="text-[11px] text-gray-500 font-semibold uppercase">Stock</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 font-semibold text-center py-4">
                          All products are above reorder thresholds.
                        </p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/50 shadow-sm p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Expiring Soon</h3>
                        <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30">
                          {inventorySummary.expiringCount}
                        </Badge>
                      </div>
                      {expiringProducts.length > 0 ? (
                        <div className="space-y-3">
                          {expiringProducts.slice(0, 4).map((product: any, index: number) => (
                            <div
                              key={product?.id ?? product?.sku ?? `exp-${index}`}
                              className="flex items-center justify-between rounded-xl border border-amber-100 bg-white/70 px-3 py-2 shadow-sm"
                            >
                              <div>
                                <p className="text-sm font-bold text-amber-700">{product?.name ?? "Product"}</p>
                                <p className="text-xs text-gray-500 font-semibold">
                                  {product?.expiry_date ?? product?.expiryDate
                                    ? `Expires ${formatDisplayDate(product?.expiry_date ?? product?.expiryDate)}`
                                    : "No expiry date"}
                                </p>
                              </div>
                              <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30">
                                {(product?.stock_qty ?? product?.stockQty ?? 0).toLocaleString()} units
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 font-semibold text-center py-4">
                          No products nearing expiry.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rentals Overview */}
              <Card className="group bg-white border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <CardHeader className="border-b-2 border-slate-100 pb-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <ClipboardList className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-bold text-gray-900">Equipment Rentals</CardTitle>
                        <p className="text-xs font-semibold text-gray-500">
                          {rentalsSummary.activeCount} active · {rentalsSummary.overdueCount} overdue
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-indigo-500/10 text-indigo-600 border border-indigo-500/30 shadow-sm">
                      {rentalsSummary.returnedToday} returned today
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-indigo-100 bg-white/80 shadow-sm p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Active Rentals</h3>
                        <Badge className="bg-indigo-500/10 text-indigo-600 border border-indigo-500/30">
                          {activeRentals.length}
                        </Badge>
                      </div>
                      {activeRentals.length > 0 ? (
                        <div className="space-y-3">
                          {activeRentals.slice(0, 4).map((rental: any, index: number) => (
                            <div
                              key={rental?.id ?? `rental-${index}`}
                              className="flex items-start justify-between rounded-xl border border-indigo-100/60 bg-indigo-50/40 px-3 py-2 shadow-sm"
                            >
                              <div>
                                <p className="text-sm font-bold text-indigo-700">
                                  {rental?.asset_name ?? rental?.assetName ?? "Asset"}
                                </p>
                                <p className="text-xs text-gray-500 font-semibold">
                                  Holder: {rental?.farmer_name ?? rental?.farmerName ?? rental?.holder ?? "Farmer"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 font-semibold uppercase">Due</p>
                                <p className="text-sm font-bold text-indigo-700">
                                  {formatDisplayDate(rental?.rent_end ?? rental?.rentEnd, "Open")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 font-semibold text-center py-4">
                          No active rentals currently issued.
                        </p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-rose-100 bg-rose-50/60 shadow-sm p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Overdue Returns</h3>
                        <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/30">
                          {overdueRentals.length}
                        </Badge>
                      </div>
                      {overdueRentals.length > 0 ? (
                        <div className="space-y-3">
                          {overdueRentals.slice(0, 3).map((rental: any, index: number) => (
                            <div
                              key={rental?.id ?? `overdue-${index}`}
                              className="flex items-start justify-between rounded-xl border border-rose-100 bg-white/70 px-3 py-2 shadow-sm"
                            >
                              <div>
                                <p className="text-sm font-bold text-rose-700">
                                  {rental?.asset_name ?? rental?.assetName ?? "Asset"}
                                </p>
                                <p className="text-xs text-gray-500 font-semibold">
                                  Holder: {rental?.farmer_name ?? rental?.farmerName ?? rental?.holder ?? "Farmer"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 font-semibold uppercase">Overdue</p>
                                <p className="text-sm font-bold text-rose-700">
                                  {formatDisplayDate(rental?.rent_end ?? rental?.rentEnd, "Check")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 font-semibold text-center py-4">
                          No overdue rentals. Great job!
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Charts Section */}
          <section className="relative mt-12">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
              {/* Bar Chart */}
              <Card className="group bg-white border-2 border-gray-100 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 lg:col-span-2 transform hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-500"></div>
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <CardHeader className="border-b-2 border-gray-100 pb-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 relative">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                        Milk Collection & Sales Trends
                      </CardTitle>
                      <p className="text-sm text-gray-600">Track your daily performance</p>
                    </div>
                    <div className="flex gap-1 bg-white/80 backdrop-blur-sm p-1 sm:p-1.5 rounded-xl border border-gray-200/60 shadow-lg">
                      {(['7D', '30D', '90D'] as const).map((period) => (
                        <Button
                          key={period}
                          variant="ghost"
                          size="sm"
                          onClick={() => setTrendPeriod(period)}
                          className={
                            trendPeriod === period
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/40 font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm'
                              : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm'
                          }
                        >
                          {period}
                        </Button>
                      ))}
                    </div>
                  </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
                  <RechartsBarChart data={formatTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tick={{ fill: '#9ca3af' }} />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={11}
                      tick={{ fill: '#9ca3af' }}
                      label={{ value: 'Liters', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        padding: '12px',
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#6b7280', paddingTop: 12 }} />
                    <Bar dataKey="collections" fill="url(#collectionsGradient)" name="Collections" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="sales" fill="url(#salesGradient)" name="Sales" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="collectionsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9ca3af" stopOpacity={1} />
                        <stop offset="100%" stopColor="#6b7280" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

              {/* Donut Chart */}
              <Card className="group bg-white border-2 border-gray-100 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-600 to-rose-500"></div>
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-pink-500 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <CardHeader className="border-b-2 border-gray-100 pb-4 sm:pb-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 relative">
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                      Collection vs Sales Distribution
                    </CardTitle>
                    <p className="text-sm text-gray-600">Volume breakdown analysis</p>
                  </div>
                </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <div className="relative">
                  <ResponsiveContainer width="100%" height={220} className="sm:!h-[260px]">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? "url(#collectionsPieGradient)" : "url(#salesPieGradient)"} 
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          padding: '12px',
                        }}
                      />
                      <defs>
                        <linearGradient id="collectionsPieGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="salesPieGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#9ca3af" stopOpacity={1} />
                          <stop offset="100%" stopColor="#6b7280" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{donutTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} L</p>
                      <p className="text-sm font-semibold text-blue-600 mt-1">{collectionsPercentage}% Collections</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-center gap-8 pt-6 border-t border-gray-100/80">
                  <div className="flex items-center gap-3 group/legend">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg group-hover/legend:scale-110 transition-transform duration-200"></div>
                    <span className="text-sm font-semibold text-gray-700 group-hover/legend:text-blue-600 transition-colors">Collections</span>
                  </div>
                  <div className="flex items-center gap-3 group/legend">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg group-hover/legend:scale-110 transition-transform duration-200"></div>
                    <span className="text-sm font-semibold text-gray-700 group-hover/legend:text-gray-600 transition-colors">Sales</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
          </section>

          {/* Recent Activity Section */}
          <section className="relative mt-12">
            <Card className="group bg-white border-2 border-gray-100 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-500"></div>
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              <CardHeader className="border-b-2 border-gray-100 pb-3 sm:pb-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 relative">
                <div className="flex justify-end">
                  <Link
                    href={`/${lang}/dashboard/mcc/collections`}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-2 border-blue-700 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group/link"
                  >
                    View All Activities
                    <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity: any, index: number) => {
                      const activityDate = activity?.date || activity?.created_at || activity?.createdAt
                      return (
                        <div
                          key={activity?.id || index}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border-2 border-gray-100 bg-gradient-to-r from-white to-gray-50/30 p-5 sm:px-6 sm:py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50/30 hover:border-blue-200 transition-all duration-500 group/item transform hover:scale-[1.02] hover:-translate-y-1 shadow-md hover:shadow-xl gap-4 relative overflow-hidden"
                        >
                          {/* Decorative accent line */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                            <div className="relative">
                              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white shadow-xl group-hover/item:scale-110 group-hover/item:rotate-12 transition-all duration-500 border-2 border-white flex-shrink-0">
                                <Truck className="h-6 w-6 sm:h-7 sm:w-7 relative z-10" />
                              </div>
                              <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl opacity-0 group-hover/item:opacity-30 blur-md transition-opacity duration-500"></div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-base sm:text-lg font-bold text-gray-900 group-hover/item:text-blue-700 transition-colors truncate mb-1">
                                {activity?.description || activity?.type || 'Collection recorded'}
                              </p>
                              {activityDate ? (
                                <p className="text-xs sm:text-sm text-gray-600 font-semibold flex items-center gap-2">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="truncate">{activityDate}</span>
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0 pl-16 sm:pl-0">
                            <p className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 group-hover/item:from-blue-700 group-hover/item:to-indigo-700 transition-all mb-1">
                              RF {(activity?.amount || 0).toLocaleString()}
                            </p>
                            {activity?.liters ? (
                              <p className="text-xs sm:text-sm font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 rounded-full inline-block border-2 border-gray-200 shadow-sm">{activity.liters} L</p>
                            ) : null}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="py-16 text-center">
                      <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg border border-gray-200/60">
                        <Truck className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-lg font-bold text-gray-700 mb-2">No recent activity yet</p>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto">New transactions and updates will appear here automatically as they occur.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Financial & Quality Section */}
          <section className="relative mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Financial & Quality</h2>
                <p className="text-sm text-gray-600">Track cash flow and maintain quality standards</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/${lang}/dashboard/mcc/payments`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Review Payments
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href={`/${lang}/dashboard/mcc/quality`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Quality Logs
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Financial Overview */}
              <Card className="group bg-white border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <CardHeader className="border-b-2 border-slate-100 pb-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <PiggyBank className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-bold text-gray-900">Financial Overview</CardTitle>
                        <p className="text-xs font-semibold text-gray-500">Stay current on payouts and balances</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/30 shadow-sm">
                      {pendingPayments} pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs sm:text-sm font-semibold text-gray-700">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3 shadow-sm">
                      <p className="text-[11px] text-blue-500 font-bold uppercase tracking-wide">Pending Payments</p>
                      <p className="text-lg sm:text-2xl text-blue-700 font-black">
                        RF {Number(outstandingAmount ?? 0).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-gray-500 font-semibold">Awaiting disbursement</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 shadow-sm">
                      <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-wide">Farmer Balances</p>
                      <p className="text-lg sm:text-2xl text-emerald-700 font-black">
                        RF {Number(farmerBalance ?? 0).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-gray-500 font-semibold">Current credit balance</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm sm:col-span-2">
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">Next Steps</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Keep farmer balances within agreed limits and confirm MOMO/bank payments promptly to maintain trust.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Alerts */}
              <Card className="group bg-white border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500"></div>
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <CardHeader className="border-b-2 border-slate-100 pb-4 bg-gradient-to-r from-rose-50/80 to-orange-50/60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-bold text-gray-900">Quality & Compliance</CardTitle>
                        <p className="text-xs font-semibold text-gray-500">
                          Rejection rate {Number(rejectionRate ?? 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <Badge className={rejectionRate > 5 ? "bg-rose-500/10 text-rose-600 border border-rose-500/30 shadow-sm" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 shadow-sm"}>
                      {rejectionRate > 5 ? "Attention" : "Healthy"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                  {formattedQualityAlerts.length > 0 ? (
                    <div className="space-y-3">
                      {formattedQualityAlerts.slice(0, 5).map((alert: any, index: number) => (
                        <div
                          key={alert?.id ?? `quality-${index}`}
                          className="flex items-start justify-between rounded-2xl border border-rose-100 bg-white/70 px-4 py-3 shadow-sm"
                        >
                          <div>
                            <p className="text-sm font-bold text-rose-700">
                              {alert?.title ?? alert?.type ?? "Quality Alert"}
                            </p>
                            <p className="text-xs text-gray-500 font-semibold">
                              {alert?.message ?? alert?.description ?? "Check lab results and take corrective action."}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-semibold uppercase">Logged</p>
                            <p className="text-sm font-bold text-gray-700">
                              {formatDisplayDate(alert?.created_at ?? alert?.createdAt, "Today")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-emerald-500">
                        <AlertTriangle className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-bold text-emerald-600">No quality alerts right now.</p>
                      <p className="text-xs text-gray-500 font-semibold">
                        Continue validating milk samples to maintain this standard.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
          </div>
        </div>
      </div>
    )
  }

  // For non-MCC Manager users, show a simplified dashboard
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16 animate-fade-in space-y-6">
          <div className="inline-flex items-center justify-center p-8 bg-primary/10 rounded-3xl shadow-lg shadow-primary/10">
            <Activity className="h-20 w-20 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to Dashboard
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-lg">
            Your dashboard is being prepared. Please check back soon.
          </p>
          <Badge className="bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold shadow-lg shadow-primary/20">
            {user.role}
          </Badge>
        </div>
      </div>
    </div>
  )
}