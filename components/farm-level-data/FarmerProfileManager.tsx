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
import { Plus, Edit, Trash2, User, MapPin, Phone, CreditCard, Users, Package, Wallet } from "lucide-react"

export function FarmerProfileManager() {
  const [farmers, setFarmers] = useState<any[]>([])
  const [mccs, setMccs] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFarmer, setEditingFarmer] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    nationalId: "",
    mccId: "",
    location: "",
    village: "",
    district: "",
    sector: "",
    cell: "",
    defaultCollectionCenterId: "",
    paymentMethod: "",
    ikofiId: "",
    bankAccountNumber: "",
    bankName: "",
    assignedAgentIds: [] as string[],
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

      // Fetch MCCs
      const mccsRes = await fetch("/api/v1/mcc/setup", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (mccsRes.ok) {
        const mccsData = await mccsRes.json()
        setMccs(mccsData.data || [])
      }

      // Fetch agents (users with agent role)
      const agentsRes = await fetch("/api/v1/farm-level-data/agents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (agentsRes.ok) {
        const agentsData = await agentsRes.json()
        setAgents(agentsData.data || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.nationalId || !formData.mccId) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const token = localStorage.getItem("Gemurai_token")
      const url = editingFarmer
        ? `/api/v1/farm-level-data/farmers/${editingFarmer.id}`
        : "/api/v1/farm-level-data/farmers"
      
      const method = editingFarmer ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(editingFarmer ? "Farmer updated successfully" : "Farmer created successfully")
        setIsDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        toast.error(result.error || "Failed to save farmer")
      }
    } catch (error) {
      console.error("Error saving farmer:", error)
      toast.error("Failed to save farmer")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      nationalId: "",
      mccId: "",
      location: "",
      village: "",
      district: "",
      sector: "",
      cell: "",
      defaultCollectionCenterId: "",
      paymentMethod: "",
      ikofiId: "",
      bankAccountNumber: "",
      bankName: "",
      assignedAgentIds: [],
    })
    setEditingFarmer(null)
  }

  const handleEdit = (farmer: any) => {
    setEditingFarmer(farmer)
    setFormData({
      name: farmer.name || "",
      phone: farmer.phone || "",
      nationalId: farmer.nationalId || "",
      mccId: farmer.mccId || "",
      location: farmer.location || "",
      village: farmer.village || "",
      district: farmer.district || "",
      sector: farmer.sector || "",
      cell: farmer.cell || "",
      defaultCollectionCenterId: farmer.defaultCollectionCenterId || "",
      paymentMethod: farmer.paymentMethod || "",
      ikofiId: farmer.ikofiId || "",
      bankAccountNumber: farmer.bankAccountNumber || "",
      bankName: farmer.bankName || "",
      assignedAgentIds: farmer.assignedAgents?.map((a: any) => a.agentId) || [],
    })
    setIsDialogOpen(true)
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
              <User className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-2xl font-bold text-blue-900">Farmers</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Add, edit, and manage farmer profiles — National ID, location, assigned agents, and payment methods
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
              Add Farmer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {farmers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No farmers found. Add your first farmer to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {farmers.map((farmer) => (
                  <Card key={farmer.id} className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-blue-900">{farmer.name}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(farmer)}
                            className="border-blue-200 hover:bg-blue-50"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-800">{farmer.phone}</span>
                      </div>
                      {farmer.nationalId && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-800">ID: {farmer.nationalId}</span>
                        </div>
                      )}
                      {farmer.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-800">{farmer.location}</span>
                        </div>
                      )}
                      {farmer.paymentMethod && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <Badge variant="outline" className="border-blue-300 text-blue-700 capitalize">
                            {farmer.paymentMethod}
                          </Badge>
                        </div>
                      )}
                      {farmer.ikofiId && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-800">iKOFI: {farmer.ikofiId}</span>
                        </div>
                      )}
                      {farmer.bankAccountNumber && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-800">
                            {farmer.bankName || "Bank"}: {farmer.bankAccountNumber}
                          </span>
                        </div>
                      )}
                      {farmer.totalVolumeCollected > 0 && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-800">
                            Total Volume: {farmer.totalVolumeCollected.toLocaleString()} L
                          </span>
                        </div>
                      )}
                      {farmer.assignedAgents && farmer.assignedAgents.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-800">
                            {farmer.assignedAgents.length} agent(s)
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Farmer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="flex max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-2xl">
          {/* Header with brand gradient */}
          <div className="shrink-0 border-b border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-6 pt-6 pb-4">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100/80 p-2.5">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">
                    {editingFarmer ? "Edit Farmer Profile" : "Add Farmer Profile"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-slate-600">
                    {editingFarmer ? "Update farmer information" : "Create a new farmer profile with required details"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Personal & MCC */}
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <User className="h-4 w-4 text-blue-600" />
                  Personal & MCC
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Farmer name"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationalId" className="text-sm font-semibold text-slate-700">
                      National ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nationalId"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      placeholder="National ID number"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mccId" className="text-sm font-semibold text-slate-700">
                      MCC <span className="text-red-500">*</span>
                    </Label>
                    <SearchableSelect
                      value={formData.mccId}
                      onValueChange={(value) => setFormData({ ...formData, mccId: value })}
                      options={mccs.map((mcc) => ({ value: mcc.id, label: mcc.name }))}
                      placeholder="Select MCC"
                      searchPlaceholder="Search MCCs..."
                      emptyText="No MCC found."
                      className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200"
                    />
                  </div>
                </div>
              </section>

              {/* Location */}
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-semibold text-slate-700">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Location"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="village" className="text-sm font-semibold text-slate-700">Village</Label>
                    <Input
                      id="village"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      placeholder="Village"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-sm font-semibold text-slate-700">District</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="District"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sector" className="text-sm font-semibold text-slate-700">Sector</Label>
                    <Input
                      id="sector"
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      placeholder="Sector"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="cell" className="text-sm font-semibold text-slate-700">Cell</Label>
                    <Input
                      id="cell"
                      value={formData.cell}
                      onChange={(e) => setFormData({ ...formData, cell: e.target.value })}
                      placeholder="Cell"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              </section>

              {/* Collection & Payment */}
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  Collection & Payment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCollectionCenterId" className="text-sm font-semibold text-slate-700">
                      Default Collection Center
                    </Label>
                    <SearchableSelect
                      value={formData.defaultCollectionCenterId}
                      onValueChange={(value) => setFormData({ ...formData, defaultCollectionCenterId: value })}
                      options={mccs.map((mcc) => ({ value: mcc.id, label: mcc.name }))}
                      placeholder="Select collection center"
                      searchPlaceholder="Search collection centers..."
                      emptyText="No collection center found."
                      className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod" className="text-sm font-semibold text-slate-700">
                      Payment Method
                    </Label>
                    <SearchableSelect
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                      options={[
                        { value: "ikofi", label: "Ikofi" },
                        { value: "mobile_money", label: "MoMo" },
                        { value: "bank_transfer", label: "Bank Transfer" },
                        { value: "cash", label: "Cash" },
                      ]}
                      placeholder="Select payment method"
                      searchPlaceholder="Search payment method..."
                      emptyText="No payment method found."
                      className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ikofiId" className="text-sm font-semibold text-slate-700">iKOFI ID</Label>
                    <Input
                      id="ikofiId"
                      value={formData.ikofiId}
                      onChange={(e) => setFormData({ ...formData, ikofiId: e.target.value })}
                      placeholder="iKOFI Wallet ID"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="text-sm font-semibold text-slate-700">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. Bank of Kigali"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="bankAccountNumber" className="text-sm font-semibold text-slate-700">
                      Bank Account Number
                    </Label>
                    <Input
                      id="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      placeholder="Bank account number"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              </section>

              {/* Assigned Agents */}
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Users className="h-4 w-4 text-blue-600" />
                  Assigned Agents
                </h3>
                <div className="space-y-2">
                  <SearchableSelect
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.assignedAgentIds.includes(value)) {
                        setFormData({
                          ...formData,
                          assignedAgentIds: [...formData.assignedAgentIds, value],
                        })
                      }
                    }}
                    options={agents
                      .filter((agent) => !formData.assignedAgentIds.includes(agent.id))
                      .map((agent) => ({ value: agent.id, label: agent.name }))}
                    placeholder="Add an agent"
                    searchPlaceholder="Search agents..."
                    emptyText="No agent found or all assigned."
                    className="h-11 rounded-xl !border !border-slate-200 !bg-white text-slate-900 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200"
                  />
                  {formData.assignedAgentIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.assignedAgentIds.map((agentId) => {
                        const agent = agents.find((a) => a.id === agentId)
                        return (
                          <Badge
                            key={agentId}
                            variant="outline"
                            className="border-blue-200 bg-blue-50/50 text-blue-800 py-1.5 pr-1 pl-2.5 rounded-lg"
                          >
                            {agent?.name || agentId}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  assignedAgentIds: formData.assignedAgentIds.filter((id) => id !== agentId),
                                })
                              }}
                              className="ml-1.5 rounded p-0.5 hover:bg-blue-200/50 text-blue-600"
                              aria-label="Remove agent"
                            >
                              ×
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <DialogFooter className="shrink-0 gap-3 border-t border-slate-200/80 px-6 py-4 bg-slate-50/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700"
              >
                {editingFarmer ? "Update Farmer" : "Create Farmer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
