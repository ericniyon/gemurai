"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { 
  CreditCard, 
  Package, 
  User, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  Eye,
  Download,
  RefreshCw,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc,
  Shield,
  Banknote,
  Receipt,
  Wallet,
  PiggyBank,
  Target,
  Zap,
  Star,
  Award,
  Trophy,
  Crown,
  Gem,
  Sparkles,
  Table as TableIcon
} from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"

interface StockOrder {
  id: string
  dcc: {
    id: string
    name: string
    email: string
    phone: string
  }
  totalAmount: number
  totalCommission: number
  totalPurchasePrice: number
  totalSalesPrice: number
  status: string
  requestDate: string
  paymentConfirmedAt: string
  paymentConfirmedBy: {
    id: string
    name: string
    email: string
  }
  products: Array<{
    id: string
    productId: string
    quantity: number
    price: number
    commission: number
    totalCommission: number
    purchasePrice: number
    salesPrice: number
    product: {
      id: string
      name: string
      description: string
      price: number
      stock: number
      image: string
      images: string[]
      category: string
      commission: number
    }
  }>
  payment: {
    id: string
    status: string
    amount: number
    method: string
    paidAt: string
    createdAt: string
  }
}

interface FinancialTransactionsData {
  stockOrders: StockOrder[]
  summary: {
    totalOrders: number
    totalAmount: number
    totalCommission: number
    totalPurchasePrice: number
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function FinancialTransactionsClient() {
  const { user, isAuthenticated } = useAuth()
  const [data, setData] = useState<FinancialTransactionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)
  const [sortField, setSortField] = useState<'dcc' | 'amount' | 'commission' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  const fetchFinancialTransactions = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("Gemurai_token") || localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`/api/v1/employer/financial-transactions?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch financial transactions")
      }

      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.message || "Failed to fetch financial transactions")
      }
    } catch (err) {
      console.error("Error fetching financial transactions:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch financial transactions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFinancialTransactions(currentPage)
    }
  }, [isAuthenticated, user, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSort = (field: 'dcc' | 'amount' | 'commission' | 'date') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: 'dcc' | 'amount' | 'commission' | 'date') => {
    if (sortField !== field) {
      return <ChevronDown className="h-4 w-4 text-gray-400" />
    }
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'MOBILE_MONEY':
        return '📱'
      case 'BANK_TRANSFER':
        return '🏦'
      case 'CASH':
        return '💵'
      default:
        return '💳'
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'MOBILE_MONEY':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'BANK_TRANSFER':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CASH':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="card elevated rounded-xl">
            <div className="card-content text-center py-16">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900">Authentication Required</h2>
              <p className="text-gray-600">Please log in to view financial transactions.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (user?.role !== "EMPLOYER" && user?.role !== "BRANCH_MANAGER") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="card elevated rounded-xl">
            <div className="card-content text-center py-16">
              <Shield className="h-16 w-16 mx-auto mb-4 text-orange-500" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900">Access Denied</h2>
              <p className="text-gray-600">Only EMPLOYER and BRANCH_MANAGER users can access financial transactions.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="card elevated rounded-xl p-8 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Financial Transactions
                </h1>
                <p className="text-slate-600 mt-2 text-lg">
                  Track all your financial transactions and revenue
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchFinancialTransactions(currentPage)} 
                disabled={loading}
                className="card bordered hover:scale-105 transition-transform"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                size="sm"
                className="card elevated hover:scale-105 transition-transform"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 text-sm font-medium">Total Orders</p>
                  <p className="text-gray-900 text-3xl font-bold">{data.summary.totalOrders}</p>
                  <p className="text-gray-600 text-xs mt-1">Payment confirmed</p>
                </div>
                <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Receipt className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 text-sm font-medium">Total Revenue</p>
                  <p className="text-gray-900 text-3xl font-bold">{formatCurrency(data.summary.totalAmount)}</p>
                  <p className="text-gray-600 text-xs mt-1">From all orders</p>
                </div>
                <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 text-sm font-medium">Commission Earned</p>
                  <p className="text-gray-900 text-3xl font-bold">{formatCurrency(data.summary.totalCommission)}</p>
                  <p className="text-gray-600 text-xs mt-1">Total earnings</p>
                </div>
                <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center">
                  <PiggyBank className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 text-sm font-medium">Avg Order Value</p>
                  <p className="text-gray-900 text-3xl font-bold">
                    {data.summary.totalOrders > 0 
                      ? formatCurrency(data.summary.totalAmount / data.summary.totalOrders)
                      : formatCurrency(0)
                    }
                  </p>
                  <p className="text-gray-600 text-xs mt-1">Per transaction</p>
                </div>
                <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Target className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Search and Filter */}
        

        {/* Enhanced Loading State */}
        {loading && (
          <div className="card elevated rounded-xl">
            <div className="card-content text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 font-medium">Loading financial transactions...</p>
            </div>
          </div>
        )}

        {/* Enhanced Error State */}
        {error && !loading && (
          <div className="card elevated rounded-xl">
            <div className="card-content text-center py-16">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Error Loading Transactions</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button 
                onClick={() => fetchFinancialTransactions(currentPage)} 
                className="card elevated hover:scale-105 transition-transform"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Redesigned Financial Transactions Table */}
        {data && !loading && (
          <div className="space-y-6">
            {/* Enhanced Controls */}
            <div className="card elevated rounded-xl p-6 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex gap-2">
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                      <Button
                        variant={viewMode === 'cards' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('cards')}
                        className="rounded-none border-0"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className="rounded-none border-0"
                      >
                        <TableIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {data.summary.total} total transactions
                </div>
              </div>
            </div>

            {/* Content based on view mode */}
              {data.stockOrders.length === 0 ? (
              <div className="card elevated rounded-xl">
                <div className="card-content text-center py-16">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 mx-auto mb-6 animate-pulse">
                    <Receipt className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">No Financial Transactions</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You don't have any financial transactions yet. 
                    Transactions will appear here once you have stock orders, payments, or other financial activities.
                  </p>
                </div>
              </div>
            ) : viewMode === 'cards' ? (
              /* Card View */
              <div className="space-y-4">
                {data.stockOrders.map((order, index) => (
                  <div 
                    key={order.id}
                    className="card elevated rounded-xl p-6 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* DCC Information */}
                      <div className="lg:col-span-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-lg">
                            {order.dcc.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{order.dcc.name}</div>
                            <div className="text-sm text-gray-500 truncate">{order.dcc.email}</div>
                            <div className="text-xs text-gray-400">{order.dcc.phone}</div>
                          </div>
                        </div>
                      </div>

                      {/* Products */}
                      <div className="lg:col-span-3">
                        <div className="space-y-2">
                          {order.products.slice(0, 2).map((product) => (
                            <div key={product.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <Package className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span className="font-medium text-gray-900 truncate">{product.product.name}</span>
                              </div>
                              <div className="text-sm text-gray-600 ml-2">
                                × {product.quantity}
                              </div>
                            </div>
                          ))}
                          {order.products.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{order.products.length - 2} more products
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Financial Info */}
                      <div className="lg:col-span-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="font-bold text-lg text-gray-900">{formatCurrency(order.totalAmount)}</div>
                            <div className="text-xs text-gray-500">Total Amount</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              {formatCurrency(order.totalCommission)}
                            </div>
                            <div className="text-xs text-gray-500">Commission</div>
                          </div>
                        </div>
                      </div>

                      {/* Payment & Status */}
                      <div className="lg:col-span-3">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                <span className="text-lg">{getPaymentMethodIcon(order.payment?.method)}</span>
                              </div>
                              <div>
                                <Badge className={`${getPaymentMethodColor(order.payment?.method)} font-medium text-xs`}>
                                  {order.payment?.method?.toLowerCase().replace('_', ' ') || 'Unknown'}
                                </Badge>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-green-200 px-2 py-1 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmed
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(order.paymentConfirmedAt)}
                          </div>
                          <div className="text-xs text-gray-400">
                            by {order.paymentConfirmedBy?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              ) : (
              /* Table View */
              <div className="card elevated rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                          <TableHead className="py-4">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('dcc')}
                              className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent hover:text-blue-600 transition-colors"
                            >
                              DCC
                              {getSortIcon('dcc')}
                            </Button>
                          </TableHead>
                          <TableHead className="py-4">Products</TableHead>
                          <TableHead className="py-4">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('commission')}
                              className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent hover:text-blue-600 transition-colors"
                            >
                              Commission
                              {getSortIcon('commission')}
                            </Button>
                          </TableHead>
                          <TableHead className="py-4">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('amount')}
                              className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent hover:text-blue-600 transition-colors"
                            >
                              Amount
                              {getSortIcon('amount')}
                            </Button>
                          </TableHead>
                          <TableHead className="py-4">Payment Method</TableHead>
                          <TableHead className="py-4">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('date')}
                              className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent hover:text-blue-600 transition-colors"
                            >
                              Confirmed Date
                              {getSortIcon('date')}
                            </Button>
                          </TableHead>
                          <TableHead className="py-4">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.stockOrders.map((order, index) => (
                          <TableRow 
                            key={order.id} 
                            className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                            }`}
                          >
                            <TableCell className="py-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 transition-transform duration-200 hover:scale-110">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{order.dcc.name}</div>
                                  <div className="text-sm text-gray-500">{order.dcc.email}</div>
                                  <div className="text-xs text-gray-400">{order.dcc.phone}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="space-y-2">
                                {order.products.map((product) => (
                                  <div key={product.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-gray-100">
                                    <div className="flex items-center space-x-2">
                                      <Package className="h-4 w-4 text-gray-500" />
                                      <span className="font-medium text-gray-900">{product.product.name}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      × {product.quantity}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-right">
                                <div className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                  {formatCurrency(order.totalCommission)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Commission earned
                                </div>
                                <div className="text-xs text-gray-400">
                                  {order.products.length} product{order.products.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-right">
                                <div className="font-bold text-lg text-gray-900">{formatCurrency(order.totalAmount)}</div>
                                <div className="text-xs text-gray-500">
                                  Total order value
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 transition-transform duration-200 hover:scale-110">
                                  <span className="text-lg">{getPaymentMethodIcon(order.payment?.method)}</span>
                                </div>
                                <div>
                                  <Badge className={`${getPaymentMethodColor(order.payment?.method)} font-medium`}>
                                    {order.payment?.method?.toLowerCase().replace('_', ' ') || 'Unknown'}
                                  </Badge>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {order.payment?.status || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 transition-transform duration-200 hover:scale-110">
                                  <Calendar className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatDate(order.paymentConfirmedAt)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    by {order.paymentConfirmedBy?.name}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1 transition-all duration-200 hover:scale-105">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Confirmed
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
              </div>
            )}

                  {/* Enhanced Pagination */}
                  {data.summary.totalPages > 1 && (
              <div className="card elevated rounded-xl p-6 bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                          Showing page {currentPage} of {data.summary.totalPages} 
                    ({data.summary.total} total transactions)
                        </div>
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => handlePageChange(currentPage - 1)}
                                className={cn(
                                  "transition-all duration-200",
                                  currentPage === 1 
                                    ? "pointer-events-none opacity-50 bg-gray-100" 
                                    : "cursor-pointer hover:bg-gray-200"
                                )}
                              />
                            </PaginationItem>
                            
                            {Array.from({ length: data.summary.totalPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={currentPage === page}
                                  className={cn(
                                    "cursor-pointer transition-all duration-200",
                                    currentPage === page 
                                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                                      : "hover:bg-gray-200"
                                  )}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => handlePageChange(currentPage + 1)}
                                className={cn(
                                  "transition-all duration-200",
                                  currentPage === data.summary.totalPages 
                                    ? "pointer-events-none opacity-50 bg-gray-100" 
                                    : "cursor-pointer hover:bg-gray-200"
                                )}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </div>
                  )}
          </div>
        )}
      </div>
    </div>
  )
}
