"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Swal from "sweetalert2"
import {
  ShoppingCart,
  Search,
  RefreshCw,
  DollarSign,
  Calendar,
  Loader2,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  Edit,
  Trash2,
  Droplets,
  ClipboardList
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface Sale {
  id: string
  litersSold: number
  unitPrice: number
  totalAmount: number
  companyName: string
  companyContact: string
  companyAddress: string
  paymentStatus: 'pending' | 'paid' | 'partial' | 'rejected'
  saleDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function SalesPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  
  const [sales, setSales] = useState<Sale[]>([])
  const [stats, setStats] = useState({
    totalLiters: 0,
    totalRevenue: 0,
    totalSales: 0,
    acceptedSales: 0,
    rejectedSales: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSales, setTotalSales] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Form states
  const [addSaleOpen, setAddSaleOpen] = useState(false)
  const [editSaleOpen, setEditSaleOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const fetchSales = async (page: number = 1) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const url = new URL("/api/v1/mcc/sales", window.location.origin)
      if (user?.mccId) {
        url.searchParams.set("mccId", user.mccId)
      }
      url.searchParams.set("page", page.toString())
      url.searchParams.set("limit", "10")
      if (searchQuery) {
        url.searchParams.set("search", searchQuery)
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSales(data.data || [])
          setTotalPages(data.pagination?.totalPages || 1)
          setTotalSales(data.pagination?.total || 0)
          
          // Calculate statistics
          const totalLiters = sales.reduce((sum, s) => sum + (s.litersSold || 0), 0)
          const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
          const acceptedSales = sales.filter((s) => s.paymentStatus === "paid").length
          const rejectedSales = sales.filter((s) => s.paymentStatus === "rejected").length
          
          setStats({
            totalLiters,
            totalRevenue,
            totalSales: sales.length,
            acceptedSales,
            rejectedSales,
          })
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to fetch sales")
      }
    } catch (error) {
      console.error("Error fetching sales:", error)
      toast.error("Failed to fetch sales")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchSales(currentPage)
    }
  }, [user, currentPage, searchQuery])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchSales(currentPage)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchSales(1)
  }

  const handleAddSale = () => {
    setSelectedSale(null)
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
      companyAddress: sale.companyAddress || "",
      paymentStatus: sale.paymentStatus,
      saleDate: new Date(sale.saleDate).toISOString().split('T')[0],
      notes: sale.notes || ""
    })
    setEditSaleOpen(true)
  }

  const handleDeleteSale = async (sale: Sale) => {
    const result = await Swal.fire({
      title: 'Delete Sale',
      html: `Are you sure you want to delete this sale record?<br/><strong>${sale.companyName}</strong> - ${sale.litersSold}L`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
      reverseButtons: true,
    })

    if (!result.isConfirmed) return

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/mcc/sales/${sale.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("Sale deleted successfully")
        fetchSales(currentPage)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to delete sale")
      }
    } catch (error) {
      console.error("Error deleting sale:", error)
      toast.error("Failed to delete sale")
    }
  }

  const handleSubmitSale = async () => {
    try {
      if (!formData.litersSold || !formData.unitPrice || !formData.companyName || !formData.companyContact) {
        toast.error("Please fill in all required fields")
        return
      }

      setIsSubmitting(true)
      const token = localStorage.getItem("Gemurai_token")
      const saleData = {
        litersSold: parseFloat(formData.litersSold),
        unitPrice: parseFloat(formData.unitPrice),
        companyName: formData.companyName,
        companyContact: formData.companyContact,
        companyAddress: formData.companyAddress,
        paymentStatus: formData.paymentStatus,
        saleDate: formData.saleDate,
        notes: formData.notes,
        mccId: user?.mccId,
      }

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

      if (response.ok) {
        toast.success(`Sale ${editSaleOpen ? 'updated' : 'recorded'} successfully!`)
        setAddSaleOpen(false)
        setEditSaleOpen(false)
        setSelectedSale(null)
        fetchSales(currentPage)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || `Failed to ${editSaleOpen ? 'update' : 'record'} sale`)
      }
    } catch (error) {
      console.error('Error submitting sale:', error)
      toast.error(`Failed to ${editSaleOpen ? 'update' : 'record'} sale`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      paid: { variant: "default" as const, label: "Paid" },
      pending: { variant: "secondary" as const, label: "Pending" },
      partial: { variant: "secondary" as const, label: "Partial" },
      rejected: { variant: "destructive" as const, label: "Rejected" },
    }
    const config = variants[status] || { variant: "secondary" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading && sales.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h2 className="text-sm sm:text-base font-semibold text-gray-700">Loading Sales...</h2>
        </div>
      </div>
    )
  }

  const pageTitle = "Milk Sales"
  const pageSubtitle = "Manage all milk sales records to customers"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full px-0 py-10">
          <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-1.5 shadow-sm ring-1 ring-gray-200">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  MCC Manager • Sales
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{pageTitle}</h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">{pageSubtitle}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleAddSale}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  <Plus className="h-4 w-4" />
                  Record Sale
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing || loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-white hover:shadow-md disabled:cursor-not-allowed"
                >
                  <RefreshCw className={cn("h-4 w-4", (isRefreshing || loading) && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </div>
          </header>
        
        <div className="w-full px-2 sm:px-3 py-4 sm:py-6 space-y-4 sm:space-y-6">

          {/* Summary Cards */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Total Liters Sold
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {stats.totalLiters.toFixed(1)}<span className="text-lg text-gray-600">L</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <Droplets className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    From <strong className="font-semibold text-gray-900">{stats.totalSales}</strong> sales
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-emerald-100/50 via-teal-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                      Total Revenue
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      RWF {(stats.totalRevenue / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <DollarSign className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Total sales revenue
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-green-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-green-100/50 via-emerald-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-green-600">
                      Accepted Sales
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{stats.acceptedSales}</p>
                  </div>
                  <div className="rounded-2xl bg-green-50 p-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Payment confirmed
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-rose-100/50 via-red-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-rose-600">
                      Rejected Sales
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{stats.rejectedSales}</p>
                  </div>
                  <div className="rounded-2xl bg-rose-50 p-3">
                    <AlertTriangle className="h-6 w-6 text-rose-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Require attention
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Sales Table */}
          <section className="mt-12 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Sales</h2>
                <p className="text-sm text-gray-600">
                  View and manage all milk sales records and customer transactions.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600">
                <ClipboardList className="h-4 w-4" />
                {loading ? "Loading…" : `${totalSales} ${totalSales === 1 ? 'sale' : 'sales'}`}
              </div>
            </div>

            <Card className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-white to-blue-50/50">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Sales Records</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Complete list of milk sales with customer details and payment information.
                    </CardDescription>
                  </div>
                  <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Input
                      placeholder="Search by customer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 h-10 w-full sm:w-64 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg bg-white shadow-sm"
                      style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                    />
                  </form>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {sales.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-gray-500">
                    <ShoppingCart className="h-12 w-12 text-gray-300" />
                    <div>
                      <p className="text-lg font-semibold text-gray-700">No sales records</p>
                      <p className="text-sm text-gray-500">
                        {searchQuery
                          ? `No sales match "${searchQuery}". Try a different search term.`
                          : "Start recording milk sales to track revenue and customer transactions."}
                      </p>
                    </div>
                    <Button 
                      onClick={handleAddSale} 
                      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                    >
                      <Plus className="h-4 w-4" />
                      Record First Sale
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-blue-50/70">
                          <TableRow>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">NO.</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">CUSTOMER</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">SALE DATE</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-right">LITERS</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-right">UNIT PRICE (RWF)</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-right">TOTAL (RWF)</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-center">STATUS</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-center">ACTIONS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sales.map((sale, index) => (
                            <TableRow key={sale.id} className="hover:bg-blue-50/30">
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold">
                                  {((currentPage - 1) * 10) + index + 1}
                                </span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div>
                                  <div className="font-semibold text-gray-900">{sale.companyName}</div>
                                  <div className="text-xs text-gray-500">{sale.companyContact}</div>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>
                                    {new Date(sale.saleDate).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-right">
                                <span className="font-semibold text-gray-900">
                                  {sale.litersSold.toFixed(0)}<span className="text-gray-500 text-xs ml-1">L</span>
                                </span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-right">
                                <span className="font-medium text-gray-700">{sale.unitPrice.toLocaleString()}</span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-right">
                                <span className="font-bold text-gray-900">{sale.totalAmount.toLocaleString()}</span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-center">
                                {getPaymentStatusBadge(sale.paymentStatus)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-center">
                                <div className="flex gap-1 justify-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSale(sale)}
                                    className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSale(sale)}
                                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                        <p className="text-sm font-medium text-gray-700">
                          Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * 10) + 1}</span> to{' '}
                          <span className="font-semibold text-gray-900">{Math.min(currentPage * 10, totalSales)}</span> of{' '}
                          <span className="font-semibold text-gray-900">{totalSales}</span> sales
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
                          >
                            Previous
                          </Button>
                          <div className="flex items-center gap-1 px-2">
                            <span className="text-sm font-medium text-gray-700">
                              Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                              <span className="font-semibold text-gray-900">{totalPages}</span>
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
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
          </section>

          {/* Add/Edit Sale Dialog - Redesigned */}
          <Dialog open={addSaleOpen || editSaleOpen} onOpenChange={(open) => {
          setAddSaleOpen(open)
          setEditSaleOpen(open)
          if (!open) {
            setSelectedSale(null)
          }
        }}>
          <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <DialogHeader className="space-y-1 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    {editSaleOpen ? "Edit Sale" : "Record Sale"}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600">
                    {editSaleOpen ? "Update sale record details" : "Record a new milk sale to a customer"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmitSale()
              }}
              className="space-y-5 pt-1"
            >
              {/* Sale details */}
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-3">Sale Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="litersSold" className="text-sm font-medium text-gray-700">Liters Sold *</Label>
                      <Input
                        id="litersSold"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.litersSold}
                        onChange={(e) => setFormData({ ...formData, litersSold: e.target.value })}
                        placeholder="0.00"
                        className="rounded-lg border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice" className="text-sm font-medium text-gray-700">Unit Price (RWF) *</Label>
                      <Input
                        id="unitPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                        placeholder="0.00"
                        className="rounded-lg border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  {formData.litersSold && formData.unitPrice && parseFloat(formData.litersSold) > 0 && parseFloat(formData.unitPrice) > 0 && (
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-4 py-2.5 border border-emerald-200">
                      <span className="text-sm font-medium text-gray-600">Total Amount</span>
                      <span className="text-lg font-bold text-emerald-700">
                        RWF {(parseFloat(formData.litersSold || "0") * parseFloat(formData.unitPrice || "0")).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Customer info */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-3">Customer Information</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Customer Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Enter customer or company name"
                        className="rounded-lg border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyContact" className="text-sm font-medium text-gray-700">Contact *</Label>
                      <Input
                        id="companyContact"
                        value={formData.companyContact}
                        onChange={(e) => setFormData({ ...formData, companyContact: e.target.value })}
                        placeholder="Phone or email"
                        className="rounded-lg border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyAddress" className="text-sm font-medium text-gray-700">Address</Label>
                      <Input
                        id="companyAddress"
                        value={formData.companyAddress}
                        onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                        placeholder="Delivery or billing address"
                        className="rounded-lg border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment & date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus" className="text-sm font-medium text-gray-700">Payment Status</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value: any) => setFormData({ ...formData, paymentStatus: value })}
                    >
                      <SelectTrigger className="rounded-lg border-gray-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="saleDate" className="text-sm font-medium text-gray-700">Sale Date</Label>
                    <Input
                      id="saleDate"
                      type="date"
                      value={formData.saleDate}
                      onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                      className="rounded-lg border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes (optional)"
                    rows={2}
                    className="rounded-lg border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-gray-100 gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddSaleOpen(false)
                    setEditSaleOpen(false)
                    setSelectedSale(null)
                  }}
                  className="rounded-xl border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editSaleOpen ? "Updating..." : "Recording..."}
                    </>
                  ) : (
                    editSaleOpen ? "Update Sale" : "Record Sale"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
        </div>
      </div>
    </div>
  )
}

