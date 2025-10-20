"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Loader2, 
  RefreshCw, 
  Search, 
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
  AlertCircle
} from "lucide-react"

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

export default function DatabaseApplicationsDashboard() {
  const params = useParams()
  const lang = params?.lang as string || 'en'
  
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [meta, setMeta] = useState<any>(null)

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (selectedStatus) params.append('status', selectedStatus)
      if (searchTerm) params.append('search', searchTerm)
      params.append('page', currentPage.toString())
      params.append('limit', '10')

      console.log('🔄 Fetching applications from database...')
      const response = await fetch(`/api/v1/applications/dashboard?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include' // Include cookies for authentication
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApplicationsResponse = await response.json()
      
      if (data.success) {
        console.log(`✅ Fetched ${data.data.length} applications from database`)
        setApplications(data.data)
        setPagination(data.pagination)
        setMeta(data.meta)
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

  const refetch = () => {
    fetchApplications()
  }

  const refresh = () => {
    setApplications([])
    setError(null)
    fetchApplications()
  }

  useEffect(() => {
    fetchApplications()
  }, [selectedStatus, searchTerm, currentPage])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'SUBMITTED': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'INTERVIEW_INVITED': { color: 'bg-yellow-100 text-yellow-800', icon: Calendar },
      'INTERVIEWED': { color: 'bg-purple-100 text-purple-800', icon: User },
      'APPROVED': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'REJECTED': { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['SUBMITTED']
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    )
  }

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

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading applications from database...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Error Loading Applications</h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={refetch} variant="outline">
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
              <Database className="h-8 w-8 text-primary" />
              <span>
                {lang === 'rw' ? 'Guhuza ubusabe (Database)' : 'Applications Dashboard (Database)'}
              </span>
            </h1>
            <p className="text-muted-foreground">
              {lang === 'rw' 
                ? `Guhuza ubusabe ${meta?.totalApplications || 0} bose kuva muri database` 
                : `Managing ${meta?.totalApplications || 0} applications from database`
              }
            </p>
          </div>
          <Button onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {lang === 'rw' ? 'Guhuza' : 'Refresh'}
          </Button>
        </div>

        {/* Data Source Indicator */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                {lang === 'rw' 
                  ? 'Data yose ikururwa muri database (nta Google Sheets)' 
                  : 'All data is fetched from database (no Google Sheets)'
                }
              </span>
            </div>
          </CardContent>
        </Card>


        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={lang === 'rw' ? 'Shakisha ubusabe...' : 'Search applications...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Tabs value={selectedStatus || 'all'} onValueChange={(value) => setSelectedStatus(value === 'all' ? undefined : value)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="SUBMITTED">Submitted</TabsTrigger>
                  <TabsTrigger value="INTERVIEW_INVITED">Interview Invited</TabsTrigger>
                  <TabsTrigger value="INTERVIEWED">Interviewed</TabsTrigger>
                  <TabsTrigger value="APPROVED">Approved</TabsTrigger>
                  <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>
                {lang === 'rw' ? 'Ubusabe (Database)' : 'Applications (Database)'} 
                {pagination && ` (${pagination.total} total)`}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {lang === 'rw' ? 'Nta busabe buhagije muri database' : 'No applications found in database'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">{application.applicantName}</h3>
                            {getStatusBadge(application.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{application.applicantPhone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">District:</span>
                              <span>{application.district || application.formData?.district || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Sector:</span>
                              <span>{application.sector || application.formData?.Sector || application.formData?.sector || 'Unknown'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(application.createdAt)}</span>
                          </div>
                          
                          {application.vulnerabilityCategory && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">Category:</span>
                              <Badge variant="outline">{application.vulnerabilityCategory}</Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right space-y-2">
                          {(application.applicationScore || application.totalScore) > 0 && (
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className={`font-semibold ${getScoreColor((application.applicationScore || application.totalScore) * 2.5)}`}>
                                {(application.applicationScore || application.totalScore).toFixed(1)}/40
                              </span>
                            </div>
                          )}
                          
                          {application.interviewScore > 0 && (
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-muted-foreground">
                                Interview: {application.interviewScore}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
