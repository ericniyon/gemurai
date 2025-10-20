"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Heart, 
  Eye, 
  Star, 
  Plus, 
  Minus,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  Filter,
  GridIcon,
  List,
  ShoppingBag
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ClientOnly } from "@/components/client-only"
import { ProductImage } from "@/components/product-image"
import { categories, providers } from "@/lib/marketplace-data"
import { Product } from "@/app/types/product"
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

function DCCMarketplaceContent() {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showCartDialog, setShowCartDialog] = useState(false)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [showStockOrderDialog, setShowStockOrderDialog] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popularity")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch("/api/products", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data.products)
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "newest":
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
      default: // popularity
        return b.reviews - a.reviews
    }
  })

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

  return (
    <div className="min-h-screen bg-gray-50 space-y-8">
      {/* Enhanced Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900">
              DCC Marketplace
            </h2>
            <p className="text-gray-600 mt-1">Browse, buy, and manage health products for your community</p>
        </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCartDialog(true)}
              className="relative bg-white border-navy-200 hover:bg-navy-50 hover:border-navy-300 transition-all duration-200"
            >
              <ShoppingCart className="mr-2 h-4 w-4 text-navy-600" />
              <span className="font-medium">Cart ({cartItemCount})</span>
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-xs font-bold bg-orange-500 text-white border-2 border-white">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              <Heart className="mr-2 h-4 w-4 text-orange-500" />
              <span className="font-medium">Wishlist ({wishlist.length})</span>
              </Button>
              </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white border-gray-200 hover:bg-gray-50 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-navy-900">{products.length}</p>
                <p className="text-xs text-gray-500 mt-1">Available to purchase</p>
              </div>
              <div className="p-3 bg-navy-50 rounded-xl group-hover:bg-navy-100 transition-colors">
                <Package className="h-8 w-8 text-navy-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
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

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl h-12">
          <TabsTrigger 
            value="browse" 
            className="data-[state=active]:bg-navy-600 data-[state=active]:text-white transition-all duration-200 rounded-lg px-6 font-medium"
          >
            <Package className="mr-2 h-4 w-4" />
            Browse Products
          </TabsTrigger>
          <TabsTrigger 
            value="orders"
            className="data-[state=active]:bg-navy-600 data-[state=active]:text-white transition-all duration-200 rounded-lg px-6 font-medium"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            My Orders
          </TabsTrigger>
          <TabsTrigger 
            value="wishlist"
            className="data-[state=active]:bg-navy-600 data-[state=active]:text-white transition-all duration-200 rounded-lg px-6 font-medium"
          >
            <Heart className="mr-2 h-4 w-4" />
            Wishlist ({wishlist.length})
          </TabsTrigger>
          {user?.role === "DCC" && (
            <TabsTrigger 
              value="stock-orders"
              className="data-[state=active]:bg-navy-600 data-[state=active]:text-white transition-all duration-200 rounded-lg px-6 font-medium"
            >
              <Package className="mr-2 h-4 w-4" />
              Stock Orders
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="browse">
          {/* Enhanced Search and Filters */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  className="pl-12 h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-navy-400 transition-all text-gray-700" 
                  placeholder="Search products by name, description, or tags..." 
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
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
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

            {/* Enhanced Results Info */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-600">
                Showing <span className="text-navy-600 font-semibold">{sortedProducts.length}</span> of <span className="text-navy-600 font-semibold">{products.length}</span> products
              </p>
              {searchQuery && (
                <Badge variant="secondary" className="bg-navy-100 text-navy-700 border-navy-200">
                  Search: "{searchQuery}"
                </Badge>
              )}
            </div>
        </div>

          {/* Products Grid/List */}
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {sortedProducts.map((product) => (
              <Card key={product.id} className={`overflow-hidden bg-white border border-gray-200 hover:border-navy-200 hover:bg-gray-50 transition-all duration-300 group ${
                viewMode === "list" ? "flex" : ""
              }`}>
                <div className={`relative ${viewMode === "list" ? "w-48 h-48" : "h-48"}`}>
                  <ProductImage 
                    src={product.image} 
                    alt={product.name}
                    fill
                    priority={product.isPopular}
                    darkOverlay={product.isNew || product.isPopular}
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isNew && (
                      <Badge className="bg-orange-500 text-white border-0 px-3 py-1 text-xs font-medium">
                        ✨ New
                      </Badge>
                    )}
                    {product.isPopular && (
                      <Badge className="bg-navy-600 text-white border-0 px-3 py-1 text-xs font-medium">
                        🔥 Popular
                      </Badge>
                    )}
                    {product.originalPrice && (
                      <Badge className="bg-orange-600 text-white border-0 px-3 py-1 text-xs font-medium">
                        💰 Sale
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWishlist(product.id)}
                      className="h-10 w-10 p-0 bg-white border border-gray-200 hover:bg-white hover:scale-110 transition-all duration-200 rounded-full group"
                    >
                      <Heart className={`h-4 w-4 transition-all duration-200 ${
                        wishlist.some(item => item.productId === product.id) 
                          ? "fill-orange-500 text-orange-500 scale-110" 
                          : "text-gray-600 group-hover:text-orange-400"
                      }`} />
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(product.rating) 
                                ? "fill-orange-400 text-orange-400" 
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                  <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-navy-700 text-lg">
                          RWF {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            RWF {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    <Badge variant="outline" className="text-xs">
                      {product.provider}
                    </Badge>
                  </div>
                    <p className="text-xs text-orange-600 mb-2">
                      Commission: RWF {product.commission.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.stock} in stock
                    </p>
                </CardContent>
                  <CardFooter className="p-4 pt-0 flex gap-3">
                    <Button 
                      className="flex-1 bg-navy-600 hover:bg-navy-700 text-white border-0 rounded-xl h-11 font-medium group" 
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Add to Cart
                  </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product)
                        setShowProductDialog(true)
                      }}
                      className="bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl h-11 px-4 group"
                    >
                      <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </Button>
                </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="bg-white border border-gray-200 hover:border-navy-200 hover:bg-gray-50 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Order {order.id}</h3>
                      <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} border-0 px-4 py-2 font-medium rounded-xl`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => {
                      const product = products.find(p => p.id === item.productId)
                      return (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{product?.name} x {item.quantity}</span>
                          <span>RWF {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      )
                    })}
                    </div>
                  <Separator />
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="font-semibold">Total: RWF {order.total.toLocaleString()}</span>
                      {order.trackingNumber && (
                        <p className="text-xs text-muted-foreground">
                          Tracking: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {order.status === "delivered" && (
                        <Button size="sm">Reorder</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                      src={product.image} 
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

        {user?.role === "DCC" && (
          <TabsContent value="stock-orders">
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-2">Stock Orders</h2>
                <p className="text-gray-600">Manage your stock order requests</p>
              </div>
              <StockOrderList />
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Product Detail Dialog */}
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
                <div className="relative h-64">
                  <ProductImage 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    fill
                    priority
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                  <div className="mt-4">
                    <span className="font-medium text-sm">Description:</span>
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedProduct.description}
                    </p>
                  </div>
                  <div className="mt-4">
                    <span className="font-medium text-sm">Provider:</span>
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedProduct.provider}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Price:</span> RWF {selectedProduct.price.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Commission:</span> RWF {selectedProduct.commission.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Stock:</span> {selectedProduct.stock} available
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => toggleWishlist(selectedProduct.id)}
                >
                  <Heart className={`mr-2 h-4 w-4 ${
                    wishlist.some(item => item.productId === selectedProduct.id) 
                      ? "fill-red-500 text-red-500" 
                      : "text-gray-600"
                  }`} />
                  {wishlist.some(item => item.productId === selectedProduct.id) 
                    ? "Remove from Wishlist" 
                    : "Add to Wishlist"
                  }
                </Button>
                <Button onClick={() => addToCart(selectedProduct.id)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </DialogFooter>
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
                      src={product.image} 
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

      {/* Stock Order Dialog */}
      <StockOrderDialog
        product={selectedProduct}
        isOpen={showStockOrderDialog}
        onClose={() => {
          setShowStockOrderDialog(false)
          setSelectedProduct(null)
        }}
      />
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <ClientOnly>
      <DCCMarketplaceContent />
    </ClientOnly>
  )
}
