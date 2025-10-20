"use client"

import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { 
  Package, 
  Receipt, 
  DollarSign, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Plus,
  FileText,
  Calendar,
  User,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  TrendingUp,
  BarChart3,
  Zap,
  Target,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Truck,
  Home,
  Store,
  RefreshCw as Exchange,
  ArrowRightLeft,
  CreditCard,
  CheckSquare
} from "lucide-react"
import Link from "next/link"
// Dialog components already imported above
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

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
  rejectedBy: string
  rejectedAt: string
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

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  commission: number
  sellerId: string
  minOrderQuantity?: number
}

interface OrderFormData {
  products: Array<{
    productId: string
    quantity: number
    price: number
  }>
  voucherCode: string
  useVoucher: boolean
}

interface ExchangeRequest {
  id: string
  dccId: string
  stockOrderId: string
  currentProductId: string
  requestedProductId: string
  currentQuantity: number
  requestedQuantity: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  currentProduct: {
    id: string
    name: string
    price: number
  }
  requestedProduct: {
    id: string
    name: string
    price: number
  }
}

interface ExchangeFormData {
  currentProductId: string
  requestedProductId: string
  currentQuantity: number
  requestedQuantity: number
  reason: string
}

export default function DCCStockOrdersPage() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [stockOrders, setStockOrders] = useState<StockOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<StockOrder[]>([])
  const [exchangeRequests, setExchangeRequests] = useState<ExchangeRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false)
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<StockOrder | null>(null)
  const [selectedOrderForView, setSelectedOrderForView] = useState<StockOrder | null>(null)
  const [selectedOrderForExchange, setSelectedOrderForExchange] = useState<StockOrder | null>(null)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [isProductsLoading, setIsProductsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orderFormData, setOrderFormData] = useState<OrderFormData>({
    products: [{ productId: '', quantity: 1, price: 0 }],
    voucherCode: '',
    useVoucher: false
  })
  
  const [exchangeFormData, setExchangeFormData] = useState<ExchangeFormData>({
    currentProductId: '',
    requestedProductId: '',
    currentQuantity: 1,
    requestedQuantity: 1,
    reason: ''
  })
  
  // Voucher validation state
  const [voucherValidation, setVoucherValidation] = useState<{
    isValid: boolean
    voucher?: any
    error?: string
  }>({ isValid: false })
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'orders' | 'exchange-requests'>('orders')
  
  // Action loading states
  const [loadingActions, setLoadingActions] = useState<{
    [orderId: string]: {
      paymentConfirm?: boolean
      complete?: boolean
      received?: boolean
      cancel?: boolean
    }
  }>({})
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [payingOrder, setPayingOrder] = useState<any | null>(null)

  // Payment reminder banner visibility
  const [showPaymentReminder, setShowPaymentReminder] = useState(true)

  useEffect(() => {
    fetchStockOrders()
    fetchAvailableProducts()
    fetchExchangeRequests()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [stockOrders, searchTerm, statusFilter, exchangeRequests])

  // Compute pending payment orders and control reminder visibility
  const pendingPaymentOrders = (stockOrders || []).filter((o: any) => o?.payment?.status === 'PENDING')

  const getPaymentTimeRemaining = (order: any) => {
    try {
      const created = new Date(order.createdAt).getTime()
      const deadline = created + 24 * 60 * 60 * 1000
      const remainingMs = deadline - Date.now()
      if (remainingMs <= 0) return 'Overdue'
      const hours = Math.floor(remainingMs / (60 * 60 * 1000))
      const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000))
      return `${hours}h ${minutes}m`
    } catch {
      return '24h'
    }
  }

  const fetchStockOrders = async () => {
    try {
      setIsLoading(true)
      
      console.log('Fetching stock orders for user:', user?.id)
      
      const response = await fetch('/api/v1/stock-orders')
      const data = await response.json()
      
      console.log('Stock orders API response:', data)
      
      if (data.success && data.data) {
        setStockOrders(data.data)
        console.log('Stock orders loaded:', data.data.length)
      } else {
        console.warn('No stock orders data received or invalid response format')
        setStockOrders([])
      }
    } catch (error) {
      console.error('Error fetching stock orders:', error)
      toast({
        title: "Error",
        description: "Failed to load stock orders",
        variant: "destructive"
      })
      setStockOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableProducts = async () => {
    try {
      setIsProductsLoading(true)
      
      // Get auth token for the request
      const token = localStorage.getItem("Gemurai_token")
      
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      console.log('Products API response:', data)
      
      if (data.success && data.products) {
        setAvailableProducts(data.products)
        console.log('Available products loaded:', data.products.length)
      } else {
        console.warn('No products data received')
        setAvailableProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setAvailableProducts([])
    } finally {
      setIsProductsLoading(false)
    }
  }

  const fetchExchangeRequests = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      
      const response = await fetch('/api/v1/stock-orders/exchange-request', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      console.log('[EXCHANGE_REQUESTS] API response:', data)
      
      if (data.success && data.data) {
        const requests = data.data || []
        setExchangeRequests(requests)
        console.log('[EXCHANGE_REQUESTS] Exchange requests loaded:', requests.length)
        console.log('[EXCHANGE_REQUESTS] Stock order IDs with exchange requests:', requests.map(req => req.stockOrderId))
        
        // Verify that all exchange requests have valid stockOrderId
        const invalidRequests = requests.filter(req => !req.stockOrderId)
        if (invalidRequests.length > 0) {
          console.error('[EXCHANGE_REQUESTS] ERROR: Found exchange requests without stockOrderId:', invalidRequests)
        }
      } else {
        console.warn('[EXCHANGE_REQUESTS] No exchange requests data received')
        setExchangeRequests([])
      }
    } catch (error) {
      console.error('[EXCHANGE_REQUESTS] Error fetching exchange requests:', error)
      setExchangeRequests([])
    }
  }

  const verifyFiltering = () => {
    console.log('=== VERIFICATION REPORT ===')
    console.log('Total stock orders:', stockOrders.length)
    console.log('Total exchange requests:', exchangeRequests.length)
    console.log('Filtered orders:', filteredOrders.length)
    
    const ordersWithExchangeRequests = exchangeRequests.map(req => req.stockOrderId)
    const ordersThatShouldBeHidden = stockOrders.filter(order => ordersWithExchangeRequests.includes(order.id))
    const ordersStillVisible = filteredOrders.filter(order => ordersWithExchangeRequests.includes(order.id))
    
    console.log('Orders that should be hidden:', ordersThatShouldBeHidden.length)
    console.log('Orders still visible (ERROR):', ordersStillVisible.length)
    
    if (ordersStillVisible.length > 0) {
      console.error('FILTERING FAILED: The following orders should be hidden but are still visible:')
      ordersStillVisible.forEach(order => {
        console.error(`- Order ID: ${order.id}, Status: ${order.status}`)
      })
    } else {
      console.log('FILTERING SUCCESS: All orders with exchange requests are properly hidden')
    }
    console.log('=== END VERIFICATION ===')
  }

  const filterOrders = () => {
    let filtered = [...stockOrders]

    // Filter out orders that have exchange requests
    const ordersWithExchangeRequests = exchangeRequests.map(req => req.stockOrderId)
    console.log('[FILTER_ORDERS] Total orders before filtering:', filtered.length)
    console.log('[FILTER_ORDERS] Orders with exchange requests:', ordersWithExchangeRequests)
    
    // Verify each order that should be filtered out
    const ordersToFilterOut = filtered.filter(order => ordersWithExchangeRequests.includes(order.id))
    console.log('[FILTER_ORDERS] Orders that will be filtered out:', ordersToFilterOut.map(order => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount
    })))
    
    filtered = filtered.filter(order => !ordersWithExchangeRequests.includes(order.id))
    console.log('[FILTER_ORDERS] Orders after filtering out exchange requests:', filtered.length)
    
    // Final verification - check that no filtered orders remain
    const remainingFilteredOrders = filtered.filter(order => ordersWithExchangeRequests.includes(order.id))
    if (remainingFilteredOrders.length > 0) {
      console.error('[FILTER_ORDERS] ERROR: Found orders that should have been filtered out:', remainingFilteredOrders.map(order => order.id))
    } else {
      console.log('[FILTER_ORDERS] SUCCESS: All orders with exchange requests have been properly filtered out')
    }

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
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>
      case 'payment_confirmed':
        return <Badge variant="default" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"><CheckCircle className="h-3 w-3" />Payment Confirmed</Badge>
      case 'completed':
        return <Badge variant="default" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200"><CheckCircle className="h-3 w-3" />Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = availableProducts.find(p => p.id === productId)
    const updatedProducts = [...orderFormData.products]
    updatedProducts[index] = {
      ...updatedProducts[index],
      productId,
      price: product ? product.price : 0
    }
    setOrderFormData({ ...orderFormData, products: updatedProducts })
  }

  const addProduct = () => {
    setOrderFormData({
      ...orderFormData,
      products: [...orderFormData.products, { productId: '', quantity: 1, price: 0 }]
    })
  }

  const removeProduct = (index: number) => {
    if (orderFormData.products.length > 1) {
      const updatedProducts = orderFormData.products.filter((_, i) => i !== index)
      setOrderFormData({ ...orderFormData, products: updatedProducts })
    }
  }

  const calculateTotalAmount = () => {
    return orderFormData.products.reduce((total, product) => {
      return total + (product.price * product.quantity)
    }, 0)
  }

  const handleViewOrder = (order: StockOrder) => {
    console.log('View Details clicked for order:', order.id, 'Status:', order.status)
    setSelectedOrderForView(order)
    setIsViewModalOpen(true)
  }

  const handleApproveOrder = async (order: StockOrder) => {
    console.log('Approve clicked for order:', order.id, 'Status:', order.status)
    try {
      const token = localStorage.getItem("Gemurai_token")
      
      const response = await fetch(`/api/v1/stock-orders/${order.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Order Approved",
          description: `Order #${order.id.slice(-8)} has been approved`,
        })
        fetchStockOrders() // Refresh the orders list
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to approve order",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error approving order:', error)
      toast({
        title: "Error",
        description: "Failed to approve order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTrackOrder = (order: StockOrder) => {
    setSelectedOrderForTracking(order)
    setIsTrackingModalOpen(true)
  }

  const getOrderStatusTimeline = (order: StockOrder) => {
    const timeline = []
    
    // Order Created
    timeline.push({
      status: 'Order Created',
      description: 'Your order has been submitted successfully',
      date: new Date(order.createdAt),
      icon: Plus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      completed: true
    })

    // Order Approved (if applicable)
    if (order.approvedAt) {
      timeline.push({
        status: 'Order Approved',
        description: 'Your order has been approved by the employer',
        date: new Date(order.approvedAt),
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        completed: true
      })
    }

    // Payment Confirmed (if applicable)
    if (order.paymentConfirmedAt) {
      timeline.push({
        status: 'Payment Confirmed',
        description: 'Payment has been received and confirmed',
        date: new Date(order.paymentConfirmedAt),
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        completed: true
      })
    }

    // Order Completed (if applicable)
    if (order.completedAt) {
      timeline.push({
        status: 'Order Completed',
        description: 'Your order has been delivered and completed',
        date: new Date(order.completedAt),
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        completed: true
      })
    }

    // Order Rejected (if applicable)
    if (order.rejectedAt) {
      timeline.push({
        status: 'Order Rejected',
        description: 'Your order has been rejected',
        date: new Date(order.rejectedAt),
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        completed: true
      })
    }

    // Current Status
    const currentStatus = getCurrentStatus(order)
    if (currentStatus) {
      timeline.push({
        status: currentStatus.title,
        description: currentStatus.description,
        date: new Date(),
        icon: currentStatus.icon,
        color: currentStatus.color,
        bgColor: currentStatus.bgColor,
        completed: false,
        isCurrent: true
      })
    }

    return timeline.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  const getCurrentStatus = (order: StockOrder) => {
    switch (order.status) {
      case 'pending':
        return {
          title: 'Pending Approval',
          description: 'Your order is waiting for employer approval',
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        }
      case 'approved':
        return {
          title: 'Order Approved',
          description: 'Your order has been approved and is being processed',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      case 'payment_confirmed':
        return {
          title: 'Payment Confirmed',
          description: 'Payment received, preparing for delivery',
          icon: DollarSign,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      case 'completed':
        return {
          title: 'Order Completed',
          description: 'Your order has been successfully delivered',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      case 'rejected':
        return {
          title: 'Order Rejected',
          description: 'Your order has been rejected by the employer',
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        }
      default:
        return {
          title: 'Unknown Status',
          description: 'Order status is unknown',
          icon: AlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        }
    }
  }

  const getEstimatedDeliveryDate = (order: StockOrder) => {
    if (order.estimatedDelivery) {
      return new Date(order.estimatedDelivery)
    }
    
    // Calculate estimated delivery based on order date and status
    const orderDate = new Date(order.createdAt)
    const estimatedDate = new Date(orderDate)
    estimatedDate.setDate(estimatedDate.getDate() + 7) // Default 7 days
    
    return estimatedDate
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Cancel this order?',
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, cancel it',
        cancelButtonText: 'No, keep it'
      })

      if (!result.isConfirmed) {
        return
      }

      setLoadingActions(prev => ({
        ...prev,
        [orderId]: { ...prev[orderId], cancel: true }
      }))

      const response = await fetch('/api/v1/stock-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: 'cancelled' })
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to cancel order')
      }

      toast({
        title: "Order Cancelled",
        description: `Order #${orderId.slice(-8)} has been cancelled`,
      })

      await fetchStockOrders()
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to cancel order',
        variant: 'destructive'
      })
    } finally {
      setLoadingActions(prev => ({
        ...prev,
        [orderId]: { ...prev[orderId], cancel: false }
      }))
    }
  }


  const handleCompleteOrder = async (order: StockOrder) => {
    console.log('Completed clicked for order:', order.id, 'Status:', order.status)
    
    // Set loading state
    setLoadingActions(prev => ({
      ...prev,
      [order.id]: { ...prev[order.id], complete: true }
    }))
    
    try {
      const token = localStorage.getItem("Gemurai_token")
      
      const response = await fetch(`/api/v1/stock-orders/${order.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Order Completed",
          description: `Order #${order.id.slice(-8)} has been marked as completed`,
        })
        fetchStockOrders() // Refresh the orders list
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to complete order",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error completing order:', error)
      toast({
        title: "Error",
        description: "Failed to complete order. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Clear loading state
      setLoadingActions(prev => ({
        ...prev,
        [order.id]: { ...prev[order.id], complete: false }
      }))
    }
  }

  const handleExchangeRequest = (order: StockOrder) => {
    setSelectedOrderForExchange(order)
    
    // Auto-fill the first product from the order
    if (order.products && order.products.length > 0) {
      const firstProduct = order.products[0]
      setExchangeFormData({
        currentProductId: firstProduct.productId,
        requestedProductId: '',
        currentQuantity: firstProduct.quantity,
        requestedQuantity: 1,
        reason: ''
      })
    }
    
    setIsExchangeModalOpen(true)
  }

  const handleMarkAsReceived = async (order: StockOrder) => {
    if (order.status !== 'delivered') {
      return
    }

    setLoadingActions(prev => ({
      ...prev,
      [order.id]: { ...prev[order.id], received: true }
    }))

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/stock-orders/${order.id}/received`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Order Received',
          description: `Order #${order.id.slice(-8)} has been marked as received`
        })
        fetchStockOrders()
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to mark order as received',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error marking order as received:', error)
      toast({
        title: 'Error',
        description: 'Failed to mark order as received. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoadingActions(prev => ({
        ...prev,
        [order.id]: { ...prev[order.id], received: false }
      }))
    }
  }

  // Helper function to calculate equivalent quantity
  const calculateEquivalentQuantity = (currentProduct: any, currentQuantity: number, requestedProduct: any) => {
    if (!currentProduct || !requestedProduct) return 1
    
    // Use purchase price (sales price - commission) for current product
    const currentProductSalesPrice = currentProduct.product?.price || 0
    const currentProductCommission = currentProduct.product?.commission || 0
    const currentProductPurchasePrice = currentProductSalesPrice - currentProductCommission
    
    // Use purchase price (sales price - commission) for requested product
    const requestedProductSalesPrice = requestedProduct.price || 0
    const requestedProductCommission = requestedProduct.commission || 0
    const requestedProductPurchasePrice = requestedProductSalesPrice - requestedProductCommission
    
    const currentTotalValue = currentProductPurchasePrice * currentQuantity
    const requestedQuantity = Math.max(1, Math.floor(currentTotalValue / requestedProductPurchasePrice))
    
    return requestedQuantity
  }

  const handleSubmitExchangeRequest = async () => {
    if (!exchangeFormData.currentProductId || !exchangeFormData.requestedProductId) {
      toast({
        title: "Validation Error",
        description: "Please select both current and requested products",
        variant: "destructive"
      })
      return
    }

    if (!exchangeFormData.reason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for the exchange request",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const token = localStorage.getItem("Gemurai_token")
      
      if (!token || !isAuthenticated) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to submit exchange requests",
          variant: "destructive"
        })
        return
      }
      
      console.log("[EXCHANGE_REQUEST] Token available:", !!token)
      console.log("[EXCHANGE_REQUEST] User authenticated:", isAuthenticated)
      console.log("[EXCHANGE_REQUEST] User:", user)
      
      const response = await fetch('/api/v1/stock-orders/exchange-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stockOrderId: selectedOrderForExchange?.id,
          currentProductId: exchangeFormData.currentProductId,
          requestedProductId: exchangeFormData.requestedProductId,
          currentQuantity: exchangeFormData.currentQuantity,
          requestedQuantity: exchangeFormData.requestedQuantity,
          reason: exchangeFormData.reason.trim()
        })
      })

      const data = await response.json()
      
      console.log("[EXCHANGE_REQUEST] Response status:", response.status)
      console.log("[EXCHANGE_REQUEST] Response data:", data)

      if (data.success) {
        toast({
          title: "Exchange Request Submitted!",
          description: "Your exchange request has been submitted and is pending approval",
        })
        
        // Reset form and close modal
        setExchangeFormData({
          currentProductId: '',
          requestedProductId: '',
          currentQuantity: 1,
          requestedQuantity: 1,
          reason: ''
        })
        setIsExchangeModalOpen(false)
        setSelectedOrderForExchange(null)
        
        // Refresh orders list and exchange requests
        fetchStockOrders()
        fetchExchangeRequests()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit exchange request",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error submitting exchange request:', error)
      toast({
        title: "Error",
        description: "Failed to submit exchange request",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to check if any product is below minimum order quantity
  const hasMinimumOrderValidationErrors = () => {
    const productsWithMinOrder = orderFormData.products.filter(p => p.productId && p.quantity > 0)
    return productsWithMinOrder.some(productItem => {
      const product = availableProducts.find(p => p.id === productItem.productId)
      return product && product.minOrderQuantity && productItem.quantity < product.minOrderQuantity
    })
  }

  const handleSubmitOrder = async () => {
    if (!orderFormData.products.some(p => p.productId && p.quantity > 0)) {
      toast({
        title: "Validation Error",
        description: "Please add at least one product with quantity",
        variant: "destructive"
      })
      return
    }

    // Validate minimum order quantities
    const productsWithMinOrder = orderFormData.products.filter(p => p.productId && p.quantity > 0)
    for (const productItem of productsWithMinOrder) {
      const product = availableProducts.find(p => p.id === productItem.productId)
      if (product && product.minOrderQuantity && productItem.quantity < product.minOrderQuantity) {
        toast({
          title: "Minimum Order Validation Error",
          description: `Minimum order quantity for "${product.name}" is ${product.minOrderQuantity} units. You requested ${productItem.quantity} units.`,
          variant: "destructive"
        })
        return
      }
    }

    try {
      setIsSubmitting(true)
      
      const requestBody: any = {
        products: orderFormData.products.filter(p => p.productId && p.quantity > 0)
      }

      // Add voucher code if using voucher
      if (orderFormData.useVoucher && orderFormData.voucherCode.trim()) {
        requestBody.voucherCode = orderFormData.voucherCode.trim()
      }
      
      const response = await fetch('/api/v1/stock-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Order Created Successfully!",
          description: `Stock order created with total amount: ${formatCurrency(data.data.totalAmount)}`,
        })
        
        // Reset form and close modal
        setOrderFormData({
          products: [{ productId: '', quantity: 1, price: 0 }]
        })
        setIsModalOpen(false)
        
        // Refresh orders list and exchange requests
        fetchStockOrders()
        fetchExchangeRequests()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create order",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateVoucher = async (voucherCode: string) => {
    if (!voucherCode.trim()) {
      setVoucherValidation({ isValid: false, error: 'Please enter a voucher code' })
      return
    }

    try {
      setIsValidatingVoucher(true)
      const token = localStorage.getItem("Gemurai_token")
      
      const response = await fetch('/api/v1/vouchers/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          voucherCode: voucherCode.trim(),
          amount: calculateTotalAmount()
        })
      })

      const data = await response.json()

      if (data.success) {
        setVoucherValidation({
          isValid: true,
          voucher: data.data.voucher
        })
        toast({
          title: "Voucher Valid",
          description: `Voucher validated successfully. Available balance: ${formatCurrency(data.data.availableAmount)}`,
        })
      } else {
        setVoucherValidation({
          isValid: false,
          error: data.message || 'Invalid voucher code'
        })
        toast({
          title: "Invalid Voucher",
          description: data.message || 'Please check your voucher code',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error validating voucher:', error)
      setVoucherValidation({
        isValid: false,
        error: 'Failed to validate voucher'
      })
      toast({
        title: "Error",
        description: "Failed to validate voucher",
        variant: "destructive"
      })
    } finally {
      setIsValidatingVoucher(false)
    }
  }

  const resetForm = () => {
    setOrderFormData({
      products: [{ productId: '', quantity: 1, price: 0 }],
      voucherCode: '',
      useVoucher: false
    })
    setVoucherValidation({ isValid: false })
  }

  const pendingOrders = stockOrders?.filter(order => order.status === 'pending') || []
  const approvedOrders = stockOrders?.filter(order => order.status === 'approved') || []
  const paymentConfirmedOrders = stockOrders?.filter(order => order.status === 'payment_confirmed') || []
  const completedOrders = stockOrders?.filter(order => order.status === 'completed') || []
  const rejectedOrders = stockOrders?.filter(order => order.status === 'rejected') || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
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
              <div></div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={fetchStockOrders} 
                disabled={isLoading}
                className="card bordered hover:scale-105 transition-transform"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={verifyFiltering}
                variant="outline"
                className="card bordered hover:scale-105 transition-transform"
              >
                Verify Filtering
              </Button>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="card elevated hover:scale-105 transition-transform">
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto !bg-white border border-gray-300">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                Create New Stock Order
              </DialogTitle>
              <DialogDescription className="text-base">
                Request new stock from employers. Fill in the details below and review the summary before submitting.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Products Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Products
                    </h3>
                    <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                
                {orderFormData.products.map((product, index) => (
                        <div key={index} className="card elevated rounded-xl p-4 space-y-4 hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Product {index + 1}</h4>
                      {orderFormData.products.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeProduct(index)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`product-${index}`} className="text-sm font-semibold text-gray-700">Product *</Label>
                        <Select
                          value={product.productId}
                          onValueChange={(value) => handleProductSelect(index, value)}
                          disabled={isProductsLoading}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder={isProductsLoading ? "Loading products..." : "Select a product"} />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 border-gray-200 shadow-lg">
                            {isProductsLoading ? (
                              <div className="p-4 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                Loading products...
                              </div>
                            ) : availableProducts.length === 0 ? (
                              <div className="p-4 text-center text-gray-500">
                                No products available
                              </div>
                            ) : (
                              availableProducts.map((prod) => (
                                <SelectItem key={prod.id} value={prod.id} className="py-2 hover:bg-gray-50 focus:bg-gray-50">
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex flex-col">
                                      <span className="font-medium text-gray-900">{prod.name}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">{prod.category}</span>
                                        {prod.minOrderQuantity && (
                                          <>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <span className="text-xs text-orange-600 font-medium">
                                              Min: {prod.minOrderQuantity}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-sm font-medium text-blue-600">
                                      {formatCurrency(prod.price)}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`quantity-${index}`} className="text-sm font-semibold text-gray-700">Quantity *</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => {
                            const updatedProducts = [...orderFormData.products]
                            updatedProducts[index] = {
                              ...updatedProducts[index],
                              quantity: parseInt(e.target.value) || 1
                            }
                            setOrderFormData({ ...orderFormData, products: updatedProducts })
                          }}
                          className="h-10"
                        />
                        {(() => {
                          const selectedProduct = availableProducts.find(p => p.id === product.productId)
                          const isBelowMinimum = selectedProduct && 
                            selectedProduct.minOrderQuantity && 
                            product.quantity > 0 && 
                            product.quantity < selectedProduct.minOrderQuantity
                          
                          return isBelowMinimum ? (
                            <p className="text-sm text-destructive">
                              Minimum order quantity is {selectedProduct.minOrderQuantity} units. Please increase the quantity.
                            </p>
                          ) : null
                        })()}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`price-${index}`} className="text-sm font-semibold text-gray-700">Price per Unit (RWF)</Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          min="0"
                          step="100"
                          value={product.price}
                          onChange={(e) => {
                            const updatedProducts = [...orderFormData.products]
                            updatedProducts[index] = {
                              ...updatedProducts[index],
                              price: parseFloat(e.target.value) || 0
                            }
                            setOrderFormData({ ...orderFormData, products: updatedProducts })
                          }}
                          className="h-10"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-700">Product Total:</span>
                      <span className="text-lg font-bold text-blue-900">
                        {formatCurrency(product.price * product.quantity)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Voucher Payment Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Payment Method
                    </h3>
              </div>
                  
                  <div className="card elevated rounded-xl p-4 space-y-4 hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="useVoucher"
                        checked={orderFormData.useVoucher}
                        onChange={(e) => {
                          setOrderFormData({
                            ...orderFormData,
                            useVoucher: e.target.checked,
                            voucherCode: e.target.checked ? orderFormData.voucherCode : ''
                          })
                          if (!e.target.checked) {
                            setVoucherValidation({ isValid: false })
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Label htmlFor="useVoucher" className="text-sm font-semibold text-gray-700">
                        Pay with Voucher
                      </Label>
            </div>

                    {orderFormData.useVoucher && (
                      <div className="space-y-4 pl-7">
                        <div className="space-y-2">
                          <Label htmlFor="voucherCode" className="text-sm font-semibold text-gray-700">
                            Voucher Code *
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="voucherCode"
                              type="text"
                              placeholder="Enter your voucher code"
                              value={orderFormData.voucherCode}
                              onChange={(e) => {
                                setOrderFormData({
                                  ...orderFormData,
                                  voucherCode: e.target.value
                                })
                                // Clear validation when code changes
                                if (voucherValidation.isValid) {
                                  setVoucherValidation({ isValid: false })
                                }
                              }}
                              className={`flex-1 ${isValidatingVoucher ? 'opacity-60' : ''}`}
                              disabled={isValidatingVoucher}
                            />
                            <Button
                              type="button"
                              onClick={() => validateVoucher(orderFormData.voucherCode)}
                              disabled={isValidatingVoucher || !orderFormData.voucherCode.trim()}
                              className="px-4 min-w-[100px]"
                            >
                              {isValidatingVoucher ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Validating...</span>
                                </div>
                              ) : (
                                'Validate'
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Voucher Validation Status */}
                        {isValidatingVoucher && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-800">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="font-medium">Validating voucher...</span>
                            </div>
                          </div>
                        )}
                        
                        {!isValidatingVoucher && voucherValidation.isValid && voucherValidation.voucher && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 text-green-800">
                              <CheckCircle className="h-4 w-4" />
                              <span className="font-medium">Voucher Valid</span>
                            </div>
                            <div className="mt-2 text-sm text-green-700">
                              <div>Code: {voucherValidation.voucher.code}</div>
                              <div>Available Balance: {formatCurrency(voucherValidation.voucher.remainingBalance)}</div>
                              <div>Order Amount: {formatCurrency(calculateTotalAmount())}</div>
                              {voucherValidation.voucher.remainingBalance >= calculateTotalAmount() ? (
                                <div className="font-medium text-green-800 mt-1">
                                  ✓ Sufficient balance for this order
                                </div>
                              ) : (
                                <div className="font-medium text-orange-800 mt-1">
                                  ⚠ Partial payment - remaining amount will need alternative payment
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {!isValidatingVoucher && voucherValidation.error && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-800">
                              <XCircle className="h-4 w-4" />
                              <span className="font-medium">Invalid Voucher</span>
                            </div>
                            <div className="mt-1 text-sm text-red-700">
                              {voucherValidation.error}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>



              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                {/* Order Summary Card */}
                <div className="sticky top-4">
                        <div className="card elevated rounded-xl shadow-xl border-0 bg-white">
                          <div className="card-header bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                            <div className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Receipt className="h-6 w-6 text-green-600" />
                        </div>
                        Order Summary
                            </div>
                          </div>
                          <div className="card-content p-6 space-y-6">
                      {/* Products Summary */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          Products ({orderFormData.products.filter(p => p.productId && p.quantity > 0).length})
                        </h4>
                        
                        {orderFormData.products.filter(p => p.productId && p.quantity > 0).length > 0 ? (
                          <div className="space-y-3">
                            {orderFormData.products
                              .filter(p => p.productId && p.quantity > 0)
                              .map((product, index) => {
                                const selectedProduct = availableProducts.find(p => p.id === product.productId)
                                return (
                                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-gray-900">
                                        {selectedProduct?.name || 'Unknown Product'}
                                      </span>
                                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                        {product.quantity} units
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">
                                        {formatCurrency(product.price)} each
                                      </span>
                                      <span className="font-semibold text-gray-900">
                                        {formatCurrency(product.price * product.quantity)}
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No products selected</p>
                          </div>
                        )}
                      </div>



                      {/* Financial Summary */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Financial Summary
                        </h4>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-green-700 font-medium">Total Amount:</span>
                            <span className="text-green-800 font-bold text-lg">
                              {formatCurrency(calculateTotalAmount())}
                            </span>
                          </div>
                          
                          {/* Voucher Payment Summary */}
                          {orderFormData.useVoucher && voucherValidation.isValid && voucherValidation.voucher && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-blue-700 font-medium">Voucher Payment:</span>
                                <span className="text-blue-800 font-bold">
                                  {formatCurrency(Math.min(voucherValidation.voucher.remainingBalance, calculateTotalAmount()))}
                                </span>
                              </div>
                              
                              {voucherValidation.voucher.remainingBalance < calculateTotalAmount() && (
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                  <span className="text-orange-700 font-medium">Remaining Amount:</span>
                                  <span className="text-orange-800 font-bold">
                                    {formatCurrency(calculateTotalAmount() - voucherValidation.voucher.remainingBalance)}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-medium text-gray-900">Voucher</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-gray-600">Products:</span>
                            <span className="font-medium text-gray-900">
                              {orderFormData.products.filter(p => p.productId && p.quantity > 0).length}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-gray-600">Total Units:</span>
                            <span className="font-medium text-gray-900">
                              {orderFormData.products.reduce((sum, p) => sum + p.quantity, 0)}
                            </span>
                          </div>
                        </div>
                      </div>


                          </div>
                        </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Reset Form
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
                <Button 
                  type="button" 
                  onClick={handleSubmitOrder}
                  disabled={
                    isSubmitting || 
                    !orderFormData.products.some(p => p.productId && p.quantity > 0) ||
                    (orderFormData.useVoucher && !voucherValidation.isValid) ||
                    hasMinimumOrderValidationErrors()
                  }
                  className="card elevated bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] px-8 py-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-3" />
                      Create Stock Order
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
            </div>
          </div>
        </div>
      </div>

        {/* Enhanced Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 my-4">
          <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Total Orders</p>
                <p className="text-gray-900 text-3xl font-bold">{stockOrders.length}</p>
                <p className="text-gray-600 text-xs mt-1">All time</p>
              </div>
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
                <Receipt className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Pending</p>
                <p className="text-gray-900 text-3xl font-bold">{pendingOrders.length}</p>
                <p className="text-gray-600 text-xs mt-1">Awaiting approval</p>
              </div>
              <div className="w-16 h-16 bg-yellow-500 rounded-xl flex items-center justify-center">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Approved</p>
                <p className="text-gray-900 text-3xl font-bold">{approvedOrders.length}</p>
                <p className="text-gray-600 text-xs mt-1">Ready for payment</p>
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
                <p className="text-gray-600 text-xs mt-1">Processing</p>
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
                <p className="text-gray-600 text-xs mt-1">Delivered</p>
              </div>
              <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
      </div>

        {/* Tab Navigation */}
        <div className="card elevated rounded-xl">
          <div className="card-content p-0">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'orders'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Stock Orders
                  <Badge variant="outline" className="ml-2 text-xs">
                    {filteredOrders.length}
                  </Badge>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('exchange-requests')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'exchange-requests'
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ArrowRightLeft className="h-4 w-4" />
                  Exchange Requests
                  <Badge variant="outline" className="ml-2 text-xs">
                    {exchangeRequests.length}
                  </Badge>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card elevated rounded-xl">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'orders' ? 'Stock Orders' : 'Exchange Request Management'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {pendingOrders.length} Pending
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {approvedOrders.length} Approved
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {completedOrders.length} Completed
                </Badge>
              </div>
            </div>
          </div>
          <div className="card-content">
            {activeTab === 'orders' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="payment_confirmed">Payment Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search exchange requests..."
                    className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <Select>
                  <SelectTrigger className="border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Enhanced Stock Orders Table */}
            <div className="card elevated rounded-xl">
          <div className="card-content p-0">
          {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4 text-lg">Loading stock orders...</p>
            </div>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Purchase Price
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Sales Price
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Commission
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                  </tr>
                </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        id={`order-${order.id}`}
                        className={`transition-colors duration-200 ${order.status === 'cancelled' ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="text-gray-500 space-y-1">
                              {order.products.map((product, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="truncate max-w-[200px]">
                                    {product.product?.name || 'Unknown Product'}
                                  </span>
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                                    {product.quantity} units
                                  </span>
                            </div>
                          ))}
                            </div>
                        </div>
                      </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(
                              order.products.reduce((sum, p) => {
                                // Use the price from the order product (which might be different from current product price)
                                const unitSales = p.price || p.product?.price || 0
                                const unitCommission = (p.product?.commission as number) || 0
                                const unitPurchase = unitSales - unitCommission
                                return sum + unitPurchase * p.quantity
                              }, 0)
                            )}
                          </div>
                      </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-blue-600">
                            {formatCurrency(
                              order.products.reduce((sum, p) => {
                                // Use the price from the order product (which might be different from current product price)
                                const unitSales = p.price || p.product?.price || 0
                                return sum + unitSales * p.quantity
                              }, 0)
                            )}
                          </div>
                      </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-purple-600">
                            {formatCurrency(
                              order.products.reduce((sum, p) => {
                                // Commission is a fixed amount per unit
                                const unitCommission = (p.product?.commission as number) || 0
                                return sum + unitCommission * p.quantity
                              }, 0)
                            )}
                          </div>
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
                          <Badge 
                            variant={
                              order.status === 'pending' ? 'secondary' :
                              (order.status === 'rejected' || order.status === 'cancelled') ? 'destructive' :
                              'default'
                            } 
                            className="text-xs capitalize"
                          >
                            {order.status}
                          </Badge>
                      </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {/* Actions Logic:
                                1. View Details - Always visible
                                2. Complete Order - Only when status='payment_confirmed' (for approved orders)
                                3. Complete - Only when status='payment_confirmed' (for PAYMENT CONFIRMED orders)
                            */}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-200"
                              onClick={() => handleViewOrder(order)}
                              title="View Order Details"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {order.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                                onClick={() => handleCancelOrder(order.id)}
                                title="Cancel Order"
                                disabled={loadingActions[order.id]?.cancel}
                              >
                                {loadingActions[order.id]?.cancel ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                    Cancelling...
                                  </>
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                              {order.status === 'delivered' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300 transition-all duration-200"
                                  onClick={() => handleMarkAsReceived(order)}
                                  title="Mark as Received"
                                >
                                  <CheckSquare className="h-3 w-3" />
                                </Button>
                              )}
                            {(order.payment?.status === 'PENDING') && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200"
                                onClick={() => { setPayingOrder(order); setPayDialogOpen(true) }}
                                title="Pay Now"
                              >
                                <CreditCard className="h-3 w-3" />
                              </Button>
                            )}
                            {order.status === 'payment_confirmed' && !order.completedAt && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all duration-200"
                                onClick={() => handleCompleteOrder(order)}
                                title="Complete"
                                disabled={loadingActions[order.id]?.complete}
                              >
                                {loadingActions[order.id]?.complete ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                    Completing...
                                  </>
                                ) : (
                                  <>
                                    <CheckSquare className="h-3 w-3 mr-1" />
                                    Complete
                                  </>
                                )}
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
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Receipt className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "all" 
                    ? "No orders match your current filters. Try adjusting your search criteria."
                    : "You haven't created any stock orders yet. Start by creating your first order."
                  }
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={() => setIsModalOpen(true)} className="card elevated hover:scale-105 transition-transform">
                <Plus className="h-4 w-4 mr-2" />
                Create First Order
              </Button>
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

      {/* Payment Reminder for Pending Payments */}
      {showPaymentReminder && pendingPaymentOrders.length > 0 && (
        <div className="card elevated rounded-xl bg-yellow-50 border border-yellow-200">
          <div className="card-content p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-700 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-900">Payment reminder</h4>
                <p className="text-sm text-yellow-800">
                  You have {pendingPaymentOrders.length} stock order{pendingPaymentOrders.length > 1 ? 's' : ''} with payment status <span className="font-semibold">PENDING</span>. Please complete payment within 24 hours.
                </p>
                <div className="mt-2 grid gap-1">
                  {pendingPaymentOrders.slice(0, 3).map((o: any) => (
                    <div key={o.id} className="text-xs text-yellow-800">
                      Order #{o.id.slice(-8)} • Time remaining: <span className="font-semibold">{getPaymentTimeRemaining(o)}</span>
                    </div>
                  ))}
                  {pendingPaymentOrders.length > 3 && (
                    <div className="text-xs text-yellow-800">+{pendingPaymentOrders.length - 3} more…</div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPaymentReminder(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}

      {/* Wallet Payment Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border shadow-xl backdrop-blur-none opacity-100">
          <DialogHeader>
            <DialogTitle>Confirm Wallet Payment</DialogTitle>
            <DialogDescription>
              Complete payment for this stock order using your wallet balance.
            </DialogDescription>
          </DialogHeader>

          {payingOrder && (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">#{String(payingOrder.id).slice(-8)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(payingOrder.totalAmount)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!payingOrder) return
                try {
                  setLoadingActions(prev => ({ ...prev, [payingOrder.id]: { ...prev[payingOrder.id], paymentConfirm: true } }))
                  const resp = await fetch('/api/v1/stock-orders', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: payingOrder.id, status: 'payment_confirmed' })
                  })
                  const data = await resp.json()
                  if (!resp.ok || !data.success) {
                    throw new Error(data.message || 'Failed to confirm payment')
                  }
                  toast({ title: 'Payment Confirmed', description: `Order #${String(payingOrder.id).slice(-8)} payment confirmed.` })
                  setPayDialogOpen(false)
                  setPayingOrder(null)
                  await fetchStockOrders()
                } catch (e: any) {
                  toast({ title: 'Payment Error', description: e?.message || 'Failed to confirm payment', variant: 'destructive' })
                } finally {
                  setLoadingActions(prev => ({ ...prev, [payingOrder?.id || '']: { ...prev[payingOrder?.id || ''], paymentConfirm: false } }))
                }
              }}
            >
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
        )}
        {activeTab === 'exchange-requests' && (
          <div>
            {/* Exchange Requests Table */}
            <div className="card elevated rounded-xl">
              <div className="card-content p-0">
                {isLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4 text-lg">Loading exchange requests...</p>
                  </div>
                ) : exchangeRequests && exchangeRequests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Current Product
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Requested Product
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Quantities
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {exchangeRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                #{request.stockOrderId.slice(-8)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <div className="font-medium">{request.currentProduct?.name || 'Unknown'}</div>
                                <div className="text-gray-500">{request.currentQuantity} units</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <div className="font-medium">{request.requestedProduct?.name || 'Unknown'}</div>
                                <div className="text-gray-500">{request.requestedQuantity} units</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <div className="flex items-center gap-2">
                                  <span className="text-orange-600">{request.currentQuantity}</span>
                                  <ArrowRightLeft className="h-3 w-3 text-gray-400" />
                                  <span className="text-green-600">{request.requestedQuantity}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge 
                                variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}
                                className="capitalize"
                              >
                                {request.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                {request.status === 'pending' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 hover:border-red-300 transition-colors"
                                    title="Cancel Request"
                                  >
                                    <X className="h-3 w-3" />
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
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ArrowRightLeft className="h-12 w-12 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exchange Requests</h3>
                    <p className="text-gray-600 mb-6">
                      You haven't submitted any exchange requests yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Order Tracking Modal */}
      <Dialog open={isTrackingModalOpen} onOpenChange={setIsTrackingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto !bg-white border border-gray-300">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <MapPin className="h-6 w-6 text-green-600" />
              Order Tracking
            </DialogTitle>
            <DialogDescription>
              Track the status and progress of your order
            </DialogDescription>
          </DialogHeader>

          {selectedOrderForTracking && (
            <div className="space-y-6">
              {/* Order Information */}
              <div className="card elevated rounded-xl border border-gray-200">
                <div className="card-content p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-blue-600" />
                        Order Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order ID:</span>
                          <span className="font-medium text-gray-900">#{selectedOrderForTracking.id.slice(-8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Date:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(selectedOrderForTracking.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(selectedOrderForTracking.totalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Priority:</span>
                          <Badge variant="secondary" className="capitalize">
                            {selectedOrderForTracking.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Truck className="h-5 w-5 text-green-600" />
                        Delivery Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Status:</span>
                          <Badge 
                            variant={selectedOrderForTracking.status === 'completed' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {selectedOrderForTracking.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Delivery:</span>
                          <span className="font-medium text-gray-900">
                            {getEstimatedDeliveryDate(selectedOrderForTracking).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrderForTracking.payment?.method || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <Badge 
                            variant={selectedOrderForTracking.payment?.status === 'COMPLETED' ? 'default' : 'secondary'}
                          >
                            {selectedOrderForTracking.payment?.status || 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products in Order */}
              <div className="card elevated rounded-xl border border-gray-200">
                <div className="card-content p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Products in Order
                  </h3>
                  <div className="space-y-3">
                    {selectedOrderForTracking.products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.product?.name || 'Unknown Product'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {product.quantity} units
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency((product.product?.price || 0) * product.quantity)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(product.product?.price || 0)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="card elevated rounded-xl border border-gray-200">
                <div className="card-content p-6">
                  <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Order Timeline
                  </h3>
                  <div className="space-y-4">
                    {getOrderStatusTimeline(selectedOrderForTracking).map((timelineItem, index) => {
                      const IconComponent = timelineItem.icon
                      return (
                        <div key={index} className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${timelineItem.bgColor} ${timelineItem.isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                            <IconComponent className={`h-5 w-5 ${timelineItem.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{timelineItem.status}</h4>
                              {timelineItem.isCurrent && (
                                <Badge variant="default" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{timelineItem.description}</p>
                            <p className="text-xs text-gray-500">
                              {timelineItem.date.toLocaleDateString()} at {timelineItem.date.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrderForTracking.notes && (
                <div className="card elevated rounded-xl border border-gray-200">
                  <div className="card-content p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      Order Notes
                    </h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {selectedOrderForTracking.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTrackingModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto !bg-white border border-gray-300">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <Eye className="h-6 w-6 text-blue-600" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about your order
            </DialogDescription>
          </DialogHeader>

          {selectedOrderForView && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="card elevated rounded-xl border border-gray-200">
                <div className="card-content p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-blue-600" />
                        Order Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order ID:</span>
                          <span className="font-medium text-gray-900">#{selectedOrderForView.id.slice(-8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Date:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(selectedOrderForView.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge 
                            variant={selectedOrderForView.status === 'completed' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {selectedOrderForView.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Priority:</span>
                          <Badge variant="secondary" className="capitalize">
                            {selectedOrderForView.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Financial Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(selectedOrderForView.totalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrderForView.payment?.method || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status:</span>
                          <Badge 
                            variant={selectedOrderForView.payment?.status === 'COMPLETED' ? 'default' : 'secondary'}
                          >
                            {selectedOrderForView.payment?.status || 'Pending'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Products:</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrderForView.products.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        Timeline
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(selectedOrderForView.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {selectedOrderForView.approvedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Approved:</span>
                            <span className="font-medium text-gray-900">
                              {new Date(selectedOrderForView.approvedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {selectedOrderForView.paymentConfirmedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Confirmed:</span>
                            <span className="font-medium text-gray-900">
                              {new Date(selectedOrderForView.paymentConfirmedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {selectedOrderForView.completedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Completed:</span>
                            <span className="font-medium text-gray-900">
                              {new Date(selectedOrderForView.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {selectedOrderForView.rejectedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rejected:</span>
                            <span className="font-medium text-gray-900">
                              {new Date(selectedOrderForView.rejectedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Details */}
              <div className="card elevated rounded-xl border border-gray-200">
                <div className="card-content p-6">
                  <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Products in Order
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Purchase Price</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sales Price</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Commission</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrderForView.products.map((product, index) => {
                          const unitCommission = (product.product?.commission as number) || 0
                          const unitSales = product.product?.price || 0
                          const unitPurchase = unitSales - unitCommission
                          const productTotal = unitSales * product.quantity
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {product.product?.name || 'Unknown Product'}
                                  </p>
                                  <p className="text-sm text-gray-500">ID: {product.productId.slice(-8)}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant="secondary">{product.quantity} units</Badge>
                              </td>
                              <td className="px-4 py-3 text-green-600 font-medium">
                                {formatCurrency(unitPurchase)}
                              </td>
                              <td className="px-4 py-3 text-blue-600 font-medium">
                                {formatCurrency(unitSales)}
                              </td>
                              <td className="px-4 py-3 text-purple-600 font-medium">
                                {formatCurrency(unitCommission)}
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                {formatCurrency(productTotal)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrderForView.notes && (
                <div className="card elevated rounded-xl border border-gray-200">
                  <div className="card-content p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      Order Notes
                    </h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {selectedOrderForView.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleTrackOrder(selectedOrderForView)}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Track Order
                  </Button>
                  {selectedOrderForView.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleCancelOrder(selectedOrderForView.id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                      Cancel Order
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Exchange Request Modal */}
      <Dialog open={isExchangeModalOpen} onOpenChange={setIsExchangeModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto !bg-white border border-gray-300">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-orange-600" />
              Request Stock Exchange
            </DialogTitle>
            <DialogDescription>
              Request to exchange your current stock items with other products from ADMIN
            </DialogDescription>
          </DialogHeader>

          {selectedOrderForExchange && (
            <div className="space-y-6">
              {/* Current Order Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Current Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Order ID:</span>
                    <span className="ml-2 font-medium">#{selectedOrderForExchange.id.slice(-8)}</span>
    </div>
                  <div>
                    <span className="text-blue-700">Total Amount:</span>
                    <span className="ml-2 font-medium">{formatCurrency(selectedOrderForExchange.totalAmount)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Status:</span>
                    <Badge variant="outline" className="ml-2">
                      {selectedOrderForExchange.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-blue-700">Products:</span>
                    <span className="ml-2 font-medium">{selectedOrderForExchange.products.length}</span>
                  </div>
                </div>
              </div>

              {/* Exchange Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Product Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="current-product">Current Product to Exchange</Label>
                    <Select 
                      value={exchangeFormData.currentProductId} 
                      onValueChange={(value) => setExchangeFormData(prev => ({ ...prev, currentProductId: value }))}
                    >
                      <SelectTrigger className="!bg-white !border-gray-300">
                        <SelectValue placeholder="Select current product" />
                      </SelectTrigger>
                      <SelectContent className="!bg-white border border-gray-300">
                        {selectedOrderForExchange.products.map((product) => (
                          <SelectItem key={product.productId} value={product.productId}>
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate max-w-[200px]">
                                {product.product?.name || 'Unknown Product'}
                              </span>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                ({product.quantity} units)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Requested Product Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="requested-product">Requested Product from ADMIN</Label>
                    <Select 
                      value={exchangeFormData.requestedProductId} 
                      onValueChange={(value) => {
                        // Auto-calculate requested quantity based on current product value
                        if (value && exchangeFormData.currentProductId) {
                          const currentProduct = selectedOrderForExchange?.products.find(
                            p => p.productId === exchangeFormData.currentProductId
                          )
                          const requestedProduct = availableProducts.find(p => p.id === value)
                          
                          if (currentProduct && requestedProduct) {
                            const requestedQuantity = calculateEquivalentQuantity(
                              currentProduct, 
                              exchangeFormData.currentQuantity, 
                              requestedProduct
                            )
                            
                            setExchangeFormData(prev => ({ 
                              ...prev, 
                              requestedProductId: value,
                              requestedQuantity: requestedQuantity
                            }))
                          } else {
                            setExchangeFormData(prev => ({ ...prev, requestedProductId: value }))
                          }
                        } else {
                          setExchangeFormData(prev => ({ ...prev, requestedProductId: value }))
                        }
                      }}
                    >
                      <SelectTrigger className="!bg-white !border-gray-300">
                        <SelectValue placeholder="Select requested product" />
                      </SelectTrigger>
                      <SelectContent className="!bg-white border border-gray-300">
                        {availableProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate max-w-[200px]">
                                {product.name}
                              </span>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {formatCurrency(product.price)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="current-quantity">Current Product Quantity</Label>
                    <Input
                      id="current-quantity"
                      type="number"
                      min="1"
                      value={exchangeFormData.currentQuantity}
                      onChange={(e) => {
                        const newCurrentQuantity = parseInt(e.target.value) || 1
                        
                        // Auto-recalculate requested quantity when current quantity changes
                        if (exchangeFormData.requestedProductId) {
                          const currentProduct = selectedOrderForExchange?.products.find(
                            p => p.productId === exchangeFormData.currentProductId
                          )
                          const requestedProduct = availableProducts.find(
                            p => p.id === exchangeFormData.requestedProductId
                          )
                          
                          if (currentProduct && requestedProduct) {
                            const requestedQuantity = calculateEquivalentQuantity(
                              currentProduct, 
                              newCurrentQuantity, 
                              requestedProduct
                            )
                            
                            setExchangeFormData(prev => ({ 
                              ...prev, 
                              currentQuantity: newCurrentQuantity,
                              requestedQuantity: requestedQuantity
                            }))
                          } else {
                            setExchangeFormData(prev => ({ 
                              ...prev, 
                              currentQuantity: newCurrentQuantity
                            }))
                          }
                        } else {
                          setExchangeFormData(prev => ({ 
                            ...prev, 
                            currentQuantity: newCurrentQuantity
                          }))
                        }
                      }}
                      placeholder="Enter quantity"
                      className="!bg-white border border-gray-300"
                    />
                  </div>

                  {/* Requested Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="requested-quantity">Requested Product Quantity</Label>
                    <Input
                      id="requested-quantity"
                      type="number"
                      min="1"
                      value={exchangeFormData.requestedQuantity}
                      onChange={(e) => setExchangeFormData(prev => ({ 
                        ...prev, 
                        requestedQuantity: parseInt(e.target.value) || 1 
                      }))}
                      placeholder="Enter quantity"
                      className="!bg-white border border-gray-300"
                    />
                  </div>
                </div>

                {/* Reason for Exchange */}
                <div className="space-y-2">
                  <Label htmlFor="exchange-reason">Reason for Exchange Request</Label>
                  <Textarea
                    id="exchange-reason"
                    placeholder="Please explain why you want to exchange these products..."
                    value={exchangeFormData.reason}
                    onChange={(e) => setExchangeFormData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={4}
                    className="resize-none !bg-white border border-gray-300"
                  />
                  <p className="text-xs text-gray-500">
                    Provide a detailed explanation for your exchange request to help with approval
                  </p>
                </div>

                {/* Exchange Summary */}
                {exchangeFormData.currentProductId && exchangeFormData.requestedProductId && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Exchange Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-gray-900 mb-2">Giving Away</h5>
                        {(() => {
                          const currentProduct = selectedOrderForExchange.products.find(
                            p => p.productId === exchangeFormData.currentProductId
                          )
                          const currentProductSalesPrice = currentProduct?.product?.price || 0
                          const currentProductCommission = currentProduct?.product?.commission || 0
                          const currentProductPurchasePrice = currentProductSalesPrice - currentProductCommission
                          
                          return (
                            <div>
                              <p className="font-medium">{currentProduct?.product?.name}</p>
                              <p className="text-gray-600">
                                {exchangeFormData.currentQuantity} units × {formatCurrency(currentProductPurchasePrice)} (Purchase Price)
                              </p>
                              <p className="font-semibold text-green-600">
                                Total: {formatCurrency(currentProductPurchasePrice * exchangeFormData.currentQuantity)}
                              </p>
                            </div>
                          )
                        })()}
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-gray-900 mb-2">Requesting</h5>
                        {(() => {
                          const requestedProduct = availableProducts.find(
                            p => p.id === exchangeFormData.requestedProductId
                          )
                          const requestedProductSalesPrice = requestedProduct?.price || 0
                          const requestedProductCommission = requestedProduct?.commission || 0
                          const requestedProductPurchasePrice = requestedProductSalesPrice - requestedProductCommission
                          
                          return (
                            <div>
                              <p className="font-medium">{requestedProduct?.name}</p>
                              <p className="text-gray-600">
                                {exchangeFormData.requestedQuantity} units × {formatCurrency(requestedProductPurchasePrice)} (Purchase Price)
                              </p>
                              <p className="font-semibold text-blue-600">
                                Total: {formatCurrency(requestedProductPurchasePrice * exchangeFormData.requestedQuantity)}
                              </p>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExchangeModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitExchangeRequest}
              disabled={isSubmitting || !exchangeFormData.currentProductId || !exchangeFormData.requestedProductId || !exchangeFormData.reason.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Submit Exchange Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
