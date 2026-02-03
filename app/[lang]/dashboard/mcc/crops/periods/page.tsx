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
  Calendar,
  Plus,
  RefreshCw,
  Loader2,
  Wheat,
  CheckCircle2,
  CalendarClock,
  CalendarCheck,
  CalendarRange,
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

export default function CropPeriodsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  const [periods, setPeriods] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    periodNumber: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchPeriods()
  }, [])

  const fetchPeriods = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!user?.mccId) {
        toast.error("MCC ID required")
        return
      }

      const response = await fetch(`/api/v1/mcc/crops/periods?mccId=${user.mccId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPeriods(data.data || [])
      } else if (response.status === 404) {
        setPeriods([])
      }
    } catch (error) {
      console.error("Error fetching periods:", error)
      setPeriods([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!user?.mccId) {
        toast.error("MCC ID required")
        return
      }

      const response = await fetch("/api/v1/mcc/crops/periods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mccId: user.mccId,
          periodNumber: parseInt(formData.periodNumber),
          startDate: formData.startDate,
          endDate: formData.endDate,
        }),
      })

      if (response.ok) {
        toast.success("Crop period created successfully")
        setIsFormOpen(false)
        setFormData({
          periodNumber: "",
          startDate: "",
          endDate: "",
        })
        fetchPeriods()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to create crop period")
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create crop period"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const periodDurationDays =
    formData.startDate && formData.endDate
      ? Math.ceil(
          (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null

  const periodInputClasses =
    "rounded-xl border border-emerald-200/80 bg-white text-sm shadow-sm transition placeholder:text-slate-400 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:ring-offset-0"

  const now = new Date()
  const stats = {
    total: periods.length,
    active: periods.filter((p) => {
      const s = new Date(p.startDate)
      const e = new Date(p.endDate)
      return now >= s && now <= e
    }).length,
    completed: periods.filter((p) => new Date(p.endDate) < now).length,
    upcoming: periods.filter((p) => new Date(p.startDate) > now).length,
  }

  const formatDate = (value: string) => {
    try {
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString()
    } catch {
      return "—"
    }
  }

  const getStatusBadge = (period: { startDate: string; endDate: string }) => {
    const startDate = new Date(period.startDate)
    const endDate = new Date(period.endDate)
    const isActive = now >= startDate && now <= endDate
    const isPast = now > endDate
    if (isActive) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Active
        </Badge>
      )
    }
    if (isPast) {
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
          <CalendarCheck className="h-3.5 w-3.5 mr-1" />
          Completed
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
        <CalendarClock className="h-3.5 w-3.5 mr-1" />
        Upcoming
      </Badge>
    )
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
            <span className="font-medium text-[#059669]">Periods</span>
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
                  Crop Periods
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                  Manage crop aggregation periods for collections
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={fetchPeriods}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:bg-white hover:shadow-md disabled:cursor-not-allowed"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  Refresh
                </Button>
                <Button
                  onClick={() => {
                    setFormData({
                      periodNumber: "",
                      startDate: "",
                      endDate: "",
                    })
                    setIsFormOpen(true)
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30"
                >
                  <Plus className="h-4 w-4" />
                  Create Period
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
                      Total Periods
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <Calendar className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Defined periods</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-emerald-100/50 via-teal-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                      Active
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Currently open</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-amber-100/50 via-orange-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                      Upcoming
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{stats.upcoming}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3">
                    <CalendarClock className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Future periods</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-slate-100/50 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                      Completed
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <CalendarCheck className="h-6 w-6 text-slate-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Past periods</p>
              </CardContent>
            </Card>
          </section>

          {/* Table */}
          <div className="w-full px-4 sm:px-6 space-y-4">
            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-white to-emerald-50/50 border-b border-gray-100 px-6">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  Crop Periods
                </CardTitle>
                <CardDescription>
                  {periods.length} period(s) defined
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
                    <p className="text-sm text-gray-500">Loading periods...</p>
                  </div>
                ) : periods.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                      <Calendar className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">No crop periods yet</p>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                      Create crop aggregation periods to organize collections by time window.
                    </p>
                    <Button
                      onClick={() => setIsFormOpen(true)}
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Period
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <Table>
                      <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-b border-gray-200 hover:bg-transparent">
                          <TableHead className="font-semibold text-gray-700">Period</TableHead>
                          <TableHead className="font-semibold text-gray-700">Start Date</TableHead>
                          <TableHead className="font-semibold text-gray-700">End Date</TableHead>
                          <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {periods.map((period) => {
                          const startDate = new Date(period.startDate)
                          const endDate = new Date(period.endDate)
                          const duration = Math.ceil(
                            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                          )
                          return (
                            <TableRow
                              key={period.id}
                              className="border-b border-gray-100 hover:bg-emerald-50/30 transition-colors"
                            >
                              <TableCell className="font-medium text-gray-900">
                                Period {period.periodNumber}
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {formatDate(period.startDate)}
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {formatDate(period.endDate)}
                              </TableCell>
                              <TableCell className="text-gray-600">{duration} days</TableCell>
                              <TableCell>{getStatusBadge(period)}</TableCell>
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

      {/* Create Period Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg rounded-3xl border border-emerald-100 bg-white shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-100 px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Create Crop Period
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-0.5">
                  Define a new crop aggregation period for collections
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section className="space-y-4 rounded-xl border border-emerald-100 bg-slate-50/40 px-4 py-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <CalendarRange className="h-4 w-4 text-emerald-600" />
                  Period details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="periodNumber" className="text-sm font-medium text-gray-700">
                      Period number <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="periodNumber"
                      type="number"
                      value={formData.periodNumber}
                      onChange={(e) => setFormData({ ...formData, periodNumber: e.target.value })}
                      required
                      min={1}
                      placeholder="e.g. 1, 2, 3"
                      className={periodInputClasses}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                      Start date <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className={periodInputClasses}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                      End date <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                      min={formData.startDate}
                      className={periodInputClasses}
                    />
                  </div>
                </div>
                {periodDurationDays !== null && periodDurationDays >= 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                    <span className="text-sm font-medium text-emerald-800">Duration</span>
                    <span className="text-lg font-bold text-emerald-700">
                      {periodDurationDays} day{periodDurationDays !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </section>
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
                    Creating…
                  </>
                ) : (
                  "Create period"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
