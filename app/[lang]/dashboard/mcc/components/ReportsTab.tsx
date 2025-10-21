"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  FileText,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Droplets,
  DollarSign,
  Calendar,
  RefreshCw,
  Eye,
  Filter,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react"
import { GenerateReportForm } from "./GenerateReportForm"

interface ReportSummary {
  totalCollections: number
  totalLiters: number
  totalAmount: number
  totalPayments: number
  averagePerFarmer: number
  topFarmers: Array<{
    id: string
    name: string
    liters: number
    amount: number
  }>
  monthlyTrend: Array<{
    month: string
    liters: number
    amount: number
    collections: number
  }>
}

interface ReportsTabProps {
  mccId?: string
}

export default function ReportsTab({ mccId }: ReportsTabProps) {
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [generateReportOpen, setGenerateReportOpen] = useState(false)

  const fetchReportSummary = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('Gemurai_token')
      
      // Fetch collections data
      const collectionsResponse = await fetch(`/api/v1/mcc/collections?mccId=${mccId || 'mcc_1760697250506'}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      // Fetch payments data
      const paymentsResponse = await fetch(`/api/v1/mcc/payments?mccId=${mccId || 'mcc_1760697250506'}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (collectionsResponse.ok && paymentsResponse.ok) {
        const collectionsData = await collectionsResponse.json()
        const paymentsData = await paymentsResponse.json()
        
        const collections = collectionsData.data || []
        const payments = paymentsData.data || []
        
        // Calculate summary statistics
        const totalCollections = collections.length
        const totalLiters = collections.reduce((sum: number, collection: any) => sum + (collection.totalLiters || 0), 0)
        const totalAmount = collections.reduce((sum: number, collection: any) => sum + (collection.totalAmount || 0), 0)
        const totalPayments = payments.reduce((sum: number, payment: any) => sum + (payment.netPayment || 0), 0)
        
        // Calculate average per farmer
        const farmerCount = new Set(collections.map((c: any) => c.farmerId)).size
        const averagePerFarmer = farmerCount > 0 ? totalAmount / farmerCount : 0
        
        // Get top farmers
        const farmerStats = collections.reduce((acc: any, collection: any) => {
          const farmerId = collection.farmerId
          if (!acc[farmerId]) {
            acc[farmerId] = {
              id: farmerId,
              name: collection.farmers?.name || 'Unknown Farmer',
              liters: 0,
              amount: 0
            }
          }
          acc[farmerId].liters += collection.totalLiters || 0
          acc[farmerId].amount += collection.totalAmount || 0
          return acc
        }, {})
        
        const topFarmers = Object.values(farmerStats)
          .sort((a: any, b: any) => b.amount - a.amount)
          .slice(0, 5)
        
        // Calculate monthly trend (last 6 months)
        const monthlyData: { [key: string]: { liters: number, amount: number, collections: number } } = {}
        collections.forEach((collection: any) => {
          const date = new Date(collection.collectionDate)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { liters: 0, amount: 0, collections: 0 }
          }
          monthlyData[monthKey].liters += collection.totalLiters || 0
          monthlyData[monthKey].amount += collection.totalAmount || 0
          monthlyData[monthKey].collections += 1
        })
        
        const monthlyTrend = Object.entries(monthlyData)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-6)
          .map(([month, data]) => ({
            month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            ...data
          }))
        
        setReportSummary({
          totalCollections,
          totalLiters,
          totalAmount,
          totalPayments,
          averagePerFarmer,
          topFarmers: topFarmers as any,
          monthlyTrend
        })
      } else {
        // Use mock data if API fails
        setReportSummary({
          totalCollections: 112,
          totalLiters: 45600,
          totalAmount: 8640000,
          totalPayments: 7200000,
          averagePerFarmer: 172800,
          topFarmers: [
            { id: 'farmer_1', name: 'NDAGIJIMANA JMV', liters: 2400, amount: 456000 },
            { id: 'farmer_2', name: 'NDABABONYE Vicent', liters: 1800, amount: 342000 },
            { id: 'farmer_3', name: 'HAGENIMANA Samuel', liters: 1600, amount: 304000 },
            { id: 'farmer_4', name: 'NSABIMANA Jean', liters: 1400, amount: 266000 },
            { id: 'farmer_5', name: 'MUKAMANA Marie', liters: 1200, amount: 228000 }
          ],
          monthlyTrend: [
            { month: 'Jul 2024', liters: 7200, amount: 1368000, collections: 18 },
            { month: 'Aug 2024', liters: 7800, amount: 1482000, collections: 19 },
            { month: 'Sep 2024', liters: 8200, amount: 1558000, collections: 20 },
            { month: 'Oct 2024', liters: 8600, amount: 1634000, collections: 21 },
            { month: 'Nov 2024', liters: 9000, amount: 1710000, collections: 22 },
            { month: 'Dec 2024', liters: 9400, amount: 1786000, collections: 23 }
          ]
        })
        toast.error("Failed to fetch report data - showing mock data")
      }
    } catch (error) {
      console.error('Error fetching report summary:', error)
      toast.error("Failed to fetch report data")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchReportSummary()
    setIsRefreshing(false)
    toast.success("Report data refreshed successfully")
  }

  const handleGenerateReport = () => {
    setGenerateReportOpen(true)
  }

  useEffect(() => {
    fetchReportSummary()
  }, [mccId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">Loading Report Data...</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
                <p className="text-gray-600">Comprehensive MCC performance reports and insights</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="lg"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleGenerateReport} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <FileText className="h-5 w-5 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Collections</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Droplets className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-1">{reportSummary?.totalCollections.toLocaleString()}</div>
            <p className="text-sm text-gray-600 font-medium">
              Milk collections recorded
            </p>
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-green-50 border-green-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Liters</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Droplets className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-1">{reportSummary?.totalLiters.toLocaleString()}L</div>
            <p className="text-sm text-gray-600 font-medium">
              Milk volume collected
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Revenue</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 mb-1">{(reportSummary?.totalAmount / 1000000).toFixed(1)}M</div>
            <p className="text-sm text-gray-600 font-medium">
              Total amount generated
            </p>
            <div className="mt-2 flex items-center text-xs text-purple-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-orange-50 border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Payments Made</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 mb-1">{(reportSummary?.totalPayments / 1000000).toFixed(1)}M</div>
            <p className="text-sm text-gray-600 font-medium">
              Total payments processed
            </p>
            <div className="mt-2 flex items-center text-xs text-orange-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              100% completion rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Farmers */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Top Performing Farmers</CardTitle>
                <CardDescription className="text-gray-600 mt-1">Highest milk collection contributors</CardDescription>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {reportSummary?.topFarmers.map((farmer, index) => (
                <div key={farmer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{farmer.name}</div>
                      <div className="text-sm text-gray-500">{farmer.liters.toLocaleString()}L collected</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{farmer.amount.toLocaleString()} Frw</div>
                    <div className="text-xs text-gray-500">Total amount</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Monthly Trend</CardTitle>
                <CardDescription className="text-gray-600 mt-1">Last 6 months performance</CardDescription>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {reportSummary?.monthlyTrend.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{month.month}</div>
                      <div className="text-sm text-gray-500">{month.collections} collections</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{month.liters.toLocaleString()}L</div>
                    <div className="text-xs text-gray-500">{month.amount.toLocaleString()} Frw</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
              <CardDescription className="text-gray-600 mt-1">Generate specific reports and exports</CardDescription>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={handleGenerateReport}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm font-medium">Summary Report</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-green-200 text-green-700 hover:bg-green-50"
              onClick={handleGenerateReport}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm font-medium">Farmer Report</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={handleGenerateReport}
            >
              <DollarSign className="h-6 w-6" />
              <span className="text-sm font-medium">Financial Report</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 border-orange-200 text-orange-700 hover:bg-orange-50"
              onClick={handleGenerateReport}
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm font-medium">Analytics Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate Report Dialog */}
      <GenerateReportForm 
        open={generateReportOpen} 
        onOpenChange={setGenerateReportOpen}
        onSuccess={() => {
          toast.success("Report generated successfully!")
          fetchReportSummary()
        }}
      />
    </div>
  )
}
