"use client"

import { useState, useEffect } from "react"
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
  ClipboardCheck, 
  Save, 
  X, 
  Package, 
  MapPin, 
  Hash, 
  Calculator,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown
} from "lucide-react"

interface AdjustmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface AdjustmentFormData {
  adjustmentType: 'increase' | 'decrease' | 'set'
  reference: string
  location: string
  reason: string
  notes: string
  items: Array<{
    productId: string
    productName: string
    sku: string
    currentStock: number
    adjustmentQuantity: number
    newStock: number
    unitCost?: number
  }>
  adjustmentDate: string
  approvedBy?: string
}

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  location: string
  unitCost: number
}

interface Location {
  id: string
  name: string
  type: 'warehouse' | 'store' | 'office' | 'other'
}

export function AdjustmentForm({ open, onOpenChange, onSuccess }: AdjustmentFormProps) {
  const [formData, setFormData] = useState<AdjustmentFormData>({
    adjustmentType: 'increase',
    reference: '',
    location: '',
    reason: '',
    notes: '',
    items: [],
    adjustmentDate: new Date().toISOString().slice(0, 16),
    approvedBy: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<AdjustmentFormData>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(1)

  const adjustmentTypes = [
    { value: 'increase', label: 'Increase', description: 'Add stock to inventory', icon: TrendingUp, color: 'text-green-600' },
    { value: 'decrease', label: 'Decrease', description: 'Remove stock from inventory', icon: TrendingDown, color: 'text-red-600' },
    { value: 'set', label: 'Set', description: 'Set exact stock quantity', icon: Calculator, color: 'text-blue-600' }
  ]

  // Mock data - replace with actual API calls
  useEffect(() => {
    setProducts([
      { id: '1', name: 'Laptop Dell XPS 13', sku: 'DEL-0001', currentStock: 25, location: 'Main Warehouse', unitCost: 1200 },
      { id: '2', name: 'Wireless Mouse', sku: 'MOU-0001', currentStock: 150, location: 'Main Warehouse', unitCost: 25 },
      { id: '3', name: 'USB-C Cable', sku: 'USB-0001', currentStock: 75, location: 'Main Warehouse', unitCost: 15 },
      { id: '4', name: 'Monitor 24"', sku: 'MON-0001', currentStock: 12, location: 'Main Warehouse', unitCost: 300 },
      { id: '5', name: 'Keyboard Mechanical', sku: 'KEY-0001', currentStock: 30, location: 'Main Warehouse', unitCost: 80 }
    ])

    setLocations([
      { id: '1', name: 'Main Warehouse', type: 'warehouse' },
      { id: '2', name: 'Store Front', type: 'store' },
      { id: '3', name: 'Office Storage', type: 'office' },
      { id: '4', name: 'Return Center', type: 'other' },
      { id: '5', name: 'Damaged Goods', type: 'other' }
    ])

    // Generate reference number
    const refNumber = `ADJ-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    setFormData(prev => ({ ...prev, reference: refNumber }))
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Partial<AdjustmentFormData> = {}
    
    if (!formData.adjustmentType) {
      newErrors.adjustmentType = 'Adjustment type is required'
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required'
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required'
    }
    
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required'
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
      
      toast.success("Inventory adjustment created successfully!")
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        adjustmentType: 'increase',
        reference: '',
        location: '',
        reason: '',
        notes: '',
        items: [],
        adjustmentDate: new Date().toISOString().slice(0, 16),
        approvedBy: ''
      })
      setErrors({})
      
    } catch (error) {
      toast.error("Failed to create adjustment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = () => {
    if (!selectedProduct || adjustmentQuantity <= 0) {
      toast.error("Please select a product and enter a valid quantity")
      return
    }

    const existingItem = formData.items.find(item => item.productId === selectedProduct.id)
    if (existingItem) {
      toast.error("This product is already in the adjustment list")
      return
    }

    let newStock: number
    switch (formData.adjustmentType) {
      case 'increase':
        newStock = selectedProduct.currentStock + adjustmentQuantity
        break
      case 'decrease':
        if (adjustmentQuantity > selectedProduct.currentStock) {
          toast.error("Cannot decrease more than current stock")
          return
        }
        newStock = selectedProduct.currentStock - adjustmentQuantity
        break
      case 'set':
        newStock = adjustmentQuantity
        break
      default:
        newStock = selectedProduct.currentStock
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        currentStock: selectedProduct.currentStock,
        adjustmentQuantity,
        newStock,
        unitCost: selectedProduct.unitCost
      }]
    }))

    setSelectedProduct(null)
    setAdjustmentQuantity(1)
    setSearchQuery('')
  }

  const removeItem = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId)
    }))
  }

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return
    
    const item = formData.items.find(item => item.productId === productId)
    if (!item) return

    let newStock: number
    switch (formData.adjustmentType) {
      case 'increase':
        newStock = item.currentStock + quantity
        break
      case 'decrease':
        if (quantity > item.currentStock) {
          toast.error("Cannot decrease more than current stock")
          return
        }
        newStock = item.currentStock - quantity
        break
      case 'set':
        newStock = quantity
        break
      default:
        newStock = item.currentStock
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.productId === productId ? { ...item, adjustmentQuantity: quantity, newStock } : item
      )
    }))
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalAdjustmentValue = formData.items.reduce((sum, item) => {
    const valueChange = Math.abs(item.newStock - item.currentStock) * (item.unitCost || 0)
    return sum + valueChange
  }, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Create Inventory Adjustment
          </DialogTitle>
          <DialogDescription>
            Adjust inventory levels to correct discrepancies or update stock counts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Adjustment Details */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Adjustment Details</CardTitle>
              <CardDescription>Basic information about the inventory adjustment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adjustmentType">Adjustment Type *</Label>
                  <Select value={formData.adjustmentType} onValueChange={(value: 'increase' | 'decrease' | 'set') => setFormData(prev => ({ ...prev, adjustmentType: value }))}>
                    <SelectTrigger className={errors.adjustmentType ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {adjustmentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className={`h-4 w-4 ${type.color}`} />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-gray-500">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.adjustmentType && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.adjustmentType}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Auto-generated"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {location.name}
                            <Badge variant="outline" className="ml-auto">{location.type}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.location}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adjustmentDate">Adjustment Date</Label>
                  <Input
                    id="adjustmentDate"
                    type="datetime-local"
                    value={formData.adjustmentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, adjustmentDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter reason for this adjustment"
                  className={errors.reason ? 'border-red-500' : ''}
                />
                {errors.reason && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.reason}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="approvedBy">Approved By</Label>
                <Input
                  id="approvedBy"
                  value={formData.approvedBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, approvedBy: e.target.value }))}
                  placeholder="Enter approver name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or details"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Items to Adjust</CardTitle>
              <CardDescription>Add products to this inventory adjustment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Item */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Add Item</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Search Product</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or SKU"
                        className="pl-10"
                      />
                    </div>
                    {searchQuery && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                            onClick={() => {
                              setSelectedProduct(product)
                              setSearchQuery(product.name)
                            }}
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku} | Stock: {product.currentStock}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {formData.adjustmentType === 'set' ? 'New Quantity' : 'Adjustment Quantity'}
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAdjustmentQuantity(Math.max(1, adjustmentQuantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={adjustmentQuantity}
                        onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 1)}
                        className="text-center"
                        min="1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAdjustmentQuantity(adjustmentQuantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button type="button" onClick={addItem} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {formData.items.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Items ({formData.items.length})</h4>
                    <Badge variant="outline">Total Value: ${totalAdjustmentValue.toFixed(2)}</Badge>
                  </div>
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div key={item.productId} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <Label className="text-xs text-gray-500">Current Stock</Label>
                            <div className="font-medium">{item.currentStock}</div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Adjustment</Label>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateItemQuantity(item.productId, item.adjustmentQuantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-12 text-center">{item.adjustmentQuantity}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateItemQuantity(item.productId, item.adjustmentQuantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">New Stock</Label>
                            <div className="font-medium text-blue-600">{item.newStock}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.items && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.items}
                </p>
              )}
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
                  Creating Adjustment...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Adjustment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
