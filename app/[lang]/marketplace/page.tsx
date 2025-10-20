"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
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
import {
  Filter,
  Search,
  ShoppingBag,
  ShoppingCart,
  Eye,
  Star,
  Heart,
  Plus,
  Minus,
  ArrowLeft,
  TrendingUp,
  Shield,
  Award,
  Package,
  X,
  Grid3X3,
  List,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Users,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { ClientOnly } from "@/components/client-only"
import { marketplaceTranslations } from "../translations/marketplace"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// Helper function to get default product images based on name and category
const getDefaultProductImage = (productName: string, category: string): string => {
  const name = productName.toLowerCase()
  const cat = category.toLowerCase()
  
  // Map based on product name
  if (name.includes('bleach') || name.includes('cleaning')) {
    return '/img/Bleach_Household.png'
  }
  if (name.includes('oil') || name.includes('cooking')) {
    return '/img/Cooking_Oil_Vegetable.png'
  }
  if (name.includes('sugar') || name.includes('sweet')) {
    return '/img/Sugar_White_Refined.png'
  }
  if (name.includes('salt')) {
    return '/img/Salt_Iodized.png'
  }
  if (name.includes('toothpaste') || name.includes('dental')) {
    return '/img/Toothpaste_Fresh_Mint.png'
  }
  if (name.includes('toilet') || name.includes('paper')) {
    return '/img/Toilet_Paper_Soft.png'
  }
  if (name.includes('rice')) {
    return '/img/Rice_Premium_Quality.png'
  }
  if (name.includes('soap') || name.includes('wash')) {
    return '/img/Soap_Bar_Antibacterial.png'
  }
  if (name.includes('detergent') || name.includes('omo')) {
    return '/img/OMO_Detergent_Powder.png'
  }
  if (name.includes('condom') || name.includes('protection')) {
    return '/img/Condom_Premium.png'
  }
  
  // Map based on category
  if (cat.includes('household') || cat.includes('cleaning')) {
    return '/img/Bleach_Household.png'
  }
  if (cat.includes('cooking') || cat.includes('food')) {
    return '/img/Cooking_Oil_Vegetable.png'
  }
  if (cat.includes('personal') || cat.includes('hygiene')) {
    return '/img/Toothpaste_Fresh_Mint.png'
  }
  if (cat.includes('health') || cat.includes('medical')) {
    return '/img/Condom_Premium.png'
  }
  
  // Default fallback
  return '/img/Cooking_Oil_Vegetable.png'
}

// Helper function to get product image
const getProductImage = (product: any): string => {
  if (product.image) {
    return product.image.startsWith('http') ? product.image : `/uploads/${product.image}`
  }
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0]
    return firstImage.startsWith('http') ? firstImage : `/uploads/${firstImage}`
  }
  return getDefaultProductImage(product.name, product.category)
}

// Helper function to process database image URLs
const processDatabaseImage = (imageUrl: string): string => {
  if (!imageUrl) return '/img/Cooking_Oil_Vegetable.png'
  if (imageUrl.startsWith('http')) return imageUrl
  return `/uploads/${imageUrl}`
}

export default function MarketplacePage() {
  const params = useParams()
  const router = useRouter()
  const lang = params?.lang as string || 'en'
  const t = marketplaceTranslations[lang] || marketplaceTranslations.en
  const { toast } = useToast()

  // State management
  const [dccProducts, setDccProducts] = useState<any[]>([])
  const [isDCCProductsLoading, setIsDCCProductsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProvider, setSelectedProvider] = useState("all")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [showCartAlert, setShowCartAlert] = useState(false)

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/customer/cart')
      
      // Handle authentication errors gracefully
      if (response.status === 401) {
        console.log('User not authenticated, cart will be empty')
        setCartItemCount(0)
        return
      }
      
      if (!response.ok) {
        console.error('Error fetching cart:', response.status, response.statusText)
        setCartItemCount(0)
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        setCartItemCount(data.cart.totalItems || 0)
      } else {
        setCartItemCount(0)
      }
    } catch (error) {
      console.error('Error fetching cart count:', error)
      setCartItemCount(0)
    }
  }

  // Fetch DCC products
  const fetchDCCProducts = async () => {
    try {
      setIsDCCProductsLoading(true)
      const response = await fetch('/api/products?limit=100')
      
      if (!response.ok) {
        console.error('Error fetching products:', response.status, response.statusText)
        setDCCProducts([])
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        console.log('📦 Fetched products:', data.products.length)
        
        // Transform products to include stock information
        const productsWithStock = data.products.map((product: any) => {
          console.log(`📦 Product: ${product.name}`, {
            image: product.image,
            images: product.images,
            category: product.category,
            stock: product.stock,
            dccStockTotal: product.dccStockTotal,
            finalStock: product.stock // This will be the stock value displayed
          })
          return {
            ...product,
            stock: product.stock,
            dccStockTotal: product.dccStockTotal || 0
          }
        })
        
        setDccProducts(productsWithStock)
      } else {
        console.error('❌ Failed to fetch products:', data.error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error)
      toast({
        title: "Error",
        description: "Failed to load products. Please check your connection.",
        variant: "destructive",
      })
    } finally {
      setIsDCCProductsLoading(false)
    }
  }

  // Add to cart function
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      console.log('🛒 Adding to cart:', productId, 'quantity:', quantity)
      
      const response = await fetch('/api/customer/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      })

      // Handle authentication errors gracefully
      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to add items to your cart",
          variant: "destructive"
        })
        return
      }

      if (!response.ok) {
        console.error('Error adding to cart:', response.status, response.statusText)
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive"
        })
        return
      }

      const data = await response.json()

      if (data.success) {
        // Show success alert
        setShowCartAlert(true)
        
        // Update cart count
        setCartItemCount(prev => prev + quantity)
        
        // Show toast notification
        toast({
          title: "Added to Cart",
          description: "Product has been added to your cart successfully!",
        })
        
        console.log('✅ Successfully added to cart:', data)
        
        // Hide alert after 3 seconds
        setTimeout(() => {
          setShowCartAlert(false)
        }, 3000)
      } else {
        console.error('❌ Failed to add to cart:', data.error)
        toast({
          title: "Error",
          description: data.error || "Failed to add product to cart. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error)
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please check your connection.",
        variant: "destructive",
      })
    }
  }

  // Filter products
  const filteredProducts = dccProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesProvider = selectedProvider === "all" || product.sellerId === selectedProvider
    const matchesPrice = (!priceRange.min || product.price >= Number(priceRange.min)) &&
                        (!priceRange.max || product.price <= Number(priceRange.max))
    
    return matchesSearch && matchesCategory && matchesProvider && matchesPrice
  })

  const sortedDCCProducts = [...filteredProducts].sort((a, b) => {
    if (a.isNew && !b.isNew) return -1
    if (!a.isNew && b.isNew) return 1
    return b.stock - a.stock
  })

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchDCCProducts(),
          fetchCartCount()
        ])
      } catch (error) {
        console.error('Error initializing marketplace data:', error)
      }
    }
    
    initializeData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AuthHeader />
      
      {/* Success Alert */}
      {showCartAlert && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Item added to cart successfully!</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCartAlert(false)}
              className="h-6 w-6 p-0 text-white hover:bg-green-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 mr-3 text-yellow-300" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {t.hero.title}
              </h1>
              <Sparkles className="h-8 w-8 ml-3 text-yellow-300" />
            </div>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                <Shield className="h-6 w-6 text-green-300" />
                <span className="font-medium">{t.hero.badges.quality}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                <TrendingUp className="h-6 w-6 text-yellow-300" />
                <span className="font-medium">{t.hero.badges.commission}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                <Award className="h-6 w-6 text-purple-300" />
                <span className="font-medium">{t.hero.badges.providers}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Search and Filters Section */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>
              </div>
              
              {/* Filter Toggle */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12 px-6 border-2 border-gray-200 hover:border-blue-500 rounded-xl"
                >
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  Filters
                </Button>
                
                {/* Cart Icon with Count */}
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/${lang}/cart`)}
                    className="h-12 px-4 border-2 border-gray-200 hover:border-blue-500 rounded-xl relative cursor-pointer"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    <span className="font-medium">Cart</span>
                    {cartItemCount > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                        {cartItemCount}
                      </div>
                    )}
                  </Button>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-12 px-4 rounded-none"
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-12 px-4 rounded-none"
                  >
                    <List className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="preventative">🦟 Preventative</SelectItem>
                        <SelectItem value="water">💧 Water & Sanitation</SelectItem>
                        <SelectItem value="reproductive">❤️ Reproductive Health</SelectItem>
                        <SelectItem value="household">🏠 Household</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Provider</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl">
                        <SelectValue placeholder="All Providers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        <SelectItem value="sfh">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Min Price (RWF)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="h-12 border-2 border-gray-200 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Max Price (RWF)</Label>
                    <Input
                      type="number"
                      placeholder="∞"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="h-12 border-2 border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Results Header */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div> 
              <h2 className="text-3xl font-bold text-gray-900 mb-2">All Products</h2>
              <p className="text-gray-600">
                {sortedDCCProducts.length} products found
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 text-sm">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                Fast Delivery
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm">
                <Shield className="h-4 w-4 mr-2 text-green-500" />
                Quality Assured
              </Badge>
              
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section>
          {isDCCProductsLoading ? (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            )}>
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden bg-white border-2 border-gray-100 rounded-2xl">
                  <div className="h-48 bg-gray-200 rounded-t-2xl" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedDCCProducts.length > 0 ? (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            )}>
              {sortedDCCProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 rounded-2xl h-full">
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={getProductImage(product)}
                      alt={product.name}
                      fill
                      className="group-hover:scale-110 transition-transform duration-500 object-cover"
                      onError={(e) => {
                        console.error(`❌ Image failed to load for ${product.name}:`, getProductImage(product));
                        const target = e.target as HTMLImageElement;
                        target.src = getDefaultProductImage(product.name, product.category);
                      }}
                      onLoad={() => {
                        console.log(`✅ Image loaded successfully for ${product.name}:`, getProductImage(product));
                      }}
                    />
                    
                    {/* Overlay with badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Top badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.isNew && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-3 py-1 text-xs font-medium shadow-lg">
                          ✨ New
                        </Badge>
                      )}
                    </div>
                    
                    {/* Category badge */}
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="text-xs bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
                        {product.category}
                      </Badge>
                    </div>
                    
                    {/* Stock indicator */}
                    <div className="absolute bottom-4 left-4">
                      <Badge className={cn(
                        "text-xs font-medium shadow-lg",
                        product.stock > 0 
                          ? "bg-green-500 text-white" 
                          : "bg-red-500 text-white"
                      )}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </Badge>
                    </div>
                  </div>

                  {/* Product Content */}
                  <CardContent className="p-4 flex flex-col h-full min-h-[220px]">
                    <div className="flex-1 space-y-2">
                      {/* Header Section */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 pr-2">
                          <h3 className="font-bold text-base text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-1.5 py-0.5">
                              {product.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                              <span className="font-medium text-blue-600">ADMIN</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div className="min-h-[1.8rem]">
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                      
                      {/* Pricing Section */}
                      <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 rounded-md p-2 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-gray-900">
                              RWF {product.price.toLocaleString()}
                            </span>
                            <p className="text-xs text-gray-500">Per unit</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <span className="text-sm">💰</span>
                              <span className="text-xs font-bold text-orange-600">
                                RWF {product.commission.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">Commission</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stock Status & Badges */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            product.stock > 0 ? "bg-green-500" : "bg-red-500"
                          )}></div>
                          <span className={cn(
                            "text-xs font-medium",
                            product.stock > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {product.isNew && (
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs px-1.5 py-0.5">
                              ✨ New
                            </Badge>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              console.log('All Products - Details button clicked for product:', product)
                              console.log('Product ID:', product.id)
                              console.log('Product Name:', product.name)
                              if (!product.id || !product.name) {
                                console.error('Product missing required properties:', product)
                                return
                              }
                              setSelectedProduct(product)
                              setShowProductDialog(true)
                            }}
                            className="h-6 w-6 p-0 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all duration-200 flex-shrink-0"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-md h-9 font-semibold text-xs shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
                        onClick={() => addToCart(product.id, 1)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="max-w-md mx-auto">
                  <Package className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-3">No Products Found</h3>
                  <p className="text-gray-500 mb-6">No products match your search criteria. Try adjusting your filters.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                      setSelectedProvider("all")
                      setPriceRange({ min: "", max: "" })
                    }}
                    className="px-8 py-3 rounded-xl"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
        </section>
      </main>

      {/* Product Detail Dialog */}
      <Dialog open={showProductDialog} onOpenChange={(open) => {
        console.log('Dialog state changing to:', open)
        setShowProductDialog(open)
      }}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl">
          {selectedProduct && (
            <>
              <DialogHeader className="border-b border-gray-200 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-4xl font-bold text-gray-900 mb-3">
                      {selectedProduct.name}
                    </DialogTitle>
                    <div className="flex items-center gap-3 flex-wrap">
                      {selectedProduct.isNew && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                          ✨ New Product
                        </Badge>
                      )}
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {selectedProduct.category}
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        ADMIN
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProductDialog(false)}
                    className="h-10 w-10 p-0 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
                {/* Left Column - Images */}
                <div className="space-y-6">
                  {/* Main Image */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-gray-200">
                    <Image 
                      src={selectedProduct.images && selectedProduct.images.length > 0 
                        ? processDatabaseImage(selectedProduct.images[selectedImageIndex])
                        : getProductImage(selectedProduct)} 
                      alt={selectedProduct.name} 
                      fill
                      priority
                      className="object-cover transition-transform hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getDefaultProductImage(selectedProduct.name, selectedProduct.category);
                      }}
                    />
                  </div>
                  
                  {/* Additional Images Thumbnails */}
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {selectedProduct.images.map((image: string, index: number) => (
                        <div
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors cursor-pointer ${
                            selectedImageIndex === index 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <Image
                            src={processDatabaseImage(image)}
                            alt={`${selectedProduct.name} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getDefaultProductImage(selectedProduct.name, selectedProduct.category);
                            }}
                          />
                          {selectedImageIndex === index && (
                            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column - Product Information */}
                <div className="space-y-6">
                  {/* Price and Stock Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-4xl font-bold text-gray-900">
                          RWF {selectedProduct.price.toLocaleString()}
                        </p>
                        {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                          <p className="text-lg text-gray-500 line-through">
                            RWF {selectedProduct.originalPrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-600">Stock Status</p>
                        <div className="space-y-1">
                          <Badge 
                            className={cn(
                              "mt-2 text-sm px-4 py-2",
                              selectedProduct.stock > 0 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-red-100 text-red-800 border-red-200"
                            )}
                          >
                            {selectedProduct.stock > 0 ? `${selectedProduct.stock} available` : "Out of stock"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Commission Highlight */}
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="font-semibold text-orange-800">Commission Opportunity</span>
                      </div>
                      <p className="text-3xl font-bold text-orange-700">
                        RWF {selectedProduct.commission.toLocaleString()}
                      </p>
                      <p className="text-sm text-orange-600">per unit sold</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Product Description</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Product Details */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Product Details</h3>
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">Category</span>
                        <span className="text-gray-900">{selectedProduct.category}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">Provider</span>
                        <span className="text-gray-900">ADMIN</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">Commission</span>
                        <span className="text-orange-600 font-bold">RWF {selectedProduct.commission.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-700">Stock</span>
                        <span className={cn(
                          "font-bold",
                          selectedProduct.stock > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {selectedProduct.stock > 0 ? `${selectedProduct.stock} units` : "Out of stock"}
                        </span>
                      </div>
                      {selectedProduct.manufacturer && (
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="font-semibold text-gray-700">Manufacturer</span>
                          <span className="text-gray-900">{selectedProduct.manufacturer}</span>
                        </div>
                      )}
                      {selectedProduct.countryOfOrigin && (
                        <div className="flex justify-between items-center py-3">
                          <span className="font-semibold text-gray-700">Country of Origin</span>
                          <span className="text-gray-900">{selectedProduct.countryOfOrigin}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
                      <span className="text-sm text-gray-500">
                        {selectedProduct.stock} available
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="h-10 w-10 p-0 rounded-lg border-2"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 text-center">
                        <span className="text-2xl font-bold text-gray-900">{quantity}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                        disabled={quantity >= selectedProduct.stock}
                        className="h-10 w-10 p-0 rounded-lg border-2"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-600">
                        Total: RWF {(selectedProduct.price * quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl h-14 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300" 
                      onClick={() => addToCart(selectedProduct.id, quantity)}
                      disabled={selectedProduct.stock === 0}
                    >
                      <ShoppingCart className="mr-3 h-6 w-6" />
                      Add to Cart ({quantity})
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowProductDialog(false)
                        setQuantity(1) // Reset quantity when closing
                      }}
                      className="px-8 h-14 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-700 rounded-xl font-semibold text-lg"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AuthFooter />
    </div>
  )
} 