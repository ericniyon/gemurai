"use client"

import { useState, useEffect } from "react"
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
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package, Plus, Wheat, Droplets, Coffee, Activity, DollarSign, ClipboardList, Eye } from "lucide-react"
import { CommodityCollectionForm } from "@/components/mcc/CommodityCollectionForm"
import { formatCurrency } from "@/lib/utils"

const cardConfig: Record<string, { border: string; gradient: string; iconBg: string; labelColor: string; iconColor: string }> = {
  primary: { border: "border-blue-100", gradient: "from-blue-100/50 via-indigo-100/30 to-transparent", iconBg: "bg-blue-50", labelColor: "text-blue-600", iconColor: "text-blue-500" },
  emerald: { border: "border-emerald-100", gradient: "from-emerald-100/50 via-teal-100/30 to-transparent", iconBg: "bg-emerald-50", labelColor: "text-emerald-600", iconColor: "text-emerald-500" },
  purple: { border: "border-purple-100", gradient: "from-purple-100/50 via-indigo-100/30 to-transparent", iconBg: "bg-purple-50", labelColor: "text-purple-600", iconColor: "text-purple-500" },
  amber: { border: "border-amber-100", gradient: "from-amber-100/50 via-orange-100/30 to-transparent", iconBg: "bg-amber-50", labelColor: "text-amber-600", iconColor: "text-amber-500" },
}

export default function CommodityCollectionsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [collections, setCollections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [qualityReviewCollection, setQualityReviewCollection] = useState<any | null>(null)

  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const url = user?.mccId
        ? `/api/v1/mcc/commodities/collections?mccId=${user.mccId}`
        : "/api/v1/mcc/commodities/collections"
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCollections(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching collections:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCollections()
  }, [user?.mccId])

  const getCommodityIcon = (name?: string) => {
    const n = (name || "").toLowerCase()
    if (n.includes("milk") || n.includes("dairy")) return <Droplets className="h-4 w-4 text-blue-600" />
    if (n.includes("coffee")) return <Coffee className="h-4 w-4 text-amber-600" />
    return <Wheat className="h-4 w-4 text-emerald-600" />
  }

  const stats = {
    total: collections.length,
    pending: collections.filter((c) => c.status === "PENDING").length,
    approved: collections.filter((c) => c.status === "APPROVED").length,
    paid: collections.filter((c) => c.status === "PAID").length,
    totalVolume: collections.reduce((sum, c) => sum + (c.quantity || 0), 0),
    totalRevenue: collections.reduce((sum, c) => sum + (c.totalAmount || 0), 0),
  }

  const statCards = [
    { label: "Total Collections", value: stats.total, config: "primary", icon: Package },
    { label: "Pending", value: stats.pending, config: "amber", icon: Activity },
    { label: "Approved", value: stats.approved, config: "primary", icon: Package },
    { label: "Total Volume", value: stats.totalVolume.toLocaleString(), config: "emerald", icon: Activity },
    { label: "Revenue", value: formatCurrency(stats.totalRevenue), config: "purple", icon: DollarSign },
  ]

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="max-w-md border-slate-200">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-xl bg-slate-900 p-4">
                <Package className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
              <p className="mt-2 text-sm text-slate-600">
                You need MCC Manager or Admin access to view commodity collections.
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
        {/* Decorative blurs - match dashboard */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full px-0 py-10">
          {/* Header - match dashboard */}
          <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-1.5 shadow-sm ring-1 ring-gray-200">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  HarvestPlus • Collections
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Multi-Commodity Collections
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                  Record and manage collections across all commodities (Dairy, Coffee, Cereals, etc.)
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
            >
              <Plus className="h-4 w-4" />
              Record Collection
            </Button>
          </header>

          {/* Stats - match dashboard card style */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5 mb-10">
            {statCards.map(({ label, value, config, icon: Icon }) => {
              const cfg = cardConfig[config] || cardConfig.primary
              return (
                <Card
                  key={label}
                  className={`relative overflow-hidden rounded-3xl border ${cfg.border} bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
                >
                  <div className={`absolute right-0 top-0 h-full w-24 bg-gradient-to-b ${cfg.gradient}`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className={`text-sm font-semibold uppercase tracking-wide ${cfg.labelColor}`}>
                          {label}
                        </CardTitle>
                        <p className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{value}</p>
                      </div>
                      <div className={`rounded-2xl ${cfg.iconBg} p-3`}>
                        <Icon className={`h-6 w-6 ${cfg.iconColor}`} />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </section>

          {/* Collections Table */}
          <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">Recent Collections</CardTitle>
              <CardDescription className="text-slate-600">All commodity collections for your MCC</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <p className="mt-4 text-sm font-medium text-slate-500">Loading collections...</p>
                </div>
              ) : collections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-2xl bg-slate-100 p-6 mb-4">
                    <Package className="h-12 w-12 text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-900">No collections yet</p>
                  <p className="mt-1 text-sm text-slate-500">Record your first commodity collection to get started</p>
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                    Record Collection
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200/80 bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead className="font-semibold text-slate-700">Date</TableHead>
                        <TableHead className="font-semibold text-slate-700">Commodity</TableHead>
                        <TableHead className="font-semibold text-slate-700">Farmer</TableHead>
                        <TableHead className="font-semibold text-slate-700">Quantity</TableHead>
                        <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                        <TableHead className="font-semibold text-slate-700">Quality</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collections.map((c) => (
                        <TableRow key={c.id} className="border-slate-200/60 hover:bg-slate-50/50">
                          <TableCell className="font-medium text-slate-900">
                            {new Date(c.collectionDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCommodityIcon(c.commodity?.name)}
                              <span className="font-medium text-slate-800">{c.commodity?.name || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700">{c.farmer?.name || "-"}</TableCell>
                          <TableCell className="font-medium text-slate-900">
                            {c.quantity?.toLocaleString()} {c.unit}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900">{formatCurrency(c.totalAmount)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {c.qualityScore != null ? (
                                <span className="text-sm font-medium text-slate-700">{Number(c.qualityScore).toFixed(1)}</span>
                              ) : (
                                <span className="text-slate-400 text-sm">—</span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-slate-600 hover:text-primary hover:bg-primary/5"
                                onClick={() => setQualityReviewCollection(c)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                c.status === "PAID"
                                  ? "default"
                                  : c.status === "APPROVED"
                                  ? "secondary"
                                  : "outline"
                              }
                              className={
                                c.status === "PAID"
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                                  : c.status === "APPROVED"
                                  ? "bg-blue-500/10 text-blue-700 border-blue-200"
                                  : "bg-amber-500/10 text-amber-700 border-amber-200"
                              }
                            >
                              {c.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CommodityCollectionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchCollections}
      />

      {/* Quality review screen – dynamic schema from commodity quality fields */}
      <Dialog open={!!qualityReviewCollection} onOpenChange={(open) => !open && setQualityReviewCollection(null)}>
        <DialogContent className="max-w-lg rounded-3xl border border-slate-200 bg-white shadow-xl [&>button]:absolute [&>button]:right-5 [&>button]:top-5 [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:hover:bg-slate-100 [&>button]:rounded-full [&>button]:z-10 [&>button]:h-9 [&>button]:w-9">
          <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 pt-6 pb-6 text-white">
            <DialogHeader className="relative">
              <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-white tracking-tight">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white border border-white/20 shadow-lg">
                  <ClipboardList className="h-5 w-5" />
                </div>
                Quality Review
              </DialogTitle>
              <DialogDescription className="mt-2 text-slate-300 text-base">
                {qualityReviewCollection && (
                  <>
                    {qualityReviewCollection.commodity?.name} ·{" "}
                    {new Date(qualityReviewCollection.collectionDate).toLocaleDateString()} ·{" "}
                    {qualityReviewCollection.farmer?.name}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
          </div>
          {qualityReviewCollection && (
            <div className="space-y-4 px-6 py-6 bg-gradient-to-b from-slate-50/80 to-white">
              {qualityReviewCollection.qualityScore != null && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quality score</p>
                  <p className="text-2xl font-bold text-slate-900">{Number(qualityReviewCollection.qualityScore).toFixed(1)}</p>
                </div>
              )}
              {qualityReviewCollection.commodity?.qualityFields?.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quality fields</p>
                  <ul className="space-y-2 rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    {qualityReviewCollection.commodity.qualityFields.map((field: { id: string; fieldName: string; fieldType: string }) => {
                      const value = qualityReviewCollection.qualityData?.[field.fieldName]
                      const display = value === undefined || value === null || value === "" ? "—" : String(value)
                      return (
                        <li key={field.id} className="flex justify-between items-center px-4 py-3 bg-white hover:bg-slate-50/50">
                          <span className="text-sm font-medium text-slate-700">{field.fieldName}</span>
                          <span className="text-sm text-slate-900">{display}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : (
                Object.keys(qualityReviewCollection.qualityData || {}).length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quality data</p>
                    <ul className="space-y-2 rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                      {Object.entries(qualityReviewCollection.qualityData || {}).map(([key, value]) => (
                        <li key={key} className="flex justify-between items-center px-4 py-3 bg-white hover:bg-slate-50/50">
                          <span className="text-sm font-medium text-slate-700">{key}</span>
                          <span className="text-sm text-slate-900">{value == null ? "—" : String(value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
              {(!qualityReviewCollection.qualityData || Object.keys(qualityReviewCollection.qualityData).length === 0) &&
                !qualityReviewCollection.commodity?.qualityFields?.length && (
                  <p className="text-sm text-slate-500 py-4 text-center">No quality data recorded for this collection.</p>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
