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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Package,
  Search,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Loader2,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  FileText,
  Save,
  X,
  ClipboardList
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface Supplier {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  procurements?: Array<{
    id: string
    status: string
    totalAmount: number
    procuredAt: string
  }>
}

export default function SuppliersPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSuppliers, setTotalSuppliers] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Form states
  const [addSupplierOpen, setAddSupplierOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    contactPerson: "",
    taxId: "",
    notes: "",
  })

  const fetchSuppliers = async (page: number = 1) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const url = new URL("/api/v1/mcc/suppliers", window.location.origin)
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
          setSuppliers(data.data || [])
          setTotalPages(data.meta?.totalPages || 1)
          setTotalSuppliers(data.meta?.total || 0)
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to fetch suppliers")
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      toast.error("Failed to fetch suppliers")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchSuppliers(currentPage)
    }
  }, [user, currentPage, searchQuery])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchSuppliers(currentPage)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchSuppliers(1)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required'
    }
    
    if (formData.phone.trim() && !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddSupplier = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsLoading(true)
    
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch("/api/v1/mcc/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          address: formData.address.trim() || null,
          district: formData.district.trim() || null,
          contactPerson: formData.contactPerson.trim() || null,
          taxId: formData.taxId.trim() || null,
          notes: formData.notes.trim() || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success("Supplier added successfully")
          setAddSupplierOpen(false)
          setFormData({ 
            name: "", 
            phone: "", 
            email: "", 
            address: "",
            district: "",
            contactPerson: "",
            taxId: "",
            notes: "",
          })
          setErrors({})
          fetchSuppliers(currentPage)
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to add supplier")
      }
    } catch (error) {
      console.error("Error adding supplier:", error)
      toast.error("Failed to add supplier")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseDialog = () => {
    if (!isLoading) {
      setFormData({ 
        name: "", 
        phone: "", 
        email: "", 
        address: "",
        district: "",
        contactPerson: "",
        taxId: "",
        notes: "",
      })
      setErrors({})
      setAddSupplierOpen(false)
    }
  }

  // Calculate statistics
  const totalSuppliersCount = suppliers.length
  const activeSuppliers = suppliers.filter((s) => s.procurements && s.procurements.length > 0).length
  const totalProcurements = suppliers.reduce((sum, s) => sum + (s.procurements?.length || 0), 0)

  if (loading && suppliers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h2 className="text-sm sm:text-base font-semibold text-gray-700">Loading Suppliers...</h2>
        </div>
      </div>
    )
  }

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
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setAddSupplierOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  <Plus className="h-4 w-4" />
                  Add Supplier
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
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Total Suppliers
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{totalSuppliersCount}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <Package className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    <strong className="font-semibold text-gray-900">{activeSuppliers}</strong> active
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
                      Active Suppliers
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{activeSuppliers}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Currently supplying milk
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-purple-100/60 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                      Total Procurements
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{totalProcurements}</p>
                  </div>
                  <div className="rounded-2xl bg-purple-50 p-3">
                    <DollarSign className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Procurement transactions
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Suppliers Table */}
          <section className="mt-12 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Suppliers</h2>
                <p className="text-sm text-gray-600">
                  View and manage all supplier records and procurement history.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600">
                <ClipboardList className="h-4 w-4" />
                {loading ? "Loading…" : `${totalSuppliers} ${totalSuppliers === 1 ? 'supplier' : 'suppliers'}`}
              </div>
            </div>

            <Card className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-white to-blue-50/50">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Supplier Records</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Complete list of suppliers with contact details and procurement statistics.
                    </CardDescription>
                  </div>
                  <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Input
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 h-10 w-full sm:w-64 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg bg-white shadow-sm"
                      style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                    />
                  </form>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {suppliers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-gray-500">
                    <Package className="h-12 w-12 text-gray-300" />
                    <div>
                      <p className="text-lg font-semibold text-gray-700">No supplier records</p>
                      <p className="text-sm text-gray-500">
                        {searchQuery
                          ? `No suppliers match "${searchQuery}". Try a different search term.`
                          : "Start adding suppliers to track milk collections and manage relationships."}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setAddSupplierOpen(true)} 
                      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Supplier
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-blue-50/70">
                          <TableRow>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">NO.</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">SUPPLIER</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">CONTACT</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">ADDRESS</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-center">PROCUREMENTS</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-center">STATUS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {suppliers.map((supplier, index) => (
                            <TableRow key={supplier.id} className="hover:bg-blue-50/30">
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold">
                                  {((currentPage - 1) * 10) + index + 1}
                                </span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div className="font-semibold text-gray-900">{supplier.name}</div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  {supplier.phone && <Phone className="h-3.5 w-3.5 text-gray-400" />}
                                  {supplier.email && <Mail className="h-3.5 w-3.5 text-gray-400" />}
                                  <span>{supplier.phone || supplier.email || "N/A"}</span>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  {supplier.address && <MapPin className="h-3.5 w-3.5 text-gray-400" />}
                                  <span>{supplier.address || "N/A"}</span>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-center">
                                <Badge variant="secondary" className="text-xs px-3 py-1 font-semibold rounded-full bg-blue-100 text-blue-700 border-blue-200">
                                  {supplier.procurements?.length || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-center">
                                <Badge
                                  variant={
                                    supplier.procurements && supplier.procurements.length > 0
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={`text-xs px-3 py-1 font-semibold rounded-full ${
                                    supplier.procurements && supplier.procurements.length > 0
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : "bg-amber-100 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  {supplier.procurements && supplier.procurements.length > 0
                                    ? "Active"
                                    : "Inactive"}
                                </Badge>
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
                          <span className="font-semibold text-gray-900">{Math.min(currentPage * 10, totalSuppliers)}</span> of{' '}
                          <span className="font-semibold text-gray-900">{totalSuppliers}</span> suppliers
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

          {/* Add Supplier Dialog */}
          <Dialog open={addSupplierOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl bg-white border-2 border-gray-200 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Add New Supplier
              </DialogTitle>
              <DialogDescription>
                Enter supplier information to add them to your system
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={(e) => { e.preventDefault(); handleAddSupplier(); }} className="space-y-4">
              <div className="space-y-4">
                {/* Supplier Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Supplier/Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter supplier or company name"
                    className={errors.name ? "border-red-500" : ""}
                    style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Contact Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+250 788 123 456"
                      className={`pl-12 pr-2 ${errors.phone ? "border-red-500" : ""}`}
                      style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '3rem' }}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="supplier@example.com"
                      className={`pl-12 pr-2 ${errors.email ? "border-red-500" : ""}`}
                      style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '3rem' }}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Grid for Address and District */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Address
                    </Label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Street address"
                        className="pl-10 pr-2 min-h-[80px]"
                        style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* District */}
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-sm font-medium">
                      District/City
                    </Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="e.g. Kigali, Musanze"
                      style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Grid for Contact Person and Tax ID */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Contact Person */}
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="text-sm font-medium">
                      Contact Person
                    </Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="Primary contact person name"
                        className="pl-10 pr-2"
                        style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Tax ID */}
                  <div className="space-y-2">
                    <Label htmlFor="taxId" className="text-sm font-medium">
                      Tax ID / Registration Number
                    </Label>
                    <Input
                      id="taxId"
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      placeholder="Optional for businesses"
                      style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Additional Notes
                  </Label>
                  <div className="relative">
                    <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional information about the supplier..."
                      className="pl-10 min-h-[80px]"
                      style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Supplier
                    </>
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

