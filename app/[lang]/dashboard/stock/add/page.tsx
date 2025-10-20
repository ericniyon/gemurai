"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImagePlus, Loader2, X } from "lucide-react"

const PRODUCT_CATEGORIES = [
  { id: "preventative", name: "Preventative Care" },
  { id: "water", name: "Water & Sanitation" },
  { id: "reproductive", name: "Reproductive Health" },
  { id: "diagnostic", name: "Diagnostic Tools" },
  { id: "first_aid", name: "First Aid" },
  { id: "hygiene", name: "Hygiene Products" },
  { id: "medical_devices", name: "Medical Devices" },
  { id: "nutrition", name: "Nutrition" },
  { id: "pharmaceuticals", name: "Pharmaceuticals" },
  { id: "other", name: "Other" }
]

const PRODUCT_CONDITIONS = [
  { id: "NEW", name: "New" },
  { id: "LIKE_NEW", name: "Like New" },
  { id: "GOOD", name: "Good" },
  { id: "FAIR", name: "Fair" },
  { id: "POOR", name: "Poor" },
  { id: "REFURBISHED", name: "Refurbished" }
]

export default function AddProductPage() {
  const params = useParams()
  const router = useRouter()
  const lang = (params?.lang as string) || "en"
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    description: "",
    price: "",
    businessPrice: "",
    commission: "0",
    category: "",
    subcategory: "",
    stock: "0",
    status: "active",
    isActive: true,

    // Product Details
    brandId: "",
    manufacturer: "",
    countryOfOrigin: "",
    condition: "NEW",
    model: "",
    sku: "",
    barcode: "",
    warrantyInfo: "",
    certifications: [] as string[],

    // Specifications
    specifications: [] as { name: string; value: string }[],

    // Variants
    hasVariants: false,
    variants: [] as {
      sku: string;
      color?: string;
      size?: string;
      model?: string;
      weight?: number;
      stock: number;
      price: number;
    }[],

    // Shipping & Handling
    minOrderQuantity: 1,
    maxOrderQuantity: null as number | null,
    shippingWeight: null as number | null,
    dimensions: {
      length: "",
      width: "",
      height: ""
    },
    isFragile: false,
    requiresSpecialHandling: false,

    // Media
    image: null as File | null,
    images: [] as File[],
    imageUrls: [] as string[],
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
      
      // Basic Information
      data.append("name", formData.name)
      data.append("description", formData.description)
      data.append("price", formData.price.toString())
      data.append("businessPrice", formData.businessPrice.toString())
      data.append("commission", formData.commission.toString())
      data.append("category", formData.category)
      data.append("subcategory", formData.subcategory)
      data.append("stock", formData.stock.toString())
      data.append("status", formData.status)
      data.append("isActive", formData.isActive.toString())
      
      // Product Details
      if (formData.brandId) data.append("brandId", formData.brandId)
      if (formData.manufacturer) data.append("manufacturer", formData.manufacturer)
      if (formData.countryOfOrigin) data.append("countryOfOrigin", formData.countryOfOrigin)
      data.append("condition", formData.condition)
      if (formData.model) data.append("model", formData.model)
      if (formData.sku) data.append("sku", formData.sku)
      if (formData.barcode) data.append("barcode", formData.barcode)
      if (formData.warrantyInfo) data.append("warrantyInfo", formData.warrantyInfo)
      if (formData.certifications.length > 0) {
        data.append("certifications", JSON.stringify(formData.certifications))
      }

      // Specifications
      if (formData.specifications.length > 0) {
        data.append("specifications", JSON.stringify(formData.specifications))
      }

      // Variants
      if (formData.hasVariants && formData.variants.length > 0) {
        data.append("variants", JSON.stringify(formData.variants))
      }

      // Shipping & Handling
      if (formData.minOrderQuantity !== 1) {
        data.append("minOrderQuantity", formData.minOrderQuantity.toString())
      }
      if (formData.maxOrderQuantity !== null) {
        data.append("maxOrderQuantity", formData.maxOrderQuantity.toString())
      }
      if (formData.shippingWeight !== null) {
        data.append("shippingWeight", formData.shippingWeight.toString())
      }
      if (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) {
        data.append("dimensions", JSON.stringify(formData.dimensions))
      }
      data.append("isFragile", formData.isFragile.toString())
      data.append("requiresSpecialHandling", formData.requiresSpecialHandling.toString())

      // Media
      if (formData.image instanceof File) {
        data.append("image", formData.image)
      }
      formData.images.forEach((image) => {
        if (image instanceof File) {
          data.append("images", image)
        }
      })

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

      // Redirect to product list
      router.push(`/${lang}/dashboard/stock/list`)
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isMainImage: boolean = false) => {
    const files = e.target.files
    if (!files) return

    if (isMainImage) {
      setFormData({ ...formData, image: files[0] })
    } else {
      setFormData({ ...formData, images: [...formData.images, ...Array.from(files)] })
    }
  }

  const removeImage = (index: number, isMainImage: boolean = false) => {
    if (isMainImage) {
      setFormData({ ...formData, image: null })
    } else {
      const newImages = [...formData.images]
      newImages.splice(index, 1)
      setFormData({ ...formData, images: newImages })
    }
  }

  const addSpecification = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { name: "", value: "" }]
    })
  }

  const removeSpecification = (index: number) => {
    const newSpecs = [...formData.specifications]
    newSpecs.splice(index, 1)
    setFormData({ ...formData, specifications: newSpecs })
  }

  const updateSpecification = (index: number, field: "name" | "value", value: string) => {
    const newSpecs = [...formData.specifications]
    newSpecs[index][field] = value
    setFormData({ ...formData, specifications: newSpecs })
  }

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, {
        sku: "",
        color: "",
        size: "",
        model: "",
        weight: 0,
        stock: 0,
        price: 0
      }]
    })
  }

  const removeVariant = (index: number) => {
    const newVariants = [...formData.variants]
    newVariants.splice(index, 1)
    setFormData({ ...formData, variants: newVariants })
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...formData.variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setFormData({ ...formData, variants: newVariants })
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <Card className="border-0 shadow-md bg-white rounded-xl">
        <CardHeader className="border-b bg-gray-50/50 rounded-t-xl">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-gray-800">Add New Product</CardTitle>
            <CardDescription className="text-gray-600">Create a new product with detailed information</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5 gap-2 bg-gray-100/80 p-1 rounded-xl">
                {["basic", "details", "variants", "shipping", "media"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium capitalize data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all"
                  >
                    {tab.replace(/_/g, ' ')}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic" className="mt-6">
                <div className="bg-white rounded-lg">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="col-span-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Product Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter product name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="mt-1.5"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Enter product description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="mt-1.5 resize-none"
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
                        placeholder="Enter price"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessPrice" className="text-sm font-medium text-gray-700">
                        Business Price
                      </Label>
                      <Input
                        id="businessPrice"
                        type="number"
                        step="0.01"
                        placeholder="Enter business price (optional)"
                        value={formData.businessPrice}
                        onChange={(e) => setFormData({ ...formData, businessPrice: e.target.value })}
                        className="mt-1.5"
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
                        placeholder="Enter commission"
                        value={formData.commission}
                        onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CATEGORIES.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subcategory" className="text-sm font-medium text-gray-700">
                        Subcategory
                      </Label>
                      <Input
                        id="subcategory"
                        placeholder="Enter subcategory"
                        value={formData.subcategory}
                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="stock" className="text-sm font-medium text-gray-700">
                        Initial Stock
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="Enter stock quantity"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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
                  </div>
                </div>
              </TabsContent>

              {/* Product Details */}
              <TabsContent value="details" className="mt-6">
                <div className="bg-white rounded-lg">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="manufacturer" className="text-sm font-medium text-gray-700">
                        Manufacturer
                      </Label>
                      <Input
                        id="manufacturer"
                        placeholder="Enter manufacturer"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="countryOfOrigin" className="text-sm font-medium text-gray-700">
                        Country of Origin
                      </Label>
                      <Input
                        id="countryOfOrigin"
                        placeholder="Enter country of origin"
                        value={formData.countryOfOrigin}
                        onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="condition" className="text-sm font-medium text-gray-700">
                        Condition
                      </Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) => setFormData({ ...formData, condition: value })}
                        className="mt-1.5"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CONDITIONS.map((condition) => (
                            <SelectItem key={condition.id} value={condition.id}>
                              {condition.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="model" className="text-sm font-medium text-gray-700">
                        Model Number
                      </Label>
                      <Input
                        id="model"
                        placeholder="Enter model number"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sku" className="text-sm font-medium text-gray-700">
                        SKU
                      </Label>
                      <Input
                        id="sku"
                        placeholder="Enter SKU"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="barcode" className="text-sm font-medium text-gray-700">
                        Barcode
                      </Label>
                      <Input
                        id="barcode"
                        placeholder="Enter barcode"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="warrantyInfo" className="text-sm font-medium text-gray-700">
                        Warranty Information
                      </Label>
                      <Textarea
                        id="warrantyInfo"
                        placeholder="Enter warranty information"
                        value={formData.warrantyInfo}
                        onChange={(e) => setFormData({ ...formData, warrantyInfo: e.target.value })}
                        className="mt-1.5 resize-none"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-gray-700">Specifications</Label>
                      <div className="space-y-4">
                        {formData.specifications.map((spec, index) => (
                          <div key={index} className="flex gap-4">
                            <Input
                              placeholder="Specification name"
                              value={spec.name}
                              onChange={(e) => updateSpecification(index, "name", e.target.value)}
                              className="mt-1.5"
                            />
                            <Input
                              placeholder="Specification value"
                              value={spec.value}
                              onChange={(e) => updateSpecification(index, "value", e.target.value)}
                              className="mt-1.5"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removeSpecification(index)}
                              className="mt-1.5"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addSpecification}
                          className="w-full mt-4"
                        >
                          Add Specification
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Variants */}
              <TabsContent value="variants" className="mt-6">
                <div className="bg-white rounded-lg">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Switch
                        id="hasVariants"
                        checked={formData.hasVariants}
                        onCheckedChange={(checked) => setFormData({ ...formData, hasVariants: checked })}
                      />
                      <Label htmlFor="hasVariants" className="text-sm font-medium text-gray-700">
                        This product has multiple variants
                      </Label>
                    </div>

                    {formData.hasVariants && (
                      <div className="space-y-4">
                        {formData.variants.map((variant, index) => (
                          <div key={index} className="grid gap-4 md:grid-cols-4 border border-gray-200 p-4 rounded-lg bg-gray-50/50">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">SKU</Label>
                              <Input
                                value={variant.sku}
                                onChange={(e) => updateVariant(index, "sku", e.target.value)}
                                placeholder="Variant SKU"
                                className="mt-1.5"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Color</Label>
                              <Input
                                value={variant.color}
                                onChange={(e) => updateVariant(index, "color", e.target.value)}
                                placeholder="Color"
                                className="mt-1.5"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Size</Label>
                              <Input
                                value={variant.size}
                                onChange={(e) => updateVariant(index, "size", e.target.value)}
                                placeholder="Size"
                                className="mt-1.5"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Price</Label>
                              <Input
                                type="number"
                                value={variant.price}
                                onChange={(e) => updateVariant(index, "price", parseFloat(e.target.value))}
                                placeholder="Price"
                                className="mt-1.5"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Stock</Label>
                              <Input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value))}
                                placeholder="Stock"
                                className="mt-1.5"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => removeVariant(index)}
                                className="mt-1.5"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addVariant}
                          className="w-full mt-4"
                        >
                          Add Variant
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Shipping & Handling */}
              <TabsContent value="shipping" className="mt-6">
                <div className="bg-white rounded-lg">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="minOrderQuantity" className="text-sm font-medium text-gray-700">
                        Minimum Order Quantity
                      </Label>
                      <Input
                        id="minOrderQuantity"
                        type="number"
                        value={formData.minOrderQuantity}
                        onChange={(e) => setFormData({ ...formData, minOrderQuantity: parseInt(e.target.value) })}
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
                        value={formData.shippingWeight || ""}
                        onChange={(e) => setFormData({ ...formData, shippingWeight: e.target.value ? parseFloat(e.target.value) : null })}
                        className="mt-1.5"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="length" className="text-sm font-medium text-gray-700">
                          Length (cm)
                        </Label>
                        <Input
                          id="length"
                          type="number"
                          step="0.1"
                          value={formData.dimensions.length}
                          onChange={(e) => setFormData({
                            ...formData,
                            dimensions: { ...formData.dimensions, length: e.target.value }
                          })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="width" className="text-sm font-medium text-gray-700">
                          Width (cm)
                        </Label>
                        <Input
                          id="width"
                          type="number"
                          step="0.1"
                          value={formData.dimensions.width}
                          onChange={(e) => setFormData({
                            ...formData,
                            dimensions: { ...formData.dimensions, width: e.target.value }
                          })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height" className="text-sm font-medium text-gray-700">
                          Height (cm)
                        </Label>
                        <Input
                          id="height"
                          type="number"
                          step="0.1"
                          value={formData.dimensions.height}
                          onChange={(e) => setFormData({
                            ...formData,
                            dimensions: { ...formData.dimensions, height: e.target.value }
                          })}
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isFragile"
                        checked={formData.isFragile}
                        onCheckedChange={(checked) => setFormData({ ...formData, isFragile: checked })}
                      />
                      <Label htmlFor="isFragile" className="text-sm font-medium text-gray-700">
                        This product is fragile
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requiresSpecialHandling"
                        checked={formData.requiresSpecialHandling}
                        onCheckedChange={(checked) => setFormData({ ...formData, requiresSpecialHandling: checked })}
                      />
                      <Label htmlFor="requiresSpecialHandling" className="text-sm font-medium text-gray-700">
                        Requires special handling
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Media */}
              <TabsContent value="media" className="mt-6">
                <div className="bg-white rounded-lg">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Main Product Image</Label>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                          {formData.image ? (
                            <>
                              <img
                                src={URL.createObjectURL(formData.image)}
                                alt="Product"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(0, true)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                              <ImagePlus className="h-8 w-8 text-gray-400" />
                              <span className="mt-2 text-xs text-gray-500">Upload Image</span>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, true)}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Additional Images</Label>
                      <div className="mt-2 grid grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <label className="flex flex-col items-center justify-center w-32 h-32 cursor-pointer border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <ImagePlus className="h-8 w-8 text-gray-400" />
                          <span className="mt-2 text-xs text-gray-500">Add Images</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-white min-w-[120px] shadow-sm hover:bg-primary/90 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}