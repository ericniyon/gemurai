"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Package, 
  Save, 
  X, 
  Upload, 
  DollarSign, 
  Hash, 
  Tag, 
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"

interface AddProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface ProductFormData {
  name: string
  sku: string
  description: string
  category: string
  price: number
  cost: number
  unit: string
  minStock: number
  maxStock: number
  reorderPoint: number
  status: 'active' | 'inactive' | 'discontinued'
  tags: string[]
  imageUrl?: string
  weight?: number
  dimensions?: string
  supplier?: string
  barcode?: string
}

export function AddProductForm({ open, onOpenChange, onSuccess }: AddProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: 0,
    cost: 0,
    unit: 'pcs',
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    status: 'active',
    tags: [],
    imageUrl: '',
    weight: 0,
    dimensions: '',
    supplier: '',
    barcode: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<ProductFormData>>({})
  const [newTag, setNewTag] = useState('')

  const categories = [
    'Electronics',
    'Clothing',
    'Food & Beverages',
    'Health & Beauty',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Automotive',
    'Office Supplies',
    'Other'
  ]

  const units = [
    'pcs', 'kg', 'g', 'lb', 'oz', 'l', 'ml', 'gal', 'box', 'pack', 'set', 'pair'
  ]

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }
    
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required'
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    
    if (formData.cost < 0) {
      newErrors.cost = 'Cost cannot be negative'
    }
    
    if (formData.minStock < 0) {
      newErrors.minStock = 'Minimum stock cannot be negative'
    }
    
    if (formData.maxStock < formData.minStock) {
      newErrors.maxStock = 'Maximum stock must be greater than minimum stock'
    }
    
    if (formData.reorderPoint < 0) {
      newErrors.reorderPoint = 'Reorder point cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting")
      return
    }

    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success("Product added successfully!")
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        name: '',
        sku: '',
        description: '',
        category: '',
        price: 0,
        cost: 0,
        unit: 'pcs',
        minStock: 0,
        maxStock: 0,
        reorderPoint: 0,
        status: 'active',
        tags: [],
        imageUrl: '',
        weight: 0,
        dimensions: '',
        supplier: '',
        barcode: ''
      })
      setErrors({})
      
    } catch (error) {
      toast.error("Failed to add product. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const generateSKU = () => {
    const categoryPrefix = formData.category.substring(0, 3).toUpperCase()
    const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    setFormData(prev => ({
      ...prev,
      sku: `${categoryPrefix}-${randomNumber}`
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add New Product
          </DialogTitle>
          <DialogDescription>
            Create a new product in your inventory. Fill in all required fields to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Essential product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Enter SKU"
                      className={errors.sku ? 'border-red-500' : ''}
                    />
                    <Button type="button" variant="outline" onClick={generateSKU}>
                      <Hash className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.sku && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.sku}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'discontinued') => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
              <CardDescription>Set pricing and stock management parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.price}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className={`pl-10 ${errors.cost ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.cost && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.cost}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minStock">Minimum Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className={errors.minStock ? 'border-red-500' : ''}
                  />
                  {errors.minStock && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.minStock}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStock">Maximum Stock</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    value={formData.maxStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxStock: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className={errors.maxStock ? 'border-red-500' : ''}
                  />
                  {errors.maxStock && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.maxStock}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData(prev => ({ ...prev, reorderPoint: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className={errors.reorderPoint ? 'border-red-500' : ''}
                  />
                  {errors.reorderPoint && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.reorderPoint}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
              <CardDescription>Optional product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                    placeholder="Enter barcode"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                    placeholder="L x W x H"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Product...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Product
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
