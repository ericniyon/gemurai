"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AddProductPage() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
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
    } catch (error) {
      console.error("Failed to add product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
        <CardDescription>Create a new product with detailed information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="col-span-2">
                  <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="commission">Commission</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    placeholder="Enter commission"
                    value={formData.commission}
                    onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                  <Input
                    id="category"
                    placeholder="Enter category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    placeholder="Enter subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="Enter stock quantity"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Details */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="brandId">Brand</Label>
                  <Input
                    id="brandId"
                    placeholder="Select brand"
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    placeholder="Enter manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                  <Input
                    id="countryOfOrigin"
                    placeholder="Enter country of origin"
                    value={formData.countryOfOrigin}
                    onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="warrantyInfo">Warranty Information</Label>
                  <Input
                    id="warrantyInfo"
                    placeholder="Enter warranty information"
                    value={formData.warrantyInfo}
                    onChange={(e) => setFormData({ ...formData, warrantyInfo: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Shipping */}
            <TabsContent value="shipping" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="minOrderQuantity">Minimum Order Quantity</Label>
                  <Input
                    id="minOrderQuantity"
                    type="number"
                    min="1"
                    placeholder="Enter minimum quantity"
                    value={formData.minOrderQuantity}
                    onChange={(e) => setFormData({ ...formData, minOrderQuantity: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div>
                  <Label htmlFor="maxOrderQuantity">Maximum Order Quantity</Label>
                  <Input
                    id="maxOrderQuantity"
                    type="number"
                    min="1"
                    placeholder="Enter maximum quantity"
                    value={formData.maxOrderQuantity || ""}
                    onChange={(e) => setFormData({ ...formData, maxOrderQuantity: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>

                <div>
                  <Label htmlFor="shippingWeight">Shipping Weight (kg)</Label>
                  <Input
                    id="shippingWeight"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter shipping weight"
                    value={formData.shippingWeight || ""}
                    onChange={(e) => setFormData({ ...formData, shippingWeight: e.target.value ? parseFloat(e.target.value) : null })}
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

            {/* Media */}
            <TabsContent value="media" className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="mainImage">Main Product Image</Label>
                  <Input
                    id="mainImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  />
                </div>

                <div>
                  <Label htmlFor="additionalImages">Additional Images</Label>
                  <Input
                    id="additionalImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setFormData({ ...formData, images: Array.from(e.target.files || []) })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-white"
            >
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}