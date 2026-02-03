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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  Package,
  Loader2,
  User,
  MapPin,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Check,
  FileCheck,
  Droplets,
  Coffee,
  Wheat,
  Layers,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { GeoLocationInput } from "@/components/ui/geo-location-input"
import { cn } from "@/lib/utils"

interface CommodityCollectionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const STEPS = [
  { id: 1, title: "Collection Type", icon: Layers, short: "Type" },
  { id: 2, title: "Commodity", icon: Package, short: "Commodity" },
  { id: 3, title: "Collection Details", icon: User, short: "Details" },
  { id: 4, title: "Quality", icon: ClipboardList, short: "Quality" },
  { id: 5, title: "Advances & Location", icon: MapPin, short: "Extra" },
  { id: 6, title: "Review", icon: FileCheck, short: "Review" },
]

function getCollectionTypeIcon(name: string) {
  const n = (name || "").toLowerCase()
  if (n.includes("dairy") || n.includes("milk")) return Droplets
  if (n.includes("coffee")) return Coffee
  if (n.includes("cereal") || n.includes("grain") || n.includes("maize")) return Wheat
  return Package
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
  const [agents, setAgents] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    collectionTypeId: "", // "all" or category id
    commodityId: "",
    farmerId: "",
    agentId: "", // Required for Milk & Dairy
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (open && user?.mccId) {
      fetchCommodities()
      fetchFarmers()
      fetchAgents()
    }
  }, [open, user?.mccId])

  useEffect(() => {
    if (!open) {
      setStep(1)
      setErrors({})
    }
  }, [open])

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
    }
  }

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

  const fetchAgents = async () => {
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
    }
    if (s === 3) {
      if (!formData.farmerId) newErrors.farmerId = "Select a farmer"
      if (isMilkDairy && !formData.agentId) newErrors.agentId = "Select agent (Abacunda)"
      if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = "Enter valid quantity"
      if (!formData.pricePerUnit || formData.pricePerUnit <= 0) newErrors.pricePerUnit = "Enter valid price"
    }
    if (s === 4 && selectedCommodity?.qualityFields?.length) {
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
    if (validateStep(step)) setStep((p) => Math.min(p + 1, 6))
  }

  const handleBack = () => setStep((p) => Math.max(p - 1, 1))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.commodityId || !formData.farmerId || !formData.quantity || !formData.pricePerUnit) {
      toast.error("Please fill in all required fields")
      return
    }
    const selectedType = collectionTypeOptions.find((o) => o.id === formData.collectionTypeId)
    if (selectedType?.name === "Milk & Dairy" && !formData.agentId) {
      toast.error("Agent (Abacunda) is required for Milk & Dairy collections")
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
          agentId: isMilkDairy ? formData.agentId : undefined,
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
    const inputBase = "h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
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
      return (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={`quality-${field.id}`} className="text-sm font-medium text-slate-700">
            {field.fieldName} {field.isMandatory && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={formData.qualityData[field.fieldName] || ""}
            onValueChange={(value) => handleQualityFieldChange(field.fieldName, value)}
            required={field.isMandatory}
          >
            <SelectTrigger className={cn(inputBase, "h-11", errors[`quality-${field.fieldName}`] && "border-red-300")}>
              <SelectValue placeholder={`Select ${field.fieldName}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.length ? (
                field.options.map((opt: string) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
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
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
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

  const inputBase = "h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"

  const totalAmount = formData.quantity * formData.pricePerUnit - (formData.advances || 0) - (formData.agentAdvance || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 bg-white border border-slate-200/80 shadow-2xl rounded-2xl [&>button]:absolute [&>button]:right-4 [&>button]:top-4 [&>button]:text-white [&>button]:opacity-90 [&>button]:hover:opacity-100 [&>button]:hover:bg-white/10 [&>button]:rounded-lg [&>button]:z-10">
        {/* Header with stepper — matches sidebar dark gradient */}
        <div
          className="relative overflow-hidden rounded-t-2xl px-6 py-5 border-b border-[rgba(148,163,184,0.08)]"
          style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c1929 50%, #0a1628 100%)" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,153,242,0.12)_0%,transparent_55%)]" />
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-white">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-[#7dd3fc]"
                style={{
                  background: "linear-gradient(135deg, rgba(0, 153, 242, 0.25) 0%, rgba(0, 130, 217, 0.2) 100%)",
                  border: "1px solid rgba(0, 153, 242, 0.2)",
                }}
              >
                <Package className="h-5 w-5" />
              </div>
              Record Commodity Collection
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[rgba(203,213,225,0.7)]">
              Step {step} of {STEPS.length} — {STEPS[step - 1].title}
            </DialogDescription>
          </DialogHeader>
          {/* Stepper */}
          <div className="relative mt-5 flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isActive = step === s.id
              const isComplete = step > s.id
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all",
                      isComplete && "border-[#22c55e] bg-[#16a34a] text-white",
                      isActive && !isComplete && "border-[#0099f2] bg-[rgba(0,153,242,0.2)] text-[#7dd3fc] scale-110",
                      !isActive && !isComplete && "border-[rgba(148,163,184,0.3)] bg-[rgba(255,255,255,0.04)] text-[rgba(203,213,225,0.6)]"
                    )}
                  >
                    {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mx-1 h-0.5 flex-1 rounded-full transition-colors",
                        isComplete ? "bg-[#22c55e]/50" : "bg-[rgba(148,163,184,0.2)]"
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
                            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-xl",
                            isSelected ? "bg-primary/15 text-primary" : "bg-slate-100 text-slate-600"
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
                        {isSelected && <Check className="h-5 w-5 text-primary absolute top-3 right-3" />}
                      </button>
                    )
                  })}
                </div>
                {errors.collectionTypeId && <p className="text-xs text-red-600">{errors.collectionTypeId}</p>}
              </div>
            )}

            {/* Step 2: Commodity */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="commodityId" className="text-sm font-medium text-slate-700">
                    Commodity <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-slate-500">
                    {formData.collectionTypeId === "all"
                      ? "All commodity types — grouped by category"
                      : `Commodities in selected type — ${filteredCommodities.length} available`}
                  </p>
                  <Select
                    value={formData.commodityId}
                    onValueChange={handleCommodityChange}
                    required
                  >
                    <SelectTrigger className={cn(inputBase, "h-11", errors.commodityId && "border-red-300")}>
                      <SelectValue placeholder="Select commodity" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const byCategory = filteredCommodities.reduce<Record<string, any[]>>((acc, c) => {
                          const cat = c.category?.name || "Other"
                          if (!acc[cat]) acc[cat] = []
                          acc[cat].push(c)
                          return acc
                        }, {})
                        return Object.entries(byCategory).map(([categoryName, items]) => (
                          <SelectGroup key={categoryName}>
                            <SelectLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {categoryName}
                            </SelectLabel>
                            {items.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name} ({c.code}) — {c.unitOfMeasure}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))
                      })()}
                    </SelectContent>
                  </Select>
                  {errors.commodityId && <p className="text-xs text-red-600">{errors.commodityId}</p>}
                </div>
                {selectedCommodity && (
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 space-y-2 text-sm text-slate-700">
                    <div className="flex gap-2"><span className="font-medium text-slate-600">Category:</span><span>{selectedCommodity.category?.name}</span></div>
                    <div className="flex gap-2"><span className="font-medium text-slate-600">Pricing:</span><span>{selectedCommodity.pricingMethod}</span></div>
                    <div className="flex gap-2"><span className="font-medium text-slate-600">Storage:</span><span>{selectedCommodity.storageType}</span></div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Collection Details */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="farmerId" className="text-sm font-medium text-slate-700">Farmer <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.farmerId}
                    onValueChange={(v) => setFormData((p) => ({ ...p, farmerId: v }))}
                    required
                  >
                    <SelectTrigger className={cn(inputBase, "h-11", errors.farmerId && "border-red-300")}>
                      <SelectValue placeholder="Select farmer" />
                    </SelectTrigger>
                    <SelectContent>
                      {farmers.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.name} — {f.phone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.farmerId && <p className="text-xs text-red-600">{errors.farmerId}</p>}
                </div>
                {isMilkDairy && (
                  <div className="space-y-2">
                    <Label htmlFor="agentId" className="text-sm font-medium text-slate-700">
                      Agent (Abacunda) <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-slate-500">Required for Milk & Dairy collections — select the field agent who collected</p>
                    <Select
                      value={formData.agentId}
                      onValueChange={(v) => setFormData((p) => ({ ...p, agentId: v }))}
                      required={isMilkDairy}
                    >
                      <SelectTrigger className={cn(inputBase, "h-11", errors.agentId && "border-red-300")}>
                        <SelectValue placeholder="Select agent (Abacunda)" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name} {a.phone && `— ${a.phone}`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.agentId && <p className="text-xs text-red-600">{errors.agentId}</p>}
                  </div>
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
              </div>
            )}

            {/* Step 4: Quality */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {selectedCommodity?.qualityFields?.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedCommodity.qualityFields.map((f: any) => renderQualityField(f))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-slate-600">
                    <ClipboardList className="h-10 w-10 mx-auto mb-2 text-slate-400" />
                    <p className="font-medium">No quality fields for {selectedCommodity?.name || "this commodity"}</p>
                    <p className="text-sm mt-1">Click Next to continue</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Advances & Location */}
            {step === 5 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Location (Optional)</Label>
                  <GeoLocationInput
                    latitude={formData.gpsLatitude}
                    longitude={formData.gpsLongitude}
                    onLocationChange={(lat, lng) =>
                      setFormData((p) => ({ ...p, gpsLatitude: lat, gpsLongitude: lng }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-slate-700">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    className="rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {step === 6 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 text-sm">
                  <p><span className="font-medium text-slate-600">Commodity:</span> {selectedCommodity?.name || "—"}</p>
                  <p><span className="font-medium text-slate-600">Farmer:</span> {farmers.find((f) => f.id === formData.farmerId)?.name || "—"}</p>
                  {isMilkDairy && formData.agentId && (
                    <p><span className="font-medium text-slate-600">Agent (Abacunda):</span> {agents.find((a) => a.id === formData.agentId)?.name || "—"}</p>
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
            {step < 6 ? (
              <Button type="button" onClick={handleNext} className="rounded-xl bg-primary hover:bg-primary/90 px-5">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
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
