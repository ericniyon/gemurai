"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SearchableSelect } from "@/components/ui/searchable-select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Package, Plus, MapPin, Calendar, Sun, Snowflake, Radio, Loader2, Smartphone, Thermometer } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// GCCS commodity types (from HarvestPlus diagram) – used for Agent supply/availability signals
const COMMODITY_TYPES = [
  { value: "LIQUID", label: "Liquid", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "DRY_GRAIN", label: "Dry / Grain", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "FRESH", label: "Fresh", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "FRESH_COLD_CHAIN", label: "Fresh / Cold chain", color: "bg-sky-100 text-sky-800 border-sky-200" },
] as const

function commodityTypeLabel(value: string | undefined): string {
  if (!value) return "—"
  const t = COMMODITY_TYPES.find((x) => x.value === value)
  return t?.label ?? value
}

function commodityTypeColor(value: string | undefined): string {
  if (!value) return "bg-slate-100 text-slate-600 border-slate-200"
  const t = COMMODITY_TYPES.find((x) => x.value === value)
  return t?.color ?? "bg-slate-100 text-slate-600 border-slate-200"
}

// Availability signal status (DB: AvailabilitySignalStatus)
const STATUS_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: "ACTIVE", label: "Active", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "RESERVED", label: "Reserved", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "COLLECTED", label: "Collected", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "EXPIRED", label: "Expired", color: "bg-red-50 text-red-700 border-red-200" },
]
function statusLabel(value: string | undefined): string {
  if (!value) return "—"
  return STATUS_OPTIONS.find((s) => s.value === value)?.label ?? value
}
function statusColor(value: string | undefined): string {
  if (!value) return "bg-slate-100 text-slate-600 border-slate-200"
  return STATUS_OPTIONS.find((s) => s.value === value)?.color ?? "bg-slate-100 text-slate-600 border-slate-200"
}

export default function PreCollectionPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const isAgent = user?.role === "AGENT"
  const [signals, setSignals] = useState<any[]>([])
  const [commodities, setCommodities] = useState<{ id: string; name: string; code: string; unitOfMeasure: string }[]>([])
  const [farmers, setFarmers] = useState<{ id: string; name: string; farmerCode?: string; village?: string; location: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    commodityId: "",
    commodityType: "",
    sourceType: "PCA",
    estimatedQuantity: "",
    unit: "kg",
    readinessAt: "",
    storageCondition: "ambient",
    farmerId: "",
    locationDescription: "",
    notes: "",
  })

  const fetchSignals = () => {
    const token = localStorage.getItem("Gemurai_token")
    if (!token) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetch("/api/v1/pre-collection/signals?status=ACTIVE", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setSignals(data.data)
        } else if (data.error) {
          toast.error(data.error)
        }
      })
      .catch(() => toast.error("Failed to load signals"))
      .finally(() => setLoading(false))
  }

  const fetchCommodities = () => {
    const token = localStorage.getItem("Gemurai_token")
    if (!token) return
    fetch("/api/v1/pre-collection/commodities", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCommodities(
            data.data.map((c: any) => ({
              id: c.id,
              name: c.name,
              code: c.code,
              unitOfMeasure: c.unitOfMeasure || "kg",
            }))
          )
        }
      })
      .catch(() => setCommodities([]))
  }

  const fetchFarmers = () => {
    const token = localStorage.getItem("Gemurai_token")
    if (!token) return
    fetch("/api/v1/farm-level-data/farmers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setFarmers(
            data.data
              .filter((f: any) => f.isActive !== false)
              .map((f: any) => ({
                id: f.id,
                name: f.name,
                farmerCode: f.farmerCode,
                village: f.village,
                location: f.location || "",
              }))
          )
        }
      })
      .catch(() => setFarmers([]))
  }

  // Unit options from database (distinct unitOfMeasure from commodities); include current form.unit so selection is always valid
  const unitOptionsFromDb = Array.from(
    new Set(commodities.map((c) => c.unitOfMeasure).filter(Boolean))
  ).sort()
  const unitOptions =
    unitOptionsFromDb.length > 0
      ? form.unit && !unitOptionsFromDb.includes(form.unit)
        ? [form.unit, ...unitOptionsFromDb]
        : unitOptionsFromDb
      : ["kg", "L", "bags"]

  useEffect(() => {
    fetchSignals()
    fetchCommodities()
    fetchFarmers()
  }, [])

  // Sorted by readiness (soonest first)
  const sortedSignals = useMemo(
    () =>
      [...signals].sort(
        (a, b) =>
          new Date(a.readinessAt ?? 0).getTime() - new Date(b.readinessAt ?? 0).getTime()
      ),
    [signals]
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.commodityId || !form.estimatedQuantity || !form.readinessAt) {
      toast.error("Fill required: commodity, quantity, readiness date")
      return
    }
    setSubmitting(true)
    const token = localStorage.getItem("Gemurai_token")
    try {
      const res = await fetch("/api/v1/pre-collection/signals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          commodityId: form.commodityId,
          sourceType: form.sourceType,
          estimatedQuantity: parseFloat(form.estimatedQuantity),
          unit: form.unit,
          readinessAt: new Date(form.readinessAt).toISOString(),
          storageCondition: form.storageCondition,
          farmerId: form.farmerId || undefined,
          locationDescription: form.locationDescription || undefined,
          notes: form.notes || undefined,
          ...(isAgent && form.commodityType
            ? { qualityIndicators: { commodityType: form.commodityType } }
            : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create")
      toast.success("Availability signal created")
      setCreateOpen(false)
      setForm({
        commodityId: "",
        commodityType: "",
        sourceType: "PCA",
        estimatedQuantity: "",
        unit: "kg",
        readinessAt: "",
        storageCondition: "ambient",
        farmerId: "",
        locationDescription: "",
        notes: "",
      })
      fetchSignals()
    } catch (err: any) {
      toast.error(err.message || "Failed to create signal")
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-600">Loading…</p>
        </div>
      </div>
    )
  }

  const inputClass =
    "h-11 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#0099f2] focus:ring-2 focus:ring-[#0099f2]/20 focus:outline-none transition-all"

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5 mb-6">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0099f2] to-[#0082d9]" />
          <div className="relative px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0099f2]/10 text-[#0099f2] ring-1 ring-[#0099f2]/20">
                  {isAgent ? (
                    <Smartphone className="h-6 w-6" strokeWidth={2} />
                  ) : (
                    <Radio className="h-6 w-6" strokeWidth={2} />
                  )}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {isAgent ? "Map Farm Availability" : "Pre-Collection Signals"}
                  </h1>
                  <p className="text-slate-600 text-sm mt-1 max-w-xl">
                    {isAgent
                      ? "Mobile Agent Maps Farm Availability. Report commodity availability at farm or location so the platform can plan collection."
                      : "Surface supply before trucks move. Create availability signals for aggregators to plan routes."}
                  </p>
                </div>
              </div>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="shrink-0 h-11 rounded-xl bg-gradient-to-r from-[#0099f2] to-[#0082d9] text-white shadow-lg shadow-[#0099f2]/25 hover:shadow-xl hover:shadow-[#0099f2]/30 hover:from-[#0082d9] hover:to-[#006bb8] transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isAgent ? "Report farm availability" : "Create signal"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-4 ring-slate-900/5">
                  {/* Header with accent bar */}
                  <div className="relative border-b border-slate-200 bg-slate-50">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0099f2] to-[#0082d9]" />
                    <DialogHeader className="relative pl-6 pr-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0099f2]/10 text-[#0099f2] ring-1 ring-[#0099f2]/20">
                          {isAgent ? (
                            <MapPin className="h-5 w-5" strokeWidth={2} />
                          ) : (
                            <Package className="h-5 w-5" strokeWidth={2} />
                          )}
                        </div>
                        <div>
                          <DialogTitle className="text-lg font-semibold text-slate-900">
                            {isAgent ? "Report farm availability" : "Create availability signal"}
                          </DialogTitle>
                          <DialogDescription className="text-slate-600 text-sm mt-0.5">
                            {isAgent
                              ? "Identify supply & availability signals. Map available commodity at this farm or location; data feeds the Commodity Configuration Engine and Bulk/Wholesale Marketplace."
                              : "Report available commodity. Time-bound and visible to aggregators."}
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>
                  </div>

                  <form onSubmit={handleCreate} className="space-y-0">
                    <div className="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto bg-white">
                      {/* Section: What's available */}
                      <section className="space-y-4">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <Package className="h-3.5 w-3.5" />
                          What&apos;s available
                        </h3>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Commodity *</Label>
                          <SearchableSelect
                            value={form.commodityId}
                            onValueChange={(v) => {
                              const commodity = commodities.find((c) => c.id === v)
                              setForm((f) => ({
                                ...f,
                                commodityId: v,
                                unit: commodity?.unitOfMeasure || f.unit,
                              }))
                            }}
                            options={commodities.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))}
                            placeholder="Select commodity"
                            searchPlaceholder="Search commodities…"
                            emptyText="No commodity found."
                            className={cn("mt-1.5 h-11 rounded-xl border border-slate-200 bg-white", "focus:border-[#0099f2] focus:ring-2 focus:ring-[#0099f2]/20")}
                          />
                        </div>
                        {isAgent && (
                          <div>
                            <Label className="text-sm font-medium text-slate-700">Commodity type (GCCS)</Label>
                            <p className="text-xs text-slate-500 mt-0.5 mb-1.5">
                              Categorize for the Commodity Configuration Engine.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {COMMODITY_TYPES.map((t) => (
                                <button
                                  key={t.value}
                                  type="button"
                                  onClick={() => setForm((f) => ({ ...f, commodityType: f.commodityType === t.value ? "" : t.value }))}
                                  className={cn(
                                    "inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                                    form.commodityType === t.value
                                      ? "ring-2 ring-[#0099f2] ring-offset-2 " + t.color
                                      : "opacity-80 hover:opacity-100 " + t.color
                                  )}
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Source</Label>
                          <div className="flex gap-2 p-1.5 mt-1.5 rounded-xl bg-slate-100 border border-slate-200" role="group">
                            {[
                              { value: "PCA", label: "PCA (field agent)" },
                              { value: "FARMER_SELF", label: "Farmer self-report" },
                              { value: "COOP_SCOUT", label: "Coop scout" },
                            ].map((opt) => (
                              <label
                                key={opt.value}
                                className={cn(
                                  "flex-1 flex items-center justify-center rounded-lg py-2.5 px-3 text-xs sm:text-sm font-medium cursor-pointer transition-all",
                                  form.sourceType === opt.value
                                    ? "bg-white text-[#0099f2] shadow border border-[#0099f2]/50"
                                    : "text-slate-600 hover:bg-white/60"
                                )}
                              >
                                <input
                                  type="radio"
                                  name="sourceType"
                                  value={opt.value}
                                  checked={form.sourceType === opt.value}
                                  onChange={() => setForm((f) => ({ ...f, sourceType: opt.value }))}
                                  className="sr-only"
                                />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-[1fr_100px] gap-4">
                          <div>
                            <Label className="text-sm font-medium text-slate-700">Estimated quantity *</Label>
                            <Input
                              type="number"
                              step="any"
                              min="0"
                              value={form.estimatedQuantity}
                              onChange={(e) => setForm((f) => ({ ...f, estimatedQuantity: e.target.value }))}
                              placeholder="e.g. 50"
                              className={cn("mt-1.5", inputClass)}
                              required
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700">Unit</Label>
                            <SearchableSelect
                              value={form.unit}
                              onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}
                              options={unitOptions.map((u) => ({ value: u, label: u }))}
                              placeholder="From commodity"
                              searchPlaceholder="Search unit…"
                              emptyText="No unit found."
                              className={cn("mt-1.5 h-11 rounded-xl border border-slate-200 bg-white", "focus:border-[#0099f2] focus:ring-2 focus:ring-[#0099f2]/20")}
                            />
                          </div>
                        </div>
                      </section>

                      {/* Section: When & storage */}
                      <section className="space-y-4 pt-2 border-t border-slate-100">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          When & storage
                        </h3>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Readiness date & time *</Label>
                          <Input
                            type="datetime-local"
                            value={form.readinessAt}
                            onChange={(e) => setForm((f) => ({ ...f, readinessAt: e.target.value }))}
                            className={cn("mt-1.5", inputClass)}
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Storage condition</Label>
                          <div className="flex gap-2 mt-1.5">
                            {[
                              { value: "ambient", label: "Ambient", icon: Sun },
                              { value: "cold", label: "Cold", icon: Snowflake },
                            ].map((opt) => {
                              const Icon = opt.icon
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setForm((f) => ({ ...f, storageCondition: opt.value }))}
                                  className={cn(
                                    "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium border transition-all",
                                    form.storageCondition === opt.value
                                      ? "bg-[#0099f2]/10 text-[#0099f2] border-[#0099f2]/40"
                                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                  )}
                                >
                                  <Icon className="h-4 w-4" />
                                  {opt.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </section>

                      {/* Section: Where & notes */}
                      <section className="space-y-4 pt-2 border-t border-slate-100">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          {isAgent ? "Farm / location & notes" : "Location & notes"}
                        </h3>
                        {isAgent && (
                          <div>
                            <Label className="text-sm font-medium text-slate-700">Farm (from database)</Label>
                            <p className="text-xs text-slate-500 mt-0.5 mb-1.5">
                              Optional. Link this availability to a registered farm.
                            </p>
                            <SearchableSelect
                              value={form.farmerId || "none"}
                              onValueChange={(v) => {
                                if (v === "none") {
                                  setForm((f) => ({ ...f, farmerId: "" }))
                                  return
                                }
                                const farmer = farmers.find((f) => f.id === v)
                                setForm((f) => ({
                                  ...f,
                                  farmerId: v,
                                  locationDescription: farmer
                                    ? [farmer.village, farmer.location].filter(Boolean).join(", ") || farmer.location
                                    : f.locationDescription,
                                }))
                              }}
                              options={[
                                { value: "none", label: "None" },
                                ...farmers.map((f) => ({
                                  value: f.id,
                                  label: `${f.name}${f.farmerCode ? ` (${f.farmerCode})` : ""}${f.village ? ` · ${f.village}` : ""}`.trim(),
                                })),
                              ]}
                              placeholder="Select farm (or leave free text below)"
                              searchPlaceholder="Search farm by name, code, village…"
                              emptyText="No farm found."
                              className={cn("mt-1.5 h-11 rounded-xl border border-slate-200 bg-white", "focus:border-[#0099f2] focus:ring-2 focus:ring-[#0099f2]/20")}
                            />
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-medium text-slate-700">
                            {isAgent ? "Location (village, sector, or address)" : "Location (village / area)"}
                          </Label>
                          <div className="relative mt-1.5">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <Input
                              value={form.locationDescription}
                              onChange={(e) => setForm((f) => ({ ...f, locationDescription: e.target.value }))}
                              placeholder={isAgent ? "e.g. Village, Sector, or filled from farm" : "e.g. Village, Sector"}
                              className={cn("pl-9", inputClass)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Notes</Label>
                          <Textarea
                            value={form.notes}
                            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                            placeholder="Optional: quality, access, contact…"
                            className={cn("mt-1.5 min-h-[88px] resize-none", inputClass)}
                          />
                        </div>
                      </section>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50 gap-3 flex-col sm:flex-row">
                      {isAgent && (
                        <p className="text-xs text-slate-500 w-full sm:order-first sm:w-auto sm:mr-auto">
                          Sends to Commodity Configuration Engine for collection planning.
                        </p>
                      )}
                      <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCreateOpen(false)}
                          className="rounded-xl flex-1 sm:flex-initial"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="rounded-xl bg-[#0099f2] hover:bg-[#0082d9] flex-1 sm:flex-initial"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {isAgent ? "Reporting…" : "Creating…"}
                            </>
                          ) : isAgent ? (
                            "Report availability"
                          ) : (
                            "Create signal"
                          )}
                        </Button>
                      </div>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Agent: Commodity types (GCCS) */}
        {isAgent && (
            <div className="mb-6 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Commodity types (GCCS)</p>
            <div className="flex flex-wrap gap-2">
              {COMMODITY_TYPES.map((t) => (
                <span
                  key={t.value}
                  className={cn("inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium", t.color)}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Signals list */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-white pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Package className="h-5 w-5 text-[#0099f2]" strokeWidth={2} />
              {isAgent ? "Your mapped availability" : "Active availability signals"}
            </CardTitle>
            <CardDescription>
              {isAgent
                ? "Farm availability you reported. Used by the platform for collection and marketplace planning."
                : "Aggregators see these to plan routes. Time-bound and non-binding."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                <p className="text-sm text-slate-500">Loading signals…</p>
              </div>
            ) : signals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  {isAgent ? (
                    <MapPin className="h-8 w-8 text-slate-400" />
                  ) : (
                    <Radio className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <p className="text-slate-600 font-medium">
                  {isAgent ? "No availability reported yet" : "No active signals"}
                </p>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  {isAgent
                    ? "Report farm availability to map supply for the Commodity Configuration Engine."
                    : "Create a signal to surface supply for aggregators."}
                </p>
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="mt-4 rounded-xl bg-[#0099f2] hover:bg-[#0082d9]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isAgent ? "Report farm availability" : "Create signal"}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-slate-200/80">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-700 bg-slate-50/80 whitespace-nowrap">Commodity</TableHead>
                      <TableHead className="font-semibold text-slate-700 bg-slate-50/80 whitespace-nowrap">Quantity</TableHead>
                      <TableHead className="font-semibold text-slate-700 bg-slate-50/80 whitespace-nowrap">Readiness</TableHead>
                      <TableHead className="font-semibold text-slate-700 bg-slate-50/80 whitespace-nowrap">Storage</TableHead>
                      <TableHead className="font-semibold text-slate-700 bg-slate-50/80 whitespace-nowrap">Type</TableHead>
                      <TableHead className="font-semibold text-slate-700 bg-slate-50/80 whitespace-nowrap">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 bg-slate-50/80 whitespace-nowrap">Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSignals.map((s) => (
                      <TableRow
                        key={s.id}
                        className="border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="font-medium text-slate-900">
                          {s.commodity?.name ?? "—"} {s.commodity?.code && (
                            <span className="text-slate-500 font-normal">({s.commodity.code})</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-700 whitespace-nowrap">
                          {s.estimatedQuantity} {s.unit}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                            {s.readinessAt ? new Date(s.readinessAt).toLocaleString() : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <Thermometer className="h-4 w-4 text-slate-400 shrink-0" />
                            {s.storageCondition === "cold" ? "Cold" : "Ambient"}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700" title="Source type">
                            {s.sourceType}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium",
                              statusColor(s.status)
                            )}
                          >
                            {statusLabel(s.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 max-w-[220px] min-w-[140px]">
                          {s.locationDescription ? (
                            <span
                              className="inline-flex items-center gap-1.5 min-w-0 max-w-full"
                              title={s.locationDescription}
                            >
                              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                              <span className="truncate">{s.locationDescription}</span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
