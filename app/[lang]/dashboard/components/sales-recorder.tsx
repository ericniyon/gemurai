"use client"

import { useState, useEffect } from "react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Plus, DollarSign, Package, TrendingUp, CheckCircle, Users, BarChart3 } from "lucide-react"

interface DCCStockItem {
  stockId: string
  productId: string
  productName: string
  productDescription: string
  productPrice: number
  productImage: string
  productCategory: string
  productCommission: number
  currentStock: number
  priceAfterCommission: number
  totalValue: number
}

interface SalesFormData {
  productId: string
  quantity: number
  salePrice: number
  customerName: string
  customerPhone: string
  notes: string
}

interface SalesRecorderProps {
  onSaleDataChange?: (data: {
    salePrice: number
    quantity: number
    costPrice: number
    productName: string
  }) => void
  hideHeaderCard?: boolean
}

export function SalesRecorder(props: SalesRecorderProps) {
  const { onSaleDataChange, hideHeaderCard } = props
  const [isLoading, setIsLoading] = useState(false)
  const [dccStock, setDccStock] = useState<DCCStockItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<DCCStockItem | null>(null)
  const [formData, setFormData] = useState<SalesFormData>({
    productId: "",
    quantity: 1,
    salePrice: 0,
    customerName: "",
    customerPhone: "",
    notes: ""
  })
  const [recentSales, setRecentSales] = useState<any[]>([])
  const { toast } = useToast()

  // Fetch DCC stock on component mount
  useEffect(() => {
    fetchDCCStock()
    fetchRecentSales()
  }, [])

  // Update sale price when product is selected
  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        productId: selectedProduct.productId,
        salePrice: selectedProduct.priceAfterCommission
      }))
    }
  }, [selectedProduct])

  // Notify parent component of sale data changes
  useEffect(() => {
    if (onSaleDataChange && selectedProduct) {
      onSaleDataChange({
        salePrice: formData.salePrice,
        quantity: formData.quantity,
        costPrice: selectedProduct.priceAfterCommission,
        productName: selectedProduct.productName
      })
    }
  }, [formData.salePrice, formData.quantity, selectedProduct, onSaleDataChange])

  const fetchDCCStock = async () => {
    try {
      const response = await fetch('/api/v1/dcc/stock')
      const data = await response.json()
      
      if (data.success) {
        setDccStock(data.data.dccStock)
      } else {
        console.error('Failed to fetch DCC stock:', data.message)
      }
    } catch (error) {
      console.error('Error fetching DCC stock:', error)
    }
  }

  const fetchRecentSales = async () => {
    try {
      const response = await fetch('/api/v1/dcc/sales?limit=5')
      const data = await response.json()
      
      if (data.success) {
        setRecentSales(data.data.sales)
      }
    } catch (error) {
      console.error('Error fetching recent sales:', error)
    }
  }

  const handleProductSelect = (productId: string) => {
    const product = dccStock.find(item => item.productId === productId)
    setSelectedProduct(product || null)
  }

  const handleQuantityChange = (quantity: number) => {
    if (selectedProduct && quantity > selectedProduct.currentStock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${selectedProduct.currentStock} units available`,
        variant: "destructive"
      })
      return
    }

    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, quantity)
    }))
  }

  const calculateTotalRevenue = () => {
    return formData.quantity * formData.salePrice
  }

  const calculateProfit = () => {
    if (!selectedProduct) return 0
    const costPrice = selectedProduct.priceAfterCommission
    const totalCost = costPrice * formData.quantity
    const totalRevenue = calculateTotalRevenue()
    return totalRevenue - totalCost
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.productId || formData.quantity <= 0 || formData.salePrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/v1/dcc/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Sale Recorded Successfully!",
          description: `Sold ${data.data.quantity} units of ${data.data.productName} for ${data.data.totalRevenue} RWF`,
          variant: "default"
        })

        // Reset form
        setFormData({
          productId: "",
          quantity: 1,
          salePrice: 0,
          customerName: "",
          customerPhone: "",
          notes: ""
        })
        setSelectedProduct(null)

        // Refresh data
        fetchDCCStock()
        fetchRecentSales()
      } else {
        toast({
          title: "Error Recording Sale",
          description: data.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error recording sale:', error)
      toast({
        title: "Error",
        description: "Failed to record sale. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const availableProducts = dccStock.filter(item => item.currentStock > 0)
  const isInitialLoading = dccStock.length === 0 && recentSales.length === 0 && !selectedProduct && !formData.productId

  return (
    <div className="space-y-6">
      {/* Sales Recording Form */}
      <div>
        {hideHeaderCard ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-xl p-8">
            {/* Form Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                  <h2 className="text-2xl font-bold text-slate-900">Record New Sale</h2>
                  <p className="text-slate-600">Enter sale details to record a transaction</p>
                </div>
              </div>
              
              {availableProducts.length === 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Package className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">No products in stock</p>
                      <p className="text-sm text-amber-700">Add stock to record a sale</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Product Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <Label htmlFor="product" className="text-base font-semibold text-slate-700">Select Product *</Label>
          </div>
                  <Select onValueChange={handleProductSelect} value={formData.productId}>
                  <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl">
                      <SelectValue placeholder="Choose a product from your stock" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.productId} value={product.productId}>
                          <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{product.productName}</span>
                          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                              {product.currentStock} in stock
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProduct && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-600 font-medium">Cost Price</p>
                        <p className="text-blue-800 font-semibold">{selectedProduct.priceAfterCommission.toLocaleString()} RWF</p>
                      </div>
                      <div>
                        <p className="text-blue-600 font-medium">Available Stock</p>
                        <p className="text-blue-800 font-semibold">{selectedProduct.currentStock} units</p>
                      </div>
                    </div>
                    </div>
                  )}
                </div>

                {/* Quantity and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <Label htmlFor="quantity" className="text-base font-semibold text-slate-700">Quantity *</Label>
                  </div>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedProduct?.currentStock || 1}
                      value={formData.quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      placeholder="1"
                    className="h-12 border-2 border-slate-200 focus:border-purple-500 rounded-xl text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <Label htmlFor="salePrice" className="text-base font-semibold text-slate-700">Sale Price (RWF) *</Label>
                  </div>
                    <Input
                      id="salePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, salePrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    className="h-12 border-2 border-slate-200 focus:border-green-500 rounded-xl text-lg"
                    />
                  </div>
                </div>

                {/* Customer Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700">Customer Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-sm font-medium text-slate-600">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Enter customer name"
                      className="h-11 border-2 border-slate-200 focus:border-orange-500 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-sm font-medium text-slate-600">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="Enter phone number"
                      className="h-11 border-2 border-slate-200 focus:border-orange-500 rounded-xl"
                    />
                  </div>
                  </div>
                </div>

                {/* Notes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-slate-600" />
                  </div>
                  <Label htmlFor="notes" className="text-base font-semibold text-slate-700">Additional Notes</Label>
                </div>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes about this sale..."
                    rows={3}
                  className="border-2 border-slate-200 focus:border-slate-400 rounded-xl resize-none"
                  />
                </div>

              {/* Sale Summary */}
                {formData.productId && formData.quantity > 0 && formData.salePrice > 0 && (
                <div className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-slate-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">Sale Summary</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-600">Total Revenue:</span>
                      <span className="text-xl font-bold text-green-600">
                            {calculateTotalRevenue().toLocaleString()} RWF
                          </span>
                        </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-600">Total Cost:</span>
                      <span className="text-lg font-semibold text-slate-600">
                            {selectedProduct ? (selectedProduct.priceAfterCommission * formData.quantity).toLocaleString() : 0} RWF
                          </span>
                        </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <span className="text-green-800 font-medium">Profit:</span>
                      <span className={`text-xl font-bold ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {calculateProfit().toLocaleString()} RWF
                          </span>
                        </div>
                      </div>
                </div>
                )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        productId: "",
                        quantity: 1,
                        salePrice: 0,
                        customerName: "",
                        customerPhone: "",
                        notes: ""
                      })
                      setSelectedProduct(null)
                    }}
                  className="h-12 px-6 border-2 border-slate-300 hover:border-slate-400 rounded-xl"
                >
                  Clear Form
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || availableProducts.length === 0} 
                  className="h-12 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Recording Sale...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-3" />
                      Record Sale
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <Card className="mb-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                Record New Sale
              </CardTitle>
              <CardDescription className="text-slate-600">
                Record a sale to automatically deduct from your stock and track revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableProducts.length === 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Package className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">No products in stock</p>
                      <p className="text-sm text-amber-700">Add stock to record a sale</p>
                    </div>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Selection */}
                <div className="space-y-3">
                  <Label htmlFor="product" className="text-base font-semibold text-slate-700">Select Product *</Label>
                  <Select onValueChange={handleProductSelect} value={formData.productId}>
                    <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl">
                      <SelectValue placeholder="Choose a product from your stock" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.productId} value={product.productId}>
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{product.productName}</span>
                            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                              {product.currentStock} in stock
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity and Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm font-medium text-slate-600">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedProduct?.currentStock || 1}
                      value={formData.quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      placeholder="1"
                      className="h-11 border-2 border-slate-200 focus:border-purple-500 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice" className="text-sm font-medium text-slate-600">Sale Price (RWF) *</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, salePrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className="h-11 border-2 border-slate-200 focus:border-green-500 rounded-xl"
                    />
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-orange-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700">Customer Information</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName" className="text-sm font-medium text-slate-600">Customer Name</Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        placeholder="Enter customer name"
                        className="h-11 border-2 border-slate-200 focus:border-orange-500 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone" className="text-sm font-medium text-slate-600">Phone Number</Label>
                      <Input
                        id="customerPhone"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                        placeholder="Enter phone number"
                        className="h-11 border-2 border-slate-200 focus:border-orange-500 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-slate-600">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any additional notes about this sale..."
                    rows={3}
                    className="border-2 border-slate-200 focus:border-slate-400 rounded-xl resize-none"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading || availableProducts.length === 0} 
                    className="h-12 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Recording...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-3" />
                        Record Sale
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
            </div>
    </div>
  )
}
