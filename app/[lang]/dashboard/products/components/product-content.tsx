"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ClientOnly } from "@/components/client-only"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "active":
      return "default"
    case "inactive":
      return "secondary"
    case "out_of_stock":
      return "destructive"
    default:
      return "outline"
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  commission: number
  category: string
  provider: string
  stock: number
  status: "active" | "inactive" | "out_of_stock"
  createdAt: string
  updatedAt: string
  tags?: string[]
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 10
  const { toast } = useToast()
  const router = useRouter()

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    commission: "",
    category: "",
    provider: "",
    stock: "",
    status: "active" as "active" | "inactive" | "out_of_stock",
    tags: [] as string[]
  })

  // Mock data
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Mosquito Net (LLIN)",
      description: "Long-lasting insecticidal nets for malaria prevention. WHO approved and highly effective.",
      price: 3500,
      originalPrice: 4000,
      commission: 350,
      category: "preventative",
      provider: "ADMIN",
      stock: 50,
      status: "active",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-20T14:30:00Z",
      tags: ["malaria", "prevention", "WHO approved"]
    }
  ]

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.provider.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || product.status === statusFilter
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
      
      return matchesSearch && matchesStatus && matchesCategory
    })

    filtered.sort((a, b) => {
      const aValue = a[sortField as keyof Product]
      const bValue = b[sortField as keyof Product]
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" 
          ? aValue - bValue
          : bValue - aValue
      }
      
      return 0
    })

    setFilteredProducts(filtered)
  }, [products, searchTerm, statusFilter, categoryFilter, sortField, sortDirection])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProducts(mockProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked)
    if (checked) {
      setSelectedProducts(filteredProducts.map(product => product.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const isSelected = prev.includes(productId)
      const newSelection = isSelected
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
      setIsSelectAll(newSelection.length === filteredProducts.length)
      return newSelection
    })
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    // Implement view logic
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      commission: product.commission.toString(),
      category: product.category,
      provider: product.provider,
      stock: product.stock.toString(),
      status: product.status,
      tags: product.tags || []
    })
    setShowEditDialog(true)
  }

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteDialog(true)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="preventative">Preventative</SelectItem>
            <SelectItem value="water">Water</SelectItem>
            <SelectItem value="reproductive">Reproductive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortField} onValueChange={setSortField}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
            <SelectItem value="updatedAt">Last Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isSelectAll}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading products...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-red-500">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                  <span>{error}</span>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  <Package className="h-6 w-6 mx-auto mb-2" />
                  <span>No products found</span>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.provider}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(product.status)}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{formatPrice(product.commission)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 