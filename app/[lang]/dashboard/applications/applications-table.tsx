'use client'

import * as React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Application, ApplicationEvaluation } from "@prisma/client"
import { MoreHorizontal, Eye, Edit, Trash, Brain, User2, ChevronDown, FileText, ChevronsUpDown, ArrowUpDown, Mail, X, MapPin, Loader2, MessageSquare, Search, Filter, Users, UserPlus, CheckCircle, Settings, Download, RefreshCw, Columns, SortAsc, SortDesc, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Checkbox
} from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { AssignInterviewersModal } from "@/components/interviews/AssignInterviewersModal"
import JoinInterviewButton from "@/components/interviews/JoinInterviewButton"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ApplicationStatus = 'TEMPORARY' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_DOCUMENTS' | 'APPROVED' | 'REJECTED' | 'INTERVIEW_INVITED' | 'INTERVIEWED';

interface ApplicationWithRelations extends Application {
  user: {
    id: string
    name: string | null
    email: string | null
  } | null
  evaluations: {
    id: string
    score: number
    type: string
    createdAt: Date
  }[]
  interviewScores?: {
    id: string
    totalScore: number
    totalPossibleScore: number
    overallScore: string
    scores: Record<string, number>
    submittedAt: Date
    submittedBy: string
  }[]
  formData: {
    [key: string]: any
  }
  createdAt: Date
  updatedAt: Date
  totalScore?: number
  // Pre-extracted form data for performance
  phoneNumber?: string
  district?: string
  sector?: string
  age?: string
  gender?: string
  education?: string
  vulnerabilityCategory: string | null
}

interface ApplicationsTableProps {
  applications: ApplicationWithRelations[]
  onViewApplication?: (id: string) => void
  onSendBulkEmail?: (applications: ApplicationWithRelations[]) => void
  onInviteToInterview?: (applications: ApplicationWithRelations[]) => void
  onRefresh?: () => void
  loading?: boolean
  isInvitingToInterview?: boolean
  userRole?: string
  showActionsColumn?: boolean
  isInterviewedTab?: boolean // Add this prop to identify interviewed applications tab
  isAllApplicationsTab?: boolean // Add this prop to identify all applications tab
}

// TEMPORARY: Force refresh - Updated at 2024-12-19 15:30:00
export default function ApplicationsTable({ 
  applications,
  onViewApplication,
  onSendBulkEmail,
  onInviteToInterview,
  onRefresh,
  loading,
  isInvitingToInterview,
  userRole,
  showActionsColumn = false,
  isInterviewedTab = false,
  isAllApplicationsTab = false
}: ApplicationsTableProps) {
  
  // Debug logging for interviewed tab
  if (isInterviewedTab && applications.length > 0) {
    console.log('🔍 ApplicationsTable - Received applications:', applications.length)
    console.log('🔍 ApplicationsTable - Sample applications:', applications.slice(0, 3).map(app => ({
      id: app.id,
      totalScore: app.totalScore,
      hasTotalScore: 'totalScore' in app
    })))
  }
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [groupByStatus, setGroupByStatus] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAssigningInterviewers, setIsAssigningInterviewers] = useState(false)
  const [selectedApplicationsForInterview, setSelectedApplicationsForInterview] = useState<ApplicationWithRelations[]>([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false)
  const [bulkEmailSubject, setBulkEmailSubject] = useState('')
  const [bulkEmailMessage, setBulkEmailMessage] = useState('')
  const [isSendingBulkEmail, setIsSendingBulkEmail] = useState(false)
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false)
  const [smsMessage, setSmsMessage] = useState("")
  const [isSendingSms, setIsSendingSms] = useState(false)
  const [showJoinInterviewDialog, setShowJoinInterviewDialog] = useState(false)
  const [selectedApplicationForJoin, setSelectedApplicationForJoin] = useState<ApplicationWithRelations | null>(null)
  const [isJoiningInterview, setIsJoiningInterview] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const lang = (params as any)?.lang || 'en'
  const { user } = useAuth()

  // Simple tabs for status groups
  type TabKey = 'SUBMITTED' | 'INTERVIEW_INVITED' | 'INTERVIEWED'
  const [activeTab, setActiveTab] = useState<TabKey>('SUBMITTED')

  const displayedApplications = useMemo(() => {
    if (!applications || applications.length === 0) return []
    // Map tabs to statuses
    const statusMap: Record<typeof activeTab, ApplicationStatus> = {
      SUBMITTED: 'SUBMITTED',
      INTERVIEW_INVITED: 'INTERVIEW_INVITED',
      INTERVIEWED: 'INTERVIEWED',
    }
    const status = statusMap[activeTab]
    return applications.filter(app => app.status === status)
  }, [applications, activeTab])

  // CSV export helper moved below table initialization

  // Memoized utility functions
  const getStatusColor = useCallback((status: string) => {
    const colors: Record<string, string> = {
      'TEMPORARY': 'bg-gray-100 text-gray-800',
      'SUBMITTED': 'bg-blue-100 text-blue-800',
      'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
      'PENDING_DOCUMENTS': 'bg-orange-100 text-orange-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'INTERVIEW_INVITED': 'bg-purple-100 text-purple-800',
      'INTERVIEWED': 'bg-indigo-100 text-indigo-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }, [])

  const getAIScoreBadge = useCallback((score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }, [])

  const getInitials = useCallback((name: string | null = '') => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [])

  const getApplicantName = useCallback((application: ApplicationWithRelations): string => {
    // Use pre-extracted data if available
    if (application.user?.name) {
      return application.user.name
    }
    
    // Fallback to form data
    const formData = application.formData
    if (!formData) return 'Unknown'
    
    // Try multiple name field combinations in order of preference
    // Priority 1: Database format - q1 (first name) + q2 (last name)
    if (formData.q1 && formData.q2) {
      return `${formData.q1} ${formData.q2}`.trim()
    }
    // Priority 2: Google Sheets format - First Name + Last Name
    else if (formData['First Name'] && formData['Last Name']) {
      return `${formData['First Name']} ${formData['Last Name']}`.trim()
    }
    // Priority 3: Google Sheets format - First Name + Lat Name (typo)
    else if (formData['First Name'] && formData['Lat Name']) {
      return `${formData['First Name']} ${formData['Lat Name']}`.trim()
    }
    // Priority 4: Direct firstName/lastName fields
    else if (formData.firstName && formData.lastName) {
      return `${formData.firstName} ${formData.lastName}`.trim()
    }
    // Priority 5: Single name fields
    else if (formData['Full Name']) {
      return formData['Full Name']
    }
    else if (formData['Applicant Name']) {
      return formData['Applicant Name']
    }
    else if (formData.name) {
      return formData.name
    }
    else if (formData.fullName) {
      return formData.fullName
    }
    // Priority 6: Just first name fields
    else if (formData.q1) {
      return formData.q1
    }
    else if (formData['First Name']) {
      return formData['First Name']
    }
    else if (formData.firstName) {
      return formData.firstName
    }
    
    return 'Unknown'
  }, [])

  const getApplicantLocation = useCallback((application: ApplicationWithRelations): string => {
    if (!application?.formData) return 'Unknown'
    
    // Try different possible field names for district
    const formData = application.formData
    const possibleFields = [
      'district',
      'District', 
      'DISTRICT',
      'location.district',
      'address.district',
      'q11.district',
      'location',
      'address'
    ]
    
    for (const field of possibleFields) {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        if (formData[parent] && typeof formData[parent] === 'object') {
          const value = formData[parent][child]
          if (value && typeof value === 'string' && value.trim()) {
            return value.trim()
          }
        }
      } else {
        const value = formData[field]
        if (value && typeof value === 'string' && value.trim()) {
          return value.trim()
        }
      }
    }
    
    return 'Unknown'
  }, [])

  const getEducationInfo = useCallback((application: ApplicationWithRelations) => {
    // Use pre-extracted data if available
    if (application.education) {
      return application.education
    }
    
    const formData = application.formData
    if (!formData) return 'Unknown'
    
    return formData['Education'] || formData['education'] || 'Unknown'
  }, [])

  const handleJoinInterviewClick = useCallback((application: ApplicationWithRelations) => {
    const interviewScores = application.interviewScores || []
    const joinedInterviewers = interviewScores.length
    const maxInterviewers = 2
    const canJoin = joinedInterviewers < maxInterviewers

    // Check if current user has already joined this interview
    const currentUserId = user?.id
    const hasUserJoined = interviewScores.some(score => score.submittedBy === currentUserId)

    if (hasUserJoined) {
      // User has already joined, navigate directly to interview
      const lang = (params as any)?.lang || 'en'
      if (lang && application.id) {
        router.push(`/${lang}/dashboard/interviews/${application.id}`)
      }
    } else if (canJoin) {
      // User hasn't joined and slots are available, show confirmation dialog
      setSelectedApplicationForJoin(application)
      setShowJoinInterviewDialog(true)
    }
  }, [user?.id, lang, router])

  const handleConfirmJoinInterview = async () => {
    if (!selectedApplicationForJoin) return

    setIsJoiningInterview(true)
    try {
      // For now, directly navigate to interview page
      const lang = (params as any)?.lang || 'en'
      if (lang && selectedApplicationForJoin.id) {
        setShowJoinInterviewDialog(false)
        router.push(`/${lang}/dashboard/interviews/${selectedApplicationForJoin.id}`)
      }
    } catch (error) {
      console.error('Error navigating to interview:', error)
      toast({
        title: "Error",
        description: "An error occurred while navigating to the interview.",
        variant: "destructive",
      })
    } finally {
      setIsJoiningInterview(false)
    }
  }

  // Memoized columns definition
  const columns: ColumnDef<ApplicationWithRelations>[] = useMemo(() => {
    const baseColumns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "user",
      header: "Applicant",
      cell: ({ row }) => {
        const application = row.original
        const name = getApplicantName(application)
        const email = application.user?.email
        
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{name}</span>
            {email && (
              <span className="text-xs text-muted-foreground">
                {email}
              </span>
            )}
          </div>
        )
      },
    },

    {
      accessorKey: "location",
      header: "District",
      cell: ({ row }) => {
        const application = row.original
        const location = application.district || 
                        getApplicantLocation(application)
        return (
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{location}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "sector",
      header: "Sector",
      cell: ({ row }) => {
        const application = row.original
        const sector = application.sector || 
                      application.formData?.Sector || 
                      application.formData?.sector ||
                      'Unknown'
        return <span className="text-sm">{sector}</span>
      },
    },
    ]

        // Add conditional columns based on tab type
    if (!isInterviewedTab && !showActionsColumn) {
      // Regular columns for non-interviewed applications (All Applications tab only)
      baseColumns.push(
    {
      accessorKey: "vulnerabilityCategory",
      header: "Category",
      cell: ({ row }) => {
        const application = row.original
        const formData = application.formData || {}
        
        // Debug: Log what we're working with
        console.log('🔍 Category Column - Application ID:', application.id)
        console.log('🔍 Category Column - Pre-extracted vulnerabilityCategory:', application.vulnerabilityCategory)
        console.log('🔍 Category Column - Form Data Keys:', Object.keys(formData))
        
        // Try multiple possible field names for category
        const category = application.vulnerabilityCategory || 
                        formData['Vulnerability Category'] || 
                        formData.vulnerabilityCategory ||
                        formData.category ||
                        formData['Category'] ||
                        formData['Vulnerability'] ||
                        formData.vulnerability ||
                        formData['vulnerability category'] ||
                        formData['Vulnerability category'] ||
                        'Unknown'
        
        console.log('🔍 Category Column - Final category value:', category)
        
        return <span className="text-sm">{category}</span>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge className={getStatusColor(status)}>
            {status.replace('_', ' ')}
          </Badge>
        )
      },
    },
        ...(isAllApplicationsTab ? [{
      accessorKey: "totalScore",
      header: "System scores",
      cell: ({ row }) => {
        const application = row.original
        const formData = application.formData || {}
        
        // Debug logging
        console.log('🔍 All Apps System Score - Application ID:', application.id)
        console.log('🔍 All Apps System Score - Pre-extracted totalScore:', application.totalScore)
        console.log('🔍 All Apps System Score - Pre-extracted applicationScore:', application.applicationScore)
        console.log('🔍 All Apps System Score - Google Sheets Total Score:', formData['Total Score'])
        
        // Primary source: Database application_score field
        let score = application.applicationScore || 0
        
        // Fallback: Try to get score directly from form data
        if (!score && formData && formData['Total Score'] !== undefined) {
          score = Number(formData['Total Score']) || 0
          console.log('🔍 All Apps System Score - Using formData Total Score:', score)
        }
        
        // Last resort: Try other score fields
        if (!score && formData) {
          score = Number(formData['totalScore']) || 
                  Number(formData['Score']) || 
                  Number(formData.score) || 
                  0
          if (score > 0) {
            console.log('🔍 All Apps System Score - Using alternative formData score:', score)
          }
        }
        
        // Final fallback: Evaluations
        if (!score && application.evaluations && application.evaluations.length > 0) {
          score = application.evaluations[0].score || 0
          console.log('🔍 All Apps System Score - Using evaluation score:', score)
        }
        
        if (!score || score === 0) return <span className="text-muted-foreground">-</span>
        
        return (
          <Badge className={getAIScoreBadge(score * 2.5)}>
            {score.toFixed(1)}/40
          </Badge>
        )
      },
        }] : [])
      )
    } else if (showActionsColumn && !isInterviewedTab) {
      // Interview Invited tab - no category column, add join interview functionality
      baseColumns.push(
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
              <Badge className={getStatusColor(status)}>
                {status.replace('_', ' ')}
              </Badge>
            )
          },
        },
        {
          accessorKey: "totalScore",
          header: "System Score",
          cell: ({ row }) => {
            const application = row.original
            
            // Debug logging
            console.log('🔍 System Score Column - Application ID:', application.id)
            console.log('🔍 System Score Column - System Score from Google Sheets:', application.totalScore)
            
            // System Score should only show the value from Google Sheets "Total Score"
            const systemScore = application.totalScore
            
            if (!systemScore || systemScore === 0) return <span className="text-muted-foreground">-</span>
            
            // Convert to out of 40 scale
            const systemScoreOutOf40 = (systemScore / 100) * 40
            
            return (
              <Badge className={getAIScoreBadge(systemScore)}>
                {systemScoreOutOf40.toFixed(1)}/40
              </Badge>
            )
          },
        }
      )
    } else {
      // Special columns for interviewed applications
      baseColumns.push(
        {
          accessorKey: "interview1Score",
          header: "Interview 1 Score",
          cell: ({ row }) => {
            const application = row.original
            const interviewScores = application.interviewScores || []
            
            // Get the first interview score
            const firstInterview = interviewScores[0]
            if (!firstInterview) return <span className="text-muted-foreground">-</span>
            
            const originalScore = firstInterview.totalScore || 0
            const totalPossibleScore = firstInterview.totalPossibleScore || 100
            
            // Convert score to out of 30 scale
            const scoreOutOf30 = (originalScore / totalPossibleScore) * 30
            const percentageOutOf30 = (scoreOutOf30 / 30) * 100
            
            return (
              <Badge className={getAIScoreBadge(percentageOutOf30)}>
                {scoreOutOf30.toFixed(1)}/30
              </Badge>
            )
          },
        },
        {
          accessorKey: "interview2Score",
          header: "Interview 2 Score",
          cell: ({ row }) => {
            const application = row.original
            const interviewScores = application.interviewScores || []
            
            // Get the second interview score
            const secondInterview = interviewScores[1]
            if (!secondInterview) return <span className="text-muted-foreground">-</span>
            
            const originalScore = secondInterview.totalScore || 0
            const totalPossibleScore = secondInterview.totalPossibleScore || 100
            
            // Convert score to out of 30 scale
            const scoreOutOf30 = (originalScore / totalPossibleScore) * 30
            const percentageOutOf30 = (scoreOutOf30 / 30) * 100
            
            return (
              <Badge className={getAIScoreBadge(percentageOutOf30)}>
                {scoreOutOf30.toFixed(1)}/30
              </Badge>
            )
          },
        },
        {
          accessorKey: "totalScore",
          header: "System Score",
          cell: ({ row }) => {
            const application = row.original
            const formData = application.formData || {}
            
            // Try to get score from multiple sources with improved priority
            let score = application.applicationScore || 0
            
            // If no pre-calculated score, try form data
            if (!score && formData) {
              // Priority 1: Google Sheets Total Score
              if (formData['Total Score'] !== undefined && formData['Total Score'] !== null) {
                score = Number(formData['Total Score']) || 0
              }
              // Priority 2: Alternative score fields
              else {
                score = Number(formData['totalScore']) || 
                      Number(formData['Score']) || 
                      Number(formData.score) || 
                      0
              }
            }
            
            // Fallback to evaluations if still no score
            if (!score && application.evaluations && application.evaluations.length > 0) {
              score = application.evaluations[0].score || 0
            }
            
            if (!score || score === 0) {
              return <span className="text-muted-foreground">-</span>
            }
            
            return (
              <Badge className={getAIScoreBadge(score * 2.5)}>
                {score.toFixed(1)}/40
              </Badge>
            )
          },
        },
        {
          accessorKey: "finalScore",
          header: "Final Score",
          cell: ({ row }) => {
            const application = row.original
            const interviewScores = application.interviewScores || []
            const formData = application.formData || {}
            
            // Get system score with improved priority
            let systemScore = application.applicationScore || application.totalScore || 0
            if (!systemScore && formData) {
              // Priority 1: Google Sheets Total Score
              if (formData['Total Score'] !== undefined && formData['Total Score'] !== null) {
                systemScore = Number(formData['Total Score']) || 0
              }
              // Priority 2: Alternative score fields
              else {
                systemScore = Number(formData['totalScore']) || 
                           Number(formData['Score']) || 
                           Number(formData.score) || 
                           0
              }
            }
            if (!systemScore && application.evaluations && application.evaluations.length > 0) {
              systemScore = application.evaluations[0].score || 0
            }
            
            // Convert system score to out of 40
            const systemScoreOutOf40 = (systemScore / 100) * 40
            
            // Calculate interview scores (out of 30 each)
            let interview1Score = 0
            let interview2Score = 0
            
            if (interviewScores.length > 0) {
              const firstInterview = interviewScores[0]
              if (firstInterview) {
                const originalScore = firstInterview.totalScore || 0
                const totalPossibleScore = firstInterview.totalPossibleScore || 100
                interview1Score = (originalScore / totalPossibleScore) * 30
              }
            }
            
            if (interviewScores.length > 1) {
              const secondInterview = interviewScores[1]
              if (secondInterview) {
                const originalScore = secondInterview.totalScore || 0
                const totalPossibleScore = secondInterview.totalPossibleScore || 100
                interview2Score = (originalScore / totalPossibleScore) * 30
              }
            }
            
            // Calculate final score: Interview 1 (30) + Interview 2 (30) + System Score (40) = 100 total
            const totalFinalScore = interview1Score + interview2Score + systemScoreOutOf40
            const totalPossibleFinalScore = 100 // 30 + 30 + 40
            
            const percentageOutOfTotal = (totalFinalScore / totalPossibleFinalScore) * 100
            
            return (
              <Badge className={getAIScoreBadge(percentageOutOfTotal)}>
                {totalFinalScore.toFixed(1)}/{totalPossibleFinalScore}
              </Badge>
            )
          },
        }
      )
    }

                // Add actions column if showActionsColumn is true and not interviewed tab
        if (showActionsColumn && !isInterviewedTab) {
          baseColumns.push({
      id: "actions",
            header: ({ table }) => (<span>Actions</span>),
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const application = row.original

        return (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewApplication?.(application.id)}
                  className="h-8 px-2"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )
            },
          })
        }

        // Add Join Interview column for Interview Invited tab
        if (showActionsColumn && !isInterviewedTab) {
          baseColumns.push({
            id: "joinInterview",
            header: ({ table }) => (<span>Join Interview</span>),
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => {
              const application = row.original
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
                    onClick={() => {
                      if (hasUserJoined) {
                        // User has already joined - open interview page
                        handleJoinInterviewClick(application)
                      } else if (canJoin) {
                        // User can join - show confirmation dialog
                        handleJoinInterviewClick(application)
                      }
                      // If full, button is disabled
                    }}
                    disabled={!canJoin && !hasUserJoined}
                    className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${
                      hasUserJoined
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' // User has joined
                        : canJoin 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' // Can join
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed' // Full
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
                        ? 'text-green-600' // User has joined
                        : joinedInterviewers === maxInterviewers 
                        ? 'text-green-600' // Full
                        : joinedInterviewers > 0 
                        ? 'text-blue-600' // Partially filled
                        : 'text-gray-500' // Empty
                    }`}>
                      {joinedInterviewers}/{maxInterviewers}
                    </span>
                    {hasUserJoined && (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                </div>
              )
            },
          })
        }

        return baseColumns
  }, [getApplicantName, getInitials, getStatusColor, getAIScoreBadge, getApplicantLocation, isInterviewedTab, showActionsColumn, onViewApplication, router, lang])

  // Render helpers
  const renderPageButtons = () => {
    const currentPage = table.getState().pagination.pageIndex
    const totalPages = table.getPageCount()
    const buttons: React.ReactNode[] = []

    if (currentPage > 2) {
      buttons.push(
        <Button
          key={0}
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
        >
          1
        </Button>
      )
      if (currentPage > 3) {
        buttons.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>)
      }
    }

    for (let i = Math.max(0, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => table.setPageIndex(i)}
          className={`h-8 w-8 p-0 ${
            i === currentPage 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i + 1}
        </Button>
      )
    }

    if (currentPage < totalPages - 3) {
      if (currentPage < totalPages - 4) {
        buttons.push(<span key="ellipsis2" className="px-2 text-gray-400">...</span>)
      }
      buttons.push(
        <Button
          key={totalPages - 1}
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(totalPages - 1)}
          className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
        >
          {totalPages}
        </Button>
      )
    }

    return buttons
  }

  // Memoized table instance
  const table = useReactTable({
    data: displayedApplications,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  // CSV export helper (defined after table to avoid use-before-assign)
  const exportFilteredRowsToCsv = useCallback(() => {
    try {
      const rows = table.getFilteredRowModel().rows
      if (!rows || rows.length === 0) {
        toast({ title: "No data", description: "There are no rows to export." })
        return
      }

      // Decide which columns to export (visible and not actions/select)
      const exportableColumns = table
        .getAllLeafColumns()
        .filter((col) => col.getIsVisible() && !['select', 'actions'].includes(col.id))

      const header = exportableColumns.map((c) => {
        const id = c.id
        if (id === 'user') return 'Name'
        if (id === 'status') return 'Status'
        if (id === 'phone') return 'Phone'
        if (id === 'district') return 'District'
        if (id === 'sector') return 'Sector'
        if (id === 'createdAt') return 'Created At'
        if (id === 'totalScore') return 'System Score (/40)'
        return id
      })

      const csvRows: string[] = []
      csvRows.push(header.join(','))

      for (const row of rows) {
        const values = exportableColumns.map((col) => {
          const original: any = row.original
          switch (col.id) {
            case 'user': {
              // Reuse name util
              // @ts-ignore - function defined below
              return JSON.stringify(getApplicantName(original))
            }
            case 'status':
              return JSON.stringify(original.status || '')
            case 'phone': {
              const phone =
                original.applicantPhone ||
                original.formData?.['Phone Number'] ||
                original.formData?.q10 ||
                original.formData?.q8 || ''
              return JSON.stringify(phone)
            }
            case 'district': {
              const district =
                original.district ||
                original.formData?.district ||
                original.formData?.q11?.district || ''
              return JSON.stringify(district)
            }
            case 'sector': {
              const sector =
                original.sector ||
                original.formData?.Sector ||
                original.formData?.sector || ''
              return JSON.stringify(sector)
            }
            case 'createdAt': {
              const d = original.createdAt ? new Date(original.createdAt) : null
              return JSON.stringify(d ? d.toISOString() : '')
            }
            case 'totalScore': {
              const score = Number(original.applicationScore || original.totalScore || 0)
              return JSON.stringify(score > 0 ? `${score.toFixed(1)}/40` : '')
            }
            default: {
              const v = (original as any)[col.id]
              return JSON.stringify(v ?? '')
            }
          }
        })
        csvRows.push(values.join(','))
      }

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      link.download = `applications-${timestamp}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast({ title: 'Exported', description: 'CSV download started.' })
    } catch (err) {
      console.error('CSV export failed', err)
      toast({ title: 'Export failed', description: 'Could not export CSV', variant: 'destructive' })
    }
  }, [table, toast])

  // Group applications by status
  const groupedApplications = useMemo(() => {
    if (!groupByStatus) {
      return { 'All Applications': applications }
    }

    const groups: { [key: string]: ApplicationWithRelations[] } = {}
    
    applications.forEach(app => {
      const status = app.status || 'UNKNOWN'
      if (!groups[status]) {
        groups[status] = []
      }
      groups[status].push(app)
    })

    // Sort groups by status priority
    const statusOrder = ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_INVITED', 'INTERVIEWED', 'APPROVED', 'REJECTED', 'PENDING_DOCUMENTS', 'UNKNOWN']
    const sortedGroups: { [key: string]: ApplicationWithRelations[] } = {}
    
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

  // Debug: Log filter state
  React.useEffect(() => {
    console.log("🔍 Current column filters:", columnFilters)
    console.log("🔍 Location filter value:", table.getColumn("location")?.getFilterValue())
    console.log("🔍 Total rows before filtering:", table.getCoreRowModel().rows.length)
    console.log("🔍 Total rows after filtering:", table.getFilteredRowModel().rows.length)
    
    // Debug: Check district values in first few applications
    console.log("🔍 Sample district values:")
    table.getCoreRowModel().rows.slice(0, 5).forEach((row, index) => {
      const app = row.original
      const district = app.district || app.formData?.district || app.formData?.District || 'No district'
      console.log(`${index + 1}. ${app.formData?.['First Name']} ${app.formData?.['Lat Name']} - District: "${district}"`)
    })
    
    // Debug: Check if location column exists and is configured correctly
    const locationColumn = table.getColumn("location")
    console.log("🔍 Location column exists:", !!locationColumn)
    if (locationColumn) {
      console.log("🔍 Location column enableColumnFilter:", locationColumn.columnDef.enableColumnFilter)
      console.log("🔍 Location column filterFn exists:", !!locationColumn.columnDef.filterFn)
    }
  }, [columnFilters, table])

  const selectedApplications = table.getFilteredSelectedRowModel().rows.map(row => row.original)

  // Debug: Log table state
  React.useEffect(() => {
    if (applications && applications.length > 0) {
      console.log("🔍 Table rows (should be pre-sorted by Total Score descending):")
      const tableRows = table.getRowModel().rows
      tableRows.slice(0, 10).forEach((row, index) => {
        const app = row.original
        const totalScore = app.formData?.['Total Score']
        console.log(`${index + 1}. ${app.formData?.['First Name']} ${app.formData?.['Lat Name']} - Score: ${totalScore}/100`)
      })
    }
  }, [applications, table]);

  function renderContent(): JSX.Element {
    return (
    <div className="w-full space-y-6">

      {/* Status Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="SUBMITTED">Submitted Applications</TabsTrigger>
            <TabsTrigger value="INTERVIEW_INVITED">Invited to Interview</TabsTrigger>
            <TabsTrigger value="INTERVIEWED">Interviewed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search applications..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-10 h-10 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefresh?.()}
                className="h-10 px-3 border-gray-200 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportFilteredRowsToCsv}
                className="h-10 px-3 border-gray-200 hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGlobalFilter("")
                  table.resetColumnFilters()
                }}
                className="h-10 px-3 border-gray-200 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 px-3 border-gray-200 hover:bg-gray-50">
                    <Columns className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id === 'user' ? 'Name' :
                           column.id === 'status' ? 'Status' :
                           column.id === 'phone' ? 'Phone' :
                           column.id === 'district' ? 'District' :
                           column.id === 'sector' ? 'Sector' :
                           column.id === 'createdAt' ? 'Date' :
                           column.id === 'totalScore' ? 'Score' :
                           column.id === 'actions' ? 'Actions' :
                           column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">
              Showing {table.getFilteredRowModel().rows.length} of {applications.length} applications
            </span>
            {groupByStatus && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Users className="h-3 w-3 mr-1" />
                Grouped by Status
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50/50">
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <Label className="text-sm font-medium text-gray-700">Search</Label>
          <Input
            placeholder="Search by name..."
            value={(table.getColumn("user")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("user")?.setFilterValue(event.target.value)
            }
            className="w-full sm:w-[250px] h-9 bg-white border-gray-200 focus:ring-blue-300"
          />
        </div>

        {!isInterviewedTab && (
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <Label className="text-sm font-medium text-gray-700">Status</Label>
          <Select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) => table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full sm:w-[200px] h-9 bg-white border-gray-200 hover:bg-gray-50/50 transition-colors">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all" className="text-gray-600">All Statuses</SelectItem>
              <SelectItem value="SUBMITTED" className="text-yellow-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  Submitted
                </div>
              </SelectItem>
              <SelectItem value="UNDER_REVIEW" className="text-blue-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  Under Review
                </div>
              </SelectItem>
              <SelectItem value="PENDING_DOCUMENTS" className="text-orange-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  Pending Documents
                </div>
              </SelectItem>
              <SelectItem value="APPROVED" className="text-green-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  Approved
                </div>
              </SelectItem>
              <SelectItem value="REJECTED" className="text-red-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  Rejected
                </div>
              </SelectItem>
              <SelectItem value="INTERVIEW_INVITED" className="text-purple-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  Interview Invited
                </div>
              </SelectItem>
              <SelectItem value="INTERVIEWED" className="text-indigo-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  Interviewed
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        )}

        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <Label className="text-sm font-medium text-gray-700">Sector</Label>
          <Select
            value={(table.getColumn("sector")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) => {
              const filterValue = value === "all" ? "" : value
              table.getColumn("sector")?.setFilterValue(filterValue)
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px] h-9 bg-white border-gray-200 hover:bg-gray-50/50 transition-colors">
              <SelectValue placeholder="Filter by sector" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all" className="text-gray-600">All Sectors</SelectItem>
              <SelectItem value="Muhoza" className="text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" />
                  Muhoza
                </div>
              </SelectItem>
              <SelectItem value="Rwaza" className="text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" />
                  Rwaza
                </div>
              </SelectItem>
              <SelectItem value="Nkotsi" className="text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" />
                  Nkotsi
                </div>
              </SelectItem>
              <SelectItem value="Busogo" className="text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" />
                  Busogo
                </div>
              </SelectItem>
              <SelectItem value="Rwimiyaga" className="text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" />
                  Rwimiyaga
                </div>
              </SelectItem>
              <SelectItem value="Rukomo" className="text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" />
                  Rukomo
                </div>
              </SelectItem>
              <SelectItem value="Nyagatare" className="text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" />
                  Nyagatare
                </div>
              </SelectItem>
              <SelectItem value="Karama" className="text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" />
                  Karama
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <Label className="text-sm font-medium text-gray-700">Category</Label>
          <Select
            value={(table.getColumn("vulnerabilityCategory")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) => {
              const filterValue = value === "all" ? "" : value
              table.getColumn("vulnerabilityCategory")?.setFilterValue(filterValue)
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px] h-9 bg-white border-gray-200 hover:bg-gray-50/50 transition-colors">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all" className="text-gray-600">All Categories</SelectItem>
              <SelectItem value="Level A" className="text-red-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  Level A
                </div>
              </SelectItem>
              <SelectItem value="Level B" className="text-orange-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  Level B
                </div>
              </SelectItem>
              <SelectItem value="Level C" className="text-yellow-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  Level C
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-grow" />

        <div className="flex flex-col gap-1 w-full sm:w-auto sm:self-end">
          <Button
            variant={groupByStatus ? "default" : "outline"}
            size="sm"
            onClick={() => setGroupByStatus(!groupByStatus)}
            className={`h-9 px-4 transition-colors ${
              groupByStatus 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'border-gray-200 hover:bg-gray-50/50 hover:text-gray-900 bg-white'
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            {groupByStatus ? 'Ungroup' : 'Group by Status'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.getColumn("user")?.setFilterValue("");
              table.getColumn("status")?.setFilterValue("");
              table.getColumn("sector")?.setFilterValue("");
              table.getColumn("vulnerabilityCategory")?.setFilterValue("");
            }}
            className="h-9 px-4 border-gray-200 hover:bg-gray-50/50 hover:text-gray-900 transition-colors bg-white"
          >
            <X className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
        </div>
      </div>

        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-gray-200">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead 
                        key={header.id}
                        className={`h-12 px-6 text-sm font-semibold text-gray-700 ${
                          header.column.getCanSort() ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          {header.column.getCanSort() && (
                            <div className="flex flex-col">
                              {header.column.getIsSorted() === 'asc' ? (
                                <SortAsc className="h-4 w-4 text-blue-600" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <SortDesc className="h-4 w-4 text-blue-600" />
                              ) : (
                                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {groupByStatus ? (
                Object.entries(groupedApplications).map(([status, statusApplications]) => (
                  <React.Fragment key={status}>
                    
                    <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                      <TableCell 
                        colSpan={columns.length}
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
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {statusApplications.length} applications
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    
                    {statusApplications.map((application, index) => {
                      const row = table.getRowModel().rows.find(r => r.original.id === application.id)
                      if (!row) return null
                      
                      return (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className={`border-b border-gray-100 ${
                            row.getIsSelected() ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell 
                              key={cell.id}
                              className="px-6 py-4 text-sm"
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      )
                    })}
                  </React.Fragment>
                ))
              ) : (
                (table.getPaginationRowModel().rows && table.getPaginationRowModel().rows.length > 0) ? (
                table.getPaginationRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`border-b border-gray-100 ${
                      row.getIsSelected() ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id}
                        className="px-6 py-4 text-sm"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">No applications found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-4">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} selected
            </span>
          </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-16 text-sm border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 mr-4">
            <span>
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              of {table.getFilteredRowModel().rows.length} entries
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 mx-2">{renderPageButtons()}</div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isSmsModalOpen} onOpenChange={setIsSmsModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Send SMS Message</DialogTitle>
            <DialogDescription>
              Send SMS to {table.getFilteredSelectedRowModel().rows.length} selected applicant(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sms-message" className="text-sm font-medium">
                Message
              </Label>
              <Textarea
                id="sms-message"
                placeholder="Enter your SMS message..."
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="mt-2"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                {smsMessage.length}/160 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Recipients</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {table.getFilteredSelectedRowModel().rows.map((row, index) => {
                  const app = row.original
                  const phone = app.formData?.['Phone Number'] || app.formData?.q10 || app.formData?.q8 || app.phone || 'No phone'
                  const name = getApplicantName(app)
                  return (
                    <div key={app.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                      <span className="font-medium">{name}</span>
                      <span className="text-gray-600">{phone}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSmsModalOpen(false)
                setSmsMessage("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!smsMessage.trim()) {
                  toast({
                    title: "Error",
                    description: "Please enter a message",
                    variant: "destructive",
                  })
                  return
                }
                
                setIsSendingSms(true)
                try {
                  const selectedApps = table.getFilteredSelectedRowModel().rows.map(row => row.original)
                  const phoneNumbers = selectedApps.map(app => {
                    return app.formData?.['Phone Number'] || app.formData?.q10 || app.formData?.q8 || app.phone
                  }).filter(Boolean)
                  
                  const results = [] as any[]
                  let successCount = 0
                  
                  for (const phoneNumber of phoneNumbers) {
                    try {
                      const response = await fetch('/api/send-sms', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          to: phoneNumber,
                          message: smsMessage
                        }),
                      })
                      
                      const result = await response.json()
                      
                      if (result.success) {
                        successCount++
                        results.push({
                          phone: phoneNumber,
                          success: true,
                          messageId: result.data?.messageId
                        })
                      } else {
                        results.push({
                          phone: phoneNumber,
                          success: false,
                          error: result.message
                        })
                      }
                    } catch (error: any) {
                      results.push({
                        phone: phoneNumber,
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                      })
                    }
                  }
                  
                  toast({
                    title: "SMS Results",
                    description: `Successfully sent to ${successCount}/${phoneNumbers.length} recipients`,
                  })
                  
                  setIsSmsModalOpen(false)
                  setSmsMessage("")
                  table.toggleAllPageRowsSelected(false)
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to send SMS. Please try again.",
                    variant: "destructive",
                  })
                } finally {
                  setIsSendingSms(false)
                }
              }}
              disabled={isSendingSms || !smsMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSendingSms ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send SMS
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showJoinInterviewDialog} onOpenChange={setShowJoinInterviewDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedApplicationForJoin && (() => {
                const currentUserId = user?.id
                const hasUserJoined = selectedApplicationForJoin.interviewScores?.some(score => score.submittedBy === currentUserId)
                return hasUserJoined ? (
                  <>
                    <Eye className="h-5 w-5 text-green-600" />
                    View Interview Session
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    Join Interview Session
                  </>
                )
              })()}
            </DialogTitle>
            <DialogDescription>
              {selectedApplicationForJoin && (() => {
                const currentUserId = user?.id
                const hasUserJoined = selectedApplicationForJoin.interviewScores?.some(score => score.submittedBy === currentUserId)
                return hasUserJoined 
                  ? "You have already joined this interview. You can view and continue the interview session."
                  : "You are about to join an interview session. This will occupy one of the available interview slots and you'll be able to conduct the interview."
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedApplicationForJoin && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <User2 className="h-4 w-4" />
                    Applicant Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="text-gray-900">{getApplicantName(selectedApplicationForJoin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">District:</span>
                      <span className="text-gray-900">{getApplicantLocation(selectedApplicationForJoin.formData)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Sector:</span>
                      <span className="text-gray-900">{selectedApplicationForJoin.sector || selectedApplicationForJoin.formData?.Sector || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">System Score:</span>
                      <span className="text-gray-900">
                        {(() => {
                          const formData = selectedApplicationForJoin.formData || {}
                          let score = selectedApplicationForJoin.totalScore || 0
                          if (!score && formData) {
                            score = Number(formData['Total Score']) || Number(formData['totalScore']) || Number(formData['Score']) || 0
                          }
                          return score > 0 ? `${score}%` : 'Not available'
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Interview Slots
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Available Slots:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-semibold">
                          {(selectedApplicationForJoin.interviewScores?.length || 0)}/2
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {2 - (selectedApplicationForJoin.interviewScores?.length || 0)} remaining
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Status:</span>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        Interview Invited
                      </Badge>
                    </div>
                    {(() => {
                      const currentUserId = user?.id
                      const hasUserJoined = selectedApplicationForJoin.interviewScores?.some(score => score.submittedBy === currentUserId)
                      return hasUserJoined && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Your Status:</span>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Joined
                          </Badge>
                        </div>
                      )
                    })()}
                  </div>
                </div>
                
                {(() => {
                  const currentUserId = user?.id
                  const hasUserJoined = selectedApplicationForJoin.interviewScores?.some(score => score.submittedBy === currentUserId)
                  return !hasUserJoined ? (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">Important:</p>
                          <p>Once you join, you'll be responsible for conducting the interview and submitting the evaluation. Make sure you have time available for the interview session.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm text-green-800">
                          <p className="font-medium mb-1">Ready to Continue:</p>
                          <p>You have already joined this interview. You can continue with the interview session or review previous evaluations.</p>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowJoinInterviewDialog(false)}
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
                  Opening...
                </>
              ) : (
                (() => {
                  const currentUserId = user?.id
                  const hasUserJoined = selectedApplicationForJoin?.interviewScores?.some(score => score.submittedBy === currentUserId)
                  return hasUserJoined ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      View Interview
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Interview
                    </>
                  )
                })()
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    )
  }
  return renderContent()
} 