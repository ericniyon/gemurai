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
import { Plus, Calendar, TrendingUp, Loader2, User } from "lucide-react"

interface SeasonPlanManagerProps {
  triggerOpenAddDialog?: boolean
  onTriggerConsumed?: () => void
}

export function SeasonPlanManager({ triggerOpenAddDialog, onTriggerConsumed }: SeasonPlanManagerProps = {}) {
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

  useEffect(() => {
    if (triggerOpenAddDialog) {
      setIsDialogOpen(true)
      onTriggerConsumed?.()
    }
  }, [triggerOpenAddDialog, onTriggerConsumed])

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
        <DialogContent className="flex max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-2xl">
          <div className="shrink-0 border-b border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-6 pt-6 pb-4">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100/80 p-2.5">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Create Season Plan</DialogTitle>
                  <DialogDescription className="mt-1 text-slate-600">
                    Define expected harvest volume and dates for a farmer&apos;s commodity production
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
                  Farmer & Commodity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmerId" className="text-sm font-semibold text-slate-700">Farmer <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      value={formData.farmerId}
                      onValueChange={(value) => setFormData({ ...formData, farmerId: value })}
                      options={farmers.map((f) => ({ value: f.id, label: f.name }))}
                      placeholder="Select farmer"
                      searchPlaceholder="Search farmers..."
                      emptyText="No farmer found."
                      className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commodityId" className="text-sm font-semibold text-slate-700">Commodity <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      value={formData.commodityId}
                      onValueChange={(value) => setFormData({ ...formData, commodityId: value })}
                      options={commodities.map((c) => ({ value: c.id, label: c.name }))}
                      placeholder="Select commodity"
                      searchPlaceholder="Search commodities..."
                      emptyText="No commodity found."
                      className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Season & Harvest
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="season" className="text-sm font-semibold text-slate-700">Season <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      value={formData.season}
                      onValueChange={(value) => setFormData({ ...formData, season: value })}
                      options={[
                        { value: "A", label: "Season A" },
                        { value: "B", label: "Season B" },
                        { value: "C", label: "Season C" },
                        { value: "custom", label: "Custom" },
                      ]}
                      placeholder="Select season"
                      searchPlaceholder="Search season..."
                      emptyText="No season found."
                      className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plotHerdReference" className="text-sm font-semibold text-slate-700">Plot / Herd Reference</Label>
                    <Input
                      id="plotHerdReference"
                      value={formData.plotHerdReference}
                      onChange={(e) => setFormData({ ...formData, plotHerdReference: e.target.value })}
                      placeholder="Plot ID or herd reference"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="expectedHarvestVolume" className="text-sm font-semibold text-slate-700">Expected Harvest Volume <span className="text-red-500">*</span></Label>
                    <Input
                      id="expectedHarvestVolume"
                      type="number"
                      step="0.01"
                      value={formData.expectedHarvestVolume}
                      onChange={(e) => setFormData({ ...formData, expectedHarvestVolume: e.target.value })}
                      placeholder="Expected volume"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedHarvestStartDate" className="text-sm font-semibold text-slate-700">Harvest Start Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="expectedHarvestStartDate"
                      type="date"
                      value={formData.expectedHarvestStartDate}
                      onChange={(e) => setFormData({ ...formData, expectedHarvestStartDate: e.target.value })}
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedHarvestEndDate" className="text-sm font-semibold text-slate-700">Harvest End Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="expectedHarvestEndDate"
                      type="date"
                      value={formData.expectedHarvestEndDate}
                      onChange={(e) => setFormData({ ...formData, expectedHarvestEndDate: e.target.value })}
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Frequency & Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="collectionFrequency" className="text-sm font-semibold text-slate-700">Collection Frequency</Label>
                    <SearchableSelect
                      value={formData.collectionFrequency}
                      onValueChange={(value) => setFormData({ ...formData, collectionFrequency: value })}
                      options={[
                        { value: "daily", label: "Daily" },
                        { value: "weekly", label: "Weekly" },
                        { value: "seasonal", label: "Seasonal" },
                        { value: "harvest_window", label: "Harvest Window" },
                      ]}
                      placeholder="Select frequency"
                      searchPlaceholder="Search frequency..."
                      emptyText="No option found."
                      className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-semibold text-slate-700">Status</Label>
                    <SearchableSelect
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                      options={[
                        { value: "PLANNED", label: "Planned" },
                        { value: "IN_PROGRESS", label: "In Progress" },
                        { value: "COMPLETED", label: "Completed" },
                        { value: "CANCELLED", label: "Cancelled" },
                      ]}
                      placeholder="Select status"
                      searchPlaceholder="Search status..."
                      emptyText="No option found."
                      className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-sm font-semibold text-slate-700">Region</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      placeholder="Region"
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
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700"
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
