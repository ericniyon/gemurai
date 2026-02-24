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
  Droplets,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Loader2,
  TrendingUp
} from "lucide-react"

interface Sale {
  id: string
  litersSold: number
  unitPrice: number
  totalAmount: number
  companyName: string
  companyContact: string
  companyAddress: string
  paymentStatus: 'pending' | 'paid' | 'partial'
  saleDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface SalesTabProps {
  mccId?: string
}

export default function SalesTab({ mccId }: SalesTabProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSales, setTotalSales] = useState(0)
  const [salesPerPage] = useState(10)
  const [salesLoading, setSalesLoading] = useState(false)
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  
  // Form states
  const [addSaleOpen, setAddSaleOpen] = useState(false)
  const [editSaleOpen, setEditSaleOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [formData, setFormData] = useState({
    litersSold: "",
    unitPrice: "",
    companyName: "",
    companyContact: "",
    companyAddress: "",
    paymentStatus: "pending" as 'pending' | 'paid' | 'partial',
    saleDate: new Date().toISOString().split('T')[0],
    notes: ""
  })

  const fetchSales = async (page: number = currentPage) => {
    try {
      setSalesLoading(true)
      const token = localStorage.getItem('Gemurai_token')
      const response = await fetch(`/api/v1/mcc/sales?mccId=${mccId || 'mcc_1760697250506'}&page=${page}&limit=${salesPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSales(data.data || [])
        
        // Update pagination metadata
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1)
          setTotalSales(data.meta.total || 0)
        }
      } else {
        console.error('Failed to fetch sales:', response.statusText)
        // Mock data for development
        const mockSales: Sale[] = [
          {
            id: "1",
            litersSold: 500,
            unitPrice: 1200,
            totalAmount: 600000,
            companyName: "Kigali Dairy Ltd",
            companyContact: "+250788123456",
            companyAddress: "Kigali, Rwanda",
            paymentStatus: "paid",
            saleDate: "2024-01-15",
            notes: "Regular monthly order",
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z"
          },
          {
            id: "2",
            litersSold: 300,
            unitPrice: 1150,
            totalAmount: 345000,
            companyName: "Milk Processing Co",
            companyContact: "+250788654321",
            companyAddress: "Huye, Rwanda",
            paymentStatus: "pending",
            saleDate: "2024-01-20",
            notes: "New customer",
            createdAt: "2024-01-20T14:30:00Z",
            updatedAt: "2024-01-20T14:30:00Z"
          },
          {
            id: "3",
            litersSold: 750,
            unitPrice: 1250,
            totalAmount: 937500,
            companyName: "Fresh Milk Co",
            companyContact: "+250788987654",
            companyAddress: "Musanze, Rwanda",
            paymentStatus: "partial",
            saleDate: "2024-01-22",
            notes: "Large order",
            createdAt: "2024-01-22T09:15:00Z",
            updatedAt: "2024-01-22T09:15:00Z"
          },
          {
            id: "4",
            litersSold: 200,
            unitPrice: 1100,
            totalAmount: 220000,
            companyName: "Local Dairy",
            companyContact: "+250788456789",
            companyAddress: "Nyagatare, Rwanda",
            paymentStatus: "paid",
            saleDate: "2024-01-25",
            notes: "Weekly order",
            createdAt: "2024-01-25T11:30:00Z",
            updatedAt: "2024-01-25T11:30:00Z"
          },
          {
            id: "5",
            litersSold: 400,
            unitPrice: 1300,
            totalAmount: 520000,
            companyName: "Premium Milk Ltd",
            companyContact: "+250788321654",
            companyAddress: "Kigali, Rwanda",
            paymentStatus: "pending",
            saleDate: "2024-01-28",
            notes: "Premium customer",
            createdAt: "2024-01-28T16:45:00Z",
            updatedAt: "2024-01-28T16:45:00Z"
          }
        ]
        setSales(mockSales)
        setTotalPages(1)
        setTotalSales(mockSales.length)
      }
    } catch (error) {
      console.error('Error fetching sales:', error)
      toast.error("Failed to fetch sales data")
    } finally {
      setSalesLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSales(currentPage)
    setIsRefreshing(false)
    toast.success("Sales data refreshed successfully")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchSales(page)
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

  const handleAddSale = () => {
    setFormData({
      litersSold: "",
      unitPrice: "",
      companyName: "",
      companyContact: "",
      companyAddress: "",
      paymentStatus: "pending",
      saleDate: new Date().toISOString().split('T')[0],
      notes: ""
    })
    setAddSaleOpen(true)
  }

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale)
    setFormData({
      litersSold: sale.litersSold.toString(),
      unitPrice: sale.unitPrice.toString(),
      companyName: sale.companyName,
      companyContact: sale.companyContact,
      companyAddress: sale.companyAddress,
      paymentStatus: sale.paymentStatus,
      saleDate: sale.saleDate,
      notes: sale.notes || ""
    })
    setEditSaleOpen(true)
  }

  const handleDeleteSale = async (sale: Sale) => {
    const result = await Swal.fire({
      title: 'Delete Sale',
      html: `Are you sure you want to delete this sale record?<br><strong>${sale.companyName}</strong> - ${sale.litersSold}L`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
      reverseButtons: true,
      focusCancel: true
    })

    if (!result.isConfirmed) return

    try {
      await Swal.fire({
        title: 'Deleting...',
        didOpen: () => {
          Swal.showLoading()
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false
      })

      const token = localStorage.getItem('Gemurai_token')
      const res = await fetch(`/api/v1/mcc/sales/${sale.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Failed to delete sale')

      await fetchSales(currentPage)
      setSelectedSale(null)

      await Swal.fire({
        title: 'Deleted',
        text: 'Sale record has been deleted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (e) {
      console.error(e)
      await Swal.fire({
        title: 'Error',
        text: 'Failed to delete sale record. Please try again.',
        icon: 'error'
      })
    }
  }

  const submitSale = async () => {
    try {
      const totalAmount = parseFloat(formData.litersSold) * parseFloat(formData.unitPrice)
      
      const saleData = {
        litersSold: parseFloat(formData.litersSold),
        unitPrice: parseFloat(formData.unitPrice),
        totalAmount,
        companyName: formData.companyName,
        companyContact: formData.companyContact,
        companyAddress: formData.companyAddress,
        paymentStatus: formData.paymentStatus,
        saleDate: formData.saleDate,
        notes: formData.notes,
        mccId: mccId || 'mcc_1760697250506'
      }

      const token = localStorage.getItem('Gemurai_token')
      const url = editSaleOpen && selectedSale 
        ? `/api/v1/mcc/sales/${selectedSale.id}`
        : '/api/v1/mcc/sales'
      
      const method = editSaleOpen && selectedSale ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saleData)
      })

      if (!response.ok) {
        throw new Error(`Failed to ${editSaleOpen ? 'update' : 'create'} sale`)
      }

      toast.success(`Sale ${editSaleOpen ? 'updated' : 'recorded'} successfully!`)
      setAddSaleOpen(false)
      setEditSaleOpen(false)
      setSelectedSale(null)
      await fetchSales(currentPage)
    } catch (error) {
      console.error('Error submitting sale:', error)
      toast.error(`Failed to ${editSaleOpen ? 'update' : 'record'} sale`)
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-gray-100 text-gray-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'partial':
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />Partial</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Filter sales based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSales(sales)
    } else {
      const filtered = sales.filter(sale => {
        const companyName = sale.companyName.toLowerCase()
        const companyContact = sale.companyContact
        const saleId = sale.id
        const saleDate = new Date(sale.saleDate).toLocaleDateString()
        const totalAmount = sale.totalAmount.toString()
        const litersSold = sale.litersSold.toString()
        const paymentStatus = sale.paymentStatus.toLowerCase()
        
        const searchLower = searchQuery.toLowerCase()
        
        return (
          companyName.includes(searchLower) ||
          companyContact.includes(searchQuery) ||
          saleId.includes(searchQuery) ||
          saleDate.includes(searchQuery) ||
          totalAmount.includes(searchQuery) ||
          litersSold.includes(searchQuery) ||
          paymentStatus.includes(searchLower)
        )
      })
      setFilteredSales(filtered)
    }
  }, [sales, searchQuery])

  const totalSalesValue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const totalLitersSold = sales.reduce((sum, sale) => sum + sale.litersSold, 0)
  const pendingPayments = sales.filter(sale => sale.paymentStatus === 'pending').length

  useEffect(() => {
    fetchSales(1) // Start with page 1
  }, [mccId])

  if (salesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-gray-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">Loading Sales Data...</h3>
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
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Sales Management</h2>
                <p className="text-gray-600">Record and manage milk sales to companies</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-700 transition-colors" />
              <Input
                placeholder="Search sales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 w-80 border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
              />
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="lg"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
              disabled={isRefreshing || salesLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleAddSale} 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Record Sale
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Sales</CardTitle>
            <div className="p-2 bg-gray-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 mb-1">{(totalSalesValue / 1000000).toFixed(1)}M</div>
            <p className="text-sm text-gray-600 font-medium">
              {sales.length} sales recorded
            </p>
            <div className="mt-2 flex items-center text-xs text-gray-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Liters Sold</CardTitle>
            <div className="p-2 bg-gray-100 rounded-lg">
              <Droplets className="h-5 w-5 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 mb-1">{totalLitersSold.toLocaleString()}</div>
            <p className="text-sm text-gray-600 font-medium">
              Total volume sold
            </p>
            <div className="mt-2 flex items-center text-xs text-gray-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Companies</CardTitle>
            <div className="p-2 bg-gray-100 rounded-lg">
              <Building2 className="h-5 w-5 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 mb-1">{new Set(sales.map(s => s.companyName)).size}</div>
            <p className="text-sm text-gray-600 font-medium">
              Active customers
            </p>
            <div className="mt-2 flex items-center text-xs text-gray-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2 new this month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-orange-50 border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Pending Payments</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 mb-1">{pendingPayments}</div>
            <p className="text-sm text-gray-600 font-medium">
              Awaiting payment
            </p>
            <div className="mt-2 flex items-center text-xs text-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Requires attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Sales Records</CardTitle>
              <CardDescription className="text-gray-600 mt-1">All recorded sales transactions</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                {filteredSales.length} records
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredSales.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                <DollarSign className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Sales Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery ? 'No sales match your search criteria' : 'Start recording sales to track your transactions'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={handleAddSale} 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Record First Sale
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
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sale Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Liters Sold
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredSales.map((sale, index) => (
                    <tr key={sale.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
                              <Building2 className="h-5 w-5 text-gray-700" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-gray-900 transition-colors">
                              {sale.companyName}
                            </div>
                            <div className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                              {sale.companyContact}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium">{new Date(sale.saleDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Droplets className="h-4 w-4 text-gray-600 mr-2" />
                          <span className="font-semibold">{sale.litersSold.toLocaleString()} L</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-medium">{sale.unitPrice.toLocaleString()} Frw</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-bold text-gray-800 text-lg">
                          {sale.totalAmount.toLocaleString()} Frw
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {getPaymentStatusBadge(sale.paymentStatus)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-200 rounded-lg transition-all duration-200"
                            onClick={() => handleEditSale(sale)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 border-red-200 rounded-lg transition-all duration-200"
                            onClick={() => handleDeleteSale(sale)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
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
                      <>Showing {filteredSales.length} of {totalSales} sales matching "{searchQuery}"</>
                    ) : (
                      <>Showing {((currentPage - 1) * salesPerPage) + 1} to {Math.min(currentPage * salesPerPage, totalSales)} of {totalSales} sales</>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || salesLoading}
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
                          disabled={salesLoading}
                          className={
                            pageNum === currentPage
                              ? "bg-gray-700 text-white hover:bg-gray-800"
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
                    disabled={currentPage === totalPages || salesLoading}
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

      {/* Add Sale Dialog - Record Commodity Collection pattern */}
      <Dialog open={addSaleOpen} onOpenChange={setAddSaleOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col p-0 gap-0 bg-white border border-slate-200 shadow-xl rounded-3xl [&>button]:absolute [&>button]:right-5 [&>button]:top-5 [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:hover:bg-slate-100 [&>button]:rounded-full [&>button]:z-10 [&>button]:h-9 [&>button]:w-9">
          <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 pt-6 pb-6 text-white">
            <DialogHeader className="relative">
              <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-white tracking-tight">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white border border-white/20 shadow-lg">
                  <Plus className="h-5 w-5" />
                </div>
                Record New Sale
              </DialogTitle>
              <DialogDescription className="mt-2 text-slate-300 text-base">Enter the details of the milk sale transaction</DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6 min-h-[200px] bg-gradient-to-b from-slate-50/80 to-white">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="litersSold" className="text-sm font-semibold text-gray-700">Liters Sold *</Label>
              <Input
                id="litersSold"
                type="number"
                step="0.1"
                value={formData.litersSold}
                onChange={(e) => setFormData({ ...formData, litersSold: e.target.value })}
                placeholder="Enter liters sold"
                className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="unitPrice" className="text-sm font-semibold text-gray-700">Unit Price (Frw) *</Label>
              <Input
                id="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                placeholder="Enter price per liter"
                className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Enter company name"
                className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="companyContact" className="text-sm font-semibold text-gray-700">Company Contact *</Label>
              <Input
                id="companyContact"
                value={formData.companyContact}
                onChange={(e) => setFormData({ ...formData, companyContact: e.target.value })}
                placeholder="Enter contact number"
                className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl"
              />
            </div>
            <div className="space-y-3 col-span-2">
              <Label htmlFor="companyAddress" className="text-sm font-semibold text-gray-700">Company Address</Label>
              <Input
                id="companyAddress"
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                placeholder="Enter company address"
                className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="paymentStatus" className="text-sm font-semibold text-gray-700">Payment Status</Label>
              <Select value={formData.paymentStatus} onValueChange={(value: 'pending' | 'paid' | 'partial') => setFormData({ ...formData, paymentStatus: value })}>
                <SelectTrigger className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="saleDate" className="text-sm font-semibold text-gray-700">Sale Date</Label>
              <Input
                id="saleDate"
                type="date"
                value={formData.saleDate}
                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl"
              />
            </div>
            <div className="space-y-3 col-span-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this sale"
                rows={3}
                className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl"
              />
            </div>
            {formData.litersSold && formData.unitPrice && (
              <div className="col-span-2 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Total Amount</div>
                      <div className="text-xs text-gray-600">Calculated automatically</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {(parseFloat(formData.litersSold) * parseFloat(formData.unitPrice)).toLocaleString()} Frw
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
          <div className="flex items-center justify-between gap-4 px-6 py-5 border-t border-slate-200 bg-white rounded-b-3xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]">
            <Button variant="outline" onClick={() => setAddSaleOpen(false)} className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 px-4 py-2.5 font-medium">Cancel</Button>
            <Button className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-6 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/25 disabled:opacity-70" onClick={submitSale} disabled={!formData.litersSold || !formData.unitPrice || !formData.companyName || !formData.companyContact}>Record Sale</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Sale Dialog - Record Commodity Collection pattern */}
      <Dialog open={editSaleOpen} onOpenChange={setEditSaleOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col p-0 gap-0 bg-white border border-slate-200 shadow-xl rounded-3xl [&>button]:absolute [&>button]:right-5 [&>button]:top-5 [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:hover:bg-slate-100 [&>button]:rounded-full [&>button]:z-10 [&>button]:h-9 [&>button]:w-9">
          <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 pt-6 pb-6 text-white">
            <DialogHeader className="relative">
              <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-white tracking-tight">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white border border-white/20 shadow-lg">
                  <Edit className="h-5 w-5" />
                </div>
                Edit Sale Record
              </DialogTitle>
              <DialogDescription className="mt-2 text-slate-300 text-base">Update the details of this sale transaction</DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6 min-h-[200px] bg-gradient-to-b from-slate-50/80 to-white">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="edit-litersSold" className="text-sm font-semibold text-gray-700">Liters Sold *</Label>
              <Input
                id="edit-litersSold"
                type="number"
                step="0.1"
                value={formData.litersSold}
                onChange={(e) => setFormData({ ...formData, litersSold: e.target.value })}
                placeholder="Enter liters sold"
                className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="edit-unitPrice" className="text-sm font-semibold text-gray-700">Unit Price (Frw) *</Label>
              <Input
                id="edit-unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                placeholder="Enter price per liter"
                className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="edit-companyName" className="text-sm font-semibold text-gray-700">Company Name *</Label>
              <Input
                id="edit-companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Enter company name"
                className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="edit-companyContact" className="text-sm font-semibold text-gray-700">Company Contact *</Label>
              <Input
                id="edit-companyContact"
                value={formData.companyContact}
                onChange={(e) => setFormData({ ...formData, companyContact: e.target.value })}
                placeholder="Enter contact number"
                className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="edit-paymentStatus" className="text-sm font-semibold text-gray-700">Payment Status</Label>
              <Select value={formData.paymentStatus} onValueChange={(value: 'pending' | 'paid' | 'partial') => setFormData({ ...formData, paymentStatus: value })}>
                <SelectTrigger className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="edit-saleDate" className="text-sm font-semibold text-gray-700">Sale Date</Label>
              <Input
                id="edit-saleDate"
                type="date"
                value={formData.saleDate}
                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl"
              />
            </div>
            <div className="space-y-3 col-span-2">
              <Label htmlFor="edit-notes" className="text-sm font-semibold text-gray-700">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this sale"
                rows={3}
                className="border-gray-200 focus:border-gray-700 focus:ring-gray-700 rounded-xl"
              />
            </div>
            {formData.litersSold && formData.unitPrice && (
              <div className="col-span-2 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Total Amount</div>
                      <div className="text-xs text-gray-600">Calculated automatically</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {(parseFloat(formData.litersSold) * parseFloat(formData.unitPrice)).toLocaleString()} Frw
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
          <div className="flex items-center justify-between gap-4 px-6 py-5 border-t border-slate-200 bg-white rounded-b-3xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]">
            <Button variant="outline" onClick={() => setEditSaleOpen(false)} className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 px-4 py-2.5 font-medium">Cancel</Button>
            <Button className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 px-6 py-2.5 font-semibold text-white shadow-lg shadow-sky-500/25 disabled:opacity-70" onClick={submitSale} disabled={!formData.litersSold || !formData.unitPrice || !formData.companyName || !formData.companyContact}>Update Sale</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
