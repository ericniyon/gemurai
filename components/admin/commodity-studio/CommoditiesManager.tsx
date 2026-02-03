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
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-indigo-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600" />
          <DialogHeader className="pb-4 border-b border-indigo-100">
            <DialogTitle className="text-2xl font-bold text-indigo-900">Create Commodity</DialogTitle>
            <DialogDescription className="text-sm text-indigo-700 mt-2">
              Define a new commodity (e.g. Milk, Coffee Cherries, Maize) with pricing method, storage type, and collection settings
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                  Commodity Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Milk, Coffee Cherries, Maize"
                  className="border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-base font-semibold text-gray-700">
                  Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. MILK, COFFEE, MAIZE"
                  className="border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-base font-semibold text-gray-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                required
              >
                <SelectTrigger className="border-2 border-indigo-200 focus:border-indigo-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitOfMeasure" className="text-base font-semibold text-gray-700">
                  Unit of Measure <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                  placeholder="e.g. liters, kg, bags"
                  className="border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storageType" className="text-base font-semibold text-gray-700">
                  Storage Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.storageType}
                  onValueChange={(value) => setFormData({ ...formData, storageType: value })}
                  required
                >
                  <SelectTrigger className="border-2 border-indigo-200 focus:border-indigo-500">
                    <SelectValue placeholder="Select storage type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tank">Tank</SelectItem>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="silo">Silo</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="cold_storage">Cold Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPerishable"
                checked={formData.isPerishable}
                onChange={(e) => setFormData({ ...formData, isPerishable: e.target.checked })}
                className="rounded border-indigo-300"
              />
              <Label htmlFor="isPerishable" className="text-base font-semibold text-gray-700">
                Perishable (e.g. Dairy - requires cold chain)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricingMethod" className="text-base font-semibold text-gray-700">
                Pricing Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.pricingMethod}
                onValueChange={(value) =>
                  setFormData({ ...formData, pricingMethod: value as any })
                }
                required
              >
                <SelectTrigger className="border-2 border-indigo-200 focus:border-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SPOT">Spot Price (Immediate payment at collection)</SelectItem>
                  <SelectItem value="GRADE_BASED">Grade-Based (Price varies by quality grade)</SelectItem>
                  <SelectItem value="DEFERRED">Deferred / Post-Sale (Payment after sale)</SelectItem>
                  <SelectItem value="POST_SALE">Post-Sale (Payment after processing/sale)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-indigo-700">
                Choose how this commodity is priced: immediate spot price, grade-based pricing, or deferred payment
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultCollectionCenterType" className="text-base font-semibold text-gray-700">Default Collection Center Type</Label>
                <Select
                  value={formData.defaultCollectionCenterType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, defaultCollectionCenterType: value })
                  }
                >
                  <SelectTrigger className="border-2 border-indigo-200 focus:border-indigo-500">
                    <SelectValue placeholder="Select center type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCC">MCC (Milk Collection Center)</SelectItem>
                    <SelectItem value="coffee_washing_station">Coffee Washing Station</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="collection_point">Collection Point</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-indigo-700">
                  Type of collection center where this commodity is typically collected
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultCollectionFrequency" className="text-base font-semibold text-gray-700">Default Collection Frequency</Label>
                <Select
                  value={formData.defaultCollectionFrequency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, defaultCollectionFrequency: value })
                  }
                >
                  <SelectTrigger className="border-2 border-indigo-200 focus:border-indigo-500">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily (e.g. Dairy)</SelectItem>
                    <SelectItem value="weekly">Weekly (e.g. Coffee during harvest)</SelectItem>
                    <SelectItem value="seasonal">Seasonal (e.g. Crops)</SelectItem>
                    <SelectItem value="harvest_window">Harvest Window (e.g. Cereals)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-indigo-700">
                  Default recording cadence for this commodity
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-2 border-indigo-200"
                />
                <Label htmlFor="isActive" className="text-base font-semibold text-gray-700 cursor-pointer">
                  Active (Commodity will be available for collections)
                </Label>
              </div>
              <p className="text-xs text-indigo-700">
                Inactive commodities will not appear in collection forms
              </p>
            </div>

            <DialogFooter className="gap-2 pt-4 border-t border-indigo-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-indigo-200 hover:bg-indigo-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                Create Commodity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
