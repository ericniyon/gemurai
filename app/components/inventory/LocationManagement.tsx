"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
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
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  MapPin, 
  Search,
  Building2,
  Eye,
  Package,
  Loader2,
  Hash
} from "lucide-react"

interface Location {
  id: string
  name: string
  code: string
  description?: string
  locationType: string
  isActive: boolean
  maxCapacity?: number
  currentCapacity?: number
  barcode?: string
  warehouseId: string
  warehouse: {
    id: string
    name: string
    code: string
  }
  createdAt: string
  updatedAt: string
  _count: {
    stockQuantities: number
  }
}

interface Warehouse {
  id: string
  name: string
  code: string
  isActive: boolean
}

interface LocationManagementProps {
  onRefresh?: () => void
}

export function LocationManagement({ onRefresh }: LocationManagementProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    locationType: "STORAGE",
    warehouseId: "",
    maxCapacity: "",
    isActive: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const { toast } = useToast()

  const locationTypes = [
    { value: "STORAGE", label: "Storage" },
    { value: "RECEIVING", label: "Receiving" },
    { value: "SHIPPING", label: "Shipping" },
    { value: "TRANSIT", label: "Transit" },
    { value: "PICKING", label: "Picking" },
    { value: "PRODUCTION", label: "Production" },
    { value: "SCRAP", label: "Scrap" }
  ]

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/v1/superadmin/locations", {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        setLocations(data.locations || [])
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
      toast({
        title: "Error",
        description: "Failed to fetch locations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  const generateLocationCode = async (warehouseId: string) => {
    console.log("🔍 Generating location code for warehouse:", warehouseId)
    
    if (!warehouseId) {
      setErrors({ warehouseId: "Please select a warehouse first" })
      return
    }

    try {
      setIsGeneratingCode(true)
      setErrors({})

      console.log("📡 Making API request to generate code...")
      const response = await fetch("/api/v1/superadmin/locations/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ warehouseId }),
        credentials: "include"
      })

      console.log("📥 Response status:", response.status)
      const data = await response.json()
      console.log("📥 Response data:", data)

      if (data.success) {
        console.log("✅ Code generated successfully:", data.code)
        setFormData(prev => ({ ...prev, code: data.code }))
      } else {
        throw new Error(data.error || "Failed to generate code")
      }
    } catch (error) {
      console.error("❌ Error generating location code:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate location code",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingCode(false)
    }
  }

  useEffect(() => {
    fetchLocations()
    fetchWarehouses()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    } else if (formData.name.length > 50) {
      newErrors.name = "Name must be less than 50 characters"
    }

    if (!formData.code.trim()) {
      newErrors.code = "Code is required"
    } else if (formData.code.length < 3) {
      newErrors.code = "Code must be at least 3 characters"
    } else if (formData.code.length > 20) {
      newErrors.code = "Code must be less than 20 characters"
    }

    if (!formData.warehouseId) {
      newErrors.warehouseId = "Warehouse is required"
    }

    if (!formData.locationType) {
      newErrors.locationType = "Location type is required"
    }

    if (formData.maxCapacity && (isNaN(Number(formData.maxCapacity)) || Number(formData.maxCapacity) < 0)) {
      newErrors.maxCapacity = "Max capacity must be a positive number"
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateLocation = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      setErrors({})

      const response = await fetch("/api/v1/superadmin/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null
        }),
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Location created successfully",
        })
        fetchLocations()
        setIsCreateDialogOpen(false)
        setFormData({
          name: "",
          code: "",
          description: "",
          locationType: "STORAGE",
          warehouseId: "",
          maxCapacity: "",
          isActive: true
        })
        setErrors({})
        onRefresh?.()
      } else {
        throw new Error(data.error || data.message)
      }
    } catch (error) {
      console.error("Error creating location:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create location",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateLocation = async () => {
    if (!editingLocation) return

    try {
      const response = await fetch(`/api/v1/superadmin/locations/${editingLocation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null
        }),
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Location updated successfully",
        })
        fetchLocations()
        setIsEditDialogOpen(false)
        setEditingLocation(null)
        setFormData({
          name: "",
          code: "",
          description: "",
          locationType: "STORAGE",
          warehouseId: "",
          maxCapacity: "",
          isActive: true
        })
        onRefresh?.()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update location",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return

    try {
      const response = await fetch(`/api/v1/superadmin/locations/${locationId}`, {
        method: "DELETE",
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Location deleted successfully",
        })
        fetchLocations()
        onRefresh?.()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete location",
        variant: "destructive",
      })
    }
  }

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      code: location.code,
      description: location.description || "",
      locationType: location.locationType,
      warehouseId: location.warehouseId,
      maxCapacity: location.maxCapacity?.toString() || "",
      isActive: location.isActive
    })
    setIsEditDialogOpen(true)
  }

  const filteredLocations = locations.filter((location) => {
    const searchString = searchTerm.toLowerCase()
    const matchesSearch = (
      location.name.toLowerCase().includes(searchString) ||
      location.code.toLowerCase().includes(searchString) ||
      location.description?.toLowerCase().includes(searchString) ||
      location.warehouse.name.toLowerCase().includes(searchString)
    )
    const matchesWarehouse = selectedWarehouse === "all" || location.warehouseId === selectedWarehouse
    return matchesSearch && matchesWarehouse
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Zones</h2>
          <p className="text-sm text-gray-600">
            Manage zones within warehouses
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (open) {
            setErrors({})
            setIsSubmitting(false)
            setIsGeneratingCode(false)
          }
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Plus className="h-4 w-4" />
              Add Zone
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <DialogTitle className="text-xl font-semibold">Create New Zone</DialogTitle>
              <DialogDescription className="text-gray-600">
                Add a new zone to your warehouse
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Zone Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (errors.name) setErrors({ ...errors, name: "" })
                      }}
                      placeholder="Enter zone name"
                      className={errors.name ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-medium">
                      Zone Code <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => {
                          setFormData({ ...formData, code: e.target.value })
                          if (errors.code) setErrors({ ...errors, code: "" })
                        }}
                        placeholder="Auto-generated"
                        className={errors.code ? "border-red-500 focus:border-red-500" : ""}
                        readOnly
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log("🔘 Generate button clicked!")
                          console.log("🏭 Current warehouseId:", formData.warehouseId)
                          generateLocationCode(formData.warehouseId)
                        }}
                        disabled={!formData.warehouseId || isGeneratingCode}
                        className="whitespace-nowrap"
                      >
                        {isGeneratingCode ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Hash className="h-4 w-4" />
                        )}
                        {isGeneratingCode ? "Generating..." : "Generate"}
                      </Button>
                    </div>
                    {errors.code && (
                      <p className="text-sm text-red-500">{errors.code}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value })
                      if (errors.description) setErrors({ ...errors, description: "" })
                    }}
                    placeholder="Enter zone description (optional)"
                    rows={3}
                    className={errors.description ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Warehouse & Type Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Package className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Warehouse & Type</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warehouse" className="text-sm font-medium">
                      Warehouse <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.warehouseId}
                      onValueChange={(value) => {
                        console.log("🏭 Warehouse selected:", value)
                        setFormData({ ...formData, warehouseId: value, code: "" })
                        if (errors.warehouseId) setErrors({ ...errors, warehouseId: "" })
                      }}
                    >
                      <SelectTrigger className={errors.warehouseId ? "border-red-500 focus:border-red-500" : ""}>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} ({warehouse.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.warehouseId && (
                      <p className="text-sm text-red-500">{errors.warehouseId}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">
                      Zone Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.locationType}
                      onValueChange={(value) => {
                        setFormData({ ...formData, locationType: value })
                        if (errors.locationType) setErrors({ ...errors, locationType: "" })
                      }}
                    >
                      <SelectTrigger className={errors.locationType ? "border-red-500 focus:border-red-500" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.locationType && (
                      <p className="text-sm text-red-500">{errors.locationType}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Additional Details</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxCapacity" className="text-sm font-medium">
                      Max Capacity
                    </Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      value={formData.maxCapacity}
                      onChange={(e) => {
                        setFormData({ ...formData, maxCapacity: e.target.value })
                        if (errors.maxCapacity) setErrors({ ...errors, maxCapacity: "" })
                      }}
                      placeholder="Maximum capacity"
                      className={errors.maxCapacity ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {errors.maxCapacity && (
                      <p className="text-sm text-red-500">{errors.maxCapacity}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateLocation}
                disabled={isSubmitting || !formData.code}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Zone"
                )}
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
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
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
          </div>
        </CardContent>
      </Card>

      {/* Zones Table */}
      <Card>
        <CardHeader>
          <CardTitle>Zones ({filteredLocations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <MapPin className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No zones found</p>
                        {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLocations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{location.name}</p>
                          {location.description && (
                            <p className="text-sm text-gray-500">{location.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{location.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span>{location.warehouse.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {locationTypes.find(t => t.value === location.locationType)?.label || location.locationType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {location.currentCapacity || 0} / {location.maxCapacity || "∞"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={location.isActive ? "bg-green-500" : "bg-gray-500"}>
                          {location.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditLocation(location)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteLocation(location.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
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

      {/* Edit Location Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Edit className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">Edit Zone</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update zone details and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Building2 className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-medium">
                    Zone Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Zone name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code" className="text-sm font-medium">
                    Zone Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Zone code"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Zone description"
                  rows={3}
                />
              </div>
            </div>

            {/* Warehouse & Type Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Package className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Warehouse & Type</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-warehouse" className="text-sm font-medium">
                    Warehouse <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.warehouseId}
                    onValueChange={(value) => setFormData({ ...formData, warehouseId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type" className="text-sm font-medium">
                    Zone Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.locationType}
                    onValueChange={(value) => setFormData({ ...formData, locationType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Eye className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Additional Details</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-maxCapacity" className="text-sm font-medium">
                    Max Capacity
                  </Label>
                  <Input
                    id="edit-maxCapacity"
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                    placeholder="Maximum capacity"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive" className="text-sm font-medium">Active</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLocation} className="bg-blue-600 hover:bg-blue-700">
              Update Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 