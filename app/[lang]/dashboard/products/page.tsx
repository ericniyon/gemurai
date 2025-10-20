"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ClientOnly } from "@/components/client-only"
import "./products.css"
import {
  Search,
  Filter,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  Heart,
  Share2,
  MoreHorizontal,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  CreditCard,
  Plus,
  Minus,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Scale,
  ArrowLeftRight,
  CheckSquare,
  Square,
  BarChart3,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  subcategory?: string
  image: string
  images: string[]
  status: string
  stock: number
  commission: number
  seller: {
    id: string
    name: string
    email: string
  }
  dcc: {
    id: string
    name: string
    email: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

function ProductContent() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [productReviews, setProductReviews] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({})
  
  // Enhanced comparison and exchange features
  const [selectedProductsForComparison, setSelectedProductsForComparison] = useState<string[]>([])
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false)
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false)
  const [exchangeFormData, setExchangeFormData] = useState({
    currentProductId: "",
    requestedProductId: "",
    currentQuantity: 1,
    requestedQuantity: 1,
    reason: ""
  })
  const [isSubmittingExchange, setIsSubmittingExchange] = useState(false)
  const [isDCC, setIsDCC] = useState(false)

  const { toast } = useToast()

  // Check if user is DCC
  useEffect(() => {
    if (user) {
      setIsDCC(user.role === "DCC")
    }
  }, [user])

  const fetchProducts = async (page = 1, searchTerm = "", categoryFilter = "") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter })
      })

      const response = await fetch(`/api/dcc-products?${params}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.products)
        setPagination(data.pagination)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Enhanced comparison functions
  const toggleProductComparison = (productId: string) => {
    setSelectedProductsForComparison(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        if (prev.length >= 4) {
          toast({
            title: "Maximum Products Reached",
            description: "You can compare up to 4 products at a time.",
            variant: "destructive"
          })
          return prev
        }
        return [...prev, productId]
      }
    })
  }

  const getComparisonProducts = () => {
    return products.filter(product => selectedProductsForComparison.includes(product.id))
  }

  const openComparisonModal = () => {
    if (selectedProductsForComparison.length < 2) {
      toast({
        title: "Select Products",
        description: "Please select at least 2 products to compare.",
        variant: "destructive"
      })
      return
    }
    setIsComparisonModalOpen(true)
  }

  const clearComparison = () => {
    setSelectedProductsForComparison([])
    toast({
      title: "Comparison Cleared",
      description: "Selected products for comparison have been cleared.",
      variant: "default"
    })
  }

  // Enhanced exchange functions
  const handleExchangeRequest = (product: Product) => {
    setSelectedProduct(product)
    setExchangeFormData({
      currentProductId: product.id,
      requestedProductId: "",
      currentQuantity: 1,
      requestedQuantity: 1,
      reason: ""
    })
    setIsExchangeModalOpen(true)
  }

  const handleSubmitExchangeRequest = async () => {
    console.log("Submit Exchange Request - Starting...")
    console.log("Exchange Form Data:", exchangeFormData)
    
    if (!exchangeFormData.requestedProductId || !exchangeFormData.reason.trim()) {
      console.log("Validation failed - missing required fields")
      toast({
        title: "Missing Information",
        description: "Please select a product to exchange for and provide a reason.",
        variant: "destructive"
      })
      return
    }

    console.log("Validation passed - proceeding with submission")
    setIsSubmittingExchange(true)
    
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const requestBody = {
        currentProductId: exchangeFormData.currentProductId,
        requestedProductId: exchangeFormData.requestedProductId,
        currentQuantity: exchangeFormData.currentQuantity,
        requestedQuantity: exchangeFormData.requestedQuantity,
        reason: exchangeFormData.reason.trim()
      }
      
      console.log("Making API call to /api/v1/product-exchange")
      console.log("Request body:", requestBody)

      const response = await fetch('/api/v1/product-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log("API Response status:", response.status)
      console.log("API Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error response:", errorData)
        throw new Error(errorData.message || 'Failed to submit exchange request')
      }

      const result = await response.json()
      console.log("API Success response:", result)
      
      toast({
        title: "Exchange Request Submitted!",
        description: "Your exchange request has been submitted and is pending approval.",
        variant: "default"
      })
      
      setIsExchangeModalOpen(false)
      setSelectedProduct(null)
      setExchangeFormData({
        currentProductId: "",
        requestedProductId: "",
        currentQuantity: 1,
        requestedQuantity: 1,
        reason: ""
      })
      
      console.log("Exchange request submitted successfully")
    } catch (error) {
      console.error('Error submitting exchange request:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit exchange request. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmittingExchange(false)
      console.log("Submit Exchange Request - Completed")
    }
  }

  const getRequestedProduct = () => {
    return availableProducts.find(p => p.id === exchangeFormData.requestedProductId)
  }

  const getCurrentProduct = () => {
    return products.find(p => p.id === exchangeFormData.currentProductId)
  }

  // Fetch available products from DCC stock orders for exchange dropdown
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [loadingAvailableProducts, setLoadingAvailableProducts] = useState(false)

  const fetchAvailableProducts = async () => {
    if (!isDCC) {
      console.log("User is not DCC, skipping ADMIN products fetch")
      return
    }
    
    console.log("Fetching products from current DCC's stock orders...")
    console.log("Current DCC user:", user?.id, user?.name, user?.email)
    
    setLoadingAvailableProducts(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        console.error("No authentication token found")
        return
      }

      console.log("Making API call to fetch current DCC's stock orders...")
      const response = await fetch('/api/v1/stock-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Stock Orders API Response:", data)
        console.log("Data structure check:", {
          success: data.success,
          hasData: !!data.data,
          dataType: typeof data.data,
          isArray: Array.isArray(data.data),
          dataLength: Array.isArray(data.data) ? data.data.length : 'N/A'
        })
        
        if (data.success && data.data && Array.isArray(data.data)) {
          // Extract unique products from stock orders
          const productMap = new Map()
          
          console.log(`Found ${data.data.length} stock orders for current DCC`)
          
          data.data.forEach((order: any, orderIndex: number) => {
            console.log(`Processing order ${orderIndex} for DCC ${order.dccId}:`, order)
            if (order.products && Array.isArray(order.products)) {
              console.log(`Order ${orderIndex} has ${order.products.length} products`)
              order.products.forEach((orderProduct: any, productIndex: number) => {
                console.log(`Order ${orderIndex}, Product ${productIndex}:`, orderProduct)
                if (orderProduct.product) {
                  console.log(`Product ${productIndex} details:`, orderProduct.product)
                  console.log(`Product ${productIndex} pricing:`, {
                    purchasePrice: orderProduct.product.purchasePrice,
                    salesPrice: orderProduct.product.salesPrice,
                    commission: orderProduct.product.commission,
                    costPrice: orderProduct.product.costPrice
                  })
                  const productId = orderProduct.product.id
                  if (!productMap.has(productId)) {
                    const product = {
                      id: productId,
                      name: orderProduct.product.name,
                      description: orderProduct.product.description || "",
                      price: orderProduct.product.purchasePrice || orderProduct.product.costPrice || 0, // Use purchase price from stock order
                      category: orderProduct.product.category || "General",
                      image: orderProduct.product.image || "/placeholder.jpg",
                      images: orderProduct.product.images || [],
                      status: "active",
                      stock: orderProduct.quantity || 0,
                      commission: orderProduct.product.commission || 0,
                      seller: {
                        id: orderProduct.product.sellerId || "",
                        name: "My Stock", // Default seller name
                        email: "mystock@djyh.rw" // Default seller email
                      },
                      dcc: {
                        id: user?.id || "",
                        name: user?.name || "",
                        email: user?.email || ""
                      }
                    }
                    productMap.set(productId, product)
                  }
                }
              })
            }
          })
          
          const products = Array.from(productMap.values())
          console.log("Available Products from My Stock:", products)
          console.log(`Extracted ${products.length} unique products from ${data.data.length} stock orders`)
          console.log("Sample Available Product:", products[0])
          setAvailableProducts(products)
        } else {
          console.error("Invalid stock orders data structure:", data)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Failed to fetch stock orders:", response.status, errorData)
      }
    } catch (error) {
      console.error("Error fetching available products:", error)
    } finally {
      setLoadingAvailableProducts(false)
    }
  }

  // Fetch available products when exchange modal opens
  useEffect(() => {
    if (isExchangeModalOpen && isDCC) {
      fetchAvailableProducts()
    }
  }, [isExchangeModalOpen, isDCC])


  const handleSearch = () => {
    fetchProducts(1, search, category)
  }

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    fetchProducts(1, search, newCategory)
  }

  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage, search, category)
  }

  const categories = [
    "All",
    "Health & Wellness",
    "Household",
    "Personal Care",
    "Food & Beverages"
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-600"
    if (stock < 10) return "text-yellow-600"
    return "text-green-600"
  }



  const handleAddToStock = (product: Product) => {
    setSelectedProduct(product)
    setQuantity(1)
    setShowPaymentInfo(false)
    setIsDialogOpen(true)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 100) {
      setQuantity(newQuantity)
    }
  }

  const handleProceedToPayment = async () => {
    if (!selectedProduct) return

    setShowPaymentInfo(true)
  }

  const handleConfirmPayment = async () => {
    if (!selectedProduct) return

    setIsProcessing(true)
    try {
      // Get auth token
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Add product to DCC stock
      const response = await fetch('/api/v1/dcc/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: quantity,
          action: 'add'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add product to stock')
      }

      const result = await response.json()
      
      toast({
        title: "Product Added to Stock!",
        description: `${quantity} units of ${selectedProduct.name} have been added to your stock. Total value: RWF ${result.data.totalValue.toLocaleString()}`,
        variant: "default"
      })
      
      setIsDialogOpen(false)
      setSelectedProduct(null)
      setQuantity(1)
      setShowPaymentInfo(false)
      
      // Refresh the products list to show updated stock
      fetchProducts(pagination.page, search, category)
    } catch (error) {
      console.error('Error adding product to stock:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add product to stock. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateTotalPrice = () => {
    if (!selectedProduct) return 0
    return selectedProduct.price * quantity
  }

  const handleViewDetails = async (product: Product) => {
    setSelectedProduct(product)
    setShowProductDetails(true)
    setRating(0)
    setReview("")
    
    // Fetch reviews for the product
    try {
      console.log('Fetching reviews for product ID:', product.id)
      const response = await fetch(`/api/product-reviews?productId=${product.id}`)
      const data = await response.json()
      
      console.log('Reviews API response:', data)
      
      if (response.ok) {
        setProductReviews(data.reviews || [])
        setAverageRating(data.averageRating || 0)
        setTotalReviews(data.totalReviews || 0)
      } else {
        console.error('Failed to fetch reviews:', data.error)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const generateProductImage = async (product: Product): Promise<string | null> => {
    try {
      const response = await fetch('/api/generate-product-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: product.name,
          category: product.category,
          description: product.description
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.imageUrl) {
          setGeneratedImages(prev => ({
            ...prev,
            [product.id]: data.imageUrl
          }))
          return data.imageUrl
        }
      }
    } catch (error) {
      console.error('Error generating product image:', error)
    }
    return null
  }

  const handleSubmitReview = async () => {
    if (!selectedProduct || rating === 0) {
      toast({
        title: "Error",
        description: "Please provide a rating before submitting your review.",
        variant: "destructive"
      })
      return
    }

    setIsSubmittingReview(true)
    try {
      console.log('Submitting review for product ID:', selectedProduct.id)
      const response = await fetch('/api/product-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          rating: rating,
          comment: review,
          title: `Review for ${selectedProduct.name}`
        })
      })

      const data = await response.json()
      console.log('Submit review response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }
      
      toast({
        title: "Review Submitted!",
        description: "Thank you for your review and rating.",
        variant: "default"
      })
      
      // Refresh reviews after successful submission
      const reviewsResponse = await fetch(`/api/product-reviews?productId=${selectedProduct.id}`)
      const reviewsData = await reviewsResponse.json()
      
      if (reviewsResponse.ok) {
        setProductReviews(reviewsData.reviews || [])
        setAverageRating(reviewsData.averageRating || 0)
        setTotalReviews(reviewsData.totalReviews || 0)
      }
      
      setRating(0)
      setReview("")
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="card elevated rounded-xl p-8 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Product Catalog
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                Discover and add products to your DCC stock inventory
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchProducts()}
                className="card bordered hover:scale-105 transition-transform"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button className="card elevated hover:scale-105 transition-transform">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="card elevated rounded-xl">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Search & Filter</h2>
                <p className="text-gray-600">Find the perfect products for your inventory</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {products.length} Products
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {products.filter(p => p.stock > 0).length} In Stock
                </Badge>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products by name, category, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSearch} 
                  className="card elevated hover:scale-105 transition-transform"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="card bordered hover:scale-105 transition-transform">
                      <Filter className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortBy("name")}>
                      Name {sortBy === "name" && (sortOrder === "asc" ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />)}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price")}>
                      Price {sortBy === "price" && (sortOrder === "asc" ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />)}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("stock")}>
                      Stock {sortBy === "stock" && (sortOrder === "asc" ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />)}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none border-0"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none border-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Category Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat === "All" ? "" : cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    category === cat || (cat === "All" && !category) 
                      ? "bg-blue-600 text-white shadow-lg" 
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Products Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card elevated rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === "list" 
                ? "grid-cols-1" 
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}>
              {products.map((product) => (
                <div key={product.id} className="card elevated rounded-xl overflow-hidden group hover:scale-105 transition-all duration-300">
                  {/* Enhanced Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.jpg"
                      }}
                    />
                    
                    {/* Product Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Stock Indicator */}
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${
                      product.stock === 0 
                        ? "bg-red-100 text-red-800 border border-red-200" 
                        : product.stock < 10 
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : "bg-green-100 text-green-800 border border-green-200"
                    }`}>
                      {product.stock === 0 ? "Out of Stock" : `${product.stock} in stock`}
                    </div>
                    
                    {/* Quick Action Buttons */}
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="h-10 w-10 p-0 bg-white/95 hover:bg-white shadow-lg rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                console.log("Exchange button clicked for product:", product.name)
                                handleExchangeRequest(product)
                              }}
                            >
                              <ArrowLeftRight className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Request Exchange</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="secondary" className="h-10 w-10 p-0 bg-white/95 hover:bg-white shadow-lg rounded-full">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add to favorites</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="secondary" className="h-10 w-10 p-0 bg-white/95 hover:bg-white shadow-lg rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* Enhanced Content Section */}
                  <div className="p-6 space-y-4">
                    {/* Product Title */}
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Product Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                    
                    {/* Enhanced Pricing and Commission Info */}
                    <div className="space-y-3">
                      {/* Pricing Section */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-700">Purchase Price:</span>
                            <span className="font-medium text-blue-900">RWF {(product.price - product.commission).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-700">Sales Price:</span>
                            <span className="font-medium text-blue-900">RWF {product.price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold border-t border-blue-200 pt-2">
                            <span className="text-blue-700">Commission:</span>
                            <span className="text-green-600">RWF {product.commission.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Seller Information */}
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-blue-900">Seller</div>
                            <div className="text-sm text-blue-700 truncate">{product.seller.name}</div>
                          </div>
                          <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            Verified
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="pt-2">
                      <Button 
                        onClick={() => handleAddToStock(product)}
                        className="w-full card elevated hover:scale-105 transition-transform"
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.stock === 0 ? "Out of Stock" : "Add to Stock"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
            {pagination.pages > 1 && (
              <div className="card elevated rounded-xl">
                <div className="card-content p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing page {pagination.page} of {pagination.pages} ({pagination.total} total products)
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {[...Array(pagination.pages)].map((_, i) => {
                          const page = i + 1
                          const isCurrent = pagination.page === page
                          const isNearCurrent = Math.abs(pagination.page - page) <= 2
                          
                          if (isNearCurrent || page === 1 || page === pagination.pages) {
                            return (
                              <Button
                                key={page}
                                variant={isCurrent ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            )
                          } else if (page === 2 && pagination.page > 4) {
                            return <span key={page} className="px-2 text-gray-500">...</span>
                          } else if (page === pagination.pages - 1 && pagination.page < pagination.pages - 3) {
                            return <span key={page} className="px-2 text-gray-500">...</span>
                          }
                          return null
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!loading && products.length === 0 && (
          <div className="card elevated rounded-xl">
            <div className="card-content text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
              <Button 
                onClick={() => {
                  setSearch("")
                  setCategory("")
                  fetchProducts(1, "", "")
                }}
                className="card elevated hover:scale-105 transition-transform"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Add to Stock Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white border shadow-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {showPaymentInfo ? "Payment Information" : "Add to Stock"}
              </DialogTitle>
              <DialogDescription>
                {showPaymentInfo 
                  ? `Confirm adding ${selectedProduct?.name} to your stock`
                  : `Select quantity to add ${selectedProduct?.name} to your stock`
                }
              </DialogDescription>
            </DialogHeader>
            
            {selectedProduct && !showPaymentInfo && (
              <div className="space-y-6">
                {/* Product Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg"
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-600">{selectedProduct.category}</p>
                    <p className="text-lg font-bold text-green-600">
                      RWF {selectedProduct.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="space-y-3">
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="h-10 w-10 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min="1"
                      max="100"
                      className="w-20 text-center"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= 100}
                      className="h-10 w-10 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Unit Price:</span>
                    <span>RWF {selectedProduct.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Quantity:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">RWF {calculateTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedProduct && showPaymentInfo && (
              <div className="space-y-6">
                {/* Stock Addition Confirmation */}
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product:</span>
                        <span className="font-medium">{selectedProduct.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedProduct.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="font-medium">RWF {selectedProduct.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Stock Addition Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Quantity to Add:</span>
                        <span className="font-medium">{quantity} units</span>
                      </div>
                      
                      {/* Pricing Breakdown */}
                      <div className="space-y-2 p-3 bg-white rounded-lg border border-green-200">
                      <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Purchase Price:</span>
                          <span className="font-medium text-blue-600">
                            RWF {(selectedProduct.price - selectedProduct.commission).toLocaleString()}
                          </span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sales Price:</span>
                          <span className="font-medium text-gray-900">
                            RWF {selectedProduct.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold border-t border-green-200 pt-2">
                        <span className="text-gray-600">Commission:</span>
                          <span className="text-green-600">
                            RWF {selectedProduct.commission.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Final Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Product:</span>
                        <span>{selectedProduct.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Quantity:</span>
                        <span>{quantity} units</span>
                      </div>
                      
                      {/* Pricing Summary */}
                      <div className="space-y-2 p-3 bg-white rounded-lg border border-yellow-200">
                      <div className="flex justify-between text-sm">
                          <span>Purchase Price per Unit:</span>
                          <span className="text-blue-600">
                            RWF {(selectedProduct.price - selectedProduct.commission).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Sales Price per Unit:</span>
                        <span>RWF {selectedProduct.price.toLocaleString()}</span>
                      </div>
                        <div className="flex justify-between text-sm">
                          <span>Commission per Unit:</span>
                          <span className="text-green-600">
                            RWF {selectedProduct.commission.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Total Calculations */}
                      <div className="space-y-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex justify-between text-sm">
                          <span>Total Purchase Cost:</span>
                          <span className="text-blue-600">
                            RWF {((selectedProduct.price - selectedProduct.commission) * quantity).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Commission Earned:</span>
                          <span className="text-green-600">
                            RWF {(selectedProduct.commission * quantity).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold border-t border-green-200 pt-2">
                          <span>Total You Pay:</span>
                          <span className="text-green-600">
                            RWF {((selectedProduct.price - selectedProduct.commission) * quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800">Stock Addition</p>
                        <p className="text-blue-700 mt-1">
                          This will add {quantity} units of {selectedProduct.name} to your DCC stock inventory.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  if (showPaymentInfo) {
                    setShowPaymentInfo(false)
                  } else {
                    setIsDialogOpen(false)
                  }
                }}
                disabled={isProcessing}
              >
                {showPaymentInfo ? "Back" : "Cancel"}
              </Button>
              <Button
                onClick={showPaymentInfo ? handleConfirmPayment : handleProceedToPayment}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : showPaymentInfo ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Add to Stock
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Addition
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
                 </Dialog>

        {/* Exchange Request Modal */}
        <Dialog open={isExchangeModalOpen} onOpenChange={setIsExchangeModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto !bg-white border border-gray-300">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-orange-600" />
                Request Product Exchange
              </DialogTitle>
              <DialogDescription>
                Request to exchange your current product with another product from ADMIN
              </DialogDescription>
            </DialogHeader>

            {selectedProduct && (
              <div className="space-y-6">
                {/* Current Product Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Current Product Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Product:</span>
                      <span className="ml-2 font-medium">{selectedProduct.name}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Category:</span>
                      <span className="ml-2 font-medium">{selectedProduct.category}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Price:</span>
                      <span className="ml-2 font-medium">RWF {selectedProduct.price.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Commission:</span>
                      <span className="ml-2 font-medium">RWF {selectedProduct.commission.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Exchange Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Product Quantity */}
                    <div className="space-y-2">
                      <Label htmlFor="current-quantity">Current Product Quantity</Label>
                      <Input
                        id="current-quantity"
                        type="number"
                        min="1"
                        value={exchangeFormData.currentQuantity}
                        onChange={(e) => setExchangeFormData(prev => ({ 
                          ...prev, 
                          currentQuantity: parseInt(e.target.value) || 1 
                        }))}
                        placeholder="Enter quantity"
                        className="!bg-white border border-gray-300"
                      />
                    </div>

                    {/* Requested Product Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="requested-product">Requested Product from My Stock</Label>
                      <Select 
                        value={exchangeFormData.requestedProductId} 
                        onValueChange={(value) => {
                          // Auto-calculate equivalent quantity based on value
                          if (value) {
                            const requestedProduct = availableProducts.find(p => p.id === value)
                            if (requestedProduct) {
                              // Current product: use purchase price (price - commission)
                              const currentValue = (selectedProduct.price - selectedProduct.commission) * exchangeFormData.currentQuantity
                              // Requested product: use purchase price (already set as price)
                              const requestedProductPurchasePrice = requestedProduct.price
                              const equivalentQuantity = Math.ceil(currentValue / requestedProductPurchasePrice)
                              
                              setExchangeFormData(prev => ({ 
                                ...prev, 
                                requestedProductId: value,
                                requestedQuantity: equivalentQuantity > 0 ? equivalentQuantity : 1
                              }))
                            } else {
                              setExchangeFormData(prev => ({ ...prev, requestedProductId: value }))
                            }
                          } else {
                            setExchangeFormData(prev => ({ ...prev, requestedProductId: value }))
                          }
                        }}
                      >
                        <SelectTrigger className="!bg-white !border-gray-300">
                          <SelectValue placeholder="Select product from my stock" />
                        </SelectTrigger>
                        <SelectContent className="!bg-white border border-gray-300">
                          {availableProducts.length > 0 ? (
                            availableProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              <div className="flex items-center justify-between w-full">
                                <span className="truncate max-w-[200px]">
                                  {product.name}
                                </span>
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                  RWF {product.price.toLocaleString()}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                                                  ) : (
                            <div className="p-2 text-sm text-gray-500">
                              {loadingAvailableProducts ? "Loading my stock..." : "No products in my stock"}
                            </div>
                          )}
                      </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Requested Quantity */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="requested-quantity">Requested Product Quantity</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Quantity is auto-calculated based on equivalent value. You can adjust manually.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="requested-quantity"
                      type="number"
                      min="1"
                      value={exchangeFormData.requestedQuantity}
                      onChange={(e) => setExchangeFormData(prev => ({ 
                        ...prev, 
                        requestedQuantity: parseInt(e.target.value) || 1 
                      }))}
                      placeholder="Enter quantity"
                      className="!bg-white border border-gray-300"
                    />
                    {exchangeFormData.requestedProductId && (
                      <p className="text-xs text-gray-500">
                        💡 Tip: This quantity is calculated to match the value of your current product. Adjust as needed for your exchange.
                      </p>
                    )}
                  </div>

                  {/* Reason for Exchange */}
                  <div className="space-y-2">
                    <Label htmlFor="exchange-reason">Reason for Exchange Request</Label>
                    <Textarea
                      id="exchange-reason"
                      placeholder="Please explain why you want to exchange these products..."
                      value={exchangeFormData.reason}
                      onChange={(e) => setExchangeFormData(prev => ({ ...prev, reason: e.target.value }))}
                      rows={4}
                      className="resize-none !bg-white border border-gray-300"
                    />
                    <p className="text-xs text-gray-500">
                      Provide a detailed explanation for your exchange request to help with approval
                    </p>
                  </div>

                  {/* Product Comparison Section */}
                  {exchangeFormData.requestedProductId && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Scale className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900 text-lg">Product Comparison</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Current Product */}
                        <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                              <img
                                src={selectedProduct.image}
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.jpg"
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-blue-900">Current Product</h5>
                              <p className="text-sm text-blue-600">{selectedProduct.name}</p>
                              <p className="text-xs text-blue-500">{selectedProduct.category}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <span className="text-sm font-medium text-blue-700">Category:</span>
                              <span className="text-sm text-blue-900">{selectedProduct.category}</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <span className="text-sm font-medium text-blue-700">Sales Price:</span>
                              <span className="text-sm font-semibold text-blue-900">RWF {selectedProduct.price.toLocaleString()}</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <span className="text-sm font-medium text-blue-700">Purchase Price:</span>
                              <span className="text-sm font-semibold text-blue-900">RWF {(selectedProduct.price - selectedProduct.commission).toLocaleString()}</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                              <span className="text-sm font-medium text-green-700">Commission:</span>
                              <span className="text-sm font-semibold text-green-600">RWF {selectedProduct.commission.toLocaleString()}</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <span className="text-sm font-medium text-blue-700">Exchange Quantity:</span>
                              <span className="text-sm font-semibold text-blue-900">{exchangeFormData.currentQuantity} units</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-blue-100 rounded border border-blue-200">
                              <span className="text-sm font-semibold text-blue-900">Total Value:</span>
                              <span className="text-lg font-bold text-blue-900">
                                RWF {((selectedProduct.price - selectedProduct.commission) * exchangeFormData.currentQuantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Requested Product */}
                        <div className="bg-white p-4 rounded-lg border border-indigo-200 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            {(() => {
                              const requestedProduct = availableProducts.find(
                                p => p.id === exchangeFormData.requestedProductId
                              )
                              return (
                                <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center overflow-hidden">
                                  {requestedProduct ? (
                                    <img
                                      src={requestedProduct.image}
                                      alt={requestedProduct.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = "/placeholder.jpg"
                                      }}
                                    />
                                  ) : (
                                    <ShoppingCart className="h-8 w-8 text-indigo-400" />
                                  )}
                                </div>
                              )
                            })()}
                            <div className="flex-1">
                              <h5 className="font-semibold text-indigo-900">Requested Product</h5>
                              {(() => {
                                const requestedProduct = availableProducts.find(
                                  p => p.id === exchangeFormData.requestedProductId
                                )
                                return (
                                  <>
                                    <p className="text-sm text-indigo-600">{requestedProduct?.name || 'Select a product'}</p>
                                    <p className="text-xs text-indigo-500">{requestedProduct?.category || ''}</p>
                                  </>
                                )
                              })()}
                            </div>
                          </div>
                          
                          {(() => {
                            const requestedProduct = availableProducts.find(
                              p => p.id === exchangeFormData.requestedProductId
                            )
                            if (!requestedProduct) {
                              return (
                                <div className="text-center py-8 text-gray-500">
                                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                  <p className="text-sm">Select a product to compare</p>
                                </div>
                              )
                            }
                            
                            // Since we're using purchase price as the main price, we need to calculate sales price
                            const requestedProductSalesPrice = requestedProduct.price + requestedProduct.commission
                            
                            return (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center p-2 bg-indigo-50 rounded">
                                  <span className="text-sm font-medium text-indigo-700">Category:</span>
                                  <span className="text-sm text-indigo-900">{requestedProduct.category}</span>
                                </div>
                                
                                <div className="flex justify-between items-center p-2 bg-indigo-50 rounded">
                                  <span className="text-sm font-medium text-indigo-700">Sales Price:</span>
                                  <span className="text-sm font-semibold text-indigo-900">RWF {requestedProductSalesPrice.toLocaleString()}</span>
                                </div>
                                
                                <div className="flex justify-between items-center p-2 bg-indigo-50 rounded">
                                  <span className="text-sm font-medium text-indigo-700">Purchase Price:</span>
                                  <span className="text-sm font-semibold text-indigo-900">RWF {requestedProduct.price.toLocaleString()}</span>
                                </div>
                                
                                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                  <span className="text-sm font-medium text-green-700">Commission:</span>
                                  <span className="text-sm font-semibold text-green-600">RWF {requestedProduct.commission.toLocaleString()}</span>
                                </div>
                                
                                <div className="flex justify-between items-center p-2 bg-indigo-50 rounded">
                                  <span className="text-sm font-medium text-indigo-700">Requested Quantity:</span>
                                  <span className="text-sm font-semibold text-indigo-900">{exchangeFormData.requestedQuantity} units</span>
                                </div>
                                
                                <div className="flex justify-between items-center p-3 bg-indigo-100 rounded border border-indigo-200">
                                  <span className="text-sm font-semibold text-indigo-900">Total Value:</span>
                                  <span className="text-lg font-bold text-indigo-900">
                                    RWF {(requestedProduct.price * exchangeFormData.requestedQuantity).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      </div>

                      {/* Value Comparison */}
                      {(() => {
                        const requestedProduct = availableProducts.find(
                          p => p.id === exchangeFormData.requestedProductId
                        )
                        if (!requestedProduct) return null
                        
                        console.log("Selected Product:", selectedProduct)
                        console.log("Requested Product:", requestedProduct)
                        
                        // Current product: use purchase price (price - commission)
                        const currentValue = (selectedProduct.price - selectedProduct.commission) * exchangeFormData.currentQuantity
                        // Requested product: use purchase price (already set as price)
                        const requestedValue = requestedProduct.price * exchangeFormData.requestedQuantity
                        const valueDifference = requestedValue - currentValue
                        
                        console.log("Current Value:", currentValue)
                        console.log("Requested Value:", requestedValue)
                        console.log("Value Difference:", valueDifference)
                        
                        return (
                          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Value Comparison
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="text-center p-3 bg-blue-50 rounded">
                                <div className="font-medium text-blue-700">Current Value</div>
                                <div className="text-lg font-bold text-blue-900">RWF {currentValue.toLocaleString()}</div>
                              </div>
                              <div className="text-center p-3 bg-indigo-50 rounded">
                                <div className="font-medium text-indigo-700">Requested Value</div>
                                <div className="text-lg font-bold text-indigo-900">RWF {requestedValue.toLocaleString()}</div>
                              </div>
                              <div className={`text-center p-3 rounded ${
                                valueDifference > 0 ? 'bg-green-50' : valueDifference < 0 ? 'bg-red-50' : 'bg-gray-50'
                              }`}>
                                <div className={`font-medium ${
                                  valueDifference > 0 ? 'text-green-700' : valueDifference < 0 ? 'text-red-700' : 'text-gray-700'
                                }`}>
                                  {valueDifference > 0 ? 'Gain' : valueDifference < 0 ? 'Loss' : 'Equal'}
                                </div>
                                <div className={`text-lg font-bold ${
                                  valueDifference > 0 ? 'text-green-600' : valueDifference < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {valueDifference > 0 ? '+' : ''}RWF {Math.abs(valueDifference).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {/* Exchange Summary */}
                  {exchangeFormData.requestedProductId && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Exchange Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-white p-3 rounded border">
                          <h5 className="font-medium text-gray-900 mb-2">Giving Away</h5>
                          <div>
                            <p className="font-medium">{selectedProduct.name}</p>
                            <p className="text-gray-600">
                              {exchangeFormData.currentQuantity} units × RWF {(selectedProduct.price - selectedProduct.commission).toLocaleString()} (Purchase Price)
                            </p>
                            <p className="font-semibold text-green-600">
                              Total: RWF {((selectedProduct.price - selectedProduct.commission) * exchangeFormData.currentQuantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <h5 className="font-medium text-gray-900 mb-2">Requesting</h5>
                          {(() => {
                            const requestedProduct = availableProducts.find(
                              p => p.id === exchangeFormData.requestedProductId
                            )
                            if (!requestedProduct) return <p>Select a product</p>
                            
                            // Since we're using purchase price as the main price, no need to subtract commission
                            
                            return (
                              <div>
                                <p className="font-medium">{requestedProduct.name}</p>
                                <p className="text-gray-600">
                                  {exchangeFormData.requestedQuantity} units × RWF {requestedProduct.price.toLocaleString()} (Purchase Price)
                                </p>
                                <p className="font-semibold text-blue-600">
                                  Total: RWF {(requestedProduct.price * exchangeFormData.requestedQuantity).toLocaleString()}
                                </p>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExchangeModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitExchangeRequest}
                disabled={isSubmittingExchange || !exchangeFormData.requestedProductId || !exchangeFormData.reason.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSubmittingExchange ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Submit Exchange Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Product Details Dialog */}
        <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
          <DialogContent className="sm:max-w-2xl bg-white border shadow-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </DialogTitle>
              <DialogDescription>
                View detailed information about {selectedProduct?.name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedProduct && (
              <div className="space-y-6">
                {/* Product Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={generatedImages[selectedProduct.id] || selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-64 object-cover"
                        onError={async (e) => {
                          // Try to generate a new image if the current one fails
                          const generatedImage = await generateProductImage(selectedProduct)
                          if (generatedImage && generatedImage !== selectedProduct.image) {
                            e.currentTarget.src = generatedImage
                          } else {
                            e.currentTarget.src = "/placeholder.jpg"
                          }
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getStatusColor(selectedProduct.status)} border shadow-lg`}>
                          {selectedProduct.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Additional Images */}
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProduct.images?.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative overflow-hidden rounded-lg">
                          <img
                            src={image}
                            alt={`${selectedProduct.name} ${index + 1}`}
                            className="w-full h-16 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.jpg"
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedProduct.name}
                      </h2>
                      <Badge className="text-sm bg-blue-600 text-white border-0 mb-3">
                        {selectedProduct.category}
                      </Badge>
                      <p className="text-gray-600 leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>
                    
                    {/* Enhanced Pricing Information */}
                    <div className="space-y-4">
                      {/* Pricing Section */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                            <span className="text-lg font-semibold text-blue-900">Pricing Information</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                            <div>
                              <div className="text-sm font-medium text-blue-700">Purchase Price</div>
                              <div className="text-xs text-blue-600">What you pay</div>
                            </div>
                            <span className="text-lg font-bold text-blue-900">
                              RWF {(selectedProduct.price - selectedProduct.commission).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                            <div>
                              <div className="text-sm font-medium text-blue-700">Sales Price</div>
                              <div className="text-xs text-blue-600">What you sell for</div>
                            </div>
                            <span className="text-lg font-bold text-blue-900">
                          RWF {selectedProduct.price.toLocaleString()}
                        </span>
                      </div>
                          
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <div>
                              <div className="text-sm font-medium text-green-700">Commission</div>
                              <div className="text-xs text-green-600">Your profit</div>
                            </div>
                            <span className="text-lg font-bold text-green-600">
                              RWF {selectedProduct.commission.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stock Section */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-700">Stock:</span>
                        <span className={`text-lg font-semibold ${getStockColor(selectedProduct.stock)}`}>
                          {selectedProduct.stock} units available
                        </span>
                      </div>
                      </div>
                    </div>
                    
                    {/* Seller Information */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Seller Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedProduct.seller.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{selectedProduct.seller.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reviews Section */}
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Reviews & Ratings
                  </h3>
                  
                  {/* Add Review */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Write a Review</h4>
                    
                    {/* Rating Stars */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`p-1 transition-colors ${
                              star <= rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          >
                            <Star className={`h-6 w-6 ${star <= rating ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        {rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'}
                      </span>
                    </div>
                    
                    {/* Review Text */}
                    <div className="space-y-2">
                      <Label htmlFor="review">Your Review</Label>
                      <textarea
                        id="review"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your experience with this product..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={4}
                      />
                    </div>
                    
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview || rating === 0}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Submit Review
                        </>
                      )}
                    </Button>
                  </div>
                  
                                     {/* Existing Reviews */}
                   <div className="space-y-4 mt-6">
                     <div className="flex items-center justify-between">
                       <h4 className="font-medium text-gray-900">
                         Reviews ({totalReviews})
                       </h4>
                       {averageRating > 0 && (
                         <div className="flex items-center gap-2">
                           <div className="flex items-center gap-1">
                             {[1, 2, 3, 4, 5].map((star) => (
                               <Star 
                                 key={star}
                                 className={`h-4 w-4 ${star <= averageRating ? 'fill-current text-yellow-500' : 'text-gray-300'}`} 
                               />
                             ))}
                           </div>
                           <span className="text-sm text-gray-600">
                             {averageRating.toFixed(1)} average
                           </span>
                         </div>
                       )}
                     </div>
                     
                     {productReviews.length > 0 ? (
                       <div className="space-y-3">
                         {productReviews.map((review) => (
                           <div key={review.id} className="p-4 bg-white border rounded-lg">
                             <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                   <span className="text-sm font-medium text-blue-600">
                                     U
                                   </span>
                                 </div>
                                 <span className="font-medium text-gray-900">
                                   User
                                 </span>
                               </div>
                               <div className="flex items-center gap-1">
                                 {[1, 2, 3, 4, 5].map((star) => (
                                   <Star 
                                     key={star}
                                     className={`h-4 w-4 ${star <= review.rating ? 'fill-current text-yellow-500' : 'text-gray-300'}`} 
                                   />
                                 ))}
                               </div>
                             </div>
                             {review.comment && (
                               <p className="text-gray-600 text-sm mb-2">
                                 {review.comment}
                               </p>
                             )}
                             <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                               <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                               <button className="flex items-center gap-1 hover:text-blue-600">
                                 <ThumbsUp className="h-3 w-3" />
                                 Helpful ({review.helpful})
                               </button>
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="text-center py-8 text-gray-500">
                         <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                         <p>No reviews yet. Be the first to review this product!</p>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setShowProductDetails(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowProductDetails(false)
                  handleAddToStock(selectedProduct!)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
       </div>
     </div>
   )
 }

export default function ProductsPage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-lg font-medium text-gray-700">Loading products...</p>
        </div>
      </div>
    }>
      <ProductContent />
    </ClientOnly>
  )
} 