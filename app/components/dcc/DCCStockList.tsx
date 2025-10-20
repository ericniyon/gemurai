"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, AlertCircle, Loader2, ArrowUpDown, User, DollarSign } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  category: string
  subcategory?: string
  seller: {
    id: string
    name: string
    email: string
  }
}

interface DCCStock {
  id: string
  productId: string
  quantity: number
  product: Product
}

export function DCCStockList() {
  const { toast } = useToast()
  const [dccStock, setDCCStock] = useState<DCCStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<string>("product.name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const fetchDCCStock = async () => {
    try {
      setIsLoading(true)
      setError(null) // Reset error state
      
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

      const response = await fetch("/api/dcc/stock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch DCC stock")
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch DCC stock")
      }

      setDCCStock(data.dccStock)
      setError(null)
    } catch (error) {
      console.error("Error fetching DCC stock:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch DCC stock")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch DCC stock",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDCCStock()
  }, [])

  const handleSort = (key: typeof sortField) => {
    setSortField(key)
    setSortDirection(current => current === "asc" ? "desc" : "asc")
  }

  const sortedStock = [...dccStock].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1
    
    if (sortField === "product.name") {
      return a.product.name.localeCompare(b.product.name) * direction
    }
    
    if (sortField === "product.price") {
      return (a.product.price - b.product.price) * direction
    }

    if (sortField === "product.category") {
      return a.product.category.localeCompare(b.product.category) * direction
    }
    
    if (sortField === "quantity") {
      return (a.quantity - b.quantity) * direction
    }
    
    return 0
  })

  const filteredStock = sortedStock.filter(stock => {
    const searchLower = searchQuery.toLowerCase()
    const matchesProduct = stock.product.name.toLowerCase().includes(searchLower)
    const matchesCategory = stock.product.category.toLowerCase().includes(searchLower)
    const matchesSeller = stock.product.seller.name.toLowerCase().includes(searchLower)
    return matchesProduct || matchesCategory || matchesSeller
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted/20 animate-pulse rounded-md w-[240px]" />
        <div className="rounded-md border">
          <div className="h-12 border-b bg-muted/10 animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b bg-muted/5 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-3" />
          <p className="text-destructive font-medium">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (dccStock.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 flex flex-col items-center text-center">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Stock Available</h3>
          <p className="text-muted-foreground max-w-sm">
            You don't have any stock yet. Stock will be added here when your orders are approved.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search stock..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-[300px]"
        />
        <p className="text-sm text-muted-foreground">
          {filteredStock.length} items found
        </p>
      </div>
      
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <Button 
                  variant="ghost" 
                  className="hover:bg-transparent px-0 font-medium"
                  onClick={() => handleSort("product.name")}
                >
                  Product
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="hover:bg-transparent px-0 font-medium"
                  onClick={() => handleSort("product.category")}
                >
                  Category
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="hover:bg-transparent px-0 font-medium"
                  onClick={() => handleSort("quantity")}
                >
                  Quantity
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="hover:bg-transparent px-0 font-medium"
                  onClick={() => handleSort("product.price")}
                >
                  Unit Price
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Supplier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStock.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    {stock.product.name}
                  </div>
                  {stock.product.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {stock.product.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {stock.product.category}
                  </Badge>
                  {stock.product.subcategory && (
                    <Badge variant="outline" className="ml-2">
                      {stock.product.subcategory}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{stock.quantity.toLocaleString()} units</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("rw-RW", {
                    style: "currency",
                    currency: "RWF"
                  }).format(stock.product.price)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {new Intl.NumberFormat("rw-RW", {
                      style: "currency",
                      currency: "RWF"
                    }).format(stock.product.price * stock.quantity)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{stock.product.seller.name}</p>
                      <p className="text-sm text-muted-foreground">{stock.product.seller.email}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 