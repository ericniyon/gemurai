"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  Search,
  Eye
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface DCCSalesData {
  sales: Array<{
  id: string
    dccId: string
    productId: string
  quantity: number
  salePrice: number
  totalRevenue: number
  profit: number
    totalCommission: number
    customerName?: string
    customerPhone?: string
    notes?: string
  saleDate: string
    product: {
      id: string
      name: string
      price: number
      commission: number
    }
    dcc: {
      id: string
      name: string
      email: string
      phone?: string
    }
    pricing: {
      salesPrice: number
      purchasePrice: number
      commission: number
    }
  }>
  summary: {
    totalSales: number
    totalRevenue: number
    totalCommission: number
    averageSalePrice: number
    uniqueDCCs: number
    uniqueProducts: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    dccs: Array<{
      id: string
      name: string
      email: string
    }>
    products: Array<{
      id: string
      name: string
      price: number
    }>
  }
}

export default function DCCSalesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DCCSalesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    startDate: '',
    endDate: '',
    productId: 'all',
    dccId: 'all'
  })

  // Check if user has EMPLOYER or DCC role
  useEffect(() => {
    if (user && !["EMPLOYER", "DCC"].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only EMPLOYER and DCC users can access DCC sales data.",
        variant: "destructive"
      })
      router.push("/en/dashboard")
    }
  }, [user, router])

  const fetchDCCSales = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') queryParams.append(key, value.toString())
      })

      // Use different API endpoint based on user role
      const apiEndpoint = user?.role === "DCC" 
        ? `/api/v1/dcc/sales?${queryParams}`
        : `/api/v1/employer/dcc-sales?${queryParams}`
      
      const response = await fetch(apiEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.message || "Failed to fetch DCC sales")
      }
    } catch (error) {
      console.error("Error fetching DCC sales:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch DCC sales",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === "EMPLOYER" || user?.role === "DCC") {
      fetchDCCSales()
    }
  }, [user, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!["EMPLOYER", "DCC"].includes(user?.role || "")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            <CardDescription className="text-center">
              Only EMPLOYER and DCC users can access DCC sales data.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading DCC sales data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
            <CardDescription className="text-center">
              Failed to load DCC sales data.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.role === "DCC" ? "My Sales" : "DCC Sales Management"}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "DCC" 
              ? "Track and analyze your sales performance" 
              : "Monitor and analyze sales performance across all DCCs"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.uniqueDCCs} DCCs, {data.summary.uniqueProducts} products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Average: {formatCurrency(data.summary.averageSalePrice)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalCommission)}</div>
            <p className="text-xs text-muted-foreground">
              DCC earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active DCCs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.uniqueDCCs}</div>
            <p className="text-xs text-muted-foreground">
              With sales activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
              <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
              </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${user?.role === "EMPLOYER" ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
            {/* Only show DCC filter for EMPLOYER users */}
            {user?.role === "EMPLOYER" && (
              <div className="space-y-2">
                <Label htmlFor="dcc">DCC</Label>
                <Select value={filters.dccId} onValueChange={(value) => handleFilterChange('dccId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All DCCs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All DCCs</SelectItem>
                    {data.filters?.dccs?.map((dcc) => (
                      <SelectItem key={dcc.id} value={dcc.id}>
                        {dcc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select value={filters.productId} onValueChange={(value) => handleFilterChange('productId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {data.filters?.products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>
            Showing {data.sales.length} of {data.pagination.total} sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>DCC</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {formatDate(sale.saleDate)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sale.dcc.name}</div>
                        <div className="text-sm text-muted-foreground">{sale.dcc.email}</div>
            </div>
                    </TableCell>
                    <TableCell>
                    <div>
                        <div className="font-medium">{sale.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(sale.pricing.salesPrice)} each
                    </div>
                  </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sale.quantity}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(sale.salePrice)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(sale.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(sale.totalCommission)}
                    </TableCell>
                    <TableCell>
                      {sale.customerName ? (
                        <div>
                          <div className="font-medium">{sale.customerName}</div>
                          {sale.customerPhone && (
                            <div className="text-sm text-muted-foreground">{sale.customerPhone}</div>
                          )}
            </div>
          ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{" "}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{" "}
                {data.pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.pagination.page - 1)}
                  disabled={data.pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.pagination.page + 1)}
                  disabled={data.pagination.page >= data.pagination.pages}
                >
                  Next
              </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}