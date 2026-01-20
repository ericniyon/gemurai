"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  Droplets, 
  Sprout, 
  Wheat, 
  Package, 
  Calendar, 
  Activity, 
  Database,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle2
} from "lucide-react"

export default function HarvestPlusPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-gray-600">
                You need appropriate permissions to access HarvestPlus
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
            <Wheat className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HarvestPlus</h1>
            <p className="text-gray-600">Multi-Commodity Aggregation & Settlement Platform</p>
          </div>
        </div>
      </div>

      {/* Sector Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MCC (Dairy) Sector */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">MCC - Dairy Sector</CardTitle>
                <CardDescription>Milk Collection & Processing Operations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Core Operations:</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span>Milk Collections (milk_collections)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>MCC Periods (mcc_periods)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span>Milk Processing (milk_processing)</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t">
              <Link href={`/${lang}/dashboard/mcc`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Manage MCC Sector
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/${lang}/dashboard/mcc/collections`}>
                <Button variant="outline" className="w-full text-xs">
                  <Droplets className="h-3 w-3 mr-1" />
                  Collections
                </Button>
              </Link>
              <Link href={`/${lang}/dashboard/mcc/processing`}>
                <Button variant="outline" className="w-full text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  Processing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Agriculture (Crops) Sector */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500">
          <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-xl">
                <Sprout className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Agriculture - Crops Sector</CardTitle>
                <CardDescription>Crop Collection & Processing Operations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Core Operations:</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <span>Crop Collections (crop_collections)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-600" />
                  <span>Crop Types (crop_types)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span>Crop Periods (crop_periods)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span>Crop Processing (crop_processing)</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t">
              <Link href={`/${lang}/dashboard/agriculture`}>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Manage Agriculture Sector
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/${lang}/dashboard/mcc/crops/collections`}>
                <Button variant="outline" className="w-full text-xs">
                  <Package className="h-3 w-3 mr-1" />
                  Collections
                </Button>
              </Link>
              <Link href={`/${lang}/dashboard/mcc/crops/processing`}>
                <Button variant="outline" className="w-full text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  Processing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wheat className="h-5 w-5" />
            Multi-Commodity Unified Features
          </CardTitle>
          <CardDescription>
            Features that work across both MCC (Dairy) and Agriculture (Crops) sectors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/${lang}/dashboard/mcc/commodities/collections`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">Multi-Commodity Collections</h3>
                      <p className="text-xs text-gray-500">Unified collection system</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/${lang}/dashboard/farmers/season-plans`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-amber-600" />
                    <div>
                      <h3 className="font-semibold">Season Plans</h3>
                      <p className="text-xs text-gray-500">Farm-level planning</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/${lang}/dashboard/mcc/reconciliation`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    <div>
                      <h3 className="font-semibold">Reconciliation</h3>
                      <p className="text-xs text-gray-500">Automated reconciliation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">MCC Operations</p>
                <p className="text-2xl font-bold">Active</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Agriculture Operations</p>
                <p className="text-2xl font-bold">Active</p>
              </div>
              <Sprout className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Commodities</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <Wheat className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unified Platform</p>
                <p className="text-2xl font-bold">Ready</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
