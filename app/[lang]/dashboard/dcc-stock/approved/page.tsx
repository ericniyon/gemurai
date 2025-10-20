"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { 
  Package, 
  Receipt, 
  DollarSign, 
  CheckCircle,
  ArrowLeft,
  FileText,
  Calendar,
  Truck,
  Download,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Zap,
  Target
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StockOrder {
  id: string
  dccId: string
  totalAmount: number
  status: string
  priority: string
  requestDate: string
  estimatedDelivery: string
  notes: string
  approvedBy: string
  approvedAt: string
  paymentConfirmedBy: string
  paymentConfirmedAt: string
  completedBy: string
  completedAt: string
  createdAt: string
  updatedAt: string
  products: StockOrderProduct[]
  payment?: Payment
  dcc: {
    id: string
    name: string
    email: string
  }
}

interface StockOrderProduct {
  id: string
  stockOrderId: string
  productId: string
  quantity: number
  currentStock: number
  requestedStock: number
  price: number
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    price: number
    commission?: number
    sellerId: string
  }
}

interface Payment {
  id: string
  stockOrderId: string
  status: string
  amount: number
  method: string
  reference: string
  paidAt: string
  createdAt: string
  updatedAt: string
}

export default function DCCApprovedOrdersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [approvedOrders, setApprovedOrders] = useState<StockOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<StockOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchApprovedOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [approvedOrders, searchTerm, statusFilter])

  const fetchApprovedOrders = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/v1/stock-orders')
      const data = await response.json()
      
      if (data.success && data.data?.stockOrders) {
        // Filter for approved, payment_confirmed, and completed orders
        const approved = data.data.stockOrders.filter((order: StockOrder) => 
          ['approved', 'payment_confirmed', 'completed'].includes(order.status.toLowerCase())
        )
        setApprovedOrders(approved)
      } else {
        console.warn('No stock orders data received or invalid response format')
        setApprovedOrders([])
      }
    } catch (error) {
      console.error('Error fetching approved orders:', error)
      toast({
        title: "Error",
        description: "Failed to load approved orders",
        variant: "destructive"
      })
      setApprovedOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...approvedOrders]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.some(product => 
          product.product.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount).replace('RF', 'RWF')
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3" />Approved</Badge>
      case 'payment_confirmed':
        return <Badge variant="default" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"><CheckCircle className="h-3 w-3" />Payment Confirmed</Badge>
      case 'completed':
        return <Badge variant="default" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200"><CheckCircle className="h-3 w-3" />Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewOrder = (order: StockOrder) => {
    console.log('Viewing order:', order.id)
    toast({
      title: "Order Details",
      description: `Viewing order #${order.id.slice(-8)}`,
    })
  }

  const handleMakePayment = (order: StockOrder) => {
    console.log('Making payment for order:', order.id)
    toast({
      title: "Payment",
      description: `Redirecting to payment for order #${order.id.slice(-8)}`,
    })
  }

  const handleTrackDelivery = (order: StockOrder) => {
    console.log('Tracking delivery for order:', order.id)
    toast({
      title: "Track Delivery",
      description: `Tracking delivery for order #${order.id.slice(-8)}`,
    })
  }

  const paymentConfirmedOrders = approvedOrders?.filter(order => order.status === 'payment_confirmed') || []
  const completedOrders = approvedOrders?.filter(order => order.status === 'completed') || []
  const justApprovedOrders = approvedOrders?.filter(order => order.status === 'approved') || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="card elevated rounded-xl p-8 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
          <Link href="/en/dashboard/dcc-stock">
                <Button variant="outline" size="sm" className="card bordered hover:scale-105 transition-transform">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stock
            </Button>
          </Link>
          <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Approved Orders
                </h1>
                <p className="text-slate-600 mt-2 text-lg">
                  Track your approved stock orders and manage deliveries
            </p>
          </div>
        </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchApprovedOrders}
                className="card bordered hover:scale-105 transition-transform"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button className="card elevated hover:scale-105 transition-transform">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
            </div>
          </div>
      </div>

        {/* Enhanced Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Total Approved</p>
                <p className="text-gray-900 text-3xl font-bold">{approvedOrders.length}</p>
                <p className="text-gray-600 text-xs mt-1">All approved orders</p>
              </div>
              <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Payment Confirmed</p>
                <p className="text-gray-900 text-3xl font-bold">{paymentConfirmedOrders.length}</p>
                <p className="text-gray-600 text-xs mt-1">Ready for delivery</p>
              </div>
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Completed</p>
                <p className="text-gray-900 text-3xl font-bold">{completedOrders.length}</p>
                <p className="text-gray-600 text-xs mt-1">Successfully delivered</p>
              </div>
              <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center">
                <Truck className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-orange-50 to-red-100 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Awaiting Payment</p>
                <p className="text-gray-900 text-3xl font-bold">{justApprovedOrders.length}</p>
                <p className="text-gray-600 text-xs mt-1">Payment pending</p>
              </div>
              <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
      </div>

        {/* Filters and Search */}
        <div className="card elevated rounded-xl">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
                <p className="text-gray-600">Filter and search your approved orders</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {justApprovedOrders.length} Awaiting Payment
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {paymentConfirmedOrders.length} Payment Confirmed
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {completedOrders.length} Completed
                </Badge>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="payment_confirmed">Payment Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
                      </div>
                        </div>
                      </div>
                    </div>
                    
        {/* Enhanced Approved Orders Table */}
        <div className="card elevated rounded-xl">
          <div className="card-content p-0">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-4 text-lg">Loading approved orders...</p>
              </div>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Order Details
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
                              <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                Order #{order.id.slice(-8)}
                      </div>
                              <div className="text-sm text-gray-500">
                                Approved: {formatDate(order.approvedAt)}
                    </div>
                  </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">{order.products.length} items</div>
                            <div className="text-gray-500 space-y-1">
                              {order.products.map((product, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="truncate max-w-[200px]">
                                    {product.product?.name || 'Unknown Product'}
                                  </span>
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
                                    {product.quantity} units
                                  </span>
                        </div>
                      ))}
                    </div>
                  </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(order.totalAmount)}
                      </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4">
                          {order.payment ? (
                            <Badge variant={order.payment.status === 'CONFIRMED' ? 'default' : 'secondary'} className="text-xs">
                            {order.payment.status}
                          </Badge>
                          ) : (
                            <span className="text-xs text-gray-500">No payment</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {order.status === 'approved' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs text-green-600 hover:text-green-800 hover:bg-green-50 hover:border-green-300 transition-colors"
                                onClick={() => handleMakePayment(order)}
                              >
                                <DollarSign className="h-3 w-3 mr-1" />
                                Pay
                              </Button>
                            )}
                            {order.status === 'payment_confirmed' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                onClick={() => handleTrackDelivery(order)}
                              >
                                <Truck className="h-3 w-3 mr-1" />
                                Track
                              </Button>
                            )}
                      </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                      </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Approved Orders Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "all" 
                    ? "No orders match your current filters. Try adjusting your search criteria."
                    : "You haven't received any approved orders yet. Check back later for updates."
                  }
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Link href="/en/dashboard/dcc-stock/orders">
                    <Button className="card elevated hover:scale-105 transition-transform">
                      <Receipt className="h-4 w-4 mr-2" />
                      View All Orders
                    </Button>
                  </Link>
                )}
                        </div>
                      )}
                    </div>
                  </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="card elevated rounded-xl">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                        </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber
                      if (totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i
                      } else {
                        pageNumber = currentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNumber)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNumber}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            </div>
          )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card elevated rounded-xl hover:scale-105 transition-transform cursor-pointer group">
            <div className="card-content text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Receipt className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">All Orders</h3>
              <p className="text-gray-600 mb-6">
                View all your stock orders including pending ones
              </p>
              <Link href="/en/dashboard/dcc-stock/orders">
                <Button variant="outline" className="w-full card bordered">
                  View All Orders
                </Button>
              </Link>
            </div>
          </div>

          <div className="card elevated rounded-xl hover:scale-105 transition-transform cursor-pointer group">
            <div className="card-content text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">My Stock</h3>
              <p className="text-gray-600 mb-6">
                View your current inventory and stock levels
              </p>
              <Link href="/en/dashboard/dcc-stock/inventory">
                <Button variant="outline" className="w-full card bordered">
                  View Inventory
                </Button>
              </Link>
            </div>
          </div>

          <div className="card elevated rounded-xl hover:scale-105 transition-transform cursor-pointer group">
            <div className="card-content text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Order Analytics</h3>
              <p className="text-gray-600 mb-6">
                View detailed analytics and insights
              </p>
              <Button variant="outline" className="w-full card bordered">
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
