"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Package, AlertCircle, TrendingDown, TrendingUp, DollarSign, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
}

interface StockAnalytics {
  totalProducts: number
  lowStockItems: Product[]
  outOfStockItems: Product[]
  totalStockValue: number
  mostOrderedProducts: {
    product: Product
    orderCount: number
  }[]
  stockTrends: {
    category: string
    trend: 'up' | 'down'
    percentage: number
  }[]
}

export function StockAnalytics() {
  const [analytics, setAnalytics] = useState<StockAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get token from multiple sources
      let token = localStorage.getItem("Gemurai_token")
      if (!token) {
        const cookies = document.cookie.split(';')
        const authTokenCookie = cookies.find(c => c.trim().startsWith('Gemurai_token='))
        if (authTokenCookie) {
          token = authTokenCookie.split('=')[1].trim()
        }
      }

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("/api/stock/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch stock analytics")
      }

      const data = await response.json()
      if (data.success) {
        setAnalytics(data.analytics)
      } else {
        throw new Error(data.error || "Failed to fetch analytics")
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch analytics")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Loading stock analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Products Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products in inventory
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Items Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Products needing restock
            </p>
          </CardContent>
        </Card>

        {/* Out of Stock Items Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Products with zero stock
            </p>
          </CardContent>
        </Card>

        {/* Total Stock Value Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("rw-RW", {
                style: "currency",
                currency: "RWF"
              }).format(analytics.totalStockValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Most Ordered Products */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Most Ordered Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.mostOrderedProducts.map(({ product, orderCount }) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {product.stock} • {product.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{orderCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Trends */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Stock Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.stockTrends.map((trend) => (
                <div key={trend.category} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{trend.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {trend.trend === 'up' ? 'Increasing' : 'Decreasing'} trend
                    </p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1",
                    trend.trend === 'up' ? "text-green-500" : "text-red-500"
                  )}>
                    {trend.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {trend.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 