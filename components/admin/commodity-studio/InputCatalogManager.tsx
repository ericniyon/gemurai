"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Package, Database } from "lucide-react"

export function InputCatalogManager() {
  const [commodities, setCommodities] = useState<any[]>([])
  const [selectedCommodity, setSelectedCommodity] = useState<string>("")
  const [inputCatalog, setInputCatalog] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "",
    pricingReference: "",
    description: "",
    isActive: true,
  })

  useEffect(() => {
    fetchCommodities()
  }, [])

  useEffect(() => {
    if (selectedCommodity) {
      fetchInputCatalog()
    } else {
      setInputCatalog([])
    }
  }, [selectedCommodity])

  const fetchCommodities = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/admin/commodity-studio/commodities", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCommodities(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching commodities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInputCatalog = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(
        `/api/v1/admin/commodity-studio/input-catalog?commodityId=${selectedCommodity}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setInputCatalog(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching input catalog:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCommodity || !formData.name || !formData.category || !formData.unit) {
      toast.error("Please select a commodity and fill in all required fields")
      return
    }

    try {
      const token = localStorage.getItem("Gemurai_token")
      const url = editingItem
        ? `/api/v1/admin/commodity-studio/input-catalog/${editingItem.id}`
        : "/api/v1/admin/commodity-studio/input-catalog"
      const method = editingItem ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          editingItem
            ? {
                ...formData,
                pricingReference: formData.pricingReference
                  ? parseFloat(formData.pricingReference)
                  : undefined,
              }
            : {
                commodityId: selectedCommodity,
                ...formData,
                pricingReference: formData.pricingReference
                  ? parseFloat(formData.pricingReference)
                  : undefined,
              }
        ),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(editingItem ? "Input catalog item updated" : "Input catalog item created")
        setIsDialogOpen(false)
        setEditingItem(null)
        setFormData({
          name: "",
          category: "",
          unit: "",
          pricingReference: "",
          description: "",
          isActive: true,
        })
        fetchInputCatalog()
      } else {
        toast.error(result.error || "Failed to save input catalog item")
      }
    } catch (error) {
      console.error("Error saving input catalog item:", error)
      toast.error("Failed to save input catalog item")
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      unit: item.unit,
      pricingReference: item.pricingReference?.toString() || "",
      description: item.description || "",
      isActive: item.isActive !== undefined ? item.isActive : true,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this input catalog item?")) return

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(
        `/api/v1/admin/commodity-studio/input-catalog/${itemId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.ok) {
        toast.success("Input catalog item deleted successfully")
        fetchInputCatalog()
      } else {
        toast.error("Failed to delete input catalog item")
      }
    } catch (error) {
      console.error("Error deleting input catalog item:", error)
      toast.error("Failed to delete input catalog item")
    }
  }

  const selectedCommodityData = commodities.find((c) => c.id === selectedCommodity)

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 shadow-sm">
        <CardHeader className="border-b border-blue-200">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-2xl font-bold text-blue-900">Input Catalog</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Define farm-level inputs per commodity. Examples: Dairy (feed, vet, AI, minerals), Coffee (seedlings, fertilizer, labor), Cereals (seed, fertilizer, pesticides)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold text-gray-700">Select Commodity</Label>
            <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
              <SelectTrigger className="h-11 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                <SelectValue placeholder="Select a commodity" />
              </SelectTrigger>
              <SelectContent>
                {commodities.map((commodity) => (
                  <SelectItem key={commodity.id} value={commodity.id}>
                    {commodity.name} ({commodity.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCommodity && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-blue-200">
                <div>
                  <h3 className="font-bold text-lg text-blue-900">
                    Input Catalog for {selectedCommodityData?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Define inputs needed for this commodity (feed, fertilizer, seeds, etc.)
                  </p>
                </div>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Input Item
                </Button>
              </div>

              {inputCatalog.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed border-blue-200 rounded-lg">
                  <Package className="h-12 w-12 mx-auto mb-3 text-blue-400" />
                  <p className="font-medium">No input catalog items defined</p>
                  <p className="text-sm mt-1">Add your first input item to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inputCatalog.map((item) => (
                    <Card key={item.id} className="border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md">
                      <CardHeader className="border-b border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-blue-600" />
                            <CardTitle className="text-lg font-bold text-blue-900">{item.name}</CardTitle>
                          </div>
                          <Badge className={item.isActive ? "bg-green-600 text-white border-green-700 font-semibold" : "bg-gray-400 text-white border-gray-500 font-semibold"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600 font-medium">Category:</span>
                          <Badge variant="outline" className="border-blue-300 text-blue-700 font-semibold">{item.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600 font-medium">Unit:</span>
                          <span className="font-semibold text-gray-800">{item.unit}</span>
                        </div>
                        {item.pricingReference && (
                          <div className="flex items-center gap-2 text-sm p-2 rounded border-2 border-green-200">
                            <span className="text-gray-600 font-medium">Price Reference:</span>
                            <span className="font-bold text-green-700">RWF {item.pricingReference.toLocaleString()}</span>
                          </div>
                        )}
                        {item.description && (
                          <p className="text-xs text-gray-600 p-2 rounded border-l-2 border-blue-200 pl-3">{item.description}</p>
                        )}
                        <div className="flex gap-2 pt-3 border-t border-blue-100">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                            className="border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl border-2 border-blue-200 bg-white opacity-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <DialogHeader className="pb-4 border-b border-blue-100">
            <DialogTitle className="text-2xl font-bold text-blue-900">
              {editingItem ? "Edit Input Catalog Item" : "Add Input Catalog Item"}
            </DialogTitle>
            <DialogDescription className="text-blue-700 mt-2">
              Define an input item for <span className="font-semibold">{selectedCommodityData?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                Input Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. NPK Fertilizer, Animal Feed, Seeds"
                className="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold text-gray-700">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feed">Feed (Animal feed, supplements)</SelectItem>
                    <SelectItem value="vet">Veterinary (Medicines, vaccines)</SelectItem>
                    <SelectItem value="fertilizer">Fertilizer (NPK, organic, etc.)</SelectItem>
                    <SelectItem value="seed">Seed (Crop seeds, seedlings)</SelectItem>
                    <SelectItem value="pesticide">Pesticide (Herbicides, insecticides)</SelectItem>
                    <SelectItem value="equipment">Equipment (Tools, machinery)</SelectItem>
                    <SelectItem value="labor">Labor (Labor costs)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="text-base font-semibold text-gray-700">
                  Unit <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g. kg, liters, bags"
                  className="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricingReference" className="text-base font-semibold text-gray-700">Pricing Reference (RWF)</Label>
              <Input
                id="pricingReference"
                type="number"
                step="0.01"
                value={formData.pricingReference}
                onChange={(e) => setFormData({ ...formData, pricingReference: e.target.value })}
                placeholder="e.g. 5000"
                style={{ border: '2px solid lightblue' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold text-gray-700">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Input description"
                rows={3}
                style={{ border: '2px solid lightblue' }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-2 border-blue-200"
                />
                <Label htmlFor="isActive" className="text-base font-semibold text-gray-700 cursor-pointer">
                  Active (Input will be available for usage logging)
                </Label>
              </div>
              <p className="text-xs text-blue-700">
                Inactive inputs will not appear in usage forms
              </p>
            </div>

            <DialogFooter className="gap-2 pt-4 border-t border-blue-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingItem(null)
        setFormData({
          name: "",
          category: "",
          unit: "",
          pricingReference: "",
          description: "",
          isActive: true,
        })
                }}
                className="border-blue-200 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                Save Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
