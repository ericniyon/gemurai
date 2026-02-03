"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Activity,
  Plus,
  RefreshCw,
  Loader2,
  Package,
  Wheat,
  Search,
  ArrowRightLeft,
  Percent,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

export default function CropProcessingPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  const [processingRecords, setProcessingRecords] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    rawCropProductId: "",
    processedProductId: "",
    inputQuantity: 0,
    outputQuantity: 0,
    processingDate: new Date().toISOString().split("T")[0],
    processingSteps: [] as string[],
    qualityMetrics: [] as { key: string; value: string }[],
  })

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")

      if (user?.mccId) {
        const processingRes = await fetch(
          `/api/v1/mcc/crops/processing?mccId=${user.mccId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (processingRes.ok) {
          const data = await processingRes.json()
          setProcessingRecords(data.data || [])
        }
      }

      const productsRes = await fetch("/api/v1/products", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.data || [])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!user?.mccId) {
        toast.error("MCC ID required")
        return
      }

      const response = await fetch("/api/v1/mcc/crops/processing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mccId: user.mccId,
          rawCropProductId: formData.rawCropProductId,
          processedProductId: formData.processedProductId,
          inputQuantity: formData.inputQuantity,
          outputQuantity: formData.outputQuantity,
          processingDate: formData.processingDate,
          processingSteps:
            formData.processingSteps.length > 0 ? formData.processingSteps : undefined,
          qualityMetrics:
            formData.qualityMetrics.length > 0
              ? formData.qualityMetrics.reduce<Record<string, string>>(
                  (acc, { key, value }) => (key.trim() ? { ...acc, [key.trim()]: value } : acc),
                  {}
                )
              : undefined,
        }),
      })

      if (response.ok) {
        toast.success("Crop processing recorded successfully")
        setIsFormOpen(false)
        setFormData({
          rawCropProductId: "",
          processedProductId: "",
          inputQuantity: 0,
          outputQuantity: 0,
          processingDate: new Date().toISOString().split("T")[0],
          processingSteps: [],
          qualityMetrics: [],
        })
        fetchData()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to record processing")
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to record processing"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Deduplicate by id so each product appears once in dropdowns (API or list logic may repeat)
  const byId = (list: typeof products) =>
    Array.from(new Map(list.map((p) => [p.id, p])).values())

  const rawFiltered = products.filter(
    (p) =>
      p.category?.toLowerCase().includes("crop") ||
      p.name?.toLowerCase().includes("raw")
  )
  const rawProducts = byId(
    rawFiltered.length > 0 ? rawFiltered : products
  )

  const processedFiltered = products.filter(
    (p) =>
      p.category?.toLowerCase().includes("processed") ||
      p.name?.toLowerCase().includes("processed")
  )
  const processedProducts = byId(
    processedFiltered.length > 0 ? processedFiltered : products
  )

  const filteredRecords = processingRecords.filter((record) => {
    const rawName = record.rawCropProduct?.name ?? ""
    const processedName = record.processedProduct?.name ?? ""
    const q = searchQuery.toLowerCase()
    return (
      !q ||
      rawName.toLowerCase().includes(q) ||
      processedName.toLowerCase().includes(q)
    )
  })

  const efficiency =
    processingRecords.length > 0
      ? processingRecords.reduce((sum, r) => {
          const eff =
            r.outputQuantity && r.inputQuantity
              ? (r.outputQuantity / r.inputQuantity) * 100
              : 0
          return sum + eff
        }, 0) / processingRecords.length
      : 0

  const totalInput = processingRecords.reduce(
    (sum, r) => sum + (r.inputQuantity || 0),
    0
  )
  const totalOutput = processingRecords.reduce(
    (sum, r) => sum + (r.outputQuantity || 0),
    0
  )

  const formatDate = (value: string) => {
    try {
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString()
    } catch {
      return "—"
    }
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
            <span className="font-medium text-[#059669]">Processing</span>
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
                  Crop Processing
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                  Track crop processing workflows and efficiency
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
                  Record Processing
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
                      Total Records
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {processingRecords.length}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <Activity className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Processing records</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Avg. Efficiency
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {efficiency.toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <Percent className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Output / input ratio</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-amber-100/50 via-orange-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                      Total Input
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {totalInput.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3">
                    <ArrowRightLeft className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Raw quantity in</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-slate-100/50 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                      Total Output
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {totalOutput.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <Package className="h-6 w-6 text-slate-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Processed quantity out</p>
              </CardContent>
            </Card>
          </section>

          {/* Table */}
          <div className="w-full px-4 sm:px-6 space-y-4">
            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-white to-emerald-50/50 border-b border-gray-100 px-6">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  Processing Records
                </CardTitle>
                <CardDescription>
                  {filteredRecords.length} record(s) found
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-6">
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Search
                  </label>
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Product name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-xl border-gray-200"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
                    <p className="text-sm text-gray-500">Loading processing records...</p>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                      <Activity className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">No processing records yet</p>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                      Record crop processing workflows to see them here.
                    </p>
                    <Button
                      onClick={() => setIsFormOpen(true)}
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Record First Processing
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <Table>
                      <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-b border-gray-200 hover:bg-transparent">
                          <TableHead className="font-semibold text-gray-700">Date</TableHead>
                          <TableHead className="font-semibold text-gray-700">Raw Product</TableHead>
                          <TableHead className="font-semibold text-gray-700">Processed Product</TableHead>
                          <TableHead className="font-semibold text-gray-700">Input</TableHead>
                          <TableHead className="font-semibold text-gray-700">Output</TableHead>
                          <TableHead className="font-semibold text-gray-700">Efficiency</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.map((record) => {
                          const recordEff =
                            record.outputQuantity && record.inputQuantity
                              ? (record.outputQuantity / record.inputQuantity) * 100
                              : 0
                          return (
                            <TableRow
                              key={record.id}
                              className="border-b border-gray-100 hover:bg-emerald-50/30 transition-colors"
                            >
                              <TableCell className="text-gray-600">
                                {formatDate(record.processingDate)}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium text-gray-900">
                                  {record.rawCropProduct?.name || "—"}
                                </p>
                                {record.rawCropProduct?.unit && (
                                  <p className="text-xs text-gray-500">
                                    {record.rawCropProduct.unit}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium text-gray-900">
                                  {record.processedProduct?.name || "—"}
                                </p>
                                {record.processedProduct?.unit && (
                                  <p className="text-xs text-gray-500">
                                    {record.processedProduct.unit}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {record.inputQuantity}{" "}
                                {record.rawCropProduct?.unit || ""}
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {record.outputQuantity}{" "}
                                {record.processedProduct?.unit || ""}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={recordEff >= 80 ? "default" : "secondary"}
                                  className={
                                    recordEff >= 80
                                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0"
                                      : "bg-slate-100 text-slate-700"
                                  }
                                >
                                  {recordEff.toFixed(1)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Record Processing Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg rounded-3xl border border-emerald-100 bg-white shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-100 px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Record Crop Processing
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-0.5">
                  Record a crop processing workflow
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rawCropProductId" className="text-sm font-medium text-gray-700">
                    Raw crop product <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={formData.rawCropProductId || undefined}
                    onValueChange={(value) =>
                      setFormData({ ...formData, rawCropProductId: value })
                    }
                    required
                  >
                    <SelectTrigger className="rounded-xl border-emerald-200/80">
                      <SelectValue placeholder="Select raw product" />
                    </SelectTrigger>
                    <SelectContent>
                      {rawProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processedProductId" className="text-sm font-medium text-gray-700">
                    Processed product <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={formData.processedProductId || undefined}
                    onValueChange={(value) =>
                      setFormData({ ...formData, processedProductId: value })
                    }
                    required
                  >
                    <SelectTrigger className="rounded-xl border-emerald-200/80">
                      <SelectValue placeholder="Select processed product" />
                    </SelectTrigger>
                    <SelectContent>
                      {processedProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-gray-500 -mt-1">
                Products come from the platform catalog. Admin or Super Admin can add raw/processed products (e.g. category contains &quot;crop&quot;/&quot;raw&quot; or &quot;processed&quot;) so they appear here.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inputQuantity" className="text-sm font-medium text-gray-700">
                    Input quantity <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="inputQuantity"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.inputQuantity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inputQuantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="rounded-xl border-emerald-200/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outputQuantity" className="text-sm font-medium text-gray-700">
                    Output quantity <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="outputQuantity"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.outputQuantity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        outputQuantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="rounded-xl border-emerald-200/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processingDate" className="text-sm font-medium text-gray-700">
                    Date <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="processingDate"
                    type="date"
                    value={formData.processingDate}
                    onChange={(e) =>
                      setFormData({ ...formData, processingDate: e.target.value })
                    }
                    required
                    className="rounded-xl border-emerald-200/80"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-600">
                  Processing steps (optional)
                </Label>
                <div className="space-y-2">
                  {formData.processingSteps.map((step, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={step}
                        onChange={(e) => {
                          const next = [...formData.processingSteps]
                          next[i] = e.target.value
                          setFormData({ ...formData, processingSteps: next })
                        }}
                        placeholder="e.g. cleaning, sorting, packaging"
                        className="rounded-xl border-emerald-200/80 flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-gray-500 hover:text-rose-600"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            processingSteps: formData.processingSteps.filter((_, j) => j !== i),
                          })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        processingSteps: [...formData.processingSteps, ""],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add step
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-600">
                  Quality metrics (optional)
                </Label>
                <div className="space-y-2">
                  {formData.qualityMetrics.map((m, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={m.key}
                        onChange={(e) => {
                          const next = [...formData.qualityMetrics]
                          next[i] = { ...next[i], key: e.target.value }
                          setFormData({ ...formData, qualityMetrics: next })
                        }}
                        placeholder="e.g. grade, moisture"
                        className="rounded-xl border-emerald-200/80 w-32 shrink-0"
                      />
                      <Input
                        value={m.value}
                        onChange={(e) => {
                          const next = [...formData.qualityMetrics]
                          next[i] = { ...next[i], value: e.target.value }
                          setFormData({ ...formData, qualityMetrics: next })
                        }}
                        placeholder="value"
                        className="rounded-xl border-emerald-200/80 flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-gray-500 hover:text-rose-600"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            qualityMetrics: formData.qualityMetrics.filter((_, j) => j !== i),
                          })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        qualityMetrics: [...formData.qualityMetrics, { key: "", value: "" }],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add metric
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t border-gray-100 bg-slate-50/50 px-6 py-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
                className="rounded-xl border-gray-200 hover:bg-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 shadow-lg shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 hover:shadow-emerald-500/30 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording…
                  </>
                ) : (
                  "Record processing"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
