"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Droplets,
  Plus,
  TrendingUp,
  Users,
  Wallet,
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Radio,
  ClipboardCheck,
  ArrowUpRight,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardStats {
  todayCollections: number
  todayLiters: number
  periodCollections: number
  periodLiters: number
  totalFarmers: number
  activeFarmers: number
  pendingQualityCheck: number
  commissionEarned: number
  commissionPending: number
}

interface RecentCollection {
  id: string
  farmerName: string
  farmerCode: string
  quantity: number
  unit?: string
  status: "pending" | "passed" | "conditional" | "rejected"
  time: string
}

const QUICK_LINKS = [
  {
    href: (lang: string) => `/${lang}/dashboard/pre-collection`,
    label: "Supply signals",
    description: "Map farm availability",
    icon: Radio,
    color: "bg-[#0099f2]/10 text-[#0099f2] border-[#0099f2]/20 hover:bg-[#0099f2]/15",
  },
  {
    href: (lang: string) => `/${lang}/dashboard/agent/commissions`,
    label: "Commissions",
    description: "View earnings",
    icon: Wallet,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15",
  },
  {
    href: (lang: string) => `/${lang}/dashboard/agent/intake`,
    label: "Collect",
    description: "Record collection",
    icon: Package,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15",
  },
  {
    href: (lang: string) => `/${lang}/dashboard/agent/quality`,
    label: "Quality check",
    description: "Review collections",
    icon: ClipboardCheck,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15",
  },
] as const

export default function AgentDashboardPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  const [stats, setStats] = useState<DashboardStats>({
    todayCollections: 0,
    todayLiters: 0,
    periodCollections: 0,
    periodLiters: 0,
    totalFarmers: 0,
    activeFarmers: 0,
    pendingQualityCheck: 0,
    commissionEarned: 0,
    commissionPending: 0,
  })

  const [recentCollections, setRecentCollections] = useState<RecentCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [signalsCount, setSignalsCount] = useState<number>(0)

  const now = new Date()
  const currentPeriod = now.getDate() <= 15 ? 1 : 2
  const periodLabel = currentPeriod === 1 ? "1st – 15th" : "16th – end of month"

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch("/api/v1/agent/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        if (!res.ok) {
          setLoading(false)
          return
        }
        if (json.success && json.data) {
          const d = json.data
          setStats({
            todayCollections: d.todayCollections ?? 0,
            todayLiters: d.todayLiters ?? 0,
            periodCollections: d.periodCollections ?? 0,
            periodLiters: d.periodLiters ?? 0,
            totalFarmers: d.totalFarmers ?? 0,
            activeFarmers: d.activeFarmers ?? 0,
            pendingQualityCheck: d.pendingQualityCheck ?? 0,
            commissionEarned: d.commissionEarned ?? 0,
            commissionPending: d.commissionPending ?? 0,
          })
          setRecentCollections(Array.isArray(d.recentCollections) ? d.recentCollections : [])
          setSignalsCount(typeof d.signalsCount === "number" ? d.signalsCount : 0)
        }
      } catch {
        // keep defaults
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const statusConfig = {
    pending: { color: "bg-amber-100 text-amber-800", icon: Clock },
    passed: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
    conditional: { color: "bg-sky-100 text-sky-800", icon: AlertCircle },
    rejected: { color: "bg-red-100 text-red-800", icon: AlertCircle },
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-24 lg:pb-10">
        {/* Header: welcome + primary CTA */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {user?.name || "Agent"}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-slate-500 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              Period {currentPeriod} ({periodLabel}) · {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
          <Link href={`/${lang}/dashboard/agent/intake`} className="shrink-0">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-[#0099f2] hover:bg-[#0082d9] text-white shadow-lg shadow-[#0099f2]/25 font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" />
              New collection
            </Button>
          </Link>
        </header>

        {/* Quick actions – primary focus */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Quick actions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {QUICK_LINKS.map((item, i) => {
              const Icon = item.icon
              const href = item.href(lang)
              const isSignals = item.label === "Supply signals"
              return (
                <Link
                  key={i}
                  href={href}
                  className={cn(
                    "group flex flex-col gap-3 p-4 sm:p-5 rounded-2xl border transition-all duration-200",
                    "bg-white shadow-sm border-slate-200/80 hover:shadow-md hover:border-slate-300",
                    "focus:outline-none focus:ring-2 focus:ring-[#0099f2]/30 focus:ring-offset-2"
                  )}
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center border transition-colors",
                      item.color
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 group-hover:text-[#0099f2] transition-colors">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isSignals ? `${signalsCount} active` : item.description}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-[#0099f2] transition-colors mt-auto" />
                </Link>
              )
            })}
          </div>
        </section>

        {/* Stats row – compact cards */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Today</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                      {loading ? "—" : `${stats.todayLiters}L`}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{stats.todayCollections} collections</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Period total</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                      {loading ? "—" : `${stats.periodLiters}L`}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{stats.periodCollections} collections</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Farmers</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                      {loading ? "—" : stats.activeFarmers}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">of {stats.totalFarmers} total</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Commission</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                      {loading ? "—" : `RWF ${(stats.commissionEarned / 1000).toFixed(1)}K`}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{(stats.commissionPending / 1000).toFixed(1)}K pending</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Wallet className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pending quality alert */}
        {stats.pendingQualityCheck > 0 && (
          <Link href={`/${lang}/dashboard/agent/quality`}>
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-amber-200 bg-amber-50/80 hover:bg-amber-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900">Pending quality checks</p>
                  <p className="text-sm text-amber-700">
                    {stats.pendingQualityCheck} collection{stats.pendingQualityCheck !== 1 ? "s" : ""} awaiting review
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-amber-700 font-medium text-sm shrink-0">
                Review <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        )}

        {/* Two columns: Recent activity + Earnings */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Recent collections */}
          <div className="lg:col-span-3">
            <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Recent collections
                  </CardTitle>
                  <Link
                    href={`/${lang}/dashboard/agent/intake`}
                    className="text-sm font-medium text-[#0099f2] hover:underline flex items-center gap-0.5"
                  >
                    View all <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : recentCollections.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">No collections today</p>
                    <p className="text-sm text-slate-500 mt-1">Start recording to see them here</p>
                    <Link href={`/${lang}/dashboard/agent/intake`}>
                      <Button className="mt-4 rounded-xl bg-[#0099f2] hover:bg-[#0082d9]">
                        <Plus className="h-4 w-4 mr-2" />
                        New collection
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {recentCollections.map((col) => {
                      const config = statusConfig[col.status]
                      const Icon = config.icon
                      return (
                        <li
                          key={col.id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-sm font-semibold text-slate-600">
                            {col.farmerName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 truncate">{col.farmerName}</p>
                            <p className="text-xs text-slate-500">{col.farmerCode} · {col.time}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-semibold text-slate-900">{col.quantity}{col.unit ?? "L"}</p>
                            <Badge className={cn("text-xs capitalize mt-1", config.color)}>
                              <Icon className="h-3 w-3 mr-1" />
                              {col.status}
                            </Badge>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Earnings summary */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Period target</p>
                    <div className="mt-2">
                      <Progress
                        value={Math.min(100, (stats.periodLiters / 5000) * 100)}
                        className="h-2 rounded-full"
                      />
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {((stats.periodLiters / 5000) * 100).toFixed(0)}% of 5,000L
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100">
                      <p className="text-xs font-medium text-emerald-600">Earned</p>
                      <p className="text-lg font-bold text-emerald-800 mt-0.5">
                        RWF {stats.commissionEarned.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3 border border-amber-100">
                      <p className="text-xs font-medium text-amber-600">Pending</p>
                      <p className="text-lg font-bold text-amber-800 mt-0.5">
                        RWF {stats.commissionPending.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <Link href={`/${lang}/dashboard/agent/commissions`} className="block mt-4">
                  <Button variant="outline" className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                    View commission details
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
