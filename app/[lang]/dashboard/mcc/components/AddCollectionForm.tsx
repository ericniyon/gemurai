"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Combobox } from "@/components/ui/combobox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Droplets, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Calculator,
  DollarSign,
  FileText
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
  // Quality testing fields
  fat?: number
  protein?: number
  lactometerReading?: number
  antibioticTest: boolean
  tempCelsius?: number
  timeSinceMilkingHours?: number
  // Traceability fields
  sampleTag?: string
  photoUrl?: string
  batchId?: string
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
    unitPrice: 0,
    totalAmount: 0,
    // Quality testing fields
    fat: undefined,
    protein: undefined,
    lactometerReading: undefined,
    antibioticTest: false,
    tempCelsius: undefined,
    timeSinceMilkingHours: undefined,
    // Traceability fields
    sampleTag: '',
    photoUrl: '',
    batchId: '',
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
        // Set deductions and advances to defaults since sections are removed
        deductions: {
          products: [],
          others: {
            depannage: 0,
            essence: 0,
            umugabane: 0,
            ejoHeza: 0,
            inguzanyo: 0
          }
        },
        advances: 0,
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
        unitPrice: 0,
        totalAmount: 0,
        // Quality testing fields
        fat: undefined,
        protein: undefined,
        lactometerReading: undefined,
        antibioticTest: false,
        tempCelsius: undefined,
        timeSinceMilkingHours: undefined,
        // Traceability fields
        sampleTag: '',
        photoUrl: '',
        batchId: '',
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
    if (!farmerId) {
      setFormData(prev => ({
        ...prev,
        farmerId: '',
        farmerName: '',
        dailyCollections: new Array(15).fill(0),
        totalLiters: 0,
        totalAmount: 0,
      }))
      setFarmerCollectionHistory(null)
      setCompletedDays(new Set())
      setNextDayNumber(1)
      return
    }

    const farmer = farmers.find(f => f.id === farmerId)
    if (farmer) {
      setFormData(prev => ({
        ...prev,
        farmerId: farmer.id,
        farmerName: farmer.name,
        // Reset daily collections when selecting a new farmer
        dailyCollections: new Array(15).fill(0),
        totalLiters: 0,
        totalAmount: 0,
      }))
      
      // Clear completed days initially
      setCompletedDays(new Set())
      setNextDayNumber(1)
      setFarmerCollectionHistory(null)
      
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
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-blue-50/30 to-white border-2 border-blue-200/50 shadow-2xl px-4 sm:px-6">
        <DialogHeader className="pb-4 border-b border-blue-100">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            Record Milk Collection
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            Enter daily milk quantities for the selected farmer. The system will automatically calculate totals and amounts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Unified Form Layout */}
          <div className="space-y-6">
          {/* Farmer Selection */}
                <div className="space-y-2">
              <Label htmlFor="farmer" className="text-sm font-medium text-gray-700">
                Farmer <span className="text-red-500">*</span>
              </Label>
              <Combobox
                value={formData.farmerId}
                onValueChange={(value) => handleFarmerSelect(value)}
                options={farmers.map((farmer) => ({
                  value: farmer.id,
                  label: farmer.name,
                }))}
                placeholder="Select farmer..."
                searchPlaceholder="Search farmers..."
                emptyText="No farmer found"
                className={`h-11 ${errors.farmerId ? 'border-red-500' : ''}`}
              />
                  {errors.farmerId && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.farmerId}
                    </p>
                  )}
                </div>

            {/* Price and Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="unitPrice" className="text-sm font-medium text-gray-700">
                  Price per Liter (RWF)
                </Label>
                  <Input
                    id="unitPrice"
                    type="number"
                  value={formData.unitPrice === 0 ? '' : formData.unitPrice}
                  onFocus={(e) => {
                    if (formData.unitPrice === 0) {
                      e.target.select()
                    }
                        }}
                        onChange={(e) => {
                          const raw = e.target.value
                    if (raw === '') {
                      setFormData(prev => ({ ...prev, unitPrice: 0 }))
                      return
                    }
                    // Remove leading zeros except for decimals like 0.5
                          const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                    const num = parseInt(sanitized)
                    setFormData(prev => ({ ...prev, unitPrice: isNaN(num) ? 0 : num }))
                        }}
                        placeholder="0"
                  className="h-11"
                  style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                      />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dayQuantity" className="text-sm font-medium text-gray-700">
                  {farmerCollectionHistory && nextDayNumber <= 15 ? (
                    <>Day {nextDayNumber} - Milk Quantity (Liters) <span className="text-red-500">*</span></>
                  ) : (
                    <>Milk Quantity (Liters) <span className="text-red-500">*</span></>
                  )}
                      </Label>
                        <Input
                  id="dayQuantity"
                          type="number"
                  value={farmerCollectionHistory && nextDayNumber <= 15 
                    ? formData.dailyCollections[nextDayNumber - 1] || '' 
                    : formData.dailyCollections[0] || ''}
                          onFocus={(e) => {
                              e.currentTarget.select()
                          }}
                          onChange={(e) => {
                    if (e.target.value === '') {
                      const dayIndex = farmerCollectionHistory && nextDayNumber <= 15 
                        ? nextDayNumber - 1 
                        : 0
                      updateDailyCollection(dayIndex, 0)
                      return
                    }
                              const raw = e.target.value
                              const sanitized = raw && !raw.startsWith('0.') ? raw.replace(/^0+(?=\d)/, '') : raw
                              const num = parseFloat(sanitized)
                    const dayIndex = farmerCollectionHistory && nextDayNumber <= 15 
                      ? nextDayNumber - 1 
                      : 0
                    updateDailyCollection(dayIndex, isNaN(num) ? 0 : num)
                  }}
                  placeholder="Enter quantity (e.g., 5.5)"
                  className="h-11 text-center"
                  style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                          min="0"
                          step="0.1"
                        />
                {farmerCollectionHistory && completedDays.size > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {completedDays.size} days already recorded
                  </p>
                )}
                            </div>
              </div>
              
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Total Collected</span>
                </div>
                  <span className="text-lg font-bold text-blue-700">{formData.totalLiters.toFixed(1)} L</span>
              </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Total Amount</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">{formData.totalAmount.toLocaleString()} RWF</span>
                  </div>
                  </div>
                  
              {farmerCollectionHistory && completedDays.size > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-3 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700">Saved Days</span>
                  </div>
                    <span className="text-lg font-bold text-emerald-700">{completedDays.size}/15</span>
                </div>
                  </div>
              )}
                  </div>

          {/* Notes */}
              <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Additional Notes (optional)
              </Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any comments, observations, or special notes about this collection..."
                  rows={3}
                className="w-full px-3 py-2.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                />
              </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 pt-4 border-t border-blue-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-10 px-6 w-full sm:w-auto"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || formData.totalLiters <= 0}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Collection
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}




