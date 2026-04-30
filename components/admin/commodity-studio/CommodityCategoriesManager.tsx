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
import { Plus, Edit, Trash2, Package } from "lucide-react"

export function CommodityCategoriesManager() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    defaultStorageType: "",
    status: "active",
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/admin/commodity-studio/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to fetch categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to fetch categories")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("Gemurai_token")
      const url = editingCategory
        ? `/api/v1/admin/commodity-studio/categories/${editingCategory.id}`
        : "/api/v1/admin/commodity-studio/categories"
      const method = editingCategory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(
          editingCategory ? "Category updated successfully" : "Category created successfully"
        )
        setIsDialogOpen(false)
        setEditingCategory(null)
        setFormData({ name: "", description: "", defaultStorageType: "", status: "active" })
        fetchCategories()
      } else {
        toast.error(result.error || "Failed to save category")
      }
    } catch (error) {
      console.error("Error saving category:", error)
      toast.error("Failed to save category")
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      defaultStorageType: category.defaultStorageType || "",
      status: category.status || "active",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) return

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/admin/commodity-studio/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Category deleted successfully")
        fetchCategories()
      } else {
        toast.error(result.error || "Failed to delete category")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Failed to delete category")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-2 border-blue-200 transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Commodity Categories</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Create and manage commodity categories (Perishables, Semi-Perishables, Non-Perishables)
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No categories found. Create your first category to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categories.map((category) => (
                <Card 
                  key={category.id}
                  className="group bg-white border-2 border-blue-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                      <Badge 
                        variant={category.status === "active" ? "default" : "secondary"}
                        className={category.status === "active" 
                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 font-semibold" 
                          : "bg-gray-500/10 text-gray-700 border-gray-500/30 font-semibold"
                        }
                      >
                        {category.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {category.description && (
                      <p className="text-sm text-gray-600">{category.description}</p>
                    )}
                    {category.defaultStorageType && (
                      <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-gray-50 border border-blue-200">
                        <span className="text-gray-500 font-medium">Storage:</span>
                        <Badge variant="outline" className="font-semibold">{category.defaultStorageType}</Badge>
                      </div>
                    )}
                    <div className="pt-2 border-t border-blue-200">
                      <p className="text-xs font-semibold text-gray-600">
                        <span className="text-gray-900 font-bold">{category.commodities?.length || 0}</span> commodities
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(category.id)}
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-blue-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {editingCategory 
                ? "Update the commodity category details"
                : "Define a new commodity category to organize your commodities"
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Perishables, Semi-Perishables, Non-Perishables"
                className="border-blue-200 focus:border-blue-400"
                style={{ borderColor: '#bfdbfe', borderWidth: '1px' }}
                required
              />
              <p className="text-xs text-gray-500">
                Examples: Perishables (Digital, Fish, Horticulture), Semi-Perishables (Coffee), Non-Perishables (Cereals, Pulses, Oilseeds)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Category description"
                rows={3}
                className="!border-blue-200 focus:!border-blue-400 border-solid"
                style={{ 
                  border: '1px solid #bfdbfe !important',
                  borderColor: '#bfdbfe !important'
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultStorageType">Default Storage Type</Label>
              <Select
                value={formData.defaultStorageType}
                onValueChange={(value) =>
                  setFormData({ ...formData, defaultStorageType: value })
                }
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Select storage type" />
                </SelectTrigger>
                <SelectContent className="border-blue-200" style={{ borderColor: '#bfdbfe', borderWidth: '1px' }}>
                  <SelectItem value="tank" style={{ borderBottom: '1px solid #bfdbfe' }}>Tank</SelectItem>
                  <SelectItem value="bags" style={{ borderBottom: '1px solid #bfdbfe' }}>Bags</SelectItem>
                  <SelectItem value="silo" style={{ borderBottom: '1px solid #bfdbfe' }}>Silo</SelectItem>
                  <SelectItem value="warehouse" style={{ borderBottom: '1px solid #bfdbfe' }}>Warehouse</SelectItem>
                  <SelectItem value="cold_storage" style={{ borderBottom: 'none' }}>Cold Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-blue-200" style={{ borderColor: '#bfdbfe', borderWidth: '1px' }}>
                  <SelectItem value="active" style={{ borderBottom: '1px solid #bfdbfe' }}>Active</SelectItem>
                  <SelectItem value="inactive" style={{ borderBottom: 'none' }}>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingCategory(null)
                  setFormData({
                    name: "",
                    description: "",
                    defaultStorageType: "",
                    status: "active",
                  })
                }}
                className="border-blue-200 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300"
              >
                {editingCategory ? "Update" : "Create"} Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
