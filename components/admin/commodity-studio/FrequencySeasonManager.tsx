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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import Swal from "sweetalert2"
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Info, Loader2 } from "lucide-react"

export function FrequencySeasonManager() {
  const [commodities, setCommodities] = useState<any[]>([])
  const [selectedCommodity, setSelectedCommodity] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isFrequencyDialogOpen, setIsFrequencyDialogOpen] = useState(false)
  const [isSavingFrequency, setIsSavingFrequency] = useState(false)
  const [isSeasonDialogOpen, setIsSeasonDialogOpen] = useState(false)
  const [isSavingSeason, setIsSavingSeason] = useState(false)
  const [seasonTemplates, setSeasonTemplates] = useState<any[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [frequencyFormData, setFrequencyFormData] = useState({
    defaultCollectionFrequency: "",
    recordingCadence: "",
  })
  const [seasonFormData, setSeasonFormData] = useState({
    season: "",
    customSeasonName: "",
    expectedHarvestStartDate: "",
    expectedHarvestEndDate: "",
    collectionFrequency: "",
    region: "",
    notes: "",
  })

  useEffect(() => {
    fetchCommodities()
  }, [])

  useEffect(() => {
    if (selectedCommodity) {
      const commodity = commodities.find((c) => c.id === selectedCommodity)
      if (commodity) {
        setFrequencyFormData({
          defaultCollectionFrequency: commodity.defaultCollectionFrequency || "",
          recordingCadence: commodity.defaultCollectionFrequency || "",
        })
      }
      fetchSeasonTemplates()
    } else {
      setSeasonTemplates([])
    }
  }, [selectedCommodity, commodities, selectedRegion])

  const fetchSeasonTemplates = async () => {
    if (!selectedCommodity) return

    try {
      const token = localStorage.getItem("Gemurai_token")
      const params = new URLSearchParams()
      if (selectedRegion && selectedRegion !== "all") {
        params.set("region", selectedRegion)
      }

      const response = await fetch(
        `/api/v1/admin/commodity-studio/commodities/${selectedCommodity}/season-templates?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setSeasonTemplates(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching season templates:", error)
    }
  }

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

  const handleUpdateFrequency = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCommodity || !frequencyFormData.defaultCollectionFrequency) {
      await Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Please select a commodity and set collection frequency.",
        timer: 2000,
        showConfirmButton: false,
      })
      return
    }

    const commodity = commodities.find((c) => c.id === selectedCommodity)
    if (!commodity) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Commodity not found.",
        timer: 2000,
        showConfirmButton: false,
      })
      return
    }

    setIsSavingFrequency(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(
        `/api/v1/admin/commodity-studio/commodities/${selectedCommodity}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...commodity,
            defaultCollectionFrequency: frequencyFormData.defaultCollectionFrequency,
          }),
        }
      )

      const result = await response.json()

      if (response.ok && result.success) {
        await Swal.fire({
          icon: "success",
          title: "Frequency saved",
          text: "Collection frequency updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        })
        setIsFrequencyDialogOpen(false)
        fetchCommodities()
      } else {
        await Swal.fire({
          icon: "error",
          title: "Failed to save",
          text: result.error || "Could not update collection frequency.",
          timer: 2000,
          showConfirmButton: false,
        })
      }
    } catch (error) {
      console.error("Error updating collection frequency:", error)
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update collection frequency. Please try again.",
        timer: 2000,
        showConfirmButton: false,
      })
    } finally {
      setIsSavingFrequency(false)
    }
  }

  const selectedCommodityData = commodities.find((c) => c.id === selectedCommodity)

  const handleCreateSeasonTemplate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCommodity || !seasonFormData.season || !seasonFormData.expectedHarvestStartDate || !seasonFormData.expectedHarvestEndDate) {
      toast.error("Please fill in all required fields: season, harvest start date, and harvest end date")
      return
    }

    // If custom season is selected, require custom season name
    if (seasonFormData.season === "custom" && !seasonFormData.customSeasonName.trim()) {
      toast.error("Please enter a custom season name")
      return
    }

    setIsSavingSeason(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const seasonValue = seasonFormData.season === "custom" ? seasonFormData.customSeasonName : seasonFormData.season

      const response = await fetch(
        `/api/v1/admin/commodity-studio/commodities/${selectedCommodity}/season-templates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            season: seasonValue,
            expectedHarvestStartDate: seasonFormData.expectedHarvestStartDate,
            expectedHarvestEndDate: seasonFormData.expectedHarvestEndDate,
            collectionFrequency: seasonFormData.collectionFrequency || undefined,
            region: seasonFormData.region || undefined,
            notes: seasonFormData.notes || undefined,
          }),
        }
      )

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Season template created successfully")
        setIsSeasonDialogOpen(false)
        setSeasonFormData({
          season: "",
          customSeasonName: "",
          expectedHarvestStartDate: "",
          expectedHarvestEndDate: "",
          collectionFrequency: "",
          region: "",
          notes: "",
        })
        fetchSeasonTemplates() // Refresh templates list
      } else {
        toast.error(result.error || "Failed to create season template")
      }
    } catch (error) {
      console.error("Error creating season template:", error)
      toast.error("Failed to create season template")
    } finally {
      setIsSavingSeason(false)
    }
  }

  const getFrequencyExamples = () => {
    if (!selectedCommodityData) return []
    const name = selectedCommodityData.name.toLowerCase()
    if (name.includes("milk") || name.includes("dairy")) {
      return [{ frequency: "daily", description: "Dairy: Daily collection" }]
    }
    if (name.includes("coffee")) {
      return [
        { frequency: "seasonal", description: "Coffee: Seasonal + weekly during harvest" },
        { frequency: "weekly", description: "Weekly during harvest window" },
      ]
    }
    if (name.includes("maize") || name.includes("cereal")) {
      return [
        { frequency: "seasonal", description: "Cereals: Seasonal + harvest window" },
        { frequency: "harvest_window", description: "During harvest period" },
      ]
    }
    return []
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 shadow-sm">
        <CardHeader className="border-b border-blue-200">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-2xl font-bold text-blue-900">Frequency & Season Settings</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Configure collection frequency and season calendars for commodities
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
            <Tabs defaultValue="frequency" className="space-y-4">
              <TabsList className="bg-blue-50 border-2 border-blue-200 p-1 rounded-lg">
                <TabsTrigger
                  value="frequency"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=inactive]:text-blue-700 font-semibold"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Collection Frequency
                </TabsTrigger>
                <TabsTrigger 
                  value="seasons"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=inactive]:text-blue-700 font-semibold"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Seasons & Calendars
                </TabsTrigger>
              </TabsList>

              <TabsContent value="frequency" className="space-y-4">
                <Card className="border-2 border-blue-200 shadow-sm">
                  <CardHeader className="border-b border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-blue-900">
                          Collection Frequency for {selectedCommodityData?.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          Set the default recording cadence for this commodity
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={() => setIsFrequencyDialogOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-blue-200">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-900">Current Frequency:</p>
                        <Badge variant="outline" className="mt-1 border-blue-600 text-blue-700 font-semibold">
                          {selectedCommodityData?.defaultCollectionFrequency || "Not set"}
                        </Badge>
                      </div>
                    </div>

                    {getFrequencyExamples().length > 0 && (
                      <div className="mt-4 p-4 rounded-lg border-2 border-blue-200">
                        <p className="text-sm font-bold mb-3 text-blue-900 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Recommended Frequencies:
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {getFrequencyExamples().map((example, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Badge variant="outline" className="border-blue-600 text-blue-700 font-semibold">{example.frequency}</Badge>
                              <span>{example.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 p-5 rounded-lg border-2 border-blue-200">
                      <p className="text-sm font-bold mb-3 text-blue-900 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Frequency Options:
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
                          <span><strong className="text-blue-900">Daily:</strong> For perishables like dairy, fish, horticulture</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
                          <span><strong className="text-blue-900">Weekly:</strong> For commodities collected weekly during active periods</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
                          <span><strong className="text-blue-900">Seasonal:</strong> For crops with defined seasons (A/B/C)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
                          <span><strong className="text-blue-900">Harvest Window:</strong> For crops collected during specific harvest periods</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seasons" className="space-y-4">
                <Card className="border-2 border-blue-200 shadow-sm">
                  <CardHeader className="border-b border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-blue-900">Season Configuration</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          Define seasons (A/B/C or custom) and region-specific calendars
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={() => setIsSeasonDialogOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Season
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border-2 border-blue-200">
                        <p className="text-sm text-gray-700 flex items-start gap-2">
                          <Info className="h-4 w-4 mt-0.5 text-blue-600" />
                          <span>
                            <strong className="text-blue-900">Season Planning:</strong> Define expected harvest windows and
                            collection frequencies for different seasons. This helps farmers plan
                            their production cycles.
                          </span>
                        </p>
                      </div>

                      {/* Region Filter */}
                      <div className="space-y-2">
                        <Label className="text-base font-semibold text-gray-700">Filter by Region (Optional)</Label>
                        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                          <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500">
                            <SelectValue placeholder="All regions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All regions</SelectItem>
                            <SelectItem value="Northern Province">Northern Province</SelectItem>
                            <SelectItem value="Southern Province">Southern Province</SelectItem>
                            <SelectItem value="Eastern Province">Eastern Province</SelectItem>
                            <SelectItem value="Western Province">Western Province</SelectItem>
                            <SelectItem value="Kigali">Kigali</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-blue-700">
                          Filter season templates by region to see region-specific calendars
                        </p>
                      </div>

                      {/* Display Created Season Templates */}
                      {seasonTemplates.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-bold text-blue-900">Defined Season Templates:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {seasonTemplates.map((template) => (
                              <Card key={template.id} className="border-2 border-blue-200">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-blue-900">
                                      {template.season}
                                    </CardTitle>
                                    {template.region && (
                                      <Badge variant="outline" className="border-blue-300 text-blue-700">
                                        {template.region}
                                      </Badge>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-600">Harvest Window:</span>
                                    <p className="text-gray-800">
                                      {new Date(template.expectedHarvestStartDate).toLocaleDateString()} - {new Date(template.expectedHarvestEndDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  {template.collectionFrequency && (
                                    <div>
                                      <span className="font-medium text-gray-600">Frequency:</span>
                                      <Badge variant="outline" className="ml-2 border-blue-300 text-blue-700 capitalize">
                                        {template.collectionFrequency}
                                      </Badge>
                                    </div>
                                  )}
                                  {template.notes && (
                                    <p className="text-xs text-gray-600 italic">{template.notes}</p>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
                          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                            <CardTitle className="text-base font-bold">Season A</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="text-sm text-gray-700 font-medium">
                              Typically March - May (First rainy season)
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
                          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                            <CardTitle className="text-base font-bold">Season B</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="text-sm text-gray-700 font-medium">
                              Typically September - December (Second rainy season)
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="border-2 border-purple-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md">
                          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            <CardTitle className="text-base font-bold">Season C</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="text-sm text-gray-700 font-medium">
                              Typically June - August (Dry season / Off-season)
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="p-5 rounded-lg border-2 border-blue-200">
                        <p className="text-sm font-bold mb-2 text-blue-900 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Region-Specific Calendars:
                        </p>
                        <p className="text-sm text-gray-700">
                          You can define custom seasons and harvest windows for specific regions.
                          This allows for variations in climate and growing conditions across
                          Rwanda.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Frequency Configuration Dialog */}
      <Dialog open={isFrequencyDialogOpen} onOpenChange={setIsFrequencyDialogOpen}>
        <DialogContent className="max-w-2xl border-2 border-blue-200 bg-white opacity-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <DialogHeader className="pb-4 border-b border-blue-100">
            <DialogTitle className="text-2xl font-bold text-blue-900">Configure Collection Frequency</DialogTitle>
            <DialogDescription className="text-blue-700 mt-2">
              Set the default collection frequency for <span className="font-semibold">{selectedCommodityData?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateFrequency} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultCollectionFrequency" className="text-base font-semibold text-gray-700">
                Collection Frequency <span className="text-red-500">*</span>
              </Label>
              <Select
                value={frequencyFormData.defaultCollectionFrequency}
                onValueChange={(value) =>
                  setFrequencyFormData({ ...frequencyFormData, defaultCollectionFrequency: value })
                }
                required
              >
                <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="harvest_window">Harvest Window</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-blue-700">
                This will be the default frequency for all collections of this commodity
              </p>
            </div>

            <DialogFooter className="gap-2 pt-4 border-t border-blue-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFrequencyDialogOpen(false)}
                className="border-blue-200 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSavingFrequency}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-70"
              >
                {isSavingFrequency ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Frequency"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Season Configuration Dialog */}
      <Dialog open={isSeasonDialogOpen} onOpenChange={setIsSeasonDialogOpen}>
        <DialogContent className="max-w-2xl border-2 border-blue-500 bg-white opacity-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <DialogHeader className="pb-4 border-b border-blue-200">
            <DialogTitle className="text-2xl font-bold text-blue-900">Add Season Configuration</DialogTitle>
            <DialogDescription className="text-blue-700 mt-2">
              Define a season template for <span className="font-semibold">{selectedCommodityData?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleCreateSeasonTemplate}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="season" className="text-base font-semibold text-gray-700">
                Season <span className="text-red-500">*</span>
              </Label>
              <Select
                value={seasonFormData.season}
                onValueChange={(value) => setSeasonFormData({ ...seasonFormData, season: value, customSeasonName: value === "custom" ? seasonFormData.customSeasonName : "" })}
                required
              >
                <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500">
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Season A (March - May)</SelectItem>
                  <SelectItem value="B">Season B (September - December)</SelectItem>
                  <SelectItem value="C">Season C (June - August)</SelectItem>
                  <SelectItem value="custom">Custom Season</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {seasonFormData.season === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customSeasonName" className="text-base font-semibold text-gray-700">
                  Custom Season Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customSeasonName"
                  value={seasonFormData.customSeasonName}
                  onChange={(e) => setSeasonFormData({ ...seasonFormData, customSeasonName: e.target.value })}
                  placeholder="e.g. Dry Season, Rainy Season, Off-Season"
                  className="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required={seasonFormData.season === "custom"}
                />
                <p className="text-xs text-blue-700">
                  Enter a name for your custom season
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedHarvestStartDate" className="text-base font-semibold text-gray-700">Harvest Start Date</Label>
                <Input
                  id="expectedHarvestStartDate"
                  type="date"
                  value={seasonFormData.expectedHarvestStartDate}
                  onChange={(e) =>
                    setSeasonFormData({ ...seasonFormData, expectedHarvestStartDate: e.target.value })
                  }
                  style={{ border: '2px solid lightblue' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedHarvestEndDate" className="text-base font-semibold text-gray-700">Harvest End Date</Label>
                <Input
                  id="expectedHarvestEndDate"
                  type="date"
                  value={seasonFormData.expectedHarvestEndDate}
                  onChange={(e) =>
                    setSeasonFormData({ ...seasonFormData, expectedHarvestEndDate: e.target.value })
                  }
                  style={{ border: '2px solid lightblue' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collectionFrequency" className="text-base font-semibold text-gray-700">Collection Frequency During Season</Label>
              <Select
                value={seasonFormData.collectionFrequency}
                onValueChange={(value) =>
                  setSeasonFormData({ ...seasonFormData, collectionFrequency: value })
                }
              >
                <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="text-base font-semibold text-gray-700">Region (Optional)</Label>
              <Input
                id="region"
                value={seasonFormData.region}
                onChange={(e) => setSeasonFormData({ ...seasonFormData, region: e.target.value })}
                placeholder="e.g. Northern Province, Eastern Province"
                className="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <p className="text-xs text-blue-700">
                Leave empty for default, or specify for region-specific calendars
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold text-gray-700">Notes</Label>
              <Textarea
                id="notes"
                value={seasonFormData.notes}
                onChange={(e) => setSeasonFormData({ ...seasonFormData, notes: e.target.value })}
                placeholder="Additional notes about this season"
                rows={3}
                style={{ border: '2px solid lightblue' }}
              />
            </div>

            <DialogFooter className="gap-2 pt-4 border-t-2 border-blue-300">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSeasonDialogOpen(false)
                  setSeasonFormData({
                    season: "",
                    customSeasonName: "",
                    expectedHarvestStartDate: "",
                    expectedHarvestEndDate: "",
                    collectionFrequency: "",
                    region: "",
                    notes: "",
                  })
                }}
                className="border-blue-200 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSavingSeason}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-70"
              >
                {isSavingSeason ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Season"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
