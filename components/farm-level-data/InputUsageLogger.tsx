"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Package, TrendingUp, User } from "lucide-react"

export function InputUsageLogger() {
  const [farmers, setFarmers] = useState<any[]>([])
  const [seasonPlans, setSeasonPlans] = useState<any[]>([])
  const [inputCatalog, setInputCatalog] = useState<any[]>([])
  const [inputUsageLogs, setInputUsageLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    farmerId: "",
    seasonPlanId: "",
    inputCatalogId: "",
    quantity: "",
    unit: "",
    cost: "",
    notes: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (formData.farmerId) {
      fetchSeasonPlansForFarmer()
    }
  }, [formData.farmerId])

  useEffect(() => {
    if (formData.seasonPlanId) {
      fetchInputCatalogForSeasonPlan()
    }
  }, [formData.seasonPlanId])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      
      // Fetch farmers
      const farmersRes = await fetch("/api/v1/mcc/farmers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (farmersRes.ok) {
        const farmersData = await farmersRes.json()
        setFarmers(farmersData.data || [])
      }

      // Fetch input usage logs
      await fetchInputUsageLogs()
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSeasonPlansForFarmer = async () => {
    if (!formData.farmerId) return

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(
        `/api/v1/farmers/season-plans?farmerId=${formData.farmerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setSeasonPlans(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching season plans:", error)
    }
  }

  const fetchInputCatalogForSeasonPlan = async () => {
    if (!formData.seasonPlanId) return

    try {
      const seasonPlan = seasonPlans.find((sp) => sp.id === formData.seasonPlanId)
      if (!seasonPlan) return

      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(
        `/api/v1/admin/commodity-studio/input-catalog?commodityId=${seasonPlan.commodityId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setInputCatalog(data.data || [])
        
        // Auto-fill unit if input is selected
        if (data.data && data.data.length > 0 && formData.inputCatalogId) {
          const selectedInput = data.data.find((input: any) => input.id === formData.inputCatalogId)
          if (selectedInput) {
            setFormData({ ...formData, unit: selectedInput.unit })
          }
        }
      }
    } catch (error) {
      console.error("Error fetching input catalog:", error)
    }
  }

  const fetchInputUsageLogs = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/farm-level-data/input-usage", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setInputUsageLogs(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching input usage logs:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.farmerId || !formData.seasonPlanId || !formData.inputCatalogId || 
        !formData.quantity || !formData.unit) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/farm-level-data/input-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Input usage logged successfully")
        setIsDialogOpen(false)
        resetForm()
        fetchInputUsageLogs()
      } else {
        toast.error(result.error || "Failed to log input usage")
      }
    } catch (error) {
      console.error("Error logging input usage:", error)
      toast.error("Failed to log input usage")
    }
  }

  const resetForm = () => {
    setFormData({
      farmerId: "",
      seasonPlanId: "",
      inputCatalogId: "",
      quantity: "",
      unit: "",
      cost: "",
      notes: "",
    })
    setSeasonPlans([])
    setInputCatalog([])
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 shadow-sm">
        <CardHeader className="border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-2xl font-bold text-blue-900">Input Usage Logging</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Log input usage against farmers, season plans, and commodities for productivity analytics
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Input Usage
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {inputUsageLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No input usage logs found. Log your first input usage to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inputUsageLogs.map((log) => (
                  <Card key={log.id} className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-blue-900">
                          {log.inputCatalog?.name || "Unknown Input"}
                        </CardTitle>
                        <Badge variant="outline" className="border-blue-300 text-blue-700">
                          {log.quantity} {log.unit}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Farmer:</span>
                        <p className="text-gray-800">{log.farmer?.name || "Unknown"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Commodity:</span>
                        <p className="text-gray-800">{log.seasonPlan?.commodity?.name || "Unknown"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Season:</span>
                        <p className="text-gray-800">{log.seasonPlan?.season || "Unknown"}</p>
                      </div>
                      {log.cost && (
                        <div>
                          <span className="font-medium text-gray-600">Cost:</span>
                          <p className="text-gray-800">RWF {log.cost.toLocaleString()}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-600">Date:</span>
                        <p className="text-gray-800">
                          {new Date(log.usageDate).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log Input Usage Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="flex max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-2xl">
          <div className="shrink-0 border-b border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-6 pt-6 pb-4">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100/80 p-2.5">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Log Input Usage</DialogTitle>
                  <DialogDescription className="mt-1 text-slate-600">
                    Record input usage for productivity analytics and credit scoring
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <User className="h-4 w-4 text-blue-600" />
                  Farmer & Plan
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmerId" className="text-sm font-semibold text-slate-700">Farmer <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      value={formData.farmerId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, farmerId: value, seasonPlanId: "", inputCatalogId: "" })
                        setSeasonPlans([])
                        setInputCatalog([])
                      }}
                      options={farmers.map((f) => ({ value: f.id, label: f.name }))}
                      placeholder="Select farmer"
                      searchPlaceholder="Search farmers..."
                      emptyText="No farmer found."
                      className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seasonPlanId" className="text-sm font-semibold text-slate-700">Season Plan <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      value={formData.seasonPlanId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, seasonPlanId: value, inputCatalogId: "" })
                        setInputCatalog([])
                      }}
                      options={seasonPlans.map((plan) => ({
                        value: plan.id,
                        label: `${plan.commodity?.name ?? "Commodity"} - ${plan.season}`,
                      }))}
                      placeholder={!formData.farmerId ? "Select farmer first" : seasonPlans.length === 0 ? "No season plans found" : "Select season plan"}
                      searchPlaceholder="Search season plans..."
                      emptyText="No season plan found."
                      className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200"
                      disabled={!formData.farmerId || seasonPlans.length === 0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inputCatalogId" className="text-sm font-semibold text-slate-700">Input Item <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      value={formData.inputCatalogId}
                      onValueChange={(value) => {
                        const selectedInput = inputCatalog.find((input) => input.id === value)
                        setFormData({ ...formData, inputCatalogId: value, unit: selectedInput?.unit || "" })
                      }}
                      options={inputCatalog.map((input) => ({ value: input.id, label: `${input.name} (${input.unit})` }))}
                      placeholder={!formData.seasonPlanId ? "Select season plan first" : inputCatalog.length === 0 ? "No inputs available" : "Select input"}
                      searchPlaceholder="Search inputs..."
                      emptyText="No input found."
                      className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200"
                      disabled={!formData.seasonPlanId || inputCatalog.length === 0}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Quantity & Cost
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700">Quantity <span className="text-red-500">*</span></Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="Quantity"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit" className="text-sm font-semibold text-slate-700">Unit <span className="text-red-500">*</span></Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="Unit (kg, liters, etc.)"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost" className="text-sm font-semibold text-slate-700">Cost (RWF)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="Optional cost"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">Notes</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              </section>
            </div>

            <DialogFooter className="shrink-0 gap-3 border-t border-slate-200/80 px-6 py-4 bg-slate-50/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsDialogOpen(false); resetForm() }}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700"
              >
                Log Input Usage
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
