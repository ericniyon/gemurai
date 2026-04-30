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
  Calendar,
  Plus,
  RefreshCw,
  Loader2,
  Droplets,
  DollarSign,
  Activity,
  HelpCircle,
} from "lucide-react"
import { HelpTooltip, HelpModal, useHelpModal } from "@/components/onboarding"
import { HELP_CONTENT } from "@/lib/help-content"
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

interface MCCPeriod {
  id: string
  mccId: string
  periodNumber: number
  startDate: string
  endDate: string
  totalFarmers: number
  totalMilkCollected: number
  totalAmount: number
  totalDeductions: number
  totalAdvances: number
  status: string
}

export default function MCCPeriodsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  const [periods, setPeriods] = useState<MCCPeriod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    periodNumber: "",
    startDate: "",
    endDate: "",
  })

  // Help modal for quinzenne/period explanation
  const { isOpen: isHelpOpen, openHelp, closeHelp, activeContent: helpContent } = useHelpModal({
    quinzenne: HELP_CONTENT.quinzenne?.modal,
    collectionPeriod: HELP_CONTENT.collectionPeriod?.modal,
  })

  const fetchPeriods = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const url = new URL("/api/v1/mcc/periods", window.location.origin)
      if (user?.mccId) {
        url.searchParams.set("mccId", user.mccId)
      }

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPeriods(data.data || [])
      } else {
        const err = await response.json()
        toast.error(err.error || "Failed to fetch periods")
        setPeriods([])
      }
    } catch (error) {
      console.error("Error fetching MCC periods:", error)
      toast.error("Failed to fetch periods")
      setPeriods([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPeriods()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch("/api/v1/mcc/periods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mccId: user?.mccId,
          periodNumber: parseInt(formData.periodNumber),
          startDate: formData.startDate,
          endDate: formData.endDate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || "MCC period created successfully")
        setIsFormOpen(false)
        setFormData({
          periodNumber: "",
          startDate: "",
          endDate: "",
        })
        fetchPeriods()
      } else {
        throw new Error(data.error || "Failed to create period")
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create period")
    }
  }

  // Compute summary stats from periods
  const activePeriod = periods.find((p) => {
    const now = new Date()
    const start = new Date(p.startDate)
    const end = new Date(p.endDate)
    return now >= start && now <= end
  })
  const totalMilk = periods.reduce((sum, p) => sum + (p.totalMilkCollected ?? 0), 0)
  const totalAmount = periods.reduce((sum, p) => sum + (p.totalAmount ?? 0), 0)

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
            <span className="font-medium text-[#0099f2]">MCC Periods</span>
          </nav>

          <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-1.5 shadow-sm ring-1 ring-gray-200">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  MCC Manager • Periods
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  MCC Periods
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base flex items-center gap-1">
                  Manage milk collection aggregation periods (quinzenne, monthly)
                  <HelpTooltip
                    content={HELP_CONTENT.quinzenne?.tooltip || "Quinzenne = bi-monthly period (15 days)"}
                    onLearnMore={() => openHelp("quinzenne")}
                    size="sm"
                  />
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={fetchPeriods}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-white hover:shadow-md disabled:cursor-not-allowed"
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
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  <Plus className="h-4 w-4" />
                  Create Period
                </Button>
              </div>
            </div>
          </header>

          {/* Summary Cards - matching dashboard style */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 px-4 sm:px-6 mb-8">
            <Card className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Total Periods
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{periods.length}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Milk collection periods defined</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-emerald-100/50 via-teal-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                      Active Period
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {activePeriod ? `#${activePeriod.periodNumber}` : "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <Activity className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {activePeriod
                    ? `${new Date(activePeriod.startDate).toLocaleDateString()} – ${new Date(activePeriod.endDate).toLocaleDateString()}`
                    : "No active period"}
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-purple-100/50 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                      Total Milk
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {totalMilk.toLocaleString(undefined, { maximumFractionDigits: 1 })}<span className="text-lg text-gray-600">L</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-purple-50 p-3">
                    <Droplets className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Across all periods</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-amber-100/50 via-orange-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                      Total Amount
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3">
                    <DollarSign className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Farmer payouts</p>
              </CardContent>
            </Card>
          </section>

          {/* Periods Table Card */}
          <div className="w-full px-4 sm:px-6">
          <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-white to-blue-50/50 border-b border-gray-100 px-6">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Droplets className="h-5 w-5 text-blue-600" />
                Milk Collection Periods
              </CardTitle>
              <CardDescription>
                {periods.length} period(s) defined
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 px-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                  <p className="text-sm text-gray-500">Loading periods...</p>
                </div>
              ) : periods.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                    <Calendar className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">No MCC periods created yet</p>
                  <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                    Create periods to aggregate milk collections for reconciliation and payouts
                  </p>
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Period
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow className="border-b border-gray-200 hover:bg-transparent">
                        <TableHead className="font-semibold text-gray-700">Period</TableHead>
                        <TableHead className="font-semibold text-gray-700">Start Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">End Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">Farmers</TableHead>
                        <TableHead className="font-semibold text-gray-700">Milk (L)</TableHead>
                        <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {periods.map((period) => {
                        const startDate = new Date(period.startDate)
                        const endDate = new Date(period.endDate)
                        const now = new Date()
                        const isActive = now >= startDate && now <= endDate
                        const isPast = now > endDate

                        return (
                          <TableRow
                            key={period.id}
                            className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                          >
                            <TableCell className="font-medium">
                              Period {period.periodNumber}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {startDate.toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {endDate.toLocaleDateString()}
                            </TableCell>
                            <TableCell>{period.totalFarmers}</TableCell>
                            <TableCell>
                              {period.totalMilkCollected?.toLocaleString(undefined, {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 1,
                              }) ?? 0}
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(period.totalAmount ?? 0)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  isActive ? "default" : isPast ? "secondary" : "outline"
                                }
                                className={
                                  isActive
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : isPast
                                    ? "bg-gray-100 text-gray-700"
                                    : ""
                                }
                              >
                                {isActive ? "Active" : isPast ? "Completed" : "Upcoming"}
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
                  <Calendar className="h-6 w-6" />
                </div>
                Create MCC Period
              </DialogTitle>
            <DialogDescription className="text-sm text-blue-100 flex items-center gap-1 mt-1">
              Define a new milk collection aggregation period (e.g. quinzenne 1–15, 16–30)
              <HelpTooltip
                content="Quinzenne (French: quinzaine) is a 15-day bi-monthly period used for payment cycles"
                onLearnMore={() => openHelp("quinzenne")}
                size="sm"
              />
            </DialogDescription>
          </DialogHeader>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 px-6 py-6 min-h-[200px] bg-gradient-to-b from-slate-50/80 to-white">
            <div className="space-y-2">
              <Label htmlFor="periodNumber">Period Number *</Label>
              <Input
                id="periodNumber"
                type="number"
                value={formData.periodNumber}
                onChange={(e) =>
                  setFormData({ ...formData, periodNumber: e.target.value })
                }
                required
                min="1"
                placeholder="e.g., 1, 2, 3"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
                min={formData.startDate}
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
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-5"
              >
                Create Period
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Help Modal for Quinzenne explanation */}
      <HelpModal open={isHelpOpen} onOpenChange={closeHelp} helpContent={helpContent} />
    </div>
  )
}
