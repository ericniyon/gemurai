"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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
  FileText,
  User,
  UserCheck,
  Truck,
  Search,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, getCurrencySymbol, getMCCCurrency, DEFAULT_CURRENCY } from "@/lib/utils/currency"
import { useAuth } from "@/hooks/use-auth"
import { HelpTooltip, HelpModal, useHelpModal } from "@/components/onboarding"
import { HELP_CONTENT } from "@/lib/help-content"

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
  
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [errors, setErrors] = useState<Partial<CollectionFormData>>({})
  const [farmers, setFarmers] = useState<Array<{ id: string; name: string; farmerCode?: string | null; phone?: string }>>([])
  const [agents, setAgents] = useState<Array<{ id: string; name: string; email?: string; phone?: string; displayId?: string | null }>>([])
  const [deliveredBy, setDeliveredBy] = useState<'farmer' | 'agent'>('farmer')
  const [agentId, setAgentId] = useState<string>('')
  const [farmerCodeInput, setFarmerCodeInput] = useState('')
  const [mccCurrency, setMccCurrency] = useState<string>(DEFAULT_CURRENCY)
  const [lookingUpFarmer, setLookingUpFarmer] = useState(false)
  const [agentCodeInput, setAgentCodeInput] = useState('')
  const [lookingUpAgent, setLookingUpAgent] = useState(false)

  // Help modal for contextual help
  const { isOpen: isHelpOpen, openHelp, closeHelp, activeContent: helpContent } = useHelpModal({
    pricePerLiter: HELP_CONTENT.pricePerLiter?.modal,
    quantity: HELP_CONTENT.quantity?.modal,
    lactometerReading: HELP_CONTENT.lactometerReading?.modal,
    collectionPeriod: HELP_CONTENT.collectionPeriod?.modal,
    quinzenne: HELP_CONTENT.quinzenne?.modal,
  })

  const selectedFarmer = formData.farmerId ? farmers.find((f) => f.id === formData.farmerId) : null
  const selectedAgent = agentId ? agents.find((a) => a.id === agentId) : null

  const lookupFarmerByCode = (code: string) => {
    const trimmed = (code || '').trim()
    if (!trimmed) {
      handleFarmerSelect('')
      setErrors((e) => ({ ...e, farmerId: 'Enter a farmer code to look up.' }))
      return
    }
    setLookingUpFarmer(true)
    setErrors((e) => ({ ...e, farmerId: undefined }))
    const match = farmers.find((f) => (f.farmerCode ?? '').toString().toLowerCase() === trimmed.toLowerCase())
    setTimeout(() => {
      setLookingUpFarmer(false)
      if (match) {
        setFarmerCodeInput(match.farmerCode?.toString() ?? trimmed)
        handleFarmerSelect(match.id)
        toast.success(`Found: ${match.name}`)
      } else {
        handleFarmerSelect('')
        setErrors((e) => ({ ...e, farmerId: `No farmer found with code "${trimmed}". Check the code or search by name.` }))
        toast.error(`No farmer found with code "${trimmed}"`)
      }
    }, 300)
  }

  const lookupAgentByCode = (code: string) => {
    const trimmed = (code || '').trim()
    if (!trimmed) {
      setAgentId('')
      setErrors((e) => ({ ...e, farmerId: 'Enter an agent code to look up.' }))
      return
    }
    setLookingUpAgent(true)
    setErrors((e) => ({ ...e, farmerId: undefined }))
    const match = agents.find((a) => (a.displayId ?? '').toString().toLowerCase() === trimmed.toLowerCase())
    setTimeout(() => {
      setLookingUpAgent(false)
      if (match) {
        setAgentId(match.id)
        setAgentCodeInput(match.displayId?.toString() ?? trimmed)
        toast.success(`Found: ${match.name}`)
      } else {
        setAgentId('')
        toast.error(`No agent found with code "${trimmed}"`)
      }
    }, 300)
  }
  const [products, setProducts] = useState<Array<{id: string, name: string, price: number, stockQuantity?: number}>>([])
  const [farmerCollectionHistory, setFarmerCollectionHistory] = useState<FarmerCollectionHistory | null>(null)
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set())
  const [nextDayNumber, setNextDayNumber] = useState<number>(1)

  // Fetch real farmers data
  // Fetch MCC currency
  useEffect(() => {
    const fetchMccCurrency = async () => {
      if (!user?.mccId) return
      try {
        const token = localStorage.getItem('Gemurai_token')
        const response = await fetch(`/api/v1/mcc/setup?id=${user.mccId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data?.settings?.currency) {
            setMccCurrency(data.data.settings.currency)
          }
        }
      } catch (error) {
        console.error("Failed to fetch MCC currency:", error)
      }
    }
    fetchMccCurrency()
  }, [user?.mccId])

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const response = await fetch('/api/v1/mcc/farmers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const farmersList = data.data?.map((farmer: any) => ({
            id: farmer.id,
            name: farmer.name,
            farmerCode: farmer.farmerCode ?? null,
            phone: farmer.phone,
          })) || []
          setFarmers(farmersList)
        } else {
          console.error('Failed to fetch farmers:', response.statusText)
          // Fallback to mock data
          setFarmers([
            { id: "1", name: "NDAGIJIMANA JMV", farmerCode: "FC001" },
            { id: "2", name: "NDABABONYE Vicent", farmerCode: "FC002" },
          ])
        }
      } catch (error) {
        console.error('Error fetching farmers:', error)
        setFarmers([])
      }
    }

    fetchFarmers()
  }, [])

  useEffect(() => {
    if (!open) {
      setFarmerCodeInput('')
      setAgentCodeInput('')
    } else if (formData.farmerId && selectedFarmer?.farmerCode) {
      setFarmerCodeInput(selectedFarmer.farmerCode.toString())
    } else if (!formData.farmerId) {
      setFarmerCodeInput('')
    }
  }, [open, formData.farmerId, selectedFarmer?.farmerCode])

  useEffect(() => {
    if (!open) setAgentCodeInput('')
    else if (agentId && selectedAgent?.displayId) setAgentCodeInput(selectedAgent.displayId.toString())
    else if (!agentId) setAgentCodeInput('')
  }, [open, agentId, selectedAgent?.displayId])

  // Fetch agents (Umucunda) for "collected by agent" option
  useEffect(() => {
    if (!open) return
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/v1/mcc/agents', {
          headers: { Authorization: `Bearer ${localStorage.getItem('Gemurai_token')}` },
        })
        if (res.ok) {
          const data = await res.json()
          setAgents(data.data ?? [])
        }
      } catch (e) {
        console.error('Error fetching agents:', e)
        setAgents([])
      }
    }
    fetchAgents()
  }, [open])

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
    
    // Farmer is required only when farmer delivers directly
    // When agent delivers, farmer is optional (agent may collect from multiple anonymous sources)
    if (deliveredBy === 'farmer' && !formData.farmerId) {
      newErrors.farmerId = 'Please select a farmer'
    }
    
    if (deliveredBy === 'agent') {
      if (!agentId) {
        toast.error('Please select the agent (Umucunda) who brought this collection')
        return false
      }
      // Farmer is optional when agent delivers - no validation needed
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
      const collectionData: Record<string, unknown> = {
        farmerId: formData.farmerId,
        collectionDate: formData.collectionDate,
        period: formData.period,
        totalLiters: formData.totalLiters,
        unitPrice: formData.unitPrice,
        totalAmount: formData.totalAmount,
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
      // When an agent (Umucunda) brought the collection, send agentId. When farmer delivered, send null.
      collectionData.agentId = deliveredBy === 'agent' && agentId ? agentId : null

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
        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        console.error('API Error:', errorData)
        
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Failed to save collection'
        
        throw new Error(errorMessage)
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
      setDeliveredBy('farmer')
      setAgentId('')
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
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 bg-white border border-slate-200 shadow-xl rounded-3xl [&>button]:absolute [&>button]:right-5 [&>button]:top-5 [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:hover:bg-slate-100 [&>button]:rounded-full [&>button]:z-10 [&>button]:h-9 [&>button]:w-9">
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 pt-6 pb-6 text-white">
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-white tracking-tight">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white border border-white/20 shadow-lg">
                <Droplets className="h-6 w-6" />
              </div>
              Record Milk Collection
            </DialogTitle>
            <DialogDescription className="mt-2 text-slate-300 text-base">
              Enter daily milk quantities for the selected farmer. Totals and amounts are calculated automatically.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-[200px] bg-gradient-to-b from-slate-50/80 to-white">
          {/* Unified Form Layout */}
          <div className="space-y-6">
          {/* Who is delivering: Farmer (direct) or Agent (Umucunda) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                Who is delivering this collection?
              </Label>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveredBy"
                    checked={deliveredBy === 'farmer'}
                    onChange={() => { setDeliveredBy('farmer'); setAgentId(''); setAgentCodeInput('') }}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Farmer (direct)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveredBy"
                    checked={deliveredBy === 'agent'}
                    onChange={() => setDeliveredBy('agent')}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <UserCheck className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Agent (Umucunda)</span>
                </label>
              </div>
              {deliveredBy === 'agent' && (
                <div className="mt-2 space-y-3">
                  <Label className="text-xs font-medium text-gray-600">Agent (Umucunda) who brought this collection *</Label>
                  <p className="text-xs text-slate-500">Type the agent code and use the look-up icon, or search by name. Then select the farmer below.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div className="space-y-1.5 min-w-0">
                      <Label htmlFor="agentCodeLookup" className="text-xs font-medium text-gray-600">Agent code</Label>
                      <div className="relative">
                        <Input
                          id="agentCodeLookup"
                          type="text"
                          value={agentCodeInput}
                          onChange={(e) => {
                            const v = e.target.value
                            setAgentCodeInput(v)
                            if (!v.trim()) setAgentId('')
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), lookupAgentByCode(agentCodeInput))}
                          placeholder="e.g. A-001"
                          className="h-11 rounded-xl border-2 border-blue-200 pr-11"
                          disabled={lookingUpAgent}
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); lookupAgentByCode(agentCodeInput) }}
                          disabled={lookingUpAgent || !agentCodeInput.trim()}
                          title="Look up agent"
                          aria-label="Look up agent by code"
                          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-blue-100 hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {lookingUpAgent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label className="text-xs font-medium text-gray-600">Don&apos;t know the code? Search by name</Label>
                      <Select value={agentId} onValueChange={(v) => { setAgentId(v); const a = agents.find(x => x.id === v); if (a?.displayId) setAgentCodeInput(a.displayId.toString()); else if (!v) setAgentCodeInput('') }}>
                        <SelectTrigger className="h-11 rounded-xl border-2 border-blue-200">
                          <SelectValue placeholder="Search by name or code..." />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.displayId ? `${a.name} (Code: ${a.displayId}) — ${a.phone || ''}` : `${a.name}${a.phone ? ` — ${a.phone}` : ''}${a.email ? ` (${a.email})` : ''}`}
                            </SelectItem>
                          ))}
                          {agents.length === 0 && <SelectItem value="_none" disabled>No agents found</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {selectedAgent && (
                    <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-3 space-y-1.5 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Agent information (fetched)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div><span className="text-gray-500">Name</span><p className="font-medium text-gray-900">{selectedAgent.name || '—'}</p></div>
                        <div><span className="text-gray-500">Code</span><p className="font-medium text-gray-900">{selectedAgent.displayId || '—'}</p></div>
                        <div><span className="text-gray-500">Phone</span><p className="font-medium text-gray-900">{selectedAgent.phone || '—'}</p></div>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    Agent collections must be registered with the farmer code below.
                  </p>
                </div>
              )}
            </div>

          {/* Farmer Selection: code input + search by name on same row, then farmer info card */}
                <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>Farmer (for whom is this collection)</span>
                {deliveredBy === 'farmer' && <span className="text-red-500">*</span>}
                {deliveredBy === 'agent' && <span className="text-gray-400 text-xs font-normal">(optional)</span>}
              </Label>
              <p className="text-xs text-slate-500">
                {deliveredBy === 'agent' 
                  ? "Optional: Agents can collect from multiple farmers. Select a farmer to record this collection for a specific farmer, or leave empty if recording a bulk/unattributed collection."
                  : "Type the farmer code and use the look-up icon, or search by name."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div className="space-y-1.5 min-w-0">
                  <Label htmlFor="farmerCodeLookup" className="text-xs font-medium text-gray-600">Farmer code</Label>
                  <div className="relative">
                    <Input
                      id="farmerCodeLookup"
                      type="text"
                      value={farmerCodeInput}
                      onChange={(e) => {
                        const v = e.target.value
                        setFarmerCodeInput(v)
                        if (!v.trim()) handleFarmerSelect('')
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), lookupFarmerByCode(farmerCodeInput))}
                      placeholder="e.g. F-001"
                      className={cn(
                        "h-11 rounded-xl border-2 pr-11",
                        errors.farmerId ? "border-red-500 bg-red-50" : "border-blue-200"
                      )}
                      disabled={lookingUpFarmer}
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); lookupFarmerByCode(farmerCodeInput) }}
                      disabled={lookingUpFarmer || !farmerCodeInput.trim()}
                      title="Look up farmer"
                      aria-label="Look up farmer by code"
                      className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-blue-100 hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {lookingUpFarmer ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 min-w-0">
                  <Label className="text-xs font-medium text-gray-600">Don&apos;t know the code? Search by name</Label>
                  <SearchableSelect
                    value={formData.farmerId}
                    onValueChange={(v) => {
                      handleFarmerSelect(v)
                      const f = farmers.find(x => x.id === v)
                      if (f?.farmerCode) setFarmerCodeInput(f.farmerCode.toString())
                      else if (!v) setFarmerCodeInput('')
                    }}
                    options={farmers.map((farmer) => ({
                      value: farmer.id,
                      label: farmer.farmerCode ? `${farmer.name} (Code: ${farmer.farmerCode})` : farmer.name,
                    }))}
                    placeholder="Search by name or farmer code..."
                    searchPlaceholder="Type to search farmers..."
                    emptyText="No farmer found"
                    className={cn(
                      "h-11 rounded-xl text-sm",
                      errors.farmerId ? "!border-2 !border-red-500 !bg-red-50" : "!border-2 !border-blue-200"
                    )}
                  />
                </div>
              </div>
              {errors.farmerId && (
                <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.farmerId}
                </p>
              )}
              {selectedFarmer ? (
                (() => {
                  const displayCode = (selectedFarmer.farmerCode ?? farmerCodeInput) || '—'
                  return (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Farmer information (fetched)</p>
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">Code: {displayCode}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div><span className="text-gray-500">Name</span><p className="font-medium text-gray-900">{selectedFarmer.name || '—'}</p></div>
                        <div><span className="text-gray-500">Code</span><p className="font-medium text-gray-900">{displayCode}</p></div>
                        <div><span className="text-gray-500">Phone</span><p className="font-medium text-gray-900">{selectedFarmer.phone || '—'}</p></div>
                      </div>
                      <p className="text-xs text-emerald-700 pt-1">You can continue to enter daily milk quantities below.</p>
                    </div>
                  )
                })()
              ) : (
                <p className="text-xs text-slate-500">Enter a code and use the look-up icon, or search by name above.</p>
              )}
                </div>

            {/* Price and Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="unitPrice" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Price per Liter ({getCurrencySymbol(mccCurrency)})
                  <HelpTooltip
                    content={HELP_CONTENT.pricePerLiter?.tooltip || "Typical range: 200-350 RWF per liter"}
                    onLearnMore={() => openHelp("pricePerLiter")}
                    size="sm"
                  />
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
                  <span className="text-lg font-bold text-green-700">{formatCurrency(formData.totalAmount, mccCurrency)}</span>
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
          </div>

          <div className="flex items-center justify-between gap-4 px-6 py-5 border-t border-slate-200 bg-white rounded-b-3xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 px-4 py-2.5 font-medium"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || formData.totalLiters <= 0}
              className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-6 py-2.5 font-semibold shadow-lg shadow-sky-500/25 transition-all hover:shadow-sky-500/30 disabled:opacity-70"
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
          </div>
        </form>
      </DialogContent>

      {/* Contextual Help Modal */}
      <HelpModal open={isHelpOpen} onOpenChange={closeHelp} helpContent={helpContent} />
    </Dialog>
  )
}




