"use client"

import { useAuth } from "@/hooks/use-auth"
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation"
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
    <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/30">
      <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
    </div>
  )
}

const TAB_VALUES = ["payments", "advances", "reconciliation"] as const
type TabValue = (typeof TAB_VALUES)[number]

const TAB_CONFIG: Record<
  TabValue,
  { label: string; icon: typeof DollarSign; description: string }
> = {
  payments: {
    label: "Farmer Payments",
    icon: DollarSign,
    description: "Process and track payments to farmers for milk and crop deliveries.",
  },
  advances: {
    label: "Agent Advances",
    icon: HandCoins,
    description: "Manage advances to field agents and track repayment.",
  },
  reconciliation: {
    label: "Reconciliation",
    icon: RefreshCw,
    description: "Reconcile collections, payments, and advances.",
  },
}

export default function HarvestPlusPage() {
  const { user } = useAuth()
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
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
        const params = new URLSearchParams(searchParams?.toString() || "")
        params.set("tab", next)
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      }
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    const t = searchParams.get("tab") || "payments"
    if (TAB_VALUES.includes(t as TabValue)) setActiveTab(t as TabValue)
  }, [searchParams])

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-10 pb-10 px-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Wheat className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Access restricted</h2>
              <p className="mt-2 text-sm text-slate-600">
                HarvestPlus is available to collection center managers and administrators.
              </p>
              <p className="mt-4 text-xs text-slate-500">
                Contact your administrator if you need access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentTabInfo = TAB_CONFIG[activeTab]

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <Wheat className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    HarvestPlus
                  </h1>
                  <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    Payments & reconciliation
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Farmer payments, agent advances, and reconciliation in one place.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs + context description + content */}
        <Tabs value={activeTab} onValueChange={updateTab} className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <TabsList className="inline-flex h-auto w-full flex-wrap gap-0.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto">
              {(TAB_VALUES as readonly string[]).map((value) => {
                const tab = TAB_CONFIG[value as TabValue]
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                      "data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm",
                      "data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-slate-100 data-[state=inactive]:hover:text-slate-900"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
            <p className="text-sm text-slate-500 min-w-0 max-w-md">
              {currentTabInfo.description}
            </p>
          </div>

          <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              <TabsContent value="payments" className="mt-0 focus-visible:outline-none">
                <PaymentsTab />
              </TabsContent>
              <TabsContent value="advances" className="mt-0 focus-visible:outline-none">
                <AgentAdvancesTab />
              </TabsContent>
              <TabsContent value="reconciliation" className="mt-0 focus-visible:outline-none">
                <ReconciliationTab />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  )
}
