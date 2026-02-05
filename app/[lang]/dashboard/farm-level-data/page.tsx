"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Package, Tractor, Users, UserPlus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { FarmerProfileManager } from "@/components/farm-level-data/FarmerProfileManager"
import { SeasonPlanManager } from "@/components/farm-level-data/SeasonPlanManager"
import { InputUsageLogger } from "@/components/farm-level-data/InputUsageLogger"
import { OnboardingAgentsContent } from "@/components/farm-level-data/OnboardingAgentsContent"

const VALID_TABS = ["farmers", "season-plans", "input-usage", "agents"]

export default function FarmLevelDataPage() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get("tab")
  const [activeTab, setActiveTab] = useState(
    VALID_TABS.includes(tabParam || "") ? tabParam! : "farmers"
  )

  useEffect(() => {
    if (!tabParam) return
    // Redirect legacy farmer-profile to farmers
    if (tabParam === "farmer-profile") {
      const params = new URLSearchParams(searchParams?.toString() || "")
      params.set("tab", "farmers")
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      setActiveTab("farmers")
      return
    }
    if (VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam, pathname, router, searchParams])

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value)
      const params = new URLSearchParams(searchParams?.toString() || "")
      params.set("tab", value)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-gray-600">Please log in to access this page</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need MCC Manager or Admin access to view farm-level data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="rounded-xl bg-primary/10 p-2">
              <Tractor className="h-6 w-6 text-primary" />
            </span>
            Farm-Level Data
          </h1>
          <p className="mt-1 text-slate-600">
            Farmers, season plans, input usage, and agents in one place.
          </p>
        </div>
        <Card className="bg-white border border-slate-200/80 shadow-lg overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              {/* Tab Header */}
              <div className="border-b border-gray-200 bg-white">
                <div className="px-4 sm:px-6">
                  <TabsList className="h-auto bg-transparent p-0 w-full justify-start gap-0.5 sm:gap-1 inline-flex">
                    <TabsTrigger 
                      value="farmers" 
                      className="group relative data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-50 data-[state=active]:via-indigo-50 data-[state=active]:to-purple-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:shadow-blue-100/50 rounded-t-xl border-b-4 border-transparent data-[state=active]:border-blue-600 px-5 sm:px-7 py-4 font-semibold text-sm transition-all duration-300 ease-in-out data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-blue-600 data-[state=inactive]:hover:bg-blue-50/30 data-[state=active]:font-bold data-[state=active]:scale-[1.02] hover:scale-[1.01] data-[state=active]:-mb-[1px]"
                    >
                      <Users className="h-4 w-4 mr-2.5 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-400 transition-all duration-300 group-hover:scale-110" />
                      <span>Farmers</span>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300 rounded-t-full"></div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="season-plans" 
                      className="group relative data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-50 data-[state=active]:via-indigo-50 data-[state=active]:to-purple-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:shadow-blue-100/50 rounded-t-xl border-b-4 border-transparent data-[state=active]:border-blue-600 px-5 sm:px-7 py-4 font-semibold text-sm transition-all duration-300 ease-in-out data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-blue-600 data-[state=inactive]:hover:bg-blue-50/30 data-[state=active]:font-bold data-[state=active]:scale-[1.02] hover:scale-[1.01] data-[state=active]:-mb-[1px]"
                    >
                      <Calendar className="h-4 w-4 mr-2.5 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-400 transition-all duration-300 group-hover:scale-110" />
                      <span>Season Plans</span>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300 rounded-t-full"></div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="input-usage" 
                      className="group relative data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-50 data-[state=active]:via-indigo-50 data-[state=active]:to-purple-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:shadow-blue-100/50 rounded-t-xl border-b-4 border-transparent data-[state=active]:border-blue-600 px-5 sm:px-7 py-4 font-semibold text-sm transition-all duration-300 ease-in-out data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-blue-600 data-[state=inactive]:hover:bg-blue-50/30 data-[state=active]:font-bold data-[state=active]:scale-[1.02] hover:scale-[1.01] data-[state=active]:-mb-[1px]"
                    >
                      <Package className="h-4 w-4 mr-2.5 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-400 transition-all duration-300 group-hover:scale-110" />
                      <span>Input Usage</span>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300 rounded-t-full"></div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="agents" 
                      className="group relative data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-50 data-[state=active]:via-indigo-50 data-[state=active]:to-purple-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:shadow-blue-100/50 rounded-t-xl border-b-4 border-transparent data-[state=active]:border-blue-600 px-5 sm:px-7 py-4 font-semibold text-sm transition-all duration-300 ease-in-out data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-blue-600 data-[state=inactive]:hover:bg-blue-50/30 data-[state=active]:font-bold data-[state=active]:scale-[1.02] hover:scale-[1.01] data-[state=active]:-mb-[1px]"
                    >
                      <UserPlus className="h-4 w-4 mr-2.5 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-400 transition-all duration-300 group-hover:scale-110" />
                      <span>Agents</span>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300 rounded-t-full"></div>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 sm:p-8 lg:p-10 bg-white">
                <TabsContent value="farmers" className="mt-0">
                  <FarmerProfileManager />
                </TabsContent>

                <TabsContent value="season-plans" className="mt-0">
                  <SeasonPlanManager />
                </TabsContent>

                <TabsContent value="input-usage" className="mt-0">
                  <InputUsageLogger />
                </TabsContent>

                <TabsContent value="agents" className="mt-0">
                  <OnboardingAgentsContent />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
