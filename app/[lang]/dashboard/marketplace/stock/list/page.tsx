"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash, 
  Eye, 
  Plus,
  Package,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
import { ClientOnly } from "@/components/client-only"
import { ProductImage } from "@/components/product-image"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  status: string
  image: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

function StockListContent() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products")
      
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      toast({
        title: "Success",
        description: "Product deleted successfully"
      })

      // Refresh the products list
      fetchProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error("Failed to update product status")
      }

      toast({
        title: "Success",
        description: `Product ${newStatus === "active" ? "activated" : "deactivated"} successfully`
      })

      // Refresh the products list
      fetchProducts()
    } catch (error) {
      console.error("Error updating product status:", error)
      toast({
        title: "Error",
        description: "Failed to update product status. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || product.status === filterStatus
    const matchesCategory = filterCategory === "all" || product.category === filterCategory

    return matchesSearch && matchesStatus && matchesCategory
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category)))

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (stock <= 5) {
      return <Badge variant="secondary">Low Stock</Badge>
    }
    if (status === "active") {
      return <Badge variant="default">Active</Badge>
    }
    return <Badge variant="outline">Inactive</Badge>
  }

  if (!user || user.role !== "DCC") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <Link href={`/${lang}/dashboard`}>
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${lang}/dashboard/marketplace/stock`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stock
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Stock List</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your inventory and product listings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchProducts} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href={`/${lang}/dashboard/marketplace/stock/add`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-semibold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-semibold">
                  {products.filter(p => p.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-semibold">
                  {products.filter(p => p.stock <= 5 && p.stock > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-semibold">
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <CardDescription>
            Manage your product inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? "No products found" : "No products yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first product"}
              </p>
              {!searchTerm && (
                <Link href={`/${lang}/dashboard/marketplace/stock/add`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(product.price)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          product.stock === 0 ? 'text-red-600' : 
                          product.stock <= 5 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(product.status, product.stock)}
                      </TableCell>
                      <TableCell>
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => router.push(`/${lang}/dashboard/products/${product.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/${lang}/dashboard/products/${product.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(product.id, product.status)}
                            >
                              {product.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function StockListPage() {
  return (
    <ClientOnly>
      <StockListContent />
    </ClientOnly>
  )
} 