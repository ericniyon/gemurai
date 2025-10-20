"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { 
  MoreHorizontal, 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Activity,
  Filter,
  Grid3X3,
  List,
  CheckCircle,
  XCircle,
  Building2,
  UserCheck
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DCC {
  id: string
  name: string
  email: string
  phone: string
  location: string
  province?: string
  district?: string
  sector?: string
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
  updatedAt: string
}

const DCC_STATUSES = {
  ACTIVE: { label: "Active", color: "bg-green-500" },
  INACTIVE: { label: "Inactive", color: "bg-gray-500" },
} as const

export default function DCCsPage() {
  const [dccs, setDCCs] = useState<DCC[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "ACTIVE" | "INACTIVE">("all")
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDCCs, setTotalDCCs] = useState(0)
  const [selectedDCC, setSelectedDCC] = useState<DCC | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  })
  const { toast } = useToast()

  const fetchDCCs = async (page: number = 1) => {
    try {
      console.log(`🔍 Fetching DCCs - Page ${page}...`)
      
      // Try enhanced DCC users API first
      try {
        const response = await fetch(`/api/v1/users/dcc?page=${page}&limit=20`, {
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          }
        })
      const data = await response.json()
        
        console.log("📡 /api/v1/users/dcc response:", { status: response.status, success: data.success, count: data.data?.length })
        
        if (data?.success && Array.isArray(data?.data)) {
          const mapped: DCC[] = data.data.map((dcc: any) => ({
            id: dcc.id,
            name: dcc.name || "",
            email: dcc.email || "",
            phone: dcc.phone || "",
            location: dcc.dccProfile?.location || "",
            province: dcc.province,
            district: dcc.district,
            sector: dcc.sector,
            status: dcc.isActive ? "ACTIVE" : "INACTIVE",
            createdAt: (dcc.createdAt && typeof dcc.createdAt === 'string') ? dcc.createdAt : new Date(dcc.createdAt).toISOString(),
            updatedAt: (dcc.updatedAt && typeof dcc.updatedAt === 'string') ? dcc.updatedAt : new Date(dcc.updatedAt).toISOString(),
          }))
          console.log("✅ Using enhanced DCC API, found:", mapped.length)
          console.log("📊 API Response data:", { 
            hasPagination: !!data.pagination, 
            total: data.total, 
            pagination: data.pagination 
          })
          setDCCs(mapped)
          
          // Update pagination info
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages || 1)
            setTotalDCCs(data.pagination.total || mapped.length)
            console.log("📊 Using API pagination:", { 
              totalPages: data.pagination.totalPages, 
              total: data.pagination.total 
            })
          } else {
            // Calculate pagination from response if not provided
            const total = data.total || 84 // Fallback to known total
            const totalPages = Math.ceil(total / 20)
            setTotalPages(totalPages)
            setTotalDCCs(total)
            console.log("📊 Calculated pagination:", { totalPages, total })
          }
          return
        }
      } catch (apiError) {
        console.log("❌ Enhanced DCC API failed:", apiError)
      }

      // Fallback: try superadmin DCCs endpoint
      try {
            const fallbackResponse = await fetch("/api/v1/superadmin/dccs?limit=100", {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              }
            })
        const fallbackData = await fallbackResponse.json()
        
        console.log("📡 /api/v1/superadmin/dccs response:", { status: fallbackResponse.status, success: fallbackData.success, count: fallbackData.dccs?.length })
        
        if (fallbackData?.success && Array.isArray(fallbackData?.dccs) && fallbackData.dccs.length > 0) {
          console.log("✅ Using superadmin DCC API, found:", fallbackData.dccs.length)
          setDCCs(fallbackData.dccs)
        return
        }
      } catch (fallbackError) {
        console.log("❌ Superadmin DCC API failed:", fallbackError)
      }

      // Final fallback: try users API with DCC filter
      try {
            const usersResponse = await fetch("/api/v1/superadmin/users?role=DCC&limit=100", {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              }
            })
        const usersData = await usersResponse.json()
        
        console.log("📡 /api/v1/superadmin/users?role=DCC response:", { status: usersResponse.status, success: usersData.success, count: usersData.users?.length })
        
      if (usersData?.success && Array.isArray(usersData?.users)) {
        const mapped: DCC[] = usersData.users.map((u: any) => ({
          id: u.id,
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          location: "",
            province: undefined,
            district: undefined,
            sector: undefined,
          status: u.isActive ? "ACTIVE" : "INACTIVE",
          createdAt: (u.createdAt && typeof u.createdAt === 'string') ? u.createdAt : new Date(u.createdAt).toISOString(),
          updatedAt: (u.updatedAt && typeof u.updatedAt === 'string') ? u.updatedAt : new Date(u.updatedAt).toISOString(),
        }))
          console.log("✅ Using users API fallback, found:", mapped.length)
        setDCCs(mapped)
        return
        }
      } catch (usersError) {
        console.log("❌ Users API fallback failed:", usersError)
      }

      console.log("❌ All API endpoints failed")
      throw new Error("No DCCs found - all API endpoints failed")
      
    } catch (error) {
      console.error("❌ Error fetching DCCs:", error)
      toast({
        title: "Error",
        description: `Failed to fetch DCCs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("🔄 Page changed to:", currentPage)
    fetchDCCs(currentPage)
  }, [currentPage])

  const handleCreateDCC = async () => {
    try {
      const response = await fetch("/api/v1/superadmin/dccs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "DCC created successfully",
        })
        fetchDCCs()
        setIsCreateDialogOpen(false)
        setFormData({ name: "", email: "", phone: "", location: "" })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create DCC",
        variant: "destructive",
      })
    }
  }

  const handleUpdateDCC = async () => {
    if (!selectedDCC) return

    try {
      const response = await fetch(`/api/v1/superadmin/dccs/${selectedDCC.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "DCC updated successfully",
        })
        fetchDCCs()
        setIsEditDialogOpen(false)
        setSelectedDCC(null)
        setFormData({ name: "", email: "", phone: "", location: "" })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update DCC",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (dccId: string, status: "ACTIVE" | "INACTIVE") => {
    try {
      const response = await fetch(`/api/v1/superadmin/dccs/${dccId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "DCC status updated successfully",
        })
        fetchDCCs()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDCC = async (dccId: string) => {
    if (!confirm("Are you sure you want to delete this DCC?")) return

    try {
      const response = await fetch(`/api/v1/superadmin/dccs/${dccId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "DCC deleted successfully",
        })
        fetchDCCs()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete DCC",
        variant: "destructive",
      })
    }
  }

  const filteredDCCs = dccs.filter((dcc) => {
    if (statusFilter !== "all" && dcc.status !== statusFilter) {
      return false
    }

    const searchString = searchTerm.toLowerCase()
    return (
      dcc.name.toLowerCase().includes(searchString) ||
      dcc.email.toLowerCase().includes(searchString) ||
      dcc.phone?.toLowerCase().includes(searchString) ||
      dcc.province?.toLowerCase().includes(searchString) ||
      dcc.district?.toLowerCase().includes(searchString) ||
      dcc.sector?.toLowerCase().includes(searchString) ||
      dcc.location.toLowerCase().includes(searchString)
    )
  })

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading DCCs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 break-words">
            Koralink Agents
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Manage Digital Community Champions and their information
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 px-6 py-3 rounded-lg font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Add DCC</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
              placeholder="Search by name, email, phone, province, district, or sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "ACTIVE" | "INACTIVE")}
          className="border rounded-md px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">View:</span>
          <div className="flex border rounded-md">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-2 text-sm font-medium rounded-l-md transition-colors ${
                viewMode === "cards"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 text-sm font-medium rounded-r-md transition-colors ${
                viewMode === "table"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {filteredDCCs.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground">
            No DCCs found
            {searchTerm && " matching your search"}
            {statusFilter !== "all" && " with the selected status"}
          </div>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDCCs.map((dcc) => (
            <div key={dcc.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{dcc.name}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedDCC(dcc)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setFormData({
                            name: dcc.name,
                            email: dcc.email,
                            phone: dcc.phone,
                            location: dcc.location,
                          })
                          setSelectedDCC(dcc)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateStatus(
                            dcc.id,
                            dcc.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                          )
                        }
                      >
                        {dcc.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteDCC(dcc.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Phone:</span>
                    <span className="text-sm font-medium">{dcc.phone || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Province:</span>
                    <span className="text-sm font-medium">{dcc.province || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">District:</span>
                    <span className="text-sm font-medium">{dcc.district || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Sector:</span>
                    <span className="text-sm font-medium">{dcc.sector || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Status:</span>
                    <Badge
                      className={`${DCC_STATUSES[dcc.status].color} text-white text-xs`}
                    >
                      {DCC_STATUSES[dcc.status].label}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Created:</span>
                    <span className="text-sm font-medium">{new Date(dcc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
                <TableHead>Province</TableHead>
              <TableHead>District</TableHead>
                <TableHead>Sector</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {filteredDCCs.map((dcc) => (
                <TableRow key={dcc.id} className="bg-white hover:bg-gray-50">
                  <TableCell className="font-medium">{dcc.name}</TableCell>
                  <TableCell>{dcc.phone || "N/A"}</TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {dcc.province || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {dcc.district || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {dcc.sector || "N/A"}
                    </span>
                </TableCell>
                  <TableCell>
                    <Badge
                      className={`${DCC_STATUSES[dcc.status].color} text-white`}
                    >
                      {dcc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedDCC(dcc)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedDCC(dcc)
                          setFormData({
                            name: dcc.name,
                            email: dcc.email,
                            phone: dcc.phone,
                            location: dcc.location
                          })
                          setIsEditDialogOpen(true)
                        }}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(dcc.id, dcc.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}>
                          {dcc.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteDCC(dcc.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Details Modal */}
      {selectedDCC && (
        <Dialog open={!!selectedDCC} onOpenChange={() => setSelectedDCC(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>DCC Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-gray-900">{selectedDCC.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-gray-900">{selectedDCC.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <p className="text-gray-900">{selectedDCC.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <p className="text-gray-900">{selectedDCC.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Province</label>
                <p className="text-gray-900">{selectedDCC.province || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">District</label>
                <p className="text-gray-900">{selectedDCC.district || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Sector</label>
                <p className="text-gray-900">{selectedDCC.sector || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Badge className={`${DCC_STATUSES[selectedDCC.status].color} text-white`}>
                  {selectedDCC.status}
                </Badge>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedDCC(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New DCC</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDCC}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit DCC</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDCC}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
