"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XCircle, Wheat, Package, CheckSquare, Calendar, Database } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { CommodityCategoriesManager } from "@/components/admin/commodity-studio/CommodityCategoriesManager"
import { CommoditiesManager } from "@/components/admin/commodity-studio/CommoditiesManager"
import { QualitySchemaBuilder } from "@/components/admin/commodity-studio/QualitySchemaBuilder"
import { InputCatalogManager } from "@/components/admin/commodity-studio/InputCatalogManager"
import { FrequencySeasonManager } from "@/components/admin/commodity-studio/FrequencySeasonManager"

export default function CommodityStudioPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  
  // Sync active tab with URL (ensures ?tab=quality shows Quality tab)
  const validTabs = ['categories', 'commodities', 'quality', 'frequency', 'input-catalog'] as const
  const tabFromUrl = searchParams?.get('tab')
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl as any) ? tabFromUrl : "categories"
  const [activeTab, setActiveTab] = useState(initialTab)
  const tabsListRef = useRef<HTMLDivElement>(null)

  // Keep tab in sync with URL when user navigates or lands with ?tab=...
  useEffect(() => {
    const tabParam = searchParams?.get('tab')
    if (tabParam && validTabs.includes(tabParam as any)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Scroll active tab into view when tab changes (e.g. landing with ?tab=quality)
  useEffect(() => {
    if (!activeTab || !tabsListRef.current) return
    const trigger = tabsListRef.current.querySelector(`[data-state="active"]`)
    if (trigger) {
      ;(trigger as HTMLElement).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [activeTab])

  // Stats for dashboard cards
  const [stats, setStats] = useState<{
    totalCategories: number
    totalCommodities: number
    totalQualityFields: number
    totalInputItems: number
  } | null>(null)
  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem("Gemurai_token")
    if (!token) return
    fetch("/api/v1/admin/commodity-studio/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((json) => json?.data && setStats(json.data))
      .catch(() => {})
  }, [user])
  
  // Handle tab change and update URL
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    router.push(`/${lang}/dashboard/admin/commodity-studio?tab=${newTab}`)
  }

  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-2 border-red-100">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
              <p className="text-gray-600">
                You need admin privileges to access Commodity Studio
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Commodity Studio</h1>
          <p className="text-gray-600 mt-1">HarvestPlus by YDEN - Multi-Commodity Configuration & Management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Categories</CardTitle>
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {stats ? stats.totalCategories : "—"}
              </div>
              <p className="text-xs text-gray-500 mt-1">Commodity categories</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-indigo-200 hover:border-indigo-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Commodities</CardTitle>
                <Wheat className="h-5 w-5 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">
                {stats ? stats.totalCommodities : "—"}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active commodities</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Quality Fields</CardTitle>
                <CheckSquare className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {stats ? stats.totalQualityFields : "—"}
              </div>
              <p className="text-xs text-gray-500 mt-1">Defined quality fields</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-teal-200 hover:border-teal-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Input Items</CardTitle>
                <Database className="h-5 w-5 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-900">
                {stats ? stats.totalInputItems : "—"}
              </div>
              <p className="text-xs text-gray-500 mt-1">Catalog items</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section - Improved Design (overflow-visible so dropdowns are not clipped) */}
        <Card className="bg-white border border-gray-200 shadow-sm overflow-visible">
          <CardContent className="p-0 overflow-visible">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              {/* Enhanced Tab Header */}
              <div className="border-b border-gray-200 bg-white">
                <div className="px-4 sm:px-6 overflow-x-auto" ref={tabsListRef}>
                  <TabsList className="h-auto bg-transparent p-0 w-full justify-start gap-0.5 sm:gap-1 inline-flex min-w-0">
                    <TabsTrigger 
                      value="categories" 
                      className="rounded-none border-b-2 border-transparent px-4 sm:px-6 py-3.5 font-semibold text-sm transition-all duration-200 data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-600 data-[state=active]:border-b-2 data-[state=active]:shadow-none"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      <span>Categories</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="commodities"
                      className="rounded-none border-b-2 border-transparent px-4 sm:px-6 py-3.5 font-semibold text-sm transition-all duration-200 data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-600 data-[state=active]:border-b-2 data-[state=active]:shadow-none"
                    >
                      <Wheat className="h-4 w-4 mr-2" />
                      <span>Commodities</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="quality"
                      className="rounded-none border-b-2 border-transparent px-4 sm:px-6 py-3.5 font-semibold text-sm transition-all duration-200 data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-600 data-[state=active]:border-b-2 data-[state=active]:shadow-none"
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      <span>Quality Checks</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="frequency"
                      className="rounded-none border-b-2 border-transparent px-4 sm:px-6 py-3.5 font-semibold text-sm transition-all duration-200 data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-600 data-[state=active]:border-b-2 data-[state=active]:shadow-none"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Frequency & Seasons</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="input-catalog"
                      className="rounded-none border-b-2 border-transparent px-4 sm:px-6 py-3.5 font-semibold text-sm transition-all duration-200 data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-50 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-600 data-[state=active]:border-b-2 data-[state=active]:shadow-none"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      <span>Input Catalog</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Tab Content - min-height so Quality/Frequency/Input Catalog have room for dropdowns */}
              <div className="p-6 sm:p-8 lg:p-10 bg-white overflow-visible min-h-[70vh]">
                <TabsContent value="categories" className="mt-0">
                  <CommodityCategoriesManager />
                </TabsContent>

                <TabsContent value="commodities" className="mt-0">
                  <CommoditiesManager />
                </TabsContent>

                <TabsContent value="quality" className="mt-0 overflow-visible">
                  <QualitySchemaBuilder />
                </TabsContent>

                <TabsContent value="frequency" className="mt-0 overflow-visible">
                  <FrequencySeasonManager />
                </TabsContent>

                <TabsContent value="input-catalog" className="mt-0 overflow-visible">
                  <InputCatalogManager />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
