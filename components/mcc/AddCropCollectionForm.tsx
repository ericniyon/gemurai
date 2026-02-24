"use client"

import { useState, useEffect, useMemo } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Wheat, Loader2, User, Package, Calculator, FileText, Warehouse as WarehouseIcon, Search, Truck, UserCheck } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useAuthStore } from "@/lib/stores/auth-store"

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
  warehouseId: string
  locationId: string
  productId: string
  gpsLatitude?: number | null
  gpsLongitude?: number | null
}

const inputClasses =
  "rounded-xl border border-emerald-200/80 bg-white text-sm shadow-sm transition placeholder:text-slate-400 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:ring-offset-0"

const UNIT_OPTIONS = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "ton", label: "ton" },
  { value: "mt", label: "mt" },
  { value: "lb", label: "lb" },
  { value: "sack", label: "sack" },
  { value: "bag", label: "bag" },
  { value: "basket", label: "basket" },
]

export function AddCropCollectionForm({
  open,
  onOpenChange,
  onSuccess,
}: AddCropCollectionFormProps) {
  const { user } = useAuth()
  const storeToken = useAuthStore((s) => s.token)
  const token = storeToken ?? (typeof window !== "undefined" ? localStorage.getItem("Gemurai_token") : null)
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
    warehouseId: "",
    locationId: "",
    productId: "",
    gpsLatitude: null,
    gpsLongitude: null,
  })

  const [farmers, setFarmers] = useState<Array<{ id: string; name: string; farmerCode?: string | null; phone?: string }>>([])
  const [cropTypes, setCropTypes] = useState<any[]>([])
  const [globalWarehouses, setGlobalWarehouses] = useState<{ id: string; name: string; code: string }[]>([])
  const [warehouseLocations, setWarehouseLocations] = useState<{ id: string; name: string; code: string }[]>([])
  const [productsForReceiving, setProductsForReceiving] = useState<{ id: string; name: string; unit: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CropCollectionFormData, string>>>({})
  const [farmerCodeInput, setFarmerCodeInput] = useState("")
  const [lookingUpFarmer, setLookingUpFarmer] = useState(false)
  const [deliveredBy, setDeliveredBy] = useState<"farmer" | "agent">("farmer")
  const [agentId, setAgentId] = useState("")
  const [agents, setAgents] = useState<Array<{ id: string; name: string; email?: string; phone?: string; displayId?: string | null }>>([])
  const [agentCodeInput, setAgentCodeInput] = useState("")
  const [lookingUpAgent, setLookingUpAgent] = useState(false)

  const selectedFarmer = formData.farmerId ? farmers.find((f) => f.id === formData.farmerId) : null
  const selectedAgent = agentId ? agents.find((a) => a.id === agentId) : null

  const lookupFarmerByCode = (code: string) => {
    const trimmed = (code || "").trim()
    if (!trimmed) {
      setFormData((prev) => ({ ...prev, farmerId: "" }))
      setErrors((e) => ({ ...e, farmerId: "Enter a farmer code to look up." }))
      return
    }
    setLookingUpFarmer(true)
    setErrors((e) => ({ ...e, farmerId: undefined }))
    const match = farmers.find(
      (f) => (f.farmerCode ?? "").toString().toLowerCase() === trimmed.toLowerCase()
    )
    setTimeout(() => {
      setLookingUpFarmer(false)
      if (match) {
        setFormData((prev) => ({ ...prev, farmerId: match.id }))
        setFarmerCodeInput(match.farmerCode?.toString() ?? trimmed)
        toast.success(`Found: ${match.name}`)
      } else {
        setFormData((prev) => ({ ...prev, farmerId: "" }))
        setErrors((e) => ({ ...e, farmerId: `No farmer found with code "${trimmed}". Check the code or search by name.` }))
        toast.error(`No farmer found with code "${trimmed}"`)
      }
    }, 300)
  }

  const lookupAgentByCode = (code: string) => {
    const trimmed = (code || "").trim()
    if (!trimmed) {
      setAgentId("")
      return
    }
    setLookingUpAgent(true)
    const match = agents.find(
      (a) => (a.displayId ?? "").toString().toLowerCase() === trimmed.toLowerCase()
    )
    setTimeout(() => {
      setLookingUpAgent(false)
      if (match) {
        setAgentId(match.id)
        setAgentCodeInput(match.displayId?.toString() ?? trimmed)
        toast.success(`Found: ${match.name}`)
      } else {
        setAgentId("")
        toast.error(`No agent found with code "${trimmed}"`)
      }
    }, 300)
  }

  useEffect(() => {
    if (open && user?.mccId && token) {
      fetchFarmers()
      fetchCropTypes()
      fetchGlobalWarehouses()
    }
  }, [open, user?.mccId, token])

  useEffect(() => {
    if (!open) return
    const fetchAgents = async () => {
      try {
        const res = await fetch("/api/v1/mcc/agents", {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          setAgents(data.data ?? [])
        }
      } catch {
        setAgents([])
      }
    }
    fetchAgents()
  }, [open, token])

  useEffect(() => {
    if (!open) setFarmerCodeInput("")
    else if (formData.farmerId && selectedFarmer?.farmerCode)
      setFarmerCodeInput(selectedFarmer.farmerCode.toString())
    else if (!formData.farmerId) setFarmerCodeInput("")
  }, [open, formData.farmerId, selectedFarmer?.farmerCode])

  useEffect(() => {
    if (!open) setAgentCodeInput("")
    else if (agentId && selectedAgent?.displayId) setAgentCodeInput(selectedAgent.displayId.toString())
    else if (!agentId) setAgentCodeInput("")
  }, [open, agentId, selectedAgent?.displayId])

  useEffect(() => {
    if (!formData.warehouseId || !open || !token) {
      setWarehouseLocations([])
      return
    }
    fetch(`/api/v1/inventory/locations?warehouseId=${formData.warehouseId}`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setWarehouseLocations(res.data)
        else setWarehouseLocations([])
      })
      .catch(() => setWarehouseLocations([]))
  }, [formData.warehouseId, open, token])

  useEffect(() => {
    if (!user?.mccId || !formData.cropTypeId || !open || !token) {
      setProductsForReceiving([])
      return
    }
    const q = new URLSearchParams({ mccId: user.mccId, cropTypeId: formData.cropTypeId })
    fetch(`/api/v1/mcc/products-for-receiving?${q}`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setProductsForReceiving(res.data)
        else setProductsForReceiving([])
      })
      .catch(() => setProductsForReceiving([]))
  }, [user?.mccId, formData.cropTypeId, open, token])

  async function fetchGlobalWarehouses() {
    if (!user?.mccId || !token) return
    try {
      const res = await fetch(`/api/v1/mcc/global-warehouses?mccId=${user.mccId}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) setGlobalWarehouses(data.data)
      else setGlobalWarehouses([])
    } catch {
      setGlobalWarehouses([])
    }
  }

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
    if (!token) return
    try {
      const response = await fetch(`/api/v1/mcc/farmers?mccId=${user?.mccId}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        const list = (data.data || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          farmerCode: f.farmerCode ?? null,
          phone: f.phone,
        }))
        setFarmers(list)
      }
    } catch (error) {
      console.error("Error fetching farmers:", error)
    }
  }

  const fetchCropTypes = async () => {
    if (!token) return
    try {
      const response = await fetch("/api/v1/mcc/crops/types", {
        credentials: "include",
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
    // Farmer is required only when farmer delivers directly
    // When agent delivers, farmer is optional (agent may collect from multiple sources)
    if (deliveredBy === "farmer" && !formData.farmerId) {
      newErrors.farmerId = "Farmer is required"
    }
    if (deliveredBy === "agent" && !agentId) {
      toast.error("Please select the agent (Umucunda) who brought this collection")
      return false
    }
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

    const authToken = useAuthStore.getState().token ?? (typeof window !== "undefined" ? localStorage.getItem("Gemurai_token") : null) ?? token
    if (!authToken) {
      toast.error("Please log in again")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/v1/mcc/crops/collections", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          farmerId: formData.farmerId,
          agentId: deliveredBy === "agent" && agentId ? agentId : undefined,
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
          warehouseId: formData.warehouseId || undefined,
          locationId: formData.locationId || undefined,
          productId: formData.productId || undefined,
          gpsLatitude: formData.gpsLatitude,
          gpsLongitude: formData.gpsLongitude,
        }),
      })

      const result = await response.json()
      if (response.ok && result.success) {
        toast.success("Crop collection recorded successfully")
        onSuccess?.()
        onOpenChange(false)
        setDeliveredBy("farmer")
        setAgentId("")
        setAgentCodeInput("")
        setFarmerCodeInput("")
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
          warehouseId: "",
          locationId: "",
          productId: "",
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

  const unitOptions = useMemo(() => {
    const byValue = new Map(UNIT_OPTIONS.map((u) => [u.value.toLowerCase(), u]))
    const selectedType = cropTypes.find((ct) => ct.id === formData.cropTypeId)
    const cropUnit = selectedType?.unitOfMeasure?.trim()
    if (cropUnit && !byValue.has(cropUnit.toLowerCase())) {
      return [{ value: cropUnit, label: cropUnit }, ...UNIT_OPTIONS]
    }
    return UNIT_OPTIONS
  }, [formData.cropTypeId, cropTypes])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-white border border-slate-200 shadow-xl rounded-3xl [&>button]:absolute [&>button]:right-5 [&>button]:top-5 [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:hover:bg-slate-100 [&>button]:rounded-full [&>button]:z-10 [&>button]:h-9 [&>button]:w-9">
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 pt-6 pb-6 text-white">
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-white tracking-tight">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white border border-white/20 shadow-lg">
                <Wheat className="h-6 w-6" />
              </div>
              Record Crop Collection
            </DialogTitle>
            <DialogDescription className="mt-2 text-slate-300 text-base">
              Record a new crop collection from a farmer
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-[200px] bg-gradient-to-b from-slate-50/80 to-white">
            {/* Collection details */}
            <section className="space-y-4 rounded-xl border border-emerald-100 bg-slate-50/40 px-4 py-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Package className="h-4 w-4 text-emerald-600" />
                Collection details
              </h3>
              {/* Who is delivering: Farmer (direct) or Agent (Umucunda) */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-600" />
                  Who is delivering this collection?
                </Label>
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer rounded-xl border-2 border-slate-200 px-4 py-3 transition-all hover:border-emerald-400 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-500/5">
                    <input
                      type="radio"
                      name="deliveredBy"
                      checked={deliveredBy === "farmer"}
                      onChange={() => {
                        setDeliveredBy("farmer")
                        setAgentId("")
                        setAgentCodeInput("")
                      }}
                      className="h-4 w-4 text-emerald-600 border-gray-300"
                    />
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Farmer (direct)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer rounded-xl border-2 border-slate-200 px-4 py-3 transition-all hover:border-emerald-400 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-500/5">
                    <input
                      type="radio"
                      name="deliveredBy"
                      checked={deliveredBy === "agent"}
                      onChange={() => setDeliveredBy("agent")}
                      className="h-4 w-4 text-emerald-600 border-gray-300"
                    />
                    <UserCheck className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Agent (Umucunda)</span>
                  </label>
                </div>
                {deliveredBy === "agent" && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    Agent (Umucunda) collection: Select the agent who brought this collection. Optionally, you can also specify a farmer if the collection is for a specific farmer.
                  </p>
                )}
              </div>
              {deliveredBy === "agent" && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Agent (Umucunda) who brought this collection <span className="text-rose-500">*</span>
                  </Label>
                  <p className="text-xs text-slate-500">Type the agent code and use the look-up icon, or search by name. Then select the farmer below.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div className="space-y-1.5 min-w-0">
                      <Label htmlFor="agentCodeLookup" className="text-xs font-medium text-gray-600">Agent code</Label>
                      <div className="relative">
                        <Input
                          id="agentCodeLookup"
                          type="text"
                          value={agentCodeInput}
                          onChange={(e) => {
                            const v = e.target.value
                            setAgentCodeInput(v)
                            if (!v.trim()) setAgentId("")
                          }}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), lookupAgentByCode(agentCodeInput))}
                          placeholder="e.g. A-001"
                          className="h-11 rounded-xl border-2 border-emerald-200 pr-11"
                          disabled={lookingUpAgent}
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); lookupAgentByCode(agentCodeInput) }}
                          disabled={lookingUpAgent || !agentCodeInput.trim()}
                          title="Look up agent"
                          aria-label="Look up agent by code"
                          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-100 hover:text-emerald-600 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {lookingUpAgent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <Label className="text-xs font-medium text-gray-600">Don&apos;t know the code? Search by name</Label>
                      <Select value={agentId} onValueChange={(v) => { setAgentId(v); const a = agents.find((x) => x.id === v); if (a?.displayId) setAgentCodeInput(a.displayId.toString()); else if (!v) setAgentCodeInput("") }}>
                        <SelectTrigger className="h-11 rounded-xl border-2 border-emerald-200">
                          <SelectValue placeholder="Search by name or code..." />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.displayId ? `${a.name} (Code: ${a.displayId}) — ${a.phone || ""}` : `${a.name}${a.phone ? ` — ${a.phone}` : ""}${a.email ? ` (${a.email})` : ""}`}
                            </SelectItem>
                          ))}
                          {agents.length === 0 && <SelectItem value="_none" disabled>No agents found</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {selectedAgent && (
                    <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-3 space-y-1.5 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Agent information (fetched)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div><span className="text-gray-500">Name</span><p className="font-medium text-gray-900">{selectedAgent.name || "—"}</p></div>
                        <div><span className="text-gray-500">Code</span><p className="font-medium text-gray-900">{selectedAgent.displayId || "—"}</p></div>
                        <div><span className="text-gray-500">Phone</span><p className="font-medium text-gray-900">{selectedAgent.phone || "—"}</p></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Farmer (for whom is this collection) {deliveredBy === "farmer" && <span className="text-rose-500">*</span>}
                  {deliveredBy === "agent" && <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>}
                </Label>
                <p className="text-xs text-slate-500">
                  {deliveredBy === "agent" 
                    ? "Optional: Agents can collect from multiple farmers. Select a farmer to record this collection for a specific farmer, or leave empty if recording a bulk/unattributed collection."
                    : "Type the farmer code and use the look-up icon, or search by name."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div className="space-y-1.5 min-w-0">
                    <Label htmlFor="farmerCodeLookup" className="text-xs font-medium text-gray-600">
                      Farmer code
                    </Label>
                    <div className="relative">
                      <Input
                        id="farmerCodeLookup"
                        type="text"
                        value={farmerCodeInput}
                        onChange={(e) => {
                          const v = e.target.value
                          setFarmerCodeInput(v)
                          if (!v.trim()) setFormData((prev) => ({ ...prev, farmerId: "" }))
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && (e.preventDefault(), lookupFarmerByCode(farmerCodeInput))
                        }
                        placeholder="e.g. F-001"
                        className={
                          "h-11 rounded-xl border-2 pr-11 " +
                          (errors.farmerId ? "border-rose-400 bg-rose-50" : "border-emerald-200")
                        }
                        disabled={lookingUpFarmer}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          lookupFarmerByCode(farmerCodeInput)
                        }}
                        disabled={lookingUpFarmer || !farmerCodeInput.trim()}
                        title="Look up farmer"
                        aria-label="Look up farmer by code"
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-100 hover:text-emerald-600 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {lookingUpFarmer ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <Label className="text-xs font-medium text-gray-600">
                      Don&apos;t know the code? Search by name
                    </Label>
                    <SearchableSelect
                      value={formData.farmerId}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, farmerId: value }))
                        setErrors((e) => ({ ...e, farmerId: undefined }))
                        const f = farmers.find((x) => x.id === value)
                        if (f?.farmerCode) setFarmerCodeInput(f.farmerCode.toString())
                        else if (!value) setFarmerCodeInput("")
                      }}
                      options={farmers.map((farmer) => ({
                        value: farmer.id,
                        label: farmer.farmerCode
                          ? `${farmer.name} (Code: ${farmer.farmerCode}) — ${farmer.phone || ""}`
                          : [farmer.name, farmer.phone].filter(Boolean).join(" · "),
                      }))}
                      placeholder="Search by name or farmer code..."
                      searchPlaceholder="Search farmer..."
                      className={
                        "h-11 rounded-xl " +
                        (errors.farmerId ? "!border-2 !border-rose-400 !bg-rose-50" : "!border-2 !border-emerald-200")
                      }
                    />
                  </div>
                </div>
                {errors.farmerId && (
                  <p className="text-xs text-rose-500">{errors.farmerId}</p>
                )}
                {selectedFarmer ? (
                  (() => {
                    const displayCode =
                      (selectedFarmer.farmerCode ?? farmerCodeInput) || "—"
                    return (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                            Farmer information (fetched)
                          </p>
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                            Code: {displayCode}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Name</span>
                            <p className="font-medium text-gray-900">{selectedFarmer.name || "—"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Code</span>
                            <p className="font-medium text-gray-900">{displayCode}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Phone</span>
                            <p className="font-medium text-gray-900">{selectedFarmer.phone || "—"}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <p className="text-xs text-slate-500">
                    Enter a code and use the look-up icon, or search by name above.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cropTypeId" className="text-sm font-medium text-gray-700">
                    Crop type <span className="text-rose-500">*</span>
                  </Label>
                  <SearchableSelect
                    value={formData.cropTypeId}
                    onValueChange={handleCropTypeChange}
                    options={cropTypes.map((type) => ({
                      value: type.id,
                      label: `${type.name} (${type.unitOfMeasure || "kg"})`,
                    }))}
                    placeholder="Select crop type"
                    searchPlaceholder="Search crop type..."
                    className={inputClasses + (errors.cropTypeId ? " border-rose-400" : "")}
                  />
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
                  <SearchableSelect
                    value={formData.unit}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, unit: value }))
                    }
                    options={unitOptions}
                    placeholder="Select unit"
                    searchPlaceholder="Search unit..."
                    className={inputClasses}
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

            {/* Receive into warehouse (optional) */}
            <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <WarehouseIcon className="h-4 w-4 text-slate-600" />
                Receive into warehouse (optional)
              </h3>
              <p className="text-xs text-gray-500">
                Record this collection into inventory by selecting a warehouse and product.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Warehouse</Label>
                  <SearchableSelect
                    value={formData.warehouseId}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, warehouseId: v, locationId: "", productId: "" }))
                    }
                    options={globalWarehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` }))}
                    placeholder="Select warehouse"
                    searchPlaceholder="Search warehouse..."
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Location</Label>
                  <SearchableSelect
                    value={formData.locationId}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, locationId: v }))}
                    options={warehouseLocations.map((l) => ({ value: l.id, label: `${l.name} (${l.code})` }))}
                    placeholder="Select location"
                    searchPlaceholder="Search location..."
                    className={inputClasses}
                    disabled={!formData.warehouseId}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Product</Label>
                  <SearchableSelect
                    value={formData.productId}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, productId: v }))}
                    options={productsForReceiving.map((p) => ({ value: p.id, label: `${p.name} (${p.unit})` }))}
                    placeholder="Select product"
                    searchPlaceholder="Search product..."
                    className={inputClasses}
                    disabled={!formData.cropTypeId}
                  />
                </div>
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
