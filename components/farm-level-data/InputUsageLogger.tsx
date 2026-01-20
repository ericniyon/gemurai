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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Package, TrendingUp } from "lucide-react"

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
        <DialogContent className="max-w-3xl border-2 border-blue-200 bg-white opacity-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <DialogHeader className="pb-4 border-b border-blue-200">
            <DialogTitle className="text-2xl font-bold text-blue-900">Log Input Usage</DialogTitle>
            <DialogDescription className="text-blue-700 mt-2">
              Record input usage for productivity analytics and credit scoring
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="farmerId" className="text-base font-semibold text-gray-700">
                Farmer <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.farmerId}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    farmerId: value,
                    seasonPlanId: "",
                    inputCatalogId: "",
                  })
                  setSeasonPlans([])
                  setInputCatalog([])
                }}
                required
              >
                <SelectTrigger style={{ border: '2px solid lightblue' }}>
                  <SelectValue placeholder="Select farmer" />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map((farmer) => (
                    <SelectItem key={farmer.id} value={farmer.id}>
                      {farmer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seasonPlanId" className="text-base font-semibold text-gray-700">
                Season Plan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.seasonPlanId}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    seasonPlanId: value,
                    inputCatalogId: "",
                  })
                  setInputCatalog([])
                }}
                required
                disabled={!formData.farmerId || seasonPlans.length === 0}
              >
                <SelectTrigger style={{ border: '2px solid lightblue' }}>
                  <SelectValue placeholder={!formData.farmerId ? "Select farmer first" : seasonPlans.length === 0 ? "No season plans found" : "Select season plan"} />
                </SelectTrigger>
                <SelectContent>
                  {seasonPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.commodity?.name} - {plan.season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inputCatalogId" className="text-base font-semibold text-gray-700">
                Input Item <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.inputCatalogId}
                onValueChange={(value) => {
                  const selectedInput = inputCatalog.find((input) => input.id === value)
                  setFormData({
                    ...formData,
                    inputCatalogId: value,
                    unit: selectedInput?.unit || "",
                  })
                }}
                required
                disabled={!formData.seasonPlanId || inputCatalog.length === 0}
              >
                <SelectTrigger style={{ border: '2px solid lightblue' }}>
                  <SelectValue placeholder={!formData.seasonPlanId ? "Select season plan first" : inputCatalog.length === 0 ? "No inputs available" : "Select input"} />
                </SelectTrigger>
                <SelectContent>
                  {inputCatalog.map((input) => (
                    <SelectItem key={input.id} value={input.id}>
                      {input.name} ({input.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-base font-semibold text-gray-700">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Quantity"
                  style={{ border: '2px solid lightblue' }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="text-base font-semibold text-gray-700">
                  Unit <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Unit (kg, liters, etc.)"
                  style={{ border: '2px solid lightblue' }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost" className="text-base font-semibold text-gray-700">Cost (RWF)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="Optional cost"
                style={{ border: '2px solid lightblue' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold text-gray-700">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                style={{ border: '2px solid lightblue' }}
              />
            </div>

            <DialogFooter className="gap-2 pt-4 border-t-2 border-blue-300">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
                className="border-blue-200 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
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
