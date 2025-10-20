"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  RefreshCw, 
  Download, 
  Upload,
  Bell,
  MessageSquare,
  Calendar,
  Eye,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ClientOnly } from "@/components/client-only"

interface ApplicationStatus {
  id: string
  status: string
  submittedDate: string
  lastUpdated: string
  currentStep: string
  completionPercentage: number
  estimatedCompletion: string
  reviewer: {
    name: string
    email: string
  } | null
  documents: {
    name: string
    status: string
    uploadedDate: string
  }[]
  timeline: {
    step: string
    date: string | null
    status: string
    description: string
  }[]
  notes: {
    date: string
    author: string
    message: string
    type: string
  }[]
}

function MyApplicationContent() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [application, setApplication] = useState<ApplicationStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchApplication = async (showRefreshMessage = false) => {
      try {
      setIsRefreshing(true)
        setError(null)
        
      const response = await fetch(`/api/v1/applications/my-application`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('Gemurai_token')}`,
        },
      })
      
        if (!response.ok) {
          throw new Error('Failed to fetch application status')
        }
        
        const data = await response.json()
        setApplication(data)
      
      if (showRefreshMessage) {
        toast({
          title: "Application Updated",
          description: "Your application status has been refreshed.",
        })
      }
      } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      } finally {
        setIsLoading(false)
      setIsRefreshing(false)
      }
    }

  useEffect(() => {
    fetchApplication()
  }, [])

  const handleRefresh = () => {
    fetchApplication(true)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "verified":
        return "bg-green-100 text-green-800 border-green-200"
      case "under_review":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ")
  }

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case "pending":
        return <Clock className="h-5 w-5 text-gray-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getNoteIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "update":
        return <Bell className="h-4 w-4 text-green-500" />
      case "info":
        return <Info className="h-4 w-4 text-gray-500" />
      case "confirmation":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getNoteStyle = (type: string) => {
    switch (type) {
      case "feedback":
        return "bg-blue-50 border-blue-200"
      case "update":
        return "bg-green-50 border-green-200"
      case "info":
        return "bg-gray-50 border-gray-200"
      case "confirmation":
        return "bg-green-50 border-green-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your application...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-900 font-medium">Failed to load application</p>
          <p className="mt-2 text-gray-500">{error}</p>
          <div className="flex gap-4 mt-6 justify-center">
          <Button
            variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
          >
              {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            Try Again
          </Button>
            <Button
              onClick={() => window.location.href = "/dashboard"}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <FileText className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="mt-4 text-gray-900 font-medium">No Application Found</p>
          <p className="mt-2 text-gray-500">You haven't submitted a DCC application yet.</p>
          <Button className="mt-6">
            Start New Application
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My DCC Application</h1>
          <p className="text-gray-600">Track your Digital Community Champion application progress</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          Refresh Status
        </Button>
      </div>

      {/* Status Alert */}
      {application.status === "under_review" && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Your application is currently under review. Expected completion: {" "}
            <strong>{new Date(application.estimatedCompletion).toLocaleDateString()}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Application Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application Status
              </CardTitle>
              <CardDescription>Overall progress and current status</CardDescription>
            </div>
            <Badge className={cn("px-4 py-2 text-sm", getStatusColor(application.status))}>
              {getStatusText(application.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                <span className="text-sm font-medium text-gray-900">{application.completionPercentage}%</span>
              </div>
              <Progress value={application.completionPercentage} className="h-3" />
              <p className="text-xs text-gray-500 mt-2">
                Current Step: {application.currentStep}
              </p>
            </div>

            <Separator />

            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Application ID</p>
                <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {application.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Submitted Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(application.submittedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(application.lastUpdated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Assigned Reviewer</p>
                <div>
                <p className="font-medium text-gray-900">
                  {application.reviewer ? application.reviewer.name : 'Not assigned'}
                </p>
                  {application.reviewer && (
                    <p className="text-xs text-gray-500">{application.reviewer.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

            {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Application Timeline</CardTitle>
        </CardHeader>
        <CardContent>
              <div className="space-y-6">
                {application.timeline.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getTimelineIcon(step.status)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{getStatusText(step.step)}</p>
                      <p className="text-sm text-gray-500">{step.description}</p>
                      {step.date && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(step.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
        </CardContent>
      </Card>

            {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Documents</CardTitle>
        </CardHeader>
        <CardContent>
              <div className="space-y-4">
                {application.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded on {new Date(doc.uploadedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn("px-2 py-0.5", getStatusColor(doc.status))}>
                      {getStatusText(doc.status)}
                    </Badge>
                  </div>
                ))}
              </div>
        </CardContent>
      </Card>

            {/* Notes */}
            {application.notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Application Notes & Updates</CardTitle>
            <CardDescription>
              Communication and updates from your reviewer
            </CardDescription>
          </CardHeader>
          <CardContent>
                <div className="space-y-4">
                  {application.notes.map((note, index) => (
                <div key={index} className={cn(
                  "rounded-lg p-4 border-l-4",
                  getNoteStyle(note.type)
                )}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNoteIcon(note.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{note.author}</p>
                          <Badge variant="outline" className="text-xs">
                            {getStatusText(note.type)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(note.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{note.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions for your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Application
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Documents
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Contact Reviewer
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MyApplicationPage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading application...</p>
        </div>
      </div>
    }>
      <MyApplicationContent />
    </ClientOnly>
  )
} 