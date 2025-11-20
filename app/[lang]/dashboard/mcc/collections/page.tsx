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
  Droplets,
  Search,
  RefreshCw,
  DollarSign,
  Calendar,
  Loader2,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  ClipboardList
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { AddCollectionForm } from "../components/AddCollectionForm"

interface Collection {
  id: string
  collectionDate: string
  totalLiters: number
  unitPrice: number
  totalAmount: number
  netPayment: number
  status: string
  qualityStatus: string
  farmers?: {
    id: string
    name: string
    phone: string
  }
}

export default function CollectionsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  
  const [collections, setCollections] = useState<Collection[]>([])
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
    totalVolume: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCollections, setTotalCollections] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [addCollectionOpen, setAddCollectionOpen] = useState(false)

  const fetchCollections = async (page: number = 1) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const url = new URL("/api/v1/mcc/collections", window.location.origin)
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
          const fetchedCollections = data.data || []
          setCollections(fetchedCollections)
          setTotalPages(data.meta?.totalPages || 1)
          setTotalCollections(data.meta?.total || 0)
          
          // Calculate statistics from fetched data
          const total = data.meta?.total || 0
          const accepted = fetchedCollections.filter((c) => c.status === "APPROVED").length
          const pending = fetchedCollections.filter((c) => c.status === "PENDING").length
          const totalVolume = fetchedCollections.reduce((sum, c) => sum + (c.totalLiters || 0), 0)
          
          setStats({
            total,
            accepted,
            pending,
            totalVolume,
          })
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to fetch collections")
      }
    } catch (error) {
      console.error("Error fetching collections:", error)
      toast.error("Failed to fetch collections")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCollections(currentPage)
    }
  }, [user, currentPage, searchQuery])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchCollections(currentPage)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCollections(1)
  }

  const handleCollectionSuccess = () => {
    fetchCollections(currentPage)
  }

  if (loading && collections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h2 className="text-sm sm:text-base font-semibold text-gray-700">Loading Collections...</h2>
        </div>
      </div>
    )
  }

  const pageTitle = "Milk Collections"
  const pageSubtitle = "Track and manage daily milk collection from suppliers and farmers"

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
                <Droplets className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  MCC Manager • Collections
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{pageTitle}</h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">{pageSubtitle}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setAddCollectionOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  <Plus className="h-4 w-4" />
                  Record Collection
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

          {/* Summary Cards */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Total Collections
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <Droplets className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    <strong className="font-semibold text-gray-900">{stats.accepted}</strong> accepted
                  </span>
                  <span>
                    <strong className="font-semibold text-gray-900">{stats.pending}</strong> pending
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
                      Accepted Collections
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{stats.accepted}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Quality approved and ready for processing
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-amber-100/50 via-orange-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                      Pending Review
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Awaiting quality approval
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
                      Total Volume
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {stats.totalVolume.toFixed(1)}<span className="text-lg text-gray-600">L</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-indigo-50 p-3">
                    <Droplets className="h-6 w-6 text-indigo-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Collected from <strong className="font-semibold text-gray-900">{stats.total}</strong> collections
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Collections Table */}
          <section className="mt-12 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Collections</h2>
                <p className="text-sm text-gray-600">
                  View and manage all milk collection records from farmers.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600">
                <ClipboardList className="h-4 w-4" />
                {loading ? "Loading…" : `${totalCollections} ${totalCollections === 1 ? 'collection' : 'collections'}`}
              </div>
            </div>

            <Card className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-white to-blue-50/50">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Collection Records</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Complete list of milk collections with farmer details and payment information.
                    </CardDescription>
                  </div>
                  <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Input
                      placeholder="Search by farmer name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 h-10 w-full sm:w-64 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg bg-white shadow-sm"
                      style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                    />
                  </form>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {collections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-gray-500">
                    <Droplets className="h-12 w-12 text-gray-300" />
                    <div>
                      <p className="text-lg font-semibold text-gray-700">No collection records</p>
                      <p className="text-sm text-gray-500">
                        {searchQuery
                          ? `No collections match "${searchQuery}". Try a different search term.`
                          : "Start recording milk collections to track daily quantities and manage your inventory efficiently."}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setAddCollectionOpen(true)} 
                      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                    >
                      <Plus className="h-4 w-4" />
                      Record First Collection
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-blue-50/70">
                          <TableRow>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">
                              NO.
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">
                              SUPPLIER
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-right">
                              QUANTITY (L)
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-right">
                              PRICE/LITER (RWF)
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-right">
                              TOTAL VALUE (RWF)
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-center">
                              STATUS
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">
                              COLLECTION DATE
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700 text-center">
                              ACTIONS
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {collections.map((collection, index) => (
                            <TableRow key={collection.id} className="hover:bg-blue-50/30">
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold">
                                  {((currentPage - 1) * 10) + index + 1}
                                </span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                    {(collection.farmers?.name || "U")[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      {collection.farmers?.name || "Unknown Farmer"}
                                    </div>
                                    {collection.farmers?.phone && (
                                      <div className="text-xs text-gray-500">
                                        {collection.farmers.phone}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-right">
                                <span className="font-semibold text-gray-900">
                                  {collection.totalLiters.toFixed(1)}<span className="text-gray-500 text-xs ml-1">L</span>
                                </span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-right">
                                <span className="font-medium text-gray-700">
                                  {collection.unitPrice.toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-right">
                                <span className="font-bold text-gray-900">
                                  {collection.totalAmount.toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700 text-center">
                                <Badge
                                  variant={
                                    collection.status === "APPROVED"
                                      ? "default"
                                      : collection.status === "PENDING"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className={`text-xs px-3 py-1 font-semibold rounded-full ${
                                    collection.status === "APPROVED"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : collection.status === "PENDING"
                                      ? "bg-amber-100 text-amber-700 border-amber-200"
                                      : "bg-red-100 text-red-700 border-red-200"
                                  }`}
                                >
                                  {collection.status === "APPROVED" ? "Accepted" : collection.status === "PENDING" ? "Pending" : collection.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>
                                    {new Date(collection.collectionDate).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
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
                          <span className="font-semibold text-gray-900">{Math.min(currentPage * 10, totalCollections)}</span> of{' '}
                          <span className="font-semibold text-gray-900">{totalCollections}</span> collections
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

          {/* Add Collection Dialog */}
          <AddCollectionForm
            open={addCollectionOpen}
            onOpenChange={setAddCollectionOpen}
            onSuccess={handleCollectionSuccess}
          />
        </div>
      </div>
    </div>
  )
}

