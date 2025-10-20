"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Droplets, 
  Save, 
  X, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  Minus,
  Calculator,
  Users,
  Hash,
  Package
} from "lucide-react"

interface AddCollectionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface CollectionFormData {
  farmerId: string
  farmerName: string
  collectionDate: string
  period: number
  // Daily milk collections
  dailyCollections: number[]
  totalLiters: number
  unitPrice: number
  totalAmount: number
  // Deductions section
  deductions: {
    // Product deductions (multiple products)
    products: Array<{
      id: string
      productId: string
      productName: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>
    // Others category
    others: {
      depannage: number // Maintenance
      essence: number   // Fuel
      umugabane: number // Share
      ejoHeza: number   // Savings
      inguzanyo: number // Loan
    }
  }
  advances: number
  totalDeductions: number
  netPayment: number
  notes?: string
}

export function AddCollectionForm({ open, onOpenChange, onSuccess }: AddCollectionFormProps) {
  const [formData, setFormData] = useState<CollectionFormData>({
    farmerId: '',
    farmerName: '',
    collectionDate: new Date().toISOString().slice(0, 10),
    period: 1,
    // Daily milk collections
    dailyCollections: new Array(15).fill(0),
    totalLiters: 0,
    unitPrice: 190,
    totalAmount: 0,
        // Deductions section
        deductions: {
          // Product deductions (multiple products)
          products: [],
          // Others category
          others: {
            depannage: 0, // Maintenance
            essence: 0,   // Fuel
            umugabane: 0, // Share
            ejoHeza: 0,   // Savings
            inguzanyo: 0  // Loan
          }
        },
    advances: 0,
    totalDeductions: 0,
    netPayment: 0,
    notes: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<CollectionFormData>>({})
  const [farmers, setFarmers] = useState<Array<{id: string, name: string, farmerNumber: number}>>([])
  const [products, setProducts] = useState<Array<{id: string, name: string, price: number}>>([])

  // Fetch real farmers data
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await fetch('/api/v1/mcc/farmers?mccId=mcc_1760697250506', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const farmersList = data.data?.map((farmer: any) => ({
            id: farmer.id,
            name: farmer.name,
            farmerNumber: farmer.id.slice(-8) // Use last 8 chars of ID as farmer number
          })) || []
          setFarmers(farmersList)
        } else {
          console.error('Failed to fetch farmers:', response.statusText)
          // Fallback to mock data
          setFarmers([
            { id: "1", name: "NDAGIJIMANA JMV", farmerNumber: 1 },
            { id: "2", name: "NDABABONYE Vicent", farmerNumber: 2 },
            { id: "3", name: "HAGENIMANA Samuel", farmerNumber: 3 },
            { id: "4", name: "NIZEYIMANA Jean Baptiste", farmerNumber: 4 },
            { id: "5", name: "BUTARE Theophille", farmerNumber: 5 },
            { id: "6", name: "UMUHIRE Said", farmerNumber: 6 },
            { id: "7", name: "NSHIMIYIMANA Faustin", farmerNumber: 7 },
            { id: "8", name: "NSENGIYUMVA Alphonse", farmerNumber: 8 }
          ])
        }
      } catch (error) {
        console.error('Error fetching farmers:', error)
        // Fallback to mock data
        setFarmers([
          { id: "1", name: "NDAGIJIMANA JMV", farmerNumber: 1 },
          { id: "2", name: "NDABABONYE Vicent", farmerNumber: 2 },
          { id: "3", name: "HAGENIMANA Samuel", farmerNumber: 3 },
          { id: "4", name: "NIZEYIMANA Jean Baptiste", farmerNumber: 4 },
          { id: "5", name: "BUTARE Theophille", farmerNumber: 5 },
          { id: "6", name: "UMUHIRE Said", farmerNumber: 6 },
          { id: "7", name: "NSHIMIYIMANA Faustin", farmerNumber: 7 },
          { id: "8", name: "NSENGIYUMVA Alphonse", farmerNumber: 8 }
        ])
      }
    }

    fetchFarmers()
  }, [])

  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/v1/inventory/products', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const productsList = data.data?.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price || 0
          })) || []
          setProducts(productsList)
        } else {
          console.error('Failed to fetch products:', response.statusText)
          // Fallback to mock data
          setProducts([
            { id: "1", name: "Milk (Fresh)", price: 500 },
            { id: "2", name: "Cheese", price: 2000 },
            { id: "3", name: "Yogurt", price: 800 },
            { id: "4", name: "Butter", price: 1500 }
          ])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        // Fallback to mock data
        setProducts([
          { id: "1", name: "Milk (Fresh)", price: 500 },
          { id: "2", name: "Cheese", price: 2000 },
          { id: "3", name: "Yogurt", price: 800 },
          { id: "4", name: "Butter", price: 1500 }
        ])
      }
    }

    fetchProducts()
  }, [])

  // Helper: compute bi-monthly period (1-24) from yyyy-mm-dd
  const computePeriodFromDate = (isoDate: string): number => {
    const d = new Date(isoDate)
    if (isNaN(d.getTime())) return 1
    const month = d.getMonth() + 1 // 1..12
    const day = d.getDate() // 1..31
    const half = day <= 15 ? 1 : 2
    return (month - 1) * 2 + half // 1..24
  }

  // Initialize period from initial date once on mount
  useEffect(() => {
    setFormData(prev => ({ ...prev, period: computePeriodFromDate(prev.collectionDate) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update period automatically when collectionDate changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, period: computePeriodFromDate(prev.collectionDate) }))
  }, [formData.collectionDate])

  const calculateTotals = () => {
    // Milk collection calculations
    const totalLiters = formData.dailyCollections.reduce((sum, amount) => sum + amount, 0)
    const totalAmount = totalLiters * formData.unitPrice
    
    // Product deductions calculations
    const productDeductionsTotal = formData.deductions.products.reduce((sum, product) => sum + product.totalPrice, 0)
    
            // Others calculations
            const othersTotal = Object.values(formData.deductions.others).reduce((sum, amount) => sum + amount, 0)
            
            // Total deductions
            const totalDeductions = productDeductionsTotal + othersTotal
    
    const netPayment = totalAmount - totalDeductions - formData.advances

    setFormData(prev => ({
      ...prev,
      totalLiters,
      totalAmount,
      totalDeductions,
      netPayment
    }))
  }

  useEffect(() => {
    calculateTotals()
  }, [formData.dailyCollections, formData.unitPrice, formData.deductions.products, formData.deductions.others, formData.advances])

  const validateForm = (): boolean => {
    const newErrors: Partial<CollectionFormData> = {}
    
    if (!formData.farmerId) {
      newErrors.farmerId = 'Please select a farmer'
    }
    
    if (!formData.collectionDate) {
      newErrors.collectionDate = 'Collection date is required'
    }
    
    if (formData.totalLiters <= 0) {
      newErrors.totalLiters = 'Total milk collected must be greater than 0'
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
      
      toast.success("Milk collection recorded successfully!")
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        farmerId: '',
        farmerName: '',
        collectionDate: new Date().toISOString().slice(0, 10),
        period: 1,
        // Daily milk collections
        dailyCollections: new Array(15).fill(0),
        totalLiters: 0,
        unitPrice: 190,
        totalAmount: 0,
        // Deductions section
        deductions: {
          // Product deductions (multiple products)
          products: [],
          // Others category
          others: {
            depannage: 0, // Maintenance
            essence: 0,   // Fuel
            umugabane: 0, // Share
            ejoHeza: 0,   // Savings
            inguzanyo: 0  // Loan
          }
        },
        advances: 0,
        totalDeductions: 0,
        netPayment: 0,
        notes: ''
      })
      setErrors({})
      
    } catch (error) {
      toast.error("Failed to record collection. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFarmerSelect = (farmerId: string) => {
    const farmer = farmers.find(f => f.id === farmerId)
    if (farmer) {
      setFormData(prev => ({
        ...prev,
        farmerId: farmer.id,
        farmerName: farmer.name
      }))
    }
  }

  const updateDailyCollection = (dayIndex: number, value: number) => {
    const newCollections = [...formData.dailyCollections]
    newCollections[dayIndex] = value
    setFormData(prev => ({ ...prev, dailyCollections: newCollections }))
  }

  const updateDeduction = (key: keyof CollectionFormData['deductions'], value: number) => {
    setFormData(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [key]: value
      }
    }))
  }


  const updateOthers = (key: keyof CollectionFormData['deductions']['others'], value: number) => {
    setFormData(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        others: {
          ...prev.deductions.others,
          [key]: value
        }
      }
    }))
  }


  const addProductDeduction = () => {
    const newProduct = {
      id: `product_${Date.now()}`,
      productId: '',
      productName: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0
    }
    
    setFormData(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        products: [...prev.deductions.products, newProduct]
      }
    }))
  }

  const removeProductDeduction = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        products: prev.deductions.products.filter(p => p.id !== productId)
      }
    }))
  }

  const updateProductDeduction = (productId: string, field: keyof CollectionFormData['deductions']['products'][0], value: any) => {
    setFormData(prev => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        products: prev.deductions.products.map(p => {
          if (p.id === productId) {
            const updatedProduct = { ...p, [field]: value }
            
            // Auto-calculate total price when quantity or unitPrice changes
            if (field === 'quantity' || field === 'unitPrice') {
              updatedProduct.totalPrice = updatedProduct.quantity * updatedProduct.unitPrice
            }
            
            // Auto-set product name and unit price when productId changes
            if (field === 'productId') {
              const selectedProduct = products.find(prod => prod.id === value)
              if (selectedProduct) {
                updatedProduct.productName = selectedProduct.name
                updatedProduct.unitPrice = selectedProduct.price
                updatedProduct.totalPrice = updatedProduct.quantity * selectedProduct.price
              }
            }
            
            return updatedProduct
          }
          return p
        })
      }
    }))
  }


  const othersLabels = {
    depannage: "Depannage (Maintenance)",
    essence: "Essence (Fuel)",
    umugabane: "Umugabane (Share)",
    ejoHeza: "Ejo Heza (Savings)",
    inguzanyo: "Inguzanyo (Loan)"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Record Milk Collection
          </DialogTitle>
          <DialogDescription>
            Record daily milk collection for a farmer. Enter quantities for each day of the period.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Farmer Selection */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Farmer Information</CardTitle>
              <CardDescription>Select the farmer for this collection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmer">Select Farmer *</Label>
                  <Select value={formData.farmerId} onValueChange={handleFarmerSelect}>
                    <SelectTrigger className={errors.farmerId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Choose a farmer" />
                    </SelectTrigger>
                    <SelectContent>
                      {farmers.map(farmer => (
                        <SelectItem key={farmer.id} value={farmer.id}>
                          #{farmer.farmerNumber} - {farmer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.farmerId && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.farmerId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collectionDate">Collection Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                      id="collectionDate"
                      type="date"
                      value={formData.collectionDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, collectionDate: e.target.value }))}
                      className={`pl-10 ${errors.collectionDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.collectionDate && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.collectionDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period">Period Number (auto)</Label>
                  <Input
                    id="period"
                    type="number"
                    value={formData.period}
                    readOnly
                    disabled
                    placeholder="Auto"
                    min="1"
                    max="24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (Frw/L)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: parseInt(e.target.value) || 190 }))}
                    placeholder="190"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deductions */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Deductions</CardTitle>
              <CardDescription>Product deductions and other deductions from the total amount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Deductions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-semibold text-gray-700">Product Deductions</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProductDeduction}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>
                
                {formData.deductions.products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No products added yet</p>
                    <p className="text-sm">Click "Add Product" to start adding product deductions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.deductions.products.map((product, index) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-700">Product #{index + 1}</h5>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProductDeduction(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`product-${product.id}`}>Product</Label>
                            <Select 
                              value={product.productId} 
                              onValueChange={(value) => updateProductDeduction(product.id, 'productId', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map(prod => (
                                  <SelectItem key={prod.id} value={prod.id}>
                                    {prod.name} - {prod.price.toLocaleString()} Frw
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`quantity-${product.id}`}>Quantity</Label>
                            <Input
                              id={`quantity-${product.id}`}
                              type="number"
                              value={product.quantity}
                              onFocus={(e) => e.currentTarget.select()}
                              onChange={(e) => {
                                const raw = e.target.value
                                const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                                const num = parseFloat(sanitized)
                                updateProductDeduction(product.id, 'quantity', isNaN(num) ? 0 : num)
                              }}
                              placeholder="0"
                              min="0"
                              step="0.1"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`unitPrice-${product.id}`}>Unit Price</Label>
                            <Input
                              id={`unitPrice-${product.id}`}
                              type="number"
                              value={product.unitPrice}
                              onFocus={(e) => e.currentTarget.select()}
                              onChange={(e) => {
                                const raw = e.target.value
                                const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                                const num = parseFloat(sanitized)
                                updateProductDeduction(product.id, 'unitPrice', isNaN(num) ? 0 : num)
                              }}
                              placeholder="0"
                              min="0"
                              step="0.1"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`totalPrice-${product.id}`}>Total Price</Label>
                            <Input
                              id={`totalPrice-${product.id}`}
                              type="text"
                              value={`${product.totalPrice.toLocaleString()} Frw`}
                              readOnly
                              disabled
                              className="bg-gray-100"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Others Category */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-700">Others</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(othersLabels).map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{label}</Label>
                      <Input
                        id={key}
                        type="number"
                        value={formData.deductions.others[key as keyof CollectionFormData['deductions']['others']]}
                        onFocus={(e) => {
                          e.currentTarget.select()
                        }}
                        onChange={(e) => {
                          const raw = e.target.value
                          const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                          const num = parseFloat(sanitized)
                          updateOthers(key as keyof CollectionFormData['deductions']['others'], isNaN(num) ? 0 : num)
                        }}
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              
              <Separator />
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Total Deductions:</span>
                </div>
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  {formData.totalDeductions.toLocaleString()} Frw
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Daily Collections */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Daily Milk Collections (15 Days)</CardTitle>
              <CardDescription>Enter milk quantity for each day of the period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {formData.dailyCollections.map((amount, index) => (
                  <div key={index} className="space-y-1">
                    <Label className="text-xs text-center block">Day {index + 1}</Label>
                    <Input
                      type="number"
                      value={amount}
                      onFocus={(e) => {
                        // Select existing value so typing replaces the default 0
                        e.currentTarget.select()
                      }}
                      onChange={(e) => {
                        // Remove leading zeros except for decimals like 0.5
                        const raw = e.target.value
                        const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                        const num = parseFloat(sanitized)
                        updateDailyCollection(index, isNaN(num) ? 0 : num)
                      }}
                      placeholder="0"
                      className="text-center"
                      min="0"
                      step="0.1"
                    />
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Total Milk Collected:</span>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {formData.totalLiters.toFixed(1)} Liters
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Advances */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Advances</CardTitle>
              <CardDescription>Advance payments made to the farmer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="advances">Advance Amount (Frw)</Label>
                <Input
                  id="advances"
                  type="number"
                  value={formData.advances}
                  onFocus={(e) => {
                    e.currentTarget.select()
                  }}
                  onChange={(e) => {
                    const raw = e.target.value
                    const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                    const num = parseFloat(sanitized)
                    setFormData(prev => ({ ...prev, advances: isNaN(num) ? 0 : num }))
                  }}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Collection Summary</CardTitle>
              <CardDescription>Final calculations and payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Total Milk:</span>
                    <span className="font-semibold">{formData.totalLiters.toFixed(1)} L</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Total Amount:</span>
                    <span className="font-semibold">{formData.totalAmount.toLocaleString()} Frw</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">Total Deductions:</span>
                    <span className="font-semibold">{formData.totalDeductions.toLocaleString()} Frw</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Advances:</span>
                    <span className="font-semibold">{formData.advances.toLocaleString()} Frw</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <span className="font-medium text-purple-800">Net Payment:</span>
                    <span className="font-bold text-purple-800 text-lg">{formData.netPayment.toLocaleString()} Frw</span>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Unit Price</p>
                    <p className="text-lg font-semibold">{formData.unitPrice} Frw/L</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
              <CardDescription>Any additional comments or observations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter any additional notes or observations"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  Recording Collection...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Record Collection
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}




