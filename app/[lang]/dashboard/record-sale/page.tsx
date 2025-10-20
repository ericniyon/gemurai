"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, TrendingUp, Package, DollarSign, Users, BarChart3, Star, Zap, Target, Award, Clock, CheckCircle2, Sparkles, Activity, Receipt, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SalesRecorder } from "@/app/[lang]/dashboard/components/sales-recorder"

function RecordSalePage() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [stats, setStats] = useState({
    totalSales: 0,
    revenue: 0,
    products: 0,
    customers: 0,
    todaySales: 0,
    weekSales: 0,
    monthSales: 0
  })
  const [currentSaleData, setCurrentSaleData] = useState({
    salePrice: 0,
    quantity: 1,
    costPrice: 0,
    productName: ""
  })

  // Simulate loading stats
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        totalSales: 24,
        revenue: 125000,
        products: 8,
        customers: 18,
        todaySales: 3,
        weekSales: 12,
        monthSales: 24
      })
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back link only (header texts removed) */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/${lang}/dashboard`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>

        

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="xl:col-span-2">
            <SalesRecorder onSaleDataChange={setCurrentSaleData} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6 xl:sticky xl:top-8 h-max">
            {/* Profit Calculator */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  Live Profit Calculator
                </CardTitle>
                <CardDescription>Real-time profit calculation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentSaleData.salePrice > 0 && currentSaleData.costPrice > 0 ? (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Sale Price</span>
                        <span className="text-lg font-bold text-green-700">
                          {currentSaleData.salePrice.toLocaleString()} RWF
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Cost Price</span>
                        <span className="text-lg font-bold text-green-700">
                          {currentSaleData.costPrice.toLocaleString()} RWF
                        </span>
                      </div>
                      <div className="pt-3 border-t border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800">Profit per Unit</span>
                          <span className="text-xl font-bold text-green-700">
                            {(currentSaleData.salePrice - currentSaleData.costPrice).toLocaleString()} RWF
                          </span>
                    </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">Total Profit ({currentSaleData.quantity} units)</span>
                          <span className="text-xl font-bold text-green-700">
                            {((currentSaleData.salePrice - currentSaleData.costPrice) * currentSaleData.quantity).toLocaleString()} RWF
                          </span>
                  </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500">Enter sale details to see live profit calculation</p>
                    </div>
              </div>
                )}
              </CardContent>
            </Card>

            
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecordSalePage 