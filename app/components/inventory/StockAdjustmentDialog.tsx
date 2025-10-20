"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, TrendingUp, TrendingDown, Settings } from "lucide-react"

interface StockAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stockQuantity: {
    id: string
    productId: string
    warehouseId: string
    locationId: string
    quantity: number
    availableQuantity: number
    reservedQuantity: number
    product: {
      id: string
      name: string
      code: string
    }
    warehouse: {
      id: string
      name: string
      code: string
    }
    location: {
      id: string
      name: string
      code: string
    }
  } | null
  onSuccess?: () => void
}

export function StockAdjustmentDialog({ 
  open, 
  onOpenChange, 
  stockQuantity, 
  onSuccess 
}: StockAdjustmentDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<'INCREASE' | 'DECREASE' | 'SET'>('INCREASE')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && stockQuantity) {
      // Reset form when dialog opens
      setAdjustmentType('INCREASE')
      setQuantity('')
      setReason('')
      setNotes('')
    }
  }, [open, stockQuantity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stockQuantity || !quantity || !reason) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/v1/superadmin/stock-quantities/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: stockQuantity.productId,
          warehouseId: stockQuantity.warehouseId,
          locationId: stockQuantity.locationId,
          quantity: parseFloat(quantity),
          adjustmentType,
          reason,
          notes
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Stock quantity adjusted successfully",
        })
        onSuccess?.()
        onOpenChange(false)
      } else {
        throw new Error(data.error || 'Failed to adjust stock quantity')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to adjust stock quantity",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getNewQuantity = () => {
    if (!stockQuantity || !quantity) return stockQuantity?.quantity || 0
    
    const currentQuantity = stockQuantity.quantity
    const adjustmentQuantity = parseFloat(quantity)
    
    switch (adjustmentType) {
      case 'INCREASE':
        return currentQuantity + adjustmentQuantity
      case 'DECREASE':
        return Math.max(0, currentQuantity - adjustmentQuantity)
      case 'SET':
        return adjustmentQuantity
      default:
        return currentQuantity
    }
  }

  const getAdjustmentIcon = () => {
    switch (adjustmentType) {
      case 'INCREASE':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'DECREASE':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'SET':
        return <Settings className="h-4 w-4 text-blue-500" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  if (!stockQuantity) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Adjust Stock Quantity
          </DialogTitle>
          <DialogDescription>
            Make adjustments to stock quantities for accurate inventory tracking
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Product Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Product:</span>
                <p className="font-medium">{stockQuantity.product.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Code:</span>
                <p className="font-medium">{stockQuantity.product.code}</p>
              </div>
              <div>
                <span className="text-gray-500">Warehouse:</span>
                <p className="font-medium">{stockQuantity.warehouse.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Location:</span>
                <p className="font-medium">{stockQuantity.location.name}</p>
              </div>
            </div>
          </div>

          {/* Current Stock Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Current Stock</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Total:</span>
                <p className="font-bold text-blue-900">{stockQuantity.quantity}</p>
              </div>
              <div>
                <span className="text-green-600">Available:</span>
                <p className="font-bold text-green-700">{stockQuantity.availableQuantity}</p>
              </div>
              <div>
                <span className="text-orange-600">Reserved:</span>
                <p className="font-bold text-orange-700">{stockQuantity.reservedQuantity}</p>
              </div>
            </div>
          </div>

          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label htmlFor="adjustmentType">Adjustment Type</Label>
            <Select value={adjustmentType} onValueChange={(value: any) => setAdjustmentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select adjustment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCREASE">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Increase Stock
                  </div>
                </SelectItem>
                <SelectItem value="DECREASE">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    Decrease Stock
                  </div>
                </SelectItem>
                <SelectItem value="SET">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-500" />
                    Set Exact Quantity
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              {adjustmentType === 'SET' ? 'New Quantity' : 'Adjustment Quantity'}
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step="0.01"
              placeholder="Enter quantity"
              required
            />
          </div>

          {/* Preview */}
          {quantity && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Preview Changes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current quantity:</span>
                <span className="font-medium">{stockQuantity.quantity}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">New quantity:</span>
                <div className="flex items-center gap-2">
                  {getAdjustmentIcon()}
                  <span className="font-bold">{getNewQuantity()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason for adjustment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cycle_count">Cycle Count Correction</SelectItem>
                <SelectItem value="damaged">Damaged Goods</SelectItem>
                <SelectItem value="expired">Expired Products</SelectItem>
                <SelectItem value="theft">Theft/Loss</SelectItem>
                <SelectItem value="found">Found Stock</SelectItem>
                <SelectItem value="system_error">System Error Correction</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this adjustment..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !quantity || !reason}>
              {isSubmitting ? "Adjusting..." : "Adjust Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 