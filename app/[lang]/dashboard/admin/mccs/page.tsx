"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  XCircle,
  MapPin,
  Users,
  Calendar,
  Loader2,
  CheckCircle,
  X,
  Mail,
  Phone,
  Activity,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { format } from "date-fns"

interface MCC {
  id: string
  name: string
  code: string | null
  location: string
  region: string | null
  address: string | null
  managerUserId: string | null
  manager?: {
    id: string
    name: string
    email: string
    phone: string
  }
  _count?: {
    farmers: number
    milk_collections: number
    sales: number
    staff: number
  }
  createdAt?: string
  updatedAt?: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminMCCsPage() {
  const { user: currentUser } = useAuth()
  const [mccs, setMccs] = useState<MCC[]>([])
  const [filteredMCCs, setFilteredMCCs] = useState<MCC[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMCC, setEditingMCC] = useState<MCC | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    region: "",
    address: "",
    managerUserId: "none",
  })

  useEffect(() => {
    if (currentUser && (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN")) {
      fetchMCCs()
      fetchUsers()
    }
  }, [currentUser])

  useEffect(() => {
    filterMCCs()
  }, [mccs, searchQuery, regionFilter])

  const fetchMCCs = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/mcc/setup", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setMccs(result.data || [])
      } else {
        toast.error(result.error || "Failed to fetch MCCs")
      }
    } catch (error) {
      console.error("Error fetching MCCs:", error)
      toast.error("Failed to fetch MCCs")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/users/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        // Filter for users who can be managers (MCC_MANAGER, ADMIN, SUPER_ADMIN)
        const managerUsers = result.users.filter(
          (u: any) =>
            u.currentRole === "MCC_MANAGER" ||
            u.currentRole === "ADMIN" ||
            u.currentRole === "SUPER_ADMIN" ||
            u.role === "MCC_MANAGER" ||
            u.role === "ADMIN" ||
            u.role === "SUPER_ADMIN"
        )
        setUsers(managerUsers)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const filterMCCs = () => {
    let filtered = [...mccs]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (mcc) =>
          mcc.name.toLowerCase().includes(query) ||
          mcc.code?.toLowerCase().includes(query) ||
          mcc.location.toLowerCase().includes(query) ||
          mcc.region?.toLowerCase().includes(query) ||
          mcc.address?.toLowerCase().includes(query)
      )
    }

    // Region filter
    if (regionFilter !== "all") {
      filtered = filtered.filter((mcc) => mcc.region === regionFilter)
    }

    setFilteredMCCs(filtered)
  }

  const handleCreateMCC = () => {
    setEditingMCC(null)
    setFormData({
      name: "",
      code: "",
      location: "",
      region: "",
      address: "",
      managerUserId: "none",
    })
    setIsDialogOpen(true)
  }

  const handleEditMCC = (mcc: MCC) => {
    setEditingMCC(mcc)
    setFormData({
      name: mcc.name,
      code: mcc.code || "",
      location: mcc.location,
      region: mcc.region || "",
      address: mcc.address || "",
      managerUserId: mcc.managerUserId || "none",
    })
    setIsDialogOpen(true)
  }

  const handleDeleteMCC = async (mccId: string) => {
    if (!confirm("Are you sure you want to delete this MCC? This action cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/mcc/setup?id=${mccId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success || response.ok) {
        toast.success("MCC deleted successfully")
        fetchMCCs()
      } else {
        toast.error(result.error || "Failed to delete MCC")
      }
    } catch (error) {
      console.error("Error deleting MCC:", error)
      toast.error("Failed to delete MCC")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("Gemurai_token")
      const url = "/api/v1/mcc/setup"
      const method = editingMCC ? "PUT" : "POST"

      const payload: any = {
        name: formData.name,
        code: formData.code || undefined,
        location: formData.location,
        region: formData.region || undefined,
        address: formData.address || undefined,
        managerUserId: formData.managerUserId && formData.managerUserId !== "none" ? formData.managerUserId : undefined,
      }

      if (editingMCC) {
        payload.id = editingMCC.id
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success || response.ok) {
        toast.success(editingMCC ? "MCC updated successfully" : "MCC created successfully")
        setIsDialogOpen(false)
        fetchMCCs()
      } else {
        toast.error(result.error || "Failed to save MCC")
      }
    } catch (error) {
      console.error("Error saving MCC:", error)
      toast.error("Failed to save MCC")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-2 border-red-100">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
              <p className="text-gray-600">You need admin privileges to access this page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const uniqueRegions = Array.from(new Set(mccs.map((mcc) => mcc.region).filter(Boolean))) as string[]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MCC Management</h1>
              <p className="text-gray-600 mt-1">Manage Milk Collection Centers</p>
            </div>
            <Button
              onClick={handleCreateMCC}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add MCC
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total MCCs</CardTitle>
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{mccs.length}</div>
              <p className="text-xs text-gray-500 mt-1">All collection centers</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Farmers</CardTitle>
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {mccs.reduce((sum, mcc) => sum + (mcc._count?.farmers || 0), 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Registered farmers</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Collections</CardTitle>
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {mccs.reduce((sum, mcc) => sum + (mcc._count?.milk_collections || 0), 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Milk collections</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 hover:border-orange-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
                <CheckCircle className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {mccs.reduce((sum, mcc) => sum + (mcc._count?.sales || 0), 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Sales transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search MCCs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  style={{ border: '2px solid lightblue' }}
                />
              </div>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger style={{ border: '2px solid lightblue' }}>
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {uniqueRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setRegionFilter("all")
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* MCCs Table */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900">
              MCCs ({filteredMCCs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : filteredMCCs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No MCCs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Farmers</TableHead>
                      <TableHead>Collections</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMCCs.map((mcc) => (
                      <TableRow key={mcc.id}>
                        <TableCell className="font-medium">{mcc.name}</TableCell>
                        <TableCell>
                          {mcc.code ? (
                            <Badge variant="outline" className="border-blue-300 text-blue-700">
                              {mcc.code}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {mcc.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          {mcc.region ? (
                            <Badge variant="outline" className="border-green-300 text-green-700">
                              {mcc.region}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {mcc.manager ? (
                            <div className="flex flex-col">
                              <span className="font-medium">{mcc.manager.name}</span>
                              <span className="text-xs text-gray-500">{mcc.manager.email}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No manager</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            {mcc._count?.farmers || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-gray-400" />
                            {mcc._count?.milk_collections || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMCC(mcc)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMCC(mcc.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit MCC Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white opacity-100 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-900">
                {editingMCC ? "Edit MCC" : "Create New MCC"}
              </DialogTitle>
              <DialogDescription>
                {editingMCC
                  ? "Update MCC information and settings"
                  : "Add a new Milk Collection Center to the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                      MCC Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      style={{ border: '2px solid lightblue' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-base font-semibold text-gray-700">
                      MCC Code
                    </Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., MCC-001"
                      style={{ border: '2px solid lightblue' }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-base font-semibold text-gray-700">
                      Location *
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      style={{ border: '2px solid lightblue' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-base font-semibold text-gray-700">
                      Region
                    </Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      placeholder="e.g., Northern Province"
                      style={{ border: '2px solid lightblue' }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-base font-semibold text-gray-700">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full address details"
                    rows={3}
                    style={{ border: '2px solid lightblue' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerUserId" className="text-base font-semibold text-gray-700">
                    Manager
                  </Label>
                  <Select
                    value={formData.managerUserId}
                    onValueChange={(value) => setFormData({ ...formData, managerUserId: value })}
                  >
                    <SelectTrigger style={{ border: '2px solid lightblue' }}>
                      <SelectValue placeholder="Select manager (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Manager</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingMCC ? (
                    "Update MCC"
                  ) : (
                    "Create MCC"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
