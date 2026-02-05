"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Wallet,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Calendar,
  Loader2,
  CreditCard,
  PiggyBank,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Banknote
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface IkofiData {
  savings: {
    totalBalance: number
  }
  loans: {
    outstanding: number
  }
  insurance: {
    activePolicies: number
  }
  payments: {
    thisMonth: number
  }
  recentTransactions: Array<{
    id: string
    type: string
    description: string
    amount: number
    date: string
    status: string
  }>
}

export default function IkofiPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const lang = (params?.lang as string) || "en"
  
  const [ikofiData, setIkofiData] = useState<IkofiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchIkofiData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const url = new URL("/api/v1/mcc/ikofi", window.location.origin)
      if (user?.mccId) {
        url.searchParams.set("mccId", user.mccId)
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIkofiData(data.data)
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to fetch Ikofi data")
      }
    } catch (error) {
      console.error("Error fetching Ikofi data:", error)
      toast.error("Failed to fetch Ikofi data")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchIkofiData()
    }
  }, [user])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchIkofiData()
  }

  if (loading && !ikofiData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h2 className="text-sm sm:text-base font-semibold text-gray-700">Loading Ikofi Data...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full px-0 py-10">
          <header className="mb-10 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => router.push(`/${lang}/dashboard/mcc/payments`)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
            >
              <Banknote className="h-4 w-4" />
              Process Payment
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-white hover:shadow-md disabled:cursor-not-allowed"
            >
              <RefreshCw className={cn("h-4 w-4", (isRefreshing || loading) && "animate-spin")} />
              Refresh
            </Button>
          </header>
        
        <div className="w-full px-2 sm:px-3 py-4 sm:py-6 space-y-4 sm:space-y-6">

          {/* Summary Cards */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Total Savings
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      RWF {ikofiData?.savings?.totalBalance ? (ikofiData.savings.totalBalance / 1000).toFixed(0) + "K" : "0"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <PiggyBank className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    From all farmer accounts
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-amber-100/50 via-orange-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                      Loans Outstanding
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      RWF {ikofiData?.loans?.outstanding ? (ikofiData.loans.outstanding / 1000).toFixed(0) + "K" : "0"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3">
                    <CreditCard className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Active farmer loans
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-emerald-100/50 via-teal-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                      Active Insurance
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {ikofiData?.insurance?.activePolicies || 0}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <Shield className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Active policies
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-indigo-100/60 via-purple-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                      Payments This Month
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      RWF {ikofiData?.payments?.thisMonth ? (ikofiData.payments.thisMonth / 1000).toFixed(0) + "K" : "0"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-indigo-50 p-3">
                    <DollarSign className="h-6 w-6 text-indigo-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Monthly payment total
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Recent Transactions */}
          <section className="mt-12 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
              <p className="text-sm text-gray-600">
                Latest financial transactions and payments from Ikofi services.
              </p>
            </div>

            <Card className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-white to-blue-50/50">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Transaction History</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Latest financial transactions and payments
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!ikofiData?.recentTransactions || ikofiData.recentTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-gray-500">
                    <Wallet className="h-12 w-12 text-gray-300" />
                    <div>
                      <p className="text-lg font-semibold text-gray-700">No transactions yet</p>
                      <p className="text-sm text-gray-500">
                        Financial transactions will appear here as they occur.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {ikofiData.recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${
                            transaction.type === "Payment" || transaction.type === "Mobile Money Transfer"
                              ? "bg-green-50"
                              : "bg-blue-50"
                          }`}>
                            {transaction.type === "Payment" || transaction.type === "Mobile Money Transfer" ? (
                              <ArrowDownRight className="h-5 w-5 text-green-600" />
                            ) : (
                              <ArrowUpRight className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{transaction.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <p className="text-xs text-gray-500">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                              <Badge
                                variant={
                                  transaction.status === "PAID"
                                    ? "default"
                                    : transaction.status === "PENDING"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className={`text-[10px] px-2 py-0.5 font-semibold rounded-full ${
                                  transaction.status === "PAID"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : transaction.status === "PENDING"
                                    ? "bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-red-100 text-red-700 border-red-200"
                                }`}
                              >
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${
                            transaction.type === "Payment" || transaction.type === "Mobile Money Transfer"
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}>
                            {transaction.type === "Payment" || transaction.type === "Mobile Money Transfer" ? "-" : "+"}
                            RWF {transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Financial Services Info */}
          <section className="mt-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Financial Services Overview</h2>
              <p className="text-sm text-gray-600">
                Detailed breakdown of savings, loans, insurance, and payment services.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/50 to-transparent">
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-blue-500" />
                    Savings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600 mb-3">
                    Track total savings balance from all farmer accounts linked to this MCC.
                  </p>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium">Total Savings Balance</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      RWF {ikofiData?.savings?.totalBalance ? ikofiData.savings.totalBalance.toLocaleString() : "0"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <CardHeader className="pb-3 bg-gradient-to-r from-amber-50/50 to-transparent">
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-amber-500" />
                    Loans
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600 mb-3">
                    Monitor outstanding loans for farmers in this MCC.
                  </p>
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200">
                    <p className="text-xs text-gray-600 font-medium">Outstanding Loans</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      RWF {ikofiData?.loans?.outstanding ? ikofiData.loans.outstanding.toLocaleString() : "0"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50/50 to-transparent">
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-500" />
                    Insurance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600 mb-3">
                    View active insurance policies for farmers in this MCC.
                  </p>
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
                    <p className="text-xs text-gray-600 font-medium">Active Policies</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {ikofiData?.insurance?.activePolicies || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50/50 to-transparent">
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-indigo-500" />
                    Payments
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600 mb-3">
                    Track payments made to farmers this month.
                  </p>
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200">
                    <p className="text-xs text-gray-600 font-medium">This Month</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">
                      RWF {ikofiData?.payments?.thisMonth ? ikofiData.payments.thisMonth.toLocaleString() : "0"}
                    </p>
                  </div>
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

