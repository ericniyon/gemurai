"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Application } from '@prisma/client'
import { api } from '@/lib/api-client'
import { getApplicationsWithAuth } from './actions'
import {
  Loader2,
  AlertCircle,
  FileText,
  Download,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortAsc,
  SortDesc,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ApplicationsTable from './applications-table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

type ApplicationWithRelations = Application & {
  user?: {
    id: string
    name: string | null
    email: string | null
  } | null
  evaluations?: Array<{
    id: string
    type: string
    score: number
    questionScores?: Record<string, any>
    metadata?: {
      overallLevel?: string | null
      recommendations?: string[] | null
    } | null
    createdAt: Date
  }> | null
  dccProfile?: {
    id: string
    level: string | null
  } | null
}

interface ApplicationsContentProps {
  initialData?: ApplicationWithRelations[]
}

export default function ApplicationsContent({ initialData = [] }: ApplicationsContentProps) {
  const params = useParams()
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState<ApplicationWithRelations[]>(initialData)
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithRelations[]>(initialData)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Handle mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize auth and fetch applications
  useEffect(() => {
    let isMounted = true

    const fetchApplications = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log("🔄 Fetching applications from server action...")
        const result = await getApplicationsWithAuth()
        
        console.log("📊 Server action result:", result)
        console.log("📊 Result type:", typeof result)
        console.log("📊 Is array:", Array.isArray(result))
        console.log("📊 Length:", result?.length)

        if (result && Array.isArray(result)) {
          console.log("✅ Received applications array with", result.length, "items")
          console.log("📋 First application sample:", JSON.stringify(result[0], null, 2))
          
          if (isMounted) {
            setApplications(result)
            setFilteredApplications(result)
          }
        } else if (result && typeof result === 'object' && 'error' in result) {
          console.error("❌ Server action returned error:", result.error)
          if (isMounted) {
            setError(result.error)
            setApplications([])
            setFilteredApplications([])
          }
        } else {
          console.warn("⚠️ Unexpected result format:", result)
          if (isMounted) {
            setApplications([])
            setFilteredApplications([])
          }
        }
      } catch (error) {
        console.error("❌ Error fetching applications:", error)
        if (isMounted) {
          setError(error instanceof Error ? error.message : "Failed to fetch applications")
          setApplications([])
          setFilteredApplications([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (isAuthenticated && user) {
      fetchApplications()
    }

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user, toast])

  // Filter applications
  useEffect(() => {
    let result = [...applications]

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(app => {
        // Check if this is Google Sheets data (has formData with First Name, etc.)
        if (app.formData && typeof app.formData === 'object') {
          const firstName = app.formData['First Name'] || ''
          const lastName = app.formData['Lat Name'] || ''
          const fullName = `${firstName} ${lastName}`.trim()
          const email = app.formData['Applicant email'] || app.email || ''
          const phone = app.formData['Applicant Phone number'] || app.phone || ''
          
          return fullName.toLowerCase().includes(searchLower) ||
                 email.toLowerCase().includes(searchLower) ||
                 phone.toLowerCase().includes(searchLower)
        }
        
        // Fallback to database format
        return app.user?.name?.toLowerCase()?.includes(searchLower) ||
               app.user?.email?.toLowerCase()?.includes(searchLower) ||
               app.email?.toLowerCase()?.includes(searchLower)
      })
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(app => app.status === statusFilter)
    }

    setFilteredApplications(result)
  }, [applications, searchTerm, statusFilter])

  // Handle view application
  const handleViewApplication = (applicationId: string) => {
    const lang = params?.lang || 'en'
    router.push(`/${lang}/dashboard/applications/${applicationId}`)
  }

  // Add stats calculation
  const stats = {
    total: filteredApplications.length,
    pending: filteredApplications.filter(app => app.status === "SUBMITTED").length,
    approved: filteredApplications.filter(app => app.status === "APPROVED").length,
    rejected: filteredApplications.filter(app => app.status === "REJECTED").length,
  }

  // Show loading state while auth is initializing
  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium text-gray-900">Failed to load applications</p>
        <p className="text-sm text-gray-500">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  // Show empty state
  if (!filteredApplications.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <FileText className="h-12 w-12 text-gray-400" />
        <p className="text-lg font-medium text-gray-900">No applications found</p>
        <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">{stats.total}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <Clock className="h-7 w-7 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">{stats.pending}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">{stats.approved}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-50 rounded-xl">
                <XCircle className="h-7 w-7 text-red-600" />
              </div>
        <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">{stats.rejected}</h3>
        </div>
        </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white">
                    <Filter className="mr-2 h-4 w-4" />
                    Status
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")} className="cursor-pointer">
                    All Applications
                  </DropdownMenuItem>
                <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter("SUBMITTED")} className="cursor-pointer">
                    <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                    Pending
                </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("APPROVED")} className="cursor-pointer">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Approved
                </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("REJECTED")} className="cursor-pointer">
                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                    Rejected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="overflow-hidden border bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-0">
          <ApplicationsTable 
            applications={filteredApplications} 
            onViewApplication={handleViewApplication}
            showActionsColumn={statusFilter === 'INTERVIEW_INVITED'}
          />
        </CardContent>
      </Card>
    </div>
  )
}