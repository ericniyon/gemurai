"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Package,
  Users,
  Wallet,
  BarChart3,
  MoreHorizontal,
  Eye,
  FileText,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface Transaction {
  id: string
  type: 'DEPOSIT' | 'WITHDRAWAL'
  amount: number
  status: string
  description?: string
  createdAt: string
  wallet?: {
    user: {
      id: string
      name: string
      email: string
      phone?: string
      dccProfile?: {
        id: string
        location?: string
        businessName?: string
        businessType?: string
      }
    }
  }
}

interface Sale {
  id: string
  productId: string
  quantity: number
  salePrice: number
  totalRevenue: number
  profit: number
  customerName?: string
  customerPhone?: string
  saleDate: string
  createdAt: string
  product: {
    name: string
    image?: string
  }
}

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [activeTab, setActiveTab] = useState<'transactions' | 'sales'>('transactions')
  const [showFilters, setShowFilters] = useState(false)
  
  const params = useParams()
  const router = useRouter()
  const ITEMS_PER_PAGE = 20

  // Function to format transaction description
  const formatTransactionDescription = (description: string, type: string) => {
    if (!description) return ''
    
    // Handle stock order payment descriptions
    if (description.includes('Payment confirmed for stock order')) {
      const match = description.match(/Payment confirmed for stock order #([a-zA-Z0-9]+) from DCC (.+)/)
      if (match) {
        const orderId = match[1]
        const dccEmail = match[2]
        return `Payment from ${dccEmail} for order #${orderId}`
      }
    }
    
    // Handle other payment descriptions
    if (description.includes('from DCC')) {
      const match = description.match(/(.+) from DCC (.+)/)
      if (match) {
        const action = match[1]
        const dccEmail = match[2]
        return `${action} from ${dccEmail}`
      }
    }
    
    // Handle deposit descriptions
    if (description.includes('Deposit')) {
      return `Deposit to wallet`
    }
    
    // Handle withdrawal descriptions
    if (description.includes('Withdrawal')) {
      return `Withdrawal from wallet`
    }
    
    // Return original description if no patterns match
    return description
  }

  const fetchTransactions = async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        throw new Error("No auth token found")
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(dateFilter !== "all" && { date: dateFilter })
      })

      const response = await fetch(`/api/wallet/transactions?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.data || [])
        setSales(data.sales || [])
        setTotalTransactions(data.pagination?.total || 0)
        setTotalPages(Math.ceil((data.pagination?.total || 0) / ITEMS_PER_PAGE))
      } else {
        throw new Error(data.message || "Failed to fetch transactions")
      }
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch transactions")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions(currentPage)
  }, [currentPage, searchTerm, statusFilter, typeFilter, dateFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value)
        break
      case 'type':
        setTypeFilter(value)
        break
      case 'date':
        setDateFilter(value)
        break
    }
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
    setDateFilter("all")
    setCurrentPage(1)
  }

  const exportTransactions = () => {
    // TODO: Implement CSV export functionality
    console.log('Export transactions')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return { date: 'Today', time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
    } else if (diffDays === 2) {
      return { date: 'Yesterday', time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
    } else if (diffDays <= 7) {
      return { date: date.toLocaleDateString('en-US', { weekday: 'long' }), time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
    } else {
      return { date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
    }
  }

  const getTransactionIcon = (type: string) => {
    if (type === 'DEPOSIT') {
      return (
        <div className="p-3 bg-green-100 rounded-xl">
          <ArrowUpRight className="w-5 h-5 text-green-600" />
        </div>
      )
    } else {
      return (
        <div className="p-3 bg-red-100 rounded-xl">
          <ArrowDownRight className="w-5 h-5 text-red-600" />
        </div>
      )
    }
  }

  const getTransactionColor = (type: string) => {
    return type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <Badge className={`text-xs ${config.color}`}>
        {config.text}
      </Badge>
    )
  }

  // Calculate summary stats
  const totalDeposits = transactions
    .filter(t => t.type === 'DEPOSIT' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalWithdrawals = transactions
    .filter(t => t.type === 'WITHDRAWAL' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalSales = sales.reduce((sum, s) => sum + s.totalRevenue, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
                <p className="text-gray-600 mt-1">Complete overview of your financial activities</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={exportTransactions}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                onClick={() => fetchTransactions(currentPage)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Deposits</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(totalDeposits)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Total Withdrawals</p>
                  <p className="text-2xl font-bold text-red-900">{formatCurrency(totalWithdrawals)}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Sales</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalSales)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="mb-6 border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Filters & Search</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-600"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={(value) => handleFilterChange('type', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="DEPOSIT">Deposits</SelectItem>
                    <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={(value) => handleFilterChange('date', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'transactions'
                ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Transactions ({totalTransactions})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'sales'
                ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-4 h-4" />
              Sales ({sales.length})
            </div>
          </button>
        </div>

        {/* Content */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {activeTab === 'transactions' ? 'Transaction History' : 'Sales History'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {activeTab === 'transactions' 
                    ? `Showing ${transactions.length} of ${totalTransactions} transactions`
                    : `Showing ${sales.length} recent sales`
                  }
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error && (
              <div className="p-6 bg-red-50 border-b border-red-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {isLoading && (activeTab === 'transactions' ? transactions.length === 0 : sales.length === 0) ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <Activity className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600">Loading {activeTab}...</p>
                </div>
              </div>
            ) : activeTab === 'transactions' ? (
              transactions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    {searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all"
                      ? "Try adjusting your filters or search terms to find what you're looking for."
                      : "Your transaction history will appear here once you make your first transaction."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {transactions.map((transaction) => {
                    const { date, time } = formatDate(transaction.createdAt)
                    return (
                      <div
                        key={transaction.id}
                        className="p-6 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex items-start gap-4">
                          {getTransactionIcon(transaction.type)}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <h4 className="text-sm font-semibold text-gray-900 capitalize">
                                  {transaction.type.toLowerCase()}
                                </h4>
                                {getStatusBadge(transaction.status)}
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                                  {transaction.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </div>
                              </div>
                            </div>
                            
                            {transaction.description && (
                              <p className="text-sm text-gray-600 mb-3">
                                {formatTransactionDescription(transaction.description, transaction.type)}
                              </p>
                            )}

                            {/* DCC Information */}
                            {transaction.wallet?.user && (
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-3">
                                <h5 className="text-xs font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  DCC Information
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-gray-900">{transaction.wallet.user.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    <span className="text-gray-700">{transaction.wallet.user.email}</span>
                                  </div>
                                  {transaction.wallet.user.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-4 h-4 text-blue-600" />
                                      <span className="text-gray-700">{transaction.wallet.user.phone}</span>
                                    </div>
                                  )}
                                  {transaction.wallet.user.dccProfile?.location && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-blue-600" />
                                      <span className="text-gray-700">{transaction.wallet.user.dccProfile.location}</span>
                                    </div>
                                  )}
                                  {transaction.wallet.user.dccProfile?.businessName && (
                                    <div className="flex items-center gap-2">
                                      <Building className="w-4 h-4 text-blue-600" />
                                      <span className="text-gray-700">{transaction.wallet.user.dccProfile.businessName}</span>
                                    </div>
                                  )}
                                  {transaction.wallet.user.dccProfile?.businessType && (
                                    <div className="flex items-center gap-2">
                                      <Building className="w-4 h-4 text-blue-600" />
                                      <span className="text-gray-700">{transaction.wallet.user.dccProfile.businessType}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              // Sales Tab
              sales.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
                  <p className="text-sm text-gray-600">
                    Your sales history will appear here once you make your first sale.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sales.map((sale) => {
                    const { date, time } = formatDate(sale.createdAt)
                    return (
                      <div
                        key={sale.id}
                        className="p-6 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-green-100 rounded-xl">
                            <Package className="w-5 h-5 text-green-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {sale.product.name}
                              </h4>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  +{formatCurrency(sale.totalRevenue)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Profit: {formatCurrency(sale.profit)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Quantity:</span>
                                <span className="font-medium text-gray-900">{sale.quantity}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Price:</span>
                                <span className="font-medium text-gray-900">{formatCurrency(sale.salePrice)}</span>
                              </div>
                              {sale.customerName && (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">{sale.customerName}</span>
                                </div>
                              )}
                              {sale.customerPhone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">{sale.customerPhone}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* Pagination - Only for transactions */}
            {activeTab === 'transactions' && totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
