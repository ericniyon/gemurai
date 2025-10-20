"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Phone, Search, Clock, CheckCircle, FileText, AlertCircle, User, Calendar, MapPin, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getAllApplicationsByPhone,
  type ApplicationData,
  cleanupOldAutoCreatedApplications,
} from "@/lib/application-storage"

interface ResumeApplicationDialogProps {
  onApplicationResumed: (application: ApplicationData) => void
}

export function ResumeApplicationDialog({ onApplicationResumed }: ResumeApplicationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [foundApplications, setFoundApplications] = useState<ApplicationData[]>([])
  const [searchPerformed, setSearchPerformed] = useState(false)
  const { toast } = useToast()

  // Clean up old applications when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      cleanupOldAutoCreatedApplications()
      // Reset search state
      setFoundApplications([])
      setSearchPerformed(false)
      setPhoneNumber("")
    }
  }

  // Update the searchApplications function to use async/await
  const searchApplications = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to search for applications.",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    setSearchPerformed(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Get all applications for this phone number
      const applications = await getAllApplicationsByPhone(phoneNumber)
      setFoundApplications(applications)

      if (applications.length === 0) {
        toast({
          title: "No Applications Found",
          description: "No saved applications found for this phone number. You can start a new application.",
        })
      } else {
        toast({
          title: "Applications Found",
          description: `Found ${applications.length} application(s) for your phone number.`,
        })
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to search for applications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleResumeApplication = (application: ApplicationData) => {
    onApplicationResumed(application)
    setIsOpen(false)

    const statusMessages = {
      TEMPORARY: "Your saved application has been loaded.",
      SUBMITTED: "Your submitted application has been loaded for review.",
      UNDER_REVIEW: "Your application is under review.",
      PENDING_DOCUMENTS: "Your application is pending documents.",
      APPROVED: "Your application has been approved.",
      REJECTED: "Your application has been rejected.",
    }

    toast({
      title: "Application Resumed",
      description: statusMessages[application.status] || "Application loaded successfully.",
    })
  }

  const getStatusInfo = (status: ApplicationData["status"]) => {
    switch (status) {
      case "TEMPORARY":
        return {
          label: "Draft",
          color: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="h-3 w-3" />,
          description: "Manually saved progress",
        }
      case "SUBMITTED":
        return {
          label: "Submitted",
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="h-3 w-3" />,
          description: "Application submitted for review",
        }
      case "UNDER_REVIEW":
        return {
          label: "Under Review",
          color: "bg-blue-100 text-blue-800",
          icon: <Clock className="h-3 w-3" />,
          description: "Application is being reviewed",
        }
      case "PENDING_DOCUMENTS":
        return {
          label: "Pending Documents",
          color: "bg-orange-100 text-orange-800",
          icon: <FileText className="h-3 w-3" />,
          description: "Additional documents required",
        }
      case "APPROVED":
        return {
          label: "Approved",
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="h-3 w-3" />,
          description: "Application has been approved",
        }
      case "REJECTED":
        return {
          label: "Rejected",
          color: "bg-red-100 text-red-800",
          icon: <FileText className="h-3 w-3" />,
          description: "Application has been rejected",
        }
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800",
          icon: <FileText className="h-3 w-3" />,
          description: "Application in progress",
        }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCompletionPercentage = (application: ApplicationData) => {
    const totalSteps = 6 // Assuming 6 total steps
    return Math.round((application.currentStep / totalSteps) * 100)
  }

  const getApplicantName = (application: ApplicationData) => {
    const formData = application.formData || {}
    const firstName = formData.q1 || ""
    const lastName = formData.q2 || ""
    return `${firstName} ${lastName}`.trim() || "Unnamed Application"
  }

  const getLocation = (application: ApplicationData) => {
    const formData = application.formData || {}
    const parts: string[] = []
    if (formData.village) parts.push(formData.village)
    if (formData.sector) parts.push(formData.sector)
    if (formData.district) parts.push(formData.district)
    return parts.join(", ") || "Location not specified"
  }

  const getTotalSteps = () => {
    return 6 // Assuming 6 total steps
  }

  const getSubmissionStatus = (application: ApplicationData) => {
    const totalSteps = 6 // Assuming 6 total steps
    const isNearCompletion = application.currentStep >= totalSteps - 1

    if (application.status === "SUBMITTED") {
      return {
        text: "Already Submitted",
        color: "text-green-600",
        canSubmit: false,
      }
    } else if (isNearCompletion) {
      return {
        text: "Ready to Submit",
        color: "text-blue-600",
        canSubmit: true,
      }
    } else {
      return {
        text: `${totalSteps - application.currentStep} steps remaining`,
        color: "text-gray-600",
        canSubmit: false,
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Phone className="h-4 w-4 mr-2" />
          Resume Saved Application
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Resume Your Application
          </DialogTitle>
          <DialogDescription>Enter your phone number to find and resume your saved applications.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+250 7XX XXX XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchApplications()}
                  className="flex-1"
                />
                <Button onClick={searchApplications} disabled={isSearching} className="px-6">
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2 text-blue-800">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">How to find your applications:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Enter the phone number you used when filling the application</li>
                    <li>• Applications are automatically saved when you provide contact info</li>
                    <li>• You can resume any unfinished or submitted applications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {searchPerformed && (
            <div className="space-y-4">
              <Separator />

              {foundApplications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                  <p className="text-gray-600 mb-4">
                    No saved applications found for phone number: <strong>{phoneNumber}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    You can start a new application, and it will be automatically saved when you provide your contact
                    information.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Found Applications</h3>
                    <Badge variant="secondary">{foundApplications.length} application(s)</Badge>
                  </div>

                  <div className="space-y-3">
                    {foundApplications.map((application) => {
                      const statusInfo = getStatusInfo(application.status)
                      const completionPercentage = getCompletionPercentage(application)
                      const applicantName = getApplicantName(application)
                      const location = getLocation(application)

                      return (
                        <Card
                          key={application.id}
                          className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary"
                          onClick={() => handleResumeApplication(application)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  {applicantName}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {application.phone}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {location}
                                  </span>
                                </CardDescription>
                              </div>
                              <Badge className={statusInfo.color}>
                                {statusInfo.icon}
                                <span className="ml-1">{statusInfo.label}</span>
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {/* Progress Bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Progress</span>
                                  <span className="font-medium">{completionPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${completionPercentage}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Timestamps */}
                              <div className="flex justify-between text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Created: {formatDate(application.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Updated: {formatDate(application.lastActivity || application.updatedAt)}
                                </span>
                              </div>

                              {/* Submission Status */}
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Status: {statusInfo.description}</span>
                                <span className={getSubmissionStatus(application).color}>
                                  {getSubmissionStatus(application).text}
                                </span>
                              </div>

                              {/* Action Button */}
                              <Button
                                className="w-full mt-3"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleResumeApplication(application)
                                }}
                              >
                                {application.status === "SUBMITTED"
                                  ? "View Submitted Application"
                                  : application.currentStep >= getTotalSteps()
                                    ? "Resume & Submit Application"
                                    : "Resume Application"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
