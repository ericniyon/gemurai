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
import { Plus, Calendar, TrendingUp, Loader2 } from "lucide-react"

export function SeasonPlanManager() {
  const [farmers, setFarmers] = useState<any[]>([])
  const [commodities, setCommodities] = useState<any[]>([])
  const [seasonPlans, setSeasonPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    farmerId: "",
    commodityId: "",
    season: "",
    plotHerdReference: "",
    expectedHarvestVolume: "",
    expectedHarvestStartDate: "",
    expectedHarvestEndDate: "",
    collectionFrequency: "",
    region: "",
    status: "PLANNED",
    notes: "",
  })

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [])

  const fetchData = async (signal?: AbortSignal) => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch farmers
      const farmersRes = await fetch("/api/v1/mcc/farmers", { headers, signal })
      if (farmersRes.ok) {
        const farmersData = await farmersRes.json()
        setFarmers(farmersData.data || [])
      }

      // Fetch commodities
      const commoditiesRes = await fetch("/api/v1/admin/commodity-studio/commodities", {
        headers,
        signal,
      })
      if (commoditiesRes.ok) {
        const commoditiesData = await commoditiesRes.json()
        setCommodities(commoditiesData.data || [])
      }

      // Fetch season plans
      await fetchSeasonPlans(signal)
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error fetching data:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSeasonPlans = async (signal?: AbortSignal) => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/farmers/season-plans", {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      })
      if (response.ok) {
        const data = await response.json()
        const plans = data.data || []
        // Deduplicate by id (defensive against API/race-condition duplicates)
        const unique = [...new Map(plans.map((p: { id: string }) => [p.id, p])).values()]
        setSeasonPlans(unique)
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error fetching season plans:", error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.farmerId || !formData.commodityId || !formData.season || 
        !formData.expectedHarvestVolume || !formData.expectedHarvestStartDate || 
        !formData.expectedHarvestEndDate) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/farmers/season-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          expectedHarvestVolume: parseFloat(formData.expectedHarvestVolume),
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Season plan created successfully")
        setIsDialogOpen(false)
        resetForm()
        fetchSeasonPlans()
      } else {
        toast.error(result.error || "Failed to create season plan")
      }
    } catch (error) {
      console.error("Error creating season plan:", error)
      toast.error("Failed to create season plan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      farmerId: "",
      commodityId: "",
      season: "",
      plotHerdReference: "",
      expectedHarvestVolume: "",
      expectedHarvestStartDate: "",
      expectedHarvestEndDate: "",
      collectionFrequency: "",
      region: "",
      status: "PLANNED",
      notes: "",
    })
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
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-2xl font-bold text-blue-900">Season Plans</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Create commodity-based season plans for farmers with expected harvest volumes and dates
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Season Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {seasonPlans.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No season plans found. Create your first season plan to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seasonPlans.map((plan) => (
                  <Card key={plan.id} className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-blue-900">
                          {plan.commodity?.name || "Unknown Commodity"}
                        </CardTitle>
                        <Badge variant="outline" className="border-blue-300 text-blue-700">
                          {plan.season}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Farmer:</span>
                        <p className="text-gray-800">{plan.farmer?.name || "Unknown"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Expected Volume:</span>
                        <p className="text-gray-800">{plan.expectedHarvestVolume} {plan.commodity?.unit || ""}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Harvest Window:</span>
                        <p className="text-gray-800">
                          {new Date(plan.expectedHarvestStartDate).toLocaleDateString()} - {new Date(plan.expectedHarvestEndDate).toLocaleDateString()}
                        </p>
                      </div>
                      {plan.collectionFrequency && (
                        <div>
                          <span className="font-medium text-gray-600">Frequency:</span>
                          <Badge variant="outline" className="ml-2 border-blue-300 text-blue-700 capitalize">
                            {plan.collectionFrequency}
                          </Badge>
                        </div>
                      )}
                      {plan.status && (
                        <Badge variant="outline" className="border-blue-300 text-blue-700">
                          {plan.status}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Season Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl border-2 border-blue-200 bg-white opacity-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <DialogHeader className="pb-4 border-b border-blue-200">
            <DialogTitle className="text-2xl font-bold text-blue-900">Create Season Plan</DialogTitle>
            <DialogDescription className="text-blue-700 mt-2">
              Define expected harvest volume and dates for a farmer's commodity production
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farmerId" className="text-base font-semibold text-gray-700">
                  Farmer <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.farmerId}
                  onValueChange={(value) => setFormData({ ...formData, farmerId: value })}
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
                <Label htmlFor="commodityId" className="text-base font-semibold text-gray-700">
                  Commodity <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.commodityId}
                  onValueChange={(value) => setFormData({ ...formData, commodityId: value })}
                  required
                >
                  <SelectTrigger style={{ border: '2px solid lightblue' }}>
                    <SelectValue placeholder="Select commodity" />
                  </SelectTrigger>
                  <SelectContent>
                    {commodities.map((commodity) => (
                      <SelectItem key={commodity.id} value={commodity.id}>
                        {commodity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="season" className="text-base font-semibold text-gray-700">
                  Season <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.season}
                  onValueChange={(value) => setFormData({ ...formData, season: value })}
                  required
                >
                  <SelectTrigger style={{ border: '2px solid lightblue' }}>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Season A</SelectItem>
                    <SelectItem value="B">Season B</SelectItem>
                    <SelectItem value="C">Season C</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plotHerdReference" className="text-base font-semibold text-gray-700">
                  Plot / Herd Reference
                </Label>
                <Input
                  id="plotHerdReference"
                  value={formData.plotHerdReference}
                  onChange={(e) => setFormData({ ...formData, plotHerdReference: e.target.value })}
                  placeholder="Plot ID or herd reference"
                  style={{ border: '2px solid lightblue' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedHarvestVolume" className="text-base font-semibold text-gray-700">
                Expected Harvest Volume <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expectedHarvestVolume"
                type="number"
                step="0.01"
                value={formData.expectedHarvestVolume}
                onChange={(e) => setFormData({ ...formData, expectedHarvestVolume: e.target.value })}
                placeholder="Expected volume"
                style={{ border: '2px solid lightblue' }}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedHarvestStartDate" className="text-base font-semibold text-gray-700">
                  Harvest Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="expectedHarvestStartDate"
                  type="date"
                  value={formData.expectedHarvestStartDate}
                  onChange={(e) => setFormData({ ...formData, expectedHarvestStartDate: e.target.value })}
                  style={{ border: '2px solid lightblue' }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedHarvestEndDate" className="text-base font-semibold text-gray-700">
                  Harvest End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="expectedHarvestEndDate"
                  type="date"
                  value={formData.expectedHarvestEndDate}
                  onChange={(e) => setFormData({ ...formData, expectedHarvestEndDate: e.target.value })}
                  style={{ border: '2px solid lightblue' }}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collectionFrequency" className="text-base font-semibold text-gray-700">
                  Collection Frequency
                </Label>
                <Select
                  value={formData.collectionFrequency}
                  onValueChange={(value) => setFormData({ ...formData, collectionFrequency: value })}
                >
                  <SelectTrigger style={{ border: '2px solid lightblue' }}>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="harvest_window">Harvest Window</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region" className="text-base font-semibold text-gray-700">Region</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="Region"
                  style={{ border: '2px solid lightblue' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-base font-semibold text-gray-700">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger style={{ border: '2px solid lightblue' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNED">Planned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Season Plan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
