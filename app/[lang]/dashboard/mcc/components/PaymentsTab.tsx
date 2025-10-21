"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Swal from "sweetalert2"
import {
  Plus,
  Search,
  RefreshCw,
  DollarSign,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Loader2,
  TrendingUp,
  Users,
  Banknote,
  X
} from "lucide-react"

interface Payment {
  id: string
  farmerId: string
  farmerName: string
  farmerContact: string
  collectionId: string
  totalAmount: number
  deductions: number
  advances: number
  netPayment: number
  paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer'
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed'
  paymentDate: string
  processedBy: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface Collection {
  id: string
  farmerId: string
  farmerName: string
  farmerContact: string
  totalLiters: number
  unitPrice: number
  totalAmount: number
  deductions: number
  advances: number
  netPayment: number
  collectionDate: string
  status: string
}

interface PaymentsTabProps {
  mccId?: string
}

export default function PaymentsTab({ mccId }: PaymentsTabProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPayments, setTotalPayments] = useState(0)
  const [paymentsPerPage] = useState(10)
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  
  // Form states
  const [processPaymentOpen, setProcessPaymentOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [formData, setFormData] = useState({
    paymentMethod: "mobile_money" as 'cash' | 'mobile_money' | 'bank_transfer',
    notes: ""
  })

  const fetchPayments = async (page: number = currentPage) => {
    try {
      setPaymentsLoading(true)
      const token = localStorage.getItem('Gemurai_token')
      const response = await fetch(`/api/v1/mcc/payments?mccId=${mccId || 'mcc_1760697250506'}&page=${page}&limit=${paymentsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPayments(data.data || [])
        
        // Update pagination metadata
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1)
          setTotalPayments(data.meta.total || 0)
        }
      } else {
        console.error('Failed to fetch payments:', response.statusText)
        // Mock data for development
        const mockPayments: Payment[] = [
          {
            id: "1",
            farmerId: "farmer_1",
            farmerName: "Jean Baptiste",
            farmerContact: "+250788123456",
            collectionId: "collection_1",
            totalAmount: 456000,
            deductions: 50000,
            advances: 20000,
            netPayment: 386000,
            paymentMethod: "mobile_money",
            paymentStatus: "completed",
            paymentDate: "2024-01-15",
            processedBy: "Admin User",
            notes: "Payment processed successfully",
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z"
          },
          {
            id: "2",
            farmerId: "farmer_2",
            farmerName: "Marie Claire",
            farmerContact: "+250788654321",
            collectionId: "collection_2",
            totalAmount: 345000,
            deductions: 30000,
            advances: 15000,
            netPayment: 300000,
            paymentMethod: "cash",
            paymentStatus: "pending",
            paymentDate: "2024-01-20",
            processedBy: "Admin User",
            notes: "Awaiting farmer confirmation",
            createdAt: "2024-01-20T14:30:00Z",
            updatedAt: "2024-01-20T14:30:00Z"
          },
          {
            id: "3",
            farmerId: "farmer_3",
            farmerName: "Paul Nkurunziza",
            farmerContact: "+250788987654",
            collectionId: "collection_3",
            totalAmount: 937500,
            deductions: 75000,
            advances: 30000,
            netPayment: 832500,
            paymentMethod: "bank_transfer",
            paymentStatus: "processing",
            paymentDate: "2024-01-22",
            processedBy: "Admin User",
            notes: "Bank transfer in progress",
            createdAt: "2024-01-22T09:15:00Z",
            updatedAt: "2024-01-22T09:15:00Z"
          }
        ]
        setPayments(mockPayments)
        setTotalPages(1)
        setTotalPayments(mockPayments.length)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      // Use mock data when API fails
      const mockPayments: Payment[] = [
        {
          id: "1",
          farmerId: "farmer_1",
          farmerName: "Jean Baptiste",
          farmerContact: "+250788123456",
          collectionId: "collection_1",
          totalAmount: 456000,
          deductions: 50000,
          advances: 20000,
          netPayment: 386000,
          paymentMethod: "mobile_money",
          paymentStatus: "completed",
          paymentDate: "2024-01-15",
          processedBy: "Admin User",
          notes: "Payment processed successfully",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z"
        },
        {
          id: "2",
          farmerId: "farmer_2",
          farmerName: "Marie Claire",
          farmerContact: "+250788654321",
          collectionId: "collection_2",
          totalAmount: 345000,
          deductions: 30000,
          advances: 15000,
          netPayment: 300000,
          paymentMethod: "cash",
          paymentStatus: "pending",
          paymentDate: "2024-01-20",
          processedBy: "Admin User",
          notes: "Awaiting farmer confirmation",
          createdAt: "2024-01-20T14:30:00Z",
          updatedAt: "2024-01-20T14:30:00Z"
        },
        {
          id: "3",
          farmerId: "farmer_3",
          farmerName: "Paul Nkurunziza",
          farmerContact: "+250788987654",
          collectionId: "collection_3",
          totalAmount: 937500,
          deductions: 75000,
          advances: 30000,
          netPayment: 832500,
          paymentMethod: "bank_transfer",
          paymentStatus: "processing",
          paymentDate: "2024-01-22",
          processedBy: "Admin User",
          notes: "Bank transfer in progress",
          createdAt: "2024-01-22T09:15:00Z",
          updatedAt: "2024-01-22T09:15:00Z"
        }
      ]
      setPayments(mockPayments)
      setTotalPages(1)
      setTotalPayments(mockPayments.length)
      toast.error("Failed to fetch payments data - showing mock data")
    } finally {
      setPaymentsLoading(false)
    }
  }

  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem('Gemurai_token')
      const response = await fetch(`/api/v1/mcc/collections?mccId=${mccId || 'mcc_1760697250506'}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Transform collections data to include farmer info
        const collectionsData = data.data?.map((collection: any) => ({
          id: collection.id,
          farmerId: collection.farmerId,
          farmerName: collection.farmers?.name || 'Unknown Farmer',
          farmerContact: collection.farmers?.phone || '',
          totalLiters: collection.totalLiters,
          unitPrice: collection.unitPrice,
          totalAmount: collection.totalAmount,
          deductions: collection.totalDeductions || 0,
          advances: collection.advances || 0,
          netPayment: collection.netPayment || (collection.totalAmount - (collection.totalDeductions || 0) - (collection.advances || 0)),
          collectionDate: collection.collectionDate,
          status: collection.status
        })) || []
        setCollections(collectionsData)
      } else {
        console.error('Failed to fetch collections:', response.statusText)
        // Mock collections data
        const mockCollections: Collection[] = [
          {
            id: "collection_1",
            farmerId: "farmer_1760697404133_1",
            farmerName: "NDAGIJIMANA JMV",
            farmerContact: "+250788123456",
            totalLiters: 2400,
            unitPrice: 190,
            totalAmount: 456000,
            deductions: 50000,
            advances: 20000,
            netPayment: 386000,
            collectionDate: "2024-01-15",
            status: "PROCESSED"
          },
          {
            id: "collection_2",
            farmerId: "farmer_1760697404133_2",
            farmerName: "NDABABONYE Vicent",
            farmerContact: "+250788123457",
            totalLiters: 1500,
            unitPrice: 230,
            totalAmount: 345000,
            deductions: 30000,
            advances: 15000,
            netPayment: 300000,
            collectionDate: "2024-01-20",
            status: "PROCESSED"
          }
        ]
        setCollections(mockCollections)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
      // Use mock collections data when API fails
      const mockCollections: Collection[] = [
        {
          id: "collection_1",
          farmerId: "farmer_1760697404133_1",
          farmerName: "NDAGIJIMANA JMV",
          farmerContact: "+250788123456",
          totalLiters: 2400,
          unitPrice: 190,
          totalAmount: 456000,
          deductions: 50000,
          advances: 20000,
          netPayment: 386000,
          collectionDate: "2024-01-15",
          status: "PROCESSED"
        },
        {
          id: "collection_2",
          farmerId: "farmer_1760697404133_2",
          farmerName: "NDABABONYE Vicent",
          farmerContact: "+250788123457",
          totalLiters: 1500,
          unitPrice: 230,
          totalAmount: 345000,
          deductions: 30000,
          advances: 15000,
          netPayment: 300000,
          collectionDate: "2024-01-20",
          status: "PROCESSED"
        }
      ]
      setCollections(mockCollections)
      toast.error("Failed to fetch collections data - showing mock data")
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchPayments(currentPage), fetchCollections()])
    setIsRefreshing(false)
    toast.success("Payments data refreshed successfully")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchPayments(page)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
  }

  const handleProcessPayment = (collection: Collection) => {
    setSelectedCollection(collection)
    setFormData({
      paymentMethod: "mobile_money",
      notes: ""
    })
    setProcessPaymentOpen(true)
  }

  const handleOpenProcessPaymentDialog = async () => {
    setFormData({
      paymentMethod: "mobile_money",
      notes: ""
    })
    setSelectedCollection(null)
    
    // Ensure collections are loaded before opening dialog
    if (collections.length === 0) {
      toast.loading("Loading collections...", { id: "loading-collections" })
      await fetchCollections()
      toast.dismiss("loading-collections")
    }
    
    setProcessPaymentOpen(true)
  }

  const submitPayment = async () => {
    if (!selectedCollection) {
      toast.error("Please select a collection to process payment")
      return
    }

    if (!formData.paymentMethod) {
      toast.error("Please select a payment method")
      return
    }

    try {
      setIsProcessingPayment(true)
      // Show loading state
      toast.loading("Processing payment...", { id: "payment-processing" })

      const paymentData = {
        farmerId: selectedCollection.farmerId,
        collectionId: selectedCollection.id,
        totalAmount: selectedCollection.totalAmount,
        deductions: selectedCollection.deductions,
        advances: selectedCollection.advances,
        netPayment: selectedCollection.netPayment,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        mccId: mccId || 'mcc_1760697250506'
      }

      const token = localStorage.getItem('Gemurai_token')
      const response = await fetch('/api/v1/mcc/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to process payment')
      }

      toast.dismiss("payment-processing")
      toast.success("Payment processed successfully!")
      setProcessPaymentOpen(false)
      setSelectedCollection(null)
      // Reset form data
      setFormData({
        paymentMethod: "mobile_money",
        notes: ""
      })
      await fetchPayments(currentPage)
    } catch (error) {
      toast.dismiss("payment-processing")
      console.error('Error processing payment:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment'
      toast.error(errorMessage)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="h-3 w-3 mr-1" />Processing</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'mobile_money':
        return <Badge className="bg-purple-100 text-purple-800"><CreditCard className="h-3 w-3 mr-1" />Mobile Money</Badge>
      case 'cash':
        return <Badge className="bg-green-100 text-green-800"><Banknote className="h-3 w-3 mr-1" />Cash</Badge>
      case 'bank_transfer':
        return <Badge className="bg-blue-100 text-blue-800"><CreditCard className="h-3 w-3 mr-1" />Bank Transfer</Badge>
      default:
        return <Badge variant="secondary">{method}</Badge>
    }
  }

  // Filter payments based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPayments(payments)
    } else {
      const filtered = payments.filter(payment => {
        const farmerName = payment.farmerName.toLowerCase()
        const farmerContact = payment.farmerContact
        const paymentId = payment.id
        const paymentDate = new Date(payment.paymentDate).toLocaleDateString()
        const totalAmount = payment.totalAmount.toString()
        const netPayment = payment.netPayment.toString()
        const paymentStatus = payment.paymentStatus.toLowerCase()
        const paymentMethod = payment.paymentMethod.toLowerCase()
        
        const searchLower = searchQuery.toLowerCase()
        
        return (
          farmerName.includes(searchLower) ||
          farmerContact.includes(searchQuery) ||
          paymentId.includes(searchQuery) ||
          paymentDate.includes(searchQuery) ||
          totalAmount.includes(searchQuery) ||
          netPayment.includes(searchQuery) ||
          paymentStatus.includes(searchLower) ||
          paymentMethod.includes(searchLower)
        )
      })
      setFilteredPayments(filtered)
    }
  }, [payments, searchQuery])

  const totalPaymentsValue = payments.reduce((sum, payment) => sum + payment.netPayment, 0)
  const pendingPayments = payments.filter(payment => payment.paymentStatus === 'pending').length
  const processingPayments = payments.filter(payment => payment.paymentStatus === 'processing').length
  const completedPayments = payments.filter(payment => payment.paymentStatus === 'completed').length

  useEffect(() => {
    Promise.all([fetchPayments(1), fetchCollections()])
  }, [mccId])

  if (paymentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">Loading Payments Data...</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Payment Management</h2>
                <p className="text-gray-600">Process farmer payments and track transactions</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              <Input
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 w-80 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="lg"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
              disabled={isRefreshing || paymentsLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleOpenProcessPaymentDialog} 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Process Payments
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Payments</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 mb-1">{(totalPaymentsValue / 1000000).toFixed(1)}M</div>
            <p className="text-sm text-gray-600 font-medium">
              {payments.length} payments processed
            </p>
            <div className="mt-2 flex items-center text-xs text-purple-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-yellow-50 border-yellow-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Pending Payments</CardTitle>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700 mb-1">{pendingPayments}</div>
            <p className="text-sm text-gray-600 font-medium">
              Awaiting processing
            </p>
            <div className="mt-2 flex items-center text-xs text-yellow-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Requires attention
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Processing</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Loader2 className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-1">{processingPayments}</div>
            <p className="text-sm text-gray-600 font-medium">
              In progress
            </p>
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <Clock className="h-3 w-3 mr-1" />
              Being processed
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-green-50 border-green-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Completed</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-1">{completedPayments}</div>
            <p className="text-sm text-gray-600 font-medium">
              Successfully processed
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              All completed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Payment Records</CardTitle>
              <CardDescription className="text-gray-600 mt-1">All processed farmer payments</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {filteredPayments.length} records
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                <DollarSign className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Payments Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery ? 'No payments match your search criteria' : 'Start processing payments to track transactions'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={handleOpenProcessPaymentDialog} 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Process First Payment
                </Button>
              )}
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Farmer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Net Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredPayments.map((payment, index) => (
                    <tr key={payment.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 transition-all duration-200 group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-200">
                              <Users className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-900 transition-colors">
                              {payment.farmerName}
                            </div>
                            <div className="text-sm text-gray-500 group-hover:text-purple-600 transition-colors">
                              {payment.farmerContact}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-medium">{payment.totalAmount.toLocaleString()} Frw</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-bold text-green-600 text-lg">
                          {payment.netPayment.toLocaleString()} Frw
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {getPaymentMethodBadge(payment.paymentMethod)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {getPaymentStatusBadge(payment.paymentStatus)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-purple-600 hover:text-purple-900 hover:bg-purple-50 border-purple-200 rounded-lg transition-all duration-200"
                            onClick={() => {/* View payment details */}}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    {searchQuery ? (
                      <>Showing {filteredPayments.length} of {totalPayments} payments matching "{searchQuery}"</>
                    ) : (
                      <>Showing {((currentPage - 1) * paymentsPerPage) + 1} to {Math.min(currentPage * paymentsPerPage, totalPayments)} of {totalPayments} payments</>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || paymentsLoading}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      if (pageNum > totalPages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={paymentsLoading}
                          className={
                            pageNum === currentPage
                              ? "bg-purple-600 text-white hover:bg-purple-700"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || paymentsLoading}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Process Payment Dialog */}
      <Dialog open={processPaymentOpen} onOpenChange={setProcessPaymentOpen}>
        <DialogContent className="max-w-4xl bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">Process Payment</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">Select a collection to process payment for</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Collections List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700">Available Collections</Label>
                <div className="text-xs text-gray-500">
                  {collections.length} total collections • {collections.filter(c => c.status === 'PROCESSED').length} processed
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {collections.filter(c => c.status === 'PROCESSED').length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Processed Collections</h3>
                    <p className="text-gray-600 mb-4">There are no processed milk collections available for payment processing.</p>
                    <div className="text-sm text-gray-500">
                      Collections need to be marked as "PROCESSED" before payments can be processed.
                    </div>
                  </div>
                ) : (
                  collections.filter(c => c.status === 'PROCESSED').map((collection) => (
                    <Card 
                      key={collection.id} 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedCollection?.id === collection.id 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedCollection(collection)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Users className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{collection.farmerName}</div>
                              <div className="text-sm text-gray-500">{collection.farmerContact}</div>
                              <div className="text-xs text-gray-400">
                                {collection.totalLiters}L • {new Date(collection.collectionDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">{collection.netPayment.toLocaleString()} Frw</div>
                            <div className="text-xs text-gray-500">Net Payment</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Payment Details */}
            {selectedCollection && (
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Total Amount</Label>
                      <div className="font-semibold text-gray-900">{selectedCollection.totalAmount.toLocaleString()} Frw</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Deductions</Label>
                      <div className="font-semibold text-red-600">-{selectedCollection.deductions.toLocaleString()} Frw</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Advances</Label>
                      <div className="font-semibold text-orange-600">-{selectedCollection.advances.toLocaleString()} Frw</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Net Payment</Label>
                      <div className="font-bold text-green-600 text-lg">{selectedCollection.netPayment.toLocaleString()} Frw</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="paymentMethod" className="text-sm font-semibold text-gray-700">Payment Method *</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value: 'cash' | 'mobile_money' | 'bank_transfer') => setFormData({ ...formData, paymentMethod: value })}>
                      <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional payment notes"
                      rows={3}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => setProcessPaymentOpen(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
              onClick={submitPayment}
              disabled={!selectedCollection || !formData.paymentMethod || isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
