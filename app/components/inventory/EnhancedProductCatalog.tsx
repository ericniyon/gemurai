"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Boxes,
  Tag,
  Image,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Star,
  Heart,
  Share,
  Copy,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Target,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  HelpCircle,
  Lightbulb,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Flame,
  Snowflake,
  Zap as Lightning,
  Globe,
  Map,
  Navigation,
  Compass,
  Home,
  Building,
  Store,
  ShoppingCart,
  CreditCard,
  Wallet,
  Banknote,
  Coins,
  Receipt,
  Calculator,
  Percent,
  Hash,
  AtSign,
  Phone,
  Mail,
  MessageCircle,
  Video,
  Camera,
  Mic,
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat as RepeatIcon,
  Volume1,
  Maximize,
  Minimize,
  Move,
  Move3D,
  MoveHorizontal,
  MoveVertical,
  MoveDiagonal,
  MoveDiagonal2,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  DoubleArrowUp,
  DoubleArrowDown,
  DoubleArrowLeft,
  DoubleArrowRight,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  CornerLeftUp,
  CornerLeftDown,
  CornerRightUp,
  CornerRightDown,
  CurvedUpLeft,
  CurvedUpRight,
  CurvedDownLeft,
  CurvedDownRight,
  CurvedLeftUp,
  CurvedLeftDown,
  CurvedRightUp,
  CurvedRightDown,
  CurvedUp,
  CurvedDown,
  CurvedLeft,
  CurvedRight,
  CurvedUpLeft2,
  CurvedUpRight2,
  CurvedDownLeft2,
  CurvedDownRight2,
  CurvedLeftUp2,
  CurvedLeftDown2,
  CurvedRightUp2,
  CurvedRightDown2,
  CurvedUp2,
  CurvedDown2,
  CurvedLeft2,
  CurvedRight2,
  CurvedUpLeft3,
  CurvedUpRight3,
  CurvedDownLeft3,
  CurvedDownRight3,
  CurvedLeftUp3,
  CurvedLeftDown3,
  CurvedRightUp3,
  CurvedRightDown3,
  CurvedUp3,
  CurvedDown3,
  CurvedLeft3,
  CurvedRight3,
  CurvedUpLeft4,
  CurvedUpRight4,
  CurvedDownLeft4,
  CurvedDownRight4,
  CurvedLeftUp4,
  CurvedLeftDown4,
  CurvedRightUp4,
  CurvedRightDown4,
  CurvedUp4,
  CurvedDown4,
  CurvedLeft4,
  CurvedRight4,
  CurvedUpLeft5,
  CurvedUpRight5,
  CurvedDownLeft5,
  CurvedDownRight5,
  CurvedLeftUp5,
  CurvedLeftDown5,
  CurvedRightUp5,
  CurvedRightDown5,
  CurvedUp5,
  CurvedDown5,
  CurvedLeft5,
  CurvedRight5,
  CurvedUpLeft6,
  CurvedUpRight6,
  CurvedDownLeft6,
  CurvedDownRight6,
  CurvedLeftUp6,
  CurvedLeftDown6,
  CurvedRightUp6,
  CurvedRightDown6,
  CurvedUp6,
  CurvedDown6,
  CurvedLeft6,
  CurvedRight6,
  CurvedUpLeft7,
  CurvedUpRight7,
  CurvedDownLeft7,
  CurvedDownRight7,
  CurvedLeftUp7,
  CurvedLeftDown7,
  CurvedRightUp7,
  CurvedRightDown7,
  CurvedUp7,
  CurvedDown7,
  CurvedLeft7,
  CurvedRight7,
  CurvedUpLeft8,
  CurvedUpRight8,
  CurvedDownLeft8,
  CurvedDownRight8,
  CurvedLeftUp8,
  CurvedLeftDown8,
  CurvedRightUp8,
  CurvedRightDown8,
  CurvedUp8,
  CurvedDown8,
  CurvedLeft8,
  CurvedRight8,
  CurvedUpLeft9,
  CurvedUpRight9,
  CurvedDownLeft9,
  CurvedDownRight9,
  CurvedLeftUp9,
  CurvedLeftDown9,
  CurvedRightUp9,
  CurvedRightDown9,
  CurvedUp9,
  CurvedDown9,
  CurvedLeft9,
  CurvedRight9,
  CurvedUpLeft10,
  CurvedUpRight10,
  CurvedDownLeft10,
  CurvedDownRight10,
  CurvedLeftUp10,
  CurvedLeftDown10,
  CurvedRightUp10,
  CurvedRightDown10,
  CurvedUp10,
  CurvedDown10,
  CurvedLeft10,
  CurvedRight10,
} from "lucide-react"

interface Product {
  id: string
  name: string
  sku: string
  description: string
  price: number
  cost: number
  category: string
  brand: string
  status: 'active' | 'inactive' | 'discontinued'
  stockQuantity: number
  lowStockThreshold: number
  image?: string
  createdAt: string
  updatedAt: string
}

interface ProductCatalogProps {
  onRefresh?: () => void
  onAddProduct?: () => void
}

export function ProductCatalog({ onRefresh, onAddProduct }: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const { toast } = useToast()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/v1/superadmin/products", {
        credentials: "include"
      })
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.products || [])
      } else {
        throw new Error(data.message || "Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Product]
    let bValue: any = b[sortBy as keyof Product]
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Inactive</Badge>
      case 'discontinued':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Discontinued</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertTriangle className="h-3 w-3 mr-1" />Out of Stock</Badge>
    } else if (quantity <= threshold) {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100"><AlertTriangle className="h-3 w-3 mr-1" />Low Stock</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />In Stock</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Product Catalog</h2>
          <p className="text-slate-600">Manage your product inventory and information</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchProducts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" onClick={onAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search products by name, SKU, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="sku">SKU</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="stockQuantity">Stock</SelectItem>
                  <SelectItem value="createdAt">Date Added</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products ({sortedProducts.length})</CardTitle>
              <CardDescription>Manage your product catalog</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <Package className="h-12 w-12 text-slate-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-slate-700">No products found</h3>
                          <p className="text-slate-500">Try adjusting your search or filters</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{product.name}</p>
                            <p className="text-sm text-slate-500">{product.brand}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded">{product.sku}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p className="font-medium">${product.price.toFixed(2)}</p>
                          <p className="text-sm text-slate-500">Cost: ${product.cost.toFixed(2)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p className="font-medium">{product.stockQuantity}</p>
                          {getStockStatus(product.stockQuantity, product.lowStockThreshold)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(product.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{products.length}</p>
                <p className="text-sm text-slate-600">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {products.filter(p => p.status === 'active').length}
                </p>
                <p className="text-sm text-slate-600">Active Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {products.filter(p => p.stockQuantity <= p.lowStockThreshold).length}
                </p>
                <p className="text-sm text-slate-600">Low Stock Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ${products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0).toLocaleString()}
                </p>
                <p className="text-sm text-slate-600">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
