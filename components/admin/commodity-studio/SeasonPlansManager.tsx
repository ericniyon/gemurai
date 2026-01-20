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
import { Plus, Calendar, Package } from "lucide-react"

export function SeasonPlansManager() {
  const [commodities, setCommodities] = useState<any[]>([])
  const [selectedCommodity, setSelectedCommodity] = useState<string>("")
  const [seasonPlans, setSeasonPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    season: "",
    expectedHarvestVolume: "",
    expectedHarvestStartDate: "",
    expectedHarvestEndDate: "",
    collectionFrequency: "",
    notes: "",
  })

  useEffect(() => {
    fetchCommodities()
  }, [])

  useEffect(() => {
    if (selectedCommodity) {
      // Note: Season plans are typically farmer-specific, but we can show templates or examples
      // For admin view, we might want to show all season plans or create templates
      setSeasonPlans([])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !selectedCommodity ||
      !formData.season ||
      !formData.expectedHarvestVolume ||
      !formData.expectedHarvestStartDate ||
      !formData.expectedHarvestEndDate
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    toast.info(
      "Season plans are typically created by farmers. This is a template/example view."
    )
    setIsDialogOpen(false)
    setFormData({
      season: "",
      expectedHarvestVolume: "",
      expectedHarvestStartDate: "",
      expectedHarvestEndDate: "",
      collectionFrequency: "",
      notes: "",
    })
  }

  const selectedCommodityData = commodities.find((c) => c.id === selectedCommodity)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Season Plans Configuration</CardTitle>
            <CardDescription>
              Configure season plans and collection frequency for commodities. Season plans are
              typically created by farmers, but you can set default collection frequencies here.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Commodity</Label>
            <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
              <SelectTrigger>
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
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Collection Frequency for {selectedCommodityData?.name}
                  </CardTitle>
                  <CardDescription>
                    Default collection frequency:{" "}
                    <Badge variant="outline">
                      {selectedCommodityData?.defaultCollectionFrequency || "Not set"}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Collection frequency is configured when creating or editing a commodity. You can
                    update it in the Commodities tab.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Season Plan Template</CardTitle>
                  <CardDescription>
                    Create a template season plan for {selectedCommodityData?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>
                      Season plans are typically created by farmers for their specific plots/herds.
                      As an admin, you can:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Set default collection frequencies per commodity</li>
                      <li>Define season templates (Season A, B, C, or custom)</li>
                      <li>Configure expected harvest windows</li>
                    </ul>
                    <p className="pt-2">
                      To configure collection frequency, go to the{" "}
                      <strong>Commodities</strong> tab and edit the commodity.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between pt-4 border-t">
                <h3 className="font-semibold">Season Plan Examples</h3>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>

              {seasonPlans.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border rounded-lg">
                  No season plan templates. Season plans are created by farmers.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {seasonPlans.map((plan) => (
                    <Card key={plan.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            <CardTitle className="text-lg">Season {plan.season}</CardTitle>
                          </div>
                          <Badge variant="outline">{plan.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-600">Expected Volume:</span>{" "}
                          {plan.expectedHarvestVolume} {selectedCommodityData?.unitOfMeasure}
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Start Date:</span>{" "}
                          {new Date(plan.expectedHarvestStartDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">End Date:</span>{" "}
                          {new Date(plan.expectedHarvestEndDate).toLocaleDateString()}
                        </div>
                        {plan.collectionFrequency && (
                          <div className="text-sm">
                            <span className="text-gray-600">Frequency:</span>{" "}
                            <Badge variant="outline">{plan.collectionFrequency}</Badge>
                          </div>
                        )}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Season Plan Template</DialogTitle>
            <DialogDescription>
              Create a template season plan for {selectedCommodityData?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="season">
                Season <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.season}
                onValueChange={(value) => setFormData({ ...formData, season: value })}
                required
              >
                <SelectTrigger>
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
              <Label htmlFor="expectedHarvestVolume">
                Expected Harvest Volume ({selectedCommodityData?.unitOfMeasure}){" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expectedHarvestVolume"
                type="number"
                step="0.01"
                value={formData.expectedHarvestVolume}
                onChange={(e) =>
                  setFormData({ ...formData, expectedHarvestVolume: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedHarvestStartDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="expectedHarvestStartDate"
                  type="date"
                  value={formData.expectedHarvestStartDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedHarvestStartDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedHarvestEndDate">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="expectedHarvestEndDate"
                  type="date"
                  value={formData.expectedHarvestEndDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedHarvestEndDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collectionFrequency">Collection Frequency</Label>
              <Select
                value={formData.collectionFrequency}
                onValueChange={(value) =>
                  setFormData({ ...formData, collectionFrequency: value })
                }
              >
                <SelectTrigger>
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setFormData({
                    season: "",
                    expectedHarvestVolume: "",
                    expectedHarvestStartDate: "",
                    expectedHarvestEndDate: "",
                    collectionFrequency: "",
                    notes: "",
                  })
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Create Template</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
