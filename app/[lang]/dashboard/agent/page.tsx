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
  status: "pending" | "passed" | "conditional" | "rejected"
  time: string
}

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

  // Get current date info
  const now = new Date()
  const currentPeriod = now.getDate() <= 15 ? 1 : 2
  const periodLabel = currentPeriod === 1 ? "1st - 15th" : "16th - End"

  useEffect(() => {
    // Simulate loading stats (replace with actual API call)
    const loadData = async () => {
      setLoading(true)
      
      // Simulated data - replace with actual API
      await new Promise((r) => setTimeout(r, 500))
      
      setStats({
        todayCollections: 12,
        todayLiters: 420,
        periodCollections: 89,
        periodLiters: 2850,
        totalFarmers: 45,
        activeFarmers: 38,
        pendingQualityCheck: 3,
        commissionEarned: 29400,
        commissionPending: 8500,
      })

      setRecentCollections([
        { id: "1", farmerName: "John Uwimana", farmerCode: "NYA-001234", quantity: 50, status: "passed", time: "08:30" },
        { id: "2", farmerName: "Alice Mukamana", farmerCode: "NYA-001235", quantity: 30, status: "passed", time: "08:15" },
        { id: "3", farmerName: "Peter Mugiransa", farmerCode: "NYA-001236", quantity: 70, status: "conditional", time: "07:45" },
        { id: "4", farmerName: "Joyce Niyosenga", farmerCode: "NYA-001237", quantity: 40, status: "pending", time: "07:30" },
      ])

      setLoading(false)
    }

    loadData()
  }, [user])

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    passed: "bg-green-100 text-green-700",
    conditional: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
  }

  const statusIcons = {
    pending: Clock,
    passed: CheckCircle,
    conditional: AlertCircle,
    rejected: AlertCircle,
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-bold mt-1">{user?.name || "Agent"}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-blue-200" />
              <span className="text-sm text-blue-100">
                Period {currentPeriod} ({periodLabel}) • {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
          <Link href={`/${lang}/dashboard/agent/intake`}>
            <Button className="bg-white text-[#1e3a5f] hover:bg-blue-50 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Today&apos;s Collections</p>
                <p className="text-2xl font-bold mt-1">{stats.todayLiters}L</p>
                <p className="text-xs text-blue-200 mt-1">{stats.todayCollections} farmers</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Droplets className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-medium">Period Total</p>
                <p className="text-2xl font-bold mt-1">{stats.periodLiters}L</p>
                <p className="text-xs text-emerald-200 mt-1">{stats.periodCollections} collections</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-violet-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-xs font-medium">Active Farmers</p>
                <p className="text-2xl font-bold mt-1">{stats.activeFarmers}</p>
                <p className="text-xs text-violet-200 mt-1">of {stats.totalFarmers} total</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs font-medium">Commission</p>
                <p className="text-2xl font-bold mt-1">RWF {(stats.commissionEarned / 1000).toFixed(1)}K</p>
                <p className="text-xs text-amber-200 mt-1">+{(stats.commissionPending / 1000).toFixed(1)}K pending</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Quality Checks Alert */}
      {stats.pendingQualityCheck > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900">Pending Quality Checks</p>
                  <p className="text-sm text-amber-700">{stats.pendingQualityCheck} collections awaiting quality review</p>
                </div>
              </div>
              <Link href={`/${lang}/dashboard/agent/quality`}>
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                  Review Now
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Collections */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Today&apos;s Collections
            </CardTitle>
            <Link href={`/${lang}/dashboard/agent/intake`}>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentCollections.length === 0 ? (
            <div className="text-center py-8">
              <Droplets className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No collections today yet</p>
              <Link href={`/${lang}/dashboard/agent/intake`}>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Collecting
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCollections.map((collection) => {
                const StatusIcon = statusIcons[collection.status]
                return (
                  <div
                    key={collection.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {collection.farmerName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{collection.farmerName}</p>
                      <p className="text-xs text-gray-500">{collection.farmerCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{collection.quantity}L</p>
                      <p className="text-xs text-gray-500">{collection.time}</p>
                    </div>
                    <Badge className={cn("capitalize", statusColors[collection.status])}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {collection.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission Progress */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              Commission Progress
            </CardTitle>
            <Link href={`/${lang}/dashboard/agent/commissions`}>
              <Button variant="ghost" size="sm" className="text-emerald-600">
                Details <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Period Target</span>
                <span className="text-sm font-medium text-gray-900">
                  {((stats.periodLiters / 5000) * 100).toFixed(0)}% of 5,000L
                </span>
              </div>
              <Progress value={(stats.periodLiters / 5000) * 100} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs text-emerald-600 font-medium">Earned This Period</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">
                  RWF {stats.commissionEarned.toLocaleString()}
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs text-amber-600 font-medium">Pending Approval</p>
                <p className="text-xl font-bold text-amber-700 mt-1">
                  RWF {stats.commissionPending.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
