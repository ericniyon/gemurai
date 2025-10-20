"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ClientOnly } from "@/components/client-only"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

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

export function ProductContent() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return <ProductContentInner />
}

function ProductContentInner() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })
  const { toast } = useToast()

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

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
        <p className="text-gray-600">Browse and view all available products</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">
              Available in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF 0</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Active customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat || (cat === "All" && !category) ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(cat === "All" ? "" : cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg"
                    }}
                  />
                  <Badge className="absolute top-2 right-2">
                    {product.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-600">
                      RWF {product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Commission: {product.commission}%</span>
                    <span>Seller: {product.seller.name}</span>
                  </div>
                  <Button className="w-full" disabled={product.stock === 0}>
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                {[...Array(pagination.pages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={pagination.page === i + 1 ? "default" : "outline"}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
} 