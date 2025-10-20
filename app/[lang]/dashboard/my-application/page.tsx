"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, User, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface Application {
  id: string
  status: string
  createdAt: string
  updatedAt: string
  formData: any
}

export default function MyApplicationPage() {
  const { user } = useAuth()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMyApplication = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const response = await fetch(`/api/applications/my-application?userId=${user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          setApplication(data.application)
        } else {
          setError("Failed to load application")
      }
      } catch (err) {
        setError("Error loading application")
      } finally {
        setLoading(false)
      }
    }

    fetchMyApplication()
  }, [user?.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800"
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800"
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "INTERVIEW_INVITED":
        return "bg-purple-100 text-purple-800"
      case "INTERVIEWED":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <FileText className="h-4 w-4" />
      case "UNDER_REVIEW":
        return <Clock className="h-4 w-4" />
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />
      case "REJECTED":
        return <AlertCircle className="h-4 w-4" />
      case "INTERVIEW_INVITED":
        return <Calendar className="h-4 w-4" />
      case "INTERVIEWED":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container py-6 px-4">
      <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="ml-4 text-gray-600">Loading your application...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container py-6 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Error Loading Application</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
            Try Again
            </Button>
          </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container py-6 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Application Found</h3>
                <p className="text-gray-600 mb-4">
                  You haven't submitted an application yet. Please contact the administrator to submit your application.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Application</h1>
            <p className="text-gray-600">Track your application status and progress</p>
      </div>

          {/* Application Status */}
          <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-3 text-blue-800">
                <FileText className="h-6 w-6" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Current Status</h3>
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(application.status)}
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.replace('_', ' ')}
            </Badge>
          </div>
                  <p className="text-sm text-gray-600">
                    Your application is currently being reviewed by our team.
              </p>
            </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Application Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Application ID:</span>
                      <span className="font-medium">{application.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-medium">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">
                        {new Date(application.updatedAt).toLocaleDateString()}
                      </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

          {/* Application Form Data */}
          {application.formData && (
            <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-3 text-green-800">
                  <User className="h-6 w-6" />
                  Application Information
                </CardTitle>
        </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(application.formData).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-sm font-medium text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </label>
                      <p className="text-sm text-gray-900">{String(value)}</p>
                  </div>
                ))}
              </div>
        </CardContent>
      </Card>
          )}

          {/* Next Steps */}
          <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-3 text-purple-800">
                <CheckCircle className="h-6 w-6" />
                Next Steps
              </CardTitle>
        </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                      <div>
                    <h4 className="font-semibold">Application Review</h4>
                    <p className="text-sm text-gray-600">Your application is being reviewed by our team</p>
                      </div>
                    </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-gray-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Interview Invitation</h4>
                    <p className="text-sm text-gray-600">If approved, you'll be invited for an interview</p>
                  </div>
              </div>
                
                  <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-gray-600">3</span>
                    </div>
                  <div>
                    <h4 className="font-semibold">Final Decision</h4>
                    <p className="text-sm text-gray-600">You'll receive the final decision after the interview</p>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
} 