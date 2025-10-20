"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, User, Mail, Phone, Calendar, AlertCircle, Star, Play, FileText } from "lucide-react"
import { InterviewResults } from "@/components/interviews/InterviewResults"

interface InterviewScore {
  id: string
  score: number
  comments: string
  criteria: {
    id: string
    name: string
    description: string
    maxScore: number
  }
}

interface Interview {
  id: string
  status: string
  scheduledDate: string
  completedAt?: string
  overallScore?: number
  overallComment?: string
  interviewNotes?: string
  interviewer: {
    id: string
    name: string
    email: string
  }
  scores: InterviewScore[]
}

interface Application {
  id: string
  userId: string
  phone?: string
  email?: string
  formData?: any
  user?: {
    email: string
    name?: string
  } | null
  status: string
  createdAt: string
  updatedAt: string
  evaluations?: Array<any>
  dccProfile?: any
  interviews?: Interview[]
  _meta?: {
    evaluationsCount: number
    hasDCCProfile: boolean
  }
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  const applicationId = params.id as string

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetails()
    }
  }, [applicationId])



  const fetchApplicationDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("🔍 Fetching application details for ID:", applicationId)
      
      const response = await fetch(`/api/v1/superadmin/applications?id=${applicationId}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ API Error:", errorData)
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ API Response:", data)
      
      if (data.success && data.application) {
        setApplication(data.application)
      } else {
        throw new Error(data.message || "Invalid response format")
      }
    } catch (error) {
      console.error("❌ Error fetching application details:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load application details"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading application details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/superadmin/applications")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error Loading Application</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
            <Button 
              onClick={fetchApplicationDetails}
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/superadmin/applications")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Not Found</h3>
              <p className="text-gray-600">The application you're looking for doesn't exist or has been removed.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const applicantData = {
    firstName: application.formData?.q1 || "",
    lastName: application.formData?.q2 || "",
    email: application.formData?.q7 || application.email || "",
    phone: application.formData?.q8 || application.phone || "",
    gender: application.formData?.q4 || "",
    maritalStatus: application.formData?.q6 || "",
    nationalId: application.formData?.q3 || "",
    dateOfBirth: application.formData?.q5 || "",
  }

  const applicantName = `${applicantData.firstName} ${applicantData.lastName}`.trim() || "Unknown Applicant"

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/superadmin/applications")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
        <h1 className="text-2xl font-bold">Application Details</h1>
        <Badge className={getStatusColor(application.status)}>
          {application.status}
        </Badge>
        

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Applicant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-lg font-semibold">
                {applicantData.firstName} {applicantData.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">National ID</p>
              <p>{applicantData.nationalId || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
              <p>{applicantData.dateOfBirth || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p>{applicantData.gender || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Marital Status</p>
              <p>{applicantData.maritalStatus || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="break-all">{applicantData.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p>{applicantData.phone || "N/A"}</p>
            </div>
            {application.user && (
              <div>
                <p className="text-sm font-medium text-gray-500">User Account</p>
                <p className="text-sm">{application.user.email}</p>
                {application.user.name && (
                  <p className="text-sm text-gray-600">{application.user.name}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {application.evaluations && application.evaluations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Evaluations ({application.evaluations.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.evaluations.map((evaluation) => (
                <div key={evaluation.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{evaluation.type}</p>
                      <p className="text-sm text-gray-600">
                        Score: {evaluation.score}
                        {evaluation.totalScore && ` (Total: ${evaluation.totalScore})`}
                      </p>
                      {evaluation.overallLevel && (
                        <p className="text-sm text-gray-600">
                          Level: {evaluation.overallLevel}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {new Date(evaluation.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                  {evaluation.evaluator && (
                    <p className="text-sm text-gray-600">
                      Evaluated by: {evaluation.evaluator.name || evaluation.evaluator.email}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {application.dccProfile && (
          <Card>
            <CardHeader>
              <CardTitle>DCC Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Level</p>
                  <Badge variant="outline">{application.dccProfile.level}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rating</p>
                  <p>{application.dccProfile.rating}/5.0</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Sales</p>
                  <p>{application.dccProfile.totalSales}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Monthly Sales</p>
                  <p>{application.dccProfile.monthlySales}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Products Available</p>
                  <p>{application.dccProfile.productsAvailable}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={getStatusColor(application.dccProfile.status)}>
                    {application.dccProfile.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p>{application.dccProfile.location}</p>
              </div>
              {application.dccProfile.specialties && application.dccProfile.specialties.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Specialties</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {application.dccProfile.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {application.dccProfile.approvedBy && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved By</p>
                  <p>{application.dccProfile.approvedBy}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(application.dccProfile.approvedDate).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Interview Results Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Interview Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(application.interviews && application.interviews.length > 0) ? (
            <div className="space-y-6">
              {application.interviews.map((interview) => (
                <InterviewResults key={interview.id} interview={interview as any} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No interviews available.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Form Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {(() => {
              const formData = application.formData || {};
              const sections = [
                {
                  title: "Personal Information",
                  icon: "👤",
                  fields: [
                    { key: "q1", label: "First Name", type: "text" },
                    { key: "q2", label: "Last Name", type: "text" },
                    { key: "q3", label: "Date of Birth", type: "date" },
                    { key: "q4", label: "Gender", type: "text" },
                    { key: "q5", label: "National ID", type: "text" }
                  ]
                },
                {
                  title: "Contact Information",
                  icon: "📞",
                  fields: [
                    { key: "q7", label: "Email", type: "email" },
                    { key: "q8", label: "Phone", type: "phone" },
                    { key: "q9", label: "Alternative Email", type: "email" },
                    { key: "q10", label: "Alternative Phone", type: "phone" }
                  ]
                },
                {
                  title: "Location",
                  icon: "📍",
                  fields: [
                    { key: "q11", label: "Address", type: "object" },
                    { key: "province", label: "Province", type: "text" },
                    { key: "district", label: "District", type: "text" },
                    { key: "sector", label: "Sector", type: "text" },
                    { key: "cell", label: "Cell", type: "text" },
                    { key: "village", label: "Village", type: "text" }
                  ]
                },
                {
                  title: "Education & Skills",
                  icon: "🎓",
                  fields: [
                    { key: "q12", label: "Education Level", type: "text" },
                    { key: "q13", label: "Years of Education", type: "number" },
                    { key: "q14", label: "Skills", type: "array" },
                    { key: "q20", label: "Languages", type: "array" },
                    { key: "education", label: "Education", type: "text" },
                    { key: "skills", label: "Skills", type: "array" }
                  ]
                },
                {
                  title: "Employment",
                  icon: "💼",
                  fields: [
                    { key: "q15", label: "Employment Status", type: "text" },
                    { key: "q16", label: "Current Position", type: "text" },
                    { key: "q17", label: "Employer", type: "text" },
                    { key: "q18", label: "Years of Experience", type: "number" },
                    { key: "q19", label: "Monthly Income", type: "number" },
                    { key: "yearsExperience", label: "Years Experience", type: "number" },
                    { key: "currentPosition", label: "Current Position", type: "text" },
                    { key: "employer", label: "Employer", type: "text" }
                  ]
                },
                {
                  title: "Digital Access",
                  icon: "💻",
                  fields: [
                    { key: "hasSmartphone", label: "Has Smartphone", type: "boolean" },
                    { key: "hasInternet", label: "Has Internet", type: "boolean" },
                    { key: "digitalSkills", label: "Digital Skills", type: "array" }
                  ]
                },
                {
                  title: "Family & Health",
                  icon: "👨‍👩‍👧‍👦",
                  fields: [
                    { key: "maritalStatus", label: "Marital Status", type: "text" },
                    { key: "dependents", label: "Dependents", type: "number" },
                    { key: "isHouseholdHead", label: "Is Household Head", type: "boolean" },
                    { key: "hasDisability", label: "Has Disability", type: "boolean" },
                    { key: "hasChronicIllness", label: "Has Chronic Illness", type: "boolean" },
                    { key: "healthIssues", label: "Health Issues", type: "text" }
                  ]
                },
                {
                  title: "Housing & Community",
                  icon: "🏠",
                  fields: [
                    { key: "housingType", label: "Housing Type", type: "text" },
                    { key: "hasUtilities", label: "Has Utilities", type: "boolean" },
                    { key: "communityInvolvement", label: "Community Involvement", type: "text" },
                    { key: "supportNetwork", label: "Support Network", type: "boolean" }
                  ]
                },
                {
                  title: "Documents",
                  icon: "📄",
                  fields: [
                    { key: "educationCertificate", label: "Education Certificate", type: "file" },
                    { key: "nationalIdCopy", label: "National ID Copy", type: "file" },
                    { key: "nationalIdBack", label: "National ID Back", type: "file" },
                    { key: "selfiePhoto", label: "Selfie Photo", type: "file" },
                    { key: "cv", label: "CV/Resume", type: "file" },
                    { key: "photo", label: "Photo", type: "file" }
                  ]
                }
              ];

              return sections.map((section, sectionIndex) => {
                const hasData = section.fields.some(field => {
                  const value = formData[field.key];
                  return value !== undefined && value !== null && value !== "";
                });

                if (!hasData) return null;

                return (
                  <div key={sectionIndex} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">{section.icon}</span>
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {section.fields.map((field, fieldIndex) => {
                        const value = formData[field.key];
                        
                        if (value === undefined || value === null || value === "") {
                          return null;
                        }

                        const renderValue = () => {
                          switch (field.type) {
                            case "boolean":
                              return (
                                <Badge variant={value === "yes" || value === true ? "default" : "secondary"}>
                                  {value === "yes" || value === true ? "Yes" : "No"}
                                </Badge>
                              );
                            case "array":
                              if (Array.isArray(value)) {
                                return (
                                  <div className="flex flex-wrap gap-1">
                                    {value.map((item, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {item}
                                      </Badge>
                                    ))}
                                  </div>
                                );
                              }
                              return <span>{String(value)}</span>;
                            case "object":
                              if (typeof value === "object" && value !== null) {
                                return (
                                  <div className="space-y-1">
                                    {Object.entries(value).map(([key, val]) => (
                                      <div key={key} className="text-sm">
                                        <span className="font-medium">{key}:</span> {String(val)}
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              return <span>{String(value)}</span>;
                            case "file":
                              if (value && typeof value === "string" && value.trim() !== "") {
                                // Handle different file path formats
                                let fileUrl = value;
                                let fileName = value.split('/').pop() || 'document';
                                
                                // If it's not a full URL, assume it's a local file
                                if (!value.startsWith('http')) {
                                  fileUrl = `/uploads/${value}`;
                                }
                                
                                // Determine file type for better UX
                                const fileExtension = fileName.split('.').pop()?.toLowerCase();
                                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '');
                                const isPDF = fileExtension === 'pdf';
                                
                                return (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-700">{fileName}</span>
                                      </div>
                                      <div className="flex gap-2">
                                        <a
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 underline text-xs px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                                        >
                                          {isImage ? 'View Image' : isPDF ? 'View PDF' : 'View Document'}
                                        </a>
                                        <a
                                          href={fileUrl}
                                          download={fileName}
                                          className="text-green-600 hover:text-green-800 underline text-xs px-2 py-1 border border-green-200 rounded hover:bg-green-50"
                                        >
                                          Download
                                        </a>
                                      </div>
                                    </div>
                                    {isImage && (
                                      <div className="border rounded-lg p-2 bg-white">
                                        <img src={fileUrl} alt={fileName} className="max-h-64 rounded object-contain mx-auto" />
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return <span className="text-gray-500">No file uploaded</span>;
                            case "date":
                              return <span>{new Date(value).toLocaleDateString()}</span>;
                            case "number":
                              return <span>{Number(value).toLocaleString()}</span>;
                            case "email":
                              return (
                                <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 underline">
                                  {value}
                                </a>
                              );
                            case "phone":
                              return (
                                <a href={`tel:${value}`} className="text-blue-600 hover:text-blue-800 underline">
                                  {value}
                                </a>
                              );
                            default:
                              return <span>{String(value)}</span>;
                          }
                        };

                        return (
                          <div key={fieldIndex} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-600 mb-1">{field.label}</p>
                            <div className="text-sm">{renderValue()}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}

            {/* Raw Form Data (for debugging) */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                Raw Form Data (JSON)
              </summary>
              <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96 border mt-2">
            {JSON.stringify(application.formData, null, 2)}
          </pre>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 