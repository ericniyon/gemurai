"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  Clock, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  Eye,
  Sparkles,
  Zap,
  Shield,
  Award
} from "lucide-react"
import { toast } from "sonner"

interface Voucher {
  id: string
  code: string
  value: number
  remainingBalance: number
  status: string
  createdAt: string
  expiresAt?: string | null
  dcc?: {
    id: string
    name: string
    email: string
  }
  creator?: {
    id: string
    name: string
    email: string
  }
}

export default function VouchersPage() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const { user, isAuthenticated } = useAuth()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [dccFilter, setDccFilter] = useState("all")
  const [paginationInfo, setPaginationInfo] = useState<{total: number, current: number} | null>(null)
  const [loadingAll, setLoadingAll] = useState(false)
  const [dccSearchTerm, setDccSearchTerm] = useState("")

  // Define roles and flags
  const isAdminOrEmployer = user?.role === "ADMIN" || user?.role === "EMPLOYER" || user?.role === "SUPER_ADMIN" || user?.role === "BRANCH_MANAGER"
  const isBranchManager = user?.role === "BRANCH_MANAGER"

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const token = localStorage.getItem("Gemurai_token")
        // For admin/employer users, request a higher limit to get all vouchers
        const limit = isAdminOrEmployer ? 100 : 10
        const res = await fetch(`/api/v1/vouchers?limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
        const data = await res.json()
        if (data.success) {
          setVouchers(data.data.vouchers)
          setPaginationInfo({
            total: data.data.pagination.total,
            current: data.data.vouchers.length
          })
          console.log(`Fetched ${data.data.vouchers.length} vouchers out of ${data.data.pagination.total} total`)
        } else {
          setError(data.message || "Failed to load vouchers")
        }
      } catch (e: any) {
        setError(e.message || "Failed to load vouchers")
      } finally {
        setLoading(false)
      }
    }
    
    if (isAuthenticated) {
      fetchVouchers()
    }
  }, [isAuthenticated, isAdminOrEmployer])

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success("Voucher code copied to clipboard!")
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      toast.error("Failed to copy voucher code")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'PARTIALLY_USED':
        return <TrendingUp className="h-5 w-5 text-blue-500" />
      case 'USED':
        return <AlertCircle className="h-5 w-5 text-gray-500" />
      case 'EXPIRED':
        return <Clock className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PARTIALLY_USED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'USED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUsagePercentage = (value: number, remaining: number) => {
    const used = value - remaining
    return Math.round((used / value) * 100)
  }

  const totalValue = vouchers.reduce((sum, v) => sum + v.value, 0)
  const totalRemaining = vouchers.reduce((sum, v) => sum + v.remainingBalance, 0)
  const totalUsed = totalValue - totalRemaining
  const activeVouchers = vouchers.filter(v => v.status === 'ACTIVE').length

  // Filter vouchers based on search, status, and DCC
  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || voucher.status === statusFilter
    const matchesDCC = dccFilter === "all" || voucher.dcc?.id === dccFilter
    return matchesSearch && matchesStatus && matchesDCC
  })

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDccFilter("all")
    setDccSearchTerm("")
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || dccFilter !== "all"

  // Get unique DCCs for filter
  const uniqueDCCs = [...new Set(vouchers.map(v => v.dcc?.id).filter(Boolean))]
  
  // Filter DCCs based on search term
  const filteredDCCs = vouchers
    .filter(v => v.dcc)
    .filter((voucher, index, self) => 
      index === self.findIndex(v => v.dcc?.id === voucher.dcc?.id)
    )
    .filter(voucher => 
      voucher.dcc!.name.toLowerCase().includes(dccSearchTerm.toLowerCase())
    )

  const loadAllVouchers = async () => {
    if (!isAdminOrEmployer) return
    
    setLoadingAll(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const res = await fetch(`/api/v1/vouchers?limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      const data = await res.json()
      if (data.success) {
        setVouchers(data.data.vouchers)
        setPaginationInfo({
          total: data.data.pagination.total,
          current: data.data.vouchers.length
        })
        toast.success(`Loaded all ${data.data.vouchers.length} vouchers`)
      }
    } catch (e: any) {
      toast.error("Failed to load all vouchers")
    } finally {
      setLoadingAll(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header Skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatCurrency(totalValue)}
                  </p>
                  <p className="text-xs text-gray-500">All vouchers combined</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hide Available Balance for Branch Managers */}
          {!isBranchManager && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      {isAdminOrEmployer ? "Total Available" : "Available Balance"}
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {formatCurrency(totalRemaining)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isAdminOrEmployer ? "Across all DCCs" : "Ready for purchases"}
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Used</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {formatCurrency(totalUsed)}
                  </p>
                  <p className="text-xs text-gray-500">Spent so far</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                                 <div className="space-y-2">
                   <p className="text-sm font-medium text-gray-600">Active Vouchers</p>
                   <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                     {activeVouchers}
                   </p>
                   <p className="text-xs text-gray-500">
                     {isAdminOrEmployer ? "Across all DCCs" : "Ready to use"}
                   </p>
                 </div>
                <div className="h-14 w-14 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="bg-red-50 border-red-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

                 {/* Search and Filters */}
         <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
           <CardContent className="p-6">
             <div className="flex flex-col lg:flex-row gap-4">
               <div className="flex-1 relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                 <Input
                   placeholder="Search vouchers by code..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                 />
               </div>
               <div className="flex items-center gap-3">
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                   <SelectTrigger className="w-48 h-12 !bg-white !border-gray-300 border-2 rounded-xl">
                     <SelectValue placeholder="Filter by status" />
                   </SelectTrigger>
                   <SelectContent className="!bg-white border border-gray-300">
                     <SelectItem value="all">All Statuses</SelectItem>
                     <SelectItem value="ACTIVE">Active</SelectItem>
                     <SelectItem value="PARTIALLY_USED">Partially Used</SelectItem>
                     <SelectItem value="USED">Used</SelectItem>
                     <SelectItem value="EXPIRED">Expired</SelectItem>
                   </SelectContent>
                 </Select>
                 {isAdminOrEmployer && (
                   <Select value={dccFilter} onValueChange={setDccFilter}>
                     <SelectTrigger className="w-48 h-12 !bg-white !border-gray-300 border-2 rounded-xl">
                       <SelectValue placeholder="Filter by DCC" />
                     </SelectTrigger>
                     <SelectContent className="!bg-white border border-gray-300">
                       <div className="p-2 border-b border-gray-200">
                         <Input
                           placeholder="Search DCCs..."
                           value={dccSearchTerm}
                           onChange={(e) => setDccSearchTerm(e.target.value)}
                           className="!bg-white border border-gray-300 text-sm"
                         />
                       </div>
                       <SelectItem value="all">All DCCs</SelectItem>
                       {filteredDCCs.map(voucher => (
                         <SelectItem key={voucher.dcc!.id} value={voucher.dcc!.id}>
                           {voucher.dcc!.name}
                         </SelectItem>
                       ))}
                       {filteredDCCs.length === 0 && dccSearchTerm && (
                         <div className="px-2 py-1 text-sm text-gray-500">
                           No DCCs found
                         </div>
                       )}
                     </SelectContent>
                   </Select>
                 )}
                 {hasActiveFilters && (
                   <Button variant="outline" onClick={clearFilters} className="h-12 px-4 border-2 border-gray-200 rounded-xl">
                     Clear
                   </Button>
                 )}
                 {isAdminOrEmployer && paginationInfo && paginationInfo.total > paginationInfo.current && (
                   <Button 
                     variant="outline" 
                     onClick={loadAllVouchers} 
                     disabled={loadingAll}
                     className="h-12 px-4 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl"
                   >
                     {loadingAll ? (
                       <>
                         <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                         Loading...
                       </>
                     ) : (
                       <>
                         <Download className="h-4 w-4 mr-2" />
                         Load All ({paginationInfo.total})
                       </>
                     )}
                   </Button>
                 )}
               </div>
             </div>
           </CardContent>
         </Card>

        {/* Vouchers Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
                         <div>
               <h2 className="text-2xl font-bold text-gray-900">
                 {isAdminOrEmployer ? "All Vouchers" : "Your Vouchers"}
               </h2>
               <p className="text-gray-600">
                 {filteredVouchers.length} of {vouchers.length} voucher{filteredVouchers.length !== 1 ? 's' : ''}
                 {hasActiveFilters && " (filtered)"}
                 {paginationInfo && paginationInfo.total > paginationInfo.current && (
                   <span className="text-blue-600 font-medium">
                     {" "}(showing {paginationInfo.current} of {paginationInfo.total} total)
                   </span>
                 )}
               </p>
             </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">
                <Sparkles className="h-4 w-4 mr-1 text-blue-500" />
                Secure
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Shield className="h-4 w-4 mr-1 text-green-500" />
                Verified
              </Badge>
            </div>
          </div>

          {filteredVouchers.length === 0 && !error ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardContent className="p-16 text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                  <CreditCard className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Vouchers Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {hasActiveFilters 
                    ? "No vouchers match your current filters. Try adjusting your search criteria."
                    : "You don't have any vouchers at the moment. Request your first voucher to get started."
                  }
                </p>
                {hasActiveFilters ? (
                  <Button onClick={clearFilters} variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Clear Filters
                  </Button>
                ) : (
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Plus className="h-4 w-4" />
                    Request Your First Voucher
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredVouchers.map((voucher) => (
                <Card key={voucher.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                          {getStatusIcon(voucher.status)}
                        </div>
                                                 <div>
                           <CardTitle className="text-xl font-bold text-gray-900 font-mono">
                             {voucher.code}
                           </CardTitle>
                           <CardDescription className="text-sm text-gray-600">
                             Created {new Date(voucher.createdAt).toLocaleDateString()}
                             {isAdminOrEmployer && voucher.dcc && (
                               <span className="block text-blue-600 font-medium">
                                 DCC: {voucher.dcc.name}
                               </span>
                             )}
                           </CardDescription>
                         </div>
                      </div>
                      <Badge className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(voucher.status)}`}>
                        {voucher.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Usage Progress */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Usage Progress</span>
                        <span className="font-bold text-gray-900">
                          {getUsagePercentage(voucher.value, voucher.remainingBalance)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${getUsagePercentage(voucher.value, voucher.remainingBalance)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Total Value</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(voucher.value)}</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Remaining</p>
                        <p className="text-xl font-bold text-green-700">{formatCurrency(voucher.remainingBalance)}</p>
                      </div>
                    </div>

                    {/* Expiry Date */}
                    {voucher.expiresAt && (
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Expires</p>
                          <p className="text-sm text-yellow-700">{new Date(voucher.expiresAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2 h-11 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        onClick={() => copyToClipboard(voucher.code)}
                      >
                        {copiedCode === voucher.code ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy Code
                          </>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 gap-2 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                        disabled={voucher.status !== 'ACTIVE' && voucher.status !== 'PARTIALLY_USED'}
                      >
                        <Wallet className="h-4 w-4" />
                        Use Voucher
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-11 w-11 p-0 hover:bg-gray-100"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
