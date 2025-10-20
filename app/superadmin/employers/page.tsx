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
  UserCheck,
  Briefcase,
  IdCard
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Employer {
  id: string
  name: string
  email: string
  phone: string | null
  national_id: string | null
  gender: string | null
  district: string | null
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  role: string
  roleDescription: string
  assignedAt: string
}

const EMPLOYER_STATUSES = {
  active: { label: "Active", color: "bg-green-500" },
  inactive: { label: "Inactive", color: "bg-gray-500" },
} as const

export default function EmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    description: "",
  })
  const { toast } = useToast()

  const fetchEmployers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/v1/superadmin/employers/users")
      const data = await response.json()
      if (data.success) {
        setEmployers(data.employers)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error fetching employers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch employers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployers()
  }, [])

  const handleCreateEmployer = async () => {
    try {
      const response = await fetch("/api/v1/superadmin/employers", {
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
          description: "Employer created successfully",
        })
        setIsCreateDialogOpen(false)
        setFormData({ name: "", email: "", phone: "", location: "", description: "" })
        fetchEmployers()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create employer",
        variant: "destructive",
      })
    }
  }

  const handleUpdateEmployer = async () => {
    if (!selectedEmployer) return

    try {
      const response = await fetch(`/api/v1/superadmin/employers/${selectedEmployer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Employer updated successfully",
        })
        setIsEditDialogOpen(false)
        setSelectedEmployer(null)
        setFormData({ name: "", email: "", phone: "", location: "", description: "" })
        fetchEmployers()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employer",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (id: string, status: "active" | "inactive") => {
    try {
      const response = await fetch(`/api/v1/superadmin/employers/${id}/status`, {
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
          description: `Employer ${status === "active" ? "activated" : "deactivated"} successfully`,
        })
        fetchEmployers()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employer status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEmployer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employer?")) return

    try {
      const response = await fetch(`/api/v1/superadmin/employers/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Employer deleted successfully",
        })
        fetchEmployers()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employer",
        variant: "destructive",
      })
    }
  }

  const filteredEmployers = employers.filter((employer) => {
    const searchString = searchTerm.toLowerCase()
    const matchesSearch = 
      employer.name.toLowerCase().includes(searchString) ||
      employer.email.toLowerCase().includes(searchString) ||
      (employer.phone?.toLowerCase().includes(searchString) ?? false) ||
      (employer.district?.toLowerCase().includes(searchString) ?? false)
    
    const matchesStatus = statusFilter === "all" || employer.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Employers</h3>
              <p className="text-sm text-gray-500">Fetching employer data...</p>
            </div>
          </div>
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
            Employers
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Manage employers and their information
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 px-6 py-3 rounded-lg font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Add Employer</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Total Employers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{employers.length}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Active Employers</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {employers.filter(emp => emp.status === "active").length}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full shrink-0">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Inactive Employers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {employers.filter(emp => emp.status === "inactive").length}
                </p>
              </div>
              <div className="p-3 bg-gray-500 rounded-full shrink-0">
                <XCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">This Page</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{filteredEmployers.length}</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full shrink-0">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6 shadow-lg border-slate-200 bg-white hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, phone, or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">View:</span>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`px-3 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      viewMode === "cards"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-3 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      viewMode === "table"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <List className="h-4 w-4" />
                    Table
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredEmployers.length === 0 ? (
        <Card className="border-0 bg-white rounded-xl shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Briefcase className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Employers Found</h3>
                <p className="text-gray-500">
                  {searchTerm && "No employers match your search criteria"}
                  {statusFilter !== "all" && "No employers with the selected status"}
                  {!searchTerm && statusFilter === "all" && "No employers have been added yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployers.map((employer) => (
            <Card key={employer.id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white hover:-translate-y-2 overflow-hidden hover:border-blue-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">{employer.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">{employer.email}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/80 hover:shadow-md rounded-full p-2 h-8 w-8"
                      >
                        <MoreHorizontal className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-xl rounded-lg">
                      <DropdownMenuItem 
                        onClick={() => setSelectedEmployer(employer)}
                        className="cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4 mr-3" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setFormData({
                            name: employer.name,
                            email: employer.email,
                            phone: employer.phone || "",
                            location: employer.district || "",
                            description: "",
                          })
                          setSelectedEmployer(employer)
                          setIsEditDialogOpen(true)
                        }}
                        className="cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4 mr-3" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateStatus(
                            employer.id,
                            employer.status === "active" ? "inactive" : "active"
                          )
                        }
                        className="cursor-pointer hover:bg-yellow-50 hover:text-yellow-600"
                      >
                        {employer.status === "active" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                        onClick={() => handleDeleteEmployer(employer.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-green-100 rounded">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{employer.phone || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-purple-100 rounded">
                      <MapPin className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">District</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{employer.district || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-orange-100 rounded">
                      <IdCard className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">National ID</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{employer.national_id || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${EMPLOYER_STATUSES[employer.status].color} text-white text-xs px-2 py-1`}
                      >
                        {EMPLOYER_STATUSES[employer.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(employer.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 bg-white rounded-xl shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              Employers Table View
            </CardTitle>
            <CardDescription className="text-gray-600">
              Showing {filteredEmployers.length} of {employers.length} employers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Name</TableHead>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Phone</TableHead>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">District</TableHead>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">National ID</TableHead>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Status</TableHead>
                    <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Created</TableHead>
                    <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50 w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployers.map((employer, index) => (
                    <TableRow 
                      key={employer.id} 
                      className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-blue-100 rounded">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{employer.name}</div>
                            <div className="text-sm text-gray-500">{employer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{employer.phone || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{employer.district || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <IdCard className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{employer.national_id || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge
                          className={`${EMPLOYER_STATUSES[employer.status].color} text-white px-3 py-1 font-medium text-xs rounded-full`}
                        >
                          {EMPLOYER_STATUSES[employer.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500 font-medium">{new Date(employer.createdAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-xl rounded-lg">
                              <DropdownMenuItem 
                                onClick={() => setSelectedEmployer(employer)}
                                className="cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye className="h-4 w-4 mr-3" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setFormData({
                                    name: employer.name,
                                    email: employer.email,
                                    phone: employer.phone || "",
                                    location: employer.district || "",
                                    description: "",
                                  })
                                  setSelectedEmployer(employer)
                                  setIsEditDialogOpen(true)
                                }}
                                className="cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit2 className="h-4 w-4 mr-3" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(
                                    employer.id,
                                    employer.status === "active" ? "inactive" : "active"
                                  )
                                }
                                className="cursor-pointer hover:bg-yellow-50 hover:text-yellow-600"
                              >
                                {employer.status === "active" ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                                onClick={() => handleDeleteEmployer(employer.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Employer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-0 shadow-2xl backdrop-blur-none opacity-100 rounded-xl">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl p-6 -m-6 mb-6">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              Add New Employer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter employer name"
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="bg-gray-50 border-t border-gray-100 rounded-b-xl p-6 -m-6 mt-6 flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              className="px-6 py-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateEmployer}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 px-6 py-2 font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Employer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-0 shadow-2xl backdrop-blur-none opacity-100 rounded-xl">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl p-6 -m-6 mb-6">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Edit2 className="h-5 w-5 text-white" />
              </div>
              Edit Employer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter employer name"
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="bg-gray-50 border-t border-gray-100 rounded-b-xl p-6 -m-6 mt-6 flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="px-6 py-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateEmployer}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 px-6 py-2 font-semibold"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Update Employer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employer Details Dialog */}
      {selectedEmployer && !isEditDialogOpen && (
        <Dialog open={!!selectedEmployer} onOpenChange={() => setSelectedEmployer(null)}>
          <DialogContent className="sm:max-w-[600px] bg-white border-0 shadow-2xl backdrop-blur-none opacity-100 rounded-xl">
            <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl p-6 -m-6 mb-6">
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                Employer Details - {selectedEmployer.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserCheck className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Personal Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedEmployer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedEmployer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedEmployer.phone || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Location Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">District</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedEmployer.district || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">National ID</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedEmployer.national_id || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Gender</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedEmployer.gender || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 sm:col-span-2">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Activity className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Status & Activity</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <Badge
                          className={`${EMPLOYER_STATUSES[selectedEmployer.status].color} text-white px-3 py-1 font-medium text-xs rounded-full mt-1`}
                        >
                          {EMPLOYER_STATUSES[selectedEmployer.status].label}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Role</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedEmployer.role}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created</p>
                        <p className="text-sm font-semibold text-gray-900">{new Date(selectedEmployer.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <DialogFooter className="bg-gray-50 border-t border-gray-100 rounded-b-xl p-6 -m-6 mt-6 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSelectedEmployer(null)}
                className="px-6 py-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
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