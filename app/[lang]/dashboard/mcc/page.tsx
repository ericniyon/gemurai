"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useSearchParams, useRouter, usePathname, useParams } from "next/navigation"
import {
  Droplets,
  ShoppingCart,
  Users,
  Package,
  Wallet,
  Warehouse,
  Loader2,
  LayoutGrid,
  Plus,
  UserPlus,
  Banknote,
  Boxes,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ACTION_BUTTONS = [
  { id: "record-sale", label: "Record Sale", icon: ShoppingCart, triggerKey: "recordSale" as const },
  { id: "add-customer", label: "Add Customer", icon: UserPlus, triggerKey: "addCustomer" as const },
  { id: "add-supplier", label: "Add Supplier", icon: Package, triggerKey: "addSupplier" as const },
  { id: "process-payment", label: "Process Payment", icon: Banknote, triggerKey: "processPayment" as const },
  { id: "add-warehouse", label: "Add warehouse", icon: Warehouse, triggerKey: "addWarehouse" as const },
  { id: "add-product", label: "Add Product", icon: Boxes, triggerKey: "addProduct" as const },
  { id: "record-asset", label: "Record asset", icon: Briefcase, triggerKey: "recordAsset" as const },
]

const SalesTab = dynamic(
  () => import("@/app/[lang]/dashboard/mcc/sales/page").then((mod) => ({ default: mod.default })),
  { ssr: false, loading: () => <TabLoader /> }
)

const CustomersTab = dynamic(
  () => import("@/app/[lang]/dashboard/mcc/customers/page").then((mod) => ({ default: mod.default })),
  { ssr: false, loading: () => <TabLoader /> }
)

const SuppliersTab = dynamic(
  () => import("@/app/[lang]/dashboard/mcc/suppliers/page").then((mod) => ({ default: mod.default })),
  { ssr: false, loading: () => <TabLoader /> }
)

const IkofiTab = dynamic(
  () => import("@/app/[lang]/dashboard/mcc/ikofi/page").then((mod) => ({ default: mod.default })),
  { ssr: false, loading: () => <TabLoader /> }
)

const WarehousesTab = dynamic(
  () => import("@/app/[lang]/dashboard/mcc/warehouses/page").then((mod) => ({ default: mod.default })),
  { ssr: false, loading: () => <TabLoader /> }
)

function TabLoader() {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/50 dark:bg-slate-900/20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

const VALID_TABS = ["sales", "customers", "suppliers", "ikofi", "warehouses"] as const

const TAB_CONFIG: { value: (typeof VALID_TABS)[number]; label: string; icon: React.ElementType }[] = [
  { value: "sales", label: "Sales", icon: ShoppingCart },
  { value: "customers", label: "Customers", icon: Users },
  { value: "suppliers", label: "Suppliers", icon: Package },
  { value: "ikofi", label: "Wallet", icon: Wallet },
  { value: "warehouses", label: "Warehouses", icon: Warehouse },
]

export default function MCCDigitalPage() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get("tab")
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [activeTab, setActiveTab] = useState<string>(
    VALID_TABS.includes(tabParam as (typeof VALID_TABS)[number]) ? tabParam! : "sales"
  )
  const [triggerRecordSale, setTriggerRecordSale] = useState(false)
  const [triggerAddCustomer, setTriggerAddCustomer] = useState(false)
  const [triggerAddSupplier, setTriggerAddSupplier] = useState(false)
  const [triggerAddWarehouse, setTriggerAddWarehouse] = useState(false)
  const [triggerAddProduct, setTriggerAddProduct] = useState(false)
  const [triggerRecordAsset, setTriggerRecordAsset] = useState(false)

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam as (typeof VALID_TABS)[number])) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value)
      const nextParams = new URLSearchParams(searchParams?.toString() || "")
      nextParams.set("tab", value)
      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const handleActionClick = useCallback(
    (triggerKey: string) => {
      if (triggerKey === "processPayment") {
        router.push(`/${lang}/dashboard/mcc/payments`)
        return
      }
      if (triggerKey === "recordSale") setTriggerRecordSale(true)
      else if (triggerKey === "addCustomer") setTriggerAddCustomer(true)
      else if (triggerKey === "addSupplier") setTriggerAddSupplier(true)
      else if (triggerKey === "addWarehouse") setTriggerAddWarehouse(true)
      else if (triggerKey === "addProduct") setTriggerAddProduct(true)
      else if (triggerKey === "recordAsset") setTriggerRecordAsset(true)
    },
    [lang, router]
  )

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">Please log in to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-slate-600 dark:text-slate-400">You need MCC Manager or Admin access.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full">
      <div className="w-full max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <header className="mb-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                aria-hidden
              >
                <Droplets className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  MCC (Digital)
                </h1>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                  Sales, customers, suppliers, wallet, and warehouses in one place.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 dark:bg-slate-800/50 dark:border-slate-700/80 px-3 py-2">
              <LayoutGrid className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {TAB_CONFIG.length} sections
              </span>
            </div>
          </div>
        </header>

        {/* Big action buttons above tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 mb-6">
          {ACTION_BUTTONS.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => handleActionClick(action.triggerKey)}
                className="h-auto min-h-[88px] sm:min-h-[100px] flex flex-col items-center justify-center gap-2 rounded-2xl bg-transparent border-2 border-sky-200 text-sky-600 shadow-sm transition-all hover:scale-[1.02] hover:border-sky-300 hover:text-sky-700 active:scale-[0.98] dark:border-sky-500/50 dark:text-sky-400 dark:hover:border-sky-400 dark:hover:text-sky-300"
              >
                <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-current/30">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span className="text-sm font-semibold leading-tight sm:text-base text-center px-1">
                  {action.label}
                </span>
              </Button>
            )
          })}
        </div>

        {/* Main content card with tabs */}
        <Card className="w-full overflow-hidden border border-slate-200/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/30 rounded-xl">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="px-4 sm:px-6 pt-1">
                <TabsList
                  className={cn(
                    "h-auto w-full justify-start gap-0.5 sm:gap-1 p-0 bg-transparent",
                    "inline-flex flex-wrap border-0 min-h-[3rem]"
                  )}
                >
                  {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className={cn(
                        "rounded-lg px-4 sm:px-5 py-3 text-sm font-medium transition-all",
                        "data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/60",
                        "dark:data-[state=inactive]:text-slate-400 dark:data-[state=inactive]:hover:text-slate-100 dark:data-[state=inactive]:hover:bg-slate-700/50",
                        "data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm",
                        "dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-primary",
                        "inline-flex items-center gap-2 -mb-px border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:rounded-b-none"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50">
              <div className="p-4 sm:p-6 lg:p-8 min-h-[420px]">
                {/* All panels mounted so dialogs can open without switching tab */}
                <TabsContent value="sales" className="mt-0 focus-visible:outline-none" forceMount hidden={activeTab !== "sales"}>
                  <SalesTab
                    triggerOpenAddDialog={triggerRecordSale}
                    onTriggerConsumed={() => setTriggerRecordSale(false)}
                  />
                </TabsContent>
                <TabsContent value="customers" className="mt-0 focus-visible:outline-none" forceMount hidden={activeTab !== "customers"}>
                  <CustomersTab
                    triggerOpenAddDialog={triggerAddCustomer}
                    onTriggerConsumed={() => setTriggerAddCustomer(false)}
                  />
                </TabsContent>
                <TabsContent value="suppliers" className="mt-0 focus-visible:outline-none" forceMount hidden={activeTab !== "suppliers"}>
                  <SuppliersTab
                    triggerOpenAddDialog={triggerAddSupplier}
                    onTriggerConsumed={() => setTriggerAddSupplier(false)}
                  />
                </TabsContent>
                <TabsContent value="ikofi" className="mt-0 focus-visible:outline-none" forceMount hidden={activeTab !== "ikofi"}>
                  <IkofiTab />
                </TabsContent>
                <TabsContent value="warehouses" className="mt-0 focus-visible:outline-none" forceMount hidden={activeTab !== "warehouses"}>
                  <WarehousesTab
                    triggerAddWarehouse={triggerAddWarehouse}
                    onTriggerAddWarehouseConsumed={() => setTriggerAddWarehouse(false)}
                    triggerAddProduct={triggerAddProduct}
                    onTriggerAddProductConsumed={() => setTriggerAddProduct(false)}
                    triggerRecordAsset={triggerRecordAsset}
                    onTriggerRecordAssetConsumed={() => setTriggerRecordAsset(false)}
                  />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
