"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { formatCurrency, cn } from "@/lib/utils"
import {
  Activity,
  Plus,
  RefreshCw,
  Loader2,
  Droplets,
  Package,
  Beaker,
  ArrowRight,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ProcessingRecord {
  id: string
  mccId: string
  rawMilkProductId: string
  processedProductId: string
  inputQuantity: number
  outputQuantity: number
  processingDate: string
  status: string
  rawMilkProduct?: { id: string; name: string }
  processedProduct?: { id: string; name: string }
}

interface ProductOption {
  id: string
  name: string
  unit: string
}

export default function MCCProcessingPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  const [records, setRecords] = useState<ProcessingRecord[]>([])
  const [rawMilkProducts, setRawMilkProducts] = useState<ProductOption[]>([])
  const [processedMilkProducts, setProcessedMilkProducts] = useState<ProductOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    rawMilkProductId: "",
    processedProductId: "",
    inputQuantity: "",
    outputQuantity: "",
    processingDate: new Date().toISOString().split("T")[0],
  })

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const url = new URL("/api/v1/mcc/processing", window.location.origin)
      if (user?.mccId) {
        url.searchParams.set("mccId", user.mccId)
      }
      url.searchParams.set("limit", "50")

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const result = await response.json()
        setRecords(result.data || [])
        setRawMilkProducts(result.products?.rawMilk || [])
        setProcessedMilkProducts(result.products?.processedMilk || [])
      } else {
        const err = await response.json()
        toast.error(err.error || "Failed to fetch processing data")
        setRecords([])
      }
    } catch (error) {
      console.error("Error fetching processing data:", error)
      toast.error("Failed to fetch processing data")
      setRecords([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.mccId) {
      toast.error("MCC assignment required")
      return
    }
    const inputQty = parseFloat(formData.inputQuantity)
    const outputQty = parseFloat(formData.outputQuantity)
    if (isNaN(inputQty) || inputQty <= 0 || isNaN(outputQty) || outputQty <= 0) {
      toast.error("Input and output quantities must be positive numbers")
      return
    }
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch("/api/v1/mcc/processing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mccId: user.mccId,
          rawMilkProductId: formData.rawMilkProductId,
          processedProductId: formData.processedProductId,
          inputQuantity: inputQty,
          outputQuantity: outputQty,
          processingDate: formData.processingDate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || "Milk processing recorded successfully")
        setIsFormOpen(false)
        setFormData({
          rawMilkProductId: "",
          processedProductId: "",
          inputQuantity: "",
          outputQuantity: "",
          processingDate: new Date().toISOString().split("T")[0],
        })
        fetchData()
      } else {
        throw new Error(data.error || "Failed to record processing")
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to record processing")
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalInput = records.reduce((sum, r) => sum + (r.inputQuantity || 0), 0)
  const totalOutput = records.reduce((sum, r) => sum + (r.outputQuantity || 0), 0)
  const avgYield =
    records.length > 0 && totalInput > 0
      ? ((totalOutput / totalInput) * 100).toFixed(1)
      : "0"

  const canRecordProcessing =
    rawMilkProducts.length > 0 && processedMilkProducts.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
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
              MCC (Digital)
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-[#0099f2]">Digital Processing</span>
          </nav>

          <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-1.5 shadow-sm ring-1 ring-gray-200">
                <Beaker className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  MCC Manager • Processing
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Digital Processing
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                  Record raw milk to processed product conversions (pasteurization, etc.)
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={fetchData}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-white hover:shadow-md disabled:cursor-not-allowed"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  Refresh
                </Button>
                <Button
                  onClick={() => setIsFormOpen(true)}
                  disabled={!canRecordProcessing}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  Record Processing
                </Button>
              </div>
            </div>
          </header>

          {/* Summary Cards */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 px-4 sm:px-6 mb-8">
            <Card className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Total Records
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{records.length}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Processing batches recorded</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-purple-100/50 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                      Raw Input
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {totalInput.toLocaleString(undefined, { maximumFractionDigits: 1 })}<span className="text-lg text-gray-600">L</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-purple-50 p-3">
                    <Droplets className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Total raw milk processed</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-emerald-100/50 via-teal-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                      Processed Output
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {totalOutput.toLocaleString(undefined, { maximumFractionDigits: 1 })}<span className="text-lg text-gray-600">L</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <Package className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Total processed product</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-amber-100/50 via-orange-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                      Avg Yield
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{avgYield}%</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3">
                    <ArrowRight className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Input to output ratio</p>
              </CardContent>
            </Card>
          </section>

          {/* Processing History Table */}
          <div className="w-full px-4 sm:px-6">
            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-white to-blue-50/50 border-b border-gray-100 px-6">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Beaker className="h-5 w-5 text-blue-600" />
                  Milk Processing History
                </CardTitle>
                <CardDescription>
                  {records.length} processing record(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                    <p className="text-sm text-gray-500">Loading processing records...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                      <Beaker className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">No processing records yet</p>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                      Record raw milk to processed product conversions (e.g. pasteurization)
                    </p>
                    {canRecordProcessing ? (
                      <Button
                        onClick={() => setIsFormOpen(true)}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Record First Processing
                      </Button>
                    ) : (
                      <p className="text-sm text-amber-600">
                        Run MCC setup to create raw milk and processed milk products first.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-b border-gray-200 hover:bg-transparent">
                          <TableHead className="font-semibold text-gray-700">Date</TableHead>
                          <TableHead className="font-semibold text-gray-700">Raw Product</TableHead>
                          <TableHead className="font-semibold text-gray-700">Processed Product</TableHead>
                          <TableHead className="font-semibold text-gray-700">Input (L)</TableHead>
                          <TableHead className="font-semibold text-gray-700">Output (L)</TableHead>
                          <TableHead className="font-semibold text-gray-700">Yield</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((record) => {
                          const yieldPct =
                            record.inputQuantity > 0
                              ? ((record.outputQuantity / record.inputQuantity) * 100).toFixed(1)
                              : "—"
                          return (
                            <TableRow
                              key={record.id}
                              className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                            >
                              <TableCell className="text-gray-600">
                                {new Date(record.processingDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {record.rawMilkProduct?.name ?? "Raw Milk"}
                              </TableCell>
                              <TableCell>
                                {record.processedProduct?.name ?? "Processed Milk"}
                              </TableCell>
                              <TableCell>
                                {record.inputQuantity?.toLocaleString(undefined, {
                                  minimumFractionDigits: 1,
                                  maximumFractionDigits: 1,
                                }) ?? 0}
                              </TableCell>
                              <TableCell>
                                {record.outputQuantity?.toLocaleString(undefined, {
                                  minimumFractionDigits: 1,
                                  maximumFractionDigits: 1,
                                }) ?? 0}
                              </TableCell>
                              <TableCell className="font-medium">{yieldPct}%</TableCell>
                              <TableCell>
                                <Badge
                                  variant={record.status === "COMPLETED" ? "default" : "secondary"}
                                  className={
                                    record.status === "COMPLETED"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : "bg-amber-100 text-amber-800 border-amber-200"
                                  }
                                >
                                  {record.status}
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl [&>button]:absolute [&>button]:right-5 [&>button]:top-5 [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:hover:bg-slate-100 [&>button]:rounded-full [&>button]:z-10 [&>button]:h-9 [&>button]:w-9">
          <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 pt-6 pb-6 text-white">
            <DialogHeader className="relative">
              <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-white tracking-tight">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white border border-white/20 shadow-lg">
                  <Package className="h-6 w-6" />
                </div>
                Record Milk Processing
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-300 mt-2">
                Convert raw milk to processed product (e.g. pasteurization)
              </DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 px-6 py-6 min-h-[200px] bg-gradient-to-b from-slate-50/80 to-white">
            <div className="space-y-2">
              <Label htmlFor="rawMilkProductId">Raw Milk Product *</Label>
              <Select
                value={formData.rawMilkProductId}
                onValueChange={(v) =>
                  setFormData({ ...formData, rawMilkProductId: v })
                }
                required
              >
                <SelectTrigger id="rawMilkProductId" className="rounded-lg">
                  <SelectValue placeholder="Select raw milk product" />
                </SelectTrigger>
                <SelectContent>
                  {rawMilkProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="processedProductId">Processed Product *</Label>
              <Select
                value={formData.processedProductId}
                onValueChange={(v) =>
                  setFormData({ ...formData, processedProductId: v })
                }
                required
              >
                <SelectTrigger id="processedProductId" className="rounded-lg">
                  <SelectValue placeholder="Select processed product" />
                </SelectTrigger>
                <SelectContent>
                  {processedMilkProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inputQuantity">Input Quantity (L) *</Label>
                <Input
                  id="inputQuantity"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.inputQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, inputQuantity: e.target.value })
                  }
                  required
                  placeholder="e.g. 100"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outputQuantity">Output Quantity (L) *</Label>
                <Input
                  id="outputQuantity"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.outputQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, outputQuantity: e.target.value })
                  }
                  required
                  placeholder="e.g. 95"
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="processingDate">Processing Date *</Label>
              <Input
                id="processingDate"
                type="date"
                value={formData.processingDate}
                onChange={(e) =>
                  setFormData({ ...formData, processingDate: e.target.value })
                }
                required
                className="rounded-lg"
              />
            </div>
          </div>
            <DialogFooter className="flex flex-row gap-3 px-6 py-5 border-t border-slate-200 bg-white rounded-b-3xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Record Processing"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
