"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet,
  BarChart3,
  FileText,
  Calendar,
  ArrowRight,
  Activity
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface FinanceStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  pendingPayments: number
  completedTransactions: number
  monthlyGrowth: number
}

interface RecentTransaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  category: string
}

export default function FinanceDashboard() {
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingPayments: 0,
    completedTransactions: 0,
    monthlyGrowth: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalRevenue: 28475000,
        totalExpenses: 15680000,
        netProfit: 12795000,
        pendingPayments: 2340000,
        completedTransactions: 892,
        monthlyGrowth: 12.5
      })

      setRecentTransactions([
        {
          id: '1',
          type: 'income',
          amount: 500000,
          description: 'Product Sales Revenue',
          date: new Date().toISOString(),
          status: 'completed',
          category: 'Sales'
        },
        {
          id: '2',
          type: 'expense',
          amount: 150000,
          description: 'Inventory Purchase',
          date: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed',
          category: 'Inventory'
        },
        {
          id: '3',
          type: 'income',
          amount: 75000,
          description: 'Service Fee',
          date: new Date(Date.now() - 7200000).toISOString(),
          status: 'pending',
          category: 'Services'
        },
        {
          id: '4',
          type: 'expense',
          amount: 25000,
          description: 'Utility Bills',
          date: new Date(Date.now() - 10800000).toISOString(),
          status: 'completed',
          category: 'Utilities'
        }
      ])

      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <DollarSign className="absolute inset-0 m-auto w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600">Loading Finance Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your financial data and transactions</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Export Report
              </Button>
              <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <FileText className="w-4 h-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalRevenue)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">+{stats.monthlyGrowth}%</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-900">{formatCurrency(stats.totalExpenses)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">-8.2%</span>
                  </div>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <CreditCard className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.netProfit)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600">+15.3%</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-900">{formatCurrency(stats.pendingPayments)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Activity className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">{stats.completedTransactions} transactions</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Wallet className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href={`/${lang}/dashboard/finance/history`}>
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                    <p className="text-sm text-gray-600">View all financial transactions</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/${lang}/dashboard/finance/reports`}>
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Financial Reports</h3>
                    <p className="text-sm text-gray-600">Generate detailed reports</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/${lang}/dashboard/finance/analytics`}>
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                    <p className="text-sm text-gray-600">Financial insights and trends</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Transactions */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Activity className="w-5 h-5 text-green-600" />
                Recent Transactions
              </CardTitle>
              <Link href={`/${lang}/dashboard/finance/history`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{transaction.description}</h4>
                        <p className="text-sm text-gray-600">{transaction.category}</p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(transaction.status)}
                      </div>
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
