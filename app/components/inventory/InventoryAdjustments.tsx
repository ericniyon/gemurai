"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Textarea } from "@/components/ui/textarea"
import { 
  Search,
  Plus,
  MoreHorizontal, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Building2,
  MapPin,
  Package,
  RefreshCw,
  History,
  User
} from "lucide-react"

interface InventoryAdjustment {
  id: string
  productId: string
  warehouseId: string | null
  locationId: string | null
  quantity: number
  adjustmentType: 'INCREASE' | 'DECREASE' | 'SET'
  reason: string
  notes: string | null
  state: 'DRAFT' | 'APPROVED' | 'DONE' | 'CANCELLED'
  createdBy: string
  approvedBy: string | null
  createdAt: string
  approvedAt: string | null
  product: {
    id: string
    name: string
    image: string | null
  }
  warehouse: {
    id: string
    name: string
    code: string
  } | null
  location: {
    id: string
    name: string
    code: string
  } | null
  createdByUser: {
    id: string
    name: string
  }
  approvedByUser: {
    id: string
    name: string
  } | null
}

interface Product {
  id: string
  name: string
  image: string | null
}

interface Warehouse {
  id: string
  name: string
  code: string
}

interface Location {
  id: string
  name: string
  code: string
  warehouseId: string
}

interface InventoryAdjustmentsProps {
  onRefresh?: () => void
}

interface AdjustmentStats {
  totalAdjustments: number
  pendingAdjustments: number
  approvedAdjustments: number
  cancelledAdjustments: number
  totalQuantityAdjusted: number
}

export function InventoryAdjustments({ onRefresh }: InventoryAdjustmentsProps) {
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all")
  const [selectedState, setSelectedState] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [stats, setStats] = useState<AdjustmentStats>({
    totalAdjustments: 0,
    pendingAdjustments: 0,
    approvedAdjustments: 0,
    cancelledAdjustments: 0,
    totalQuantityAdjusted: 0
  })
  
  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    locationId: '',
    quantity: '',
    adjustmentType: 'INCREASE' as 'INCREASE' | 'DECREASE' | 'SET',
    reason: '',
    notes: ''
  })
  
  const { toast } = useToast()

  const fetchAdjustments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/v1/superadmin/inventory-adjustments", {
        credentials: "include"
      })
      
      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in as a super admin to access inventory adjustments",
          variant: "destructive",
        })
        return
      }
      
      const data = await response.json()
      if (data.success) {
        setAdjustments(data.adjustments || [])
        calculateStats(data.adjustments || [])
      } else {
        throw new Error(data.message || data.error)
      }
    } catch (error) {
      console.error("Error fetching inventory adjustments:", error)
      toast({
        title: "Error",
        description: "Failed to fetch inventory adjustments",
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

  const fetchWarehouses = async () => {
    try {
      const response = await fetch("/api/v1/superadmin/warehouses", {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        setWarehouses(data.warehouses || [])
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error)
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

  const calculateStats = (adjustmentData: InventoryAdjustment[]) => {
    const totalAdjustments = adjustmentData.length
    const pendingAdjustments = adjustmentData.filter(adj => adj.state === 'DRAFT').length
    const approvedAdjustments = adjustmentData.filter(adj => adj.state === 'APPROVED' || adj.state === 'DONE').length
    const cancelledAdjustments = adjustmentData.filter(adj => adj.state === 'CANCELLED').length
    const totalQuantityAdjusted = adjustmentData
      .filter(adj => adj.state === 'APPROVED' || adj.state === 'DONE')
      .reduce((sum, adj) => sum + adj.quantity, 0)

    setStats({
      totalAdjustments,
      pendingAdjustments,
      approvedAdjustments,
      cancelledAdjustments,
      totalQuantityAdjusted
    })
  }

  useEffect(() => {
    fetchAdjustments()
    fetchProducts()
    fetchWarehouses()
    fetchLocations()
  }, [])

  const handleRefresh = () => {
    fetchAdjustments()
    onRefresh?.()
  }

  const handleCreateAdjustment = async () => {
    try {
      if (!formData.productId || !formData.quantity || !formData.reason) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/v1/superadmin/inventory-adjustments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: formData.productId,
          warehouseId: formData.warehouseId || null,
          locationId: formData.locationId || null,
          quantity: parseInt(formData.quantity),
          adjustmentType: formData.adjustmentType,
          reason: formData.reason,
          notes: formData.notes || null
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Inventory adjustment created successfully",
        })
        setIsCreateDialogOpen(false)
        setFormData({
          productId: '',
          warehouseId: '',
          locationId: '',
          quantity: '',
          adjustmentType: 'INCREASE',
          reason: '',
          notes: ''
        })
        fetchAdjustments()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error creating inventory adjustment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create inventory adjustment",
        variant: "destructive",
      })
    }
  }

  const handleApproveAdjustment = async (adjustmentId: string) => {
    try {
      const response = await fetch(`/api/v1/superadmin/inventory-adjustments/${adjustmentId}/approve`, {
        method: "POST",
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Inventory adjustment approved successfully",
        })
        fetchAdjustments()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error approving adjustment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve adjustment",
        variant: "destructive",
      })
    }
  }

  const getAdjustmentTypeIcon = (type: string) => {
    switch (type) {
      case 'INCREASE':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'DECREASE':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'SET':
        return <ClipboardCheck className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'DRAFT':
        return 'bg-yellow-500'
      case 'APPROVED':
        return 'bg-green-500'
      case 'DONE':
        return 'bg-blue-500'
      case 'CANCELLED':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const filteredAdjustments = adjustments.filter((adjustment) => {
    const searchString = searchTerm.toLowerCase()
    const matchesSearch = (
      adjustment.product.name.toLowerCase().includes(searchString) ||
      adjustment.reason.toLowerCase().includes(searchString) ||
      adjustment.createdByUser.name.toLowerCase().includes(searchString)
    )
    const matchesWarehouse = selectedWarehouse === "all" || adjustment.warehouseId === selectedWarehouse
    const matchesState = selectedState === "all" || adjustment.state === selectedState

    return matchesSearch && matchesWarehouse && matchesState
  })

  const filteredLocations = locations.filter(location => 
    !formData.warehouseId || location.warehouseId === formData.warehouseId
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading inventory adjustments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Inventory Adjustments</h2>
          <p className="text-sm text-gray-600">
            Make corrections to stock quantities when physical counts don't match system records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Inventory Adjustment</DialogTitle>
                <DialogDescription>
                  Create a new inventory adjustment to correct stock quantities
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product">Product *</Label>
                    <Select value={formData.productId} onValueChange={(value) => setFormData({...formData, productId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="warehouse">Warehouse</Label>
                    <Select value={formData.warehouseId} onValueChange={(value) => setFormData({...formData, warehouseId: value, locationId: ''})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All warehouses</SelectItem>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Select value={formData.locationId} onValueChange={(value) => setFormData({...formData, locationId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All locations</SelectItem>
                        {filteredLocations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="adjustmentType">Adjustment Type *</Label>
                    <Select value={formData.adjustmentType} onValueChange={(value: 'INCREASE' | 'DECREASE' | 'SET') => setFormData({...formData, adjustmentType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCREASE">Increase</SelectItem>
                        <SelectItem value="DECREASE">Decrease</SelectItem>
                        <SelectItem value="SET">Set to</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason *</Label>
                  <Input
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="e.g., Physical count discrepancy, Damaged goods, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes (optional)"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAdjustment}>
                    Create Adjustment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAdjustments}</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAdjustments}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedAdjustments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cancelledAdjustments}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Units Adjusted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuantityAdjusted}</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search adjustments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="All warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All warehouses</SelectItem>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adjustments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Adjustments ({filteredAdjustments.length})</CardTitle>
          <CardDescription>
            Manage inventory adjustments and stock corrections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdjustments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardCheck className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No inventory adjustments found</p>
                        {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdjustments.map((adjustment) => (
                    <TableRow key={adjustment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{adjustment.product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {adjustment.warehouse && (
                            <div className="flex items-center gap-1 text-sm">
                              <Building2 className="h-3 w-3 text-gray-400" />
                              <span>{adjustment.warehouse.name}</span>
                            </div>
                          )}
                          {adjustment.location && (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span>{adjustment.location.name}</span>
                            </div>
                          )}
                          {!adjustment.warehouse && !adjustment.location && (
                            <span className="text-sm text-gray-500">All locations</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAdjustmentTypeIcon(adjustment.adjustmentType)}
                          <span className="capitalize">{adjustment.adjustmentType.toLowerCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{adjustment.quantity}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{adjustment.reason}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{adjustment.createdByUser.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStateColor(adjustment.state)}>
                          {adjustment.state}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(adjustment.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {adjustment.state === 'DRAFT' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleApproveAdjustment(adjustment.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                                                 <DropdownMenuItem>
                                   <XCircle className="mr-2 h-4 w-4" />
                                   Cancel
                                 </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 