"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  Droplets,
  Wheat,
  ClipboardList,
  ArrowRight,
  RefreshCw,
  Loader2,
  ExternalLink,
  Coffee,
} from "lucide-react"
import { CommodityCollectionForm } from "@/components/mcc/CommodityCollectionForm"
import { AddCollectionForm } from "../mcc/components/AddCollectionForm"
import { AddCropCollectionForm } from "@/components/mcc/AddCropCollectionForm"
import { formatCurrency, cn } from "@/lib/utils"

type CollectionType = "commodity" | "milk" | "crop" | null

const TYPE_OPTIONS: {
  id: CollectionType
  name: string
  description: string
  icon: typeof Package
  roles: string[]
  iconColor: string
  iconBg: string
  borderColor: string
}[] = [
  {
    id: "commodity",
    name: "Commodity Collections",
    description: "Multi-commodity intake (Digital, coffee, cereals) with dynamic quality",
    icon: Package,
    roles: ["MCC_MANAGER", "SUPER_ADMIN"],
    iconColor: "text-[#0099f2]",
    iconBg: "bg-[#0099f2]/10",
    borderColor: "border-[#0099f2]/30",
  },
  {
    id: "milk",
    name: "Milk Collections",
    description: "Digital milk with quality tests and deductions",
    icon: Droplets,
    roles: ["MCC_MANAGER", "SUPER_ADMIN"],
    iconColor: "text-sky-600",
    iconBg: "bg-sky-500/10",
    borderColor: "border-sky-200",
  },
  {
    id: "crop",
    name: "Crop Collections",
    description: "Maize, beans, etc. with quality and grading",
    icon: Wheat,
    roles: ["MCC_MANAGER", "SUPER_ADMIN"],
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-500/10",
    borderColor: "border-emerald-200",
  },
]

const RECENT_LIMIT = 10
const MILK_STATS_LIMIT = 2000

export default function CollectionsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const base = `/${lang}/dashboard`

  const [collectionType, setCollectionType] = useState<CollectionType>(null)
  const [commodityFormOpen, setCommodityFormOpen] = useState(false)
  const [milkFormOpen, setMilkFormOpen] = useState(false)
  const [cropFormOpen, setCropFormOpen] = useState(false)

  const [commodityCollections, setCommodityCollections] = useState<any[]>([])
  const [milkCollections, setMilkCollections] = useState<any[]>([])
  const [milkTotal, setMilkTotal] = useState(0)
  const [cropCollections, setCropCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<"commodity" | "milk" | "crop">("commodity")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const listSectionRef = useRef<HTMLDivElement>(null)

  const canAccess =
    user &&
    (user.role === "MCC_MANAGER" || user.role === "ADMIN" || user.role === "SUPER_ADMIN")

  const visibleTypes = TYPE_OPTIONS.filter((t) => t.id && canAccess && t.roles.includes(user!.role))

  const fetchAll = useCallback(async () => {
    const token = localStorage.getItem("Gemurai_token")
    if (!token || !user) return

    try {
      setLoading(true)
      const mccId = user.mccId ? `mccId=${user.mccId}` : ""

      const [commodityRes, milkRes, cropRes] = await Promise.all([
        fetch(`/api/v1/mcc/commodities/collections?${mccId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/v1/mcc/collections?${mccId}&limit=${MILK_STATS_LIMIT}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        user.mccId
          ? fetch(`/api/v1/mcc/crops/collections?mccId=${user.mccId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve({ ok: false, json: () => ({ data: [] }) }),
      ])

      if (commodityRes.ok) {
        const d = await commodityRes.json()
        setCommodityCollections(d.data || [])
      }
      if (milkRes.ok) {
        const d = await milkRes.json()
        setMilkCollections(d.data || [])
        setMilkTotal(d.meta?.total ?? (d.data || []).length)
      }
      if (cropRes.ok) {
        const d = await cropRes.json()
        setCropCollections(d.data || [])
      }
      setLastUpdated(new Date())
    } catch (e) {
      console.error("Error fetching collections:", e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    if (canAccess && user) fetchAll()
  }, [canAccess, user?.mccId])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAll()
  }

  const handleTypeSelect = (type: CollectionType) => {
    setCollectionType(type)
    if (type === "commodity") {
      setActiveTab("commodity")
      setCommodityFormOpen(true)
    }
    if (type === "milk") {
      setActiveTab("milk")
      setMilkFormOpen(true)
    }
    if (type === "crop") {
      setActiveTab("crop")
      setCropFormOpen(true)
    }
  }

  const onFormSuccess = () => {
    setCollectionType(null)
    fetchAll()
  }

  // Analytics per type
  const commodityStats = {
    total: commodityCollections.length,
    pending: commodityCollections.filter((c) => c.status === "PENDING").length,
    approved: commodityCollections.filter((c) => c.status === "APPROVED").length,
    paid: commodityCollections.filter((c) => c.status === "PAID").length,
    totalVolume: commodityCollections.reduce((s, c) => s + (c.quantity || 0), 0),
    totalRevenue: commodityCollections.reduce((s, c) => s + (c.totalAmount || 0), 0),
  }

  const milkStats = {
    total: milkTotal,
    volume: milkCollections.reduce((s, c) => s + (c.totalLiters || 0), 0),
    amount: milkCollections.reduce((s, c) => s + (c.totalAmount || 0), 0),
    accepted: milkCollections.filter((c) => c.qualityStatus === "accepted" || c.status === "APPROVED").length,
    pending: milkCollections.filter((c) => c.qualityStatus === "pending" || c.status === "PENDING").length,
  }

  const cropStats = {
    total: cropCollections.length,
    totalQuantity: cropCollections.reduce((s, c) => s + (c.quantity || 0), 0),
    totalRevenue: cropCollections.reduce((s, c) => s + (c.totalAmount || 0), 0),
    approved: cropCollections.filter((c) => c.status === "APPROVED").length,
    pending: cropCollections.filter((c) => c.status === "PENDING").length,
  }

  const getCommodityIcon = (name?: string) => {
    const n = (name || "").toLowerCase()
    if (n.includes("milk") || n.includes("Digital")) return <Droplets className="h-4 w-4 text-sky-600" />
    if (n.includes("coffee")) return <Coffee className="h-4 w-4 text-amber-600" />
    return <Wheat className="h-4 w-4 text-emerald-600" />
  }

  const formatDate = (value: string) => {
    try {
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString()
    } catch {
      return "—"
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <Card className="max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg">
          <CardContent className="pt-10 pb-10">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-2xl bg-slate-100 p-4 mb-4">
                <ClipboardList className="h-10 w-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
              <p className="mt-2 text-sm text-gray-600">
                You need MCC Manager or Admin access to access Collections.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full px-4 py-10 sm:px-6 lg:px-8">
          {/* Header - title then big action buttons */}
          <header className="mb-10 flex flex-col gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-1.5 shadow-sm ring-1 ring-gray-200">
                <ClipboardList className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  HarvestPlus • Collections
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Collections
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                  Record and view commodity, milk, and crop collections with analytics per type.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {visibleTypes.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = collectionType === opt.id
                  const unselectedBorder =
                    "border-2 border-sky-200 hover:border-sky-300"
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleTypeSelect(opt.id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-8 transition-all duration-200 min-h-[180px] text-left",
                        isSelected
                          ? "border-2 border-blue-500 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                          : cn("bg-white text-gray-800 hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5", unselectedBorder)
                      )}
                    >
                      <div className={cn(
                        "rounded-xl p-3",
                        isSelected ? "bg-white/20" : opt.iconBg
                      )}>
                        <Icon className={cn("h-8 w-8 shrink-0", isSelected ? "text-white" : opt.iconColor)} />
                      </div>
                      <span className={cn(
                        "text-base font-bold text-center leading-tight",
                        isSelected ? "text-white" : "text-gray-900"
                      )}>
                        {opt.name}
                      </span>
                      <span className={cn(
                        "text-center text-xs leading-snug max-w-[200px]",
                        isSelected ? "text-white/80" : "text-gray-500"
                      )}>
                        {opt.description}
                      </span>
                      <ArrowRight className={cn("h-5 w-5 shrink-0", isSelected ? "text-white/90" : "text-gray-400")} />
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loading || refreshing}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-white hover:shadow-md disabled:opacity-60"
                >
                  <RefreshCw className={cn("h-4 w-4", (loading || refreshing) && "animate-spin")} />
                  Refresh
                </Button>
                {lastUpdated && !loading && (
                  <span className="text-xs text-gray-500">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Summary cards - clickable to switch tab and scroll to list */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 mb-10">
            <Card
              role="button"
              tabIndex={0}
              onClick={() => { setActiveTab("commodity"); listSectionRef.current?.scrollIntoView({ behavior: "smooth" }) }}
              onKeyDown={(e) => e.key === "Enter" && (setActiveTab("commodity"), listSectionRef.current?.scrollIntoView({ behavior: "smooth" }))}
              className="relative cursor-pointer overflow-hidden rounded-3xl border-2 border-blue-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Commodity
                    </CardTitle>
                    {loading ? (
                      <div className="mt-1 flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                      </div>
                    ) : (
                      <p className="mt-1 text-3xl font-bold text-gray-900">{commodityStats.total}</p>
                    )}
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <Package className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  {!loading && (
                    <span><strong className="font-semibold text-gray-900">{formatCurrency(commodityStats.totalRevenue)}</strong> revenue</span>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card
              role="button"
              tabIndex={0}
              onClick={() => { setActiveTab("milk"); listSectionRef.current?.scrollIntoView({ behavior: "smooth" }) }}
              onKeyDown={(e) => e.key === "Enter" && (setActiveTab("milk"), listSectionRef.current?.scrollIntoView({ behavior: "smooth" }))}
              className="relative cursor-pointer overflow-hidden rounded-3xl border-2 border-sky-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
            >
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-sky-100/50 via-blue-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-sky-600">
                      Milk
                    </CardTitle>
                    {loading ? (
                      <div className="mt-1 flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                      </div>
                    ) : (
                      <p className="mt-1 text-3xl font-bold text-gray-900">{milkStats.total}</p>
                    )}
                  </div>
                  <div className="rounded-2xl bg-sky-50 p-3">
                    <Droplets className="h-6 w-6 text-sky-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  {!loading && (
                    <span><strong className="font-semibold text-gray-900">{milkStats.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} L</strong> · {formatCurrency(milkStats.amount)}</span>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card
              role="button"
              tabIndex={0}
              onClick={() => { setActiveTab("crop"); listSectionRef.current?.scrollIntoView({ behavior: "smooth" }) }}
              onKeyDown={(e) => e.key === "Enter" && (setActiveTab("crop"), listSectionRef.current?.scrollIntoView({ behavior: "smooth" }))}
              className="relative cursor-pointer overflow-hidden rounded-3xl border-2 border-emerald-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            >
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-emerald-100/50 via-teal-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                      Crop
                    </CardTitle>
                    {loading ? (
                      <div className="mt-1 flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                      </div>
                    ) : (
                      <p className="mt-1 text-3xl font-bold text-gray-900">{cropStats.total}</p>
                    )}
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <Wheat className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  {!loading && (
                    <span><strong className="font-semibold text-gray-900">{formatCurrency(cropStats.totalRevenue)}</strong> revenue</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Listings + analytics per type (tabs) */}
          <Card ref={listSectionRef} className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-md scroll-mt-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "commodity" | "milk" | "crop")} className="w-full">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle className="text-lg font-bold text-gray-900">Collections by type</CardTitle>
                  <TabsList className="h-10 rounded-xl bg-slate-100 p-1">
                    <TabsTrigger value="commodity" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                      Commodity
                    </TabsTrigger>
                    <TabsTrigger value="milk" className="rounded-lg data-[state=active]:bg-sky-600 data-[state=active]:text-white">
                      Milk
                    </TabsTrigger>
                    <TabsTrigger value="crop" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                      Crop
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <TabsContent value="commodity" className="mt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-500">Total</p>
                      <p className="text-lg font-bold text-gray-900">{commodityStats.total}</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3">
                      <p className="text-xs font-medium text-amber-700">Pending</p>
                      <p className="text-lg font-bold text-amber-900">{commodityStats.pending}</p>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-xs font-medium text-blue-700">Approved</p>
                      <p className="text-lg font-bold text-blue-900">{commodityStats.approved}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-xs font-medium text-emerald-700">Volume</p>
                      <p className="text-lg font-bold text-emerald-900">{commodityStats.totalVolume.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-xs font-medium text-blue-600">Revenue</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(commodityStats.totalRevenue)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Recent commodity collections</p>
                    <Button variant="ghost" size="sm" asChild className="gap-1 text-blue-600 hover:text-blue-700">
                      <Link href={`${base}/mcc/commodities/collections`}>
                        View all <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : commodityCollections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <Package className="h-10 w-10 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">No commodity collections yet</p>
                      <p className="text-sm text-gray-500 max-w-sm">Record Digital, coffee, or cereal intake with quality and pricing.</p>
                      <Button onClick={() => handleTypeSelect("commodity")} className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700">
                        Record commodity collection
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/80">
                            <TableHead className="font-semibold text-gray-700">Date</TableHead>
                            <TableHead className="font-semibold text-gray-700">Commodity</TableHead>
                            <TableHead className="font-semibold text-gray-700">Farmer</TableHead>
                            <TableHead className="font-semibold text-gray-700">Qty</TableHead>
                            <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {commodityCollections.slice(0, RECENT_LIMIT).map((c) => (
                            <TableRow key={c.id} className="hover:bg-slate-50/50">
                              <TableCell className="font-medium text-gray-900">{formatDate(c.collectionDate)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getCommodityIcon(c.commodity?.name)}
                                  <span>{c.commodity?.name || "—"}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-700">{c.farmer?.name || "—"}</TableCell>
                              <TableCell className="text-gray-900">{c.quantity != null ? `${c.quantity} ${c.unit || ""}` : "—"}</TableCell>
                              <TableCell className="font-medium text-gray-900">{formatCurrency(c.totalAmount)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn(
                                  c.status === "PAID" && "bg-emerald-500/10 text-emerald-700 border-emerald-200",
                                  c.status === "APPROVED" && "bg-blue-500/10 text-blue-700 border-blue-200",
                                  c.status === "PENDING" && "bg-amber-500/10 text-amber-700 border-amber-200"
                                )}>{c.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="milk" className="mt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-500">Total</p>
                      <p className="text-lg font-bold text-gray-900">{milkStats.total}</p>
                    </div>
                    <div className="rounded-xl bg-sky-50 p-3">
                      <p className="text-xs font-medium text-sky-700">Volume (L)</p>
                      <p className="text-lg font-bold text-sky-900">{milkStats.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-xs font-medium text-emerald-700">Amount</p>
                      <p className="text-lg font-bold text-emerald-900">{formatCurrency(milkStats.amount)}</p>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-xs font-medium text-blue-700">Accepted</p>
                      <p className="text-lg font-bold text-blue-900">{milkStats.accepted}</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3">
                      <p className="text-xs font-medium text-amber-700">Pending</p>
                      <p className="text-lg font-bold text-amber-900">{milkStats.pending}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Recent milk collections</p>
                    <Button variant="ghost" size="sm" asChild className="gap-1 text-sky-600 hover:text-sky-700">
                      <Link href={`${base}/mcc/collections`}>
                        View all <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                    </div>
                  ) : milkCollections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                      <div className="rounded-2xl bg-sky-100 p-4">
                        <Droplets className="h-10 w-10 text-sky-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">No milk collections yet</p>
                      <p className="text-sm text-gray-500 max-w-sm">Record Digital milk with quality tests and deductions.</p>
                      <Button onClick={() => handleTypeSelect("milk")} className="gap-2 rounded-xl bg-sky-600 hover:bg-sky-700">
                        Record milk collection
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/80">
                            <TableHead className="font-semibold text-gray-700">Date</TableHead>
                            <TableHead className="font-semibold text-gray-700">Farmer</TableHead>
                            <TableHead className="font-semibold text-gray-700">Agent</TableHead>
                            <TableHead className="font-semibold text-gray-700">Liters</TableHead>
                            <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                            <TableHead className="font-semibold text-gray-700">Quality</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {milkCollections.slice(0, RECENT_LIMIT).map((c) => (
                            <TableRow key={c.id} className="hover:bg-slate-50/50">
                              <TableCell className="font-medium text-gray-900">{formatDate(c.collectionDate)}</TableCell>
                              <TableCell className="text-gray-700">{c.farmers?.name || "—"}</TableCell>
                              <TableCell className="text-gray-600 text-sm">{c.agent?.name || "—"}</TableCell>
                              <TableCell className="text-gray-900">{c.totalLiters != null ? c.totalLiters.toLocaleString() : "—"}</TableCell>
                              <TableCell className="font-medium text-gray-900">{formatCurrency(c.totalAmount)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn(
                                  (c.qualityStatus === "accepted" || c.status === "APPROVED") && "bg-emerald-500/10 text-emerald-700 border-emerald-200",
                                  (c.qualityStatus === "pending" || c.status === "PENDING") && "bg-amber-500/10 text-amber-700 border-amber-200"
                                )}>{c.qualityStatus || c.status || "—"}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="crop" className="mt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-500">Total</p>
                      <p className="text-lg font-bold text-gray-900">{cropStats.total}</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3">
                      <p className="text-xs font-medium text-amber-700">Pending</p>
                      <p className="text-lg font-bold text-amber-900">{cropStats.pending}</p>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-xs font-medium text-blue-700">Approved</p>
                      <p className="text-lg font-bold text-blue-900">{cropStats.approved}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-xs font-medium text-emerald-700">Quantity</p>
                      <p className="text-lg font-bold text-emerald-900">{cropStats.totalQuantity.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-xs font-medium text-blue-600">Revenue</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(cropStats.totalRevenue)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Recent crop collections</p>
                    <Button variant="ghost" size="sm" asChild className="gap-1 text-emerald-600 hover:text-emerald-700">
                      <Link href={`${base}/mcc/crops/collections`}>
                        View all <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                  ) : cropCollections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                      <div className="rounded-2xl bg-emerald-100 p-4">
                        <Wheat className="h-10 w-10 text-emerald-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">No crop collections yet</p>
                      <p className="text-sm text-gray-500 max-w-sm">Record maize, beans, or other crops with quality and grading.</p>
                      <Button onClick={() => handleTypeSelect("crop")} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700">
                        Record crop collection
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/80">
                            <TableHead className="font-semibold text-gray-700">Date</TableHead>
                            <TableHead className="font-semibold text-gray-700">Crop type</TableHead>
                            <TableHead className="font-semibold text-gray-700">Farmer</TableHead>
                            <TableHead className="font-semibold text-gray-700">Qty</TableHead>
                            <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cropCollections.slice(0, RECENT_LIMIT).map((c) => (
                            <TableRow key={c.id} className="hover:bg-slate-50/50">
                              <TableCell className="font-medium text-gray-900">{formatDate(c.collectionDate)}</TableCell>
                              <TableCell className="text-gray-700">{c.cropType?.name || "—"}</TableCell>
                              <TableCell className="text-gray-700">{c.farmer?.name || "—"}</TableCell>
                              <TableCell className="text-gray-900">{c.quantity != null ? `${c.quantity} ${c.unit || "kg"}` : "—"}</TableCell>
                              <TableCell className="font-medium text-gray-900">{formatCurrency(c.totalAmount)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn(
                                  c.status === "PAID" && "bg-emerald-500/10 text-emerald-700 border-emerald-200",
                                  c.status === "APPROVED" && "bg-blue-500/10 text-blue-700 border-blue-200",
                                  c.status === "PENDING" && "bg-amber-500/10 text-amber-700 border-amber-200"
                                )}>{c.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <CommodityCollectionForm
        open={commodityFormOpen}
        onOpenChange={(open) => {
          setCommodityFormOpen(open)
          if (!open) setCollectionType(null)
        }}
        onSuccess={onFormSuccess}
        overrideMccId={user?.mccId || undefined}
      />
      <AddCollectionForm
        open={milkFormOpen}
        onOpenChange={(open) => {
          setMilkFormOpen(open)
          if (!open) setCollectionType(null)
        }}
        onSuccess={onFormSuccess}
      />
      <AddCropCollectionForm
        open={cropFormOpen}
        onOpenChange={(open) => {
          setCropFormOpen(open)
          if (!open) setCollectionType(null)
        }}
        onSuccess={onFormSuccess}
      />
    </div>
  )
}
