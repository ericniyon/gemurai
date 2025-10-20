"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  BarChart3,
  Plus,
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

interface DCCStockItem {
  stockId: string
  productId: string
  productName: string
  productDescription: string
  productPrice: number
  productImage: string
  productCategory: string
  productCommission: number
  currentStock: number
  priceAfterCommission: number
  totalValue: number
}

interface StockSummary {
  totalProducts: number
  totalQuantity: number
  totalValue: number
  averagePrice: number
  lowStockItems: number
  outOfStockItems: number
}

export default function DCCStockPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [stockSummary, setStockSummary] = useState<StockSummary>({
    totalProducts: 0,
    totalQuantity: 0,
    totalValue: 0,
    averagePrice: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  })
  const [dccStock, setDccStock] = useState<DCCStockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStockData()
  }, [])

  const fetchStockData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch DCC stock
      const stockResponse = await fetch('/api/v1/dcc/stock')
      const stockData = await stockResponse.json()
      
      if (stockData.success) {
        setStockSummary(stockData.data.summary)
        setDccStock(stockData.data.dccStock)
      }
    } catch (error) {
      console.error('Error fetching stock data:', error)
      toast({
        title: "Error",
        description: "Failed to load stock data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'out-of-stock', color: 'red', text: 'Out of Stock' }
    if (quantity <= 5) return { status: 'low-stock', color: 'orange', text: 'Low Stock' }
    return { status: 'in-stock', color: 'green', text: 'In Stock' }
  }

  const lowStockItems = dccStock.filter(item => item.currentStock <= 5 && item.currentStock > 0)
  const outOfStockItems = dccStock.filter(item => item.currentStock === 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DCC Stock Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your inventory, track stock levels, and monitor your products
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchStockData}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stockSummary.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{stockSummary.totalQuantity}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stockSummary.totalValue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stockSummary.averagePrice)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lowStockItems.length > 0 && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock Items ({lowStockItems.length})
                </CardTitle>
                <CardDescription>
                  Products that need restocking soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <div key={item.stockId} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">{item.productCategory}</p>
                      </div>
                      <Badge variant="destructive">
                        {item.currentStock} left
                      </Badge>
                    </div>
                  ))}
                  {lowStockItems.length > 3 && (
                    <p className="text-sm text-gray-600 text-center">
                      +{lowStockItems.length - 3} more items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {outOfStockItems.length > 0 && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Out of Stock ({outOfStockItems.length})
                </CardTitle>
                <CardDescription>
                  Products that need immediate restocking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {outOfStockItems.slice(0, 3).map((item) => (
                    <div key={item.stockId} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">{item.productCategory}</p>
                      </div>
                      <Badge variant="destructive">
                        Out of Stock
                      </Badge>
                    </div>
                  ))}
                  {outOfStockItems.length > 3 && (
                    <p className="text-sm text-gray-600 text-center">
                      +{outOfStockItems.length - 3} more items
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stock Inventory */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                My Stock Inventory
              </CardTitle>
              <CardDescription>
                All products in your current inventory
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading stock data...</p>
            </div>
          ) : dccStock.length > 0 ? (
            <div className="space-y-4">
              {dccStock.map((item) => {
                const stockStatus = getStockStatus(item.currentStock)
                return (
                  <div key={item.stockId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.productCategory} • {formatCurrency(item.priceAfterCommission)} each
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {item.currentStock} units
                        </p>
                        <Badge 
                          variant={stockStatus.status === 'out-of-stock' ? 'destructive' : 
                                  stockStatus.status === 'low-stock' ? 'secondary' : 'default'}
                        >
                          {stockStatus.text}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Total Value: {formatCurrency(item.totalValue)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stock yet</h3>
              <p className="text-gray-600 mb-4">
                Start by requesting stock from employers to build your inventory
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Request Stock
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Request Stock</h3>
              <p className="text-sm text-gray-600 mb-4">
                Request new stock from employers to add to your inventory
              </p>
              <Button variant="outline" className="w-full">
                Start Request
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Approved Orders</h3>
              <p className="text-sm text-gray-600 mb-4">
                View your approved stock orders and track deliveries
              </p>
              <Button variant="outline" className="w-full">
                View Orders
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Stock Analytics</h3>
              <p className="text-sm text-gray-600 mb-4">
                View detailed analytics and stock performance metrics
              </p>
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
