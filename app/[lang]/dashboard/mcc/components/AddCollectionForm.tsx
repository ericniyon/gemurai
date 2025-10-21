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
  Package,
  Lock
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

interface FarmerCollectionHistory {
  farmerId: string
  collections: Array<{
    id: string
    collectionDate: string
    totalLiters: number
    period: number
    status: string
  }>
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
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [errors, setErrors] = useState<Partial<CollectionFormData>>({})
  const [farmers, setFarmers] = useState<Array<{id: string, name: string, farmerNumber: number}>>([])
  const [products, setProducts] = useState<Array<{id: string, name: string, price: number, stockQuantity?: number}>>([])
  const [farmerCollectionHistory, setFarmerCollectionHistory] = useState<FarmerCollectionHistory | null>(null)
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set())
  const [nextDayNumber, setNextDayNumber] = useState<number>(1)

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

  // Fetch products data with stock quantities
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch products
        const productsResponse = await fetch('/api/v1/inventory/products', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`
          }
        })
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          const productsList = productsData.data?.map((product: any) => {
            // Calculate total stock from stockQuantities
            const totalStock = product.stockQuantities?.reduce((sum: number, stock: any) => sum + (stock.quantity || 0), 0) || 0
            
            return {
              id: product.id,
              name: product.name,
              price: product.price || 0,
              stockQuantity: totalStock
            }
          }) || []
          
          setProducts(productsList)
        } else {
          console.error('Failed to fetch products:', productsResponse.statusText)
          // Fallback to mock data with stock
          setProducts([
            { id: "1", name: "Milk (Fresh)", price: 500, stockQuantity: 100 },
            { id: "2", name: "Cheese", price: 2000, stockQuantity: 50 },
            { id: "3", name: "Yogurt", price: 800, stockQuantity: 75 },
            { id: "4", name: "Butter", price: 1500, stockQuantity: 25 }
          ])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        // Fallback to mock data with stock
        setProducts([
          { id: "1", name: "Milk (Fresh)", price: 500, stockQuantity: 100 },
          { id: "2", name: "Cheese", price: 2000, stockQuantity: 50 },
          { id: "3", name: "Yogurt", price: 800, stockQuantity: 75 },
          { id: "4", name: "Butter", price: 1500, stockQuantity: 25 }
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

  // Recalculate completed days when period changes
  useEffect(() => {
    if (farmerCollectionHistory && formData.farmerId) {
      calculateCompletedDays(farmerCollectionHistory.collections, formData.period)
    }
  }, [formData.period, farmerCollectionHistory])

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
      // Prepare collection data for API
      const collectionData = {
        farmerId: formData.farmerId,
        collectionDate: formData.collectionDate,
        period: formData.period,
        totalLiters: formData.totalLiters,
        unitPrice: formData.unitPrice,
        totalAmount: formData.totalAmount,
        deductions: formData.deductions,
        advances: formData.advances,
        notes: formData.notes
      }

      console.log('Sending collection data:', collectionData)

      // Make API call to save collection
      const response = await fetch('/api/v1/mcc/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`
        },
        body: JSON.stringify(collectionData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to save collection')
      }

      const result = await response.json()
      console.log('Collection saved successfully:', result)
      
      toast.success("Milk collection recorded successfully!")
      
      // Refresh farmer collection history to show the new collection
      if (formData.farmerId) {
        await fetchFarmerCollectionHistory(formData.farmerId)
      }
      
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
      setFarmerCollectionHistory(null)
      setCompletedDays(new Set())
      
    } catch (error) {
      console.error('Collection save error:', error)
      toast.error("Failed to record collection. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch farmer collection history
  const fetchFarmerCollectionHistory = async (farmerId: string) => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch(`/api/v1/mcc/collections?farmerId=${farmerId}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const collections = data.data || []
        
        setFarmerCollectionHistory({
          farmerId,
          collections: collections.map((collection: any) => ({
            id: collection.id,
            collectionDate: collection.collectionDate,
            totalLiters: collection.totalLiters || 0,
            period: collection.period || 1,
            status: collection.status || 'PENDING'
          }))
        })
        
        // Calculate completed days for the current period
        calculateCompletedDays(collections, formData.period)
      } else {
        console.error('Failed to fetch farmer collection history:', response.statusText)
        setFarmerCollectionHistory(null)
        setCompletedDays(new Set())
      }
    } catch (error) {
      console.error('Error fetching farmer collection history:', error)
      setFarmerCollectionHistory(null)
      setCompletedDays(new Set())
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Calculate which days are completed and populate daily collections with historical data
  const calculateCompletedDays = (collections: any[], currentPeriod: number) => {
    const completed = new Set<number>()
    const dailyCollections = new Array(15).fill(0)
    
    // Get collections for the current period (include both PENDING and completed)
    const periodCollections = collections.filter((collection: any) => 
      collection.period === currentPeriod && (collection.status === 'completed' || collection.status === 'PENDING')
    )
    
    // Sort collections by collection date to get chronological order
    const sortedCollections = periodCollections.sort((a: any, b: any) => 
      new Date(a.collectionDate).getTime() - new Date(b.collectionDate).getTime()
    )
    
    // Map each collection to a sequential day number (1-15) and populate daily collections
    sortedCollections.forEach((collection: any, index: number) => {
      // Each collection represents one day, starting from day 1
      const dayNumber = index + 1
      if (dayNumber <= 15) {
        completed.add(dayNumber)
        dailyCollections[dayNumber - 1] = collection.totalLiters || 0
      }
    })
    
    setCompletedDays(completed)
    
    // Calculate the next available day number
    const nextDay = completed.size + 1
    setNextDayNumber(nextDay <= 15 ? nextDay : 15)
    
    // Update the form data with historical daily collections
    setFormData(prev => ({
      ...prev,
      dailyCollections: dailyCollections
    }))
  }

  const handleFarmerSelect = (farmerId: string) => {
    const farmer = farmers.find(f => f.id === farmerId)
    if (farmer) {
      setFormData(prev => ({
        ...prev,
        farmerId: farmer.id,
        farmerName: farmer.name,
        // Reset daily collections when selecting a new farmer
        dailyCollections: new Array(15).fill(0)
      }))
      
      // Clear completed days initially
      setCompletedDays(new Set())
      
      // Fetch collection history for the selected farmer
      fetchFarmerCollectionHistory(farmerId)
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
            
            // Stock validation for quantity field
            if (field === 'quantity') {
              const selectedProduct = products.find(prod => prod.id === updatedProduct.productId)
              if (selectedProduct && selectedProduct.stockQuantity !== undefined) {
                const requestedQuantity = parseFloat(value) || 0
                if (requestedQuantity > selectedProduct.stockQuantity) {
                  toast.error(`Insufficient stock! Available: ${selectedProduct.stockQuantity}, Requested: ${requestedQuantity}`)
                  // Don't update the quantity if it exceeds stock
                  return p
                }
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
                                    {prod.stockQuantity !== undefined && (
                                      <span className="ml-2 text-xs text-gray-500">
                                        (Stock: {prod.stockQuantity})
                                      </span>
                                    )}
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
                              max={(() => {
                                const selectedProduct = products.find(prod => prod.id === product.productId)
                                return selectedProduct?.stockQuantity || undefined
                              })()}
                              step="0.1"
                            />
                            {product.productId && (() => {
                              const selectedProduct = products.find(prod => prod.id === product.productId)
                              if (selectedProduct && selectedProduct.stockQuantity !== undefined) {
                                const isOverStock = product.quantity > selectedProduct.stockQuantity
                                return (
                                  <div className="text-xs">
                                    <div className={`flex items-center gap-1 ${
                                      isOverStock ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                      <Package className="h-3 w-3" />
                                      <span>
                                        Available: {selectedProduct.stockQuantity}
                                        {isOverStock && (
                                          <span className="ml-1 font-medium">
                                            (Exceeds stock!)
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            })()}
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
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Daily Milk Collections (15 Days)</span>
                {isLoadingHistory ? (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading history...</span>
                  </div>
                ) : farmerCollectionHistory && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{completedDays.size} days completed</span>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                {isLoadingHistory ? (
                  "Loading farmer's collection history..."
                ) : farmerCollectionHistory ? (
                  <>
                    Collection data loaded for {formData.farmerName} - Period {formData.period}
                    <span className="ml-2 text-green-600">
                      • Green days are locked with saved amounts
                    </span>
                    <span className="ml-2 text-blue-600 font-medium">
                      • Next collection will be Day {nextDayNumber}
                    </span>
                  </>
                ) : (
                  "Enter milk quantity for each day of the period"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {formData.dailyCollections.map((amount, index) => {
                  const dayNumber = index + 1
                  const isCompleted = completedDays.has(dayNumber)
                  const isNextDay = dayNumber === nextDayNumber && !isCompleted
                  const hasValue = amount > 0
                  
                  return (
                    <div key={index} className="space-y-1">
                      <Label className={`text-xs text-center block ${
                        isCompleted ? 'text-green-700 font-semibold' : 
                        isNextDay ? 'text-blue-700 font-semibold' : ''
                      }`}>
                        Day {dayNumber}
                        {isCompleted && <CheckCircle className="h-3 w-3 inline ml-1 text-green-600" />}
                        {isNextDay && <span className="ml-1 text-blue-600 font-bold">← Next</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={amount}
                          disabled={isCompleted}
                          onFocus={(e) => {
                            // Only select if not disabled
                            if (!isCompleted) {
                              e.currentTarget.select()
                            }
                          }}
                          onChange={(e) => {
                            // Only allow changes if not completed
                            if (!isCompleted) {
                              // Remove leading zeros except for decimals like 0.5
                              const raw = e.target.value
                              const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                              const num = parseFloat(sanitized)
                              updateDailyCollection(index, isNaN(num) ? 0 : num)
                            }
                          }}
                          placeholder="0"
                          className={`text-center ${
                            isCompleted 
                              ? 'border-green-500 bg-green-100 text-green-800 font-medium cursor-not-allowed' 
                              : isNextDay
                                ? 'border-blue-500 bg-blue-100 text-blue-800 font-medium ring-2 ring-blue-200'
                                : hasValue 
                                  ? 'border-blue-300 bg-blue-50' 
                                  : ''
                          }`}
                          min="0"
                          step="0.1"
                        />
                        {isCompleted && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                              <Lock className="h-2 w-2 text-white" />
                            </div>
                          </div>
                        )}
                        {isNextDay && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">→</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              
              <Separator />
              
              {/* Collection Summary */}
              {farmerCollectionHistory && completedDays.size > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Saved Collections
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Saved days:</span>
                      <span className="font-medium text-green-800">{completedDays.size}/15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Saved total:</span>
                      <span className="font-medium text-green-800">
                        {formData.dailyCollections
                          .filter((amount, index) => completedDays.has(index + 1))
                          .reduce((sum, amount) => sum + amount, 0)
                          .toFixed(1)}L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Next day:</span>
                      <span className="font-medium text-blue-800">Day {nextDayNumber}</span>
                    </div>
                  </div>
                </div>
              )}
              
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




