"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Calendar, Package } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { FarmerProfileManager } from "@/components/farm-level-data/FarmerProfileManager"
import { SeasonPlanManager } from "@/components/farm-level-data/SeasonPlanManager"
import { InputUsageLogger } from "@/components/farm-level-data/InputUsageLogger"

export default function FarmLevelDataPage() {
  const { user } = useAuth()

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Tabs defaultValue="farmer-profile" className="w-full">
              {/* Tab Header */}
              <div className="border-b border-gray-200 bg-white">
                <div className="px-4 sm:px-6">
                  <TabsList className="h-auto bg-transparent p-0 w-full justify-start gap-0.5 sm:gap-1 inline-flex">
                    <TabsTrigger 
                      value="farmer-profile" 
                      className="group relative data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-50 data-[state=active]:via-indigo-50 data-[state=active]:to-purple-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:shadow-blue-100/50 rounded-t-xl border-b-4 border-transparent data-[state=active]:border-blue-600 px-5 sm:px-7 py-4 font-semibold text-sm transition-all duration-300 ease-in-out data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-blue-600 data-[state=inactive]:hover:bg-blue-50/30 data-[state=active]:font-bold data-[state=active]:scale-[1.02] hover:scale-[1.01] data-[state=active]:-mb-[1px]"
                    >
                      <User className="h-4 w-4 mr-2.5 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-400 transition-all duration-300 group-hover:scale-110" />
                      <span>Farmer Profile</span>
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
                  </TabsList>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 sm:p-8 lg:p-10 bg-white">
                <TabsContent value="farmer-profile" className="mt-0">
                  <FarmerProfileManager />
                </TabsContent>

                <TabsContent value="season-plans" className="mt-0">
                  <SeasonPlanManager />
                </TabsContent>

                <TabsContent value="input-usage" className="mt-0">
                  <InputUsageLogger />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
