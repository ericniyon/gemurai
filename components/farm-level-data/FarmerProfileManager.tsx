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
import { Plus, Edit, Trash2, User, MapPin, Phone, CreditCard, Users } from "lucide-react"

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
      const mccsRes = await fetch("/api/v1/mcc", {
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
                <CardTitle className="text-2xl font-bold text-blue-900">Farmer Profile</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Manage farmer profiles with National ID, location, assigned agents, and payment methods
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
        <DialogContent className="max-w-3xl border-2 border-blue-200 bg-white opacity-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <DialogHeader className="pb-4 border-b border-blue-200">
            <DialogTitle className="text-2xl font-bold text-blue-900">
              {editingFarmer ? "Edit Farmer Profile" : "Add Farmer Profile"}
            </DialogTitle>
            <DialogDescription className="text-blue-700 mt-2">
              {editingFarmer ? "Update farmer information" : "Create a new farmer profile with all required details"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Farmer name"
                  style={{ border: '2px solid lightblue' }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  style={{ border: '2px solid lightblue' }}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationalId" className="text-base font-semibold text-gray-700">
                  National ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  placeholder="National ID number"
                  style={{ border: '2px solid lightblue' }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mccId" className="text-base font-semibold text-gray-700">
                  MCC <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.mccId}
                  onValueChange={(value) => setFormData({ ...formData, mccId: value })}
                  required
                >
                  <SelectTrigger style={{ border: '2px solid lightblue' }}>
                    <SelectValue placeholder="Select MCC" />
                  </SelectTrigger>
                  <SelectContent>
                    {mccs.map((mcc) => (
                      <SelectItem key={mcc.id} value={mcc.id}>
                        {mcc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-semibold text-gray-700">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Location"
                  style={{ border: '2px solid lightblue' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="village" className="text-base font-semibold text-gray-700">Village</Label>
                <Input
                  id="village"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  placeholder="Village"
                  style={{ border: '2px solid lightblue' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district" className="text-base font-semibold text-gray-700">District</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="District"
                  style={{ border: '2px solid lightblue' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector" className="text-base font-semibold text-gray-700">Sector</Label>
                <Input
                  id="sector"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  placeholder="Sector"
                  style={{ border: '2px solid lightblue' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cell" className="text-base font-semibold text-gray-700">Cell</Label>
                <Input
                  id="cell"
                  value={formData.cell}
                  onChange={(e) => setFormData({ ...formData, cell: e.target.value })}
                  placeholder="Cell"
                  style={{ border: '2px solid lightblue' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultCollectionCenterId" className="text-base font-semibold text-gray-700">
                  Default Collection Center
                </Label>
                <Select
                  value={formData.defaultCollectionCenterId}
                  onValueChange={(value) => setFormData({ ...formData, defaultCollectionCenterId: value })}
                >
                  <SelectTrigger style={{ border: '2px solid lightblue' }}>
                    <SelectValue placeholder="Select collection center" />
                  </SelectTrigger>
                  <SelectContent>
                    {mccs.map((mcc) => (
                      <SelectItem key={mcc.id} value={mcc.id}>
                        {mcc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-base font-semibold text-gray-700">
                  Payment Method
                </Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger style={{ border: '2px solid lightblue' }}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ikofi">Ikofi</SelectItem>
                    <SelectItem value="mobile_money">MoMo</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ikofiId" className="text-base font-semibold text-gray-700">
                  iKOFI ID
                </Label>
                <Input
                  id="ikofiId"
                  value={formData.ikofiId}
                  onChange={(e) => setFormData({ ...formData, ikofiId: e.target.value })}
                  placeholder="iKOFI Wallet ID"
                  style={{ border: '2px solid lightblue' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-base font-semibold text-gray-700">
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g. Bank of Kigali"
                  style={{ border: '2px solid lightblue' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccountNumber" className="text-base font-semibold text-gray-700">
                Bank Account Number
              </Label>
              <Input
                id="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                placeholder="Bank account number"
                style={{ border: '2px solid lightblue' }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">Assigned Agents</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !formData.assignedAgentIds.includes(value)) {
                    setFormData({
                      ...formData,
                      assignedAgentIds: [...formData.assignedAgentIds, value],
                    })
                  }
                }}
              >
                <SelectTrigger style={{ border: '2px solid lightblue' }}>
                  <SelectValue placeholder="Add an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents
                    .filter((agent) => !formData.assignedAgentIds.includes(agent.id))
                    .map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formData.assignedAgentIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.assignedAgentIds.map((agentId) => {
                    const agent = agents.find((a) => a.id === agentId)
                    return (
                      <Badge
                        key={agentId}
                        variant="outline"
                        className="border-blue-300 text-blue-700"
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
                          className="ml-2 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
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
                {editingFarmer ? "Update Farmer" : "Create Farmer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
