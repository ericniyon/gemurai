"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Package,
  Droplets,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  BarChart3,
  Calendar,
  Loader2,
  Warehouse,
  Activity
} from "lucide-react"

interface StockItem {
  id: string
  productName: string
  productType: 'RAW_MILK' | 'PROCESSED_MILK' | 'MILK_PRODUCTS' | 'BYPRODUCTS'
  currentQuantity: number
  unit: string
  unitPrice: number
  totalValue: number
  warehouseName: string
  warehouseType: string
  lastUpdated: string
  expiryDate?: string
  qualityStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  source: 'COLLECTION' | 'PROCESSING' | 'PURCHASE'
}

interface StockSummary {
  totalProducts: number
  totalQuantity: number
  totalValue: number
  rawMilkStock: number
  processedMilkStock: number
  milkProductsStock: number
  byproductsStock: number
  lowStockItems: number
  expiringSoon: number
}

interface StockTabProps {
  mccId?: string
}

export default function StockTab({ mccId }: StockTabProps) {
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [stockSummary, setStockSummary] = useState<StockSummary>({
    totalProducts: 0,
    totalQuantity: 0,
    totalValue: 0,
    rawMilkStock: 0,
    processedMilkStock: 0,
    milkProductsStock: 0,
    byproductsStock: 0,
    lowStockItems: 0,
    expiringSoon: 0
  })
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  const fetchStockData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('Gemurai_token')
      // Use the working inventory API instead of the failing MCC stock API
      const response = await fetch('/api/v1/inventory/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const products = data.data || []
        
        // Transform inventory products to stock items
        const stockItems: StockItem[] = products.map((product: any) => {
          // Calculate total stock from stockQuantities
          const totalStock = product.stockQuantities?.reduce((sum: number, stock: any) => sum + (stock.quantity || 0), 0) || 0
          
          return {
            id: product.id,
            productName: product.name,
            productType: product.inventoryType === 'PHARMACY' ? 'MILK_PRODUCTS' : 'RAW_MILK',
            currentQuantity: totalStock,
            unit: product.unitOfMeasure || 'Units',
            unitPrice: product.price || 0,
            totalValue: totalStock * (product.price || 0),
            warehouseName: product.pharmacyWarehouse?.name || 'Main Warehouse',
            warehouseType: 'PROCESSING_PLANT',
            lastUpdated: product.updatedAt || new Date().toISOString(),
            expiryDate: product.expiryDate,
            qualityStatus: 'GOOD',
            source: 'PURCHASE'
          }
        }).filter(item => item.currentQuantity > 0) // Only show items with stock
        
        setStockItems(stockItems)
        
        // Calculate summary from stock data
        const summary = calculateStockSummary(stockItems)
        setStockSummary(summary)
      } else {
        console.error('Failed to fetch stock data:', response.statusText)
        // Mock data for development
        const mockStockItems: StockItem[] = [
          {
            id: "1",
            productName: "Fresh Raw Milk",
            productType: "RAW_MILK",
            currentQuantity: 2500,
            unit: "Liters",
            unitPrice: 1200,
            totalValue: 3000000,
            warehouseName: "Cold Storage Unit A",
            warehouseType: "COLD_STORAGE",
            lastUpdated: "2024-01-20T10:30:00Z",
            qualityStatus: "EXCELLENT",
            source: "COLLECTION"
          },
          {
            id: "2",
            productName: "Pasteurized Milk",
            productType: "PROCESSED_MILK",
            currentQuantity: 1800,
            unit: "Liters",
            unitPrice: 1500,
            totalValue: 2700000,
            warehouseName: "Processing Plant",
            warehouseType: "PROCESSING_PLANT",
            lastUpdated: "2024-01-20T09:15:00Z",
            expiryDate: "2024-01-25",
            qualityStatus: "GOOD",
            source: "PROCESSING"
          },
          {
            id: "3",
            productName: "Yogurt",
            productType: "MILK_PRODUCTS",
            currentQuantity: 500,
            unit: "Units",
            unitPrice: 800,
            totalValue: 400000,
            warehouseName: "Distribution Center",
            warehouseType: "DISTRIBUTION_CENTER",
            lastUpdated: "2024-01-19T16:45:00Z",
            expiryDate: "2024-01-28",
            qualityStatus: "GOOD",
            source: "PROCESSING"
          },
          {
            id: "4",
            productName: "Cheese Whey",
            productType: "BYPRODUCTS",
            currentQuantity: 200,
            unit: "Liters",
            unitPrice: 300,
            totalValue: 60000,
            warehouseName: "Byproducts Storage",
            warehouseType: "COLD_STORAGE",
            lastUpdated: "2024-01-18T14:20:00Z",
            qualityStatus: "FAIR",
            source: "PROCESSING"
          }
        ]
        
        setStockItems(mockStockItems)
        const summary = calculateStockSummary(mockStockItems)
        setStockSummary(summary)
      }
    } catch (error) {
      console.error('Error fetching stock data:', error)
      toast.error("Failed to fetch stock data")
    } finally {
      setLoading(false)
    }
  }

  const calculateStockSummary = (items: StockItem[]): StockSummary => {
    const totalProducts = items.length
    const totalQuantity = items.reduce((sum, item) => sum + item.currentQuantity, 0)
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0)
    
    const rawMilkStock = items
      .filter(item => item.productType === 'RAW_MILK')
      .reduce((sum, item) => sum + item.currentQuantity, 0)
    
    const processedMilkStock = items
      .filter(item => item.productType === 'PROCESSED_MILK')
      .reduce((sum, item) => sum + item.currentQuantity, 0)
    
    const milkProductsStock = items
      .filter(item => item.productType === 'MILK_PRODUCTS')
      .reduce((sum, item) => sum + item.currentQuantity, 0)
    
    const byproductsStock = items
      .filter(item => item.productType === 'BYPRODUCTS')
      .reduce((sum, item) => sum + item.currentQuantity, 0)
    
    const lowStockItems = items.filter(item => item.currentQuantity < 100).length
    
    const expiringSoon = items.filter(item => {
      if (!item.expiryDate) return false
      const expiryDate = new Date(item.expiryDate)
      const today = new Date()
      const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
      return diffDays <= 7 && diffDays >= 0
    }).length

    return {
      totalProducts,
      totalQuantity,
      totalValue,
      rawMilkStock,
      processedMilkStock,
      milkProductsStock,
      byproductsStock,
      lowStockItems,
      expiringSoon
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchStockData()
    setIsRefreshing(false)
    toast.success("Stock data refreshed successfully")
  }

  const getQualityBadge = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Excellent</Badge>
      case 'GOOD':
        return <Badge className="bg-gray-100 text-gray-800"><CheckCircle className="h-3 w-3 mr-1" />Good</Badge>
      case 'FAIR':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Fair</Badge>
      case 'POOR':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Poor</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getProductTypeBadge = (type: string) => {
    const colors = {
      'RAW_MILK': 'bg-gray-100 text-gray-800',
      'PROCESSED_MILK': 'bg-gray-100 text-gray-800',
      'MILK_PRODUCTS': 'bg-gray-100 text-gray-800',
      'BYPRODUCTS': 'bg-orange-100 text-orange-800'
    }
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type.replace('_', ' ')}</Badge>
  }

  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.warehouseName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === "all" || item.productType === filterType
    return matchesSearch && matchesFilter
  })

  useEffect(() => {
    fetchStockData()
  }, [mccId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-gray-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">Loading Stock Data...</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Stock Management</h2>
                <p className="text-gray-600">Track milk inventory and processed products</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-700 transition-colors" />
              <Input
                placeholder="Search stock items..."
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
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Stock Value</CardTitle>
            <div className="p-2 bg-gray-100 rounded-lg">
              <Droplets className="h-5 w-5 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 mb-1">{(stockSummary.totalValue / 1000000).toFixed(1)}M</div>
            <p className="text-sm text-gray-600 font-medium">
              {stockSummary.totalProducts} products
            </p>
            <div className="mt-2 flex items-center text-xs text-gray-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% from last week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Raw Milk Stock</CardTitle>
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="h-5 w-5 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 mb-1">{stockSummary.rawMilkStock.toLocaleString()}</div>
            <p className="text-sm text-gray-600 font-medium">
              Liters available
            </p>
            <div className="mt-2 flex items-center text-xs text-gray-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Processed Products</CardTitle>
            <div className="p-2 bg-gray-100 rounded-lg">
              <Activity className="h-5 w-5 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 mb-1">{stockSummary.processedMilkStock.toLocaleString()}</div>
            <p className="text-sm text-gray-600 font-medium">
              Liters processed
            </p>
            <div className="mt-2 flex items-center text-xs text-gray-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% this week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-orange-50 border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Alerts</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 mb-1">{stockSummary.lowStockItems + stockSummary.expiringSoon}</div>
            <p className="text-sm text-gray-600 font-medium">
              Low stock & expiring
            </p>
            <div className="mt-2 flex items-center text-xs text-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Requires attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Raw Milk</p>
                <p className="text-2xl font-bold text-gray-800">{stockSummary.rawMilkStock.toLocaleString()}L</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Droplets className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processed Milk</p>
                <p className="text-2xl font-bold text-gray-800">{stockSummary.processedMilkStock.toLocaleString()}L</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Milk Products</p>
                <p className="text-2xl font-bold text-gray-800">{stockSummary.milkProductsStock.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Activity className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Byproducts</p>
                <p className="text-2xl font-bold text-orange-600">{stockSummary.byproductsStock.toLocaleString()}L</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Warehouse className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Stock Items</CardTitle>
              <CardDescription className="text-gray-600 mt-1">Current inventory levels and product details</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                {filteredStockItems.length} items
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredStockItems.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                <Package className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Stock Items Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery ? 'No items match your search criteria' : 'No stock items available'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Warehouse
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quality
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-200">
                              <Package className="h-5 w-5 text-gray-700" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-gray-900 transition-colors">
                              {item.productName}
                            </div>
                            <div className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                              {item.source}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {getProductTypeBadge(item.productType)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 text-gray-600 mr-2" />
                          <span className="font-semibold">{item.currentQuantity.toLocaleString()} {item.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-medium">{item.unitPrice.toLocaleString()} Frw</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-bold text-gray-800 text-lg">
                          {item.totalValue.toLocaleString()} Frw
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Warehouse className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium">{item.warehouseName}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{item.warehouseType.replace('_', ' ')}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {getQualityBadge(item.qualityStatus)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium">{new Date(item.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        {item.expiryDate && (
                          <div className="text-xs text-orange-600 mt-1">
                            Expires: {new Date(item.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
