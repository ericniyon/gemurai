"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Plus, Loader2, ImagePlus } from "lucide-react"
import Link from "next/link"
import { ClientOnly } from "@/components/client-only"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductVariant {
  sku: string
  color?: string
  size?: string
  model?: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  stock: number
  price: number
  isDefault: boolean
}

interface ProductSpecification {
  name: string
  value: string
}

function AddProductContent() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  const [formData, setFormData] = useState({
    // Required fields
    name: "",
    price: "",
    commission: "0",
    category: "",
    stock: "0",
    status: "active",
    isActive: true,

    // Optional fields
    description: "",
    subcategory: "",
    image: null as File | null,
    images: [] as File[],
    brandId: "",
    manufacturer: "",
    countryOfOrigin: "",
    warrantyInfo: "",
    minOrderQuantity: 1,
    maxOrderQuantity: null as number | null,
    shippingWeight: null as number | null,
    isFragile: false,
    requiresSpecialHandling: false,
    certifications: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.category) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields: name, price, and category",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Create FormData object
      const data = new FormData()
      
      // Required fields
      data.append("name", formData.name)
      data.append("price", formData.price.toString())
      data.append("commission", formData.commission.toString())
      data.append("category", formData.category)
      data.append("stock", formData.stock.toString())
      data.append("status", formData.status)
      data.append("isActive", formData.isActive.toString())
      
      // Optional fields
      if (formData.description) data.append("description", formData.description)
      if (formData.subcategory) data.append("subcategory", formData.subcategory)
      if (formData.image instanceof File) data.append("image", formData.image)
      formData.images.forEach((image) => {
        if (image instanceof File) {
          data.append("images", image)
        }
      })
      if (formData.brandId) data.append("brandId", formData.brandId)
      if (formData.manufacturer) data.append("manufacturer", formData.manufacturer)
      if (formData.countryOfOrigin) data.append("countryOfOrigin", formData.countryOfOrigin)
      if (formData.warrantyInfo) data.append("warrantyInfo", formData.warrantyInfo)
      if (formData.minOrderQuantity !== 1) data.append("minOrderQuantity", formData.minOrderQuantity.toString())
      if (formData.maxOrderQuantity !== null) data.append("maxOrderQuantity", formData.maxOrderQuantity.toString())
      if (formData.shippingWeight !== null) data.append("shippingWeight", formData.shippingWeight.toString())
      if (formData.isFragile) data.append("isFragile", formData.isFragile.toString())
      if (formData.requiresSpecialHandling) data.append("requiresSpecialHandling", formData.requiresSpecialHandling.toString())
      if (formData.certifications.length > 0) data.append("certifications", JSON.stringify(formData.certifications))

      // Submit the form
      const response = await fetch("/api/products", {
        method: "POST",
        body: data,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create product")
      }

      toast({
        title: "Success",
        description: "Product created successfully",
      })

      // Redirect to products page
      router.push(`/${lang}/dashboard/marketplace`)
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || user.role !== "EMPLOYER") {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link 
                href={`/${lang}/dashboard/marketplace`}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Marketplace
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">Create a new product listing in the marketplace</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const tabs = ["basic", "details", "shipping", "media"]
                  const currentIndex = tabs.indexOf(activeTab)
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1])
                  }
                }}
                className="border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                Next Step
              </Button>
              <Button
                type="submit"
                form="product-form"
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Save Product
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form id="product-form" onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-gray-100/80 p-1 rounded-xl inline-flex space-x-2 mb-6">
              <TabsTrigger 
                value="basic" 
                className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                Basic Information
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="shipping" 
                className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                Shipping & Handling
              </TabsTrigger>
              <TabsTrigger 
                value="media" 
                className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                Media
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Required Fields */}
                <div className="col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="commission" className="text-sm font-medium text-gray-700">
                    Commission
                  </Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    value={formData.commission}
                    onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                    placeholder="0.00"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Enter category"
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subcategory" className="text-sm font-medium text-gray-700">
                    Subcategory
                  </Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="Enter subcategory"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="stock" className="text-sm font-medium text-gray-700">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description"
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="brandId" className="text-sm font-medium text-gray-700">
                    Brand
                  </Label>
                  <Input
                    id="brandId"
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    placeholder="Select brand"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="manufacturer" className="text-sm font-medium text-gray-700">
                    Manufacturer
                  </Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="Enter manufacturer"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="countryOfOrigin" className="text-sm font-medium text-gray-700">
                    Country of Origin
                  </Label>
                  <Input
                    id="countryOfOrigin"
                    value={formData.countryOfOrigin}
                    onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                    placeholder="Enter country of origin"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="warrantyInfo" className="text-sm font-medium text-gray-700">
                    Warranty Information
                  </Label>
                  <Input
                    id="warrantyInfo"
                    value={formData.warrantyInfo}
                    onChange={(e) => setFormData({ ...formData, warrantyInfo: e.target.value })}
                    placeholder="Enter warranty information"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="minOrderQuantity" className="text-sm font-medium text-gray-700">
                    Minimum Order Quantity
                  </Label>
                  <Input
                    id="minOrderQuantity"
                    type="number"
                    min="1"
                    value={formData.minOrderQuantity}
                    onChange={(e) => setFormData({ ...formData, minOrderQuantity: parseInt(e.target.value) || 1 })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="maxOrderQuantity" className="text-sm font-medium text-gray-700">
                    Maximum Order Quantity
                  </Label>
                  <Input
                    id="maxOrderQuantity"
                    type="number"
                    min="1"
                    value={formData.maxOrderQuantity || ""}
                    onChange={(e) => setFormData({ ...formData, maxOrderQuantity: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="shippingWeight" className="text-sm font-medium text-gray-700">
                    Shipping Weight (kg)
                  </Label>
                  <Input
                    id="shippingWeight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.shippingWeight || ""}
                    onChange={(e) => setFormData({ ...formData, shippingWeight: e.target.value ? parseFloat(e.target.value) : null })}
                    className="mt-1.5"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isFragile"
                      checked={formData.isFragile}
                      onCheckedChange={(checked) => setFormData({ ...formData, isFragile: checked })}
                    />
                    <Label htmlFor="isFragile">Fragile Item</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requiresSpecialHandling"
                      checked={formData.requiresSpecialHandling}
                      onCheckedChange={(checked) => setFormData({ ...formData, requiresSpecialHandling: checked })}
                    />
                    <Label htmlFor="requiresSpecialHandling">Requires Special Handling</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="mainImage" className="text-sm font-medium text-gray-700">
                    Main Product Image
                  </Label>
                  <Input
                    id="mainImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="additionalImages" className="text-sm font-medium text-gray-700">
                    Additional Images
                  </Label>
                  <Input
                    id="additionalImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setFormData({ ...formData, images: Array.from(e.target.files || []) })}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  )
}

export default function AddProductPage() {
  return (
    <ClientOnly>
      <AddProductContent />
    </ClientOnly>
  )
} 