"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  const [activeTab, setActiveTab] = useState("categories")

  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-2 border-blue-200 bg-white rounded-2xl overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-transparent opacity-50" />
          <CardContent className="pt-8 pb-8 relative z-10">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
    <div className="space-y-6">
      {/* Main Content Tabs */}
      <Card className="group relative overflow-hidden border-2 border-blue-200 bg-white transition-all duration-300 rounded-2xl">
        {/* Subtle gradient background effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50/40 via-blue-50/30 to-blue-100/20 rounded-full -translate-y-32 translate-x-32 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-50/20 via-blue-100/10 to-transparent rounded-full translate-y-24 -translate-x-24 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
        
        <CardContent className="p-0 relative z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Enhanced Tab Header */}
            <div className="border-b border-blue-200 bg-gradient-to-b from-gray-50/80 via-gray-50/50 to-white backdrop-blur-sm">
              <div className="px-4 sm:px-6">
                <TabsList className="h-auto bg-transparent p-0 w-full justify-start gap-1.5">
                  <TabsTrigger 
                    value="categories" 
                    className="group/tab relative data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-300 data-[state=active]:text-blue-700 rounded-t-xl px-5 py-3.5 font-semibold text-sm transition-all duration-200 hover:bg-white/50 hover:text-gray-900 data-[state=inactive]:text-gray-600"
                  >
                    <Package className="h-4 w-4 mr-2 transition-transform duration-200 group-data-[state=active]/tab:scale-110" />
                    <span>Categories</span>
                    <div className="absolute inset-0 rounded-t-xl bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-data-[state=active]/tab:opacity-100 transition-opacity duration-200" />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="commodities"
                    className="group/tab relative data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-300 data-[state=active]:text-blue-700 rounded-t-xl px-5 py-3.5 font-semibold text-sm transition-all duration-200 hover:bg-white/50 hover:text-gray-900 data-[state=inactive]:text-gray-600"
                  >
                    <Wheat className="h-4 w-4 mr-2 transition-transform duration-200 group-data-[state=active]/tab:scale-110" />
                    <span>Commodities</span>
                    <div className="absolute inset-0 rounded-t-xl bg-gradient-to-b from-blue-600/5 to-transparent opacity-0 group-data-[state=active]/tab:opacity-100 transition-opacity duration-200" />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="quality"
                    className="group/tab relative data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-300 data-[state=active]:text-blue-700 rounded-t-xl px-5 py-3.5 font-semibold text-sm transition-all duration-200 hover:bg-white/50 hover:text-gray-900 data-[state=inactive]:text-gray-600"
                  >
                    <CheckSquare className="h-4 w-4 mr-2 transition-transform duration-200 group-data-[state=active]/tab:scale-110" />
                    <span>Quality Schema</span>
                    <div className="absolute inset-0 rounded-t-xl bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-data-[state=active]/tab:opacity-100 transition-opacity duration-200" />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="frequency"
                    className="group/tab relative data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-300 data-[state=active]:text-blue-700 rounded-t-xl px-5 py-3.5 font-semibold text-sm transition-all duration-200 hover:bg-white/50 hover:text-gray-900 data-[state=inactive]:text-gray-600"
                  >
                    <Calendar className="h-4 w-4 mr-2 transition-transform duration-200 group-data-[state=active]/tab:scale-110" />
                    <span>Frequency & Seasons</span>
                    <div className="absolute inset-0 rounded-t-xl bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-data-[state=active]/tab:opacity-100 transition-opacity duration-200" />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="input-catalog"
                    className="group/tab relative data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-300 data-[state=active]:text-blue-700 rounded-t-xl px-5 py-3.5 font-semibold text-sm transition-all duration-200 hover:bg-white/50 hover:text-gray-900 data-[state=inactive]:text-gray-600"
                  >
                    <Database className="h-4 w-4 mr-2 transition-transform duration-200 group-data-[state=active]/tab:scale-110" />
                    <span>Input Catalog</span>
                    <div className="absolute inset-0 rounded-t-xl bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-data-[state=active]/tab:opacity-100 transition-opacity duration-200" />
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Enhanced Tab Content */}
            <div className="p-6 sm:p-8 bg-white/50 backdrop-blur-sm">
              <TabsContent value="categories" className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <CommodityCategoriesManager />
              </TabsContent>

              <TabsContent value="commodities" className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <CommoditiesManager />
              </TabsContent>

              <TabsContent value="quality" className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <QualitySchemaBuilder />
              </TabsContent>

              <TabsContent value="frequency" className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <FrequencySeasonManager />
              </TabsContent>

              <TabsContent value="input-catalog" className="mt-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <InputCatalogManager />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
