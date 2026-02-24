"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ClipboardList,
  Coffee,
  Droplets,
  FileCheck,
  Loader2,
  Package,
  Search,
  Truck,
  User,
  UserCheck,
  Warehouse as WarehouseIcon,
  Wheat,
} from "lucide-react"

const STEPS = [
  { id: 1, title: "Deliverer", description: "Who is delivering?", icon: User },
  { id: 2, title: "Commodity", description: "Select product type", icon: Package },
  { id: 3, title: "Details", description: "Quantity & quality", icon: ClipboardList },
  { id: 4, title: "Review", description: "Confirm & submit", icon: FileCheck },
]

function getCollectionTypeIcon(name: string) {
  const n = (name || "").toLowerCase()
  if (n.includes("dairy") || n.includes("milk")) return Droplets
  if (n.includes("coffee")) return Coffee
  if (n.includes("cereal") || n.includes("grain") || n.includes("maize")) return Wheat
  return Package
}

function isPlaceholderText(s: string | null | undefined): boolean {
  if (!s || typeof s !== "string") return true
  const t = s.toLowerCase()
  return /amet|lorem|dol(or)?|tempor|ipsum/.test(t)
}

export default function CollectCommodityPage() {
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const { user } = useAuth()
  const effectiveMccId = user?.mccId

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingCommodities, setLoadingCommodities] = useState(false)
  const [loadingFarmers, setLoadingFarmers] = useState(false)
  const [loadingAgents, setLoadingAgents] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [commodities, setCommodities] = useState<any[]>([])
  const [selectedCommodity, setSelectedCommodity] = useState<any>(null)
  const [farmers, setFarmers] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [globalWarehouses, setGlobalWarehouses] = useState<{ id: string; name: string; code: string }[]>([])
  const [warehouseLocations, setWarehouseLocations] = useState<{ id: string; name: string; code: string }[]>([])
  const [productsForReceiving, setProductsForReceiving] = useState<{ id: string; name: string; unit: string }[]>([])

  const [deliveredBy, setDeliveredBy] = useState<"farmer" | "agent">("farmer")
  const [farmerCodeInput, setFarmerCodeInput] = useState("")
  const [lookingUpFarmer, setLookingUpFarmer] = useState(false)
  const [agentCodeInput, setAgentCodeInput] = useState("")
  const [lookingUpAgent, setLookingUpAgent] = useState(false)

  const [formData, setFormData] = useState({
    collectionTypeId: "",
    commodityId: "",
    farmerId: "",
    agentId: "",
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

  const selectedFarmer = formData.farmerId ? farmers.find((f) => f.id === formData.farmerId) : null
  const selectedAgent = formData.agentId ? agents.find((a) => a.id === formData.agentId) : null

  useEffect(() => {
    if (effectiveMccId) {
      fetchCommodities()
      fetchFarmers()
      fetchAgents()
      fetchGlobalWarehouses()
    }
  }, [effectiveMccId])

  useEffect(() => {
    if (formData.warehouseId) {
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
  }, [formData.warehouseId])

  useEffect(() => {
    if (effectiveMccId && formData.commodityId) {
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
  }, [effectiveMccId, formData.commodityId])

  async function fetchCommodities() {
    if (!effectiveMccId) return
    setLoadingCommodities(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const res = await fetch(`/api/v1/admin/commodity-studio/commodities`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setCommodities(data.data.filter((c: any) => c.isActive !== false))
      }
    } catch (err) {
      console.error("Error fetching commodities:", err)
    } finally {
      setLoadingCommodities(false)
    }
  }

  async function fetchFarmers() {
    if (!effectiveMccId) return
    setLoadingFarmers(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const res = await fetch(`/api/v1/mcc/farmers?mccId=${effectiveMccId}&limit=500`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setFarmers(data.data)
      }
    } catch (err) {
      console.error("Error fetching farmers:", err)
    } finally {
      setLoadingFarmers(false)
    }
  }

  async function fetchAgents() {
    if (!effectiveMccId) return
    setLoadingAgents(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const res = await fetch(`/api/v1/mcc/agents?mccId=${effectiveMccId}&limit=200`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setAgents(data.data)
      }
    } catch (err) {
      console.error("Error fetching agents:", err)
    } finally {
      setLoadingAgents(false)
    }
  }

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
      }
    } catch {
      setGlobalWarehouses([])
    }
  }

  const lookupFarmerByCode = (code: string) => {
    const trimmed = (code || "").trim()
    if (!trimmed) {
      setFormData((p) => ({ ...p, farmerId: "" }))
      setErrors((e) => ({ ...e, farmerId: "Enter a farmer code to look up." }))
      return
    }
    setLookingUpFarmer(true)
    setErrors((e) => ({ ...e, farmerId: "" }))
    const match = farmers.find(
      (f) => (f.farmerCode || "").toString().toLowerCase() === trimmed.toLowerCase()
    )
    setTimeout(() => {
      setLookingUpFarmer(false)
      if (match) {
        setFormData((p) => ({ ...p, farmerId: match.id }))
        setFarmerCodeInput(match.farmerCode?.toString() ?? trimmed)
        toast.success(`Found: ${match.name}`)
      } else {
        setFormData((p) => ({ ...p, farmerId: "" }))
        setErrors((e) => ({ ...e, farmerId: `No farmer found with code "${trimmed}".` }))
        toast.error(`No farmer found with code "${trimmed}"`)
      }
    }, 300)
  }

  const lookupAgentByCode = (code: string) => {
    const trimmed = (code || "").trim()
    if (!trimmed) {
      setFormData((p) => ({ ...p, agentId: "" }))
      setErrors((e) => ({ ...e, agentId: "Enter an agent code to look up." }))
      return
    }
    setLookingUpAgent(true)
    setErrors((e) => ({ ...e, agentId: "" }))
    const match = agents.find(
      (a) => (a.displayId || "").toString().toLowerCase() === trimmed.toLowerCase()
    )
    setTimeout(() => {
      setLookingUpAgent(false)
      if (match) {
        setFormData((p) => ({ ...p, agentId: match.id }))
        setAgentCodeInput(match.displayId?.toString() ?? trimmed)
        toast.success(`Found: ${match.name}`)
      } else {
        setFormData((p) => ({ ...p, agentId: "" }))
        setErrors((e) => ({ ...e, agentId: `No agent found with code "${trimmed}".` }))
        toast.error(`No agent found with code "${trimmed}"`)
      }
    }, 300)
  }

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {}
    if (stepNum === 1) {
      // Farmer is required only when farmer delivers directly
      // When agent delivers, farmer is optional (agent may collect from multiple sources)
      if (deliveredBy === "farmer" && !formData.farmerId) {
        newErrors.farmerId = "Please select a farmer"
      }
      if (deliveredBy === "agent" && !formData.agentId) newErrors.agentId = "Please select an agent"
    }
    if (stepNum === 2) {
      if (!formData.commodityId) newErrors.commodityId = "Please select a commodity"
    }
    if (stepNum === 3) {
      if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4))
    }
  }

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    setIsLoading(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const payload = {
        mccId: effectiveMccId,
        farmerId: formData.farmerId,
        agentId: deliveredBy === "agent" ? formData.agentId : null,
        commodityId: formData.commodityId,
        quantity: formData.quantity,
        pricePerUnit: formData.pricePerUnit || selectedCommodity?.basePrice || 0,
        totalAmount: formData.quantity * (formData.pricePerUnit || selectedCommodity?.basePrice || 0),
        qualityData: formData.qualityData,
        farmerAdvance: formData.advances,
        agentAdvance: formData.agentAdvance,
        notes: formData.notes,
        warehouseId: formData.warehouseId || null,
        locationId: formData.locationId || null,
        productId: formData.productId || null,
        gpsLatitude: formData.gpsLatitude,
        gpsLongitude: formData.gpsLongitude,
        status: "PENDING",
      }

      const res = await fetch("/api/v1/mcc/commodities/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Collection recorded successfully!")
        router.push(`/${lang}/dashboard/mcc/commodities/collections`)
      } else {
        toast.error(data.error || "Failed to record collection")
      }
    } catch (err) {
      console.error("Error submitting:", err)
      toast.error("An error occurred while recording collection")
    } finally {
      setIsLoading(false)
    }
  }

  const collectionTypes = Array.from(
    new Map(
      commodities.map((c) => [
        c.collectionType?.id || "all",
        { id: c.collectionType?.id || "all", name: c.collectionType?.name || "All Types" },
      ])
    ).values()
  )

  const filteredCommodities =
    formData.collectionTypeId && formData.collectionTypeId !== "all"
      ? commodities.filter((c) => c.collectionType?.id === formData.collectionTypeId)
      : commodities

  const totalAmount = formData.quantity * (formData.pricePerUnit || selectedCommodity?.basePrice || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${lang}/dashboard`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 p-4 shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Record Commodity Collection</h1>
              <p className="text-gray-600">Record a new commodity delivery from a farmer</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all",
                      step === s.id
                        ? "border-purple-600 bg-purple-600 text-white"
                        : step > s.id
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    )}
                  >
                    {step > s.id ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium",
                      step === s.id ? "text-purple-600" : step > s.id ? "text-emerald-600" : "text-gray-400"
                    )}
                  >
                    {s.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 w-12 sm:w-20 lg:w-32",
                      step > s.id ? "bg-emerald-500" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-xl border-0">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="flex items-center gap-3">
              {(() => {
                const StepIcon = STEPS[step - 1].icon
                return <StepIcon className="h-5 w-5 text-purple-600" />
              })()}
              {STEPS[step - 1].title}
            </CardTitle>
            <CardDescription>{STEPS[step - 1].description}</CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {/* Step 1: Deliverer */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Who is delivering?</Label>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDeliveredBy("farmer")}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
                        deliveredBy === "farmer"
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <User className={cn("h-8 w-8", deliveredBy === "farmer" ? "text-purple-600" : "text-gray-400")} />
                      <span className={cn("font-semibold", deliveredBy === "farmer" ? "text-purple-600" : "text-gray-600")}>
                        Farmer (Direct)
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveredBy("agent")}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
                        deliveredBy === "agent"
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <Truck className={cn("h-8 w-8", deliveredBy === "agent" ? "text-purple-600" : "text-gray-400")} />
                      <span className={cn("font-semibold", deliveredBy === "agent" ? "text-purple-600" : "text-gray-600")}>
                        Via Agent
                      </span>
                    </button>
                  </div>
                </div>

                {/* Farmer Lookup */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    Farmer Code
                    {deliveredBy === "farmer" && <span className="text-red-500">*</span>}
                    {deliveredBy === "agent" && <span className="text-gray-400 text-xs font-normal">(optional)</span>}
                  </Label>
                  {deliveredBy === "agent" && (
                    <p className="text-xs text-gray-500">
                      Optional: Agents can collect from multiple farmers. Select a farmer to record this collection for a specific farmer, or leave empty if recording a bulk/unattributed collection.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter farmer code"
                      value={farmerCodeInput}
                      onChange={(e) => setFarmerCodeInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && lookupFarmerByCode(farmerCodeInput)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => lookupFarmerByCode(farmerCodeInput)}
                      disabled={lookingUpFarmer}
                    >
                      {lookingUpFarmer ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.farmerId && <p className="text-sm text-red-500">{errors.farmerId}</p>}
                  {selectedFarmer && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-emerald-900">{selectedFarmer.name}</p>
                          <p className="text-sm text-emerald-700">Code: {selectedFarmer.farmerCode}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="text-sm text-gray-500">Or search by name:</div>
                  <SearchableSelect
                    options={farmers.map((f) => ({ value: f.id, label: `${f.name} (${f.farmerCode || "N/A"})` }))}
                    value={formData.farmerId}
                    onValueChange={(v) => {
                      setFormData((p) => ({ ...p, farmerId: v }))
                      const f = farmers.find((x) => x.id === v)
                      if (f) setFarmerCodeInput(f.farmerCode?.toString() || "")
                    }}
                    placeholder="Search farmers..."
                    loading={loadingFarmers}
                  />
                </div>

                {/* Agent Lookup (if via agent) */}
                {deliveredBy === "agent" && (
                  <div className="space-y-3">
                    <Label>Agent Code</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter agent code"
                        value={agentCodeInput}
                        onChange={(e) => setAgentCodeInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && lookupAgentByCode(agentCodeInput)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => lookupAgentByCode(agentCodeInput)}
                        disabled={lookingUpAgent}
                      >
                        {lookingUpAgent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.agentId && <p className="text-sm text-red-500">{errors.agentId}</p>}
                    {selectedAgent && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-emerald-600" />
                          <div>
                            <p className="font-semibold text-emerald-900">{selectedAgent.name}</p>
                            <p className="text-sm text-emerald-700">ID: {selectedAgent.displayId}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <SearchableSelect
                      options={agents.map((a) => ({ value: a.id, label: `${a.name} (${a.displayId || "N/A"})` }))}
                      value={formData.agentId}
                      onValueChange={(v) => {
                        setFormData((p) => ({ ...p, agentId: v }))
                        const a = agents.find((x) => x.id === v)
                        if (a) setAgentCodeInput(a.displayId?.toString() || "")
                      }}
                      placeholder="Search agents..."
                      loading={loadingAgents}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Commodity Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label>Collection Type (Optional)</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, collectionTypeId: "" }))}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-all",
                        !formData.collectionTypeId
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      All Types
                    </button>
                    {collectionTypes.map((ct) => {
                      const Icon = getCollectionTypeIcon(ct.name)
                      return (
                        <button
                          key={ct.id}
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, collectionTypeId: ct.id }))}
                          className={cn(
                            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                            formData.collectionTypeId === ct.id
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {ct.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <Label>Select Commodity</Label>
                  {loadingCommodities ? (
                    <div className="flex items-center gap-2 py-8 text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading commodities...
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {filteredCommodities.map((c) => {
                        const Icon = getCollectionTypeIcon(c.collectionType?.name || c.name)
                        const isSelected = formData.commodityId === c.id
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setFormData((p) => ({ ...p, commodityId: c.id, pricePerUnit: c.basePrice || 0 }))
                              setSelectedCommodity(c)
                            }}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                              isSelected
                                ? "border-purple-600 bg-purple-50"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <Icon className={cn("h-8 w-8", isSelected ? "text-purple-600" : "text-gray-400")} />
                            <span className={cn("text-sm font-medium text-center", isSelected ? "text-purple-600" : "text-gray-700")}>
                              {c.name}
                            </span>
                            {c.basePrice > 0 && (
                              <span className="text-xs text-gray-500">{c.basePrice} / {c.unit || "unit"}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {errors.commodityId && <p className="mt-2 text-sm text-red-500">{errors.commodityId}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Quantity & Details */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label>Quantity ({selectedCommodity?.unit || "units"})</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.quantity || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, quantity: parseFloat(e.target.value) || 0 }))}
                      className="mt-2 text-lg"
                      placeholder="0.00"
                    />
                    {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
                  </div>
                  <div>
                    <Label>Price per {selectedCommodity?.unit || "unit"}</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricePerUnit || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, pricePerUnit: parseFloat(e.target.value) || 0 }))}
                      className="mt-2 text-lg"
                      placeholder={selectedCommodity?.basePrice?.toString() || "0.00"}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-purple-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {totalAmount.toLocaleString()} RWF
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label>Farmer Advance (optional)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.advances || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, advances: parseFloat(e.target.value) || 0 }))}
                      className="mt-2"
                      placeholder="0"
                    />
                  </div>
                  {deliveredBy === "agent" && (
                    <div>
                      <Label>Agent Advance (optional)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.agentAdvance || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, agentAdvance: parseFloat(e.target.value) || 0 }))}
                        className="mt-2"
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>

                {globalWarehouses.length > 0 && (
                  <div>
                    <Label>Warehouse (optional)</Label>
                    <SearchableSelect
                      options={globalWarehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` }))}
                      value={formData.warehouseId}
                      onValueChange={(v) => setFormData((p) => ({ ...p, warehouseId: v, locationId: "" }))}
                      placeholder="Select warehouse..."
                    />
                  </div>
                )}

                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Additional notes about this collection..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="rounded-xl bg-gray-50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Farmer</span>
                      <span className="font-medium">{selectedFarmer?.name || "—"}</span>
                    </div>
                    {selectedAgent && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Agent</span>
                        <span className="font-medium">{selectedAgent.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Commodity</span>
                      <span className="font-medium">{selectedCommodity?.name || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Quantity</span>
                      <span className="font-medium">{formData.quantity} {selectedCommodity?.unit || "units"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Price per Unit</span>
                      <span className="font-medium">{formData.pricePerUnit || selectedCommodity?.basePrice || 0} RWF</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                      <span className="text-xl font-bold text-purple-600">{totalAmount.toLocaleString()} RWF</span>
                    </div>
                  </div>
                </div>

                {(formData.advances > 0 || formData.agentAdvance > 0) && (
                  <div className="rounded-xl bg-amber-50 p-4">
                    <h4 className="font-semibold text-amber-800 mb-2">Advances</h4>
                    {formData.advances > 0 && (
                      <p className="text-sm text-amber-700">Farmer Advance: {formData.advances.toLocaleString()} RWF</p>
                    )}
                    {formData.agentAdvance > 0 && (
                      <p className="text-sm text-amber-700">Agent Advance: {formData.agentAdvance.toLocaleString()} RWF</p>
                    )}
                  </div>
                )}

                {formData.notes && (
                  <div className="rounded-xl bg-gray-50 p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{formData.notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? () => router.push(`/${lang}/dashboard`) : handleBack}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {step === 1 ? "Cancel" : "Back"}
            </Button>

            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Record Collection
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
