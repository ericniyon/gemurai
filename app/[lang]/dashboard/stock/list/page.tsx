"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { useToast } from "@/hooks/use-toast"
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash, 
  Eye, 
  Download,
  Plus,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

type Product = {
  id: string
  name: string
  price: number
  category: string
  stock: number
  status: string
  image: string
  description?: string
  subcategory?: string
  manufacturer?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductListPage() {
  const params = useParams()
  const router = useRouter()
  const lang = (params?.lang as string) || "en"
  const { toast } = useToast()
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("Gemurai_token")
        if (!token) {
          throw new Error("No auth token found")
        }

        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "8",
          search: searchQuery
        })

        const response = await fetch(`/api/products?${queryParams}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const data = await response.json()
        setProducts(data.products)
        setTotalPages(data.pagination.pages)
        setTotalProducts(data.pagination.total)
      } catch (error) {
        console.error("Failed to load products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [currentPage, searchQuery, toast])

  const handleDelete = async (productId: string) => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        throw new Error("No auth token found")
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })

      // Refresh the product list
      router.refresh()
    } catch (error) {
      console.error("Failed to delete product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
    }
    if (stock <= 10) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">In Stock</Badge>
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product List</CardTitle>
            <CardDescription>
              {totalProducts} products in total
            </CardDescription>
          </div>
          <Link href={`/${lang}/dashboard/stock/add`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Products Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || "/placeholder.jpg"}
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.subcategory && (
                            <div className="text-sm text-muted-foreground">{product.subcategory}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{getStatusBadge(product.status, product.stock)}</TableCell>
                    <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/${lang}/dashboard/stock/${product.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/${lang}/dashboard/stock/${product.id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 