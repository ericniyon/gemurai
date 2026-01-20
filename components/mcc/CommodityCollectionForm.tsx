"use client"

import { useState, useEffect } from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Package, Save, X, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { GeoLocationInput } from "@/components/ui/geo-location-input"

interface CommodityCollectionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CommodityCollectionForm({
  open,
  onOpenChange,
  onSuccess,
}: CommodityCollectionFormProps) {
  const { user } = useAuth()
  const [commodities, setCommodities] = useState<any[]>([])
  const [selectedCommodity, setSelectedCommodity] = useState<any>(null)
  const [farmers, setFarmers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    commodityId: "",
    farmerId: "",
    quantity: 0,
    pricePerUnit: 0,
    qualityData: {} as Record<string, any>,
    advances: 0,
    agentAdvance: 0,
    notes: "",
    gpsLatitude: null as number | null,
    gpsLongitude: null as number | null,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && user?.mccId) {
      fetchCommodities()
      fetchFarmers()
    }
  }, [open, user?.mccId])

  const fetchCommodities = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/admin/commodity-studio/commodities", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCommodities(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching commodities:", error)
    }
  }

  const fetchFarmers = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/mcc/farmers?mccId=${user?.mccId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFarmers(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching farmers:", error)
    }
  }

  const handleCommodityChange = (commodityId: string) => {
    const commodity = commodities.find((c) => c.id === commodityId)
    setSelectedCommodity(commodity)
    setFormData((prev) => ({
      ...prev,
      commodityId,
      qualityData: {}, // Reset quality data when commodity changes
    }))
  }

  const handleQualityFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      qualityData: {
        ...prev.qualityData,
        [fieldName]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.commodityId || !formData.farmerId || !formData.quantity || !formData.pricePerUnit) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!user?.mccId) {
      toast.error("Your profile is not assigned to an MCC")
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/mcc/commodities/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          commodityId: formData.commodityId,
          farmerId: formData.farmerId,
          mccId: user.mccId,
          collectionDate: new Date().toISOString(),
          quantity: formData.quantity,
          unit: selectedCommodity?.unitOfMeasure || "kg",
          qualityData: formData.qualityData,
          pricePerUnit: formData.pricePerUnit,
          advances: formData.advances || 0,
          agentAdvance: formData.agentAdvance || 0,
          notes: formData.notes || undefined,
          gpsLatitude: formData.gpsLatitude,
          gpsLongitude: formData.gpsLongitude,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Commodity collection recorded successfully")
        onSuccess?.()
        onOpenChange(false)
        // Reset form
        setFormData({
          commodityId: "",
          farmerId: "",
          quantity: 0,
          pricePerUnit: 0,
          qualityData: {},
          advances: 0,
          agentAdvance: 0,
          notes: "",
          gpsLatitude: null,
          gpsLongitude: null,
        })
        setSelectedCommodity(null)
      } else {
        toast.error(result.error || "Failed to record collection")
      }
    } catch (error) {
      console.error("Error recording collection:", error)
      toast.error("Failed to record collection")
    } finally {
      setIsLoading(false)
    }
  }

  const renderQualityField = (field: any): JSX.Element => {
    if (field.fieldType === "NUMERIC") {
      return (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={`quality-${field.id}`}>
            {field.fieldName} {field.isMandatory && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={`quality-${field.id}`}
            type="number"
            step={field.dataType === "INTEGER" ? "1" : "0.01"}
            value={formData.qualityData[field.fieldName] || ""}
            onChange={(e) =>
              handleQualityFieldChange(field.fieldName, parseFloat(e.target.value) || undefined)
            }
            required={field.isMandatory}
            placeholder={`Enter ${field.fieldName}`}
          />
          {field.description && (
            <p className="text-xs text-gray-500">{field.description}</p>
          )}
        </div>
      )
    }

    if (field.fieldType === "DROPDOWN") {
      return (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={`quality-${field.id}`}>
            {field.fieldName} {field.isMandatory && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={formData.qualityData[field.fieldName] || ""}
            onValueChange={(value) => handleQualityFieldChange(field.fieldName, value)}
            required={field.isMandatory}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.fieldName}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options && Array.isArray(field.options) ? (
                field.options.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      )
    }

    if (field.fieldType === "BOOLEAN") {
      return (
        <div key={field.id} className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`quality-${field.id}`}
              checked={formData.qualityData[field.fieldName] || false}
              onChange={(e) =>
                handleQualityFieldChange(field.fieldName, e.target.checked)
              }
              className="rounded"
              required={field.isMandatory}
            />
            <Label htmlFor={`quality-${field.id}`}>
              {field.fieldName} {field.isMandatory && <span className="text-red-500">*</span>}
            </Label>
          </div>
        </div>
      )
    }

    // Default case
    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={`quality-${field.id}`}>
          {field.fieldName} {field.isMandatory && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id={`quality-${field.id}`}
          value={formData.qualityData[field.fieldName] || ""}
          onChange={(e) => handleQualityFieldChange(field.fieldName, e.target.value)}
          required={field.isMandatory}
        />
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Record Commodity Collection
          </DialogTitle>
          <DialogDescription>
            Multi-Commodity Collection: Select commodity to auto-load quality fields, pricing, and storage settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Commodity Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Commodity Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commodityId">
                  Commodity <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.commodityId}
                  onValueChange={handleCommodityChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select commodity" />
                  </SelectTrigger>
                  <SelectContent>
                    {commodities.map((commodity) => (
                      <SelectItem key={commodity.id} value={commodity.id}>
                        {commodity.name} ({commodity.code}) - {commodity.unitOfMeasure}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCommodity && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Category:</span>
                    <span>{selectedCommodity.category?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Pricing Method:</span>
                    <span>{selectedCommodity.pricingMethod}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Storage Type:</span>
                    <span>{selectedCommodity.storageType}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Collection Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmerId">
                    Farmer <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.farmerId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, farmerId: value }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select farmer" />
                    </SelectTrigger>
                    <SelectContent>
                      {farmers.map((farmer) => (
                        <SelectItem key={farmer.id} value={farmer.id}>
                          {farmer.name} - {farmer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={formData.quantity || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          quantity: parseFloat(e.target.value) || 0,
                        }))
                      }
                      required
                    />
                    <span className="text-sm text-gray-500">
                      {selectedCommodity?.unitOfMeasure || "units"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">
                  Price per Unit <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  step="0.01"
                  value={formData.pricePerUnit || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricePerUnit: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Quality Fields */}
          {selectedCommodity && selectedCommodity.qualityFields?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Assessment</CardTitle>
                <CardDescription>
                  Quality fields for {selectedCommodity.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCommodity.qualityFields.map((field: any) =>
                    renderQualityField(field)
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advances */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advances & Prepayments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="advances">Farmer Advances</Label>
                  <Input
                    id="advances"
                    type="number"
                    step="0.01"
                    value={formData.advances || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        advances: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agentAdvance">Agent Prepayment</Label>
                  <Input
                    id="agentAdvance"
                    type="number"
                    step="0.01"
                    value={formData.agentAdvance || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        agentAdvance: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Geo-location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <GeoLocationInput
                latitude={formData.gpsLatitude}
                longitude={formData.gpsLongitude}
                onLocationChange={(lat, lng) => {
                  setFormData((prev) => ({
                    ...prev,
                    gpsLatitude: lat,
                    gpsLongitude: lng,
                  }))
                }}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Record Collection
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
