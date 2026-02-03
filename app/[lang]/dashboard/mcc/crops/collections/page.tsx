"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Loader2,
  Wheat,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { AddCropCollectionForm } from "@/components/mcc/AddCropCollectionForm"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CropCollectionsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  const [collections, setCollections] = useState<any[]>([])
  const [cropTypes, setCropTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCropType, setFilterCropType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")

      const typesRes = await fetch("/api/v1/mcc/crops/types", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (typesRes.ok) {
        const typesData = await typesRes.json()
        setCropTypes(typesData.data || [])
      }

      if (user?.mccId) {
        const collectionsRes = await fetch(
          `/api/v1/mcc/crops/collections?mccId=${user.mccId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (collectionsRes.ok) {
          const collectionsData = await collectionsRes.json()
          setCollections(collectionsData.data || [])
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const filteredCollections = collections.filter((collection) => {
    const matchesSearch =
      collection.farmer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.cropType?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.id?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCropType =
      filterCropType === "all" || collection.cropTypeId === filterCropType
    const matchesStatus =
      filterStatus === "all" || collection.status === filterStatus

    return matchesSearch && matchesCropType && matchesStatus
  })

  const stats = {
    total: filteredCollections.length,
    totalQuantity: filteredCollections.reduce((sum, c) => sum + (c.quantity || 0), 0),
    totalRevenue: filteredCollections.reduce((sum, c) => sum + (c.totalAmount || 0), 0),
    approved: filteredCollections.filter((c) => c.status === "APPROVED").length,
    pending: filteredCollections.filter((c) => c.status === "PENDING").length,
  }

  const formatDate = (value: string) => {
    try {
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString()
    } catch {
      return "—"
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      APPROVED: { variant: "default", label: "Approved" },
      PENDING: { variant: "secondary", label: "Pending" },
      PAID: { variant: "outline", label: "Paid" },
      PROCESSED: { variant: "outline", label: "Processed" },
      REJECTED: { variant: "destructive", label: "Rejected" },
    }
    const c = map[status] || { variant: "outline" as const, label: status }
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-emerald-500/20 via-green-400/10 to-teal-400/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-amber-400/15 via-emerald-400/10 to-blue-400/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full px-0 py-10">
          <nav className="mb-6 flex items-center gap-2 text-sm px-4 sm:px-6">
            <Link
              href={`/${lang}/dashboard`}
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-slate-400">/</span>
            <Link
              href={`/${lang}/dashboard/mcc`}
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              MCC
            </Link>
            <span className="text-slate-400">/</span>
            <Link
              href={`/${lang}/dashboard/mcc/crops`}
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Crops
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-[#059669]">Collections</span>
          </nav>

          <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-1.5 shadow-sm ring-1 ring-gray-200">
                <Wheat className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  MCC Manager • Crops
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Crop Collections
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                  Record and manage crop collections from farmers
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={fetchData}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:bg-white hover:shadow-md disabled:cursor-not-allowed"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  Refresh
                </Button>
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30"
                >
                  <Plus className="h-4 w-4" />
                  Record Collection
                </Button>
              </div>
            </div>
          </header>

          {/* Summary Cards */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 px-4 sm:px-6 mb-8">
            <Card className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-emerald-100/50 via-teal-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                      Total Collections
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <Package className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Collection records</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Total Quantity
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {stats.totalQuantity.toLocaleString()}
                      <span className="text-lg text-gray-600"> kg</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">kg / bags collected</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-amber-100/50 via-orange-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                      Total Revenue
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      RF {stats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3">
                    <DollarSign className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Total amount</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-slate-100/50 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                      Status
                    </CardTitle>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {stats.approved} Approved
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        <Clock className="h-3.5 w-3.5" />
                        {stats.pending} Pending
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">By status</p>
              </CardContent>
            </Card>
          </section>

          {/* Filters + Table */}
          <div className="w-full px-4 sm:px-6 space-y-4">
            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-white to-emerald-50/50 border-b border-gray-100 px-6">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Package className="h-5 w-5 text-emerald-600" />
                  Crop Collections
                </CardTitle>
                <CardDescription>
                  {filteredCollections.length} collection(s) found
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Farmer, crop type, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl border-gray-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Crop Type</label>
                    <Select value={filterCropType} onValueChange={setFilterCropType}>
                      <SelectTrigger className="rounded-xl border-gray-200">
                        <SelectValue placeholder="All crop types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Crop Types</SelectItem>
                        {cropTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="rounded-xl border-gray-200">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PROCESSED">Processed</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
                    <p className="text-sm text-gray-500">Loading collections...</p>
                  </div>
                ) : filteredCollections.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                      <Package className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">No crop collections yet</p>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                      Record crop collections from farmers to see them here.
                    </p>
                    <Button
                      onClick={() => setIsFormOpen(true)}
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Record First Collection
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <Table>
                      <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-b border-gray-200 hover:bg-transparent">
                          <TableHead className="font-semibold text-gray-700">Crop / Farmer</TableHead>
                          <TableHead className="font-semibold text-gray-700">Date</TableHead>
                          <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
                          <TableHead className="font-semibold text-gray-700">Price</TableHead>
                          <TableHead className="font-semibold text-gray-700">Total</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCollections.map((collection) => (
                          <TableRow
                            key={collection.id}
                            className="border-b border-gray-100 hover:bg-emerald-50/30 transition-colors"
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {collection.cropType?.name || "Unknown Crop"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {collection.farmer?.name || "N/A"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatDate(collection.collectionDate)}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {collection.quantity} {collection.unit || "kg"}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              RF {collection.pricePerUnit?.toLocaleString() ?? "—"}
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-gray-900">
                                RF {collection.totalAmount?.toLocaleString() ?? "—"}
                              </span>
                              {collection.netPayment != null && (
                                <p className="text-xs text-gray-500">
                                  Net: RF {Number(collection.netPayment).toLocaleString()}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(collection.status)}</TableCell>
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
      </div>

      <AddCropCollectionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          fetchData()
          toast.success("Crop collection recorded successfully")
        }}
      />
    </div>
  )
}
