"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import Swal from "sweetalert2"
import {
  Users,
  Droplets,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Plus,
  Search,
  RefreshCw,
  BarChart3,
  PieChart,
  Download,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Package,
  X
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { MCCStats, Farmer, MilkCollection, MCCPeriod } from "@/types/mcc"
import { AddFarmerForm } from "./components/AddFarmerForm"
import { AddCollectionForm } from "./components/AddCollectionForm"
import { GenerateReportForm } from "./components/GenerateReportForm"
import ReportsTab from "./components/ReportsTab"
import { ViewAnalytics } from "./components/ViewAnalytics"
import SalesTab from "./components/SalesTab"
import StockTab from "./components/StockTab"
import PaymentsTab from "./components/PaymentsTab"

export default function MCCDashboard() {
  const [stats, setStats] = useState<MCCStats>({
    totalFarmers: 0,
    activeFarmers: 0,
    totalMilkCollected: 0,
    totalAmountPaid: 0,
    totalDeductions: 0,
    averageMilkPerFarmer: 0,
    currentPeriod: 1,
    pendingPayments: 0,
    completedPeriods: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  
  // Get tab from URL search params
  const initialTab = searchParams?.get('tab') || "overview"
  const [tab, setTab] = useState(initialTab)
  
  // Update tab when URL changes
  useEffect(() => {
    const tabParam = searchParams?.get('tab')
    const validTabs = ['overview', 'farmers', 'collections', 'stock', 'sales', 'payments', 'reports', 'settings', 'customers', 'ikofi']
    if (tabParam && validTabs.includes(tabParam)) {
      // Map customers and ikofi to existing tabs
      if (tabParam === 'customers') {
        setTab('sales') // Customers view uses sales tab
      } else if (tabParam === 'ikofi') {
        setTab('payments') // Ikofi uses payments tab
      } else {
        setTab(tabParam)
      }
    }
  }, [searchParams])
  
  // Handle tab change and update URL
  const handleTabChange = (newTab: string) => {
    setTab(newTab)
    router.push(`/${lang}/dashboard/mcc?tab=${newTab}`)
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [collections, setCollections] = useState<MilkCollection[]>([])
  const [periods, setPeriods] = useState<MCCPeriod[]>([])
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCollections, setTotalCollections] = useState(0)
  const [collectionsPerPage] = useState(10)
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  
  // Search and filtering
  const [filteredCollections, setFilteredCollections] = useState<MilkCollection[]>([])
  
  // Form modal states
  const [addFarmerOpen, setAddFarmerOpen] = useState(false)
  const [addCollectionOpen, setAddCollectionOpen] = useState(false)
  const [generateReportOpen, setGenerateReportOpen] = useState(false)
  const [viewAnalyticsOpen, setViewAnalyticsOpen] = useState(false)
  const [viewFarmerOpen, setViewFarmerOpen] = useState(false)
  const [editFarmerOpen, setEditFarmerOpen] = useState(false)
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; phone: string; location: string; isActive: boolean }>({
    name: "",
    phone: "",
    location: "",
    isActive: true
  })

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch real farmers data from API
      const farmersResponse = await fetch('/api/v1/mcc/farmers?mccId=mcc_1760697250506', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`
        }
      })
      
      if (farmersResponse.ok) {
        const farmersData = await farmersResponse.json()
        setFarmers(farmersData.data || [])
        
        // Calculate stats from real data
        const totalFarmers = farmersData.data?.length || 0
        const activeFarmers = farmersData.data?.filter((f: any) => f.isActive).length || 0
        
        setStats({
          totalFarmers,
          activeFarmers,
          totalMilkCollected: 0, // Will be updated by fetchCollections
          totalAmountPaid: 0, // Will be updated by fetchCollections
          totalDeductions: 0, // Will be updated by fetchCollections
          averageMilkPerFarmer: 0, // Will be updated by fetchCollections
          currentPeriod: 1, // Will be updated by fetchCollections
          pendingPayments: 0, // Will be updated by fetchCollections
          completedPeriods: 12
        })
      } else {
        console.error('Failed to fetch farmers:', farmersResponse.statusText)
        // Fallback to mock data if API fails
        setFarmers([
          {
            id: "1",
            farmerNumber: 1,
            name: "NDAGIJIMANA JMV",
            phone: "+250788123456",
            location: "Kicukiro",
            registrationDate: "2024-01-15",
            status: "active",
            totalMilkCollected: 4234,
            totalAmountEarned: 804460,
            lastCollectionDate: "2024-10-15"
          }
        ])
        
        setStats({
          totalFarmers: 1,
          activeFarmers: 1,
          totalMilkCollected: 0, // Will be updated by fetchCollections
          totalAmountPaid: 0, // Will be updated by fetchCollections
          totalDeductions: 0, // Will be updated by fetchCollections
          averageMilkPerFarmer: 0, // Will be updated by fetchCollections
          currentPeriod: 1, // Will be updated by fetchCollections
          pendingPayments: 0, // Will be updated by fetchCollections
          completedPeriods: 12
        })
      }

    } catch (error) {
      console.error("Error fetching MCC stats:", error)
      toast.error("Failed to fetch MCC statistics")
    } finally {
      setLoading(false)
    }
  }

  const calculateStatsFromCollections = (collections: any[]) => {
    const totalMilkCollected = collections.reduce((sum, collection) => sum + (collection.totalLiters || 0), 0)
    const totalAmountPaid = collections.reduce((sum, collection) => sum + (collection.totalAmount || 0), 0)
    const totalDeductions = collections.reduce((sum, collection) => sum + (collection.totalDeductions || 0), 0)
    const averageMilkPerFarmer = farmers.length > 0 ? Math.round(totalMilkCollected / farmers.length) : 0
    
    // Calculate current period based on latest collection date
    const latestCollection = collections.length > 0 ? collections[0] : null
    const currentPeriod = latestCollection ? latestCollection.period : 1
    
    // Count pending collections (status !== 'completed')
    const pendingPayments = collections.filter(c => c.status !== 'completed').length
    
    return {
      totalMilkCollected,
      totalAmountPaid,
      totalDeductions,
      averageMilkPerFarmer,
      currentPeriod,
      pendingPayments
    }
  }

  const fetchCollections = async (page: number = currentPage) => {
    try {
      setCollectionsLoading(true)
      const response = await fetch(`/api/v1/mcc/collections?page=${page}&limit=${collectionsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const collectionsData = data.data || []
        setCollections(collectionsData)
        
        // Update pagination metadata
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1)
          setTotalCollections(data.meta.total || 0)
        }
        
        // Update stats based on collections data
        const collectionStats = calculateStatsFromCollections(collectionsData)
        setStats(prev => ({
          ...prev,
          ...collectionStats
        }))
      } else {
        console.error('Failed to fetch collections:', response.statusText)
        setCollections([])
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
      setCollections([])
    } finally {
      setCollectionsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchStats()
    await fetchCollections(currentPage)
    setIsRefreshing(false)
    toast.success("MCC data refreshed successfully")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchCollections(page)
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

  const handleAddFarmer = () => {
    console.log("Add Farmer button clicked")
    setAddFarmerOpen(true)
  }

  const handleAddCollection = () => {
    console.log("Add Collection button clicked")
    setAddCollectionOpen(true)
  }

  const handleCollectionSuccess = () => {
    fetchCollections(currentPage) // This will also update stats automatically
  }

  const handleGenerateReport = () => {
    console.log("Generate Report button clicked")
    setGenerateReportOpen(true)
  }

  const handleViewAnalytics = () => {
    console.log("View Analytics button clicked")
    setViewAnalyticsOpen(true)
  }

  const handleConfigure = () => {
    console.log("Configure button clicked")
    toast.success("Opening MCC settings...")
    // TODO: Implement settings modal/form
  }

  const openViewFarmer = (farmer: Farmer) => {
    setSelectedFarmer(farmer)
    setViewFarmerOpen(true)
  }

  const openEditFarmer = (farmer: Farmer) => {
    setSelectedFarmer(farmer)
    setEditForm({
      name: farmer.name || "",
      phone: (farmer as any).phone || "",
      location: (farmer as any).location || "",
      isActive: (farmer as any).isActive ?? true
    })
    setEditFarmerOpen(true)
  }

  const handleDeleteFarmer = async (farmer: Farmer) => {
    setSelectedFarmer(farmer)
    const result = await Swal.fire({
      title: 'Delete Farmer',
      html: `Are you sure you want to delete <strong>${farmer.name}</strong>? This action cannot be undone.`,
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

      const res = await fetch(`/api/v1/mcc/farmers/${farmer.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`
        }
      })

      if (!res.ok) throw new Error('Failed to delete farmer')

      await fetchStats()
      setSelectedFarmer(null)

      await Swal.fire({
        title: 'Deleted',
        text: 'Farmer has been deleted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (e) {
      console.error(e)
      await Swal.fire({
        title: 'Error',
        text: 'Failed to delete farmer. Please try again.',
        icon: 'error'
      })
    }
  }

  const submitEditFarmer = async () => {
    if (!selectedFarmer) return
    try {
      const res = await fetch(`/api/v1/mcc/farmers/${selectedFarmer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`
        },
        body: JSON.stringify(editForm)
      })
      if (!res.ok) throw new Error('Failed to update farmer')
      toast.success('Farmer updated')
      setEditFarmerOpen(false)
      setSelectedFarmer(null)
      await fetchStats()
    } catch (e) {
      toast.error('Failed to update farmer')
      console.error(e)
    }
  }

  

  useEffect(() => {
    fetchStats()
    fetchCollections(1) // Start with page 1
  }, [])

  // Filter collections based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCollections(collections)
    } else {
      const filtered = collections.filter(collection => {
        const farmerName = collection.farmers?.name || collection.farmerName || ''
        const collectionDate = new Date(collection.collectionDate).toLocaleDateString()
        const period = collection.period?.toString() || ''
        const totalLiters = collection.totalLiters?.toString() || ''
        const totalAmount = collection.totalAmount?.toString() || ''
        const status = collection.status || ''
        
        const searchLower = searchQuery.toLowerCase()
        
        return (
          farmerName.toLowerCase().includes(searchLower) ||
          collectionDate.includes(searchQuery) ||
          period.includes(searchQuery) ||
          totalLiters.includes(searchQuery) ||
          totalAmount.includes(searchQuery) ||
          status.toLowerCase().includes(searchLower)
        )
      })
      setFilteredCollections(filtered)
    }
  }, [collections, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-gray-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Loading MCC Dashboard...</h2>
          <p className="text-gray-500">Please wait while we fetch your data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Droplets className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Milk Collection Cooperative</h1>
                  <p className="text-sm text-gray-500">Manage farmers, collections, and payments</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search farmers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                  />
                </div>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={handleAddFarmer} className="bg-gray-700 hover:bg-gray-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Farmer
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 pb-6">
            {/* Farmers Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Farmers</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalFarmers}</p>
                  <p className="text-xs text-gray-700">{stats.activeFarmers} active</p>
                </div>
              </div>
            </div>

            {/* Milk Collected Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Milk Collected</p>
                  <p className="text-2xl font-semibold text-gray-900">{(stats.totalMilkCollected / 1000).toFixed(1)}k L</p>
                  <p className="text-xs text-gray-500">Total liters</p>
                </div>
              </div>
            </div>

            {/* Total Amount Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-2xl font-semibold text-gray-900">{(stats.totalAmountPaid / 1000000).toFixed(1)}M Frw</p>
                  <p className="text-xs text-gray-500">Paid to farmers</p>
                </div>
              </div>
            </div>

            {/* Average Milk Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg per Farmer</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.averageMilkPerFarmer.toLocaleString()} L</p>
                  <p className="text-xs text-gray-500">Per farmer</p>
                </div>
              </div>
            </div>

            {/* Current Period Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Current Period</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.currentPeriod}</p>
                  <p className="text-xs text-gray-500">Quinzenne</p>
                </div>
              </div>
            </div>

            {/* Pending Payments Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingPayments}</p>
                  <p className="text-xs text-red-600">Payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={tab} onValueChange={handleTabChange} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 p-1">
            <TabsList className="grid w-full grid-cols-8 bg-transparent h-auto p-0">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white py-3 px-4 rounded-md transition-all duration-200 hover:bg-gray-100"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="farmers"
                className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white py-3 px-4 rounded-md transition-all duration-200 hover:bg-gray-100"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Farmers</span>
              </TabsTrigger>
              <TabsTrigger
                value="collections"
                className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white py-3 px-4 rounded-md transition-all duration-200 hover:bg-gray-100"
              >
                <Droplets className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Collections</span>
              </TabsTrigger>
              <TabsTrigger
                value="stock"
                className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white py-3 px-4 rounded-md transition-all duration-200 hover:bg-gray-100"
              >
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Stock</span>
              </TabsTrigger>
              <TabsTrigger
                value="sales"
                className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white py-3 px-4 rounded-md transition-all duration-200 hover:bg-gray-100"
              >
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Sales</span>
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white py-3 px-4 rounded-md transition-all duration-200 hover:bg-gray-100"
              >
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Payments</span>
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white py-3 px-4 rounded-md transition-all duration-200 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Reports</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center gap-2 data-[state=active]:bg-gray-700 data-[state=active]:text-white py-3 px-4 rounded-md transition-all duration-200 hover:bg-gray-100"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg border border-gray-200">
            <TabsContent value="overview" className="m-0">
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Quick Actions */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Button onClick={handleAddFarmer} className="h-20 flex flex-col items-center justify-center space-y-2 bg-gray-700 hover:bg-gray-800 text-white">
                          <Users className="h-6 w-6" />
                          <span className="text-sm font-medium">Add Farmer</span>
                        </Button>
                        <Button onClick={handleAddCollection} className="h-20 flex flex-col items-center justify-center space-y-2 bg-gray-700 hover:bg-gray-800 text-white">
                          <Droplets className="h-6 w-6" />
                          <span className="text-sm font-medium">Add Collection</span>
                        </Button>
                        <Button onClick={handleGenerateReport} className="h-20 flex flex-col items-center justify-center space-y-2 bg-gray-700 hover:bg-gray-800 text-white">
                          <FileText className="h-6 w-6" />
                          <span className="text-sm font-medium">Generate Report</span>
                        </Button>
                        <Button onClick={handleViewAnalytics} className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-600 hover:bg-orange-700 text-white">
                          <PieChart className="h-6 w-6" />
                          <span className="text-sm font-medium">View Analytics</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((item) => (
                          <div key={item} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="p-2 bg-gray-100 rounded-full">
                              <Droplets className="h-4 w-4 text-gray-700" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">Milk collection recorded</p>
                              <p className="text-xs text-gray-500">2 minutes ago</p>
                            </div>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800">New</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Overview Content */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 text-gray-700 mr-2" />
                      Top Performers
                    </h3>
                    <div className="space-y-3">
                      {farmers.slice(0, 3).map((farmer, index) => (
                        <div key={farmer.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{farmer.name}</p>
                              <p className="text-xs text-gray-500">{farmer.totalMilkCollected} L</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{farmer.totalAmountEarned.toLocaleString()} Frw</p>
                            <p className="text-xs text-gray-700">+{Math.floor(Math.random() * 20) + 5}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      Alerts & Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-50 border border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-900">Pending Payments</p>
                          <p className="text-xs text-red-600">{stats.pendingPayments} farmers waiting</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Period Ending</p>
                          <p className="text-xs text-yellow-600">Current period ends in 3 days</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 text-gray-700 mr-2" />
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Collection Rate</span>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Payment Accuracy</span>
                        <span className="text-sm font-medium">98%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="farmers" className="m-0">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Farmers Management</h2>
                  <div className="flex space-x-2">
                    <Button onClick={handleAddFarmer} className="bg-gray-700 hover:bg-gray-800 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Farmer
                    </Button>
                  </div>
                </div>

                {/* Farmers Table */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Registered Farmers</h3>
                    <p className="text-sm text-gray-500">Total: {farmers.length} farmers</p>
                  </div>
                  
                  {farmers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Farmer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {farmers.map((farmer) => (
                            <tr key={farmer.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                      <Users className="h-5 w-5 text-gray-700" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {farmer.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      ID: {farmer.id.slice(-8)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{farmer.phone || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{farmer.email || 'No email'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{farmer.location || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  farmer.isActive 
                                    ? 'bg-gray-100 text-gray-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {farmer.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-gray-700 hover:text-gray-900"
                                    onClick={() => openViewFarmer(farmer)}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-gray-700 hover:text-gray-900"
                                    onClick={() => openEditFarmer(farmer)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-900"
                                    onClick={() => handleDeleteFarmer(farmer)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Farmers Found</h3>
                      <p className="text-gray-500 mb-4">Start by adding your first farmer to the system</p>
                      <Button onClick={handleAddFarmer} className="bg-gray-700 hover:bg-gray-800 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Farmer
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="collections" className="m-0">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Milk Collections</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search collections..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 w-64 border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <Button 
                      onClick={() => fetchCollections(currentPage)} 
                      variant="outline" 
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      disabled={collectionsLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${collectionsLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button onClick={handleAddCollection} className="bg-gray-700 hover:bg-gray-800 text-white">
                      <Droplets className="h-4 w-4 mr-2" />
                      Add Collection
                    </Button>
                  </div>
                </div>

                {collectionsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 text-gray-600 animate-spin mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Collections...</h3>
                    <p className="text-gray-500">Please wait while we fetch your data</p>
                  </div>
                ) : filteredCollections.length === 0 ? (
                  <div className="text-center py-12">
                    <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery ? 'No Collections Found' : 'No Collection Records'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery 
                        ? `No collections match "${searchQuery}". Try a different search term.`
                        : 'Start recording milk collections to track daily quantities'
                      }
                    </p>
                    {!searchQuery && (
                      <Button onClick={handleAddCollection} className="bg-gray-700 hover:bg-gray-800 text-white">
                        <Droplets className="h-4 w-4 mr-2" />
                        Record First Collection
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Farmer
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Collection Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Period
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Liters
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Unit Price
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Amount
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Deductions
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Net Payment
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCollections.map((collection) => (
                              <tr key={collection.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8">
                                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-gray-700" />
                                      </div>
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">
                                        {collection.farmers?.name || 'Unknown Farmer'}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {collection.farmers?.phone || 'No phone'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(collection.collectionDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <Badge variant="outline" className="text-xs">
                                    Period {collection.period || 'N/A'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="flex items-center">
                                    <Droplets className="h-4 w-4 text-gray-600 mr-1" />
                                    {collection.totalLiters?.toLocaleString() || '0'} L
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {collection.unitPrice?.toLocaleString() || '0'} Frw
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="font-medium text-gray-700">
                                    {collection.totalAmount?.toLocaleString() || '0'} Frw
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="text-red-600">
                                    {collection.totalDeductions?.toLocaleString() || '0'} Frw
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="font-medium text-gray-700">
                                    {collection.netPayment?.toLocaleString() || '0'} Frw
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge 
                                    variant={collection.status === 'completed' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {collection.status || 'pending'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-700">
                          <span>
                            {searchQuery ? (
                              <>Showing {filteredCollections.length} of {totalCollections} collections matching "{searchQuery}"</>
                            ) : (
                              <>Showing {((currentPage - 1) * collectionsPerPage) + 1} to {Math.min(currentPage * collectionsPerPage, totalCollections)} of {totalCollections} collections</>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1 || collectionsLoading}
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
                                  disabled={collectionsLoading}
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
                            disabled={currentPage === totalPages || collectionsLoading}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stock" className="m-0">
              <StockTab mccId="mcc_1760697250506" />
            </TabsContent>

            <TabsContent value="sales" className="m-0">
              <SalesTab mccId="mcc_1760697250506" />
            </TabsContent>

            <TabsContent value="payments" className="m-0">
              <PaymentsTab mccId="mcc_1760697250506" />
            </TabsContent>

            <TabsContent value="reports" className="m-0">
              <ReportsTab mccId="mcc_1760697250506" />
            </TabsContent>

            <TabsContent value="settings" className="m-0">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">MCC Settings</h2>
                  <Button onClick={handleConfigure} className="bg-gray-600 hover:bg-gray-700 text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">System Configuration</h3>
                  <p className="text-gray-500">Configure MCC settings and preferences</p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Form Modals */}
      <AddFarmerForm 
        open={addFarmerOpen} 
        onOpenChange={setAddFarmerOpen}
        onSuccess={() => {
          toast.success("Farmer added successfully!")
          fetchStats() // Refresh data
        }}
      />
      
      <AddCollectionForm 
        open={addCollectionOpen} 
        onOpenChange={setAddCollectionOpen}
        onSuccess={() => {
          toast.success("Collection recorded successfully!")
          fetchCollections(currentPage) // This will also update stats automatically
        }}
      />
      
      <GenerateReportForm 
        open={generateReportOpen} 
        onOpenChange={setGenerateReportOpen}
        onSuccess={() => {
          toast.success("Report generated successfully!")
        }}
      />
      
      <ViewAnalytics 
        open={viewAnalyticsOpen} 
        onOpenChange={setViewAnalyticsOpen}
        onSuccess={() => {
          // Analytics view doesn't need success callback
        }}
      />

      {/* View Farmer Dialog */}
      <Dialog open={viewFarmerOpen} onOpenChange={setViewFarmerOpen}>
        <DialogContent className="max-w-lg bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle>Farmer Details</DialogTitle>
            <DialogDescription>Basic information about this farmer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{selectedFarmer?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{(selectedFarmer as any)?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{(selectedFarmer as any)?.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{(selectedFarmer as any)?.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewFarmerOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Farmer Dialog */}
      <Dialog open={editFarmerOpen} onOpenChange={setEditFarmerOpen}>
        <DialogContent className="max-w-lg bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle>Edit Farmer</DialogTitle>
            <DialogDescription>Update farmer details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Name</p>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Phone</p>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Location</p>
              <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Active</p>
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFarmerOpen(false)}>Cancel</Button>
            <Button className="bg-gray-700 hover:bg-gray-800 text-white" onClick={submitEditFarmer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete handled via SweetAlert2 */}
    </div>
  )
}
