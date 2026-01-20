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
import { Wheat, Save, X, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { GeoLocationInput } from "@/components/ui/geo-location-input"
import { Separator } from "@/components/ui/separator"

interface AddCropCollectionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface CropCollectionFormData {
  farmerId: string
  cropTypeId: string
  quantity: number
  unit: string
  pricePerUnit: number
  qualityTests: {
    moisture?: number
    grade?: string
    foreignMatter?: number
  }
  deductions: {
    products?: Array<{
      productId: string
      quantity: number
      unitPrice: number
    }>
    others?: {
      transport?: number
      storage?: number
    }
  }
  advances: number
  notes: string
  gpsLatitude?: number | null
  gpsLongitude?: number | null
}

export function AddCropCollectionForm({
  open,
  onOpenChange,
  onSuccess,
}: AddCropCollectionFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<CropCollectionFormData>({
    farmerId: "",
    cropTypeId: "",
    quantity: 0,
    unit: "kg",
    pricePerUnit: 0,
    qualityTests: {},
    deductions: {},
    advances: 0,
    notes: "",
    gpsLatitude: null,
    gpsLongitude: null,
  })

  const [farmers, setFarmers] = useState<any[]>([])
  const [cropTypes, setCropTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CropCollectionFormData, string>>>({})

  useEffect(() => {
    if (open && user?.mccId) {
      fetchFarmers()
      fetchCropTypes()
    }
  }, [open, user?.mccId])

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

  const fetchCropTypes = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/mcc/crops/types", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCropTypes(data.data || [])
        // Set default price if crop type selected
        if (data.data?.length > 0 && !formData.cropTypeId) {
          const firstType = data.data[0]
          setFormData((prev) => ({
            ...prev,
            pricePerUnit: firstType.defaultPricePerUnit || 0,
            unit: firstType.unitOfMeasure || "kg",
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching crop types:", error)
    }
  }

  const handleCropTypeChange = (cropTypeId: string) => {
    const cropType = cropTypes.find((ct) => ct.id === cropTypeId)
    if (cropType) {
      setFormData((prev) => ({
        ...prev,
        cropTypeId,
        pricePerUnit: cropType.defaultPricePerUnit || 0,
        unit: cropType.unitOfMeasure || "kg",
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CropCollectionFormData, string>> = {}

    if (!formData.farmerId) newErrors.farmerId = "Farmer is required"
    if (!formData.cropTypeId) newErrors.cropTypeId = "Crop type is required"
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0"
    if (!formData.pricePerUnit || formData.pricePerUnit <= 0)
      newErrors.pricePerUnit = "Price per unit must be greater than 0"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    if (!user?.mccId) {
      toast.error("Your profile is not assigned to an MCC")
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/mcc/crops/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farmerId: formData.farmerId,
          mccId: user.mccId,
          collectionDate: new Date().toISOString(),
          cropTypeId: formData.cropTypeId,
          quantity: formData.quantity,
          unit: formData.unit,
          qualityTests: Object.keys(formData.qualityTests).length > 0 ? formData.qualityTests : undefined,
          pricePerUnit: formData.pricePerUnit,
          deductions: Object.keys(formData.deductions).length > 0 ? formData.deductions : undefined,
          advances: formData.advances || 0,
          notes: formData.notes || undefined,
          gpsLatitude: formData.gpsLatitude,
          gpsLongitude: formData.gpsLongitude,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Crop collection recorded successfully")
        onSuccess?.()
        onOpenChange(false)
        // Reset form
        setFormData({
          farmerId: "",
          cropTypeId: "",
          quantity: 0,
          unit: "kg",
          pricePerUnit: 0,
          qualityTests: {},
          deductions: {},
          advances: 0,
          notes: "",
          gpsLatitude: null,
          gpsLongitude: null,
        })
        setErrors({})
      } else {
        toast.error(result.error || "Failed to record crop collection")
      }
    } catch (error) {
      console.error("Error recording crop collection:", error)
      toast.error("Failed to record crop collection")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wheat className="h-5 w-5" />
            Record Crop Collection
          </DialogTitle>
          <DialogDescription>
            Record a new crop collection from a farmer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  >
                    <SelectTrigger className={errors.farmerId ? "border-red-500" : ""}>
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
                  {errors.farmerId && (
                    <p className="text-sm text-red-500">{errors.farmerId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cropTypeId">
                    Crop Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.cropTypeId}
                    onValueChange={handleCropTypeChange}
                  >
                    <SelectTrigger className={errors.cropTypeId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.unitOfMeasure})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cropTypeId && (
                    <p className="text-sm text-red-500">{errors.cropTypeId}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Quantity <span className="text-red-500">*</span>
                  </Label>
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
                    className={errors.quantity ? "border-red-500" : ""}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-500">{errors.quantity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, unit: e.target.value }))
                    }
                    disabled
                  />
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
                    className={errors.pricePerUnit ? "border-red-500" : ""}
                  />
                  {errors.pricePerUnit && (
                    <p className="text-sm text-red-500">{errors.pricePerUnit}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quality Tests (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moisture">Moisture (%)</Label>
                  <Input
                    id="moisture"
                    type="number"
                    step="0.01"
                    value={formData.qualityTests.moisture || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        qualityTests: {
                          ...prev.qualityTests,
                          moisture: parseFloat(e.target.value) || undefined,
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={formData.qualityTests.grade || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        qualityTests: {
                          ...prev.qualityTests,
                          grade: e.target.value || undefined,
                        },
                      }))
                    }
                    placeholder="A, B, C, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foreignMatter">Foreign Matter (%)</Label>
                  <Input
                    id="foreignMatter"
                    type="number"
                    step="0.01"
                    value={formData.qualityTests.foreignMatter || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        qualityTests: {
                          ...prev.qualityTests,
                          foreignMatter: parseFloat(e.target.value) || undefined,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deductions & Advances */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deductions & Advances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="advances">Advances</Label>
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
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
