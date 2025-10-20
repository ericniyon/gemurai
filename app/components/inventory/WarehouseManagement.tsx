"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Search, Warehouse as WarehouseIcon, MapPin, Package } from "lucide-react"
import { RWANDA_DISTRICTS } from "@/lib/utils/warehouse-utils"

interface Warehouse {
  id: string
  name: string
  code: string
  description?: string
  address?: string
  city?: string
  country?: string
  isActive: boolean
  isMain: boolean
  createdAt: string
  updatedAt: string
  locations: Location[]
  _count: {
    locations: number
    stockMoves: number
  }
}

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
}

interface WarehouseManagementProps {
  onRefresh?: () => void
}

export function WarehouseManagement({ onRefresh }: WarehouseManagementProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    district: "",
    country: "Rwanda",
    isMain: false
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/v1/superadmin/warehouses", {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        setWarehouses(data.warehouses || [])
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error)
      toast({
        title: "Error",
        description: "Failed to fetch warehouses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const generateWarehouseCode = async () => {
    try {
      setIsGeneratingCode(true)
      const response = await fetch("/api/v1/superadmin/warehouses/generate-code", {
        method: "POST",
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, code: data.code }))
        toast({
          title: "Success",
          description: "Warehouse code generated successfully",
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error generating warehouse code:", error)
      toast({
        title: "Error",
        description: "Failed to generate warehouse code",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    // Validate warehouse name
    if (!formData.name.trim()) {
      newErrors.name = "Warehouse name is required"
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Warehouse name must be at least 3 characters"
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Warehouse name must be less than 100 characters"
    }
    
    // Validate district
    if (!formData.district) {
      newErrors.district = "District is required"
    }
    
    // Validate description (optional but if provided, check length)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }
    
    // Validate code (optional but if provided, check format)
    if (formData.code && !/^[A-Z0-9]{2,10}$/.test(formData.code)) {
      newErrors.code = "Code must be 2-10 characters, letters and numbers only"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateWarehouse = async () => {
    // Clear previous errors
    setErrors({})
    
    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const warehouseData = {
        ...formData,
        city: formData.district, // Map district to city field
        code: formData.code || undefined // Let API auto-generate if empty
      }

      const response = await fetch("/api/v1/superadmin/warehouses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(warehouseData),
        credentials: "include"
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: "Warehouse created successfully",
        })
        fetchWarehouses()
        setIsCreateDialogOpen(false)
        setFormData({
          name: "",
          code: "",
          description: "",
          district: "",
          country: "Rwanda",
          isMain: false
        })
        setErrors({})
        onRefresh?.()
      } else {
        // Handle API validation errors
        if (data.errors) {
          setErrors(data.errors)
          toast({
            title: "Validation Error",
            description: "Please fix the errors in the form",
            variant: "destructive",
          })
        } else {
          throw new Error(data.message || "Failed to create warehouse")
        }
      }
    } catch (error) {
      console.error("Create warehouse error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create warehouse",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const searchString = searchTerm.toLowerCase()
    return (
      warehouse.name.toLowerCase().includes(searchString) ||
      warehouse.code.toLowerCase().includes(searchString) ||
      warehouse.description?.toLowerCase().includes(searchString) ||
      warehouse.city?.toLowerCase().includes(searchString)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading warehouses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Warehouses</h2>
          <p className="text-sm text-gray-600">
            Manage warehouses and their locations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (open) {
            setErrors({})
            setIsSubmitting(false)
          }
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Plus className="h-4 w-4" />
              Add Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <WarehouseIcon className="h-6 w-6 text-blue-600" />
              </div>
              <DialogTitle className="text-xl font-semibold">Create New Warehouse</DialogTitle>
              <DialogDescription className="text-gray-600">
                Add a new warehouse to your inventory system with all necessary details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <h3 className="font-medium text-gray-900">Basic Information</h3>
                </div>
                
                <div className="space-y-4">
                                <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Warehouse Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) {
                      setErrors({ ...errors, name: "" })
                    }
                  }}
                  placeholder="Enter warehouse name"
                  className={`h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                      Warehouse Code
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => {
                          setFormData({ ...formData, code: e.target.value })
                          if (errors.code) {
                            setErrors({ ...errors, code: "" })
                          }
                        }}
                        placeholder="Auto-generated (e.g., WH001)"
                        className={`h-11 border-gray-300 ${
                          errors.code ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                        }`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateWarehouseCode}
                        disabled={isGeneratingCode}
                        className="whitespace-nowrap h-11 px-4 border-gray-300 hover:bg-gray-50"
                      >
                        {isGeneratingCode ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                            Generating...
                          </div>
                        ) : (
                          "Generate"
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Leave empty to auto-generate or click Generate to create a new code
                    </p>
                    {errors.code && (
                      <p className="text-sm text-red-600 mt-1">{errors.code}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value })
                        if (errors.description) {
                          setErrors({ ...errors, description: "" })
                        }
                      }}
                      placeholder="Enter warehouse description (optional)"
                      rows={3}
                      className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        errors.description ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <h3 className="font-medium text-gray-900">Location Information</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-sm font-medium text-gray-700">
                      District <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => {
                        setFormData({ ...formData, district: value })
                        if (errors.district) {
                          setErrors({ ...errors, district: "" })
                        }
                      }}
                    >
                      <SelectTrigger className={`h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        errors.district ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {RWANDA_DISTRICTS.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.district && (
                      <p className="text-sm text-red-600 mt-1">{errors.district}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Rwanda"
                      readOnly
                      className="h-11 border-gray-300 bg-gray-50"
                    />
                  </div>
                </div>
                

              </div>

              {/* Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <h3 className="font-medium text-gray-900">Settings</h3>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="isMain" className="text-sm font-medium text-gray-700">
                      Set as Main Warehouse
                    </Label>
                    <p className="text-xs text-gray-500">
                      Main warehouses are used as default locations for inventory operations
                    </p>
                  </div>
                  <Switch
                    id="isMain"
                    checked={formData.isMain}
                    onCheckedChange={(checked) => setFormData({ ...formData, isMain: checked })}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                className="h-10 px-6"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateWarehouse} 
                disabled={!formData.name || !formData.district || isSubmitting}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Creating...
                  </div>
                ) : (
                  "Create Warehouse"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search warehouses by name, code, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Warehouses Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Warehouses ({filteredWarehouses.length})
              </CardTitle>
              <CardDescription className="text-gray-600">
                All warehouses in your inventory system
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-500">Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 bg-gray-50/30">
                  <TableHead className="font-semibold text-gray-700">Warehouse</TableHead>
                  <TableHead className="font-semibold text-gray-700">Code</TableHead>
                  <TableHead className="font-semibold text-gray-700">Location</TableHead>
                  <TableHead className="font-semibold text-gray-700">Zones</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarehouses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                          <WarehouseIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 font-medium">No warehouses found</p>
                          {searchTerm && (
                            <p className="text-sm text-gray-400">Try adjusting your search terms</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWarehouses.map((warehouse) => (
                    <TableRow key={warehouse.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                              <WarehouseIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">
                                {warehouse.name}
                              </p>
                              {warehouse.description && (
                                <p className="text-sm text-gray-500 truncate mt-1">
                                  {warehouse.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className="font-mono text-xs bg-gray-100 text-gray-700 border-gray-200">
                          {warehouse.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-900 truncate">
                              {warehouse.city || "No district"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {warehouse.country || "Rwanda"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {warehouse._count.locations} zones
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={warehouse.isActive ? "default" : "secondary"}
                            className={warehouse.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}
                          >
                            {warehouse.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {warehouse.isMain && (
                            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                              Main
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                          View Details
                        </Button>
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
