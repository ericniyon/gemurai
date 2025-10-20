"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CreditCard, 
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Download,
  Filter,
  Search
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface FinancialMetrics {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  pendingPayments: number
  monthlyGrowth: number
  profitMargin: number
  averageTransaction: number
  totalTransactions: number
}

interface RecentTransaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  reference: string
}

interface FinancialChart {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export default function FinanceOverviewPage() {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingPayments: 0,
    monthlyGrowth: 0,
    profitMargin: 0,
    averageTransaction: 0,
    totalTransactions: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [chartData, setChartData] = useState<FinancialChart[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setMetrics({
        totalRevenue: 2847500,
        totalExpenses: 1850000,
        netProfit: 997500,
        pendingPayments: 125000,
        monthlyGrowth: 12.5,
        profitMargin: 35.0,
        averageTransaction: 45000,
        totalTransactions: 892
      })
      
      setRecentTransactions([
        {
          id: '1',
          type: 'income',
          category: 'Product Sales',
          amount: 75000,
          description: 'Payment for inventory items',
          date: new Date().toISOString(),
          status: 'completed',
          reference: 'INV-2024-001'
        },
        {
          id: '2',
          type: 'expense',
          category: 'Operating Costs',
          amount: 25000,
          description: 'Monthly rent payment',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed',
          reference: 'EXP-2024-001'
        },
        {
          id: '3',
          type: 'income',
          category: 'Service Fees',
          amount: 50000,
          description: 'Digital service commission',
          date: new Date(Date.now() - 172800000).toISOString(),
          status: 'pending',
          reference: 'SRV-2024-001'
        },
        {
          id: '4',
          type: 'expense',
          category: 'Utilities',
          amount: 15000,
          description: 'Electricity and internet bills',
          date: new Date(Date.now() - 259200000).toISOString(),
          status: 'completed',
          reference: 'UTL-2024-001'
        }
      ])
      
      setChartData([
        { month: 'Jan', revenue: 1800000, expenses: 1200000, profit: 600000 },
        { month: 'Feb', revenue: 2100000, expenses: 1400000, profit: 700000 },
        { month: 'Mar', revenue: 1950000, expenses: 1300000, profit: 650000 },
        { month: 'Apr', revenue: 2200000, expenses: 1500000, profit: 700000 },
        { month: 'May', revenue: 2400000, expenses: 1600000, profit: 800000 },
        { month: 'Jun', revenue: 2847500, expenses: 1850000, profit: 997500 }
      ])
      
      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Completed</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <Activity className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Finance Overview</h3>
            <p className="text-sm text-gray-600">Preparing your financial analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Finance Overview
                  </h1>
                  <p className="text-gray-600 mt-1 text-lg">Comprehensive financial analytics and insights</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2 border-gray-300 hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg">
                <Plus className="w-4 h-4" />
                New Transaction
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-green-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-emerald-700">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-900">{formatCurrency(metrics.totalRevenue)}</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-600">+{metrics.monthlyGrowth}% this month</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-pink-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-700">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-900">{formatCurrency(metrics.totalExpenses)}</p>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">-8.2% vs last month</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Banknote className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-700">Net Profit</p>
                  <p className="text-3xl font-bold text-blue-900">{formatCurrency(metrics.netProfit)}</p>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600">{metrics.profitMargin}% margin</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 to-orange-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-700">Pending Payments</p>
                  <p className="text-3xl font-bold text-amber-900">{formatCurrency(metrics.pendingPayments)}</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-600">{metrics.totalTransactions} transactions</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Financial Performance Chart */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Financial Performance</div>
                    <div className="text-sm text-gray-600">6-month revenue, expenses & profit trends</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Chart Placeholder */}
                  <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">Interactive chart would be displayed here</p>
                      <p className="text-xs text-gray-500">Revenue, Expenses, and Profit trends</p>
                    </div>
                  </div>
                  
                  {/* Chart Legend */}
                  <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Expenses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Profit</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-100/50 rounded-t-xl">
                <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    onClick={() => router.push(`/${params.lang}/dashboard/finance/request`)}
                    className="w-full justify-start bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Request Payment
                  </Button>
                  <Button 
                    onClick={() => router.push(`/${params.lang}/dashboard/finance/history`)}
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-100/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Financial Summary</div>
                    <div className="text-sm text-gray-600">Key performance indicators</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-medium text-emerald-900">Profit Margin</span>
                    <span className="text-lg font-bold text-emerald-900">{metrics.profitMargin}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">Avg Transaction</span>
                    <span className="text-lg font-bold text-blue-900">{formatCurrency(metrics.averageTransaction)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="text-sm font-medium text-amber-900">Growth Rate</span>
                    <span className="text-lg font-bold text-amber-900">+{metrics.monthlyGrowth}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mt-8">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Recent Transactions</CardTitle>
                  <p className="text-sm text-gray-600">Latest financial activities</p>
                </div>
              </div>
              <Button 
                onClick={() => router.push(`/${params.lang}/dashboard/finance/history`)}
                variant="outline" 
                className="flex items-center gap-2"
              >
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                          {transaction.category}
                        </h4>
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                        <p className="text-xs text-gray-500">Ref: {transaction.reference}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className={`text-lg font-bold ${transaction.type === 'income' ? 'text-emerald-900' : 'text-red-900'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        {getStatusBadge(transaction.status)}
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
