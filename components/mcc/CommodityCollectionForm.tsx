"use client"

import { useState, useEffect, useRef } from "react"
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
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "sonner"
import {
  Package,
  Loader2,
  User,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Check,
  FileCheck,
  Droplets,
  Coffee,
  Wheat,
  Layers,
  Warehouse as WarehouseIcon,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface CommodityCollectionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  /** When set (e.g. Agent Collection App), use this MCC for farmers and submit */
  overrideMccId?: string
  /** When set, pre-fill agent and hide agent selector (caller is the agent) */
  overrideAgentId?: string
}

const STEPS = [
  { id: 1, title: "Collection Type", icon: Layers, short: "Type" },
  { id: 2, title: "Commodity & Details", icon: Package, short: "Commodity & Details" },
  { id: 3, title: "Quality & Advances", icon: ClipboardList, short: "Quality & Advances" },
  { id: 4, title: "Review", icon: FileCheck, short: "Review" },
]

function getCollectionTypeIcon(name: string) {
  const n = (name || "").toLowerCase()
  if (n.includes("dairy") || n.includes("milk")) return Droplets
  if (n.includes("coffee")) return Coffee
  if (n.includes("cereal") || n.includes("grain") || n.includes("maize")) return Wheat
  return Package
}

/** Hide placeholder/lorem text from API (e.g. "Amet non tempor dol") in labels */
function isPlaceholderText(s: string | null | undefined): boolean {
  if (!s || typeof s !== "string") return true
  const t = s.toLowerCase()
  return /amet|lorem|dol(or)?|tempor|ipsum/.test(t)
}

export function CommodityCollectionForm({
  open,
  onOpenChange,
  onSuccess,
  overrideMccId,
  overrideAgentId,
}: CommodityCollectionFormProps) {
  const { user } = useAuth()
  const effectiveMccId = overrideMccId || user?.mccId
  const isAgentContext = Boolean(overrideAgentId)
  const [commodities, setCommodities] = useState<any[]>([])
  const [selectedCommodity, setSelectedCommodity] = useState<any>(null)
  const [farmers, setFarmers] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    collectionTypeId: "", // "all" or category id
    commodityId: "",
    farmerId: "",
    agentId: overrideAgentId || "", // Required for Milk & Dairy; pre-filled when agent app
    quantity: 0,
    pricePerUnit: 0,
    qualityData: {} as Record<string, any>,
    advances: 0,
    agentAdvance: 0,
    notes: "",
    warehouseId: "",
    locationId: "",
    productId: "",
    gpsLatitude: null as number | null,
    gpsLongitude: null as number | null,
  })
  const [globalWarehouses, setGlobalWarehouses] = useState<{ id: string; name: string; code: string }[]>([])
  const [warehouseLocations, setWarehouseLocations] = useState<{ id: string; name: string; code: string }[]>([])
  const [productsForReceiving, setProductsForReceiving] = useState<{ id: string; name: string; unit: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingCommodities, setLoadingCommodities] = useState(false)
  const [loadingFarmers, setLoadingFarmers] = useState(false)
  const [loadingAgents, setLoadingAgents] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (open && effectiveMccId) {
      fetchCommodities()
      fetchFarmers()
      if (!isAgentContext) fetchAgents()
      fetchGlobalWarehouses()
    }
  }, [open, effectiveMccId, isAgentContext])

  useEffect(() => {
    if (formData.warehouseId && open) {
      const token = localStorage.getItem("Gemurai_token")
      fetch(`/api/v1/inventory/locations?warehouseId=${formData.warehouseId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setWarehouseLocations(res.data)
          } else {
            setWarehouseLocations([])
          }
        })
        .catch(() => setWarehouseLocations([]))
    } else {
      setWarehouseLocations([])
    }
  }, [formData.warehouseId, open])

  useEffect(() => {
    if (effectiveMccId && formData.commodityId && open) {
      const token = localStorage.getItem("Gemurai_token")
      const q = new URLSearchParams({ mccId: effectiveMccId, commodityId: formData.commodityId })
      fetch(`/api/v1/mcc/products-for-receiving?${q}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setProductsForReceiving(res.data)
          } else {
            setProductsForReceiving([])
          }
        })
        .catch(() => setProductsForReceiving([]))
    } else {
      setProductsForReceiving([])
    }
  }, [effectiveMccId, formData.commodityId, open])

  async function fetchGlobalWarehouses() {
    if (!effectiveMccId) return
    try {
      const token = localStorage.getItem("Gemurai_token")
      const res = await fetch(`/api/v1/mcc/global-warehouses?mccId=${effectiveMccId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setGlobalWarehouses(data.data)
      } else {
        setGlobalWarehouses([])
      }
    } catch {
      setGlobalWarehouses([])
    }
  }

  useEffect(() => {
    if (!open) {
      setStep(1)
      setErrors({})
    }
  }, [open])

  useEffect(() => {
    if (open && overrideAgentId) {
      setFormData((p) => ({ ...p, agentId: overrideAgentId }))
    }
  }, [open, overrideAgentId])

  // Auto-capture GPS location when dialog opens (if browser supports it and user allows)
  useEffect(() => {
    if (!open) return
    if (typeof navigator === "undefined" || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((p) => ({
          ...p,
          gpsLatitude: pos.coords.latitude,
          gpsLongitude: pos.coords.longitude,
        }))
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [open])

  const fetchCommodities = async () => {
    setLoadingCommodities(true)
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
      setLoadingCommodities(false)
    }
  }

  const fetchFarmers = async () => {
    setLoadingFarmers(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/mcc/farmers?mccId=${effectiveMccId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setFarmers(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching farmers:", error)
    } finally {
      setLoadingFarmers(false)
    }
  }

  const fetchAgents = async () => {
    setLoadingAgents(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/farm-level-data/agents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAgents(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching agents:", error)
    } finally {
      setLoadingAgents(false)
    }
  }

  const handleCommodityChange = (commodityId: string) => {
    const filtered = filteredCommodities
    const commodity = filtered.find((c) => c.id === commodityId)
    setSelectedCommodity(commodity)
    setFormData((prev) => ({ ...prev, commodityId, qualityData: {} }))
  }

  // Derive collection types from commodities (categories + All)
  const collectionTypeOptions = (() => {
    const seen = new Set<string>()
    const cats: { id: string; name: string }[] = []
    commodities.forEach((c) => {
      const cat = c.category
      if (cat && !seen.has(cat.id)) {
        seen.add(cat.id)
        const displayName = cat.name.toLowerCase().includes("dairy") ? "Milk & Dairy" : cat.name
        cats.push({ id: cat.id, name: displayName })
      }
    })
    return [{ id: "all", name: "All Commodities" }, ...cats.sort((a, b) => a.name.localeCompare(b.name))]
  })()

  const filteredCommodities =
    !formData.collectionTypeId || formData.collectionTypeId === "all"
      ? commodities
      : commodities.filter((c) => c.category?.id === formData.collectionTypeId)

  const selectedCollectionType = collectionTypeOptions.find((o) => o.id === formData.collectionTypeId)
  const isMilkDairy = selectedCollectionType?.name === "Milk & Dairy"

  const handleQualityFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      qualityData: { ...prev.qualityData, [fieldName]: value },
    }))
  }

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {}
    if (s === 1) {
      if (!formData.collectionTypeId) newErrors.collectionTypeId = "Select a collection type"
    }
    if (s === 2) {
      if (!formData.commodityId) newErrors.commodityId = "Select a commodity"
      if (!formData.farmerId) newErrors.farmerId = "Select a farmer"
      if (isMilkDairy && !isAgentContext && !formData.agentId) newErrors.agentId = "Select agent (Abacunda)"
      if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = "Enter valid quantity"
      if (!formData.pricePerUnit || formData.pricePerUnit <= 0) newErrors.pricePerUnit = "Enter valid price"
    }
    if (s === 3 && selectedCommodity?.qualityFields?.length) {
      selectedCommodity.qualityFields.forEach((f: any) => {
        if (f.isMandatory && (formData.qualityData[f.fieldName] === undefined || formData.qualityData[f.fieldName] === "")) {
          newErrors[`quality-${f.fieldName}`] = `${f.fieldName} is required`
        }
      })
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) setStep((p) => Math.min(p + 1, 4))
  }

  const handleBack = () => setStep((p) => Math.max(p - 1, 1))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.commodityId || !formData.farmerId || !formData.quantity || !formData.pricePerUnit) {
      toast.error("Please fill in all required fields")
      return
    }
    const selectedType = collectionTypeOptions.find((o) => o.id === formData.collectionTypeId)
    if (selectedType?.name === "Milk & Dairy" && !isAgentContext && !formData.agentId) {
      toast.error("Agent (Abacunda) is required for Milk & Dairy collections")
      return
    }
    if (!effectiveMccId) {
      toast.error(isAgentContext ? "Select an MCC first" : "Your profile is not assigned to an MCC")
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
          mccId: effectiveMccId,
          collectionDate: new Date().toISOString(),
          quantity: formData.quantity,
          unit: selectedCommodity?.unitOfMeasure || "kg",
          qualityData: formData.qualityData,
          pricePerUnit: formData.pricePerUnit,
          advances: formData.advances || 0,
          agentAdvance: formData.agentAdvance || 0,
          agentId: isMilkDairy ? (formData.agentId || overrideAgentId) : overrideAgentId || undefined,
          notes: formData.notes || undefined,
          warehouseId: formData.warehouseId || undefined,
          locationId: formData.locationId || undefined,
          productId: formData.productId || undefined,
          gpsLatitude: formData.gpsLatitude,
          gpsLongitude: formData.gpsLongitude,
        }),
      })

      const result = await response.json()
      if (response.ok && result.success) {
        toast.success("Commodity collection recorded successfully")
        onSuccess?.()
        onOpenChange(false)
        setFormData({
          collectionTypeId: "",
          commodityId: "",
          farmerId: "",
          agentId: "",
          quantity: 0,
          pricePerUnit: 0,
          qualityData: {},
          advances: 0,
          agentAdvance: 0,
          notes: "",
          warehouseId: "",
          locationId: "",
          productId: "",
          gpsLatitude: null,
          gpsLongitude: null,
        })
        setSelectedCommodity(null)
        setStep(1)
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
    const inputBase = "h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-[#0099f2] focus:ring-2 focus:ring-[#0099f2]/20 focus:outline-none transition-all"
    if (field.fieldType === "NUMERIC") {
      return (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={`quality-${field.id}`} className="text-sm font-medium text-slate-700">
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
            className={cn(inputBase, errors[`quality-${field.fieldName}`] && "border-red-300")}
          />
          {errors[`quality-${field.fieldName}`] && (
            <p className="text-xs text-red-600">{errors[`quality-${field.fieldName}`]}</p>
          )}
        </div>
      )
    }
    if (field.fieldType === "DROPDOWN") {
      const dropdownOptions = field.options?.length
        ? (field.options as string[]).map((opt) => ({ value: opt, label: opt }))
        : [
            { value: "A", label: "A" },
            { value: "B", label: "B" },
            { value: "C", label: "C" },
          ]
      return (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={`quality-${field.id}`} className="text-sm font-medium text-slate-700">
            {field.fieldName} {field.isMandatory && <span className="text-red-500">*</span>}
          </Label>
          <SearchableSelect
            value={formData.qualityData[field.fieldName] || ""}
            onValueChange={(value) => handleQualityFieldChange(field.fieldName, value)}
            options={dropdownOptions}
            placeholder={`Select ${field.fieldName}`}
            searchPlaceholder="Search..."
            emptyText="No option found."
            className={cn(
              "h-11 rounded-xl !border !border-slate-200 !bg-white !from-white !to-white text-slate-900 focus:!border-[#0099f2] focus:!ring-2 focus:!ring-[#0099f2]/20",
              errors[`quality-${field.fieldName}`] && "!border-red-300"
            )}
          />
          {errors[`quality-${field.fieldName}`] && (
            <p className="text-xs text-red-600">{errors[`quality-${field.fieldName}`]}</p>
          )}
        </div>
      )
    }
    if (field.fieldType === "BOOLEAN") {
      return (
        <div key={field.id} className="flex items-center gap-3">
          <input
            type="checkbox"
            id={`quality-${field.id}`}
            checked={formData.qualityData[field.fieldName] || false}
            onChange={(e) => handleQualityFieldChange(field.fieldName, e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#0099f2] focus:ring-[#0099f2]"
          />
          <Label htmlFor={`quality-${field.id}`} className="text-sm font-medium text-slate-700">
            {field.fieldName} {field.isMandatory && <span className="text-red-500">*</span>}
          </Label>
        </div>
      )
    }
    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={`quality-${field.id}`} className="text-sm font-medium text-slate-700">
          {field.fieldName} {field.isMandatory && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id={`quality-${field.id}`}
          value={formData.qualityData[field.fieldName] || ""}
          onChange={(e) => handleQualityFieldChange(field.fieldName, e.target.value)}
          required={field.isMandatory}
          className={cn(inputBase, errors[`quality-${field.fieldName}`] && "border-red-300")}
        />
        {errors[`quality-${field.fieldName}`] && (
          <p className="text-xs text-red-600">{errors[`quality-${field.fieldName}`]}</p>
        )}
      </div>
    )
  }

  const inputBase = "h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-[#0099f2] focus:ring-2 focus:ring-[#0099f2]/20 focus:outline-none transition-all"
  const searchableSelectClass = "h-11 rounded-xl !border !border-slate-200 !bg-white !from-white !to-white text-slate-900 focus:!border-[#0099f2] focus:!ring-2 focus:!ring-[#0099f2]/20"

  const totalAmount = formData.quantity * formData.pricePerUnit - (formData.advances || 0) - (formData.agentAdvance || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 bg-white border border-slate-200/80 shadow-2xl rounded-2xl [&>button]:absolute [&>button]:right-4 [&>button]:top-4 [&>button]:text-slate-400 [&>button]:hover:text-slate-600 [&>button]:hover:bg-slate-100 [&>button]:rounded-lg [&>button]:z-10">
        {/* Header with stepper — no background */}
        <div className="px-6 py-5 border-b border-slate-200/80">
          <DialogHeader>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-2">
              <Package className="h-3.5 w-3.5 text-[#0099f2]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                HarvestPlus • Collections
              </span>
            </div>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0099f2]/10 text-[#0099f2]">
                <Package className="h-5 w-5" />
              </div>
              Record Commodity Collection
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-slate-500">
              Step {step} of {STEPS.length} — {STEPS[step - 1].title}
            </DialogDescription>
          </DialogHeader>
          {/* Stepper */}
          <div className="mt-5 flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isActive = step === s.id
              const isComplete = step > s.id
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all",
                      isComplete && "border-emerald-500 bg-emerald-500 text-white",
                      isActive && !isComplete && "border-[#0099f2] bg-[#0099f2]/15 text-[#0099f2] scale-110",
                      !isActive && !isComplete && "border-slate-200 bg-slate-50 text-slate-400"
                    )}
                  >
                    {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mx-1 h-0.5 flex-1 rounded-full transition-colors",
                        isComplete ? "bg-emerald-500/50" : "bg-slate-200"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 min-h-[320px]">
            {/* Step 1: Collection Type */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <Label className="text-base font-semibold text-slate-800">What type of collection?</Label>
                  <p className="mt-1 text-sm text-slate-500">Select Milk, Commodities, or another type to continue</p>
                </div>
                {loadingCommodities ? (
                  <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                    <Loader2 className="h-10 w-10 animate-spin text-[#0099f2] mb-3" />
                    <p className="text-sm font-medium text-slate-600">Loading collection types...</p>
                    <p className="text-xs text-slate-500 mt-1">Fetching commodities</p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collectionTypeOptions.map((opt) => {
                    const Icon = getCollectionTypeIcon(opt.name)
                    const isSelected = formData.collectionTypeId === opt.id
                    const count =
                      opt.id === "all"
                        ? commodities.length
                        : commodities.filter((c) => c.category?.id === opt.id).length
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setFormData((p) => ({
                            ...p,
                            collectionTypeId: opt.id,
                            commodityId: "",
                            agentId: opt.name !== "Milk & Dairy" ? "" : p.agentId,
                          }))
                          setSelectedCommodity(null)
                        }}
                        className={cn(
                          "relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-left transition-all hover:shadow-lg",
                          isSelected
                            ? "border-[#0099f2] bg-[#0099f2]/5 shadow-md ring-2 ring-[#0099f2]/20"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-xl",
                            isSelected ? "bg-[#0099f2]/15 text-[#0099f2]" : "bg-slate-100 text-slate-600"
                          )}
                        >
                          <Icon className="h-7 w-7" />
                        </div>
                        <div className="w-full">
                          <p className="font-semibold text-slate-900">{opt.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {count} {count === 1 ? "commodity" : "commodities"} available
                          </p>
                        </div>
                        {isSelected && <Check className="h-5 w-5 text-[#0099f2] absolute top-3 right-3" />}
                      </button>
                    )
                  })}
                </div>
                )}
                {errors.collectionTypeId && <p className="text-xs text-red-600">{errors.collectionTypeId}</p>}
              </div>
            )}

            {/* Step 2: Commodity & Collection Details (combined) */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Commodity */}
                <div className="space-y-2">
                  <Label htmlFor="commodityId" className="text-sm font-medium text-slate-700">
                    Commodity <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-slate-500">
                    {loadingCommodities
                      ? "Loading commodities..."
                      : formData.collectionTypeId === "all"
                        ? "All commodity types — grouped by category"
                        : `Commodities in selected type — ${filteredCommodities.length} available`}
                  </p>
                  <SearchableSelect
                    value={formData.commodityId}
                    onValueChange={handleCommodityChange}
                    options={filteredCommodities.map((c) => {
                      const catName = isPlaceholderText(c.category?.name) ? "Other" : (c.category?.name || "Other")
                      const nameDisplay = isPlaceholderText(c.name) ? (c.code || "Commodity") : c.name
                      return {
                        value: c.id,
                        label: `${catName} — ${nameDisplay} (${c.code}) — ${c.unitOfMeasure}`,
                      }
                    })}
                    placeholder={loadingCommodities ? "Loading commodities..." : "Select commodity"}
                    searchPlaceholder="Search commodities..."
                    emptyText="No commodity found."
                    className={cn(searchableSelectClass, errors.commodityId && "!border-red-300")}
                    disabled={loadingCommodities}
                  />
                  {errors.commodityId && <p className="text-xs text-red-600">{errors.commodityId}</p>}
                </div>

                {/* Collection Details (farmer, agent, quantity, price) */}
                {(loadingFarmers || (isMilkDairy && !isAgentContext && loadingAgents)) ? (
                  <div className="flex flex-col items-center justify-center py-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                    <Loader2 className="h-8 w-8 animate-spin text-[#0099f2] mb-2" />
                    <p className="text-sm font-medium text-slate-600">Loading farmers and agents...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="farmerId" className="text-sm font-medium text-slate-700">Farmer <span className="text-red-500">*</span></Label>
                      <SearchableSelect
                        value={formData.farmerId}
                        onValueChange={(v) => setFormData((p) => ({ ...p, farmerId: v }))}
                        options={farmers.map((f) => ({ value: f.id, label: `${f.name} — ${f.phone}` }))}
                        placeholder={loadingFarmers ? "Loading farmers..." : "Select farmer"}
                        searchPlaceholder="Search farmers..."
                        emptyText="No farmer found."
                        className={cn(searchableSelectClass, errors.farmerId && "!border-red-300")}
                        disabled={loadingFarmers}
                      />
                      {errors.farmerId && <p className="text-xs text-red-600">{errors.farmerId}</p>}
                    </div>
                    {isMilkDairy && !isAgentContext && (
                      <div className="space-y-2">
                        <Label htmlFor="agentId" className="text-sm font-medium text-slate-700">
                          Agent (Abacunda) <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-xs text-slate-500">Required for Milk & Dairy collections — select the field agent who collected</p>
                        <SearchableSelect
                          value={formData.agentId}
                          onValueChange={(v) => setFormData((p) => ({ ...p, agentId: v }))}
                          options={agents.map((a) => ({ value: a.id, label: `${a.name}${a.phone ? ` — ${a.phone}` : ""}` }))}
                          placeholder={loadingAgents ? "Loading agents..." : "Select agent (Abacunda)"}
                          searchPlaceholder="Search agents..."
                          emptyText="No agent found."
                          className={cn(searchableSelectClass, errors.agentId && "!border-red-300")}
                          disabled={loadingAgents}
                        />
                        {errors.agentId && <p className="text-xs text-red-600">{errors.agentId}</p>}
                      </div>
                    )}
                    {isMilkDairy && isAgentContext && (
                      <p className="text-sm text-slate-600"><span className="font-medium">Recording as agent:</span> You</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-sm font-medium text-slate-700">Quantity <span className="text-red-500">*</span></Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="quantity"
                            type="number"
                            step="0.01"
                            value={formData.quantity || ""}
                            onChange={(e) => setFormData((p) => ({ ...p, quantity: parseFloat(e.target.value) || 0 }))}
                            required
                            className={cn(inputBase, errors.quantity && "border-red-300")}
                          />
                          <span className="text-sm text-slate-500 shrink-0">{selectedCommodity?.unitOfMeasure || "units"}</span>
                        </div>
                        {errors.quantity && <p className="text-xs text-red-600">{errors.quantity}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pricePerUnit" className="text-sm font-medium text-slate-700">Price per Unit <span className="text-red-500">*</span></Label>
                        <Input
                          id="pricePerUnit"
                          type="number"
                          step="0.01"
                          value={formData.pricePerUnit || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, pricePerUnit: parseFloat(e.target.value) || 0 }))}
                          required
                          className={cn(inputBase, errors.pricePerUnit && "border-red-300")}
                        />
                        {errors.pricePerUnit && <p className="text-xs text-red-600">{errors.pricePerUnit}</p>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Quality & Advances (combined) */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {selectedCommodity?.qualityFields?.length ? (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Quality</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedCommodity.qualityFields.map((f: any) => renderQualityField(f))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-slate-600">
                    <ClipboardList className="h-10 w-10 mx-auto mb-2 text-slate-400" />
                    <p className="font-medium">No quality fields for {selectedCommodity?.name || "this commodity"}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Advances & notes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="advances" className="text-sm font-medium text-slate-700">Farmer Advances</Label>
                      <Input
                        id="advances"
                        type="number"
                        step="0.01"
                        value={formData.advances || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, advances: parseFloat(e.target.value) || 0 }))}
                        className={inputBase}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agentAdvance" className="text-sm font-medium text-slate-700">Agent Prepayment</Label>
                      <Input
                        id="agentAdvance"
                        type="number"
                        step="0.01"
                        value={formData.agentAdvance || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, agentAdvance: parseFloat(e.target.value) || 0 }))}
                        className={inputBase}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="notes" className="text-sm font-medium text-slate-700">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                      rows={3}
                      className="rounded-xl border border-slate-200 px-4 py-3 focus:border-[#0099f2] focus:ring-2 focus:ring-[#0099f2]/20 focus:outline-none resize-none"
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <WarehouseIcon className="h-4 w-4 text-slate-600" />
                    Receive into warehouse (optional)
                  </h3>
                  <p className="text-xs text-slate-500">Record this collection into inventory by selecting a warehouse and product.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Warehouse</Label>
                      <SearchableSelect
                        value={formData.warehouseId}
                        onValueChange={(v) => setFormData((p) => ({ ...p, warehouseId: v, locationId: "", productId: "" }))}
                        options={globalWarehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` }))}
                        placeholder="Select warehouse"
                        searchPlaceholder="Search warehouse..."
                        className={searchableSelectClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Location</Label>
                      <SearchableSelect
                        value={formData.locationId}
                        onValueChange={(v) => setFormData((p) => ({ ...p, locationId: v }))}
                        options={warehouseLocations.map((l) => ({ value: l.id, label: `${l.name} (${l.code})` }))}
                        placeholder="Select location"
                        searchPlaceholder="Search location..."
                        className={searchableSelectClass}
                        disabled={!formData.warehouseId}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Product</Label>
                      <SearchableSelect
                        value={formData.productId}
                        onValueChange={(v) => setFormData((p) => ({ ...p, productId: v }))}
                        options={productsForReceiving.map((p) => ({ value: p.id, label: `${p.name} (${p.unit})` }))}
                        placeholder="Select product"
                        searchPlaceholder="Search product..."
                        className={searchableSelectClass}
                        disabled={!formData.commodityId}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 text-sm">
                  <p><span className="font-medium text-slate-600">Commodity:</span> {selectedCommodity?.name || "—"}</p>
                  <p><span className="font-medium text-slate-600">Farmer:</span> {farmers.find((f) => f.id === formData.farmerId)?.name || "—"}</p>
                  {isMilkDairy && (formData.agentId || overrideAgentId) && (
                    <p><span className="font-medium text-slate-600">Agent (Abacunda):</span> {isAgentContext ? "You" : (agents.find((a) => a.id === formData.agentId)?.name || "—")}</p>
                  )}
                  <p><span className="font-medium text-slate-600">Quantity:</span> {formData.quantity} {selectedCommodity?.unitOfMeasure || "units"}</p>
                  <p><span className="font-medium text-slate-600">Price/Unit:</span> RF {formData.pricePerUnit?.toLocaleString()}</p>
                  <p><span className="font-medium text-slate-600">Advances:</span> RF {(formData.advances || 0).toLocaleString()}</p>
                  <p><span className="font-medium text-slate-600">Agent Prepayment:</span> RF {(formData.agentAdvance || 0).toLocaleString()}</p>
                  <p className="pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-800">Net Amount:</span> RF {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  {formData.notes && (
                    <p><span className="font-medium text-slate-600">Notes:</span> {formData.notes}</p>
                  )}
                  {(formData.warehouseId || formData.productId) && (
                    <p><span className="font-medium text-slate-600">Receive into warehouse:</span>{" "}
                      {formData.warehouseId ? globalWarehouses.find((w) => w.id === formData.warehouseId)?.name : "—"}
                      {formData.locationId && ` → ${warehouseLocations.find((l) => l.id === formData.locationId)?.name || "location"}`}
                      {formData.productId && ` • ${productsForReceiving.find((p) => p.id === formData.productId)?.name || "product"}`}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-slate-200/80 bg-slate-50/60 rounded-b-2xl">
            <Button
              type="button"
              variant="ghost"
              onClick={step === 1 ? () => onOpenChange(false) : handleBack}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            {step < 4 ? (
              <Button type="button" onClick={handleNext} className="rounded-xl bg-[#0099f2] hover:bg-[#0099f2]/90 px-5 text-white">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isLoading}
                onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                className="rounded-xl bg-[#0099f2] hover:bg-[#0099f2]/90 px-5 py-2.5 font-semibold text-white shadow-lg shadow-[#0099f2]/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Confirm & Record
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
