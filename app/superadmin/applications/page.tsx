"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  Search, 
  Download, 
  MoreHorizontal, 
  Eye, 
  Loader2, 
  User, 
  Mail,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Brain,
  ClipboardList,
  CalendarDays,
  TrendingUp,
  BarChart3
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const APPLICATION_STATUSES = {
  SUBMITTED: {
    label: "Submitted",
    color: "bg-blue-500",
    icon: Clock
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "bg-yellow-500",
    icon: AlertCircle
  },
  INTERVIEW_INVITED: {
    label: "Interview Invited",
    color: "bg-purple-500",
    icon: Users
  },
  APPROVED: {
    label: "Approved",
    color: "bg-green-500",
    icon: CheckCircle
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-500",
    icon: XCircle
  },
  PENDING_DOCUMENTS: {
    label: "Pending Documents",
    color: "bg-orange-500",
    icon: FileText
  },
  TEMPORARY: {
    label: "Temporary",
    color: "bg-purple-500",
    icon: AlertCircle
  }
}

interface Application {
  id: string
  userId: string
  phone?: string
  email?: string
  formData?: any
  user?: {
    email: string
    name?: string
  } | null
  status: string
  createdAt: string
  updatedAt: string
  applicationScore?: number | null
  vulnerabilityCategory?: string | null
  evaluations?: Array<{
    id: string
    type: string
    score: number
    questionScores: any
    metadata?: any
    createdAt: string
  }>
}

interface SortConfig {
  key: keyof Application | string
  direction: 'asc' | 'desc'
}

interface DataTableProps {
  data: Application[]
  onUpdateStatus: (id: string, status: string) => void
  onDeleteApplication: (id: string) => void
  isUpdating: boolean
}

// DataTable Component
function DataTable({ 
  data, 
  onUpdateStatus, 
  onDeleteApplication, 
  isUpdating,
  sortConfig,
  onSort,
  selectedRows,
  onRowSelect,
  onSelectAll
}: DataTableProps & {
  sortConfig: SortConfig
  onSort: (key: keyof Application | string) => void
  selectedRows: Set<string>
  onRowSelect: (id: string) => void
  onSelectAll: (checked: boolean) => void
}) {
  const router = useRouter()
  
  const renderSortIcon = (column: string) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />
  }

  const extractApplicantData = (application: Application) => {
    const firstName = application.formData?.q1 || ""
    const lastName = application.formData?.q2 || ""
    const applicantName = (firstName || lastName) 
                        ? `${firstName} ${lastName}`.trim()
                        : application.user?.name || "N/A"
    
    const applicantEmail = application.email || 
                         application.formData?.email || 
                         application.user?.email || 
                         "N/A"
    
    const applicantPhone = application.phone || 
                         application.formData?.['Phone Number'] || 
                         application.formData?.phone || 
                         "N/A"
    
    const gender = application.formData?.q4 || "N/A"
    const maritalStatus = application.formData?.q6 || "N/A"
    
    // Extract district from various possible locations in formData
    const district = application.formData?.district || 
                    application.formData?.q11?.district || 
                    (typeof application.formData?.q11 === 'object' && application.formData?.q11?.district) ||
                    "N/A"

    return { applicantName, applicantEmail, applicantPhone, gender, maritalStatus, district }
  }

  return (
    <div className="w-full">
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedRows.size === data.length && data.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => onSort('applicantName')}
              >
                <div className="flex items-center">
                  Applicant Name
                  {renderSortIcon('applicantName')}
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => onSort('phone')}
              >
                <div className="flex items-center">
                  Phone
                  {renderSortIcon('phone')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => onSort('district')}
              >
                <div className="flex items-center">
                  District
                  {renderSortIcon('district')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => onSort('gender')}
              >
                <div className="flex items-center">
                  Gender
                  {renderSortIcon('gender')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => onSort('maritalStatus')}
              >
                <div className="flex items-center">
                  Marital Status
                  {renderSortIcon('maritalStatus')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {renderSortIcon('status')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => onSort('createdAt')}
              >
                <div className="flex items-center">
                  Created At
                  {renderSortIcon('createdAt')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => onSort('applicationScore')}
              >
                <div className="flex items-center">
                  Application Score
                  {renderSortIcon('applicationScore')}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <p className="text-gray-500">No applications found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((application) => {
                const { applicantName, applicantEmail, applicantPhone, gender, maritalStatus, district } = extractApplicantData(application)
                const statusInfo = APPLICATION_STATUSES[application.status as keyof typeof APPLICATION_STATUSES]
                const StatusIcon = statusInfo?.icon || AlertCircle
                
                return (
                  <TableRow key={application.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(application.id)}
                        onCheckedChange={() => onRowSelect(application.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {applicantName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                    <p className="text-sm text-gray-900 whitespace-nowrap truncate max-w-[120px]">
                        {applicantPhone}
                      </p>
                    </TableCell>
                    <TableCell>
                    <p className="text-sm text-gray-900 whitespace-nowrap truncate max-w-[140px]">
                        {district}
                      </p>
                    </TableCell>
                    <TableCell>
                    <p className="text-sm text-gray-900 whitespace-nowrap">
                        {gender}
                      </p>
                    </TableCell>
                    <TableCell>
                    <p className="text-sm text-gray-900 whitespace-nowrap truncate max-w-[140px]">
                        {maritalStatus}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusInfo?.color} text-white flex items-center gap-1 w-fit`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo?.label || application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                    <p className="text-sm text-gray-900 whitespace-nowrap">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        console.log(`🔍 App ${application.id} score:`, {
                          applicationScore: application.applicationScore,
                          type: typeof application.applicationScore,
                          isNull: application.applicationScore === null,
                          isUndefined: application.applicationScore === undefined
                        })
                        return application.applicationScore !== null && application.applicationScore !== undefined ? (
                          <div className="flex items-center gap-2">
                            <Brain className="h-3 w-3 text-blue-500" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                {application.applicationScore}/100
                              </span>
                              <span className="text-xs text-gray-500">
                                {application.vulnerabilityCategory || 'Application Score'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-400">Pending evaluation</span>
                          </div>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border shadow-md">
                          <DropdownMenuItem onClick={() => router.push(`/superadmin/applications/${application.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {application.evaluations && application.evaluations.length > 0 && (
                            <DropdownMenuItem onClick={() => router.push(`/superadmin/applications/${application.id}?tab=evaluation`)}>
                              <Brain className="mr-2 h-4 w-4" />
                              View Evaluation
                            </DropdownMenuItem>
                          )}
                          {Object.entries(APPLICATION_STATUSES).map(([status, { label }]) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => onUpdateStatus(application.id, status)}
                              disabled={application.status === status || isUpdating}
                            >
                              Update to {label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDeleteApplication(application.id)}
                            disabled={isUpdating}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Pagination Component
function DataTablePagination({
  currentPage,
  totalPages,
  rowsPerPage,
  totalRows,
  onPageChange,
  onRowsPerPageChange
}: {
  currentPage: number
  totalPages: number
  rowsPerPage: number
  totalRows: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
}) {
  const startRow = (currentPage - 1) * rowsPerPage + 1
  const endRow = Math.min(currentPage * rowsPerPage, totalRows)

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {startRow} to {endRow} of {totalRows} applications
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => onRowsPerPageChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [districtFilter, setDistrictFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "createdAt", direction: "desc" })
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [isUpdating, setIsUpdating] = useState(false)
  const [isInvitingToInterview, setIsInvitingToInterview] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [timeFilter, setTimeFilter] = useState<string>("all")

  const { toast } = useToast()
  const router = useRouter()

  // Get specific districts for filtering
  const getFilterDistricts = () => {
    return [
      { id: "musanze", name: "Musanze", province: "Northern Province" },
      { id: "nyagatare", name: "Nyagatare", province: "Eastern Province" }
    ]
  }

  const districts = getFilterDistricts()
  
  // Time filter helper functions
  const getTimeRange = (filter: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (filter) {
      case 'today':
        return {
          start: new Date(today),
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      case 'thisWeek':
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)
        return { start: startOfWeek, end: endOfWeek }
      case 'lastWeek':
        const lastWeekStart = new Date(today)
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7)
        const lastWeekEnd = new Date(lastWeekStart)
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6)
        lastWeekEnd.setHours(23, 59, 59, 999)
        return { start: lastWeekStart, end: lastWeekEnd }
      case 'thisMonth':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        endOfMonth.setHours(23, 59, 59, 999)
        return { start: startOfMonth, end: endOfMonth }
      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        lastMonthEnd.setHours(23, 59, 59, 999)
        return { start: lastMonthStart, end: lastMonthEnd }
      case 'last7Days':
        const last7Days = new Date(today)
        last7Days.setDate(today.getDate() - 7)
        return { start: last7Days, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) }
      case 'last30Days':
        const last30Days = new Date(today)
        last30Days.setDate(today.getDate() - 30)
        return { start: last30Days, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) }
      default:
        return null
    }
  }

  const handleTimeFilterChange = (filter: string) => {
    setTimeFilter(filter)
    if (filter === 'all') {
      setStartDate('')
      setEndDate('')
    } else {
      const range = getTimeRange(filter)
      if (range) {
        setStartDate(range.start.toISOString().split('T')[0])
        setEndDate(range.end.toISOString().split('T')[0])
      }
    }
  }
  
  // Debug: Log all unique district values in applications
  useEffect(() => {
    if (applications.length > 0) {
      const uniqueDistricts = new Set()
      applications.forEach(app => {
        const appDistrict = app.formData?.district || 
                           app.formData?.q11?.district || 
                           (typeof app.formData?.q11 === 'object' && app.formData?.q11?.district)
        if (appDistrict) {
          uniqueDistricts.add(appDistrict)
        }
      })
      console.log("All unique district values in applications:", Array.from(uniqueDistricts))
    }
  }, [applications])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/v1/superadmin/applications", {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        console.log("📊 API Response:", {
          total: data.total,
          timestamp: data.timestamp,
          firstApp: data.applications?.[0] ? {
            id: data.applications[0].id,
            applicationScore: data.applications[0].applicationScore,
            vulnerabilityCategory: data.applications[0].vulnerabilityCategory
          } : null
        })
        setApplications(data.applications || [])
        toast({
          title: "Success",
          description: `Loaded ${data.applications?.length || 0} applications`,
        })
      } else {
        throw new Error(data.message || "Failed to fetch applications")
      }
    } catch (err) {
      console.error("Error fetching applications:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch applications")
      toast({
        title: "Error",
        description: "Failed to load applications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/v1/superadmin/applications?id=${applicationId}&action=status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      await fetchApplications()
      toast({
        title: "Success",
        description: "Application status updated successfully",
      })
    } catch (err) {
      console.error("Error updating status:", err)
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/v1/superadmin/applications?id=${applicationId}&action=delete`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete application")
      }

      await fetchApplications()
      toast({
        title: "Success",
        description: "Application deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting application:", err)
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSort = (key: keyof Application | string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleExportApplications = () => {
    const csvContent = [
      ["Applicant Name", "Email", "Phone", "Gender", "Marital Status", "Status", "Created At", "Last Updated"],
      ...applications.map(app => {
        const firstName = app.formData?.q1 || ""
        const lastName = app.formData?.q2 || ""
        const applicantName = (firstName || lastName) 
                             ? `${firstName} ${lastName}`.trim()
                             : app.user?.name || "N/A"
        
        const applicantEmail = app.email || 
                              app.formData?.email || 
                              app.user?.email || 
                              "N/A"
        
        const applicantPhone = app.phone || 
                              app.formData?.['Phone Number'] || 
                              app.formData?.phone || 
                              "N/A"
        
        const gender = app.formData?.q4 || "N/A"
        
        const maritalStatus = app.formData?.q6 || "N/A"
        
        return [
          applicantName,
          applicantEmail,
          applicantPhone,
          gender,
          maritalStatus,
          APPLICATION_STATUSES[app.status as keyof typeof APPLICATION_STATUSES]?.label || app.status,
          new Date(app.createdAt).toLocaleDateString(),
          new Date(app.updatedAt).toLocaleDateString()
        ]
      })
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "applications.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredApplications = useMemo(() => {
    let filtered = applications

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.user?.name && app.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    // Apply district filter
    if (districtFilter !== "all") {
      filtered = filtered.filter(app => {
        const appDistrict = app.formData?.district || 
                           app.formData?.q11?.district || 
                           (typeof app.formData?.q11 === 'object' && app.formData?.q11?.district)
        
        // Debug: Log district values to see what's actually stored
        if (appDistrict) {
          console.log(`Application ${app.id} district: "${appDistrict}" (type: ${typeof appDistrict}) vs filter: "${districtFilter}"`)
        }
        
        // More flexible matching - check for exact match, case-insensitive match, or partial match
        const appDistrictLower = typeof appDistrict === 'string' ? appDistrict.toLowerCase() : ''
        const filterLower = typeof districtFilter === 'string' ? districtFilter.toLowerCase() : ''
        
        return appDistrictLower === filterLower || 
               appDistrictLower.includes(filterLower) || 
               filterLower.includes(appDistrictLower)
      })
    }

    // Apply date range filter (createdAt)
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null
      if (end) {
        end.setHours(23, 59, 59, 999)
      }

      filtered = filtered.filter(app => {
        const created = new Date(app.createdAt)
        if (start && created < start) return false
        if (end && created > end) return false
        return true
      })
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue
        
        if (sortConfig.key === 'applicantName') {
          const aFirstName = a.formData?.q1 || ""
          const aLastName = a.formData?.q2 || ""
          aValue = (aFirstName || aLastName) ? `${aFirstName} ${aLastName}`.trim() : a.user?.name || ""
          
          const bFirstName = b.formData?.q1 || ""
          const bLastName = b.formData?.q2 || ""
          bValue = (bFirstName || bLastName) ? `${bFirstName} ${bLastName}`.trim() : b.user?.name || ""
        } else if (sortConfig.key === 'gender') {
          aValue = a.formData?.q4 || ""
          bValue = b.formData?.q4 || ""
        } else if (sortConfig.key === 'maritalStatus') {
          aValue = a.formData?.q6 || ""
          bValue = b.formData?.q6 || ""
        } else if (sortConfig.key === 'district') {
          aValue = a.formData?.district || a.formData?.q11?.district || (typeof a.formData?.q11 === 'object' && a.formData?.q11?.district) || ""
          bValue = b.formData?.district || b.formData?.q11?.district || (typeof b.formData?.q11 === 'object' && b.formData?.q11?.district) || ""
        } else if (sortConfig.key === 'applicationScore') {
          aValue = a.applicationScore || 0
          bValue = b.applicationScore || 0
        } else {
          aValue = a[sortConfig.key as keyof Application]
          bValue = b[sortConfig.key as keyof Application]
        }

        if (aValue == null && bValue == null) return 0
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue)
        }

        return sortConfig.direction === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number)
      })
    } else {
      // Default sorting: Show applications with scores first, then by creation date
      filtered.sort((a, b) => {
        // First, prioritize applications with scores
        const aHasScore = a.applicationScore !== null && a.applicationScore !== undefined
        const bHasScore = b.applicationScore !== null && b.applicationScore !== undefined
        
        if (aHasScore && !bHasScore) return -1
        if (!aHasScore && bHasScore) return 1
        
        // If both have scores or both don't have scores, sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    }

    return filtered
  }, [applications, searchTerm, statusFilter, districtFilter, sortConfig, startDate, endDate])

  const paginatedApplications = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredApplications.slice(start, end)
  }, [filteredApplications, page, rowsPerPage])

  const totalApplications = filteredApplications.length
  const totalPages = Math.ceil(totalApplications / rowsPerPage)

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedApplications.map(app => app.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleInviteToInterview = async () => {
    if (selectedRows.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one application to invite to interview",
        variant: "destructive",
      })
      return
    }

    setIsInvitingToInterview(true)
    try {
      const selectedApplicationIds = Array.from(selectedRows)
      
      // Invite each selected application to interview
      const results = await Promise.allSettled(
        selectedApplicationIds.map(async (applicationId) => {
          const response = await fetch("/api/v1/superadmin/applications/start-interview", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              applicationId
            })
          })

          if (!response.ok) {
            throw new Error(`Failed to invite application ${applicationId}`)
          }

          const data = await response.json()
          return { applicationId, success: data.success, message: data.message }
        })
      )

      // Count successes and failures
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length
      const failed = results.length - successful

      // Status is now updated automatically by the invite-interview endpoint

      // Refresh applications list
      await fetchApplications()

      // Clear selection
      setSelectedRows(new Set())

      // Show results
      if (successful > 0 && failed === 0) {
        toast({
          title: "Success",
          description: `Successfully invited ${successful} application(s) to interview`,
        })
      } else if (successful > 0 && failed > 0) {
        toast({
          title: "Partial Success",
          description: `Invited ${successful} application(s) to interview. ${failed} failed.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to invite ${failed} application(s) to interview`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error inviting to interview:", error)
      toast({
        title: "Error",
        description: "Failed to invite applications to interview",
        variant: "destructive",
      })
    } finally {
      setIsInvitingToInterview(false)
    }
  }

  const handleEvaluateApplications = async () => {
    if (selectedRows.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one application to evaluate",
        variant: "destructive",
      })
      return
    }

    setIsEvaluating(true)
    try {
      const selectedApplicationIds = Array.from(selectedRows)
      
      const response = await fetch("/api/v1/superadmin/applications/bulk-evaluate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationIds: selectedApplicationIds
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to evaluate applications: ${response.status}`)
      }

      const data = await response.json()
      
      // Refresh applications list
      await fetchApplications()

      // Clear selection
      setSelectedRows(new Set())

      // Show results
      const successful = data.results.filter((r: any) => r.success).length
      const failed = data.results.filter((r: any) => !r.success).length

      if (successful > 0 && failed === 0) {
        toast({
          title: "Success",
          description: `Successfully evaluated ${successful} application(s) with AI`,
        })
      } else if (successful > 0 && failed > 0) {
        toast({
          title: "Partial Success",
          description: `Evaluated ${successful} application(s) with AI. ${failed} failed.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to evaluate ${failed} application(s) with AI`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error evaluating applications:", error)
      toast({
        title: "Error",
        description: "Failed to evaluate applications with AI",
        variant: "destructive",
      })
    } finally {
      setIsEvaluating(false)
    }
  }

  // Calculate time-based statistics
  const getTimeBasedStats = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    return {
      today: applications.filter(app => {
        const created = new Date(app.createdAt)
        return created >= today && created < new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }).length,
      thisWeek: applications.filter(app => {
        const created = new Date(app.createdAt)
        return created >= thisWeekStart
      }).length,
      thisMonth: applications.filter(app => {
        const created = new Date(app.createdAt)
        return created >= thisMonthStart
      }).length,
      lastMonth: applications.filter(app => {
        const created = new Date(app.createdAt)
        return created >= lastMonthStart && created <= lastMonthEnd
      }).length
    }
  }

  const timeStats = getTimeBasedStats()

  const stats = {
    total: totalApplications,
    submitted: applications.filter(app => app.status === "SUBMITTED").length,
    underReview: applications.filter(app => app.status === "UNDER_REVIEW").length,
    approved: applications.filter(app => app.status === "APPROVED").length,
    rejected: applications.filter(app => app.status === "REJECTED").length,
    pendingDocs: applications.filter(app => app.status === "PENDING_DOCUMENTS").length,
    temporary: applications.filter(app => app.status === "TEMPORARY").length,
    withScores: applications.filter(app => app.applicationScore !== null && app.applicationScore !== undefined).length,
    withoutScores: applications.filter(app => app.applicationScore === null || app.applicationScore === undefined).length,
    ...timeStats
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchApplications} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 break-words">
            Applications Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Review and manage all system applications
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {selectedRows.size > 0 && (
            <>
              <Button
                onClick={handleEvaluateApplications}
                disabled={isEvaluating}
                className="flex items-center justify-center gap-2 h-12 sm:h-9 px-3 sm:px-4 bg-blue-600 hover:bg-blue-700"
              >
                {isEvaluating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isEvaluating ? "Evaluating..." : `Evaluate ${selectedRows.size} with AI`}
                </span>
              </Button>
              <Button
                onClick={handleInviteToInterview}
                disabled={isInvitingToInterview}
                className="flex items-center justify-center gap-2 h-12 sm:h-9 px-3 sm:px-4 bg-green-600 hover:bg-green-700"
              >
                {isInvitingToInterview ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isInvitingToInterview ? "Inviting..." : `Invite ${selectedRows.size} to Interview`}
                </span>
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/superadmin/interview-criteria")}
            className="flex items-center justify-center gap-2 h-12 sm:h-9 px-3 sm:px-4"
          >
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Interview Criteria</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportApplications}
            className="flex items-center justify-center gap-2 h-12 sm:h-9 px-3 sm:px-4"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Time Filter Quick Actions */}
      <Card className="mb-4 sm:mb-6 bg-white">
        <CardContent className="p-3 sm:p-4 md:p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-700">Quick Time Filters</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={timeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeFilterChange('all')}
                className="flex items-center gap-1"
              >
                <BarChart3 className="h-3 w-3" />
                All Time
              </Button>
              <Button
                variant={timeFilter === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeFilterChange('today')}
                className="flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                Today
              </Button>
              <Button
                variant={timeFilter === 'thisWeek' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeFilterChange('thisWeek')}
                className="flex items-center gap-1"
              >
                <CalendarDays className="h-3 w-3" />
                This Week
              </Button>
              <Button
                variant={timeFilter === 'lastWeek' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeFilterChange('lastWeek')}
                className="flex items-center gap-1"
              >
                <TrendingUp className="h-3 w-3" />
                Last Week
              </Button>
              <Button
                variant={timeFilter === 'thisMonth' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeFilterChange('thisMonth')}
                className="flex items-center gap-1"
              >
                <CalendarDays className="h-3 w-3" />
                This Month
              </Button>
              <Button
                variant={timeFilter === 'lastMonth' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeFilterChange('lastMonth')}
                className="flex items-center gap-1"
              >
                <TrendingUp className="h-3 w-3" />
                Last Month
              </Button>
              <Button
                variant={timeFilter === 'last7Days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeFilterChange('last7Days')}
                className="flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                Last 7 Days
              </Button>
              <Button
                variant={timeFilter === 'last30Days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeFilterChange('last30Days')}
                className="flex items-center gap-1"
              >
                <CalendarDays className="h-3 w-3" />
                Last 30 Days
              </Button>
            </div>
            {timeFilter !== 'all' && (
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>
                  Showing applications from {startDate} to {endDate}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTimeFilterChange('all')}
                  className="h-6 px-2 text-xs"
                >
                  Clear Filter
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card className="bg-white">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-full shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">This Week</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.thisWeek}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-full shrink-0">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.thisMonth}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 rounded-full shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Today</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.today}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-50 rounded-full shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card className="bg-white">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">With Scores</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.withScores}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-full shrink-0">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Pending Evaluation</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.withoutScores}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-50 rounded-full shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Under Review</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.underReview}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-50 rounded-full shrink-0">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.approved}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-full shrink-0">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4 sm:mb-6 bg-white">
        <CardContent className="p-3 sm:p-4 md:p-5">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email, name, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 sm:h-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-12 sm:h-10">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(APPLICATION_STATUSES).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">District</label>
                <Select value={districtFilter} onValueChange={setDistrictFilter}>
                  <SelectTrigger className="w-full sm:w-[200px] h-12 sm:h-10">
                    <SelectValue placeholder="Filter by district" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                                      {districts.length > 0 ? (
                    districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))
                  ) : (
                      <SelectItem value="loading" disabled>Loading districts...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">Start date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12 sm:h-10 w-full sm:w-[170px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">End date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-12 sm:h-10 w-full sm:w-[170px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="p-3 sm:p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg md:text-xl">
                Applications ({filteredApplications.length})
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Review and manage application submissions
              </CardDescription>
            </div>
            {selectedRows.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedRows.size} selected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRows(new Set())}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden lg:block overflow-x-auto bg-white">
            <DataTable
              data={paginatedApplications}
              onUpdateStatus={handleUpdateStatus}
              onDeleteApplication={handleDeleteApplication}
              isUpdating={isUpdating}
              sortConfig={sortConfig}
              onSort={handleSort}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
            />
            <DataTablePagination
              currentPage={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalRows={totalApplications}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </div>

          <div className="lg:hidden">
            {filteredApplications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <p className="text-gray-500">No applications found</p>
                  {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 sm:p-4">
                {paginatedApplications.map((application) => {
                  const statusInfo = APPLICATION_STATUSES[application.status as keyof typeof APPLICATION_STATUSES]
                  const StatusIcon = statusInfo?.icon || AlertCircle
                  
                  // Extract applicant data from formData or application fields
                  const firstName = application.formData?.q1 || ""
                  const lastName = application.formData?.q2 || ""
                  const applicantName = (firstName || lastName) 
                                      ? `${firstName} ${lastName}`.trim()
                                      : application.user?.name || "N/A"
                  
                  const applicantEmail = application.email || 
                                       application.formData?.email || 
                                       application.user?.email || 
                                       "N/A"
                  
                  const applicantPhone = application.phone || 
                                       application.formData?.['Phone Number'] || 
                                       application.formData?.phone || 
                                       "N/A"
                  
                  const gender = application.formData?.q4 || "N/A"
                  
                  const maritalStatus = application.formData?.q6 || "N/A"
                  
                  // Extract district from various possible locations in formData
                  const district = application.formData?.district || 
                                  application.formData?.q11?.district || 
                                  (typeof application.formData?.q11 === 'object' && application.formData?.q11?.district) ||
                                  "N/A"
                  
                  return (
                    <Card key={application.id} className="p-4 bg-white">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {applicantName}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <p className="text-sm text-gray-600 truncate">{applicantEmail}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Phone:</span>
                              <p className="text-sm text-gray-600">{applicantPhone}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Gender:</span>
                              <p className="text-sm text-gray-600">{gender}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Marital Status:</span>
                              <p className="text-sm text-gray-600">{maritalStatus}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">District:</span>
                              <p className="text-sm text-gray-600">{district}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border shadow-md">
                              <DropdownMenuItem onClick={() => router.push(`/superadmin/applications/${application.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {Object.entries(APPLICATION_STATUSES).map(([status, { label }]) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() => handleUpdateStatus(application.id, status)}
                                  disabled={application.status === status || isUpdating}
                                >
                                  Update to {label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteApplication(application.id)}
                                disabled={isUpdating}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`${statusInfo?.color} text-white flex items-center gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo?.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {new Date(application.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Updated: {new Date(application.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* The selectedApplication dialog is removed as per the edit hint */}
    </div>
  )
} 