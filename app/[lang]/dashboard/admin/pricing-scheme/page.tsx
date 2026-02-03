"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
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
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  XCircle,
  TrendingUp,
  Package,
  Loader2,
  CheckCircle,
  X,
  Settings,
  Calculator,
  BarChart3,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { format } from "date-fns"

interface Commodity {
  id: string
  name: string
  code: string
  categoryId: string
  category?: {
    name: string
  }
  unitOfMeasure: string
  pricingMethod: "SPOT" | "GRADE_BASED" | "DEFERRED" | "POST_SALE"
  storageType: string
  isActive: boolean
  qualityFields?: QualityField[]
  qualityRules?: QualityRule[]
  metadata?: any
  createdAt: string
  updatedAt: string
}

interface QualityField {
  id: string
  fieldName: string
  fieldType: string
  dataType: string
  isMandatory: boolean
}

interface QualityRule {
  id: string
  ruleName: string
  ruleType: string
  thresholdValue?: number
  thresholdOperator?: string
  impactOnPricing: boolean
  pricingMultiplier?: number
  qualityFieldId?: string
  qualityField?: QualityField
}

interface PricingScheme {
  commodityId: string
  basePrice: number
  currency: string
  effectiveDate: string
  expiryDate?: string
  gradePrices?: {
    grade: string
    price: number
    multiplier: number
  }[]
}

export default function AdminPricingSchemePage() {
  const { user: currentUser } = useAuth()
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pricingMethodFilter, setPricingMethodFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCommodity, setEditingCommodity] = useState<Commodity | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    basePrice: "",
    currency: "RWF",
    effectiveDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    pricingMethod: "",
    gradePrices: [] as { grade: string; price: string; multiplier: string }[],
  })

  useEffect(() => {
    if (currentUser && (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN")) {
      fetchCommodities()
      fetchCategories()
    }
  }, [currentUser])

  const filteredCommodities = commodities.filter((commodity) => {
    if (pricingMethodFilter !== "all" && commodity.pricingMethod !== pricingMethodFilter) return false
    if (categoryFilter !== "all" && commodity.categoryId !== categoryFilter) return false
    return true
  })

  const fetchCommodities = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/admin/commodity-studio/commodities", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setCommodities(result.data || [])
      } else {
        toast.error(result.error || "Failed to fetch commodities")
      }
    } catch (error) {
      console.error("Error fetching commodities:", error)
      toast.error("Failed to fetch commodities")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/admin/commodity-studio/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setCategories(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleEditPricing = (commodity: Commodity) => {
    setEditingCommodity(commodity)
    setFormData({
      basePrice: "",
      currency: "RWF",
      effectiveDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
      pricingMethod: commodity.pricingMethod,
      gradePrices: [],
    })
    setIsDialogOpen(true)
  }

  const handleAddGradePrice = () => {
    setFormData({
      ...formData,
      gradePrices: [
        ...formData.gradePrices,
        { grade: "", price: "", multiplier: "1.0" },
      ],
    })
  }

  const handleRemoveGradePrice = (index: number) => {
    setFormData({
      ...formData,
      gradePrices: formData.gradePrices.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("Gemurai_token")
      
      // For now, we'll update the commodity's metadata with pricing info
      // In a full implementation, you'd have a dedicated pricing_schemes table
      const pricingData = {
        basePrice: parseFloat(formData.basePrice),
        currency: formData.currency,
        effectiveDate: formData.effectiveDate,
        expiryDate: formData.expiryDate || null,
        gradePrices: formData.gradePrices.map((gp) => ({
          grade: gp.grade,
          price: parseFloat(gp.price),
          multiplier: parseFloat(gp.multiplier),
        })),
      }

      // Update commodity metadata with pricing scheme
      const response = await fetch(
        `/api/v1/admin/commodity-studio/commodities/${editingCommodity?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            metadata: {
              ...editingCommodity?.metadata,
              pricingScheme: pricingData,
            },
          }),
        }
      )

      const result = await response.json()

      if (result.success || response.ok) {
        toast.success("Pricing scheme updated successfully")
        setIsDialogOpen(false)
        fetchCommodities()
      } else {
        toast.error(result.error || "Failed to update pricing scheme")
      }
    } catch (error) {
      console.error("Error saving pricing scheme:", error)
      toast.error("Failed to save pricing scheme")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPricingMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      SPOT: "bg-green-100 text-green-800 border-green-300",
      GRADE_BASED: "bg-blue-100 text-blue-800 border-blue-300",
      DEFERRED: "bg-yellow-100 text-yellow-800 border-yellow-300",
      POST_SALE: "bg-purple-100 text-purple-800 border-purple-300",
    }
    return colors[method] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  const getPricingMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      SPOT: "Spot Price",
      GRADE_BASED: "Grade-Based",
      DEFERRED: "Deferred",
      POST_SALE: "Post-Sale",
    }
    return labels[method] || method
  }

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-2 border-red-100">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
              <p className="text-gray-600">You need admin privileges to access this page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const uniquePricingMethods = Array.from(
    new Set(commodities.map((c) => c.pricingMethod))
  ) as string[]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pricing Scheme Management</h1>
              <p className="text-gray-600 mt-1">Configure pricing methods and schemes for commodities</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Commodities</CardTitle>
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{commodities.length}</div>
              <p className="text-xs text-gray-500 mt-1">All commodities</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Spot Pricing</CardTitle>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {commodities.filter((c) => c.pricingMethod === "SPOT").length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Immediate pricing</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Grade-Based</CardTitle>
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {commodities.filter((c) => c.pricingMethod === "GRADE_BASED").length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Quality-based pricing</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 hover:border-orange-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Deferred/Post-Sale</CardTitle>
                <Calculator className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {commodities.filter((c) => c.pricingMethod === "DEFERRED" || c.pricingMethod === "POST_SALE").length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Delayed pricing</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <Select value={pricingMethodFilter} onValueChange={setPricingMethodFilter}>
                <SelectTrigger className="w-[200px]" style={{ border: "2px solid lightblue" }}>
                  <SelectValue placeholder="Filter by pricing method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {uniquePricingMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {getPricingMethodLabel(method)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]" style={{ border: "2px solid lightblue" }}>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => { setPricingMethodFilter("all"); setCategoryFilter("all") }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Commodities DataTable */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900">
              Commodity Pricing ({filteredCommodities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    accessorKey: "name",
                    header: "Commodity",
                    cell: ({ row }) => (
                      <div>
                        <div className="font-medium">{row.original.name}</div>
                        <div className="text-xs text-gray-500">{row.original.code}</div>
                      </div>
                    ),
                  },
                  {
                    id: "category",
                    accessorFn: (row) => row.category?.name || "",
                    header: "Category",
                    cell: ({ row }) => (
                      <Badge variant="outline" className="border-gray-300 text-gray-700">
                        {row.original.category?.name || "N/A"}
                      </Badge>
                    ),
                  },
                  { accessorKey: "unitOfMeasure", header: "Unit" },
                  {
                    accessorKey: "pricingMethod",
                    header: "Pricing Method",
                    cell: ({ row }) => (
                      <Badge variant="outline" className={getPricingMethodBadge(row.original.pricingMethod)}>
                        {getPricingMethodLabel(row.original.pricingMethod)}
                      </Badge>
                    ),
                  },
                  {
                    id: "qualityRules",
                    accessorFn: (row) => row.qualityRules?.length || 0,
                    header: "Quality Rules",
                    cell: ({ row }) => (
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-gray-400" />
                        {row.original.qualityRules?.length || 0} rules
                      </div>
                    ),
                  },
                  {
                    id: "pricingMultipliers",
                    accessorFn: (row) => row.qualityRules?.filter((r) => r.impactOnPricing && r.pricingMultiplier).length || 0,
                    header: "Pricing Multipliers",
                    cell: ({ row }) => {
                      const pricingMultipliers = row.original.qualityRules?.filter(
                        (r) => r.impactOnPricing && r.pricingMultiplier
                      ) || []
                      return pricingMultipliers.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {pricingMultipliers.map((rule, idx) => (
                            <Badge key={idx} variant="outline" className="border-blue-300 text-blue-700 text-xs">
                              {rule.qualityField?.fieldName || "N/A"}: {rule.pricingMultiplier}x
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )
                    },
                  },
                  {
                    id: "actions",
                    header: () => <span className="text-right w-full block">Actions</span>,
                    cell: ({ row }) => (
                      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => handleEditPricing(row.original)} className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={filteredCommodities}
                searchKey="search"
                searchPlaceholder="Search commodities..."
                emptyMessage="No commodities found"
                emptyDescription="Try adjusting your search or filters"
                entityName="commodities"
                pageSize={10}
                defaultSorting={[{ id: "name", desc: false }]}
                onRowClick={(row) => handleEditPricing(row)}
              />
            )}
          </CardContent>
        </Card>

        {/* Edit Pricing Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white opacity-100 max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-900">
                Configure Pricing Scheme: {editingCommodity?.name}
              </DialogTitle>
              <DialogDescription>
                Set base price and grade-based pricing for this commodity
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="base" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="base">Base Pricing</TabsTrigger>
                  <TabsTrigger value="grades">Grade Pricing</TabsTrigger>
                </TabsList>

                <TabsContent value="base" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basePrice" className="text-base font-semibold text-gray-700">
                        Base Price ({formData.currency}) *
                      </Label>
                      <Input
                        id="basePrice"
                        type="number"
                        step="0.01"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                        required
                        placeholder="0.00"
                        style={{ border: '2px solid lightblue' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-base font-semibold text-gray-700">
                        Currency
                      </Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      >
                        <SelectTrigger style={{ border: '2px solid lightblue' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RWF">RWF (Rwandan Franc)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="effectiveDate" className="text-base font-semibold text-gray-700">
                        Effective Date *
                      </Label>
                      <Input
                        id="effectiveDate"
                        type="date"
                        value={formData.effectiveDate}
                        onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                        required
                        style={{ border: '2px solid lightblue' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate" className="text-base font-semibold text-gray-700">
                        Expiry Date (Optional)
                      </Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        style={{ border: '2px solid lightblue' }}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Pricing Method:</strong> {getPricingMethodLabel(formData.pricingMethod)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {formData.pricingMethod === "SPOT" &&
                        "Price is determined immediately at collection time"}
                      {formData.pricingMethod === "GRADE_BASED" &&
                        "Price varies based on quality grades and multipliers"}
                      {formData.pricingMethod === "DEFERRED" &&
                        "Price is determined after collection, before sale"}
                      {formData.pricingMethod === "POST_SALE" &&
                        "Price is determined after the commodity is sold"}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="grades" className="space-y-4 mt-4">
                  {formData.pricingMethod === "GRADE_BASED" ? (
                    <>
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold text-gray-700">
                          Grade-Based Pricing
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddGradePrice}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Grade
                        </Button>
                      </div>
                      {formData.gradePrices.map((gradePrice, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Grade</Label>
                            <Input
                              value={gradePrice.grade}
                              onChange={(e) => {
                                const newGrades = [...formData.gradePrices]
                                newGrades[index].grade = e.target.value
                                setFormData({ ...formData, gradePrices: newGrades })
                              }}
                              placeholder="e.g., A, B, C"
                              style={{ border: '2px solid lightblue' }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={gradePrice.price}
                              onChange={(e) => {
                                const newGrades = [...formData.gradePrices]
                                newGrades[index].price = e.target.value
                                setFormData({ ...formData, gradePrices: newGrades })
                              }}
                              placeholder="0.00"
                              style={{ border: '2px solid lightblue' }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Multiplier</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={gradePrice.multiplier}
                              onChange={(e) => {
                                const newGrades = [...formData.gradePrices]
                                newGrades[index].multiplier = e.target.value
                                setFormData({ ...formData, gradePrices: newGrades })
                              }}
                              placeholder="1.0"
                              style={{ border: '2px solid lightblue' }}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveGradePrice(index)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {formData.gradePrices.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>No grade prices configured</p>
                          <p className="text-xs mt-1">Click "Add Grade" to create grade-based pricing</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Grade-based pricing is only available for commodities with GRADE_BASED pricing method</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Pricing Scheme"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
