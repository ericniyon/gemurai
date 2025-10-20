"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Package, Plus, Minus, AlertCircle, Search, ShoppingBag, BarChart3 } from "lucide-react"
import Link from "next/link"
import { ClientOnly } from "@/app/components/client-only"
import { StockOrderDialog } from "@/app/components/stock-order/StockOrderDialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductImage } from "@/components/product-image"
import { formatDistanceToNow } from "date-fns"
import { DCCOnly } from "@/app/components/DCCOnly"
import { PermissionGuard } from "@/components/permission-guard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { StockOrderList } from "@/app/components/stock-order/StockOrderList"
import { StockAnalytics } from "@/app/components/stock-order/StockAnalytics"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { DCCStockList } from "@/app/components/dcc/DCCStockList"

interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
  stock: number
  image: string
  status: "active" | "inactive" | "out_of_stock"
  createdAt: string
  updatedAt: string
}

interface StockOrder {
  id: string
  product: {
    id: string
    name: string
    price: number
  }
  quantity: number
  status: string
  comment?: string
  createdAt: string
}

function StockManagementContent() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const { toast } = useToast()
  
  // Debug logging
  console.log("StockManagementContent - User:", user)
  console.log("StockManagementContent - isAuthenticated:", isAuthenticated)
  console.log("StockManagementContent - User role:", user?.role)
  const [searchQuery, setSearchQuery] = useState("")
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [stockOrders, setStockOrders] = useState<StockOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<"stock" | "orders">("stock")

  // Memoize filtered products for better performance
  const filteredProducts = useMemo(() => 
    products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [products, searchQuery]
  )

  // Memoize analytics data
  const analytics = useMemo(() => ({
    totalProducts: products.length,
    activeOrders: stockOrders.filter(order => order.status.toLowerCase() === "pending").length,
    lowStockItems: products.filter(p => p.stock < 5).length,
    totalOrders: stockOrders.length
  }), [products, stockOrders])

  useEffect(() => {
    if (!user || (user.role !== "EMPLOYER" && user.role !== "DCC")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive"
      })
      router.push(`/${lang}/dashboard`)
      return
    }

    // Fetch products
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("Gemurai_token")
        const response = await fetch("/api/products", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) throw new Error("Failed to fetch products")

        const data = await response.json()
        if (data.success) {
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [user, router, lang, toast])

  const updateStock = async (productId: string, change: number) => {
    setIsUpdating(productId)
    try {
      // Find the product
      const product = products.find(p => p.id === productId)
      if (!product) return

      // Don't allow negative stock
      if (product.stock + change < 0) {
        toast({
          title: "Error",
          description: "Stock cannot be negative",
          variant: "destructive",
        })
        return
      }

      // Update stock in API
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ change }),
      })

      if (!response.ok) {
        throw new Error("Failed to update stock")
      }

      // Update local state
      setProducts(products.map(p =>
        p.id === productId
          ? { ...p, stock: p.stock + change }
          : p
      ))

      toast({
        title: "Success",
        description: "Stock updated successfully",
      })
    } catch (error) {
      console.error("Error updating stock:", error)
      toast({
        title: "Error",
        description: "Failed to update stock. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const fetchStockOrders = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/stock-orders", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.")
        }
        throw new Error("Failed to fetch stock orders")
      }

      const data = await response.json()
      if (data.success) {
        setStockOrders(data.stockOrders || [])
      } else {
        throw new Error(data.error || "Failed to fetch stock orders")
      }
    } catch (error) {
      console.error("Error fetching stock orders:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load stock orders",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchStockOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user || (user.role !== "EMPLOYER" && user.role !== "DCC")) {
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
    <div className="container py-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Section - Lightweight and Clean */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {user.role === "DCC" ? "Stock Management" : "Stock Orders"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {user.role === "DCC" 
                ? "Manage inventory and track stock levels"
                : "Review stock orders from DCCs"}
            </p>
          </div>
          {(user?.role === "DCC" || user?.email === "dcc@djyh.rw") && (
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              size="sm"
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          )}
          {/* Debug info */}
          <div className="text-xs text-gray-500">
            User Role: {user?.role || 'undefined'}
            User Email: {user?.email || 'undefined'}
            {user?.role === "DCC" && " - DCC User Detected"}
          </div>
        </div>
      </div>

      {user.role === "DCC" ? (
        <>
          {/* Quick Stats - Lightweight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Products</p>
                    <p className="text-2xl font-semibold">{analytics.totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Orders</p>
                    <p className="text-2xl font-semibold">{analytics.activeOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Low Stock</p>
                    <p className="text-2xl font-semibold">{analytics.lowStockItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-semibold">{analytics.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Tabbed Interface for Better Organization */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant={activeTab === "stock" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("stock")}
                    className="gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Stock
                  </Button>
                  <Button
                    variant={activeTab === "orders" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("orders")}
                    className="gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Orders
                  </Button>
                </div>
                
                {activeTab === "stock" && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[200px] h-9"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : activeTab === "stock" ? (
                <DCCStockList />
              ) : (
                <StockOrderList />
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <StockOrderList isEmployer={true} />
          )}
        </div>
      )}

      {/* Stock Order Dialog */}
      <StockOrderDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          fetchStockOrders()
          toast({
            title: "Success",
            description: "Stock order created successfully",
          })
        }}
        product={selectedProduct}
      />
    </div>
  )
}

export default function StockOrdersPage() {
  return (
    <ClientOnly>
      <StockManagementContent />
    </ClientOnly>
  )
} 