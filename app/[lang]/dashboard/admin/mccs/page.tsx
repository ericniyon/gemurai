"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
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
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react"
import { FarmerAssignmentDialog } from "@/components/mcc/FarmerAssignmentDialog"
import { Progress } from "@/components/ui/progress"
import { GeoLocationInput } from "@/components/ui/geo-location-input"
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
  contactInfo?: { phone?: string; email?: string }
  gpsLatitude?: number | null
  gpsLongitude?: number | null
  isActive?: boolean
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
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMCC, setEditingMCC] = useState<MCC | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [assignTargetMcc, setAssignTargetMcc] = useState<MCC | null>(null)

  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    region: "",
    address: "",
    phone: "",
    email: "",
    managerUserId: "none",
    gpsLatitude: null as number | null,
    gpsLongitude: null as number | null,
    isActive: true,
  })

  useEffect(() => {
    if (currentUser && (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN")) {
      fetchMCCs()
      fetchUsers()
    }
  }, [currentUser])

  const filteredMCCs = regionFilter === "all"
    ? mccs
    : mccs.filter((mcc) => mcc.region === regionFilter)

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
        toast.error(result.error || "Failed to fetch collection centers")
      }
    } catch (error) {
      console.error("Error fetching MCCs:", error)
      toast.error("Failed to fetch collection centers")
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

  const handleCreateMCC = () => {
    setEditingMCC(null)
    setFormStep(1)
    setFormData({
      name: "",
      location: "",
      region: "",
      address: "",
      phone: "",
      email: "",
      managerUserId: "none",
      gpsLatitude: null,
      gpsLongitude: null,
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  const handleEditMCC = (mcc: MCC) => {
    setEditingMCC(mcc)
    setFormStep(1)
    const mccAny = mcc as any
    setFormData({
      name: mcc.name,
      location: mcc.location,
      region: mcc.region || "",
      address: mcc.address || "",
      phone: (mccAny.contactInfo as any)?.phone || "",
      email: (mccAny.contactInfo as any)?.email || "",
      managerUserId: mcc.managerUserId || "none",
      gpsLatitude: mccAny.gpsLatitude ?? null,
      gpsLongitude: mccAny.gpsLongitude ?? null,
      isActive: mccAny.isActive !== false,
    })
    setIsDialogOpen(true)
  }

  const handleAssignFarmers = (mcc: MCC) => {
    setAssignTargetMcc(mcc)
    setIsAssignDialogOpen(true)
  }

  const handleDeleteMCC = async (mccId: string) => {
    if (!confirm("Are you sure you want to delete this Collection Center? This action cannot be undone.")) {
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
        toast.success("Collection center deleted successfully")
        fetchMCCs()
      } else {
        toast.error(result.error || "Failed to delete Collection Center")
      }
    } catch (error) {
      console.error("Error deleting MCC:", error)
      toast.error("Failed to delete Collection Center")
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
        location: formData.location,
        region: formData.region || undefined,
        address: formData.address || undefined,
        managerUserId: formData.managerUserId && formData.managerUserId !== "none" ? formData.managerUserId : undefined,
        contactInfo: {
          ...(formData.phone && { phone: formData.phone }),
          ...(formData.email && { email: formData.email }),
        },
        gpsLatitude: formData.gpsLatitude ?? undefined,
        gpsLongitude: formData.gpsLongitude ?? undefined,
        isActive: formData.isActive,
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
        toast.success(editingMCC ? "Collection center updated successfully" : "Collection center created successfully")
        setIsDialogOpen(false)
        fetchMCCs()
      } else {
        toast.error(result.error || "Failed to save Collection Center")
      }
    } catch (error) {
      console.error("Error saving MCC:", error)
      toast.error("Failed to save Collection Center")
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
              <h1 className="text-3xl font-bold text-gray-900">Collection Center Management</h1>
              <p className="text-gray-600 mt-1">Manage Milk Collection Centers</p>
            </div>
            <Button
              onClick={handleCreateMCC}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Collection Center
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Collection Centers</CardTitle>
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
            <div className="flex flex-wrap items-center gap-4">
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[200px]" style={{ border: "2px solid lightblue" }}>
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
                onClick={() => setRegionFilter("all")}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* MCCs DataTable */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900">
              Collection Centers ({filteredMCCs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <DataTable
                columns={[
                  { accessorKey: "name", header: "Name", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
                  {
                    accessorKey: "code",
                    header: "Code",
                    cell: ({ row }) =>
                      row.original.code ? (
                        <Badge variant="outline" className="border-blue-300 text-blue-700">{row.original.code}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      ),
                  },
                  {
                    accessorKey: "location",
                    header: "Location",
                    cell: ({ row }) => (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {row.original.location}
                      </div>
                    ),
                  },
                  {
                    accessorKey: "region",
                    header: "Region",
                    cell: ({ row }) =>
                      row.original.region ? (
                        <Badge variant="outline" className="border-green-300 text-green-700">{row.original.region}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      ),
                  },
                  {
                    id: "manager",
                    accessorFn: (row) => row.manager?.name || "",
                    header: "Manager",
                    cell: ({ row }) =>
                      row.original.manager ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{row.original.manager.name}</span>
                          <span className="text-xs text-gray-500">{row.original.manager.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No manager</span>
                      ),
                  },
                  {
                    id: "farmers",
                    accessorFn: (row) => row._count?.farmers || 0,
                    header: "Farmers",
                    cell: ({ row }) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAssignFarmers(row.original)
                        }}
                        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 -ml-2"
                      >
                        <Users className="h-4 w-4" />
                        <span>{row.original._count?.farmers || 0}</span>
                        <UserPlus className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                      </Button>
                    ),
                  },
                  {
                    id: "collections",
                    accessorFn: (row) => row._count?.milk_collections || 0,
                    header: "Collections",
                    cell: ({ row }) => (
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-gray-400" />
                        {row.original._count?.milk_collections || 0}
                      </div>
                    ),
                  },
                  {
                    id: "actions",
                    header: () => <span className="text-right w-full block">Actions</span>,
                    cell: ({ row }) => (
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAssignFarmers(row.original)}
                          className="h-8 w-8 p-0"
                          title="Assign Farmers"
                        >
                          <UserPlus className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditMCC(row.original)} className="h-8 w-8 p-0" title="Edit Collection Center">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteMCC(row.original.id)} className="h-8 w-8 p-0" title="Delete Collection Center">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={filteredMCCs}
                searchKey="search"
                searchPlaceholder="Search collection centers..."
                emptyMessage="No collection centers found"
                emptyDescription="Try adjusting your search or filters"
                entityName="Collection Centers"
                pageSize={10}
                defaultSorting={[{ id: "name", desc: false }]}
                onRowClick={(row) => handleEditMCC(row)}
              />
            )}
          </CardContent>
        </Card>

        {/* Create/Edit MCC Dialog - Multi-step form */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setFormStep(1)
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-xl [&>button]:absolute [&>button]:right-5 [&>button]:top-5 [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:hover:bg-slate-100 [&>button]:rounded-full [&>button]:z-10 [&>button]:h-9 [&>button]:w-9">
            <DialogHeader className="border-b border-slate-200 px-6 py-5 rounded-t-3xl">
              <DialogTitle className="text-2xl font-bold text-blue-900">
                {editingMCC ? "Edit Collection Center" : "Create New Collection Center"}
              </DialogTitle>
              <DialogDescription>
                {editingMCC
                  ? "Update collection center information and settings"
                  : "Add a new Milk Collection Center to the system"}
              </DialogDescription>
            </DialogHeader>

            {/* Step indicator */}
            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                <span>Step {formStep} of 4</span>
                <span className="text-blue-600">
                  {formStep === 1 && "Basic Information"}
                  {formStep === 2 && "Contact & Address"}
                  {formStep === 3 && "Manager & Location"}
                  {formStep === 4 && "Review & Confirm"}
                </span>
              </div>
              <Progress value={(formStep / 4) * 100} className="h-2" />
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="min-h-[280px] py-4">
                {/* Step 1: Basic Information */}
                {formStep === 1 && (
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                        Collection Center Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="e.g., Nyagatare Collection Center"
                        className="border-2 border-blue-200"
                      />
                      <p className="text-xs text-gray-500">Code will be auto-generated (e.g., CC001)</p>
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
                          placeholder="e.g., Nyagatare District"
                          className="border-2 border-blue-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region" className="text-base font-semibold text-gray-700">
                          Region / Province
                        </Label>
                        <Input
                          id="region"
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          placeholder="e.g., Eastern Province"
                          className="border-2 border-blue-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact & Address */}
                {formStep === 2 && (
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-base font-semibold text-gray-700">
                        Full Address
                      </Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Street, sector, cell, village..."
                        rows={3}
                        className="border-2 border-blue-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact Phone
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g., +250 788 123 456"
                          className="border-2 border-blue-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Contact Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g., mcc@example.com"
                          className="border-2 border-blue-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Manager & Location */}
                {formStep === 3 && (
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="managerUserId" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Collection Center Manager
                      </Label>
                      <Select
                        value={formData.managerUserId}
                        onValueChange={(value) => setFormData({ ...formData, managerUserId: value })}
                      >
                        <SelectTrigger className="border-2 border-blue-200">
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
                    <div className="space-y-2">
                      <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        GPS Coordinates (Optional)
                      </Label>
                      <GeoLocationInput
                        latitude={formData.gpsLatitude}
                        longitude={formData.gpsLongitude}
                        onLocationChange={(lat, lng) =>
                          setFormData({ ...formData, gpsLatitude: lat, gpsLongitude: lng })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Collection Center is active
                      </Label>
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {formStep === 4 && (
                  <div className="space-y-4 rounded-lg border-2 border-blue-100 bg-blue-50/30 p-4">
                    <h4 className="font-semibold text-gray-900">Review your Collection Center details</h4>
                    <dl className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <dt className="font-medium text-gray-500">Name</dt>
                        <dd className="font-semibold text-gray-900">{formData.name || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Code</dt>
                        <dd className="font-semibold text-gray-900">
                          {editingMCC?.code || "Auto-generated on save (e.g., CC001)"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Location</dt>
                        <dd className="font-semibold text-gray-900">{formData.location || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Region</dt>
                        <dd className="font-semibold text-gray-900">{formData.region || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Address</dt>
                        <dd className="font-semibold text-gray-900">{formData.address || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Contact</dt>
                        <dd className="font-semibold text-gray-900">
                          {[formData.phone, formData.email].filter(Boolean).join(" • ") || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Manager</dt>
                        <dd className="font-semibold text-gray-900">
                          {formData.managerUserId && formData.managerUserId !== "none"
                            ? users.find((u) => u.id === formData.managerUserId)?.name || "—"
                            : "No manager"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">GPS Coordinates</dt>
                        <dd className="font-semibold text-gray-900">
                          {formData.gpsLatitude != null && formData.gpsLongitude != null
                            ? `${formData.gpsLatitude.toFixed(6)}, ${formData.gpsLongitude.toFixed(6)}`
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Status</dt>
                        <dd className="font-semibold text-gray-900">{formData.isActive ? "Active" : "Inactive"}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                <div className="flex gap-2">
                  {formStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormStep((s) => s - 1)}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  {formStep < 4 ? (
                    <Button
                      type="button"
                      onClick={() => {
                        if (formStep === 1 && (!formData.name.trim() || !formData.location.trim())) {
                          toast.error("Collection Center Name and Location are required")
                          return
                        }
                        setFormStep((s) => s + 1)
                      }}
                      className="gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      onClick={(e) => handleSubmit(e)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : editingMCC ? (
                        "Update Collection Center"
                      ) : (
                        "Create Collection Center"
                      )}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Farmer Assignment Dialog */}
        <FarmerAssignmentDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          targetMcc={assignTargetMcc}
          allMccs={mccs}
          onAssignmentComplete={fetchMCCs}
        />
      </div>
    </div>
  )
}
