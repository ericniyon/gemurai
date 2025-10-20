"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  Save,
  Loader2,
  Package
} from "lucide-react"

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

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const lang = params?.lang as string
  const productId = params?.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category: "",
    subcategory: "",
    stock: 0,
    manufacturer: "",
  })

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
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          subcategory: data.subcategory || "",
          stock: data.stock,
          manufacturer: data.manufacturer || "",
        })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        throw new Error("No auth token found")
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      toast({
        title: "Success",
        description: "Product updated successfully"
      })

      router.push(`/${lang}/dashboard/stock/${productId}`)
    } catch (error) {
      console.error("Failed to update product:", error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value
    }))
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
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push(`/${lang}/dashboard/stock/${productId}`)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>Edit Product</CardTitle>
                <CardDescription>Update product information</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (RWF)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button
            type="button"
            variant="outline"
            className="mr-2"
            onClick={() => router.push(`/${lang}/dashboard/stock/${productId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 