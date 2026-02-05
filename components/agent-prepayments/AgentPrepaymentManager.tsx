"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, CreditCard, User, Package, Calendar, History, AlertCircle, CheckCircle } from "lucide-react"

export function AgentPrepaymentManager() {
  const [farmers, setFarmers] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [commodities, setCommodities] = useState<any[]>([])
  const [prepayments, setPrepayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPrepayment, setSelectedPrepayment] = useState<any>(null)
  const [formData, setFormData] = useState({
    farmerId: "",
    agentId: "",
    commodityId: "",
    batchId: "",
    amount: "",
    currency: "RWF",
    notes: "",
    notesSelect: "",
    customNotes: "",
  })

  const noteOptions = [
    { value: "advance_collection", label: "Advance for collection" },
    { value: "partial_advance", label: "Partial advance" },
    { value: "pre_harvest", label: "Pre-harvest advance" },
    { value: "full_advance", label: "Full advance" },
    { value: "other", label: "Other (type below)" },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      
      // Fetch farmers
      const farmersRes = await fetch("/api/v1/mcc/farmers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (farmersRes.ok) {
        const farmersData = await farmersRes.json()
        setFarmers(farmersData.data || [])
      }

      // Fetch agents
      const agentsRes = await fetch("/api/v1/farm-level-data/agents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (agentsRes.ok) {
        const agentsData = await agentsRes.json()
        setAgents(agentsData.data || [])
      }

      // Fetch commodities
      const commoditiesRes = await fetch("/api/v1/admin/commodity-studio/commodities", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (commoditiesRes.ok) {
        const commoditiesData = await commoditiesRes.json()
        setCommodities(commoditiesData.data || [])
      }

      // Fetch prepayments
      await fetchPrepayments()
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPrepayments = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/agent-prepayments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setPrepayments(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching prepayments:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.farmerId || !formData.agentId || !formData.amount) {
      toast.error("Please fill in all required fields: farmer, agent, and amount")
      return
    }

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/agent-prepayments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          commodityId: formData.commodityId || undefined,
          batchId: formData.batchId || undefined,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Prepayment recorded successfully")
        setIsDialogOpen(false)
        resetForm()
        fetchPrepayments()
      } else {
        toast.error(result.error || "Failed to record prepayment")
      }
    } catch (error) {
      console.error("Error recording prepayment:", error)
      toast.error("Failed to record prepayment")
    }
  }

  const handleViewAudit = async (prepaymentId: string) => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/agent-prepayments/${prepaymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedPrepayment(data.data)
      }
    } catch (error) {
      console.error("Error fetching prepayment details:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      farmerId: "",
      agentId: "",
      commodityId: "",
      batchId: "",
      amount: "",
      currency: "RWF",
      notes: "",
      notesSelect: "",
      customNotes: "",
    })
  }

  const handleNotesSelectChange = (value: string) => {
    if (value === "other") {
      setFormData((prev) => ({
        ...prev,
        notesSelect: value,
        notes: prev.customNotes,
      }))
    } else {
      const option = noteOptions.find((o) => o.value === value)
      setFormData((prev) => ({
        ...prev,
        notesSelect: value,
        notes: option ? option.label : "",
      }))
    }
  }

  const stats = {
    total: prepayments.length,
    pending: prepayments.filter((p) => p.status === "PENDING").length,
    settled: prepayments.filter((p) => p.status === "SETTLED").length,
    totalAmount: prepayments.reduce((s, p) => s + (p.amount || 0), 0),
  }

  const cardConfig: Record<string, { border: string; gradient: string; iconBg: string; labelColor: string; iconColor: string }> = {
    primary: { border: "border-blue-100", gradient: "from-blue-100/50 via-indigo-100/30 to-transparent", iconBg: "bg-blue-50", labelColor: "text-blue-600", iconColor: "text-blue-500" },
    amber: { border: "border-amber-100", gradient: "from-amber-100/50 via-orange-100/30 to-transparent", iconBg: "bg-amber-50", labelColor: "text-amber-600", iconColor: "text-amber-500" },
    emerald: { border: "border-emerald-100", gradient: "from-emerald-100/50 via-teal-100/30 to-transparent", iconBg: "bg-emerald-50", labelColor: "text-emerald-600", iconColor: "text-emerald-500" },
    purple: { border: "border-purple-100", gradient: "from-purple-100/50 via-indigo-100/30 to-transparent", iconBg: "bg-purple-50", labelColor: "text-purple-600", iconColor: "text-purple-500" },
  }

  const statCards = [
    { label: "Total Prepayments", value: stats.total, config: "primary", icon: CreditCard },
    { label: "Pending", value: stats.pending, config: "amber", icon: AlertCircle },
    { label: "Settled", value: stats.settled, config: "emerald", icon: CheckCircle },
    { label: "Total Amount", value: `RWF ${stats.totalAmount.toLocaleString()}`, config: "purple", icon: Package },
  ]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-slate-500">Loading prepayments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, config, icon: Icon }) => {
          const cfg = cardConfig[config] || cardConfig.primary
          return (
            <Card
              key={label}
              className={`relative overflow-hidden rounded-3xl border ${cfg.border} bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className={`absolute right-0 top-0 h-full w-24 bg-gradient-to-b ${cfg.gradient}`} />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`text-sm font-semibold uppercase tracking-wide ${cfg.labelColor}`}>
                      {label}
                    </CardTitle>
                    <p className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{value}</p>
                  </div>
                  <div className={`rounded-2xl ${cfg.iconBg} p-3`}>
                    <Icon className={`h-6 w-6 ${cfg.iconColor}`} />
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </section>

      <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg">
        <CardHeader className="border-b border-slate-200/80 bg-slate-50/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <div className="rounded-xl bg-primary/10 p-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                Prepayments
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Record agent prepayments to farmers before delivery. Advances are deducted at settlement.
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
            >
              <Plus className="h-4 w-4" />
              Record Prepayment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {prepayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-2xl bg-slate-100 p-6 mb-4">
                  <CreditCard className="h-12 w-12 text-slate-400" />
                </div>
                <p className="font-semibold text-slate-900">No prepayments yet</p>
                <p className="mt-1 text-sm text-slate-500">Record your first prepayment to get started</p>
                <Button
                  onClick={() => {
                    resetForm()
                    setIsDialogOpen(true)
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Record Prepayment
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prepayments.map((prepayment) => (
                  <Card key={prepayment.id} className="rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all shadow-sm hover:shadow-lg hover:-translate-y-0.5">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-900">
                          {prepayment.farmer?.name || "Unknown Farmer"}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={
                            prepayment.status === "PENDING" 
                              ? "bg-amber-500/10 text-amber-700 border-amber-200"
                              : prepayment.status === "SETTLED"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                              : "bg-red-500/10 text-red-700 border-red-200"
                          }
                        >
                          {prepayment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-700">Agent: {prepayment.agent?.name || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-900 font-bold">
                          {prepayment.currency} {prepayment.amount.toLocaleString()}
                        </span>
                      </div>
                      {prepayment.commodity && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-700">{prepayment.commodity.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-700">
                          {new Date(prepayment.recordedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {prepayment.settledAt && (
                        <div className="text-xs text-slate-600">
                          Settled: {new Date(prepayment.settledAt).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2 border-t border-slate-200">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewAudit(prepayment.id)}
                          className="rounded-lg border-slate-200 hover:bg-slate-50 text-xs text-slate-700"
                        >
                          <History className="h-3 w-3 mr-1" />
                          Audit Trail
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Record Prepayment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border border-slate-200/80 bg-white shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-b border-slate-200/80 px-6 pt-6 pb-5">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100/80 p-2.5">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Record Agent Prepayment</DialogTitle>
                  <DialogDescription className="text-slate-600 mt-1">
                    Advance from agent to farmer — deducted at settlement.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="mt-4 p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Farmer ID must be verified before recording. No payout if farmer ID is not verified.
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="farmerId" className="text-sm font-semibold text-slate-700">
                  Farmer <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  value={formData.farmerId}
                  onValueChange={(value) => setFormData({ ...formData, farmerId: value })}
                  options={farmers.map((f) => ({
                    value: f.id,
                    label: `${f.name}${f.nationalId ? ` (${f.nationalId})` : ""}`,
                  }))}
                  placeholder="Select farmer"
                  searchPlaceholder="Search farmers..."
                  emptyText="No farmer found."
                  className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-primary focus:!ring-2 focus:!ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentId" className="text-sm font-semibold text-slate-700">
                  Agent <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  value={formData.agentId}
                  onValueChange={(value) => setFormData({ ...formData, agentId: value })}
                  options={agents.map((a) => ({ value: a.id, label: a.name }))}
                  placeholder="Select agent"
                  searchPlaceholder="Search agents..."
                  emptyText="No agent found."
                  className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-primary focus:!ring-2 focus:!ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="commodityId" className="text-sm font-semibold text-slate-700">
                  Commodity (optional)
                </Label>
                <SearchableSelect
                  value={formData.commodityId}
                  onValueChange={(value) => setFormData({ ...formData, commodityId: value })}
                  options={commodities.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="Select commodity (optional)"
                  searchPlaceholder="Search commodities..."
                  emptyText="No commodity found."
                  className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-primary focus:!ring-2 focus:!ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-semibold text-slate-700">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="h-11 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
                <p className="text-xs text-slate-500">Currency: {formData.currency}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">Notes (optional)</Label>
              <SearchableSelect
                value={formData.notesSelect}
                onValueChange={handleNotesSelectChange}
                options={noteOptions}
                placeholder="Select or search notes..."
                searchPlaceholder="Search notes..."
                emptyText="No note found."
                className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-primary focus:!ring-2 focus:!ring-primary/20"
              />
              {formData.notesSelect === "other" && (
                <Input
                  id="notes"
                  value={formData.customNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customNotes: e.target.value,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Type your note..."
                  className="mt-2 h-11 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>

            <DialogFooter className="gap-3 pt-5 border-t border-slate-200/80">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700"
              >
                Record Prepayment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Audit Trail Dialog */}
      {selectedPrepayment && (
        <Dialog open={!!selectedPrepayment} onOpenChange={() => setSelectedPrepayment(null)}>
          <DialogContent className="max-w-2xl rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
            <DialogHeader className="pb-4 border-b border-slate-200/80">
              <DialogTitle className="text-xl font-bold text-slate-900">Audit Trail</DialogTitle>
              <DialogDescription className="text-slate-600 mt-2">
                Complete audit trail for prepayment: {selectedPrepayment.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedPrepayment.auditLogs && selectedPrepayment.auditLogs.length > 0 ? (
                selectedPrepayment.auditLogs.map((log: any, index: number) => (
                  <Card key={log.id} className="rounded-xl border border-slate-200/80">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="border-slate-200 text-slate-700">
                          {log.action}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">
                          Performed by: {log.performer?.name || "Unknown"}
                        </p>
                        {log.notes && (
                          <p className="text-gray-600 mt-1">{log.notes}</p>
                        )}
                        {log.oldValue && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <strong>Old Value:</strong>
                            <pre className="mt-1">{JSON.stringify(log.oldValue, null, 2)}</pre>
                          </div>
                        )}
                        {log.newValue && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                            <strong>New Value:</strong>
                            <pre className="mt-1">{JSON.stringify(log.newValue, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No audit logs found</p>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => setSelectedPrepayment(null)}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
