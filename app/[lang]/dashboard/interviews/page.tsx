"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, ArrowRight, Calendar, User, Clock, CheckCircle, AlertCircle, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface Interview {
  id: string
  applicationId: string
  interviewerId: string
  interviewer?: {
    name: string
    email: string
  }
  applicant?: {
    name: string
    email: string
  }
  status: string
  scheduledAt?: string
  completedAt?: string
  overallScore?: number
  createdAt: string
}

export default function InterviewsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const lang = params.lang as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadInterviews()
  }, [])

  const loadInterviews = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/test/interviews', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to load interviews: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setInterviews(data.interviews || [])
      } else {
        throw new Error(data.message || "Failed to load interviews")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interviews")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load interviews",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return <Calendar className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = 
      interview.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.applicant?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.interviewer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || interview.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const handleInterviewClick = (interview: Interview) => {
    router.push(`/${lang}/dashboard/interviews/${interview.applicationId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Interviews</h3>
              <p className="text-gray-600">Fetching your interview data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Interviews</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadInterviews} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Interviews</h1>
          <p className="text-gray-600">Manage and view all interview sessions</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by applicant or interviewer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Interviews List */}
        {filteredInterviews.length === 0 ? (
          <Card className="border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">No Interviews Found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchTerm || statusFilter !== "all" 
                      ? "No interviews match your current filters. Try adjusting your search criteria."
                      : "You don't have any interviews assigned yet."
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredInterviews.map((interview) => (
              <Card 
                key={interview.id} 
                className="border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleInterviewClick(interview)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {interview.applicant?.name || "Applicant Name Not Available"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {interview.applicant?.email || "Email not available"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>Interviewer: {interview.interviewer?.name || "Not assigned"}</span>
                        </div>
                        {interview.scheduledAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Scheduled: {new Date(interview.scheduledAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {interview.overallScore !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Score: {interview.overallScore}/100</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(interview.status)} border font-medium`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(interview.status)}
                          {interview.status}
                        </div>
                      </Badge>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {interviews.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 bg-white/90 backdrop-blur-sm rounded-xl">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{interviews.length}</div>
                  <div className="text-sm text-gray-600">Total Interviews</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/90 backdrop-blur-sm rounded-xl">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {interviews.filter(i => i.status === 'COMPLETED').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/90 backdrop-blur-sm rounded-xl">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {interviews.filter(i => i.status === 'SCHEDULED').length}
                  </div>
                  <div className="text-sm text-gray-600">Scheduled</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/90 backdrop-blur-sm rounded-xl">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {interviews.filter(i => i.status === 'IN_PROGRESS').length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 