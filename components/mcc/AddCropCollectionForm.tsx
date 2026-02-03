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
import { toast } from "sonner"
import { Wheat, Loader2, User, Package, Calculator, FileText } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

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
  deductions: Record<string, unknown>
  advances: number
  notes: string
  gpsLatitude?: number | null
  gpsLongitude?: number | null
}

const inputClasses =
  "rounded-xl border border-emerald-200/80 bg-white text-sm shadow-sm transition placeholder:text-slate-400 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:ring-offset-0"

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

  // Auto-capture GPS when dialog opens (if browser supports and user allows)
  useEffect(() => {
    if (!open) return
    if (typeof navigator === "undefined" || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          gpsLatitude: pos.coords.latitude,
          gpsLongitude: pos.coords.longitude,
        }))
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [open])

  const fetchFarmers = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/mcc/farmers?mccId=${user?.mccId}`, {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCropTypes(data.data || [])
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

  const grossAmount = (formData.quantity || 0) * (formData.pricePerUnit || 0)
  const netAmount = grossAmount - (formData.advances || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl border border-emerald-100 bg-white shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-100 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <Wheat className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Record Crop Collection
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-0.5">
                Record a new crop collection from a farmer
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh]">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Collection details */}
            <section className="space-y-4 rounded-xl border border-emerald-100 bg-slate-50/40 px-4 py-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Package className="h-4 w-4 text-emerald-600" />
                Collection details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmerId" className="text-sm font-medium text-gray-700">
                    Farmer <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={formData.farmerId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, farmerId: value }))
                    }
                  >
                    <SelectTrigger
                      className={inputClasses + (errors.farmerId ? " border-rose-400" : "")}
                    >
                      <SelectValue placeholder="Select farmer" />
                    </SelectTrigger>
                    <SelectContent>
                      {farmers.map((farmer) => (
                        <SelectItem key={farmer.id} value={farmer.id}>
                          {farmer.name} {farmer.phone ? `· ${farmer.phone}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.farmerId && (
                    <p className="text-xs text-rose-500">{errors.farmerId}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cropTypeId" className="text-sm font-medium text-gray-700">
                    Crop type <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={formData.cropTypeId}
                    onValueChange={handleCropTypeChange}
                  >
                    <SelectTrigger
                      className={inputClasses + (errors.cropTypeId ? " border-rose-400" : "")}
                    >
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.unitOfMeasure || "kg"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cropTypeId && (
                    <p className="text-xs text-rose-500">{errors.cropTypeId}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.quantity || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        quantity: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className={inputClasses + (errors.quantity ? " border-rose-400" : "")}
                    placeholder="0"
                  />
                  {errors.quantity && (
                    <p className="text-xs text-rose-500">{errors.quantity}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
                    Unit
                  </Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    readOnly
                    className={inputClasses + " bg-slate-50 text-slate-600"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerUnit" className="text-sm font-medium text-gray-700">
                    Price per unit <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="pricePerUnit"
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.pricePerUnit || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pricePerUnit: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className={inputClasses + (errors.pricePerUnit ? " border-rose-400" : "")}
                    placeholder="0"
                  />
                  {errors.pricePerUnit && (
                    <p className="text-xs text-rose-500">{errors.pricePerUnit}</p>
                  )}
                </div>
              </div>
              {/* Total preview */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                <span className="text-sm font-medium text-emerald-800">Estimated total</span>
                <span className="text-lg font-bold text-emerald-700">
                  RF {netAmount >= 0 ? netAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0"}
                </span>
              </div>
              {formData.advances > 0 && (
                <p className="text-xs text-gray-500">
                  Gross: RF {grossAmount.toLocaleString()} − Advances: RF {formData.advances.toLocaleString()}
                </p>
              )}
            </section>

            {/* Quality (optional) */}
            <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Calculator className="h-4 w-4 text-slate-600" />
                Quality (optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moisture" className="text-sm font-medium text-gray-600">
                    Moisture (%)
                  </Label>
                  <Input
                    id="moisture"
                    type="number"
                    step="0.01"
                    value={formData.qualityTests.moisture ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        qualityTests: {
                          ...prev.qualityTests,
                          moisture: e.target.value ? parseFloat(e.target.value) : undefined,
                        },
                      }))
                    }
                    className={inputClasses}
                    placeholder="—"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-sm font-medium text-gray-600">
                    Grade
                  </Label>
                  <Input
                    id="grade"
                    value={formData.qualityTests.grade ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        qualityTests: {
                          ...prev.qualityTests,
                          grade: e.target.value || undefined,
                        },
                      }))
                    }
                    className={inputClasses}
                    placeholder="A, B, C"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foreignMatter" className="text-sm font-medium text-gray-600">
                    Foreign matter (%)
                  </Label>
                  <Input
                    id="foreignMatter"
                    type="number"
                    step="0.01"
                    value={formData.qualityTests.foreignMatter ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        qualityTests: {
                          ...prev.qualityTests,
                          foreignMatter: e.target.value ? parseFloat(e.target.value) : undefined,
                        },
                      }))
                    }
                    className={inputClasses}
                    placeholder="—"
                  />
                </div>
              </div>
            </section>

            {/* Deductions & advances */}
            <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <User className="h-4 w-4 text-slate-600" />
                Advances
              </h3>
              <div className="space-y-2">
                <Label htmlFor="advances" className="text-sm font-medium text-gray-600">
                  Advances (RF)
                </Label>
                <Input
                  id="advances"
                  type="number"
                  step="0.01"
                  min={0}
                  value={formData.advances || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      advances: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={inputClasses}
                  placeholder="0"
                />
              </div>
            </section>

            {/* Notes */}
            <section className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <FileText className="h-4 w-4 text-slate-600" />
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className={inputClasses + " resize-none"}
                placeholder="Optional notes..."
              />
            </section>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-gray-100 bg-slate-50/50 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-emerald-200 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording…
                </>
              ) : (
                "Record collection"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
