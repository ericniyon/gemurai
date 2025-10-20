"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Users,
  Droplets,
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Activity,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"

interface ViewAnalyticsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface AnalyticsData {
  overview: {
    totalFarmers: number
    activeFarmers: number
    totalMilkCollected: number
    totalAmountPaid: number
    averageMilkPerFarmer: number
    currentPeriod: number
    pendingPayments: number
    completedPeriods: number
  }
  trends: {
    period: number
    totalMilk: number
    totalAmount: number
    farmerCount: number
  }[]
  topPerformers: {
    id: string
    name: string
    farmerNumber: number
    totalMilk: number
    totalAmount: number
    growth: number
  }[]
  deductions: {
    category: string
    amount: number
    percentage: number
  }[]
  districts: {
    name: string
    farmers: number
    milkCollected: number
    totalAmount: number
  }[]
  monthlyTrends: {
    month: string
    milkCollected: number
    amountPaid: number
    farmers: number
  }[]
}

export function ViewAnalytics({ open, onOpenChange, onSuccess }: ViewAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedView, setSelectedView] = useState('overview')

  const periods = [
    { value: 'all', label: 'All Time' },
    { value: 'current', label: 'Current Period' },
    { value: 'last3', label: 'Last 3 Periods' },
    { value: 'last6', label: 'Last 6 Periods' },
    { value: 'year', label: 'This Year' }
  ]

  const views = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'trends', label: 'Trends', icon: TrendingUp },
    { value: 'performers', label: 'Top Performers', icon: Award },
    { value: 'deductions', label: 'Deductions', icon: PieChart },
    { value: 'districts', label: 'By District', icon: Users },
    { value: 'monthly', label: 'Monthly Trends', icon: Calendar }
  ]

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock data based on Excel analysis
      setAnalyticsData({
        overview: {
          totalFarmers: 36,
          activeFarmers: 34,
          totalMilkCollected: 161370,
          totalAmountPaid: 15350350,
          averageMilkPerFarmer: 4361,
          currentPeriod: 1,
          pendingPayments: 5,
          completedPeriods: 12
        },
        trends: [
          { period: 1, totalMilk: 161370, totalAmount: 15350350, farmerCount: 36 },
          { period: 2, totalMilk: 158420, totalAmount: 15099900, farmerCount: 35 },
          { period: 3, totalMilk: 162150, totalAmount: 15404250, farmerCount: 36 },
          { period: 4, totalMilk: 159800, totalAmount: 15181000, farmerCount: 35 },
          { period: 5, totalMilk: 164200, totalAmount: 15599000, farmerCount: 37 }
        ],
        topPerformers: [
          { id: "1", name: "NDAGIJIMANA JMV", farmerNumber: 1, totalMilk: 4234, totalAmount: 804460, growth: 12.5 },
          { id: "4", name: "NIZEYIMANA Jean Baptiste", farmerNumber: 4, totalMilk: 4613, totalAmount: 876470, growth: 8.3 },
          { id: "8", name: "NSENGIYUMVA Alphonse", farmerNumber: 8, totalMilk: 5124, totalAmount: 973560, growth: 15.2 },
          { id: "6", name: "UMUHIRE Said", farmerNumber: 6, totalMilk: 4588, totalAmount: 871720, growth: 6.7 },
          { id: "2", name: "NDABABONYE Vicent", farmerNumber: 2, totalMilk: 1090, totalAmount: 207100, growth: 4.1 }
        ],
        deductions: [
          { category: "Depannage", amount: 204200, percentage: 14.6 },
          { category: "Ibipande", amount: 117700, percentage: 8.4 },
          { category: "Essence", amount: 51800, percentage: 3.7 },
          { category: "Imiti", amount: 334800, percentage: 24.0 },
          { category: "Avance", amount: 840000, percentage: 60.2 }
        ],
        districts: [
          { name: "Kicukiro", farmers: 8, milkCollected: 45000, totalAmount: 8550000 },
          { name: "Gasabo", farmers: 12, milkCollected: 68000, totalAmount: 12920000 },
          { name: "Nyarugenge", farmers: 6, milkCollected: 32000, totalAmount: 6080000 },
          { name: "Bugesera", farmers: 10, milkCollected: 16370, totalAmount: 3110300 }
        ],
        monthlyTrends: [
          { month: "Jan", milkCollected: 45000, amountPaid: 8550000, farmers: 35 },
          { month: "Feb", milkCollected: 42000, amountPaid: 7980000, farmers: 34 },
          { month: "Mar", milkCollected: 48000, amountPaid: 9120000, farmers: 36 },
          { month: "Apr", milkCollected: 46000, amountPaid: 8740000, farmers: 35 },
          { month: "May", milkCollected: 50000, amountPaid: 9500000, farmers: 37 },
          { month: "Jun", milkCollected: 47000, amountPaid: 8930000, farmers: 36 }
        ]
      })
      
    } catch (error) {
      toast.error("Failed to load analytics data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchAnalytics()
    }
  }, [open, selectedPeriod])

  const handleRefresh = () => {
    fetchAnalytics()
    toast.success("Analytics data refreshed")
  }

  const handleExport = () => {
    toast.success("Exporting analytics data...")
    // TODO: Implement export functionality
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">MCC Analytics Dashboard</h2>
                <p className="text-sm text-gray-500">Comprehensive analytics and insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period.value} value={period.value}>{period.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <div className="flex space-x-1">
            {views.map(view => (
              <Button
                key={view.value}
                variant={selectedView === view.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedView(view.value)}
                className="flex items-center gap-2"
              >
                <view.icon className="h-4 w-4" />
                {view.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading analytics data...</p>
              </div>
            </div>
          ) : analyticsData ? (
            <>
              {/* Overview Tab */}
              {selectedView === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Farmers</p>
                            <p className="text-2xl font-semibold text-gray-900">{analyticsData.overview.totalFarmers}</p>
                            <p className="text-xs text-green-600">{analyticsData.overview.activeFarmers} active</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Droplets className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Milk Collected</p>
                            <p className="text-2xl font-semibold text-gray-900">{(analyticsData.overview.totalMilkCollected / 1000).toFixed(1)}k L</p>
                            <p className="text-xs text-gray-500">Total liters</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Amount</p>
                            <p className="text-2xl font-semibold text-gray-900">{(analyticsData.overview.totalAmountPaid / 1000000).toFixed(1)}M Frw</p>
                            <p className="text-xs text-gray-500">Paid to farmers</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-orange-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Avg per Farmer</p>
                            <p className="text-2xl font-semibold text-gray-900">{analyticsData.overview.averageMilkPerFarmer.toLocaleString()} L</p>
                            <p className="text-xs text-gray-500">Per farmer</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Indicators */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-green-600" />
                          Performance Indicators
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Collection Rate</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                            </div>
                            <span className="text-sm font-medium">94%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Payment Accuracy</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                            </div>
                            <span className="text-sm font-medium">98%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Farmer Satisfaction</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                            <span className="text-sm font-medium">92%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          Alerts & Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-50 border border-red-200">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <div>
                            <p className="text-sm font-medium text-red-900">Pending Payments</p>
                            <p className="text-xs text-red-600">{analyticsData.overview.pendingPayments} farmers waiting</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <div>
                            <p className="text-sm font-medium text-yellow-900">Period Ending</p>
                            <p className="text-xs text-yellow-600">Current period ends in 3 days</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-900">System Status</p>
                            <p className="text-xs text-green-600">All systems operational</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Top Performers Tab */}
              {selectedView === 'performers' && (
                <div className="space-y-6">
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-600" />
                        Top Performing Farmers
                      </CardTitle>
                      <CardDescription>Farmers with highest milk collection and growth</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.topPerformers.map((farmer, index) => (
                          <div key={farmer.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-yellow-600">#{index + 1}</span>
                              </div>
                              <div>
                                <p className="font-medium">{farmer.name}</p>
                                <p className="text-sm text-gray-500">Farmer #{farmer.farmerNumber}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{farmer.totalMilk.toLocaleString()} L</p>
                              <p className="text-sm text-gray-500">{farmer.totalAmount.toLocaleString()} Frw</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                +{farmer.growth}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Deductions Tab */}
              {selectedView === 'deductions' && (
                <div className="space-y-6">
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-red-600" />
                        Deduction Analysis
                      </CardTitle>
                      <CardDescription>Breakdown of deductions by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.deductions.map((deduction, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-4">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${index * 40}, 70%, 50%)` }}></div>
                              <div>
                                <p className="font-medium">{deduction.category}</p>
                                <p className="text-sm text-gray-500">{deduction.percentage}% of total</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{deduction.amount.toLocaleString()} Frw</p>
                              <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="h-2 rounded-full" 
                                  style={{ 
                                    width: `${deduction.percentage}%`,
                                    backgroundColor: `hsl(${index * 40}, 70%, 50%)`
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Districts Tab */}
              {selectedView === 'districts' && (
                <div className="space-y-6">
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Performance by District
                      </CardTitle>
                      <CardDescription>MCC performance breakdown by district</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.districts.map((district, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">{district.farmers}</span>
                              </div>
                              <div>
                                <p className="font-medium">{district.name}</p>
                                <p className="text-sm text-gray-500">{district.farmers} farmers</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{district.milkCollected.toLocaleString()} L</p>
                              <p className="text-sm text-gray-500">{district.totalAmount.toLocaleString()} Frw</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Monthly Trends Tab */}
              {selectedView === 'monthly' && (
                <div className="space-y-6">
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        Monthly Trends
                      </CardTitle>
                      <CardDescription>Monthly performance trends over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.monthlyTrends.map((month, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-medium text-green-600">{month.month}</span>
                              </div>
                              <div>
                                <p className="font-medium">{month.month} 2024</p>
                                <p className="text-sm text-gray-500">{month.farmers} farmers</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{month.milkCollected.toLocaleString()} L</p>
                              <p className="text-sm text-gray-500">{month.amountPaid.toLocaleString()} Frw</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
              <p className="text-gray-500">Unable to load analytics data. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}




