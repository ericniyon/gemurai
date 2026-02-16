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
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Users,
  Search,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Calendar,
  Loader2,
  Plus,
  Building2,
  Phone,
  MapPin,
  ClipboardList
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { AddCustomerForm } from "../components/AddCustomerForm"

interface Customer {
  name: string
  contact: string
  address: string
  totalPurchases: number
  totalAmount: number
  lastPurchaseDate: string
  avgPricePerLiter: number
  totalLiters: number
  paymentStatus: string
}

interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  avgPricePerLiter: number
  totalRevenue: number
}

interface CustomersPageProps {
  triggerOpenAddDialog?: boolean
  onTriggerConsumed?: () => void
}

export default function CustomersPage({ triggerOpenAddDialog, onTriggerConsumed }: CustomersPageProps = {}) {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    avgPricePerLiter: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)

  const fetchCustomers = async (page: number = 1) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const url = new URL("/api/v1/mcc/customers", window.location.origin)
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
          setCustomers(data.data || [])
          setStats(data.statistics || stats)
          setTotalPages(data.meta?.totalPages || 1)
          setTotalCustomers(data.meta?.total || 0)
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to fetch customers")
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast.error("Failed to fetch customers")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCustomers(currentPage)
    }
  }, [user, currentPage, searchQuery])

  useEffect(() => {
    if (triggerOpenAddDialog) {
      setAddCustomerOpen(true)
      onTriggerConsumed?.()
    }
  }, [triggerOpenAddDialog, onTriggerConsumed])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchCustomers(currentPage)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCustomers(1)
  }

  const handleCustomerSuccess = () => {
    fetchCustomers(currentPage)
  }

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h2 className="text-sm sm:text-base font-semibold text-gray-700">Loading Customers...</h2>
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
                  onClick={() => setAddCustomerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  <Plus className="h-4 w-4" />
                  Add Customer
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
                      Total Customers
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    <strong className="font-semibold text-gray-900">{stats.activeCustomers}</strong> active
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
                      Active Customers
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{stats.activeCustomers}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <Users className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Currently purchasing from MCC
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
                      Avg Price/Liter
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      RWF {stats.avgPricePerLiter.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-purple-50 p-3">
                    <DollarSign className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Average selling price
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-indigo-100/60 via-purple-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                      Total Revenue
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      RWF {(stats.totalRevenue / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="rounded-2xl bg-indigo-50 p-3">
                    <TrendingUp className="h-6 w-6 text-indigo-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    From <strong className="font-semibold text-gray-900">{stats.totalCustomers}</strong> customers
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Customers Table */}
          <section className="mt-12 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Customers</h2>
                <p className="text-sm text-gray-600">
                  View and manage all customer records and their purchase history.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600">
                <ClipboardList className="h-4 w-4" />
                {loading ? "Loading…" : `${totalCustomers} ${totalCustomers === 1 ? 'customer' : 'customers'}`}
              </div>
            </div>

            <Card className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-white to-blue-50/50">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Customer Records</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Complete list of customers with contact details and purchase statistics.
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
                {customers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-gray-500">
                    <Users className="h-12 w-12 text-gray-300" />
                    <div>
                      <p className="text-lg font-semibold text-gray-700">No customer records</p>
                      <p className="text-sm text-gray-500">
                        {searchQuery
                          ? `No customers match "${searchQuery}". Try a different search term.`
                          : "Start adding customers to track their purchases and manage relationships."}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setAddCustomerOpen(true)} 
                      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Customer
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
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">PHONE</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">ADDRESS</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-right">PRICE/LITER (RWF)</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-right">AVG SUPPLY (L)</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-center">STATUS</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">REGISTERED</TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-center">ACTIONS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.map((customer, index) => (
                            <TableRow key={`${customer.name}-${index}`} className="hover:bg-blue-50/30">
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold">
                                  {((currentPage - 1) * 10) + index + 1}
                                </span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div className="font-semibold text-gray-900">{customer.name}</div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                {customer.contact || "N/A"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                {customer.address || "N/A"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-right">
                                <span className="font-medium text-gray-900">{customer.avgPricePerLiter.toLocaleString()}</span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-right">
                                <span className="font-medium text-gray-900">{customer.totalLiters ? customer.totalLiters.toFixed(1) : "0.0"}</span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-center">
                                <Badge
                                  variant={customer.paymentStatus === "PAID" ? "default" : "secondary"}
                                  className={`text-xs px-3 py-1 font-semibold rounded-full ${
                                    customer.paymentStatus === "PAID"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : "bg-amber-100 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  {customer.paymentStatus || "Active"}
                                </Badge>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>
                                    {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric'
                                    }) : "N/A"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <span className="text-gray-600 text-lg">⋯</span>
                                </Button>
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
                          <span className="font-semibold text-gray-900">{Math.min(currentPage * 10, totalCustomers)}</span> of{' '}
                          <span className="font-semibold text-gray-900">{totalCustomers}</span> customers
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

          {/* Add Customer Dialog */}
          <AddCustomerForm
            open={addCustomerOpen}
            onOpenChange={setAddCustomerOpen}
            onSuccess={handleCustomerSuccess}
          />
        </div>
        </div>
      </div>
    </div>
  )
}

