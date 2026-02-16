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
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Wheat, Coffee, Package } from "lucide-react"

export function CommoditiesManager() {
  const [commodities, setCommodities] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    categoryId: "",
    unitOfMeasure: "",
    pricingMethod: "SPOT",
    storageType: "",
    isPerishable: false,
    defaultCollectionCenterType: "",
    defaultCollectionFrequency: "",
    isActive: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")

      const [commoditiesRes, categoriesRes] = await Promise.all([
        fetch("/api/v1/admin/commodity-studio/commodities", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/v1/admin/commodity-studio/categories", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (commoditiesRes.ok) {
        const data = await commoditiesRes.json()
        setCommodities(data.data || [])
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.code ||
      !formData.categoryId ||
      !formData.unitOfMeasure ||
      !formData.storageType
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/admin/commodity-studio/commodities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Commodity created successfully")
        setIsDialogOpen(false)
        setFormData({
          name: "",
          code: "",
          categoryId: "",
          unitOfMeasure: "",
          pricingMethod: "SPOT",
          storageType: "",
          isPerishable: false,
          defaultCollectionCenterType: "",
          defaultCollectionFrequency: "",
          isActive: true,
        })
        fetchData()
      } else {
        toast.error(result.error || "Failed to create commodity")
      }
    } catch (error) {
      console.error("Error creating commodity:", error)
      toast.error("Failed to create commodity")
    }
  }

  const getCommodityIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes("milk") || lower.includes("dairy")) return "🥛"
    if (lower.includes("coffee")) return "☕"
    if (lower.includes("maize") || lower.includes("corn")) return "🌽"
    if (lower.includes("bean")) return "🫘"
    if (lower.includes("rice")) return "🌾"
    return "📦"
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-indigo-200 shadow-sm">
        <CardHeader className="border-b border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wheat className="h-6 w-6 text-indigo-600" />
              <div>
                <CardTitle className="text-2xl font-bold text-indigo-900">Commodities</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Define and manage commodities (Milk, Coffee Cherries, Maize, etc.) with pricing methods, storage types, and collection settings
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Commodity
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading commodities...</p>
            </div>
          ) : commodities.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-indigo-200 rounded-lg">
              <Package className="h-12 w-12 mx-auto mb-3 text-indigo-400" />
              <p className="font-medium">No commodities found</p>
              <p className="text-sm mt-1">Create your first commodity to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commodities.map((commodity) => (
                <Card key={commodity.id} className="border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md">
                  <CardHeader className="border-b border-indigo-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{getCommodityIcon(commodity.name)}</span>
                        <CardTitle className="text-lg font-bold text-indigo-900">{commodity.name}</CardTitle>
                      </div>
                      <Badge className={commodity.isActive ? "bg-green-600 text-white border-green-700 font-semibold" : "bg-gray-400 text-white border-gray-500 font-semibold"}>
                        {commodity.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 font-medium">Code:</span>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700 font-semibold">{commodity.code}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 font-medium">Category:</span>
                      <span className="font-semibold text-gray-800">{commodity.category?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 font-medium">Unit:</span>
                      <span className="font-semibold text-gray-800">{commodity.unitOfMeasure}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 font-medium">Pricing:</span>
                      <Badge variant="outline" className="border-blue-300 text-blue-700 font-semibold">{commodity.pricingMethod}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 font-medium">Storage:</span>
                      <span className="font-semibold text-gray-800 capitalize">{commodity.storageType?.replace('_', ' ') || '-'}</span>
                    </div>
                    {commodity.isPerishable && (
                      <Badge variant="outline" className="border-amber-300 text-amber-700 font-semibold">Perishable</Badge>
                    )}
                    {commodity.defaultCollectionFrequency && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600 font-medium">Frequency:</span>
                        <Badge variant="outline" className="border-emerald-300 text-emerald-700 font-semibold capitalize">{commodity.defaultCollectionFrequency.replace('_', ' ')}</Badge>
                      </div>
                    )}
                    {commodity.defaultCollectionCenterType && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600 font-medium">Center Type:</span>
                        <span className="text-xs font-semibold text-gray-700">{commodity.defaultCollectionCenterType}</span>
                      </div>
                    )}
                    {commodity.qualityFields && commodity.qualityFields.length > 0 && (
                      <div className="text-xs text-blue-700 pt-2 border-t border-indigo-200 font-medium">
                        {commodity.qualityFields.length} quality field(s) configured
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="overflow-hidden border-0 bg-slate-50 p-0 shadow-xl max-w-2xl max-h-[90vh] flex flex-col opacity-100 dark:bg-slate-950">
          <div className="border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  Create Commodity
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  Define a new commodity (e.g. Milk, Coffee Cherries, Maize) with pricing, storage, and collection settings
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/50">
                <h4 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Basic info</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Commodity Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value
                        const autoCode = name.trim().toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "") || ""
                        setFormData({ ...formData, name, code: autoCode })
                      }}
                      placeholder="e.g. Milk, Coffee Cherries, Maize"
                      className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Code <span className="text-red-500">*</span>
                      <span className="ml-1 text-xs font-normal text-slate-500">(auto from name)</span>
                    </Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "") })
                      }
                      placeholder="e.g. MILK, COFFEE_CHERRIES"
                      className="border-slate-200 bg-white font-mono focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="categoryId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <SearchableSelect
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    options={categories.map((cat) => ({ label: cat.name, value: cat.id }))}
                    placeholder="Select category"
                    searchPlaceholder="Search categories..."
                    emptyText="No category found."
                    className="h-10 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/50">
                <h4 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Unit & storage</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitOfMeasure" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Unit of Measure <span className="text-red-500">*</span>
                    </Label>
                    <SearchableSelect
                      value={formData.unitOfMeasure}
                      onValueChange={(value) => setFormData({ ...formData, unitOfMeasure: value })}
                      options={[
                        { label: "Liters", value: "liters" },
                        { label: "Kg", value: "kg" },
                        { label: "Bags", value: "bags" },
                        { label: "Tons", value: "tons" },
                        { label: "Units", value: "units" },
                        { label: "Gallons", value: "gallons" },
                        { label: "Tonnes", value: "tonnes" },
                        { label: "Quintals", value: "quintals" },
                        { label: "Bunches", value: "bunches" },
                        { label: "Crates", value: "crates" },
                        { label: "Pieces", value: "pieces" },
                        { label: "Boxes", value: "boxes" },
                      ]}
                      placeholder="Select unit"
                      searchPlaceholder="Search units..."
                      emptyText="No unit found."
                      className="h-10 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storageType" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Storage Type <span className="text-red-500">*</span>
                    </Label>
                    <SearchableSelect
                      value={formData.storageType}
                      onValueChange={(value) => setFormData({ ...formData, storageType: value })}
                      options={[
                        { label: "Tank", value: "tank" },
                        { label: "Bags", value: "bags" },
                        { label: "Silo", value: "silo" },
                        { label: "Warehouse", value: "warehouse" },
                        { label: "Cold Storage", value: "cold_storage" },
                      ]}
                      placeholder="Select storage type"
                      searchPlaceholder="Search storage type..."
                      emptyText="No storage type found."
                      className="h-10 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPerishable"
                    checked={formData.isPerishable}
                    onChange={(e) => setFormData({ ...formData, isPerishable: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600 dark:text-slate-100"
                  />
                  <Label htmlFor="isPerishable" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Perishable (e.g. dairy — requires cold chain)
                  </Label>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/50">
                <h4 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Pricing method</h4>
                <div className="space-y-2">
                  <SearchableSelect
                    value={formData.pricingMethod}
                    onValueChange={(value) => setFormData({ ...formData, pricingMethod: value as any })}
                    options={[
                      { label: "Spot (immediate payment at collection)", value: "SPOT" },
                      { label: "Grade-based (price varies by quality)", value: "GRADE_BASED" },
                      { label: "Deferred / post-sale", value: "DEFERRED" },
                      { label: "Post-sale (after processing/sale)", value: "POST_SALE" },
                    ]}
                    placeholder="Select pricing method"
                    searchPlaceholder="Search..."
                    emptyText="No pricing method found."
                    className="h-10 border-slate-200 dark:border-slate-700"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How this commodity is priced at collection
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/50">
                <h4 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Collection defaults</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCollectionCenterType" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Default center type
                    </Label>
                    <SearchableSelect
                      value={formData.defaultCollectionCenterType}
                      onValueChange={(value) => setFormData({ ...formData, defaultCollectionCenterType: value })}
                      options={[
                        { label: "Collection Center (Milk, Agri, etc.)", value: "MCC" },
                        { label: "Coffee Washing Station", value: "coffee_washing_station" },
                        { label: "Warehouse", value: "warehouse" },
                        { label: "Collection Point", value: "collection_point" },
                      ]}
                      placeholder="Select center type"
                      searchPlaceholder="Search..."
                      emptyText="No center type found."
                      className="h-10 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultCollectionFrequency" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Default frequency
                    </Label>
                    <SearchableSelect
                      value={formData.defaultCollectionFrequency}
                      onValueChange={(value) => setFormData({ ...formData, defaultCollectionFrequency: value })}
                      options={[
                        { label: "Daily (e.g. dairy)", value: "daily" },
                        { label: "Weekly (e.g. coffee)", value: "weekly" },
                        { label: "Seasonal", value: "seasonal" },
                        { label: "Harvest window", value: "harvest_window" },
                      ]}
                      placeholder="Select frequency"
                      searchPlaceholder="Search..."
                      emptyText="No frequency found."
                      className="h-10 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/50">
                <h4 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Status</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600 dark:text-slate-100"
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Active (available for collections)
                  </Label>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Inactive commodities do not appear in collection forms
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Create Commodity
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
