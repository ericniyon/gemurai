"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/stores/auth-store"
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  BarChart3,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Plus,
  Minus,
  Zap,
  Target,
  Award,
  Clock,
  Star
} from "lucide-react"
import Link from "next/link"

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
  purchasePrice: number
  salesPrice: number
  commission: number
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

export default function DCCStockInventoryPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const authStore = useAuthStore()
  const [stockSummary, setStockSummary] = useState<StockSummary>({
    totalProducts: 0,
    totalQuantity: 0,
    totalValue: 0,
    averagePrice: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  })
  const [dccStock, setDccStock] = useState<DCCStockItem[]>([])
  const [filteredStock, setFilteredStock] = useState<DCCStockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<DCCStockItem | null>(null)
  const [requestQuantity, setRequestQuantity] = useState("1")
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [submittedProducts, setSubmittedProducts] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchStockData()
  }, [])

  useEffect(() => {
    filterAndSortStock()
  }, [dccStock, searchTerm, categoryFilter, stockFilter, sortBy])

  const fetchStockData = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/v1/dcc/stock')
      const data = await response.json()
      
      if (data.success) {
        setStockSummary(data.data.summary)
        setDccStock(data.data.dccStock)
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

  const filterAndSortStock = () => {
    let filtered = [...dccStock]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productCategory.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.productCategory === categoryFilter)
    }

    // Stock status filter
    if (stockFilter === "low") {
      filtered = filtered.filter(item => item.currentStock <= 5 && item.currentStock > 0)
    } else if (stockFilter === "out") {
      filtered = filtered.filter(item => item.currentStock === 0)
    } else if (stockFilter === "in") {
      filtered = filtered.filter(item => item.currentStock > 5)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.productName.localeCompare(b.productName)
        case "stock":
          return b.currentStock - a.currentStock
        case "value":
          return b.totalValue - a.totalValue
        case "price":
          return b.priceAfterCommission - a.priceAfterCommission
        default:
          return 0
      }
    })

    setFilteredStock(filtered)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount).replace('RF', 'RWF')
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'out-of-stock', color: 'red', text: 'Out of Stock', icon: XCircle, bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' }
    if (quantity <= 5) return { status: 'low-stock', color: 'orange', text: 'Low Stock', icon: AlertTriangle, bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' }
    return { status: 'in-stock', color: 'green', text: 'In Stock', icon: CheckCircle, bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' }
  }

  const getCategories = () => {
    const categories = [...new Set(dccStock.map(item => item.productCategory))]
    return categories.sort()
  }

  const handleRequestStock = (product: DCCStockItem) => {
    setSelectedProduct(product)
    setRequestQuantity("1")
    setIsRequestDialogOpen(true)
  }

  const handleSubmitRequest = async () => {
    if (!selectedProduct || !requestQuantity) return

    setIsSubmittingRequest(true)

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      // Add authorization header if token is available
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }

      const response = await fetch('/api/v1/stock-orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          products: [
            {
              productId: selectedProduct.productId,
              quantity: parseInt(requestQuantity)
            }
          ],
          comment: `Stock request for ${selectedProduct.productName} - Out of stock item`
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Stock Request Submitted",
          description: `Request for ${requestQuantity} units of ${selectedProduct.productName} has been submitted successfully.`,
          variant: "default"
        })
        
        // Add product to submitted products set
        setSubmittedProducts(prev => new Set(prev).add(selectedProduct.productId))
        
        // Refresh the stock data to reflect the new request
        await fetchStockData()
      } else {
        throw new Error(data.message || 'Failed to submit request')
      }
      
      setIsRequestDialogOpen(false)
      setSelectedProduct(null)
      setRequestQuantity("1")
    } catch (error) {
      console.error('Error submitting stock request:', error)
      
      // Try to get more specific error information
      let errorMessage = "Failed to submit stock request. Please try again."
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message)
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  const lowStockItems = dccStock.filter(item => item.currentStock <= 5 && item.currentStock > 0)
  const outOfStockItems = dccStock.filter(item => item.currentStock === 0)
  const inStockItems = dccStock.filter(item => item.currentStock > 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="card elevated rounded-xl p-8 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
          <Link href="/en/dashboard/dcc-stock">
                <Button variant="outline" size="sm" className="card bordered hover:scale-105 transition-transform">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stock
            </Button>
          </Link>
          
        </div>
            <Button 
              onClick={fetchStockData} 
              disabled={isLoading}
              className="card bordered hover:scale-105 transition-transform"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
          </div>
      </div>

        {/* Enhanced Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Total Products</p>
                <p className="text-gray-900 text-3xl font-bold">{stockSummary.totalProducts}</p>
                <p className="text-gray-600 text-xs mt-1">Unique items in inventory</p>
              </div>
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Total Quantity</p>
                <p className="text-gray-900 text-3xl font-bold">{stockSummary.totalQuantity}</p>
                <p className="text-gray-600 text-xs mt-1">Units available for sale</p>
              </div>
              <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Total Value</p>
                <p className="text-gray-900 text-3xl font-bold">{formatCurrency(stockSummary.totalValue)}</p>
                <p className="text-gray-600 text-xs mt-1">Purchase value of inventory</p>
              </div>
              <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="analytics-card elevated rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Avg Price</p>
                <p className="text-gray-900 text-3xl font-bold">{formatCurrency(stockSummary.averagePrice)}</p>
                <p className="text-gray-600 text-xs mt-1">Average purchase price</p>
              </div>
              <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
      </div>

      {/* Stock Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lowStockItems.length > 0 && (
              <div className="card elevated rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <div className="card-header border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-orange-800">Low Stock Alert</h3>
                      <p className="text-orange-600">{lowStockItems.length} items need restocking</p>
                    </div>
                  </div>
                </div>
                <div className="card-content">
                <div className="space-y-3">
                    {lowStockItems.slice(0, 3).map((item) => (
                      <div key={item.stockId} className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
                      <div>
                          <p className="font-semibold text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">{item.productCategory}</p>
                      </div>
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Minus className="h-3 w-3" />
                        {item.currentStock} left
                      </Badge>
                    </div>
                  ))}
                    {lowStockItems.length > 3 && (
                      <p className="text-sm text-orange-600 text-center">
                        +{lowStockItems.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              </div>
          )}

          {outOfStockItems.length > 0 && (
              <div className="card elevated rounded-xl bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
                <div className="card-header border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-800">Out of Stock</h3>
                      <p className="text-red-600">{outOfStockItems.length} items need immediate attention</p>
                    </div>
                  </div>
                </div>
                <div className="card-content">
                <div className="space-y-3">
                    {outOfStockItems.slice(0, 3).map((item) => (
                      <div key={item.stockId} className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                      <div>
                          <p className="font-semibold text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">{item.productCategory}</p>
                      </div>
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                        Out of Stock
                      </Badge>
                    </div>
                  ))}
                    {outOfStockItems.length > 3 && (
                      <p className="text-sm text-red-600 text-center">
                        +{outOfStockItems.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              </div>
          )}
        </div>
      )}

        {/* Filters and Search */}
        <div className="card elevated rounded-xl">
          <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
                <p className="text-gray-600">Filter and search your stock items</p>
            </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {inStockItems.length} In Stock
              </Badge>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {lowStockItems.length} Low Stock
              </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {outOfStockItems.length} Out of Stock
              </Badge>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getCategories().map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="All Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="stock">Sort by Stock</SelectItem>
                  <SelectItem value="value">Sort by Value</SelectItem>
                  <SelectItem value="price">Sort by Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Enhanced Inventory Grid */}
        <div className="card elevated rounded-xl">
          <div className="card-content p-0">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4 text-lg">Loading inventory data...</p>
              </div>
            ) : filteredStock.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredStock.map((item) => {
                const stockStatus = getStockStatus(item.currentStock)
                const IconComponent = stockStatus.icon
                
                return (
                    <div key={item.stockId} className="card elevated rounded-xl hover:scale-105 transition-all duration-300 group">
                      <div className="card-header border-b-0 pb-0">
                    <div className="flex items-center justify-between">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                          <Badge 
                            className={`${stockStatus.bgColor} ${stockStatus.textColor} ${stockStatus.borderColor} flex items-center gap-1`}
                          >
                            <IconComponent className="h-3 w-3" />
                            {stockStatus.text}
                          </Badge>
                        </div>
                      </div>
                      <div className="card-content">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {item.productName}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.productDescription}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Category</span>
                            <span className="text-sm font-medium text-gray-900">{item.productCategory}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Stock Level</span>
                            <span className="text-lg font-bold text-gray-900">{item.currentStock} units</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Purchase Price</span>
                            <span className="text-sm font-semibold text-green-600">{formatCurrency(item.purchasePrice)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Sales Price</span>
                            <span className="text-sm font-semibold text-blue-600">{formatCurrency(item.salesPrice)}</span>
                          </div>
                          
                                                  <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Commission</span>
                          <span className="text-sm font-semibold text-purple-600">{formatCurrency(item.commission)}</span>
                        </div>
                        
                        {/* Request Stock Button for Out of Stock Items */}
                        {item.currentStock === 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <Button 
                              className={`w-full ${
                                submittedProducts.has(item.productId) 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-red-600 hover:bg-red-700'
                              } text-white`}
                              onClick={() => handleRequestStock(item)}
                              disabled={submittedProducts.has(item.productId)}
                            >
                              {submittedProducts.has(item.productId) ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Request Submitted
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Request Stock
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                        

                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No stock found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || categoryFilter !== "all" || stockFilter !== "all" 
                    ? "Try adjusting your filters or search terms"
                    : "Start by requesting stock from employers to build your inventory"
                  }
                </p>
                {!searchTerm && categoryFilter === "all" && stockFilter === "all" && (
              <Link href="/en/dashboard/dcc-stock/orders">
                    <Button className="card bordered hover:scale-105 transition-transform">
                      <Plus className="h-4 w-4 mr-2" />
                  Request Stock
                </Button>
              </Link>
                )}
            </div>
          )}
          </div>
        </div>

      {/* Request Stock Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Request Stock
            </DialogTitle>
            <DialogDescription>
              Request additional stock for this product from your employer.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedProduct.productName}</h4>
                <p className="text-sm text-gray-600 mb-2">{selectedProduct.productDescription}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{selectedProduct.productCategory}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="font-medium text-red-600">0 units</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity to Request</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={requestQuantity}
                  onChange={(e) => setRequestQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Enter the number of units you want to request
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Purchase Price:</span>
                  <span className="font-medium text-green-600">{formatCurrency(selectedProduct.purchasePrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Sales Price:</span>
                  <span className="font-medium text-blue-600">{formatCurrency(selectedProduct.salesPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Commission:</span>
                  <span className="font-medium text-purple-600">{formatCurrency(selectedProduct.commission)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold mt-2 pt-2 border-t border-blue-200">
                  <span className="text-gray-700">Total Value:</span>
                  <span className="text-blue-600">
                    {formatCurrency(selectedProduct.purchasePrice * parseInt(requestQuantity || "0"))}
                  </span>
            </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRequestDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitRequest}
              disabled={!requestQuantity || parseInt(requestQuantity) < 1 || isSubmittingRequest}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmittingRequest ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
    </div>
  )
}
