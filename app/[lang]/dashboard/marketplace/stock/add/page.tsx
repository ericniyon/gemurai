"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Package, Plus, Loader2, Upload } from "lucide-react"
import Link from "next/link"
import { ClientOnly } from "@/components/client-only"

interface ProductFormData {
  name: string
  description: string
  category: string
  price: number
  stock: number
  minOrderQuantity: number
  image: File | null
}

const categories = [
  "Electronics",
  "Clothing",
  "Food & Beverages",
  "Health & Beauty",
  "Home & Garden",
  "Sports & Outdoors",
  "Books & Media",
  "Automotive",
  "Toys & Games",
  "Office Supplies"
]

function AddStockContent() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    price: 0,
    stock: 0,
    minOrderQuantity: 1,
    image: null
  })

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        })
        return
      }
      
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        })
        return
      }
      
      handleInputChange("image", file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be greater than 0",
        variant: "destructive"
      })
      return
    }

    if (formData.stock < 0) {
      toast({
        title: "Validation Error",
        description: "Stock cannot be negative",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append("name", formData.name)
      submitData.append("description", formData.description)
      submitData.append("category", formData.category)
      submitData.append("price", formData.price.toString())
      submitData.append("stock", formData.stock.toString())
      submitData.append("minOrderQuantity", formData.minOrderQuantity.toString())
      submitData.append("status", "active")
      submitData.append("isActive", "true")
      
      if (formData.image) {
        submitData.append("image", formData.image)
      }

      const response = await fetch("/api/products", {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create product")
      }

      toast({
        title: "Success",
        description: "Product added successfully",
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        price: 0,
        stock: 0,
        minOrderQuantity: 1,
        image: null
      })

      // Optional: redirect to stock list
      router.push(`/${lang}/dashboard/marketplace/stock/list`)
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
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
    <div className="container py-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/${lang}/dashboard/marketplace/stock`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stock
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
          <p className="text-sm text-gray-600 mt-1">Add a new product to your inventory</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Information
          </CardTitle>
          <CardDescription>
            Fill in the details below to add a new product to your stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (RWF) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrderQuantity">Min Order Quantity</Label>
                <Input
                  id="minOrderQuantity"
                  type="number"
                  value={formData.minOrderQuantity}
                  onChange={(e) => handleInputChange("minOrderQuantity", Number(e.target.value))}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('image')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              {formData.image && (
                <p className="text-sm text-green-600">Selected: {formData.image.name}</p>
              )}
              <p className="text-xs text-gray-500">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Link href={`/${lang}/dashboard/marketplace/stock`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AddStockPage() {
  return (
    <ClientOnly>
      <AddStockContent />
    </ClientOnly>
  )
} 