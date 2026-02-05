"use client"

import { useAuth } from "@/hooks/use-auth"
import { useParams, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wheat, DollarSign, HandCoins, RefreshCw, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"

const PaymentsTab = dynamic(
  () => import("@/app/[lang]/dashboard/payments/page").then((mod) => ({ default: mod.default })),
  { ssr: false, loading: () => <TabLoader /> }
)

const AgentAdvancesTab = dynamic(
  () => import("@/app/[lang]/dashboard/agent-advances/page").then((mod) => ({ default: mod.default })),
  { ssr: false, loading: () => <TabLoader /> }
)

const ReconciliationTab = dynamic(
  () => import("@/app/[lang]/dashboard/mcc/reconciliation/page").then((mod) => ({ default: mod.default })),
  { ssr: false, loading: () => <TabLoader /> }
)

function TabLoader() {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50/50">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )
}

const TAB_VALUES = ["payments", "advances", "reconciliation"] as const
type TabValue = (typeof TAB_VALUES)[number]

export default function HarvestPlusPage() {
  const { user } = useAuth()
  const params = useParams()
  const searchParams = useSearchParams()
  const lang = (params?.lang as string) || "en"
  const tabParam = searchParams.get("tab") || "payments"
  const [activeTab, setActiveTab] = useState<TabValue>(
    TAB_VALUES.includes(tabParam as TabValue) ? (tabParam as TabValue) : "payments"
  )

  const updateTab = useCallback(
    (value: string) => {
      const next = value as TabValue
      if (TAB_VALUES.includes(next)) {
        setActiveTab(next)
        const url = new URL(window.location.href)
        url.searchParams.set("tab", next)
        window.history.replaceState({}, "", url.pathname + url.search)
      }
    },
    []
  )

  useEffect(() => {
    const t = searchParams.get("tab") || "payments"
    if (TAB_VALUES.includes(t as TabValue)) setActiveTab(t as TabValue)
  }, [searchParams])

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex items-center justify-center">
        <Card className="max-w-md overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-2xl bg-blue-50 p-4">
                <Wheat className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
              <p className="mt-2 text-sm text-gray-600">
                You need appropriate permissions to access HarvestPlus.
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
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full px-0 py-10">
          <Tabs value={activeTab} onValueChange={updateTab} className="w-full space-y-6">
            <TabsList className="inline-flex h-11 w-full flex-wrap items-center justify-start gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm sm:w-auto">
              <TabsTrigger
                value="payments"
                className={cn(
                  "rounded-lg px-4 text-sm font-medium transition-all",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-md",
                  "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:hover:text-gray-900"
                )}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Farmer Payments
              </TabsTrigger>
              <TabsTrigger
                value="advances"
                className={cn(
                  "rounded-lg px-4 text-sm font-medium transition-all",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-md",
                  "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:hover:text-gray-900"
                )}
              >
                <HandCoins className="mr-2 h-4 w-4" />
                Agent Advances
              </TabsTrigger>
              <TabsTrigger
                value="reconciliation"
                className={cn(
                  "rounded-lg px-4 text-sm font-medium transition-all",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-md",
                  "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:hover:text-gray-900"
                )}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reconciliation
              </TabsTrigger>
            </TabsList>

            <Card className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg">
              <CardContent className="p-0">
                <TabsContent value="payments" className="mt-0">
                  <PaymentsTab />
                </TabsContent>
                <TabsContent value="advances" className="mt-0">
                  <AgentAdvancesTab />
                </TabsContent>
                <TabsContent value="reconciliation" className="mt-0">
                  <ReconciliationTab />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
