"use client"

import React, { useState, useEffect, useMemo, useCallback, memo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Loader2, 
  RefreshCw, 
  Database, 
  Users, 
  TrendingUp, 
  Calendar,
  Phone,
  Mail,
  User,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Award,
  Globe,
  MapPin,
  Building,
  GraduationCap,
  Briefcase,
  Heart,
  Shield,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  MoreHorizontal,
  Sun,
  Moon,
  UserPlus
} from "lucide-react"
import { DashboardSkeleton } from "./components/skeleton-loading"
import VirtualScroll from "./components/virtual-scroll"
import ApplicationCard from "./components/application-card"
import { ApplicationStats } from "./components/stats-cards"
import PerformanceMonitor from "./components/performance-monitor"

interface Application {
  id: string
  status: string
  currentStep?: string
  notes?: string
  dccCreated?: boolean
  applicationScore?: number
  vulnerabilityCategory?: string
  createdAt: string
  updatedAt: string
  formData: any
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  totalScore: number
  interviewScore: number
  user?: any
  evaluations: any[]
  interviewScores: any[]
  dccProfile?: any
}

interface ApplicationsResponse {
  success: boolean
  data: Application[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  meta: {
    fetchedAt: string
    userRole: string
    totalApplications: number
  }
}

export default function ModernApplicationsDashboard() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const lang = params?.lang as string || 'en'
  
  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now()
    return () => {
      const endTime = performance.now()
      console.log(`🚀 Dashboard render time: ${(endTime - startTime).toFixed(2)}ms`)
    }
  }, [])
  
  const [applications, setApplications] = useState<Application[]>([])
  const [allApplications, setAllApplications] = useState<Application[]>([]) // For province cards
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [meta, setMeta] = useState<any>(null)
  
  // Selection state
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set())
  const [isSelectAll, setIsSelectAll] = useState(false)
  
  // Join interview state
  const [selectedApplicationForJoin, setSelectedApplicationForJoin] = useState<Application | null>(null)
  const [showJoinInterviewDialog, setShowJoinInterviewDialog] = useState(false)
  const [isJoiningInterview, setIsJoiningInterview] = useState(false)
  
  // Grouping and tabs state
  const [groupByStatus, setGroupByStatus] = useState(false)
  const [activeTab, setActiveTab] = useState<'SUBMITTED' | 'INTERVIEW_INVITED' | 'INTERVIEWED'>('SUBMITTED')

  const fetchAllApplications = useCallback(async () => {
    // Skip if we already have data
    if (allApplications.length > 0) {
      console.log('🚀 Skipping fetch - already have applications data')
      return
    }

    try {
      console.log('🔄 Fetching ALL applications for province cards...')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch(`/api/v1/applications/dashboard?limit=9999&page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=300' // Cache for 5 minutes
        },
        credentials: 'include',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApplicationsResponse = await response.json()
      
      if (data.success) {
        console.log(`✅ Fetched ${data.data.length} total applications for province cards`)
        setAllApplications(data.data)
      } else {
        throw new Error('Failed to fetch all applications')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.error('❌ Request timeout while fetching all applications')
        setError('Request timeout. The server is taking longer than expected. Please try again or contact support if the issue persists.')
      } else {
      console.error('❌ Error fetching all applications:', err)
        setError('Failed to load applications. Please refresh the page.')
      }
    }
  }, [allApplications.length])

  const fetchApplications = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setIsRetrying(true)
      setRetryCount(prev => prev + 1)
    } else {
    setLoading(true)
    setError(null)
    }

    try {
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('limit', '10')
      params.append('status', activeTab)

      console.log(`🔄 ${isRetry ? 'Retrying' : 'Fetching'} applications from database... (Attempt ${retryCount + 1})`)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 second timeout
      
      const response = await fetch(`/api/v1/applications/dashboard?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=60' // Cache for 1 minute
        },
        credentials: 'include',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApplicationsResponse = await response.json()
      
      if (data.success) {
        console.log(`✅ Fetched ${data.data.length} applications from database`)
        setApplications(data.data)
        setPagination(data.pagination)
        setMeta(data.meta)
        setRetryCount(0) // Reset retry count on success
      } else {
        throw new Error('Failed to fetch applications')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.error('❌ Request timeout while fetching applications')
        if (retryCount < 2) {
          setError(`Request timeout (Attempt ${retryCount + 1}/3). Retrying automatically...`)
          // Auto-retry after 2 seconds
          setTimeout(() => {
            fetchApplications(true)
          }, 2000)
        } else {
          setError('Request timeout after multiple attempts. The server is taking longer than expected. This might be due to a large dataset. Please try again later or contact support.')
        }
      } else {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('❌ Error fetching applications:', err)
      }
    } finally {
      setLoading(false)
      setIsRetrying(false)
    }
  }, [currentPage, activeTab, retryCount])

  const refetch = useCallback(() => {
    fetchAllApplications() // Refresh all applications for province cards
    fetchApplications() // Refresh paginated applications for table
  }, [fetchAllApplications, fetchApplications])

  // Join interview functions
  const handleJoinInterviewClick = useCallback((application: Application) => {
    const interviewScores = application.interviewScores || []
    const joinedInterviewers = interviewScores.length
    const maxInterviewers = 2
    const canJoin = joinedInterviewers < maxInterviewers

    // Check if current user has already joined this interview
    const currentUserId = user?.id
    const hasUserJoined = interviewScores.some(score => score.submittedBy === currentUserId)

    if (hasUserJoined) {
      // User has already joined, navigate directly to interview
      router.push(`/${lang}/dashboard/interviews/${application.id}`)
    } else if (canJoin) {
      // User hasn't joined and slots are available, show confirmation dialog
      setSelectedApplicationForJoin(application)
      setShowJoinInterviewDialog(true)
    }
  }, [user?.id, lang, router])

  const handleConfirmJoinInterview = useCallback(async () => {
    if (!selectedApplicationForJoin) return

    setIsJoiningInterview(true)
    try {
      const response = await fetch("/api/v1/applications/join-interview", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: selectedApplicationForJoin.id,
          interviewerIds: [user?.id] // Join as current user
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh the applications
        fetchApplications()
        // Close dialog
        setShowJoinInterviewDialog(false)
        setSelectedApplicationForJoin(null)
        // Navigate to interview page
        router.push(`/${lang}/dashboard/interviews/${selectedApplicationForJoin.id}`)
      } else {
        console.error("Failed to join interview:", data.message)
        alert(data.message || "Failed to join interview")
      }
    } catch (error) {
      console.error("Error joining interview:", error)
      alert("Failed to join interview")
    } finally {
      setIsJoiningInterview(false)
    }
  }, [selectedApplicationForJoin, user?.id, fetchApplications, lang, router])


  useEffect(() => {
    fetchAllApplications() // Fetch all applications for province cards
    fetchApplications() // Fetch paginated applications for table
  }, [currentPage, activeTab])

  // Group applications by status - memoized for performance
  const groupedApplications = useMemo(() => {
    if (!groupByStatus) {
      return { 'All Applications': applications }
    }

    const groups: { [key: string]: Application[] } = {}
    
    applications.forEach(app => {
      const status = app.status || 'UNKNOWN'
      if (!groups[status]) {
        groups[status] = []
      }
      groups[status].push(app)
    })

    // Sort groups by status priority
    const statusOrder = ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_INVITED', 'INTERVIEWED', 'APPROVED', 'REJECTED', 'PENDING_DOCUMENTS', 'UNKNOWN']
    const sortedGroups: { [key: string]: Application[] } = {}
    
    statusOrder.forEach(status => {
      if (groups[status]) {
        sortedGroups[status] = groups[status]
      }
    })

    // Add any remaining statuses not in the order
    Object.keys(groups).forEach(status => {
      if (!statusOrder.includes(status)) {
        sortedGroups[status] = groups[status]
      }
    })

    return sortedGroups
  }, [applications, groupByStatus])

  // Memoized status configuration function
  const getStatusConfig = useCallback((status: string) => {
    const configs = {
      'SUBMITTED': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: Clock,
        label: 'Submitted'
      },
      'INTERVIEW_INVITED': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Calendar,
        label: 'Interview Invited'
      },
      'INTERVIEWED': { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        icon: User,
        label: 'Interviewed'
      },
      'APPROVED': { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        label: 'Approved'
      },
      'REJECTED': { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: AlertCircle,
        label: 'Rejected'
      }
    }
    
    return configs[status as keyof typeof configs] || configs['SUBMITTED']
  }, [])

  // Memoized applicant name extraction
  const getApplicantName = useCallback((application: Application) => {
    const formData = application.formData || {}
    // Prefer names from form data to avoid admin user names
    if (formData.q1 && formData.q2) return `${formData.q1} ${formData.q2}`.trim()
    if (formData['First Name'] && formData['Last Name']) return `${formData['First Name']} ${formData['Last Name']}`.trim()
    if (formData['First Name'] && formData['Lat Name']) return `${formData['First Name']} ${formData['Lat Name']}`.trim()
    if (formData.firstName && formData.lastName) return `${formData.firstName} ${formData.lastName}`.trim()
    if (formData['Full Name']) return formData['Full Name']
    if (formData['Applicant Name']) return formData['Applicant Name']
    if (formData.name) return formData.name
    if (formData.fullName) return formData.fullName
    if (formData['First Name']) return formData['First Name']
    if (formData.firstName) return formData.firstName
    // Fallback to existing field
    return application.applicantName
  }, [])

  // Memoized status counts
  const statusCounts = useMemo(() => {
    return applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [applications])

  // Memoized province data
  const provinceData = useMemo(() => [
    { 
      name: 'Kigali City', 
      id: 'kigali', 
      icon: '🏛️', 
      districts: ['Gasabo', 'Nyarugenge', 'Kigali City']
    },
    { 
      name: 'Northern Province', 
      id: 'northern', 
      icon: '🏔️', 
      districts: ['Burera', 'Gicumbi', 'Musanze', 'Rulindo']
    },
    { 
      name: 'Southern Province', 
      id: 'southern', 
      icon: '🌾', 
      districts: ['Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyaruguru', 'Ruhango']
    },
    { 
      name: 'Eastern Province', 
      id: 'eastern', 
      icon: '🌅', 
      districts: ['Bugesera', 'Kayonza', 'Nyagatare', 'Rwamagana']
    },
    { 
      name: 'Western Province', 
      id: 'western', 
      icon: '🌊', 
      districts: ['Karongi', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro']
    }
  ], [])

  // Memoized province applications calculation
  const provinceApplications = useMemo(() => {
    return provinceData.map(province => {
      const provinceApps = allApplications.filter(app => {
        const formData = app.formData || {}
        const appDistrict = formData.district
        if (!appDistrict) return false
        
        return province.districts.some(district => 
          appDistrict.toLowerCase() === district.toLowerCase()
        )
      })

      const districtCounts = province.districts.map(district => {
        const districtApps = allApplications.filter(app => {
          const formData = app.formData || {}
          const appDistrict = formData.district
          
          return appDistrict && appDistrict.toLowerCase() === district.toLowerCase()
        })
        
        return {
          district,
          count: districtApps.length
        }
      }).filter(d => d.count > 0)

      return {
        ...province,
        applications: provinceApps,
        districtCounts
      }
    })
  }, [provinceData, allApplications])

  // Selection handlers
  const handleSelectApplication = useCallback((applicationId: string) => {
    setSelectedApplications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId)
      } else {
        newSet.add(applicationId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (isSelectAll) {
      setSelectedApplications(new Set())
      setIsSelectAll(false)
    } else {
      const allIds = new Set(applications.map(app => app.id))
      setSelectedApplications(allIds)
      setIsSelectAll(true)
    }
  }, [isSelectAll, applications])

  const handleBulkExport = useCallback(() => {
    const selectedApps = applications.filter(app => selectedApplications.has(app.id))
    console.log('Exporting selected applications:', selectedApps)
    // TODO: Implement bulk export functionality
  }, [applications, selectedApplications])

  const handleBulkDelete = useCallback(() => {
    const selectedApps = applications.filter(app => selectedApplications.has(app.id))
    console.log('Deleting selected applications:', selectedApps)
    // TODO: Implement bulk delete functionality
  }, [applications, selectedApplications])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVulnerabilityIcon = (category: string) => {
    const icons = {
      'WOMEN': Heart,
      'YOUTH': GraduationCap,
      'ELDERLY': Building,
      'DISABLED': Shield,
      'REFUGEES': Globe,
      'OTHER': Users
    }
    return icons[category as keyof typeof icons] || Users
  }


  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="container mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="container mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Error Loading Applications</h3>
                  <p className="text-red-600">{error}</p>
                  {isRetrying && (
                    <div className="mt-2 flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      <span className="text-red-600 text-sm">Retrying...</span>
                </div>
                  )}
                  {retryCount > 0 && !isRetrying && (
                    <p className="text-red-500 text-sm mt-2">Attempted {retryCount} times</p>
                  )}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={() => {
                      setRetryCount(0)
                      setError(null)
                      fetchApplications()
                    }} 
                    variant="outline" 
                    className="border-red-300 text-red-700 hover:bg-red-100"
                    disabled={isRetrying}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Retrying...' : 'Try Again'}
                  </Button>
                  <Button 
                    onClick={() => {
                      setRetryCount(0)
                      setError(null)
                      refetch()
                    }} 
                    variant="outline" 
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    disabled={isRetrying}
                  >
                  <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh All
                </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <PerformanceMonitor componentName="ModernApplicationsDashboard">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Province Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {provinceApplications.map((province) => (
              <Card 
                key={province.id} 
                className="group bg-white/90 backdrop-blur-sm border border-gray-200/50 cursor-pointer hover:shadow-2xl transition-all duration-500 ease-out hover:scale-105 hover:border-blue-300/50 hover:bg-white ring-1 ring-gray-200/20 hover:ring-blue-200/40"
                onClick={() => {
                  // Navigate to province applications page
                  router.push(`/${lang}/dashboard/applications/province/${province.id}`)
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">{province.icon}</span>
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300 text-lg px-4 py-2 font-semibold shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                      {province.applications.length}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{province.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 font-medium">Total: {province.applications.length} applications</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">Click to view details</span>
                    <ArrowRight className="h-4 w-4 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  {/* District Breakdown */}
                  {province.districtCounts.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">By District:</p>
                      <div className="space-y-2">
                        {province.districtCounts.map(({ district, count }) => (
                          <div key={district} className="flex justify-between items-center text-xs group/district">
                            <span className="text-gray-700 truncate font-medium group-hover/district:text-blue-600 transition-colors duration-200">{district}</span>
                            <Badge variant="outline" className="text-xs px-2 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-300 group-hover/district:from-blue-50 group-hover/district:to-blue-100 group-hover/district:text-blue-700 group-hover/district:border-blue-300 transition-all duration-200">
                              {count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-xs text-gray-400 italic bg-gray-50 rounded-lg p-3 text-center">
                      No applications found in any district
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          }
        </div>

        {/* Enhanced Status Tabs */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <div className="relative">
              <TabsList className="flex w-full gap-3 bg-white/10 backdrop-blur-md border border-slate-200/70 rounded-2xl px-4 py-6 shadow-lg ring-1 ring-slate-200/30">
                <TabsTrigger 
                  value="SUBMITTED" 
                  className="relative flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all duration-500 ease-out rounded-xl group data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-blue-200/50 data-[state=inactive]:text-slate-700 data-[state=inactive]:bg-white/60 data-[state=inactive]:backdrop-blur-sm data-[state=inactive]:border data-[state=inactive]:border-slate-200/50 data-[state=inactive]:shadow-md data-[state=inactive]:hover:text-blue-700 data-[state=inactive]:hover:bg-white/80 data-[state=inactive]:hover:shadow-lg data-[state=inactive]:hover:scale-102 data-[state=inactive]:hover:border-blue-300/50"
                >
                  <Clock className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=inactive]:group-hover:scale-110" />
                  <span className="hidden sm:inline text-center">Submitted Applications</span>
                  <span className="sm:hidden text-center">Submitted</span>
                  {/* Animated indicator */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 data-[state=active]:w-8 opacity-0 data-[state=active]:opacity-100" />
                </TabsTrigger>
                <TabsTrigger 
                  value="INTERVIEW_INVITED" 
                  className="relative flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all duration-500 ease-out rounded-xl group data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-yellow-200/50 data-[state=inactive]:text-slate-700 data-[state=inactive]:bg-white/60 data-[state=inactive]:backdrop-blur-sm data-[state=inactive]:border data-[state=inactive]:border-slate-200/50 data-[state=inactive]:shadow-md data-[state=inactive]:hover:text-yellow-700 data-[state=inactive]:hover:bg-white/80 data-[state=inactive]:hover:shadow-lg data-[state=inactive]:hover:scale-102 data-[state=inactive]:hover:border-yellow-300/50"
                >
                  <Calendar className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=inactive]:group-hover:scale-110" />
                  <span className="hidden sm:inline text-center">Invited to Interview</span>
                  <span className="sm:hidden text-center">Invited</span>
                  {/* Animated indicator */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500 data-[state=active]:w-8 opacity-0 data-[state=active]:opacity-100" />
                </TabsTrigger>
                <TabsTrigger 
                  value="INTERVIEWED" 
                  className="relative flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all duration-500 ease-out rounded-xl group data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-purple-200/50 data-[state=inactive]:text-slate-700 data-[state=inactive]:bg-white/60 data-[state=inactive]:backdrop-blur-sm data-[state=inactive]:border data-[state=inactive]:border-slate-200/50 data-[state=inactive]:shadow-md data-[state=inactive]:hover:text-purple-700 data-[state=inactive]:hover:bg-white/80 data-[state=inactive]:hover:shadow-lg data-[state=inactive]:hover:scale-102 data-[state=inactive]:hover:border-purple-300/50"
                >
                  <User className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=inactive]:group-hover:scale-110" />
                  <span className="hidden sm:inline text-center">Interviewed</span>
                  <span className="sm:hidden text-center">Interviewed</span>
                  {/* Animated indicator */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500 data-[state=active]:w-8 opacity-0 data-[state=active]:opacity-100" />
                </TabsTrigger>
            </TabsList>
            </div>
          </Tabs>
        </div>
        {/* Enhanced Control Buttons Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-8">
            <Button
            onClick={refetch}
            disabled={loading}
              size="sm"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto px-6 py-2.5 font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            <span>Refresh Data</span>
            </Button>
        </div>

        {/* Enhanced Applications Data Table */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md ring-1 ring-slate-200/20 hover:shadow-3xl transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-sm ring-1 ring-blue-200/50">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-800">
                  {lang === 'rw' ? 'Ubusabe' : 'Applications'} 
                </span>
                  {pagination && (
                    <p className="text-sm text-slate-600 mt-1 font-medium">
                      {pagination.total} total applications
                    </p>
                  )}
                </div>
              </CardTitle>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="border-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300 hover:shadow-md hover:scale-105 font-semibold">
                  <Download className="h-4 w-4 mr-2 transition-transform duration-300 hover:scale-110" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {/* Bulk Actions Toolbar */}
          {selectedApplications.size > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{selectedApplications.size}</span>
                    </div>
                    <span className="text-slate-700 font-medium">
                      {selectedApplications.size} application{selectedApplications.size !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedApplications(new Set())
                      setIsSelectAll(false)
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Clear selection
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkExport}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <CardContent className="p-0">
            {loading ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/50">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50 w-12">
                        <input
                          type="checkbox"
                          checked={isSelectAll}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">
                        {lang === 'rw' ? 'Umuntu' : 'Applicant'}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">
                        {lang === 'rw' ? 'Imiterere' : 'Status'}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">
                        {lang === 'rw' ? 'Telefone' : 'Phone'}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">
                        {lang === 'rw' ? 'Akarere' : 'District'}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">
                        {lang === 'rw' ? 'Umwanya' : 'Sector'}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">
                        {lang === 'rw' ? 'Igihe' : 'Date Applied'}
                      </th>
                      {activeTab === 'INTERVIEWED' && (
                        <>
                          <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">Application Score</th>
                          <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">Interview 1</th>
                          <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">Interview 2</th>
                        </>
                      )}
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">{lang === 'rw' ? 'Ibyakozwe' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200/50">
                    {/* Loading Skeleton Rows */}
                    {Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-slate-200 rounded w-4"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                </div>
                            <div className="ml-4">
                              <div className="h-4 bg-slate-200 rounded w-32"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-slate-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-slate-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-slate-200 rounded w-20"></div>
                        </td>
                        {activeTab === 'INTERVIEWED' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-slate-200 rounded w-12"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-slate-200 rounded w-12"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-slate-200 rounded w-12"></div>
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-8 bg-slate-200 rounded w-16"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-28 h-28 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg ring-1 ring-slate-200/50">
                  <Users className="h-14 w-14 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-700 mb-4">
                  {lang === 'rw' ? 'Nta busabe buhagije muri database' : 'No applications found in database'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto text-lg font-medium">
                  Try adjusting your search criteria or filters to find applications
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/50">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50 w-12">
                        <input
                          type="checkbox"
                          checked={isSelectAll}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">
                        {lang === 'rw' ? 'Umuntu' : 'Applicant'}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">
                        {lang === 'rw' ? 'Imiterere' : 'Status'}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">
                        {lang === 'rw' ? 'Telefone' : 'Phone'}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">
                        {lang === 'rw' ? 'Akarere' : 'District'}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">
                        {lang === 'rw' ? 'Umwanya' : 'Sector'}
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">
                        {lang === 'rw' ? 'Igihe' : 'Date Applied'}
                      </th>
                      {/* Removed Score column */}
                      {activeTab === 'INTERVIEWED' && (
                        <>
                          <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">Application Score</th>
                          <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">Interview 1</th>
                          <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">Interview 2</th>
                        </>
                      )}
                      <th className="px-6 py-5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50">{lang === 'rw' ? 'Ibyakozwe' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200/50">
                    {groupByStatus ? (
                      // Render grouped applications
                      Object.entries(groupedApplications).map(([status, statusApplications]) => (
                        <React.Fragment key={status}>
                          {/* Status Group Header */}
                          <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                            <td 
                              colSpan={activeTab === 'INTERVIEWED' ? 11 : 8}
                              className="px-6 py-4 font-semibold text-blue-800"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Users className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <span className="text-lg font-bold">
                                    {status.replace('_', ' ')} ({statusApplications.length})
                                  </span>
                                </div>
                                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                  {statusApplications.length} applications
                                </div>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Applications in this status group */}
                          {statusApplications.map((application, index) => {
                            const statusConfig = getStatusConfig(application.status)
                            const StatusIcon = statusConfig.icon
                            
                            return (
                              <tr key={application.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 hover:shadow-sm group/row">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-sm font-medium text-blue-600">
                                          {application.applicantName?.charAt(0) || 'A'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      {activeTab === 'INTERVIEW_INVITED' || activeTab === 'INTERVIEWED' ? (
                                        <button
                                          type="button"
                                          onClick={() => window.location.href = `/${lang}/dashboard/applications/${application.id}`}
                                          className="text-sm font-medium text-blue-600 hover:text-blue-700 text-left transition-colors"
                                        >
                                          {getApplicantName(application)}
                                        </button>
                                      ) : (
                                        <div className="text-sm font-medium text-slate-900">
                                          {getApplicantName(application)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge className={`${statusConfig.color} border-0 shadow-sm font-semibold text-xs`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                  {application.applicantPhone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                  {application.formData?.district || 
                                   application.formData?.q11?.district || 
                                   (typeof application.formData?.q11 === 'object' && application.formData?.q11?.district) ||
                                   'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                  {application.formData?.Sector || 
                                   application.formData?.sector || 
                                   'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                  {new Date(application.createdAt).toLocaleDateString()}
                                </td>
                                {/* Removed Score badge cell */}
                                {activeTab === 'INTERVIEWED' && (
                                  <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                      {(application.applicationScore || application.totalScore) > 0 
                                        ? `${(application.applicationScore || application.totalScore).toFixed(1)}/40`
                                        : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                      {(() => {
                                        const first = application.interviewScores?.[0]
                                        if (!first) return '-'
                                        const total = first.totalScore || 0
                                        const possible = first.totalPossibleScore || 100
                                        const outOf30 = (total / possible) * 30
                                        return `${outOf30.toFixed(1)}/30`
                                      })()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                      {(() => {
                                        const second = application.interviewScores?.[1]
                                        if (!second) return '-'
                                        const total = second.totalScore || 0
                                        const possible = second.totalPossibleScore || 100
                                        const outOf30 = (total / possible) * 30
                                        return `${outOf30.toFixed(1)}/30`
                                      })()}
                                    </td>
                                  </>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex items-center space-x-2">
                                    {activeTab !== 'INTERVIEW_INVITED' && (
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                        onClick={() => window.location.href = `/${lang}/dashboard/applications/${application.id}`}
                                      >
                                        <Eye className="h-3 w-3" />
                                        {activeTab !== 'SUBMITTED' && <span className="ml-1">View</span>}
                                      </Button>
                                    )}
                                    
                                    {/* Join Interview Button (only on Invited tab) */}
                                    {activeTab === 'INTERVIEW_INVITED' && (() => {
                                      const interviewScores = application.interviewScores || []
                                      const joinedInterviewers = interviewScores.length
                                      const maxInterviewers = 2
                                      const canJoin = joinedInterviewers < maxInterviewers
                                      const currentUserId = user?.id
                                      const hasUserJoined = interviewScores.some(score => score.submittedBy === currentUserId)

                                      return (
                                        <div className="flex flex-col items-center gap-1">
                                          <Button
                                            variant={canJoin ? "default" : "secondary"}
                                            size="sm"
                                            onClick={() => handleJoinInterviewClick(application)}
                                            disabled={!canJoin && !hasUserJoined}
                                            className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${
                                              hasUserJoined
                                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                                                : canJoin 
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                            }`}
                                          >
                                            {hasUserJoined ? (
                                              <>
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                View
                                              </>
                                            ) : canJoin ? (
                                              <>
                                                <UserPlus className="h-4 w-4 mr-1" />
                                                Join
                                              </>
                                            ) : (
                                              <>
                                                <Users className="h-4 w-4 mr-1" />
                                                Full
                                              </>
                                            )}
                                          </Button>
                                          
                                          <div className="flex items-center gap-1">
                                            <span className={`text-xs font-medium ${
                                              hasUserJoined
                                                ? 'text-green-600'
                                                : joinedInterviewers === maxInterviewers 
                                                ? 'text-green-600'
                                                : joinedInterviewers > 0 
                                                ? 'text-blue-600'
                                                : 'text-gray-500'
                                            }`}>
                                              {joinedInterviewers}/{maxInterviewers}
                                            </span>
                                            {hasUserJoined && (
                                              <CheckCircle className="h-3 w-3 text-green-600" />
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })()}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </React.Fragment>
                      ))
                    ) : (
                      // Render normal table
                      applications.map((application, index) => {
                  const statusConfig = getStatusConfig(application.status)
                  const StatusIcon = statusConfig.icon
                  
                  return (
                        <tr key={application.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 hover:shadow-sm group/row">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedApplications.has(application.id)}
                              onChange={() => handleSelectApplication(application.id)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {application.applicantName?.charAt(0) || 'A'}
                                    </span>
                                </div>
                            </div>
                              <div className="ml-4">
                                {activeTab === 'INTERVIEW_INVITED' || activeTab === 'INTERVIEWED' ? (
                                  <button
                                    type="button"
                                    onClick={() => window.location.href = `/${lang}/dashboard/applications/${application.id}`}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 text-left transition-colors"
                                  >
                                    {getApplicantName(application)}
                                  </button>
                                ) : (
                                  <div className="text-sm font-medium text-slate-900">
                                    {getApplicantName(application)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`${statusConfig.color} border-0 shadow-sm font-semibold text-xs`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {application.applicantPhone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {application.formData?.district || 
                             application.formData?.q11?.district || 
                             (typeof application.formData?.q11 === 'object' && application.formData?.q11?.district) ||
                             'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {application.formData?.Sector || 
                             application.formData?.sector || 
                             'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(application.createdAt).toLocaleDateString()}
                          </td>
                          {/* Removed Score badge cell (normal view) */}
                          {activeTab === 'INTERVIEWED' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                {(application.applicationScore || application.totalScore) > 0 
                                  ? `${(application.applicationScore || application.totalScore).toFixed(1)}/40`
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                {(() => {
                                  const first = application.interviewScores?.[0]
                                  if (!first) return '-'
                                  const total = first.totalScore || 0
                                  const possible = first.totalPossibleScore || 100
                                  const outOf30 = (total / possible) * 30
                                  return `${outOf30.toFixed(1)}/30`
                                })()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                {(() => {
                                  const second = application.interviewScores?.[1]
                                  if (!second) return '-'
                                  const total = second.totalScore || 0
                                  const possible = second.totalPossibleScore || 100
                                  const outOf30 = (total / possible) * 30
                                  return `${outOf30.toFixed(1)}/30`
                                })()}
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {activeTab !== 'INTERVIEW_INVITED' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                  onClick={() => window.location.href = `/${lang}/dashboard/applications/${application.id}`}
                                >
                                  <Eye className="h-3 w-3" />
                                  {activeTab !== 'SUBMITTED' && <span className="ml-1">View</span>}
                                </Button>
                              )}
                              
                              {/* Join Interview Button (only on Invited tab) */}
                              {activeTab === 'INTERVIEW_INVITED' && (() => {
                                const interviewScores = application.interviewScores || []
                                const joinedInterviewers = interviewScores.length
                                const maxInterviewers = 2
                                const canJoin = joinedInterviewers < maxInterviewers
                                const currentUserId = user?.id
                                const hasUserJoined = interviewScores.some(score => score.submittedBy === currentUserId)

                                return (
                                  <div className="flex flex-col items-center gap-1">
                              <Button 
                                      variant={canJoin ? "default" : "secondary"}
                                size="sm" 
                                      onClick={() => handleJoinInterviewClick(application)}
                                      disabled={!canJoin && !hasUserJoined}
                                      className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${
                                        hasUserJoined
                                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                                          : canJoin 
                                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                      }`}
                                    >
                                      {hasUserJoined ? (
                                        <>
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          View
                                        </>
                                      ) : canJoin ? (
                                        <>
                                          <UserPlus className="h-4 w-4 mr-1" />
                                          Join
                                        </>
                                      ) : (
                                        <>
                                          <Users className="h-4 w-4 mr-1" />
                                          Full
                                        </>
                                      )}
                              </Button>
                                    
                                    <div className="flex items-center gap-1">
                                      <span className={`text-xs font-medium ${
                                        hasUserJoined
                                          ? 'text-green-600'
                                          : joinedInterviewers === maxInterviewers 
                                          ? 'text-green-600'
                                          : joinedInterviewers > 0 
                                          ? 'text-blue-600'
                                          : 'text-gray-500'
                                      }`}>
                                        {joinedInterviewers}/{maxInterviewers}
                                      </span>
                                      {hasUserJoined && (
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                      )}
                                    </div>
                                  </div>
                                )
                              })()}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md ring-1 ring-slate-200/20 hover:shadow-3xl transition-all duration-500">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl shadow-sm ring-1 ring-blue-200/50">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Showing <span className="font-bold text-blue-600 dark:text-blue-400">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-bold text-blue-600 dark:text-blue-400">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                    <span className="font-bold text-slate-900 dark:text-slate-100">{pagination.total}</span> applications
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrevPage}
                    className="border-slate-300 dark:border-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:border-blue-300 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md hover:scale-105 disabled:hover:scale-100 font-semibold"
                  >
                    <ArrowDown className="h-4 w-4 mr-2 rotate-90 transition-transform duration-300 hover:scale-110" />
                    Previous
                  </Button>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!pagination.hasNextPage}
                    className="border-slate-300 dark:border-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:border-blue-300 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md hover:scale-105 disabled:hover:scale-100 font-semibold"
                  >
                    Next
                    <ArrowUp className="h-4 w-4 ml-2 rotate-90 transition-transform duration-300 hover:scale-110" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Join Interview Confirmation Dialog */}
        {showJoinInterviewDialog && selectedApplicationForJoin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Join Interview</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to join the interview for {selectedApplicationForJoin.applicantName}?
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowJoinInterviewDialog(false)
                    setSelectedApplicationForJoin(null)
                  }}
                  disabled={isJoiningInterview}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmJoinInterview}
                  disabled={isJoiningInterview}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isJoiningInterview ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Interview
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </PerformanceMonitor>
  )
}
