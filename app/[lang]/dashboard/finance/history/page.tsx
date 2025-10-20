"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  DollarSign, 
  Search, 
  Filter,
  Download,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Activity,
  Eye,
  RefreshCw
} from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  reference: string
  paymentMethod?: string
  customerName?: string
  customerEmail?: string
}

export default function FinanceHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 500000,
          description: 'Product Sales Revenue',
          category: 'Sales',
          date: new Date().toISOString(),
          status: 'completed',
          reference: 'TXN-2024-001',
          paymentMethod: 'Card Payment',
          customerName: 'Jean Pierre Uwimana',
          customerEmail: 'jean.uwimana@email.com'
        },
        {
          id: '2',
          type: 'expense',
          amount: 150000,
          description: 'Inventory Purchase',
          category: 'Inventory',
          date: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed',
          reference: 'TXN-2024-002',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: '3',
          type: 'income',
          amount: 75000,
          description: 'Service Fee',
          category: 'Services',
          date: new Date(Date.now() - 7200000).toISOString(),
          status: 'pending',
          reference: 'TXN-2024-003',
          paymentMethod: 'Mobile Money',
          customerName: 'Marie Claire Niyonsaba',
          customerEmail: 'marie.niyonsaba@email.com'
        },
        {
          id: '4',
          type: 'expense',
          amount: 25000,
          description: 'Utility Bills',
          category: 'Utilities',
          date: new Date(Date.now() - 10800000).toISOString(),
          status: 'completed',
          reference: 'TXN-2024-004',
          paymentMethod: 'Direct Debit'
        },
        {
          id: '5',
          type: 'income',
          amount: 120000,
          description: 'Consultation Fee',
          category: 'Services',
          date: new Date(Date.now() - 14400000).toISOString(),
          status: 'completed',
          reference: 'TXN-2024-005',
          paymentMethod: 'Cash',
          customerName: 'Emmanuel Ndayisaba',
          customerEmail: 'emmanuel.ndayisaba@email.com'
        },
        {
          id: '6',
          type: 'expense',
          amount: 45000,
          description: 'Office Supplies',
          category: 'Supplies',
          date: new Date(Date.now() - 18000000).toISOString(),
          status: 'completed',
          reference: 'TXN-2024-006',
          paymentMethod: 'Card Payment'
        },
        {
          id: '7',
          type: 'income',
          amount: 200000,
          description: 'Project Payment',
          category: 'Projects',
          date: new Date(Date.now() - 21600000).toISOString(),
          status: 'pending',
          reference: 'TXN-2024-007',
          paymentMethod: 'Bank Transfer',
          customerName: 'Grace Uwamahoro',
          customerEmail: 'grace.uwamahoro@email.com'
        },
        {
          id: '8',
          type: 'expense',
          amount: 80000,
          description: 'Marketing Campaign',
          category: 'Marketing',
          date: new Date(Date.now() - 25200000).toISOString(),
          status: 'completed',
          reference: 'TXN-2024-008',
          paymentMethod: 'Card Payment'
        }
      ]

      setTransactions(mockTransactions)
      setFilteredTransactions(mockTransactions)
      setIsLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    // Filter transactions based on search and filters
    let filtered = transactions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.customerName && transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(transaction => transaction.type === filterType)
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(transaction => transaction.status === filterStatus)
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(transaction => transaction.category === filterCategory)
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [transactions, searchTerm, filterType, filterStatus, filterCategory])

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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategories = () => {
    const categories = [...new Set(transactions.map(t => t.category))]
    return categories
  }

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netAmount = totalIncome - totalExpenses

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <FileText className="absolute inset-0 m-auto w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600">Loading Transaction History...</p>
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
                <p className="text-gray-600 mt-1">View and manage all financial transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <RefreshCw className="w-4 h-4" />
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
                  <p className="text-sm font-medium text-green-600">Total Income</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(totalIncome)}</p>
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
                  <p className="text-sm font-medium text-red-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-900">{formatCurrency(totalExpenses)}</p>
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
                  <p className="text-sm font-medium text-blue-600">Net Amount</p>
                  <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                    {netAmount >= 0 ? '+' : ''}{formatCurrency(netAmount)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Categories</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Activity className="w-5 h-5 text-green-600" />
              Transactions ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                          <div className="text-sm text-gray-500">{transaction.reference}</div>
                          {transaction.customerName && (
                            <div className="text-xs text-gray-400">{transaction.customerName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-xs text-gray-500">{transaction.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {filteredTransactions.length === 0 && (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-sm text-gray-600">
                {searchTerm || filterType !== "all" || filterStatus !== "all" || filterCategory !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No transactions have been recorded yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
