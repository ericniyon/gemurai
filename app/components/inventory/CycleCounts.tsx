"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Warehouse,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Play,
  Square,
  CheckSquare,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Settings,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface CycleCount {
  id: string
  name: string
  state: 'DRAFT' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  scheduledDate?: string
  completedAt?: string
  notes?: string
  warehouse?: {
    id: string
    name: string
    code: string
  }
  location?: {
    id: string
    name: string
    code: string
    locationType: string
  }
  product?: {
    id: string
    name: string
    internalReference: string
    image?: string
  }
  createdByUser?: {
    id: string
    name: string
  }
  completedByUser?: {
    id: string
    name: string
  }
  items: CycleCountItem[]
  _count: {
    items: number
  }
}

interface CycleCountItem {
  id: string
  productId: string
  expectedQuantity: number
  countedQuantity?: number
  variance?: number
  notes?: string
  product: {
    id: string
    name: string
    internalReference: string
    image?: string
  }
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
  locationType: string
  warehouseId: string
}

interface Product {
  id: string
  name: string
  internalReference: string
  image?: string
}

export function CycleCounts({ onRefresh }: { onRefresh?: () => void }) {
  const { user } = useAuth()
  const [cycleCounts, setCycleCounts] = useState<CycleCount[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stateFilter, setStateFilter] = useState<string>("all")
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCycleCount, setSelectedCycleCount] = useState<CycleCount | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    warehouseId: "",
    locationId: "",
    productId: "",
    scheduledDate: "",
    notes: ""
  })

  const [selectedItems, setSelectedItems] = useState<{
    productId: string
    expectedQuantity: number
    notes: string
  }[]>([])

  useEffect(() => {
    fetchCycleCounts()
    fetchWarehouses()
    fetchProducts()
  }, [])

  useEffect(() => {
    if (formData.warehouseId) {
      fetchLocations(formData.warehouseId)
    }
  }, [formData.warehouseId])

  const fetchCycleCounts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (stateFilter && stateFilter !== "all") params.append("state", stateFilter)
      if (warehouseFilter && warehouseFilter !== "all") params.append("warehouseId", warehouseFilter)

      const response = await fetch(`/api/v1/superadmin/cycle-counts?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCycleCounts(data.data)
      } else {
        setError("Failed to fetch cycle counts")
      }
    } catch (error) {
      setError("Failed to fetch cycle counts")
    } finally {
      setLoading(false)
    }
  }

  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/superadmin/warehouses", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setWarehouses(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error)
    }
  }

  const fetchLocations = async (warehouseId: string) => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/superadmin/locations?warehouseId=${warehouseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setLocations(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/superadmin/products", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    }
  }

  const createCycleCount = async () => {
    try {
      setCreateLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/superadmin/cycle-counts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          items: selectedItems
        })
      })

      if (response.ok) {
        setShowCreateModal(false)
        resetForm()
        fetchCycleCounts()
        onRefresh?.()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to create cycle count")
      }
    } catch (error) {
      setError("Failed to create cycle count")
    } finally {
      setCreateLoading(false)
    }
  }

  const updateCycleCountState = async (id: string, state: string) => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/superadmin/cycle-counts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ state })
      })

      if (response.ok) {
        fetchCycleCounts()
        onRefresh?.()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to update cycle count")
      }
    } catch (error) {
      setError("Failed to update cycle count")
    }
  }

  const deleteCycleCount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cycle count?")) return

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/superadmin/cycle-counts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchCycleCounts()
        onRefresh?.()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to delete cycle count")
      }
    } catch (error) {
      setError("Failed to delete cycle count")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      warehouseId: "",
      locationId: "",
      productId: "",
      scheduledDate: "",
      notes: ""
    })
    setSelectedItems([])
  }

  const addItem = () => {
    if (!formData.productId) return

    const product = products.find(p => p.id === formData.productId)
    if (!product) return

    const newItem = {
      productId: formData.productId,
      expectedQuantity: 0,
      notes: ""
    }

    setSelectedItems([...selectedItems, newItem])
    setFormData({ ...formData, productId: "" })
  }

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...selectedItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setSelectedItems(updatedItems)
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'DONE': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'DRAFT': return <Square className="h-4 w-4" />
      case 'IN_PROGRESS': return <Clock className="h-4 w-4" />
      case 'DONE': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      default: return <Square className="h-4 w-4" />
    }
  }

  const getProgressPercentage = (cycleCount: CycleCount) => {
    if (cycleCount.items.length === 0) return 0
    const countedItems = cycleCount.items.filter(item => item.countedQuantity !== null && item.countedQuantity !== undefined)
    return Math.round((countedItems.length / cycleCount.items.length) * 100)
  }

  const getVarianceColor = (variance?: number) => {
    if (variance === undefined || variance === null) return 'text-gray-500'
    if (variance > 0) return 'text-green-600'
    if (variance < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  const getVarianceIcon = (variance?: number) => {
    if (variance === undefined || variance === null) return null
    if (variance > 0) return <TrendingUp className="h-4 w-4" />
    if (variance < 0) return <TrendingDown className="h-4 w-4" />
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cycle Counts</h2>
          <p className="text-muted-foreground">
            Regular counting procedures to maintain inventory accuracy
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Cycle Count
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search cycle counts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="warehouse">Warehouse</Label>
              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All warehouses</SelectItem>
                  {warehouses?.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchCycleCounts} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Cycle Counts List */}
      <Card>
        <CardHeader>
          <CardTitle>Cycle Counts ({cycleCounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading cycle counts...
            </div>
          ) : cycleCounts.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cycle counts found</h3>
              <p className="text-gray-600 mb-4">
                Create your first cycle count to start inventory verification.
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Cycle Count
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {cycleCounts?.map((cycleCount) => (
                <Card key={cycleCount.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{cycleCount.name}</h3>
                        <Badge className={getStateColor(cycleCount.state)}>
                          {getStateIcon(cycleCount.state)}
                          {cycleCount.state.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        {cycleCount.warehouse && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Warehouse className="h-4 w-4" />
                            {cycleCount.warehouse.name}
                          </div>
                        )}
                        {cycleCount.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {cycleCount.location.name}
                          </div>
                        )}
                        {cycleCount.scheduledDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {new Date(cycleCount.scheduledDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{getProgressPercentage(cycleCount)}%</span>
                        </div>
                        <Progress value={getProgressPercentage(cycleCount)} className="h-2" />
                      </div>

                      {cycleCount.items.length > 0 && (
                        <div className="text-sm text-gray-600">
                          {cycleCount.items.length} items • 
                          {cycleCount.items.filter(item => item.countedQuantity !== null).length} counted
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCycleCount(cycleCount)
                          setShowDetailsModal(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {cycleCount.state === 'DRAFT' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCycleCountState(cycleCount.id, 'IN_PROGRESS')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteCycleCount(cycleCount.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {cycleCount.state === 'IN_PROGRESS' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCycleCountState(cycleCount.id, 'DONE')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Cycle Count Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Cycle Count</DialogTitle>
            <DialogDescription>
              Schedule a new inventory cycle count to verify stock accuracy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Monthly Count - Warehouse A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warehouse">Warehouse</Label>
                <Select value={formData.warehouseId} onValueChange={(value) => setFormData({ ...formData, warehouseId: value, locationId: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses?.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Select value={formData.locationId} onValueChange={(value) => setFormData({ ...formData, locationId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="product">Specific Product (Optional)</Label>
                <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.internalReference})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this cycle count..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Items Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Items to Count</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {selectedItems.length > 0 && (
                <div className="space-y-2">
                  {selectedItems.map((item, index) => {
                    const product = products.find(p => p.id === item.productId)
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{product?.name}</div>
                          <div className="text-sm text-gray-600">{product?.internalReference}</div>
                        </div>
                        <Input
                          type="number"
                          placeholder="Expected Qty"
                          value={item.expectedQuantity}
                          onChange={(e) => updateItem(index, 'expectedQuantity', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={createCycleCount} disabled={!formData.name || createLoading}>
              {createLoading ? "Creating..." : "Create Cycle Count"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cycle Count Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cycle Count Details</DialogTitle>
            <DialogDescription>
              View and manage cycle count items and progress.
            </DialogDescription>
          </DialogHeader>

          {selectedCycleCount && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <div className="font-medium">{selectedCycleCount.name}</div>
                </div>
                <div>
                  <Label>State</Label>
                  <Badge className={getStateColor(selectedCycleCount.state)}>
                    {getStateIcon(selectedCycleCount.state)}
                    {selectedCycleCount.state.replace('_', ' ')}
                  </Badge>
                </div>
                {selectedCycleCount.warehouse && (
                  <div>
                    <Label>Warehouse</Label>
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-4 w-4" />
                      {selectedCycleCount.warehouse.name}
                    </div>
                  </div>
                )}
                {selectedCycleCount.location && (
                  <div>
                    <Label>Location</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedCycleCount.location.name}
                    </div>
                  </div>
                )}
                {selectedCycleCount.scheduledDate && (
                  <div>
                    <Label>Scheduled Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedCycleCount.scheduledDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {selectedCycleCount.completedAt && (
                  <div>
                    <Label>Completed At</Label>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {new Date(selectedCycleCount.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              {selectedCycleCount.notes && (
                <div>
                  <Label>Notes</Label>
                  <div className="text-sm text-gray-600">{selectedCycleCount.notes}</div>
                </div>
              )}

              <div>
                <Label>Items ({selectedCycleCount.items.length})</Label>
                {selectedCycleCount.items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Expected</TableHead>
                        <TableHead>Counted</TableHead>
                        <TableHead>Variance</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCycleCount.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {item.product.image && (
                                <img 
                                  src={item.product.image} 
                                  alt={item.product.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">{item.product.name}</div>
                                <div className="text-sm text-gray-600">{item.product.internalReference}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.expectedQuantity}</TableCell>
                          <TableCell>
                            {item.countedQuantity !== null && item.countedQuantity !== undefined 
                              ? item.countedQuantity 
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            {item.variance !== null && item.variance !== undefined ? (
                              <div className={`flex items-center gap-1 ${getVarianceColor(item.variance)}`}>
                                {getVarianceIcon(item.variance)}
                                {item.variance > 0 ? '+' : ''}{item.variance}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {item.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No items in this cycle count
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 