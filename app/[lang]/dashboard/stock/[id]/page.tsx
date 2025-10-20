"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  Edit,
  Trash,
  Loader2,
  Package
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  subcategory?: string
  stock: number
  status: string
  image: string
  manufacturer?: string
  createdAt: string
  updatedAt: string
}

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const lang = params?.lang as string
  const productId = params?.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("Gemurai_token")
        if (!token) {
          throw new Error("No auth token found")
        }

        const response = await fetch(`/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Product not found")
          }
          throw new Error("Failed to fetch product")
        }

        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error("Failed to load product:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load product",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [productId, toast])

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
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
        description: "Product deleted successfully"
      })

      router.push(`/${lang}/dashboard/stock/list`)
    } catch (error) {
      console.error("Failed to delete product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (stock: number) => {
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

  if (!product) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push(`/${lang}/dashboard/stock/list`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push(`/${lang}/dashboard/stock/list`)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>Product Details</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/${lang}/dashboard/stock/${productId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this product? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square rounded-lg object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Price</div>
                  <div className="font-semibold">{formatCurrency(product.price)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Stock</div>
                  <div className="font-semibold flex items-center gap-2">
                    {product.stock}
                    {getStatusBadge(product.stock)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="font-semibold">{product.category}</div>
                </div>
                {product.subcategory && (
                  <div>
                    <div className="text-sm text-muted-foreground">Subcategory</div>
                    <div className="font-semibold">{product.subcategory}</div>
                  </div>
                )}
                {product.manufacturer && (
                  <div>
                    <div className="text-sm text-muted-foreground">Manufacturer</div>
                    <div className="font-semibold">{product.manufacturer}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground">Created At</div>
                  <div className="font-semibold">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                  <div className="font-semibold">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}