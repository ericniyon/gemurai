"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { ClientOnly } from "@/components/client-only"
import {
  Plus,
  Search,
  Filter,
  Package,
  TrendingUp,
  Heart,
  Eye,
  Star,
  GridIcon,
  List,
  ShoppingBag,
  Edit,
  Trash2,
  ShoppingCart,
  Minus,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ProductImage } from "@/components/product-image"
import { useToast } from "@/hooks/use-toast"
import { Product, ProductFormData, ProductStatus } from "@/app/types/product"
import { Checkbox } from "@/components/ui/checkbox"
import { StockOrderDialog } from "@/app/components/stock-order/StockOrderDialog"
import { StockOrderList } from "@/app/components/stock-order/StockOrderList"

interface CartItem {
  productId: string
  quantity: number
}

interface WishlistItem {
  productId: string
  addedAt: string
}

interface Order {
  id: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: { productId: string; quantity: number; price: number }[]
  trackingNumber?: string
}

interface UpdateProductData {
  name: string
  description: string
  price: number
  category: string
  stock: number
  commission: number
  status: ProductStatus
  originalPrice?: number
  isNew?: boolean
  isPopular?: boolean
  provider?: string
  image?: string
}

// Helper function for safe number formatting
const formatNumber = (value: number | string | undefined): string => {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return String(value || 0)
}

function MarketplaceContent() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showCartDialog, setShowCartDialog] = useState(false)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddProductDialog, setShowAddProductDialog] = useState(false)
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStockOrderDialog, setShowStockOrderDialog] = useState(false)
  const tabsRef = useRef<HTMLDivElement & { value?: string }>(null)
  const [quantity, setQuantity] = useState("")
  const [comment, setComment] = useState("")

  const initialFormData: ProductFormData = {
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: null,
    commission: "",
    status: "active" as ProductStatus
  }

  const [formData, setFormData] = useState<ProductFormData>(initialFormData)

  useEffect(() => {
    if (selectedProduct && showEditDialog) {
      setFormData({
        name: selectedProduct.name,
        description: selectedProduct.description || "",
        price: (selectedProduct.price ?? 0).toString(),
        category: selectedProduct.category,
        stock: (selectedProduct.stock ?? 0).toString(),
        image: null,
        commission: (selectedProduct.commission ?? 0).toString(),
        status: selectedProduct.status,
        isNew: selectedProduct.isNew || false,
        isPopular: selectedProduct.isPopular || false,
        originalPrice: selectedProduct.originalPrice?.toString() || "",
        provider: selectedProduct.provider || ""
      })
    }
  }, [selectedProduct, showEditDialog])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/products")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch products")
      }

      const data = await response.json()
      console.log("Fetched products:", data.products)

      if (!data.products || data.products.length === 0) {
        setProducts([])
      } else {
        setProducts(data.products.map((product: any) => ({
          ...product,
          status: product.status || "active" as const
        })))
      }
      setError(null)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to load products")
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  console.log("Filtered products:", filteredProducts)

  const sortProducts = (products: Product[], sortBy: string) => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case "price":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        case "reviews":
          return b.reviews - a.reviews
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })
  }

  const sortedProducts = sortProducts(filteredProducts, sortBy)

  const orders: Order[] = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "delivered",
      total: 7300,
      items: [
        { productId: "1", quantity: 2, price: 3500 },
        { productId: "4", quantity: 1, price: 800 }
      ],
      trackingNumber: "TRK123456789"
    },
    {
      id: "ORD-002", 
      date: "2024-01-20",
      status: "processing",
      total: 4300,
      items: [
        { productId: "3", quantity: 1, price: 2800 },
        { productId: "5", quantity: 1, price: 1500 }
      ]
    }
  ]

  const addToCart = (productId: string, quantity: number = 1) => {
    const existingItem = cart.find(item => item.productId === productId)
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setCart([...cart, { productId, quantity }])
    }

    const product = products.find(p => p.id === productId)
    toast({
      title: "Added to Cart",
      description: `${product?.name} has been added to your cart.`,
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId))
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(cart.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    ))
  }

  const toggleWishlist = (productId: string) => {
    const isInWishlist = wishlist.some(item => item.productId === productId)
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.productId !== productId))
      toast({
        title: "Removed from Wishlist",
        description: "Product removed from your wishlist.",
      })
    } else {
      setWishlist([...wishlist, { productId, addedAt: new Date().toISOString() }])
      toast({
        title: "Added to Wishlist", 
        description: "Product added to your wishlist.",
      })
    }
  }

  const cartTotal = cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId)
    return total + (product?.price || 0) * item.quantity
  }, 0)

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-navy-100 text-navy-800"
      case "shipped":
        return "bg-orange-100 text-orange-800"
      case "processing":
        return "bg-orange-100 text-orange-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-gray-200 text-gray-700"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCheckout = async () => {
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create new order
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        status: "pending",
        total: cartTotal,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: products.find(p => p.id === item.productId)?.price || 0
        }))
      }

      setCart([])
      setShowCheckoutDialog(false)
      toast({
        title: "Order Placed Successfully!",
        description: `Order ${newOrder.id} has been placed. You'll receive a confirmation email shortly.`,
      })
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      // Validate form data
      if (!formData.name || !formData.price || !formData.category || !formData.stock || !formData.image || !formData.commission) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("price", formData.price)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("stock", formData.stock)
      formDataToSend.append("commission", formData.commission)
      formDataToSend.append("image", formData.image)

      // Debug log
      console.log("Form data being sent:", {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        stock: formData.stock,
        commission: formData.commission,
        image: formData.image
      })

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`
        },
        body: formDataToSend
      })

      const responseData = await response.json()
      if (!response.ok) {
        console.error("API Error Response:", responseData)
        if (responseData.details) {
          // Create a formatted message for the toast
          const errorMessages = Object.entries(responseData.details)
            .filter(([_, msg]) => msg !== null)
            .map(([field, msg]) => `• ${msg}`)
            .join('\n')
          
          toast({
            title: "Validation Error",
            description: (
              <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
                <code className="text-white">{errorMessages}</code>
              </pre>
            ),
            variant: "destructive",
            duration: 5000
          })
          throw new Error("Please fix the validation errors")
        }
        throw new Error(responseData.error || 'Failed to add product')
      }

      toast({
        title: "Success",
        description: "Product added successfully"
      })

      setShowAddProductDialog(false)
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image: null,
        commission: "",
        status: "active" as ProductStatus
      })
      
      // Refresh products list
      // You'll need to implement this based on your data fetching strategy
      
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add product. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      // Validate form data
      if (!formData.name || !formData.price || !formData.category || !formData.stock || !formData.commission) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      // Get auth token
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      // Handle image upload first if there's a new image
      let imageUrl: string | undefined
      if (formData.image instanceof File) {
        const imageFormData = new FormData()
        imageFormData.append("image", formData.image)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imageFormData
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.error || 'Failed to upload image')
        }

        const uploadResult = await uploadResponse.json()
        imageUrl = uploadResult.url
      }

      // Prepare data for API
      const updateData: UpdateProductData = {
        name: formData.name,
        description: formData.description || "",
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        commission: parseFloat(formData.commission),
        status: formData.status,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        ...(imageUrl && { image: imageUrl })
      }

      // Log the request data for debugging
      console.log('Updating product with ID:', selectedProduct?.id)
      console.log('Data being sent:', updateData)

      // Send update request
      const response = await fetch(`/api/products/${selectedProduct?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      // Log the response for debugging
      const responseData = await response.json()
      console.log('Update response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update product')
      }

      toast({
        title: "Success",
        description: "Product updated successfully"
      })

      setShowEditDialog(false)
      setFormData(initialFormData)
      
      // Refresh products list
      fetchProducts()
      
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStockOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !quantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch("/api/stock-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: parseInt(quantity),
          comment
        })
      })

      if (!response.ok) {
        throw new Error("Failed to create stock order")
      }

      toast({
        title: "Success",
        description: "Stock order created successfully"
      })

      // Reset form
      setSelectedProduct(null)
      setQuantity("")
      setComment("")
      
      // Switch to stock orders tab
      if (tabsRef.current) {
        tabsRef.current.value = "stock-orders"
      }
    } catch (error) {
      console.error("Error creating stock order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create stock order",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 space-y-8">
      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white border-gray-200 hover:bg-gray-50 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-navy-900">{products.length}</p>
                <p className="text-xs text-gray-500 mt-1">Active products</p>
              </div>
              <div className="p-3 bg-navy-50 rounded-xl group-hover:bg-navy-100 transition-colors">
                <Package className="h-8 w-8 text-navy-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {user?.role === "EMPLOYER" && (
          <Card className="bg-white border-gray-200 hover:bg-gray-50 transition-all duration-300 group cursor-pointer" onClick={() => setShowAddProductDialog(true)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Add Product</p>
                  <p className="text-3xl font-bold text-navy-900">
                    <Plus className="h-8 w-8" />
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Create new product</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user?.role !== "EMPLOYER" && (
          <Card className="bg-white border-gray-200 hover:bg-gray-50 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Cart Value</p>
                  <p className="text-3xl font-bold text-navy-900">RWF {cartTotal.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Ready for checkout</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                  <ShoppingCart className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white border-gray-200 hover:bg-gray-50 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Wishlist Items</p>
                <p className="text-3xl font-bold text-navy-900">{wishlist.length}</p>
                <p className="text-xs text-gray-500 mt-1">Saved for later</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                <Heart className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 hover:bg-gray-50 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-navy-900">{orders.length}</p>
                <p className="text-xs text-gray-500 mt-1">Order history</p>
              </div>
              <div className="p-3 bg-navy-50 rounded-xl group-hover:bg-navy-100 transition-colors">
                <ShoppingBag className="h-8 w-8 text-navy-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-6" ref={tabsRef}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="cart">Cart</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            {user?.role === "DCC" && (
              <>
                <TabsTrigger value="stock-orders">Stock Orders</TabsTrigger>
                <TabsTrigger value="create-stock-order">Create Stock Order</TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        <TabsContent value="products">
          {/* Enhanced Search and Filters */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  className="pl-12 h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-navy-400 transition-all text-gray-700" 
                  placeholder="Search products by name or description..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px] h-12 bg-white border-gray-200 rounded-xl">
                    <Filter className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="preventative">Preventative Health</SelectItem>
                    <SelectItem value="reproductive">Reproductive Health</SelectItem>
                    <SelectItem value="water">Water & Sanitation</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-12 bg-white border-gray-200 rounded-xl">
                    <TrendingUp className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-none border-0 h-12 px-4 ${viewMode === "grid" ? "bg-navy-600 text-white" : "hover:bg-gray-100"}`}
                  >
                    <GridIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`rounded-none border-0 h-12 px-4 ${viewMode === "list" ? "bg-navy-600 text-white" : "hover:bg-gray-100"}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-4" 
            : "space-y-3"
          }>
            {loading ? (
              // Loading state
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              // Error state
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-red-100 p-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Products</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchProducts} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            ) : sortedProducts.length === 0 ? (
              // Empty state
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-gray-100 p-3 mb-4">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Available</h3>
                <p className="text-gray-600 max-w-sm">There are currently no products in the marketplace. Please check back later or contact your administrator.</p>
              </div>
            ) : (
              // Products list
              sortedProducts.map((product) => (
                <Card key={product.id} className={`overflow-hidden bg-white border border-gray-200 hover:border-navy-200 hover:bg-gray-50 transition-all duration-300 group ${
                  viewMode === "list" ? "flex" : ""
                }`}>
                  <div className={`relative ${viewMode === "list" ? "w-36" : "w-full"} h-0 pb-[100%]`}>
                    <div className="absolute inset-0">
                      <ProductImage 
                        src={product.image} 
                        alt={product.name}
                        fill
                        priority={product.isPopular}
                        darkOverlay={product.isNew || product.isPopular}
                        className="group-hover:scale-105 transition-transform duration-300"
                        fallbackSrc="/placeholder.jpg"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.isNew && (
                          <Badge className="bg-orange-500 text-white border-0 px-2 py-0.5 text-[10px] font-medium">
                            ✨ New
                          </Badge>
                        )}
                        {product.isPopular && (
                          <Badge className="bg-navy-600 text-white border-0 px-2 py-0.5 text-[10px] font-medium">
                            🔥 Popular
                          </Badge>
                        )}
                        {product.originalPrice && (
                          <Badge className="bg-orange-600 text-white border-0 px-2 py-0.5 text-[10px] font-medium">
                            💰 Sale
                          </Badge>
                        )}
                      </div>
                      {user?.role === "EMPLOYER" && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedProduct(product)
                              setShowEditDialog(true)
                            }}
                            className="h-6 w-6 p-0 bg-white/80 hover:bg-white rounded-full"
                          >
                            <Edit className="h-3 w-3 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedProduct(product)
                              setShowDeleteDialog(true)
                            }}
                            className="h-6 w-6 p-0 bg-white/80 hover:bg-white rounded-full"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`p-3 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className={viewMode === "list" ? "flex gap-4" : ""}>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-sm font-semibold text-navy-600">
                              RWF {formatNumber(product.price)}
                            </div>
                            {product.originalPrice && (
                              <div className="text-xs text-gray-500 line-through">
                                RWF {formatNumber(product.originalPrice)}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            +RWF {formatNumber(product.commission)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            <span>{product.stock}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span>{product.rating} ({product.reviews})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardFooter className="p-2 pt-0 flex gap-2">
                    <Button 
                      className="flex-1 bg-navy-600 hover:bg-navy-700 text-white border-0 rounded-xl h-8 text-xs font-medium group" 
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="mr-1 h-3 w-3 group-hover:scale-110 transition-transform" />
                      Add to Cart
                    </Button>
                    {user?.role === "DCC" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product)
                          setShowStockOrderDialog(true)
                        }}
                        className="bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl h-8 w-8 p-0 group"
                      >
                        <Package className="h-3 w-3 group-hover:scale-110 transition-transform" />
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product)
                        setShowProductDialog(true)
                      }}
                      className="bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl h-8 w-8 p-0 group"
                    >
                      <Eye className="h-3 w-3 group-hover:scale-110 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="cart">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {cart.map((item) => {
              const product = products.find(p => p.id === item.productId)
              if (!product) return null
              
              return (
                <div key={item.productId} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="relative w-16 h-16">
                    <Image 
                      src={product.image?.startsWith('/') ? product.image : `/uploads/${product.image}`} 
                      alt={product.name} 
                      fill 
                      className="object-cover rounded" 
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-500">RWF {product.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">RWF {(product.price * item.quantity).toLocaleString()}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )
            })}
            {cart.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <>
              <Separator />
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span>RWF {cartTotal.toLocaleString()}</span>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCartDialog(false)}
                >
                  Continue Shopping
                </Button>
                <Button 
                  onClick={() => {
                    setShowCartDialog(false)
                    setShowCheckoutDialog(true)
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Checkout
                </Button>
              </DialogFooter>
            </>
          )}
        </TabsContent>

        <TabsContent value="wishlist">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const product = products.find(p => p.id === item.productId)
              if (!product) return null
              
              return (
                <Card key={item.productId} className="overflow-hidden">
                  <div className="relative h-48">
                    <Image 
                      src={product.image?.startsWith('/') ? product.image : `/uploads/${product.image}`} 
                      alt={product.name} 
                      fill 
                      className="object-cover" 
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-primary">
                        RWF {product.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </span>
                    </div>
              </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full" 
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardFooter>
            </Card>
              )
            })}
            {wishlist.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500">Start browsing products to add items to your wishlist</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Stock Orders Tab */}
        {user?.role === "DCC" && (
          <TabsContent value="stock-orders">
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-2">Stock Orders</h2>
                <p className="text-gray-600">View and manage your stock order requests</p>
              </div>
              <StockOrderList />
            </div>
          </TabsContent>
        )}

        {/* Create Stock Order Tab */}
        {user?.role === "DCC" && (
          <TabsContent value="create-stock-order">
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6" style={{ backgroundColor: 'hsl(var(--background))', opacity: 1 }}>
                <div className="flex items-center justify-between" style={{ opacity: 1 }}>
                  <div style={{ opacity: 1 }}>
                    <h2 className="text-xl font-semibold mb-2" style={{ opacity: 1 }}>Create Stock Order</h2>
                    <p className="text-gray-600" style={{ opacity: 1 }}>Request additional stock for products</p>
                  </div>
                </div>
              </div>
              
              <Card style={{ backgroundColor: 'hsl(var(--background))', opacity: 1 }}>
                <CardContent className="p-6" style={{ backgroundColor: 'hsl(var(--background))', opacity: 1 }}>
                  <form onSubmit={handleStockOrderSubmit} className="space-y-6" style={{ opacity: 1 }}>
                    <div className="space-y-4" style={{ opacity: 1 }}>
                      <div style={{ opacity: 1 }}>
                        <label htmlFor="product" className="text-sm font-medium block mb-1" style={{ opacity: 1 }}>
                          Product
                        </label>
                        <Select
                          value={selectedProduct?.id || ""}
                          onValueChange={(value) => {
                            const product = products.find(p => p.id === value)
                            setSelectedProduct(product || null)
                          }}
                        >
                          <SelectTrigger style={{ backgroundColor: '#f5f5f5', opacity: 1 }}>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent style={{ backgroundColor: '#f5f5f5', opacity: 1 }}>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id} style={{ backgroundColor: '#f5f5f5', opacity: 1 }}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div style={{ opacity: 1 }}>
                        <label htmlFor="quantity" className="text-sm font-medium block mb-1" style={{ opacity: 1 }}>
                          Quantity
                        </label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="Enter quantity"
                          className="w-full"
                          style={{ backgroundColor: 'hsl(var(--background))', opacity: 1 }}
                        />
                      </div>

                      <div style={{ opacity: 1 }}>
                        <label htmlFor="comment" className="text-sm font-medium block mb-1" style={{ opacity: 1 }}>
                          Comment (Optional)
                        </label>
                        <Textarea
                          id="comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add any additional notes..."
                          className="w-full"
                          style={{ backgroundColor: 'hsl(var(--background))', opacity: 1 }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4" style={{ opacity: 1 }}>
                      <Button
                        type="submit"
                        disabled={isSubmitting || !selectedProduct || !quantity}
                        style={{ opacity: 1 }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Order
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Product Details Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  Product details and specifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative w-full" style={{ paddingBottom: "75%" }}>
                  <div className="absolute inset-0">
                    <ProductImage 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name} 
                      fill
                      priority
                      className="rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Price:</span> RWF {formatNumber(selectedProduct.price)}
                    </div>
                    <div>
                      <span className="font-medium">Commission:</span> RWF {formatNumber(selectedProduct.commission)}
                    </div>
                    <div>
                      <span className="font-medium">Provider:</span> {selectedProduct.provider}
                    </div>
                    <div>
                      <span className="font-medium">Stock:</span> {selectedProduct.stock} available
                    </div>
                    <div>
                      <span className="font-medium">Rating:</span> {selectedProduct.rating}/5 ({selectedProduct.reviews} reviews)
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {selectedProduct.category}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={showCartDialog} onOpenChange={setShowCartDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Shopping Cart</DialogTitle>
            <DialogDescription>
              Review your items before checkout
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {cart.map((item) => {
              const product = products.find(p => p.id === item.productId)
              if (!product) return null
              
              return (
                <div key={item.productId} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="relative w-16 h-16">
                    <Image 
                      src={product.image?.startsWith('/') ? product.image : `/uploads/${product.image}`} 
                      alt={product.name} 
                      fill 
                      className="object-cover rounded" 
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-500">RWF {product.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">RWF {(product.price * item.quantity).toLocaleString()}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )
            })}
            {cart.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <>
              <Separator />
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span>RWF {cartTotal.toLocaleString()}</span>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCartDialog(false)}
                >
                  Continue Shopping
                </Button>
                <Button 
                  onClick={() => {
                    setShowCartDialog(false)
                    setShowCheckoutDialog(true)
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Checkout
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Complete your order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Order Summary */}
            <div>
              <h4 className="font-medium mb-3">Order Summary</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cart.map((item) => {
                  const product = products.find(p => p.id === item.productId)
                  if (!product) return null
                  
                  return (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>{product.name} x {item.quantity}</span>
                      <span>RWF {(product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>RWF {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Delivery Information */}
            <div>
              <h4 className="font-medium mb-3">Delivery Information</h4>
              <div className="grid gap-3">
                <div>
                  <Label>Delivery Address</Label>
                  <Input id="address" placeholder="Enter your delivery address" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Phone number" />
                  </div>
                  <div>
                    <Label htmlFor="delivery">Delivery Option</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (3-5 days) - Free</SelectItem>
                        <SelectItem value="express">Express (1-2 days) - RWF 2,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h4 className="font-medium mb-3">Payment Method</h4>
              <Select defaultValue="momo">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="momo">Mobile Money (MTN/Airtel)</SelectItem>
                  <SelectItem value="cash">Cash on Delivery</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCheckoutDialog(false)}
            >
              Back to Cart
            </Button>
            <Button 
              onClick={handleCheckout}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Place Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
        <DialogContent className="sm:max-w-[600px] p-0 bg-white rounded-2xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-navy-900">Add New Product</DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              Add a new product to your marketplace
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProduct} className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name" 
                className="h-11 bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl transition-colors"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description" 
                className="min-h-[100px] bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl transition-colors resize-none"
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price (RWF)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  min="0" 
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0" 
                  className="h-11 bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl transition-colors"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission" className="text-sm font-medium text-gray-700">Commission (RWF)</Label>
                <Input 
                  id="commission" 
                  type="number" 
                  min="0" 
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                  placeholder="0" 
                  className="h-11 bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl transition-colors"
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-sm font-medium text-gray-700">Stock</Label>
              <Input 
                id="stock" 
                type="number" 
                min="0" 
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0" 
                className="h-11 bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl transition-colors"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl transition-colors">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="border-gray-200 rounded-xl">
                  <SelectItem value="preventative">Preventative Health</SelectItem>
                  <SelectItem value="reproductive">Reproductive Health</SelectItem>
                  <SelectItem value="water">Water & Sanitation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-medium text-gray-700">Product Image</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                <Input 
                  id="image" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  className="hidden"
                  required 
                />
                <label 
                  htmlFor="image" 
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <div className="p-3 bg-white rounded-full border border-gray-200">
                    <Plus className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </label>
                {formData.image && (
                  <div className="mt-4 text-sm text-green-600 flex items-center justify-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {formData.image.name}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-active"
                    name="status"
                    checked={formData.status === "active"}
                    onChange={() => setFormData(prev => ({ ...prev, status: "active" as const }))}
                    className="text-navy-600 focus:ring-navy-500"
                  />
                  <Label htmlFor="status-active" className="cursor-pointer">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-inactive"
                    name="status"
                    checked={formData.status === "inactive"}
                    onChange={() => setFormData(prev => ({ ...prev, status: "inactive" as const }))}
                    className="text-navy-600 focus:ring-navy-500"
                  />
                  <Label htmlFor="status-inactive" className="cursor-pointer">Inactive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-out_of_stock"
                    name="status"
                    checked={formData.status === "out_of_stock"}
                    onChange={() => setFormData(prev => ({ ...prev, status: "out_of_stock" as const }))}
                    className="text-navy-600 focus:ring-navy-500"
                  />
                  <Label htmlFor="status-out_of_stock" className="cursor-pointer">Out of Stock</Label>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddProductDialog(false)}
                className="h-11 px-6 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="h-11 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-navy-900">Edit Product</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Make changes to the product information below. All fields marked with * are required.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-navy-900">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name" className="font-medium">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-name"
                        defaultValue={selectedProduct.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full"
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category" className="font-medium">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        defaultValue={selectedProduct.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger id="edit-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preventative">Preventative Care</SelectItem>
                          <SelectItem value="diagnostic">Diagnostic Tools</SelectItem>
                          <SelectItem value="reproductive">Reproductive Health</SelectItem>
                          <SelectItem value="emergency">Emergency Care</SelectItem>
                          <SelectItem value="water">Water & Sanitation</SelectItem>
                          <SelectItem value="nutrition">Nutrition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description" className="font-medium">Description</Label>
                    <Textarea
                      id="edit-description"
                      defaultValue={selectedProduct.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[100px]"
                      placeholder="Enter product description"
                    />
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-navy-900">Pricing & Stock</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-price" className="font-medium">
                        Price (RWF) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-price"
                        type="number"
                        defaultValue={selectedProduct.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        min={0}
                        step={100}
                        placeholder="Enter price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-original-price" className="font-medium">Original Price (RWF)</Label>
                      <Input
                        id="edit-original-price"
                        type="number"
                        defaultValue={selectedProduct.originalPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                        min={0}
                        step={100}
                        placeholder="Enter original price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-commission" className="font-medium">
                        Commission (RWF) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-commission"
                        type="number"
                        defaultValue={selectedProduct.commission}
                        onChange={(e) => setFormData(prev => ({ ...prev, commission: e.target.value }))}
                        min={0}
                        step={50}
                        placeholder="Enter commission"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-stock" className="font-medium">
                        Stock <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-stock"
                        type="number"
                        defaultValue={selectedProduct.stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                        min={0}
                        step={1}
                        placeholder="Enter stock quantity"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Status & Flags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-navy-900">Status & Visibility</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="font-medium">Status</Label>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="status-active"
                            name="status"
                            checked={formData.status === "active"}
                            onChange={() => setFormData(prev => ({ ...prev, status: "active" as const }))}
                            className="text-navy-600 focus:ring-navy-500"
                          />
                          <Label htmlFor="status-active" className="cursor-pointer">
                            <div className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                              Active
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="status-inactive"
                            name="status"
                            checked={formData.status === "inactive"}
                            onChange={() => setFormData(prev => ({ ...prev, status: "inactive" as const }))}
                            className="text-navy-600 focus:ring-navy-500"
                          />
                          <Label htmlFor="status-inactive" className="cursor-pointer">
                            <div className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-gray-400 mr-2"></div>
                              Inactive
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="status-out_of_stock"
                            name="status"
                            checked={formData.status === "out_of_stock"}
                            onChange={() => setFormData(prev => ({ ...prev, status: "out_of_stock" as const }))}
                            className="text-navy-600 focus:ring-navy-500"
                          />
                          <Label htmlFor="status-out_of_stock" className="cursor-pointer">
                            <div className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                              Out of Stock
                            </div>
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="font-medium">Product Flags</Label>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is-new"
                            checked={formData.isNew}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, isNew: checked as boolean }))
                            }
                          />
                          <Label htmlFor="is-new" className="cursor-pointer">Mark as New</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is-popular"
                            checked={formData.isPopular}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, isPopular: checked as boolean }))
                            }
                          />
                          <Label htmlFor="is-popular" className="cursor-pointer">Mark as Popular</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-navy-900">Product Image</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="font-medium">Current Image</Label>
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <ProductImage
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="font-medium">Upload New Image</Label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setFormData(prev => ({ ...prev, image: file }))
                            }
                          }}
                          className="w-full"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Recommended size: 800x800px. Max file size: 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="px-4"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateProduct}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Product'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProduct && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="relative w-16 h-16">
                  <ProductImage 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    fill
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-500">RWF {selectedProduct.price.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedProduct) return
                
                try {
                  const token = localStorage.getItem("Gemurai_token")
                  if (!token) throw new Error("No authentication token found")

                  const response = await fetch(`/api/products/${selectedProduct.id}`, {
                    method: "DELETE",
                    headers: {
                      "Authorization": `Bearer ${token}`
                    }
                  })

                  if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || "Failed to delete product")
                  }

                  toast({
                    title: "Success",
                    description: "Product deleted successfully"
                  })

                  setShowDeleteDialog(false)
                  fetchProducts() // Refresh the products list
                } catch (error) {
                  console.error("Error deleting product:", error)
                  toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to delete product",
                    variant: "destructive"
                  })
                }
              }}
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Order Dialog */}
      <StockOrderDialog
        product={selectedProduct}
        isOpen={showStockOrderDialog}
        onClose={() => {
          setShowStockOrderDialog(false)
          setSelectedProduct(null)
        }}
        onSuccess={() => {
          // Refresh the stock orders list if we're on that tab
          if (tabsRef.current?.value === "stock-orders") {
            // The StockOrderList component will handle its own refresh
          }
        }}
      />
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <ClientOnly>
      <MarketplaceContent />
    </ClientOnly>
  )
}
