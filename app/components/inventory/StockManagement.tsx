"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search,
  MoreHorizontal, 
  Eye,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Building2,
  MapPin,
  RefreshCw,
  Settings,
  History
} from "lucide-react"
import { StockAdjustmentDialog } from "./StockAdjustmentDialog"

interface StockQuantity {
  id: string
  productId: string
  locationId: string
  warehouseId: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  lastUpdated: string
  product: {
    id: string
    name: string
    code: string
    sku?: string
    category?: string
    price?: number
    commission?: number
    costPrice?: number
  }
  location: {
    id: string
    name: string
    code: string
    locationType: string
  }
  warehouse: {
    id: string
    name: string
    code: string
  }
}

interface StockStats {
  totalProducts: number
  totalQuantity: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  reservedQuantity: number
}

interface StockManagementProps {
  onRefresh?: () => void
}

export function StockManagement({ onRefresh }: StockManagementProps) {
  const { user } = useAuth()
  const [stockQuantities, setStockQuantities] = useState<StockQuantity[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [stats, setStats] = useState<StockStats>({
    totalProducts: 0,
    totalQuantity: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    reservedQuantity: 0
  })
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)
  const [selectedStockQuantity, setSelectedStockQuantity] = useState<StockQuantity | null>(null)
  const { toast } = useToast()

  const fetchStockQuantities = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/v1/superadmin/stock-quantities", {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        setStockQuantities(data.stockQuantities || [])
        calculateStats(data.stockQuantities || [])
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error fetching stock quantities:", error)
      toast({
        title: "Error",
        description: "Failed to fetch stock quantities",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchWarehouses = async () => {
    try {
      const response = await fetch("/api/v1/superadmin/warehouses", {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        setWarehouses(data.warehouses || [])
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/v1/superadmin/locations", {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        setLocations(data.locations || [])
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const calculateStats = (stockData: StockQuantity[]) => {
    const totalProducts = new Set(stockData.map(item => item.productId)).size
    const totalQuantity = stockData.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = stockData.reduce((sum, item) => sum + (item.quantity * (item.product?.price || 0)), 0)
    const lowStockItems = stockData.filter(item => item.availableQuantity > 0 && item.availableQuantity <= 10).length
    const outOfStockItems = stockData.filter(item => item.availableQuantity === 0).length
    const reservedQuantity = stockData.reduce((sum, item) => sum + item.reservedQuantity, 0)

    setStats({
      totalProducts,
      totalQuantity,
      totalValue,
      lowStockItems,
      outOfStockItems,
      reservedQuantity
    })
  }

  // Group stock quantities by product and aggregate quantities
  const getAggregatedStockQuantities = (stockData: StockQuantity[]) => {
    const productMap = new Map<string, {
      product: any,
      totalQuantity: number,
      totalAvailableQuantity: number,
      totalReservedQuantity: number,
      locations: Array<{warehouse: any, location: any, quantity: number, availableQuantity: number, reservedQuantity: number, lastUpdated: string}>
    }>()

    stockData.forEach(item => {
      const productId = item.productId
      
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product: item.product,
          totalQuantity: 0,
          totalAvailableQuantity: 0,
          totalReservedQuantity: 0,
          locations: []
        })
      }

      const productData = productMap.get(productId)!
      productData.totalQuantity += item.quantity
      productData.totalAvailableQuantity += item.availableQuantity
      productData.totalReservedQuantity += item.reservedQuantity
      productData.locations.push({
        warehouse: item.warehouse,
        location: item.location,
        quantity: item.quantity,
        availableQuantity: item.availableQuantity,
        reservedQuantity: item.reservedQuantity,
        lastUpdated: item.lastUpdated
      })
    })

    return Array.from(productMap.values()).map((data, index) => ({
      id: `aggregated-${data.product.id}`,
      productId: data.product.id,
      product: data.product,
      quantity: data.totalQuantity,
      availableQuantity: data.totalAvailableQuantity,
      reservedQuantity: data.totalReservedQuantity,
      lastUpdated: data.locations.reduce((latest, loc) => 
        new Date(loc.lastUpdated) > new Date(latest) ? loc.lastUpdated : latest, 
        data.locations[0]?.lastUpdated || new Date().toISOString()
      ),
      locations: data.locations
    }))
  }

  useEffect(() => {
    fetchStockQuantities()
    fetchWarehouses()
    fetchLocations()
  }, [])

  const handleRefresh = () => {
    fetchStockQuantities()
    onRefresh?.()
  }

  const handleAdjustStock = (stockQuantity: StockQuantity) => {
    setSelectedStockQuantity(stockQuantity)
    setIsAdjustmentDialogOpen(true)
  }

  const handleViewHistory = (stockQuantity: StockQuantity) => {
    // TODO: Implement stock history view
    toast({
      title: "Coming Soon",
      description: "Stock history view is being developed",
    })
  }

  const aggregatedStockQuantities = getAggregatedStockQuantities(stockQuantities)
  
  const filteredStockQuantities = aggregatedStockQuantities.filter((item) => {
    const searchString = searchTerm.toLowerCase()
    const matchesSearch = (
      (item.product?.name?.toLowerCase() || '').includes(searchString) ||
      (item.product?.code?.toLowerCase() || '').includes(searchString) ||
      (item.product?.sku?.toLowerCase() || '').includes(searchString) ||
      item.locations.some(loc => 
        (loc.location?.name?.toLowerCase() || '').includes(searchString) ||
        (loc.warehouse?.name?.toLowerCase() || '').includes(searchString)
      )
    )
    const matchesWarehouse = selectedWarehouse === "all" || 
                           item.locations.some(loc => loc.warehouse?.id === selectedWarehouse)
    const matchesLocation = selectedLocation === "all" || 
                           item.locations.some(loc => loc.location?.id === selectedLocation)
    
    let matchesStockFilter = true
    if (stockFilter === "low") {
      matchesStockFilter = item.availableQuantity > 0 && item.availableQuantity <= 10
    } else if (stockFilter === "out") {
      matchesStockFilter = item.availableQuantity === 0
    } else if (stockFilter === "available") {
      matchesStockFilter = item.availableQuantity > 0
    }

    return matchesSearch && matchesWarehouse && matchesLocation && matchesStockFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading stock quantities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              Stock Management
            </h2>
            <p className="text-gray-600 mt-2">
              Real-time stock quantities and inventory levels across all locations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2 border-gray-200 hover:bg-gray-50">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
            {user?.role !== "BRANCH_MANAGER" && (
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Settings className="h-4 w-4" />
                Bulk Adjust
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-blue-700 font-semibold text-sm uppercase tracking-wide">Total Products</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-blue-900">{stats.totalProducts}</p>
                  <p className="text-blue-600 text-sm font-medium">Unique items</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-green-700 font-semibold text-sm uppercase tracking-wide">Total Quantity</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-green-900">{stats.totalQuantity.toLocaleString()}</p>
                  <p className="text-green-600 text-sm font-medium">All locations</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-emerald-700 font-semibold text-sm uppercase tracking-wide">Available</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-emerald-900">{(stats.totalQuantity - stats.reservedQuantity).toLocaleString()}</p>
                  <p className="text-emerald-600 text-sm font-medium">Ready to sell</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-orange-700 font-semibold text-sm uppercase tracking-wide">Reserved</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-orange-900">{stats.reservedQuantity.toLocaleString()}</p>
                  <p className="text-orange-600 text-sm font-medium">Pending orders</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-yellow-700 font-semibold text-sm uppercase tracking-wide">Low Stock</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-yellow-900">{stats.lowStockItems}</p>
                  <p className="text-yellow-600 text-sm font-medium">Need restocking</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-red-700 font-semibold text-sm uppercase tracking-wide">Out of Stock</span>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-red-900">{stats.outOfStockItems}</p>
                  <p className="text-red-600 text-sm font-medium">Urgent restock</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card className="border-0 bg-white rounded-xl shadow-lg">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Search & Filter
          </CardTitle>
          <CardDescription className="text-gray-600">
            Find specific stock items by product, location, or status
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products, SKU, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                />
              </div>
            </div>
            <div>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                  <SelectValue placeholder="All warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All warehouses</SelectItem>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                  <SelectValue placeholder="All stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stock</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="low">Low stock</SelectItem>
                  <SelectItem value="out">Out of stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stock Table */}
      <Card className="border-0 bg-white rounded-xl shadow-lg">
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                Stock Quantities ({filteredStockQuantities.length})
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Real-time inventory levels across all locations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                {filteredStockQuantities.filter(item => item.availableQuantity > 0).length} Available
              </Badge>
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                {filteredStockQuantities.filter(item => item.availableQuantity > 0 && item.availableQuantity <= 10).length} Low Stock
              </Badge>
              <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                {filteredStockQuantities.filter(item => item.availableQuantity === 0).length} Out of Stock
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Product</TableHead>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Warehouse</TableHead>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Location</TableHead>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Total Qty</TableHead>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Available</TableHead>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Price</TableHead>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Commission</TableHead>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Status</TableHead>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Last Updated</TableHead>
                    {user?.role !== "BRANCH_MANAGER" && <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStockQuantities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={user?.role === "BRANCH_MANAGER" ? 9 : 10} className="h-32 text-center bg-gray-50">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Package className="h-12 w-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No stock quantities found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStockQuantities.map((item, index) => (
                      <TableRow 
                        key={item.id}
                        className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-900 text-base">{item.product?.name || 'Unknown Product'}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{item.product?.code || 'No Code'}</span>
                              {item.product?.sku && (
                                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">
                                  {item.product.sku}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Building2 className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-medium text-gray-900">
                                {item.locations.length > 1 
                                  ? `${item.locations.length} Warehouses` 
                                  : item.locations[0]?.warehouse?.name || 'No Warehouse'
                                }
                              </span>
                            </div>
                            {item.locations.length > 1 && (
                              <div className="text-xs text-gray-500 ml-8">
                                {item.locations.map(loc => loc.warehouse?.name).filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-emerald-50 rounded-lg">
                                <MapPin className="h-4 w-4 text-emerald-600" />
                              </div>
                              <span className="font-medium text-gray-900">
                                {item.locations.length > 1 
                                  ? `${item.locations.length} Locations` 
                                  : item.locations[0]?.location?.name || 'No Location'
                                }
                              </span>
                            </div>
                            {item.locations.length > 1 && (
                              <div className="text-xs text-gray-500 ml-8">
                                {item.locations.map(loc => loc.location?.name).filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Package className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-bold text-gray-900 text-base">{item.quantity.toLocaleString()}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="font-bold text-green-700 text-base">{item.availableQuantity.toLocaleString()}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="text-right">
                            <span className="font-bold text-blue-700 text-base">
                              {item.product?.price !== undefined ? `RWF ${item.product.price.toLocaleString()}` : '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="text-right">
                            <span className="font-bold text-purple-700 text-base">
                              {item.product?.commission !== undefined ? `RWF ${item.product.commission.toLocaleString()}` : '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex justify-center">
                            {item.availableQuantity === 0 ? (
                              <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 px-3 py-1 font-medium text-xs rounded-full">
                                Out of Stock
                              </Badge>
                            ) : item.availableQuantity <= 10 ? (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 px-3 py-1 font-medium text-xs rounded-full">
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 px-3 py-1 font-medium text-xs rounded-full">
                                In Stock
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="text-center">
                            <span className="text-sm text-gray-500 font-medium">
                              {new Date(item.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        {user?.role !== "BRANCH_MANAGER" && (
                          <TableCell className="px-6 py-4">
                            <div className="flex justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
                                    <MoreHorizontal className="h-5 w-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-xl rounded-lg">
                                  <DropdownMenuItem 
                                    onClick={() => handleViewHistory(item)}
                                    className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                  >
                                    <History className="mr-3 h-4 w-4" />
                                    View History
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleAdjustStock(item)}
                                    className="cursor-pointer hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                                  >
                                    <Settings className="mr-3 h-4 w-4" />
                                    Adjust Stock
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 hover:text-gray-600 transition-colors duration-200">
                                    <Eye className="mr-3 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={isAdjustmentDialogOpen}
        onOpenChange={setIsAdjustmentDialogOpen}
        stockQuantity={selectedStockQuantity}
        onSuccess={handleRefresh}
      />
    </div>
  )
} 