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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, CreditCard, User, Package, Calendar, History, AlertCircle } from "lucide-react"

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
  })

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
    })
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 shadow-sm">
        <CardHeader className="border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-2xl font-bold text-blue-900">Agent Prepayments</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Record agent prepayments to farmers before delivery. Advances are deducted at settlement.
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Prepayment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {prepayments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No prepayments found. Record your first prepayment to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prepayments.map((prepayment) => (
                  <Card key={prepayment.id} className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-blue-900">
                          {prepayment.farmer?.name || "Unknown Farmer"}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={
                            prepayment.status === "PENDING" 
                              ? "border-yellow-300 text-yellow-700"
                              : prepayment.status === "SETTLED"
                              ? "border-green-300 text-green-700"
                              : "border-red-300 text-red-700"
                          }
                        >
                          {prepayment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-800">Agent: {prepayment.agent?.name || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-800 font-bold">
                          {prepayment.currency} {prepayment.amount.toLocaleString()}
                        </span>
                      </div>
                      {prepayment.commodity && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-800">{prepayment.commodity.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-800">
                          {new Date(prepayment.recordedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {prepayment.settledAt && (
                        <div className="text-xs text-gray-600">
                          Settled: {new Date(prepayment.settledAt).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2 border-t border-blue-100">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewAudit(prepayment.id)}
                          className="border-blue-200 hover:bg-blue-50 text-xs"
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
        <DialogContent className="max-w-3xl border-2 border-blue-200 bg-white opacity-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <DialogHeader className="pb-4 border-b border-blue-200">
            <DialogTitle className="text-2xl font-bold text-blue-900">Record Agent Prepayment</DialogTitle>
            <DialogDescription className="text-blue-700 mt-2">
              Record an advance payment from an agent to a farmer. This will be deducted at settlement.
            </DialogDescription>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Farmer ID must be verified before recording prepayment. 
                No payout will be processed if farmer ID is not verified.
              </p>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farmerId" className="text-base font-semibold text-gray-700">
                  Farmer <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.farmerId}
                  onValueChange={(value) => setFormData({ ...formData, farmerId: value })}
                  required
                >
                  <SelectTrigger style={{ border: '2px solid lightblue' }}>
                    <SelectValue placeholder="Select farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.id}>
                        {farmer.name} {farmer.nationalId ? `(${farmer.nationalId})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentId" className="text-base font-semibold text-gray-700">
                  Agent <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.agentId}
                  onValueChange={(value) => setFormData({ ...formData, agentId: value })}
                  required
                >
                  <SelectTrigger style={{ border: '2px solid lightblue' }}>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commodityId" className="text-base font-semibold text-gray-700">
                  Commodity (Optional)
                </Label>
                <Select
                  value={formData.commodityId}
                  onValueChange={(value) => setFormData({ ...formData, commodityId: value })}
                >
                  <SelectTrigger style={{ border: '2px solid lightblue' }}>
                    <SelectValue placeholder="Select commodity (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {commodities.map((commodity) => (
                      <SelectItem key={commodity.id} value={commodity.id}>
                        {commodity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base font-semibold text-gray-700">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Amount"
                  style={{ border: '2px solid lightblue' }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold text-gray-700">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                style={{ border: '2px solid lightblue' }}
              />
            </div>

            <DialogFooter className="gap-2 pt-4 border-t-2 border-blue-300">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
                className="border-blue-200 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
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
          <DialogContent className="max-w-2xl border-2 border-blue-200 bg-white opacity-100">
            <DialogHeader className="pb-4 border-b border-blue-200">
              <DialogTitle className="text-2xl font-bold text-blue-900">Audit Trail</DialogTitle>
              <DialogDescription className="text-blue-700 mt-2">
                Complete audit trail for prepayment: {selectedPrepayment.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedPrepayment.auditLogs && selectedPrepayment.auditLogs.length > 0 ? (
                selectedPrepayment.auditLogs.map((log: any, index: number) => (
                  <Card key={log.id} className="border-2 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="border-blue-300 text-blue-700">
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
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
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
