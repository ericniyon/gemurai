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
  ArrowRightLeft, 
  Save, 
  X, 
  Package, 
  MapPin, 
  Hash, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Plus,
  Minus
} from "lucide-react"

interface StockMoveFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface StockMoveFormData {
  moveType: 'transfer' | 'adjustment' | 'return' | 'damage'
  reference: string
  fromLocation: string
  toLocation: string
  reason: string
  notes: string
  items: Array<{
    productId: string
    productName: string
    sku: string
    quantity: number
    unitCost?: number
  }>
  scheduledDate?: string
  priority: 'low' | 'medium' | 'high'
}

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  location: string
}

interface Location {
  id: string
  name: string
  type: 'warehouse' | 'store' | 'office' | 'other'
}

export function StockMoveForm({ open, onOpenChange, onSuccess }: StockMoveFormProps) {
  const [formData, setFormData] = useState<StockMoveFormData>({
    moveType: 'transfer',
    reference: '',
    fromLocation: '',
    toLocation: '',
    reason: '',
    notes: '',
    items: [],
    scheduledDate: '',
    priority: 'medium'
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<StockMoveFormData>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [itemQuantity, setItemQuantity] = useState(1)

  const moveTypes = [
    { value: 'transfer', label: 'Transfer', description: 'Move stock between locations' },
    { value: 'adjustment', label: 'Adjustment', description: 'Correct inventory discrepancies' },
    { value: 'return', label: 'Return', description: 'Return stock to supplier' },
    { value: 'damage', label: 'Damage', description: 'Remove damaged stock' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ]

  // Mock data - replace with actual API calls
  useEffect(() => {
    setProducts([
      { id: '1', name: 'Laptop Dell XPS 13', sku: 'DEL-0001', currentStock: 25, location: 'Main Warehouse' },
      { id: '2', name: 'Wireless Mouse', sku: 'MOU-0001', currentStock: 150, location: 'Main Warehouse' },
      { id: '3', name: 'USB-C Cable', sku: 'USB-0001', currentStock: 75, location: 'Main Warehouse' },
      { id: '4', name: 'Monitor 24"', sku: 'MON-0001', currentStock: 12, location: 'Main Warehouse' },
      { id: '5', name: 'Keyboard Mechanical', sku: 'KEY-0001', currentStock: 30, location: 'Main Warehouse' }
    ])

    setLocations([
      { id: '1', name: 'Main Warehouse', type: 'warehouse' },
      { id: '2', name: 'Store Front', type: 'store' },
      { id: '3', name: 'Office Storage', type: 'office' },
      { id: '4', name: 'Return Center', type: 'other' },
      { id: '5', name: 'Damaged Goods', type: 'other' }
    ])

    // Generate reference number
    const refNumber = `SM-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    setFormData(prev => ({ ...prev, reference: refNumber }))
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Partial<StockMoveFormData> = {}
    
    if (!formData.moveType) {
      newErrors.moveType = 'Move type is required'
    }
    
    if (!formData.fromLocation) {
      newErrors.fromLocation = 'From location is required'
    }
    
    if (!formData.toLocation) {
      newErrors.toLocation = 'To location is required'
    }
    
    if (formData.fromLocation === formData.toLocation) {
      newErrors.toLocation = 'To location must be different from from location'
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
      
      toast.success("Stock move created successfully!")
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        moveType: 'transfer',
        reference: '',
        fromLocation: '',
        toLocation: '',
        reason: '',
        notes: '',
        items: [],
        scheduledDate: '',
        priority: 'medium'
      })
      setErrors({})
      
    } catch (error) {
      toast.error("Failed to create stock move. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = () => {
    if (!selectedProduct || itemQuantity <= 0) {
      toast.error("Please select a product and enter a valid quantity")
      return
    }

    const existingItem = formData.items.find(item => item.productId === selectedProduct.id)
    if (existingItem) {
      toast.error("This product is already in the move list")
      return
    }

    if (itemQuantity > selectedProduct.currentStock) {
      toast.error("Quantity exceeds available stock")
      return
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        quantity: itemQuantity,
        unitCost: 0
      }]
    }))

    setSelectedProduct(null)
    setItemQuantity(1)
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
    
    const product = products.find(p => p.id === productId)
    if (product && quantity > product.currentStock) {
      toast.error("Quantity exceeds available stock")
      return
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      )
    }))
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalItems = formData.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Create Stock Move
          </DialogTitle>
          <DialogDescription>
            Move inventory between locations or adjust stock levels.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Move Details */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Move Details</CardTitle>
              <CardDescription>Basic information about the stock move</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moveType">Move Type *</Label>
                  <Select value={formData.moveType} onValueChange={(value: 'transfer' | 'adjustment' | 'return' | 'damage') => setFormData(prev => ({ ...prev, moveType: value }))}>
                    <SelectTrigger className={errors.moveType ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {moveTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.moveType && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.moveType}
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
                  <Label htmlFor="fromLocation">From Location *</Label>
                  <Select value={formData.fromLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, fromLocation: value }))}>
                    <SelectTrigger className={errors.fromLocation ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select source location" />
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
                  {errors.fromLocation && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.fromLocation}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toLocation">To Location *</Label>
                  <Select value={formData.toLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, toLocation: value }))}>
                    <SelectTrigger className={errors.toLocation ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select destination location" />
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
                  {errors.toLocation && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.toLocation}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <Badge className={priority.color}>{priority.label}</Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter reason for this move"
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
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or instructions"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Items to Move</CardTitle>
              <CardDescription>Add products to this stock move</CardDescription>
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
                    <Label>Quantity</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                        className="text-center"
                        min="1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setItemQuantity(itemQuantity + 1)}
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
                    <Badge variant="outline">Total: {totalItems} units</Badge>
                  </div>
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div key={item.productId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
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
                  Creating Move...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Stock Move
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
