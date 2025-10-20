"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Hooks
import { useAuth } from "@/hooks/use-auth"

// Utils
import { dashboardTranslations } from "@/app/[lang]/translations/dashboard"

// Icons
import { Activity, Users, Package, DollarSign } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const t = dashboardTranslations[lang]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Gemurai Platform
          </h1>
          <p className="text-gray-600">
            Hello {user.name}, you are logged in as {user.role}
          </p>
        </div>

        {/* Simple Dashboard Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-xs text-gray-500">Active users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">2,156</p>
                  <p className="text-xs text-gray-500">In inventory</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">RWF 7.5M</p>
                  <p className="text-xs text-gray-500">Total revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">4,200</p>
                  <p className="text-xs text-gray-500">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple Info Card */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">
              Platform Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              This is a simplified dashboard view. The platform supports multiple user roles including DCC, Employer, Consumer, and Admin users.
            </p>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">DCC Users</h3>
                <p className="text-blue-600">Digital Community Champions manage products and sales</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Employers</h3>
                <p className="text-green-600">Manage inventory and approve stock orders</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Consumers</h3>
                <p className="text-purple-600">Browse and purchase products from DCCs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
