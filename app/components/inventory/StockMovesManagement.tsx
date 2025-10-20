"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Search,
  Repeat,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRightLeft,
  ArrowDown,
  ArrowUp,
  Package,
  Calendar as CalendarIcon,
  User,
  MapPin,
  Building2,
  ClipboardCheck,
  Spinner,
  Hash,
  Activity,
  Settings,
  Minus
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface StockMove {
  id: string
  moveType: string
  state: string
  quantity: number
  productId: string
  sourceLocationId?: string
  destinationLocationId?: string
  sourceWarehouseId?: string
  destinationWarehouseId?: string
  reference?: string
  notes?: string
  scheduledDate?: string
  completedDate?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  product: {
    id: string
    name: string
    code: string
    sku?: string
  }
  sourceLocation?: {
    id: string
    name: string
    code: string
  }
  destinationLocation?: {
    id: string
    name: string
    code: string
  }
  sourceWarehouse?: {
    id: string
    name: string
    code: string
  }
  destinationWarehouse?: {
    id: string
    name: string
    code: string
  }
}

interface Product {
  id: string
  name: string
  code: string
  sku?: string
}

interface Location {
  id: string
  name: string
  code: string
  warehouseId: string
  warehouse: {
    id: string
    name: string
    code: string
  }
}

interface StockMovesManagementProps {
  onRefresh?: () => void
}

export function StockMovesManagement({ onRefresh }: StockMovesManagementProps) {
  const { user } = useAuth()
  const [stockMoves, setStockMoves] = useState<StockMove[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMoveType, setSelectedMoveType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedMove, setSelectedMove] = useState<StockMove | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [formData, setFormData] = useState({
    moveType: "INTERNAL",
    productId: "",
    quantity: "",
    price: "",
    commissionFee: "",
    warehouseId: "",
    sourceLocationId: "",
    destinationLocationId: "",
    notes: "",
    scheduledDate: ""
  })
  const { toast } = useToast()
  const [createLoading, setCreateLoading] = useState(false)

  const moveTypes = [
    { value: "INTERNAL", label: "Internal Transfer", icon: ArrowRightLeft },
    { value: "INCOMING", label: "Incoming", icon: ArrowDown },
    { value: "OUTGOING", label: "Outgoing", icon: ArrowUp }
  ]

  const moveStatuses = [
    { value: "DRAFT", label: "Draft", color: "bg-gray-500" },
    { value: "CONFIRMED", label: "Confirmed", color: "bg-blue-500" },
    { value: "ASSIGNED", label: "Assigned", color: "bg-yellow-500" },
    { value: "DONE", label: "Done", color: "bg-green-500" },
    { value: "CANCELLED", label: "Cancelled", color: "bg-red-500" }
  ]

  const fetchStockMoves = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/v1/superadmin/stock-moves", {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        setStockMoves(data.stockMoves || [])
      } else {
        throw new Error(data.error || data.message)
      }
    } catch (error) {
      console.error("Error fetching stock moves:", error)
      toast({
        title: "Error",
        description: "Failed to fetch stock moves",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/v1/superadmin/products", {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/v1/superadmin/locations", {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        setLocations(data.locations || [])
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const fetchWarehouses = async () => {
    try {
      const response = await fetch("/api/v1/superadmin/warehouses", {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        const warehousesList = data.warehouses || []
        setWarehouses(warehousesList)
        
        // Auto-select the first warehouse if none is selected
        if (warehousesList.length > 0 && !formData.warehouseId) {
          setFormData(prev => ({
            ...prev,
            warehouseId: warehousesList[0].id
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error)
    }
  }

  useEffect(() => {
    fetchStockMoves()
    fetchProducts()
    fetchLocations()
    fetchWarehouses()
  }, [])

  const handleCreateStockMove = async () => {
    try {
      setCreateLoading(true)
      // Validate required fields
      if (!formData.productId) {
        toast({
          title: "Error",
          description: "Please select a product",
          variant: "destructive",
        })
        return
      }

      if (!formData.warehouseId) {
        toast({
          title: "Error",
          description: "Please select a warehouse",
          variant: "destructive",
        })
        return
      }

      if (!formData.quantity || parseInt(formData.quantity) <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid quantity",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/v1/superadmin/stock-moves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          price: formData.price ? parseFloat(formData.price) : undefined,
          commissionFee: formData.commissionFee ? parseFloat(formData.commissionFee) : undefined
        }),
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Stock move created successfully",
        })
        fetchStockMoves()
        setIsCreateDialogOpen(false)
        setFormData({
          moveType: "INTERNAL",
          productId: "",
          quantity: "",
          price: "",
          commissionFee: "",
          warehouseId: "",
          sourceLocationId: "",
          destinationLocationId: "",
          notes: "",
          scheduledDate: ""
        })
        onRefresh?.()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create stock move",
        variant: "destructive",
      })
    } finally {
      setCreateLoading(false)
    }
  }

  const handleUpdateStockMove = async () => {
    if (!selectedMove) return

    try {
      const response = await fetch(`/api/v1/superadmin/stock-moves/${selectedMove.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity)
        }),
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Stock move updated successfully",
        })
        fetchStockMoves()
        setIsEditDialogOpen(false)
        setSelectedMove(null)
        setFormData({
          moveType: "INTERNAL",
          productId: "",
          quantity: "",
          warehouseId: "",
          sourceLocationId: "",
          destinationLocationId: "",
          notes: "",
          scheduledDate: ""
        })
        onRefresh?.()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update stock move",
        variant: "destructive",
      })
    }
  }

  const handleDeleteStockMove = async (moveId: string) => {
    if (!confirm("Are you sure you want to delete this stock move?")) return

    try {
      const response = await fetch(`/api/v1/superadmin/stock-moves/${moveId}`, {
        method: "DELETE",
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Stock move deleted successfully",
        })
        fetchStockMoves()
        onRefresh?.()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete stock move",
        variant: "destructive",
      })
    }
  }

  const handleConfirmStockMove = async (moveId: string) => {
    try {
      const response = await fetch(`/api/v1/superadmin/stock-moves/confirm`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: moveId }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Stock move confirmed successfully",
        })
        fetchStockMoves()
        onRefresh?.()
      } else {
        throw new Error(data.error || data.message)
      }
    } catch (error) {
      console.error("Error confirming stock move:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm stock move",
        variant: "destructive",
      })
    }
  }

  const handleCancelStockMove = async (moveId: string) => {
    if (!confirm("Are you sure you want to cancel this stock move?")) return

    try {
      const response = await fetch(`/api/v1/superadmin/stock-moves/cancel`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: moveId }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Stock move cancelled successfully",
        })
        fetchStockMoves()
        onRefresh?.()
      } else {
        throw new Error(data.error || data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel stock move",
        variant: "destructive",
      })
    }
  }

  const handleEditStockMove = (move: StockMove) => {
    setSelectedMove(move)
    setFormData({
      moveType: move.moveType,
      productId: move.productId,
      quantity: move.quantity.toString(),
      warehouseId: move.sourceWarehouseId || "",
      sourceLocationId: move.sourceLocationId || "",
      destinationLocationId: move.destinationLocationId || "",
      reference: move.reference || "",
      notes: move.notes || "",
      scheduledDate: move.scheduledDate || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleViewStockMove = (move: StockMove) => {
    setSelectedMove(move)
    setIsViewDialogOpen(true)
  }

  const filteredStockMoves = stockMoves.filter((move) => {
    const searchString = searchTerm.toLowerCase()
    const matchesSearch = (
      move.product.name.toLowerCase().includes(searchString) ||
      move.product.code.toLowerCase().includes(searchString) ||
      move.reference?.toLowerCase().includes(searchString) ||
      move.notes?.toLowerCase().includes(searchString)
    )
    const matchesType = selectedMoveType === "all" || move.moveType === selectedMoveType
    const matchesStatus = selectedStatus === "all" || move.state === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getMoveTypeIcon = (moveType: string) => {
    const type = moveTypes.find(t => t.value === moveType)
    return type ? type.icon : ArrowRightLeft
  }

  const getEnhancedStatusBadge = (status: string) => {
    const statusInfo = moveStatuses.find(s => s.value === status)
    const statusConfig = {
      DRAFT: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        border: 'border-gray-200',
        icon: '📝',
        label: 'Draft'
      },
      CONFIRMED: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        border: 'border-blue-200',
        icon: '✅',
        label: 'Confirmed'
      },
      ASSIGNED: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        border: 'border-yellow-200',
        icon: '👤',
        label: 'Assigned'
      },
      DONE: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        border: 'border-green-200',
        icon: '✅',
        label: 'Done'
      },
      CANCELLED: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        border: 'border-red-200',
        icon: '❌',
        label: 'Cancelled'
      }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} hover:opacity-80 transition-opacity duration-200`}>
        <span className="text-xs">{config.icon}</span>
        <span>{config.label}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading stock moves...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Stock Moves</h2>
          <p className="text-sm text-gray-600">
            Manage stock transfers and movements
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          {user?.role !== "BRANCH_MANAGER" && (
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4" />
                Create Stock Move
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white rounded-xl border-0 shadow-2xl">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-2xl font-bold text-gray-900">Create New Stock Move</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">Create a new stock transfer or movement between locations</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Move Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="moveType" className="text-sm font-medium text-gray-700">Move Type *</Label>
                    <Select
                      value={formData.moveType}
                      onValueChange={(value) => setFormData({ ...formData, moveType: value })}
                    >
                      <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors">
                        <SelectValue placeholder="Select move type" />
                      </SelectTrigger>
                      <SelectContent>
                        {moveTypes.map((type) => {
                          const Icon = type.icon
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product" className="text-sm font-medium text-gray-700">Product *</Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) => setFormData({ ...formData, productId: value })}
                    >
                      <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-400" />
                              {product.name} ({product.code})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="Enter quantity"
                      className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate" className="text-sm font-medium text-gray-700">Scheduled Date</Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-11 w-full justify-start text-left font-normal bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors",
                            !formData.scheduledDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.scheduledDate ? format(new Date(formData.scheduledDate), "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl rounded-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined}
                          onSelect={(date) => {
                            setFormData({ ...formData, scheduledDate: date ? format(date, "yyyy-MM-dd") : "" })
                            setIsCalendarOpen(false)
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {/* Price & Commission Fee Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Enter price"
                      className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commissionFee" className="text-sm font-medium text-gray-700">Commission Fee</Label>
                    <Input
                      id="commissionFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.commissionFee}
                      onChange={e => setFormData({ ...formData, commissionFee: e.target.value })}
                      placeholder="Enter commission fee"
                      className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors"
                    />
                  </div>
                </div>
              </div>
              {formData.moveType === "INTERNAL" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sourceLocation" className="text-sm font-medium text-gray-700">Source Location *</Label>
                      <Select
                        value={formData.sourceLocationId}
                        onValueChange={(value) => setFormData({ ...formData, sourceLocationId: value })}
                      >
                        <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors">
                          <SelectValue placeholder="Select source location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                {location.name} ({location.warehouse.name})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destinationLocation" className="text-sm font-medium text-gray-700">Destination Location *</Label>
                      <Select
                        value={formData.destinationLocationId}
                        onValueChange={(value) => setFormData({ ...formData, destinationLocationId: value })}
                      >
                        <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors">
                          <SelectValue placeholder="Select destination location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                {location.name} ({location.warehouse.name})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              {formData.moveType === "INCOMING" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <ArrowDown className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Receiving Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warehouse" className="text-sm font-medium text-gray-700">Receiving Warehouse *</Label>
                      <Select
                        value={formData.warehouseId || ""}
                        onValueChange={(value) => setFormData({ ...formData, warehouseId: value })}
                      >
                        <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors">
                          <SelectValue placeholder="Select receiving warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(new Set(locations.map(l => l.warehouse.id))).map((warehouseId) => {
                            const warehouse = locations.find(l => l.warehouse.id === warehouseId)?.warehouse
                            return warehouse ? (
                              <SelectItem key={warehouseId} value={warehouseId}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-gray-400" />
                                  {warehouse.name}
                                </div>
                              </SelectItem>
                            ) : null
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destinationLocation" className="text-sm font-medium text-gray-700">Receiving Location *</Label>
                      <Select
                        value={formData.destinationLocationId}
                        onValueChange={(value) => setFormData({ ...formData, destinationLocationId: value })}
                      >
                        <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors">
                          <SelectValue placeholder="Select receiving location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations
                            .filter(location => !formData.warehouseId || location.warehouse.id === formData.warehouseId)
                            .filter(location => location.locationType === "RECEIVING" || location.locationType === "STORAGE")
                            .map((location) => (
                              <SelectItem key={location.id} value={location.id}>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  {location.name} ({location.warehouse.name}) - {location.locationType}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              {formData.moveType === "OUTGOING" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <ArrowUp className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Shipping Details</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sourceLocation" className="text-sm font-medium text-gray-700">Source Location *</Label>
                    <Select
                      value={formData.sourceLocationId}
                      onValueChange={(value) => setFormData({ ...formData, sourceLocationId: value })}
                    >
                      <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors">
                        <SelectValue placeholder="Select source location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations
                          .filter(location => location.locationType === "STORAGE" || location.locationType === "PICKING")
                          .map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                {location.name} ({location.warehouse.name}) - {location.locationType}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Additional Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <ClipboardCheck className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Enter additional notes or instructions"
                    rows={3}
                    className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t border-gray-200 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="h-10 px-6 rounded-lg">
                Cancel
              </Button>
              <Button onClick={handleCreateStockMove} disabled={createLoading} className="h-10 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg">
                {createLoading ? (
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : (
                  <Plus className="h-4 w-4" />
                )} 
                {createLoading ? "Creating..." : "Create Stock Move"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search moves..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <Select value={selectedMoveType} onValueChange={setSelectedMoveType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {moveTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {moveStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Moves Table */}
      <Card className="border-0 bg-white rounded-xl shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Repeat className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Stock Moves
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Track and manage inventory movements across locations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                {filteredStockMoves.length} Total
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                  <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-gray-100 rounded">
                        <ArrowRightLeft className="h-4 w-4 text-gray-600" />
                      </div>
                      Type
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-gray-100 rounded">
                        <Package className="h-4 w-4 text-gray-600" />
                      </div>
                      Product
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                    <div className="flex items-center justify-center gap-2">
                      <div className="p-1 bg-gray-100 rounded">
                        <Hash className="h-4 w-4 text-gray-600" />
                      </div>
                      Quantity
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-gray-100 rounded">
                        <ArrowUp className="h-4 w-4 text-gray-600" />
                      </div>
                      From
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-gray-100 rounded">
                        <ArrowDown className="h-4 w-4 text-gray-600" />
                      </div>
                      To
                    </div>
                  </TableHead>
                  <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                    <div className="flex items-center justify-center gap-2">
                      <div className="p-1 bg-gray-100 rounded">
                        <Activity className="h-4 w-4 text-gray-600" />
                      </div>
                      Status
                    </div>
                  </TableHead>
                  {user?.role !== "BRANCH_MANAGER" && (
                    <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                      <div className="flex items-center justify-center gap-2">
                        <div className="p-1 bg-gray-100 rounded">
                          <Settings className="h-4 w-4 text-gray-600" />
                        </div>
                        Actions
                      </div>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStockMoves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={user?.role === "BRANCH_MANAGER" ? 6 : 7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <Repeat className="h-12 w-12 text-gray-300" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stock Moves Found</h3>
                          <p className="text-gray-500 mb-1">No stock movements match your current filters</p>
                          {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search criteria</p>}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStockMoves.map((move, index) => {
                    const MoveTypeIcon = getMoveTypeIcon(move.moveType)
                    return (
                      <TableRow 
                        key={move.id} 
                        className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              move.moveType === 'INCOMING' ? 'bg-green-100' :
                              move.moveType === 'OUTGOING' ? 'bg-red-100' :
                              'bg-blue-100'
                            }`}>
                              <MoveTypeIcon className={`h-4 w-4 ${
                                move.moveType === 'INCOMING' ? 'text-green-600' :
                                move.moveType === 'OUTGOING' ? 'text-red-600' :
                                'text-blue-600'
                              }`} />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 text-sm">
                                {moveTypes.find(t => t.value === move.moveType)?.label}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-900 text-base">{move.product.name}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                                {move.product.code}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="p-1 bg-blue-100 rounded">
                              <Hash className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-bold text-blue-700 text-base">{move.quantity}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {move.sourceLocation ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-orange-100 rounded">
                                  <MapPin className="h-3 w-3 text-orange-600" />
                                </div>
                                <p className="font-medium text-gray-900 text-sm">{move.sourceLocation.name}</p>
                              </div>
                              {move.sourceWarehouse && (
                                <p className="text-xs text-gray-500 ml-5">{move.sourceWarehouse.name}</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-gray-100 rounded">
                                <Minus className="h-3 w-3 text-gray-400" />
                              </div>
                              <span className="text-gray-400 text-sm">No source</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {move.destinationLocation ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-green-100 rounded">
                                  <MapPin className="h-3 w-3 text-green-600" />
                                </div>
                                <p className="font-medium text-gray-900 text-sm">{move.destinationLocation.name}</p>
                              </div>
                              {move.destinationWarehouse && (
                                <p className="text-xs text-gray-500 ml-5">{move.destinationWarehouse.name}</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-gray-100 rounded">
                                <Minus className="h-3 w-3 text-gray-400" />
                              </div>
                              <span className="text-gray-400 text-sm">No destination</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          {getEnhancedStatusBadge(move.state)}
                        </TableCell>
                        {user?.role !== "BRANCH_MANAGER" && (
                          <TableCell className="px-6 py-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                >
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-xl rounded-lg">
                                <DropdownMenuItem 
                                  onClick={() => handleViewStockMove(move)}
                                  className="cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Eye className="mr-3 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {move.state === "DRAFT" && (
                                  <>
                                    <DropdownMenuItem 
                                      onClick={() => handleEditStockMove(move)}
                                      className="cursor-pointer hover:bg-green-50 hover:text-green-600"
                                    >
                                      <Edit className="mr-3 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleConfirmStockMove(move.id)}
                                      className="cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <CheckCircle className="mr-3 h-4 w-4" />
                                      Confirm
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {["DRAFT", "CONFIRMED"].includes(move.state) && (
                                  <DropdownMenuItem 
                                    onClick={() => handleCancelStockMove(move.id)}
                                    className="cursor-pointer hover:bg-yellow-50 hover:text-yellow-600"
                                  >
                                    <XCircle className="mr-3 h-4 w-4" />
                                    Cancel
                                  </DropdownMenuItem>
                                )}
                                {move.state === "DRAFT" && (
                                  <DropdownMenuItem
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                                    onClick={() => handleDeleteStockMove(move.id)}
                                  >
                                    <Trash2 className="mr-3 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Stock Move Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Stock Move</DialogTitle>
            <DialogDescription>
              Update stock move details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-moveType">Move Type</Label>
                <Select
                  value={formData.moveType}
                  onValueChange={(value) => setFormData({ ...formData, moveType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moveTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product">Product</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-scheduledDate">Scheduled Date</Label>
                <Input
                  id="edit-scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>
            </div>
            {formData.moveType === "INTERNAL" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sourceLocation">Source Location</Label>
                  <Select
                    value={formData.sourceLocationId}
                    onValueChange={(value) => setFormData({ ...formData, sourceLocationId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} ({location.warehouse.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-destinationLocation">Destination Location</Label>
                  <Select
                    value={formData.destinationLocationId}
                    onValueChange={(value) => setFormData({ ...formData, destinationLocationId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} ({location.warehouse.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {formData.moveType === "INCOMING" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-warehouse">Receiving Warehouse</Label>
                  <Select
                    value={formData.warehouseId || ""}
                    onValueChange={(value) => setFormData({ ...formData, warehouseId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select receiving warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(locations.map(l => l.warehouse.id))).map((warehouseId) => {
                        const warehouse = locations.find(l => l.warehouse.id === warehouseId)?.warehouse
                        return warehouse ? (
                          <SelectItem key={warehouseId} value={warehouseId}>
                            {warehouse.name}
                          </SelectItem>
                        ) : null
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-destinationLocation">Receiving Location</Label>
                  <Select
                    value={formData.destinationLocationId}
                    onValueChange={(value) => setFormData({ ...formData, destinationLocationId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select receiving location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations
                        .filter(location => !formData.warehouseId || location.warehouse.id === formData.warehouseId)
                        .filter(location => location.locationType === "RECEIVING" || location.locationType === "STORAGE")
                        .map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name} ({location.warehouse.name}) - {location.locationType}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {formData.moveType === "OUTGOING" && (
              <div className="space-y-2">
                <Label htmlFor="edit-sourceLocation">Source Location</Label>
                <Select
                  value={formData.sourceLocationId}
                  onValueChange={(value) => setFormData({ ...formData, sourceLocationId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.warehouse.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-reference">Reference</Label>
              <Input
                id="edit-reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Enter reference number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter notes"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStockMove}>
              Update Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Stock Move Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Stock Move Details</DialogTitle>
          </DialogHeader>
          {selectedMove && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Move Type</Label>
                  <p className="mt-1">
                    {moveTypes.find(t => t.value === selectedMove.moveType)?.label}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">
                    {getEnhancedStatusBadge(selectedMove.state)}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Product</Label>
                <p className="mt-1">{selectedMove.product.name} ({selectedMove.product.code})</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Quantity</Label>
                  <p className="mt-1 font-medium">{selectedMove.quantity}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Reference</Label>
                  <p className="mt-1">{selectedMove.reference || "-"}</p>
                </div>
              </div>
              {selectedMove.moveType === "INTERNAL" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">From</Label>
                    <p className="mt-1">
                      {selectedMove.sourceLocation?.name} ({selectedMove.sourceWarehouse?.name})
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">To</Label>
                    <p className="mt-1">
                      {selectedMove.destinationLocation?.name} ({selectedMove.destinationWarehouse?.name})
                    </p>
                  </div>
                </div>
              )}
              {selectedMove.moveType === "INCOMING" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Receiving Warehouse</Label>
                    <p className="mt-1">
                      {selectedMove.destinationWarehouse?.name || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Receiving Location</Label>
                    <p className="mt-1">
                      {selectedMove.destinationLocation?.name || "Not specified"}
                    </p>
                  </div>
                </div>
              )}
              {selectedMove.moveType === "OUTGOING" && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Source Location</Label>
                  <p className="mt-1">
                    {selectedMove.sourceLocation?.name} ({selectedMove.sourceWarehouse?.name})
                  </p>
                </div>
              )}
              {selectedMove.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="mt-1">{selectedMove.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="mt-1">{new Date(selectedMove.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                  <p className="mt-1">{new Date(selectedMove.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 