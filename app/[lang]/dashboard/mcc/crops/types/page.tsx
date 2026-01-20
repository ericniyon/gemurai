"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { 
  Database, 
  Plus, 
  RefreshCw, 
  Loader2,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CropTypesPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  
  const [cropTypes, setCropTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingType, setEditingType] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    unitOfMeasure: "kg",
    defaultPricePerUnit: 0,
    qualityStandards: {
      maxMoisture: 14,
      acceptableGrades: ["A", "B"],
      maxForeignMatter: 2,
    },
  })

  useEffect(() => {
    fetchCropTypes()
  }, [])

  const fetchCropTypes = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/mcc/crops/types", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCropTypes(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching crop types:", error)
      toast.error("Failed to load crop types")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("Gemurai_token")
      const url = editingType 
        ? `/api/v1/mcc/crops/types/${editingType.id}`
        : "/api/v1/mcc/crops/types"
      
      const response = await fetch(url, {
        method: editingType ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingType ? "Crop type updated" : "Crop type created")
        setIsFormOpen(false)
        setEditingType(null)
        setFormData({
          name: "",
          code: "",
          unitOfMeasure: "kg",
          defaultPricePerUnit: 0,
          qualityStandards: {
            maxMoisture: 14,
            acceptableGrades: ["A", "B"],
            maxForeignMatter: 2,
          },
        })
        fetchCropTypes()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to save crop type")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save crop type")
    }
  }

  const handleEdit = (type: any) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      code: type.code,
      unitOfMeasure: type.unitOfMeasure,
      defaultPricePerUnit: type.defaultPricePerUnit,
      qualityStandards: type.qualityStandards || {
        maxMoisture: 14,
        acceptableGrades: ["A", "B"],
        maxForeignMatter: 2,
      },
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this crop type?")) return
    
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/mcc/crops/types/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        toast.success("Crop type deleted")
        fetchCropTypes()
      } else {
        throw new Error("Failed to delete crop type")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete crop type")
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crop Types</h1>
              <p className="text-gray-600">Manage crop type definitions and quality standards</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCropTypes}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditingType(null)
            setFormData({
              name: "",
              code: "",
              unitOfMeasure: "kg",
              defaultPricePerUnit: 0,
              qualityStandards: {
                maxMoisture: 14,
                acceptableGrades: ["A", "B"],
                maxForeignMatter: 2,
              },
            })
            setIsFormOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Crop Type
          </Button>
        </div>
      </div>

      {/* Crop Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>Crop Types</CardTitle>
          <CardDescription>
            {cropTypes.length} crop type(s) defined
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
              <p className="mt-2 text-gray-500">Loading crop types...</p>
            </div>
          ) : cropTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No crop types defined yet</p>
              <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Crop Type
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Default Price</TableHead>
                  <TableHead>Quality Standards</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cropTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.code}</TableCell>
                    <TableCell>{type.unitOfMeasure}</TableCell>
                    <TableCell>RF {type.defaultPricePerUnit?.toLocaleString()}</TableCell>
                    <TableCell>
                      {type.qualityStandards ? (
                        <div className="text-xs space-y-1">
                          <div>Moisture: ≤{type.qualityStandards.maxMoisture}%</div>
                          <div>Grades: {type.qualityStandards.acceptableGrades?.join(", ")}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.isActive ? "default" : "secondary"}>
                        {type.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(type.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Edit Crop Type" : "Add New Crop Type"}
            </DialogTitle>
            <DialogDescription>
              Define a new crop type with quality standards
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Maize, Beans, Rice"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="e.g., MAIZE, BEANS"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitOfMeasure">Unit of Measure *</Label>
                <Input
                  id="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                  required
                  placeholder="kg, bags, tons"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultPricePerUnit">Default Price per Unit *</Label>
                <Input
                  id="defaultPricePerUnit"
                  type="number"
                  value={formData.defaultPricePerUnit}
                  onChange={(e) => setFormData({ ...formData, defaultPricePerUnit: parseFloat(e.target.value) || 0 })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Quality Standards</Label>
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="maxMoisture" className="text-xs">Max Moisture %</Label>
                  <Input
                    id="maxMoisture"
                    type="number"
                    value={formData.qualityStandards.maxMoisture}
                    onChange={(e) => setFormData({
                      ...formData,
                      qualityStandards: {
                        ...formData.qualityStandards,
                        maxMoisture: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxForeignMatter" className="text-xs">Max Foreign Matter %</Label>
                  <Input
                    id="maxForeignMatter"
                    type="number"
                    value={formData.qualityStandards.maxForeignMatter}
                    onChange={(e) => setFormData({
                      ...formData,
                      qualityStandards: {
                        ...formData.qualityStandards,
                        maxForeignMatter: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="acceptableGrades" className="text-xs">Acceptable Grades</Label>
                  <Input
                    id="acceptableGrades"
                    value={formData.qualityStandards.acceptableGrades.join(", ")}
                    onChange={(e) => setFormData({
                      ...formData,
                      qualityStandards: {
                        ...formData.qualityStandards,
                        acceptableGrades: e.target.value.split(",").map(g => g.trim())
                      }
                    })}
                    placeholder="A, B, C"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingType ? "Update" : "Create"} Crop Type
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
