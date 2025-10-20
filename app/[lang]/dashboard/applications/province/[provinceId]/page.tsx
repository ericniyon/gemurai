"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Loader2, 
  RefreshCw, 
  ArrowLeft,
  Users, 
  MapPin,
  Calendar,
  Phone,
  Mail,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  UserPlus
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Swal from "sweetalert2"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Optimized Join Interview Button - Uses existing data, no API calls
const OptimizedJoinInterviewButton = React.memo(({ 
  application, 
  onRefresh,
  getApplicantName
}: { 
  application: Application
  onRefresh: () => void
  getApplicantName: (application: Application) => string
}) => {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const lang = params?.lang as string || 'en'

  // Calculate interview status from existing data (no API call needed!)
  const interviewScores = application.interviewScores || []
  const interviewAssignments = application.interviewAssignments || []
  const maxInterviewers = 2
  const joinedInterviewers = interviewAssignments.length
  const currentUserId = user?.id
  const hasUserJoined = interviewAssignments.some(assignment => assignment.interviewerId === currentUserId)
  const canJoin = hasUserJoined || joinedInterviewers < maxInterviewers
  const remainingSlots = maxInterviewers - joinedInterviewers

  // Memoize expensive calculations
  const interviewStatus = React.useMemo(() => ({
    hasUserJoined,
    canJoin,
    remainingSlots,
    joinedInterviewers
  }), [hasUserJoined, canJoin, remainingSlots, joinedInterviewers])

  const handleGoToInterview = async () => {
    const result = await Swal.fire({
      title: 'Continue Interview',
      html: `
        <div class="text-left">
          <p class="mb-4">
            You have already joined the interview for <strong>${getApplicantName(application)}</strong>.
          </p>
          <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center gap-2 text-sm text-blue-700">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span>You can continue or edit your previous scores</span>
            </div>
          </div>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Go to Interview',
      cancelButtonText: 'Cancel',
      showCloseButton: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      customClass: {
        popup: 'rounded-lg',
        title: 'text-lg font-semibold',
        htmlContainer: 'text-gray-700'
      }
    })

    if (result.isConfirmed) {
      router.push(`/${lang}/dashboard/interviews/${application.id}`)
    }
  }

  const handleJoinInterview = async () => {
    if (interviewStatus.hasUserJoined) {
      // User already joined, show confirmation before going to interview
      await handleGoToInterview()
    } else if (interviewStatus.canJoin) {
      // User hasn't joined yet, show confirmation dialog to join
      const result = await Swal.fire({
        title: 'Join Interview',
        html: `
          <div class="text-left">
            <p class="mb-4">
              Are you sure you want to join the interview for <strong>${getApplicantName(application)}</strong>?
            </p>
            <div class="p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
              <div class="flex items-center gap-2 text-sm text-green-700">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                </svg>
                <span>${interviewStatus.remainingSlots} slot${interviewStatus.remainingSlots > 1 ? 's' : ''} remaining</span>
              </div>
            </div>
            <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex items-center gap-2 text-sm text-blue-700">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                <span>Once you join, you can access the interview anytime to continue or edit your scores</span>
              </div>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Join Interview',
        cancelButtonText: 'Cancel',
        showCloseButton: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
        customClass: {
          popup: 'rounded-lg',
          title: 'text-lg font-semibold',
          htmlContainer: 'text-gray-700'
        }
      })

      if (result.isConfirmed) {
        await proceedWithJoinInterview()
      }
    }
  }

  const proceedWithJoinInterview = async () => {
    setLoading(true)
    
    try {
      // If user has already joined, skip API call and go directly to interview
      if (interviewStatus.hasUserJoined) {
        // Navigate directly to interview page for editing
        router.push(`/${lang}/dashboard/interviews/${application.id}`)
        return
      }

      // If user hasn't joined yet, make API call to join
      const response = await fetch("/api/v1/applications/join-interview", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: application.id,
          interviewerIds: [currentUserId]
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Show success message with SweetAlert2
        await Swal.fire({
          icon: 'success',
          title: 'Successfully Joined!',
          text: `You have joined the interview for ${getApplicantName(application)}`,
          confirmButtonColor: '#059669',
          confirmButtonText: 'Go to Interview',
          showCloseButton: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            popup: 'rounded-lg',
            title: 'text-lg font-semibold',
            confirmButton: 'px-6 py-2'
          }
        })

        // Refresh the applications list
        onRefresh()
        
        // Navigate to interview page
        router.push(`/${lang}/dashboard/interviews/${application.id}`)
      } else {
        // Handle specific error cases
        let errorTitle = 'Failed to Join Interview'
        let errorMessage = data.message || "Unable to join the interview at this time"
        
        if (response.status === 409) {
          if (data.message?.includes('already joined')) {
            errorTitle = 'Already Joined'
            errorMessage = 'You have already joined this interview. Redirecting to interview page...'
            
            // Auto-redirect to interview page after showing message
            setTimeout(() => {
              router.push(`/${lang}/dashboard/interviews/${application.id}`)
            }, 2000)
          } else if (data.message?.includes('No available slots')) {
            errorTitle = 'Interview Full'
            errorMessage = 'This interview is full. No more interviewers can join.'
          }
        }
        
        // Show error with SweetAlert2
        await Swal.fire({
          icon: response.status === 409 ? 'warning' : 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonColor: response.status === 409 ? '#f59e0b' : '#dc2626',
          confirmButtonText: 'OK',
          showCloseButton: true,
          allowOutsideClick: true,
          allowEscapeKey: true,
          customClass: {
            popup: 'rounded-lg',
            title: 'text-lg font-semibold'
          }
        })
      }
    } catch (error) {
      console.error("Error joining interview:", error)
      
      // Show error with SweetAlert2
      await Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: "Unable to connect to the server. Please check your internet connection and try again.",
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        showCloseButton: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
        customClass: {
          popup: 'rounded-lg',
          title: 'text-lg font-semibold'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  // Render different states based on interview status
  if (interviewStatus.hasUserJoined) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        onClick={handleGoToInterview}
        title={`Join Interview - ${getApplicantName(application)} (You can join anytime)`}
      >
        <UserPlus className="h-4 w-4" />
      </Button>
    )
  }

  if (!interviewStatus.canJoin) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-gray-400 cursor-not-allowed"
        disabled
        title={`Interview Full - ${getApplicantName(application)} (${interviewStatus.joinedInterviewers}/${maxInterviewers} interviewers)`}
      >
        <Users className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 w-8 p-0 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleJoinInterview}
      disabled={loading}
      title={`Join Interview - ${getApplicantName(application)}${interviewStatus.hasUserJoined ? ' (You can join anytime)' : ` (${interviewStatus.remainingSlots} slot${interviewStatus.remainingSlots > 1 ? 's' : ''} remaining)`}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Users className="h-4 w-4" />
      )}
    </Button>
  )
})

OptimizedJoinInterviewButton.displayName = 'OptimizedJoinInterviewButton'

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
  interviewAssignments?: any[]
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

const PROVINCE_DATA = {
  kigali: {
    name: 'Kigali City',
    icon: '🏛️',
    districts: ['Gasabo', 'Nyarugenge', 'Kigali City']
  },
  northern: {
    name: 'Northern Province',
    icon: '🏔️',
    districts: ['Burera', 'Gicumbi', 'Musanze', 'Rulindo']
  },
  southern: {
    name: 'Southern Province',
    icon: '🌾',
    districts: ['Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyaruguru', 'Ruhango']
  },
  eastern: {
    name: 'Eastern Province',
    icon: '🌅',
    districts: ['Bugesera', 'Kayonza', 'Nyagatare', 'Rwamagana']
  },
  western: {
    name: 'Western Province',
    icon: '🌊',
    districts: ['Karongi', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro']
  }
}

export default function ProvinceApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const lang = params?.lang as string || 'en'
  const provinceId = params?.provinceId as string
  
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'SUBMITTED' | 'INTERVIEW_INVITED' | 'INTERVIEWED'>('SUBMITTED')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Bulk actions state
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false)
  const [bulkEmailSubject, setBulkEmailSubject] = useState('')
  const [bulkEmailMessage, setBulkEmailMessage] = useState('')
  const [isInvitingToInterview, setIsInvitingToInterview] = useState(false)

  const provinceData = PROVINCE_DATA[provinceId as keyof typeof PROVINCE_DATA]
  
  // Debug: Log page initialization
  console.log('🏛️ ProvinceApplicationsPage initialized')
  console.log('📍 Province ID:', provinceId)
  console.log('🏛️ Province Data:', provinceData)
  console.log('👤 User:', user)

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Fetching applications for province:', provinceId)
      console.log('🏛️ Province data:', provinceData)
      console.log('📍 Province districts:', provinceData?.districts)
      const response = await fetch(`/api/v1/applications/dashboard?limit=9999&page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApplicationsResponse = await response.json()
      
      if (data.success) {
        console.log(`📊 Total applications fetched from API: ${data.data.length}`)
        console.log(`📊 Expected total applications: 2203`)
        console.log(`📊 API Response success: ${data.success}`)
        console.log(`📊 API Response pagination:`, data.pagination)
        console.log(`📊 API Response meta:`, data.meta)
        
        // Debug: Check if we're getting the expected number of applications
        if (data.data.length < 2000) {
          console.warn(`⚠️ WARNING: API returned only ${data.data.length} applications, expected ~2203`)
          console.warn(`⚠️ This suggests the API might be filtering applications or there's a permission issue`)
          console.warn(`⚠️ User role from API: ${data.meta?.userRole || 'Unknown'}`)
          console.warn(`⚠️ Total applications from API meta: ${data.meta?.totalApplications || 'Unknown'}`)
        }
        
        // Debug: Log all unique districts found in applications
        const allDistricts = new Set()
        data.data.forEach(app => {
          const formData = app.formData || {}
          if (formData.district) {
            allDistricts.add(formData.district)
          }
        })
        console.log('🔍 All districts found in applications:', Array.from(allDistricts).sort())
        
        // Debug: Count applications without district data
        const appsWithoutDistrict = data.data.filter(app => {
          const formData = app.formData || {}
          return !formData.district
        })
        console.log(`⚠️ Applications without district data: ${appsWithoutDistrict.length}`)
        
        // Filter applications for this province
        const provinceApplications = data.data.filter(app => {
          const formData = app.formData || {}
          const appDistrict = formData.district
          if (!appDistrict) return false
          
          const matches = provinceData.districts.some(district => 
            appDistrict.toLowerCase() === district.toLowerCase()
          )
          
          if (matches) {
            console.log(`✅ Found application from ${appDistrict} (matches ${provinceData.name})`)
          }
          
          return matches
        })
        
        console.log(`✅ Fetched ${provinceApplications.length} applications for ${provinceData.name}`)
        console.log(`📊 Expected districts for ${provinceData.name}:`, provinceData.districts)
        
        // Debug: Show breakdown by district
        const districtBreakdown = {}
        provinceData.districts.forEach(district => {
          districtBreakdown[district] = provinceApplications.filter(app => {
            const formData = app.formData || {}
            return formData.district && formData.district.toLowerCase() === district.toLowerCase()
          }).length
        })
        console.log(`📋 District breakdown for ${provinceData.name}:`, districtBreakdown)
        
        // Debug: Show specific Northern Province debugging
        if (provinceId === 'northern') {
          console.log('🏔️ NORTHERN PROVINCE DEBUG:')
          console.log(`🏔️ Expected districts: ${provinceData.districts.join(', ')}`)
          console.log(`🏔️ Total applications before filtering: ${data.data.length}`)
          console.log(`🏔️ Applications after Northern Province filtering: ${provinceApplications.length}`)
          
          // Check each Northern Province district specifically
          provinceData.districts.forEach(district => {
            const districtApps = data.data.filter(app => {
              const formData = app.formData || {}
              return formData.district && formData.district.toLowerCase() === district.toLowerCase()
            })
            console.log(`🏔️ ${district}: ${districtApps.length} applications`)
          })
        }
        
        // Debug: Test without filtering to see total applications
        console.log(`🔍 Total applications before province filtering: ${data.data.length}`)
        console.log(`🔍 Applications after province filtering: ${provinceApplications.length}`)
        
        setApplications(provinceApplications)
      } else {
        throw new Error('Failed to fetch applications')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('❌ Error fetching applications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (provinceId && provinceData) {
      fetchApplications()
    }
  }, [provinceId, activeTab])

  const getStatusConfig = (status: string) => {
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
        icon: Users,
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
  }

  const getApplicantName = (application: Application) => {
    const formData = application.formData || {}
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
    return application.applicantName
  }

  const filteredApplications = useMemo(() => {
    // Show ALL applications including admin applications, but filter by status
    console.log(`📊 Total applications available: ${applications.length}`)
    
    // Debug: Show status breakdown for ALL applications
    const statusBreakdown = {}
    applications.forEach(app => {
      statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1
    })
    console.log('📊 Status breakdown for Northern Province (ALL applications):', statusBreakdown)
    console.log(`📊 Active tab: ${activeTab}`)
    
    // Filter by status but include admin applications
    const statusFilteredApps = applications.filter(app => app.status === activeTab)
    console.log(`📊 Applications with status '${activeTab}': ${statusFilteredApps.length}`)
    
    return statusFilteredApps
  }, [applications, activeTab])

  // Pagination calculations
  const totalApplications = filteredApplications.length
  const totalPages = Math.ceil(totalApplications / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex)

  // Reset to first page and clear selections when activeTab changes
  useEffect(() => {
    setCurrentPage(1)
    setSelectedApplications([])
  }, [activeTab])

  const districtCounts = useMemo(() => {
    const counts: { [key: string]: number } = {}
    provinceData.districts.forEach(district => {
      counts[district] = applications.filter(app => {
        const formData = app.formData || {}
        const appDistrict = formData.district
        return appDistrict && 
               appDistrict.toLowerCase() === district.toLowerCase()
      }).length
    })
    return counts
  }, [applications, provinceData.districts])

  // Bulk action handlers
  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedApplications.length === paginatedApplications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(paginatedApplications.map(app => app.id))
    }
  }

  const handleBulkEmail = async () => {
    if (selectedApplications.length === 0) return
    
    setBulkActionLoading(true)
    try {
      const response = await fetch('/api/v1/applications/bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          applicationIds: selectedApplications,
          subject: bulkEmailSubject,
          message: bulkEmailMessage,
          type: 'interview_reminder'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Email sent to ${selectedApplications.length} applicants`,
        })
        setShowBulkEmailDialog(false)
        setSelectedApplications([])
        setBulkEmailSubject('')
        setBulkEmailMessage('')
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send emails",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error sending bulk email:', error)
      toast({
        title: "Error",
        description: "Failed to send emails",
        variant: "destructive",
      })
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkReschedule = async () => {
    if (selectedApplications.length === 0) return
    
    setBulkActionLoading(true)
    try {
      const response = await fetch('/api/v1/applications/bulk-reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          applicationIds: selectedApplications,
          action: 'reschedule_interview'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Rescheduled ${selectedApplications.length} interviews`,
        })
        setSelectedApplications([])
        fetchApplications()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reschedule interviews",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error rescheduling interviews:', error)
      toast({
        title: "Error",
        description: "Failed to reschedule interviews",
        variant: "destructive",
      })
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkInviteToInterview = async () => {
    if (selectedApplications.length === 0) return
    
    setIsInvitingToInterview(true)
    try {
      // Invite each selected application to interview
      const results = await Promise.allSettled(
        selectedApplications.map(async (applicationId) => {
          const response = await fetch("/api/v1/applications/invite-to-interview", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              applicationId
            })
          })

          const data = await response.json()
          
          // Handle different response statuses
          if (response.ok && data.success) {
            return { applicationId, success: true, message: data.message }
          } else if (response.status === 409) {
            // Interview already exists - this is not necessarily an error
            return { applicationId, success: true, message: "Interview already exists" }
          } else {
            return { applicationId, success: false, message: data.message || "Failed to invite" }
          }
        })
      )

      // Count successes and failures
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length
      const failed = results.length - successful

      // Refresh applications list
      await fetchApplications()

      // Clear selection
      setSelectedApplications([])

      // Show results
      if (successful > 0 && failed === 0) {
        toast({
          title: "Success",
          description: `Successfully invited ${successful} application${successful > 1 ? 's' : ''} to interview`,
        })
      } else if (successful > 0 && failed > 0) {
        toast({
          title: "Partial Success",
          description: `Invited ${successful} application${successful > 1 ? 's' : ''} to interview, ${failed} failed`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to invite ${failed} application${failed > 1 ? 's' : ''} to interview`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error inviting to interview:', error)
      toast({
        title: "Error",
        description: "Failed to invite applications to interview",
        variant: "destructive",
      })
    } finally {
      setIsInvitingToInterview(false)
    }
  }

  if (!provinceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="container mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Province Not Found</h3>
                  <p className="text-red-600">The requested province does not exist.</p>
                </div>
                <Button onClick={() => router.push(`/${lang}/dashboard/applications`)} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Applications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <p className="text-slate-600 font-medium">Loading applications for {provinceData.name}...</p>
            </div>
          </div>
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
                </div>
                <Button onClick={fetchApplications} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/${lang}/dashboard/applications`)}
                className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{provinceData.icon}</span>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-1">
                    {provinceData.name}
                  </h1>
                  <p className="text-slate-600 text-base">Applications by District</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={fetchApplications} 
                disabled={loading} 
                variant="outline" 
                size="sm"
                className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>


        {/* Status Breakdown */}
        <Card className="bg-white border border-gray-100 rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800">
              <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                📊
              </div>
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                <div className="text-3xl font-bold text-blue-600 mb-2">{applications.filter(app => app.status === 'SUBMITTED').length}</div>
                <div className="text-sm font-medium text-gray-700">Submitted</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                <div className="text-3xl font-bold text-blue-600 mb-2">{applications.filter(app => app.status === 'INTERVIEW_INVITED').length}</div>
                <div className="text-sm font-medium text-gray-700">Interview Invited</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                <div className="text-3xl font-bold text-blue-600 mb-2">{applications.filter(app => app.status === 'INTERVIEWED').length}</div>
                <div className="text-sm font-medium text-gray-700">Interviewed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Province Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
                </div>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Districts</p>
                  <p className="text-3xl font-bold text-gray-900">{provinceData.districts.length}</p>
                </div>
                <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Submitted</p>
                  <p className="text-3xl font-bold text-gray-900">{applications.filter(app => app.status === 'SUBMITTED').length}</p>
                </div>
                <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Interviewed</p>
                  <p className="text-3xl font-bold text-gray-900">{applications.filter(app => app.status === 'INTERVIEWED').length}</p>
                </div>
                <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* District Breakdown */}
        <Card className="bg-white border border-gray-100 rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800">
              <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              Applications by District
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {provinceData.districts.map(district => (
                <div key={district} className="p-5 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-base">{district}</h3>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-medium px-2 py-1 text-xs">
                      {districtCounts[district]} applications
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {districtCounts[district] > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Submitted:</span>
                          <span className="font-semibold text-blue-600">{applications.filter(app => {
                            const formData = app.formData || {}
                            const appDistrict = formData.district
                            return appDistrict && 
                                   appDistrict.toLowerCase() === district.toLowerCase() && 
                                   app.status === 'SUBMITTED'
                          }).length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Interviewed:</span>
                          <span className="font-semibold text-green-600">{applications.filter(app => {
                            const formData = app.formData || {}
                            const appDistrict = formData.district
                            return appDistrict && 
                                   appDistrict.toLowerCase() === district.toLowerCase() && 
                                   app.status === 'INTERVIEWED'
                          }).length}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No applications</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card className="bg-white border border-gray-100 rounded-xl">
          <CardHeader className="bg-gray-50 rounded-t-xl border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800">
                <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                Applications
                {selectedApplications.length > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {selectedApplications.length} selected
                  </Badge>
                )}
              </CardTitle>
              <div className="flex flex-col lg:flex-row items-center gap-4">
                {/* Bulk Actions for SUBMITTED tab */}
                {activeTab === 'SUBMITTED' && selectedApplications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkInviteToInterview}
                      disabled={isInvitingToInterview}
                      className="border-green-200 text-green-600 hover:bg-green-50"
                    >
                      {isInvitingToInterview ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Inviting...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Invite to Interview
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApplications([])}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}
                {/* Bulk Actions for INTERVIEW_INVITED tab */}
                {activeTab === 'INTERVIEW_INVITED' && selectedApplications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkEmailDialog(true)}
                      disabled={bulkActionLoading}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Send Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkReschedule}
                      disabled={bulkActionLoading}
                      className="border-orange-200 text-orange-600 hover:bg-orange-50"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Reschedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApplications([])}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                  <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-lg p-1">
                    <TabsTrigger 
                      value="SUBMITTED"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 border rounded-md transition-colors hover:bg-gray-50 font-medium"
                    >
                      Submitted
                    </TabsTrigger>
                    <TabsTrigger 
                      value="INTERVIEW_INVITED"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 border rounded-md transition-colors hover:bg-gray-50 font-medium"
                    >
                      Invited
                    </TabsTrigger>
                    <TabsTrigger 
                      value="INTERVIEWED"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 border rounded-md transition-colors hover:bg-gray-50 font-medium"
                    >
                      Interviewed
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paginatedApplications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-3">
                  No {activeTab.toLowerCase()} applications found
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  There are no {activeTab.toLowerCase()} applications in {provinceData.name} at this time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {(activeTab === 'SUBMITTED' || activeTab === 'INTERVIEW_INVITED') && (
                        <th className="px-6 py-4 text-left">
                          <input
                            type="checkbox"
                            checked={selectedApplications.length === paginatedApplications.length && paginatedApplications.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Applicant</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      {activeTab === 'INTERVIEW_INVITED' && (
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Interview Progress</th>
                      )}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">District</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date Applied</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedApplications.map((application) => {
                      const statusConfig = getStatusConfig(application.status)
                      const StatusIcon = statusConfig.icon
                      
                      return (
                        <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                          {(activeTab === 'SUBMITTED' || activeTab === 'INTERVIEW_INVITED') && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedApplications.includes(application.id)}
                                onChange={() => handleSelectApplication(application.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                                  <span className="text-sm font-semibold text-blue-700">
                                    {getApplicantName(application).charAt(0) || 'A'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {getApplicantName(application)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`${statusConfig.color} border-0 font-medium text-xs px-2 py-1`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </td>
                          {activeTab === 'INTERVIEW_INVITED' && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {(() => {
                                    const interviewAssignments = application.interviewAssignments || []
                                    const joinedInterviewers = interviewAssignments.length
                                    const maxInterviewers = 2
                                    const currentUserId = user?.id
                                    const hasUserJoined = interviewAssignments.some(assignment => assignment.interviewerId === currentUserId)
                                    
                                    return (
                                      <>
                                        <div className="flex items-center gap-1">
                                          {Array.from({ length: maxInterviewers }, (_, i) => (
                                            <div
                                              key={i}
                                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                                i < joinedInterviewers
                                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                                  : 'bg-gray-100 text-gray-400 border border-gray-200'
                                              }`}
                                            >
                                              {i < joinedInterviewers ? '✓' : i + 1}
                                            </div>
                                          ))}
                                        </div>
                                        <span className="text-xs text-gray-600">
                                          {joinedInterviewers}/{maxInterviewers}
                                        </span>
                                        {hasUserJoined && (
                                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                            You joined
                                          </Badge>
                                        )}
                                      </>
                                    )
                                  })()}
                                </div>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {application.formData?.district || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {application.applicantPhone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(application.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                onClick={() => router.push(`/${lang}/dashboard/applications/${application.id}`)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              
                              {application.status === 'INTERVIEW_INVITED' && (
                                <OptimizedJoinInterviewButton
                                  application={application}
                                  onRefresh={fetchApplications}
                                  getApplicantName={getApplicantName}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-4 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="text-sm text-gray-700 text-center sm:text-left">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endIndex, totalApplications)}</span> of{' '}
                      <span className="font-medium">{totalApplications}</span> applications
                    </div>
                    <div className="flex items-center space-x-2">
                      <label htmlFor="rows-per-page" className="text-sm text-gray-700">Rows per page:</label>
                      <select
                        id="rows-per-page"
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {/* Mobile: Show only Previous/Next */}
                    <div className="flex sm:hidden items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3"
                      >
                        ←
                      </Button>
                      <span className="text-sm text-gray-700 px-2">
                        {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3"
                      >
                        →
                      </Button>
                    </div>
                    
                    {/* Desktop: Show full pagination */}
                    <div className="hidden sm:flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                              }
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Next
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Email Dialog */}
        <Dialog open={showBulkEmailDialog} onOpenChange={setShowBulkEmailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Bulk Email</DialogTitle>
              <DialogDescription>
                Send an email to {selectedApplications.length} selected applicants
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  id="email-subject"
                  type="text"
                  value={bulkEmailSubject}
                  onChange={(e) => setBulkEmailSubject(e.target.value)}
                  placeholder="Interview Reminder"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email-message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="email-message"
                  value={bulkEmailMessage}
                  onChange={(e) => setBulkEmailMessage(e.target.value)}
                  placeholder="Dear Applicant, this is a reminder about your upcoming interview..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkEmailDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleBulkEmail} 
                disabled={bulkActionLoading || !bulkEmailSubject.trim() || !bulkEmailMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {bulkActionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
