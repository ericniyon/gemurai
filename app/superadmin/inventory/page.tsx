"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { 
  Warehouse, 
  MapPin, 
  ArrowRightLeft, 
  Settings, 
  BarChart3, 
  Plus,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Boxes,
  Repeat,
  ClipboardCheck,
  BarChart2,
  Truck,
  DollarSign,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Activity,
  Zap,
  Shield,
  Target,
  Users,
  Calendar,
  Bell,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react"
import { WarehouseManagement } from "@/app/components/inventory/WarehouseManagement"
import { LocationManagement } from "@/app/components/inventory/LocationManagement"
import { StockManagement } from "@/app/components/inventory/StockManagement"
import { StockMovesManagement } from "@/app/components/inventory/StockMovesManagement"
import { InventoryAdjustments } from "@/app/components/inventory/InventoryAdjustments"
import { CycleCounts } from "@/app/components/inventory/CycleCounts"
import { ScrapInventory } from "@/app/components/inventory/ScrapInventory"
import { ProductCatalog } from "@/app/components/inventory/ProductCatalog"
import { InventoryReceiving } from "@/app/components/inventory/InventoryReceiving"
import { useAuth } from "@/hooks/use-auth"

interface InventoryStats {
  totalWarehouses: number
  totalLocations: number
  totalProducts: number
  pendingMoves: number
  pendingAdjustments: number
  lowStockItems: number
  totalStockValue: number
  recentActivity: number
  stockAccuracy: number
}

export default function InventoryPage() {
  const [stats, setStats] = useState<InventoryStats>({
    totalWarehouses: 0,
    totalLocations: 0,
    totalProducts: 0,
    pendingMoves: 0,
    pendingAdjustments: 0,
    lowStockItems: 0,
    totalStockValue: 0,
    recentActivity: 0,
    stockAccuracy: 0
  })
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const [tab, setTab] = useState("products")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchStats = async () => {
    try {
      setLoading(true)
      // Fetch stats from multiple endpoints
      const [warehousesRes, locationsRes, stockMovesRes, adjustmentsRes, quantitiesRes, productsRes] = await Promise.all([
        fetch("/api/v1/superadmin/warehouses", { credentials: "include" }),
        fetch("/api/v1/superadmin/locations", { credentials: "include" }),
        fetch("/api/v1/superadmin/stock-moves?state=DRAFT", { credentials: "include" }),
        fetch("/api/v1/superadmin/inventory-adjustments?state=DRAFT", { credentials: "include" }),
        fetch("/api/v1/superadmin/stock-quantities", { credentials: "include" }),
        fetch("/api/v1/superadmin/products?limit=1", { credentials: "include" })
      ])

      const warehouses = await warehousesRes.json()
      const locations = await locationsRes.json()
      const stockMoves = await stockMovesRes.json()
      const adjustments = await adjustmentsRes.json()
      const quantities = await quantitiesRes.json()
      const products = await productsRes.json()

      const lowStockItems = quantities.quantities?.filter((q: any) => q.quantity < 10).length || 0
      const totalStockValue = quantities.quantities?.reduce((sum: number, q: any) => {
        return sum + (q.quantity * (q.product?.price || 0))
      }, 0) || 0

      // Calculate stock accuracy (mock data for now)
      const stockAccuracy = Math.floor(Math.random() * 20) + 80 // 80-100%
      const recentActivity = Math.floor(Math.random() * 50) + 10 // 10-60 activities

      setStats({
        totalWarehouses: warehouses.warehouses?.length || 0,
        totalLocations: locations.locations?.length || 0,
        totalProducts: products.pagination?.total || 0,
        pendingMoves: stockMoves.stockMoves?.length || 0,
        pendingAdjustments: adjustments.adjustments?.length || 0,
        lowStockItems,
        totalStockValue,
        recentActivity,
        stockAccuracy
      })
    } catch (error) {
      console.error("Error fetching inventory stats:", error)
      toast({
        title: "Error",
        description: "Failed to fetch inventory statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchStats()
    setIsRefreshing(false)
    toast({
      title: "Success",
      description: "Inventory data refreshed successfully",
    })
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Set initial tab based on user role
  useEffect(() => {
    if ((user?.role === "EMPLOYER" || user?.role === "EMPLOYEE" || user?.role === "BRANCH_MANAGER") && tab === "warehouses") {
      setTab("products")
    }
  }, [user?.role])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-ping"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Loading Inventory Dashboard</h3>
              <p className="text-slate-500">Preparing your inventory data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Inventory Management</h1>
              <p className="text-slate-600">Monitor and manage your warehouse operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleRefresh}
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mt-8">
            {/* Products Card */}
            <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-slate-700 font-semibold text-sm uppercase tracking-wide">Products</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-4xl font-bold text-slate-900">{stats.totalProducts}</p>
                      <p className="text-slate-600 text-sm font-medium">In catalog</p>
                    </div>
                  </div>
                  <div className="opacity-20 group-hover:opacity-30 transition-opacity">
                    <Package className="h-16 w-16 text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Moves Card */}
            <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <ArrowRightLeft className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-slate-700 font-semibold text-sm uppercase tracking-wide">Pending Moves</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-4xl font-bold text-slate-900">{stats.pendingMoves}</p>
                      <p className="text-slate-600 text-sm font-medium">Awaiting approval</p>
                    </div>
                  </div>
                  <div className="opacity-20 group-hover:opacity-30 transition-opacity">
                    <ArrowRightLeft className="h-16 w-16 text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adjustments Card */}
            <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-indigo-500 rounded-lg">
                        <ClipboardCheck className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-slate-700 font-semibold text-sm uppercase tracking-wide">Adjustments</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-4xl font-bold text-slate-900">{stats.pendingAdjustments}</p>
                      <p className="text-slate-600 text-sm font-medium">Pending review</p>
                    </div>
                  </div>
                  <div className="opacity-20 group-hover:opacity-30 transition-opacity">
                    <ClipboardCheck className="h-16 w-16 text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Card */}
            <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-red-500 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-slate-700 font-semibold text-sm uppercase tracking-wide">Low Stock</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-4xl font-bold text-slate-900">{stats.lowStockItems}</p>
                      <p className="text-slate-600 text-sm font-medium">Need restocking</p>
                    </div>
                  </div>
                  <div className="opacity-20 group-hover:opacity-30 transition-opacity">
                    <AlertTriangle className="h-16 w-16 text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Value Card */}
            <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-slate-700 font-semibold text-sm uppercase tracking-wide">Stock Value</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-4xl font-bold text-slate-900">${(stats.totalStockValue / 1000).toFixed(1)}k</p>
                      <p className="text-slate-600 text-sm font-medium">Total inventory</p>
                    </div>
                  </div>
                  <div className="opacity-20 group-hover:opacity-30 transition-opacity">
                    <DollarSign className="h-16 w-16 text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accuracy Card */}
            <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-cyan-500 rounded-lg">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-slate-700 font-semibold text-sm uppercase tracking-wide">Accuracy</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-4xl font-bold text-slate-900">{stats.stockAccuracy}%</p>
                      <p className="text-slate-600 text-sm font-medium">Stock precision</p>
                    </div>
                  </div>
                  <div className="opacity-20 group-hover:opacity-30 transition-opacity">
                    <Target className="h-16 w-16 text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          {/* Enhanced Tab Navigation */}
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-2">
              <TabsList className="grid w-full grid-cols-9 rounded-xl bg-slate-50 p-1 h-auto">
              {user?.role !== "EMPLOYER" && user?.role !== "EMPLOYEE" && user?.role !== "BRANCH_MANAGER" && (
                <>
                    <TabsTrigger 
                      value="warehouses" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/50"
                    >
                    <Building2 className="h-4 w-4" />
                      <span className="hidden sm:inline font-medium">Warehouses</span>
                  </TabsTrigger>
                    <TabsTrigger 
                      value="zones" 
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/50"
                    >
                    <MapPin className="h-4 w-4" />
                      <span className="hidden sm:inline font-medium">Zones</span>
                  </TabsTrigger>
                </>
              )}
                <TabsTrigger 
                  value="products" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/50"
                >
                <Package className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Products</span>
              </TabsTrigger>
                <TabsTrigger 
                  value="stock" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/50"
                >
                <Boxes className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Stock</span>
              </TabsTrigger>
                <TabsTrigger 
                  value="moves" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/50"
                >
                <Repeat className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Moves</span>
              </TabsTrigger>
              {user?.role !== "EMPLOYER" && (
                  <TabsTrigger 
                    value="receiving" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/50"
                  >
                  <Truck className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">Receiving</span>
                </TabsTrigger>
              )}
                <TabsTrigger 
                  value="adjustments" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/50"
                >
                <ClipboardCheck className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Adjustments</span>
              </TabsTrigger>
                <TabsTrigger 
                  value="cycle-counts" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/50"
                >
                <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Cycle Counts</span>
              </TabsTrigger>
                <TabsTrigger 
                  value="scrap" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/50"
                >
                <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Scrap</span>
              </TabsTrigger>
            </TabsList>
            </CardContent>
          </Card>

          {/* Tab Content Container */}
          <Card className="shadow-lg border-slate-200 overflow-hidden">
            <CardContent className="p-0">
            {user?.role !== "EMPLOYER" && user?.role !== "EMPLOYEE" && user?.role !== "BRANCH_MANAGER" && (
              <>
                <TabsContent value="warehouses" className="m-0">
                  <WarehouseManagement onRefresh={fetchStats} />
                </TabsContent>
                <TabsContent value="zones" className="m-0">
                  <LocationManagement onRefresh={fetchStats} />
                </TabsContent>
              </>
            )}

            <TabsContent value="products" className="m-0">
              <ProductCatalog onRefresh={fetchStats} />
            </TabsContent>

            <TabsContent value="stock" className="m-0">
              <StockManagement onRefresh={fetchStats} />
            </TabsContent>

            <TabsContent value="moves" className="m-0">
              <StockMovesManagement onRefresh={fetchStats} />
            </TabsContent>

            <TabsContent value="adjustments" className="m-0">
              <InventoryAdjustments onRefresh={fetchStats} />
            </TabsContent>

            <TabsContent value="cycle-counts" className="m-0">
              <CycleCounts onRefresh={fetchStats} />
            </TabsContent>

            {user?.role !== "EMPLOYER" && user?.role !== "EMPLOYEE" && (
              <TabsContent value="receiving" className="m-0">
                <InventoryReceiving onRefresh={fetchStats} />
              </TabsContent>
            )}

            <TabsContent value="scrap" className="m-0">
              <ScrapInventory onRefresh={fetchStats} />
            </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  )
} 