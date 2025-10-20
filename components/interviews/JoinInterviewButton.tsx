"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { UserPlus, Loader2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface JoinInterviewButtonProps {
  applicationId: string
  applicantName: string
  onRefresh?: () => void
  applicationStatus?: string
}

interface ApplicationData {
  id: string
  formData: {
    [key: string]: any
  }
  user?: {
    id: string
    name: string | null
    email: string | null
  } | null
}

export default function JoinInterviewButton({ 
  applicationId, 
  applicantName,
  onRefresh,
  applicationStatus = "SUBMITTED"
}: JoinInterviewButtonProps) {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [canJoin, setCanJoin] = useState(false)
  const [remainingSlots, setRemainingSlots] = useState(0)
  const [hasJoined, setHasJoined] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null)
  const [loadingApplication, setLoadingApplication] = useState(false)

  // Optimized: Function to extract applicant name from application data
  const getApplicantNameFromData = useCallback((application: ApplicationData | null): string => {
    if (!application?.formData) {
      return applicantName || "Applicant"
    }
    
    // Priority 1: User's name from user table
    if (application.user?.name) {
      return application.user.name
    }
    
    // Priority 2: Database format - q1 (first name) + q2 (last name)
    if (application.formData.q1 && application.formData.q2) {
      return `${application.formData.q1} ${application.formData.q2}`.trim()
    }
    
    // Priority 3: Google Sheets format - First Name + Last Name
    if (application.formData['First Name'] && application.formData['Last Name']) {
      return `${application.formData['First Name']} ${application.formData['Last Name']}`.trim()
    }
    
    // Priority 4: Google Sheets format - First Name + Lat Name (typo)
    if (application.formData['First Name'] && application.formData['Lat Name']) {
      return `${application.formData['First Name']} ${application.formData['Lat Name']}`.trim()
    }
    
    // Priority 5: Direct firstName/lastName fields
    if (application.formData.firstName && application.formData.lastName) {
      return `${application.formData.firstName} ${application.formData.lastName}`.trim()
    }
    
    // Priority 6: Single name fields
    const singleNameFields = ['Full Name', 'Applicant Name', 'name', 'fullName', 'First Name', 'q1', 'firstName']
    for (const field of singleNameFields) {
      if (application.formData[field]) {
        return application.formData[field]
      }
    }
    
    return applicantName || "Applicant"
  }, [applicantName])

  // Optimized: Single API call to get both application data and interview status
  const fetchData = useCallback(async () => {
    if (!applicationId) return
    
    setLoadingApplication(true)
    try {
      // Use Promise.all to fetch both endpoints in parallel
      const [applicationResponse, interviewResponse] = await Promise.all([
        fetch(`/api/test/application-exists?id=${applicationId}`, {
          credentials: "include",
        }),
        fetch(`/api/v1/applications/join-interview?applicationId=${applicationId}`, {
          credentials: "include",
        })
      ])

      // Process application data
      if (applicationResponse.ok) {
        const appData = await applicationResponse.json()
        if (appData.success && appData.application) {
          setApplicationData(appData.application)
        }
      } else if (applicationResponse.status === 404) {
        // Application not found - this is not necessarily an error for the join button
        console.log("Application not found, but continuing with join button functionality")
        setApplicationData(null)
      }

      // Process interview status
      if (interviewResponse.ok) {
        const interviewData = await interviewResponse.json()
        if (interviewData.success) {
          const interviews = interviewData.interviews || []
          const currentUserJoined = interviews.some((interview: any) => 
            interview.interviewerId === getCurrentUserId()
          )
          
          setHasJoined(currentUserJoined)
          setRemainingSlots(interviewData.remainingSlots || 0)
          setCanJoin(!currentUserJoined && interviewData.remainingSlots > 0)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoadingApplication(false)
    }
  }, [applicationId])

  const getCurrentUserId = useCallback(() => {
    return user?.id || null
  }, [user?.id])

  useEffect(() => {
    fetchData() // Single optimized call
  }, [applicationId, user?.role, applicationStatus, fetchData])

  const handleJoinInterview = async () => {
    // Show confirmation dialog for ALL interviews
    setShowConfirmation(true)
  }

  const proceedWithJoinInterview = async () => {
    setLoading(true)
    setShowConfirmation(false)
    
    try {
      const response = await fetch("/api/v1/applications/join-interview", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          interviewerIds: [getCurrentUserId()]
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Successfully joined interview!",
        })

        onRefresh?.()
        router.push(`/${params.lang}/dashboard/interviews/${applicationId}`)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to join interview",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error joining interview:", error)
      toast({
        title: "Error",
        description: "Failed to join interview",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get the final applicant name to display
  const finalApplicantName = getApplicantNameFromData(applicationData)

  if (hasJoined) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
        onClick={() => router.push(`/${params.lang}/dashboard/interviews/${applicationId}`)}
        title="Go to Interview"
      >
        <UserPlus className="h-4 w-4" />
      </Button>
    )
  }

  if (!canJoin) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-gray-400 cursor-not-allowed"
        disabled
        title="No Slots Available"
      >
        <UserPlus className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <>
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md !bg-white !shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-500" />
              Confirm Interview Join
            </DialogTitle>
            <DialogDescription className="text-left">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">You are about to join an interview for:</p>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 text-lg">
                    {finalApplicantName && finalApplicantName !== 'Unknown Applicant' && finalApplicantName !== 'Super Admin' && finalApplicantName !== 'not logged in user' && finalApplicantName.trim() !== '' && finalApplicantName !== 'Applicant'
                      ? finalApplicantName 
                      : `Application ID: ${applicationId}`
                    }
                  </p>
                  {(loadingApplication || !finalApplicantName || finalApplicantName === 'Unknown Applicant' || finalApplicantName === 'Super Admin' || finalApplicantName === 'not logged in user' || finalApplicantName.trim() === '' || finalApplicantName === 'Applicant') && (
                    <p className="text-xs text-blue-600 mt-1">
                      {loadingApplication ? 'Loading applicant information...' : 'Applicant name not available - showing Application ID instead'}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Please confirm that you want to join this interview session.
              </p>
              {applicationStatus === "INTERVIEW_INVITED" && (
                <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200 mt-3">
                  <strong>Note:</strong> This application has been specifically invited for an interview.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={proceedWithJoinInterview}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Interview"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          onClick={handleJoinInterview}
          disabled={loading}
          title={`Join Interview - Confirmation Required (${remainingSlots} slot${remainingSlots !== 1 ? 's' : ''} left)`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </Button>
        <span className="text-xs text-blue-600 font-medium">
          ({remainingSlots})
        </span>
      </div>
    </>
  )
}