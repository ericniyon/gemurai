"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, ArrowLeft, User, Calendar, Star, FileText, CheckCircle, Clock, AlertCircle, Users, Edit3, Save, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InterviewResults } from "@/components/interviews/InterviewResults"
import { AssignInterviewersModal } from "@/components/interviews/AssignInterviewersModal"
import { InterviewGuide } from "@/components/interviews/InterviewGuide"
import { ApplicationInsights } from "@/components/interviews/ApplicationInsights"
import { InterviewQuestions } from "@/components/interviews/InterviewQuestions"
import { InterviewResultsTab } from "@/components/interviews/InterviewResultsTab"

interface InterviewCriteria {
    id: string
    name: string
  description: string
  maxScore: number
  weight: number
}

interface Score {
  criteriaId: string
  score: number
  comments: string
}

interface Application {
  id: string;
  email: string;
  status: string;
  formData: {
    [key: string]: any;
  };
}

export default function InterviewPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const applicationId = params?.applicationId as string
  const lang = params?.lang as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [interviews, setInterviews] = useState<any[]>([])
  const [criteria, setCriteria] = useState<InterviewCriteria[]>([])
  const [currentInterview, setCurrentInterview] = useState<any>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [googleSheetsScores, setGoogleSheetsScores] = useState<any[]>([])
  const [scoresLoading, setScoresLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editableScores, setEditableScores] = useState<{[key: string]: number}>({})
  const [hasTemporaryScores, setHasTemporaryScores] = useState(false)
  const [scoresSubmitted, setScoresSubmitted] = useState(0)

  const handleScoresSubmitted = () => {
    console.log('🔄 InterviewPage: Scores submitted, triggering refresh...')
    setScoresSubmitted(prev => prev + 1)
    console.log('🔄 InterviewPage: New scoresSubmitted value:', scoresSubmitted + 1)
    
    // Show toast notification that results are being refreshed
    toast({
      title: "Scores Submitted Successfully!",
      description: "Interview results are being updated automatically...",
    })
  }

  // Function to get applicant name from application data
  const getApplicantName = (application: Application | null): string => {
    if (!application?.formData) {
      console.log('No application or formData available')
      return "Applicant"
    }
    
    console.log('Form data available:', application.formData)
    console.log('Available form fields:', Object.keys(application.formData))
    
    // Priority 1: User's name from user table
    if (application.user?.name) {
      console.log('Found user name:', application.user.name)
      return application.user.name
    }
    
    // Priority 2: Database format - q1 (first name) + q2 (last name)
    if (application.formData.q1 && application.formData.q2) {
      const name = `${application.formData.q1} ${application.formData.q2}`.trim()
      console.log('Found database name (q1 + q2):', name)
      return name
    }
    
    // Priority 3: Google Sheets format - First Name + Last Name
    if (application.formData['First Name'] && application.formData['Last Name']) {
      const name = `${application.formData['First Name']} ${application.formData['Last Name']}`.trim()
      console.log('Found Google Sheets name (First Name + Last Name):', name)
      return name
    }
    
    // Priority 4: Google Sheets format - First Name + Lat Name (typo)
    if (application.formData['First Name'] && application.formData['Lat Name']) {
      const name = `${application.formData['First Name']} ${application.formData['Lat Name']}`.trim()
      console.log('Found Google Sheets name (First Name + Lat Name):', name)
      return name
    }
    
    // Priority 5: Direct firstName/lastName fields
    if (application.formData.firstName && application.formData.lastName) {
      const name = `${application.formData.firstName} ${application.formData.lastName}`.trim()
      console.log('Found database name (firstName + lastName):', name)
      return name
    }
    
    // Priority 6: Single name fields
    if (application.formData['Full Name']) {
      console.log('Found Full Name field:', application.formData['Full Name'])
      return application.formData['Full Name']
    }
    if (application.formData['Applicant Name']) {
      console.log('Found Applicant Name field:', application.formData['Applicant Name'])
      return application.formData['Applicant Name']
    }
    if (application.formData.name) {
      console.log('Found name field:', application.formData.name)
      return application.formData.name
    }
    if (application.formData.fullName) {
      console.log('Found fullName field:', application.formData.fullName)
      return application.formData.fullName
    }
    
    // Priority 7: Just first name fields
    if (application.formData['First Name']) {
      console.log('Found Google Sheets first name only:', application.formData['First Name'])
      return application.formData['First Name']
    }
    if (application.formData.q1) {
      console.log('Found database q1 field only:', application.formData.q1)
      return application.formData.q1
    }
    if (application.formData.firstName) {
      console.log('Found database firstName field only:', application.formData.firstName)
      return application.formData.firstName
    }
    if (application.formData.name) {
      console.log('Found database name field:', application.formData.name)
      return application.formData.name
    }
    
    // Priority 6: Try to find any field that might contain a name
    const possibleNameFields = [
      'fullName', 'applicantName', 'candidateName',
      'first_name', 'firstname', 'last_name', 'lastname',
      'Full Name', 'applicant_name', 'candidate_name'
    ]
    
    for (const field of possibleNameFields) {
      if (application.formData[field]) {
        console.log(`Found name in field "${field}":`, application.formData[field])
        return application.formData[field]
      }
    }
    
    console.log('No name found in form data, returning "Applicant"')
    return "Applicant"
  }

  useEffect(() => {
    if (!applicationId) return
    loadData()
    fetchGoogleSheetsScores()
  }, [applicationId])

  const loadData = async () => {
      setLoading(true)
      setError(null)
    
    try {
      // Load application and interviews
      const appResponse = await fetch(`/api/test/application-exists?id=${applicationId}`)
      const appData = await appResponse.json()
      
      if (!appData.success) {
        if (appResponse.status === 404) {
          throw new Error("Application not found. Please check the application ID and try again.")
        } else {
          throw new Error(appData.message || "Failed to load application data")
        }
      }
      
      console.log('Loaded application data:', appData.application)
      console.log('Application formData:', appData.application?.formData)
      
      setApplication(appData.application)
      setInterviews(appData.interviews || [])

      // Load interview criteria
      const criteriaResponse = await fetch('/api/test/interview-criteria')
      const criteriaData = await criteriaResponse.json()
      
      if (criteriaData.success) {
        setCriteria(criteriaData.criteria)
        // Initialize scores for each criteria
        setScores(criteriaData.criteria.map((c: InterviewCriteria) => ({
          criteriaId: c.id,
          score: 0,
          comments: ""
        })))
      }

      // Find current user's interview
      const userInterview = appData.interviews?.find((i: any) => i.interviewerId === user?.id)
      if (userInterview) {
        setCurrentInterview(userInterview)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleScoreChange = (criteriaId: string, score: number) => {
    setScores(prev => prev.map(s => 
      s.criteriaId === criteriaId ? { ...s, score } : s
    ))
  }

  const handleCommentChange = (criteriaId: string, comments: string) => {
    setScores(prev => prev.map(s => 
      s.criteriaId === criteriaId ? { ...s, comments } : s
    ))
      }

  const calculateTotalScore = () => {
    if (scores.length === 0) return 0
    const total = scores.reduce((sum, score) => sum + score.score, 0)
    return (total / scores.length).toFixed(1)
  }

  const calculateTotalScoreOutOf100 = () => {
    if (scores.length === 0) return 0
    
    // Calculate total from Google Sheets scores or temporary scores
    let total = 0
    
    if (hasTemporaryScores && Object.keys(editableScores).length > 0) {
      // Use temporary scores if they exist
      total = Object.values(editableScores).reduce((sum, score) => sum + score, 0)
    } else {
      // Use Google Sheets scores
      criteria.forEach(criterion => {
        total += getGoogleSheetsScore(applicationId, criterion.name)
      })
    }
    
    return total.toFixed(1)
  }

  // Calculate scores from application data based on interview criteria
  const calculateCriteriaScore = (criteriaName: string) => {
    if (!application?.formData) return 0
    
    const formData = application.formData
    
    // Debug: Log the form data structure
    console.log('Form data structure:', formData)
    console.log('Available form fields:', Object.keys(formData))
    
    // Find the criteria to get the correct max score
    const criterion = criteria.find(c => c.name === criteriaName)
    const maxScore = criterion?.maxScore || 10
    
    switch (criteriaName) {
      case "Education and Work Experience":
        let educationScore = 0
        let workScore = 0
        
        // Education scoring (max 15 points)
        const educationLevel = formData.q12 || formData.education || formData.educationLevel
        console.log('Education level field:', educationLevel)
        if (educationLevel) {
          switch (educationLevel.toLowerCase()) {
            case "master's degree":
            case "master":
              educationScore = 15
              break
            case "bachelor's degree":
            case "bachelor":
              educationScore = 12
              break
            case "diploma":
            case "tvet certificate":
              educationScore = 9
              break
            case "a level":
            case "secondary":
              educationScore = 6
              break
            case "o'level":
            case "primary":
              educationScore = 3
              break
            default:
              educationScore = 1
          }
        }
        
        // Work experience scoring (max 15 points)
        const workExperience = formData.q15 || formData.workExperience || formData.employmentStatus
        const yearsExperience = formData.q18 || formData.yearsExperience
        console.log('Work experience field:', workExperience)
        console.log('Years experience field:', yearsExperience)
        
        if (workExperience === "Yes" || workExperience === "Employed") {
          workScore = 8
          
          if (yearsExperience) {
            switch (yearsExperience) {
              case "More than 5 years":
              case "5+":
                workScore += 7
                break
              case "3-5 years":
              case "3-5":
                workScore += 5
                break
              case "1-2 years":
              case "1-2":
                workScore += 3
                break
              case "Less than 1 year":
              case "<1":
                workScore += 1
                break
            }
          }
        }
        
        const educationWorkScore = Math.min(maxScore, educationScore + workScore)
        console.log(`Education and Work Experience score: ${educationWorkScore}/${maxScore} (education: ${educationScore}, work: ${workScore})`)
        return educationWorkScore
        
      case "Digital Access and Literacy":
        let digitalScore = 0
        
        // Smartphone access (max 4 points)
        const hasSmartphone = formData.hasSmartphone || formData.smartphoneAccess || formData.q21 || formData.smartphone
        console.log('Smartphone access field:', hasSmartphone)
        if (hasSmartphone === "Yes" || hasSmartphone === true || hasSmartphone === "I have a smartphone") {
          digitalScore += 4
        }
        
        // Internet access (max 3 points)
        const hasInternet = formData.hasInternet || formData.internetAccess || formData.q22 || formData.internet
        console.log('Internet access field:', hasInternet)
        if (hasInternet === "Yes" || hasInternet === true || hasInternet === "I have internet access") {
          digitalScore += 3
        }
        
        // Digital skills (max 3 points)
        const digitalSkills = formData.digitalSkills || formData.skills || formData.q23 || formData.computerSkills || []
        console.log('Digital skills field:', digitalSkills)
        if (Array.isArray(digitalSkills) && digitalSkills.length > 0) {
          digitalScore += Math.min(3, digitalSkills.length)
        } else if (typeof digitalSkills === 'string' && digitalSkills !== "No") {
          digitalScore += 2
        }
        
        // App familiarity (max 2 points)
        const appFamiliarity = formData.appFamiliarity || formData.q24 || formData.mobileApps
        console.log('App familiarity field:', appFamiliarity)
        if (appFamiliarity === "Yes" || appFamiliarity === "I use mobile apps") {
          digitalScore += 2
        }
        
        // Additional digital access factors for higher max score (15 points total)
        // Device ownership (max 1 point)
        const deviceOwner = formData.deviceOwner || formData.q25 || formData.phoneOwner
        console.log('Device owner field:', deviceOwner)
        if (deviceOwner === "Myself" || deviceOwner === "I own my phone") {
          digitalScore += 1
        } else if (deviceOwner === "Family member" || deviceOwner === "Shared with family") {
          digitalScore += 0.5
        }
        
        // Internet usage frequency (max 1 point)
        const internetUsage = formData.internetUsage || formData.q26 || formData.internetFrequency
        console.log('Internet usage field:', internetUsage)
        if (internetUsage === "Daily" || internetUsage === "Every day") {
          digitalScore += 1
        } else if (internetUsage === "Weekly" || internetUsage === "A few times a week") {
          digitalScore += 0.5
        }
        
        // Used apps (max 1 point)
        const usedApps = formData.usedApps || formData.q27 || formData.appsUsed || []
        console.log('Used apps field:', usedApps)
        if (Array.isArray(usedApps) && usedApps.length > 0) {
          digitalScore += Math.min(1, usedApps.length * 0.2)
        } else if (typeof usedApps === 'string' && usedApps !== "None") {
          digitalScore += 0.5
        }
        
        const digitalAccessScore = Math.min(maxScore, digitalScore)
        console.log(`Digital Access and Literacy score: ${digitalAccessScore}/${maxScore}`)
        return digitalAccessScore
        
      case "Socio-Economic and Vulnerability Status":
        let vulnerabilityScore = 0
        
        // Income level
        const monthlyIncome = formData.q19 || formData.monthlyIncome
        console.log('Monthly income field:', monthlyIncome)
        if (monthlyIncome) {
          const income = parseInt(monthlyIncome)
          if (income < 50000) {
            vulnerabilityScore += 4
          } else if (income < 100000) {
            vulnerabilityScore += 2
          }
        }
        
        // Employment status
        const employmentStatus = formData.q15 || formData.employmentStatus
        console.log('Employment status field:', employmentStatus)
        if (employmentStatus === "Unemployed" || employmentStatus === "No") {
          vulnerabilityScore += 3
        }
        
        // Family status
        const dependents = formData.dependents
        console.log('Dependents field:', dependents)
        if (dependents && parseInt(dependents) > 3) {
          vulnerabilityScore += 2
        }
        
        // Disability
        const hasDisability = formData.disability
        console.log('Disability field:', hasDisability)
        if (hasDisability === "Yes") {
          vulnerabilityScore += 1
        }
        
        const socioEconomicScore = Math.min(maxScore, vulnerabilityScore)
        console.log(`Socio-Economic and Vulnerability Status score: ${socioEconomicScore}/${maxScore}`)
        return socioEconomicScore
        
      case "Living Environment & Community Connections":
        let environmentScore = 0
        
        // Community involvement
        const communityInvolvement = formData.communityInvolvement
        console.log('Community involvement field:', communityInvolvement)
        if (communityInvolvement === "Yes") {
          environmentScore += 3
        }
        
        // Housing type
        const housingType = formData.housingType
        console.log('Housing type field:', housingType)
        if (housingType === "Rented" || housingType === "Shared") {
          environmentScore += 2
        }
        
        // Languages (indicates community connections)
        const languages = formData.q20 || formData.languages || []
        console.log('Languages field:', languages)
        if (Array.isArray(languages) && languages.length > 1) {
          environmentScore += 2
        }
        
        // Location (rural vs urban)
        const sector = formData.sector
        console.log('Sector field:', sector)
        if (sector && sector.toLowerCase().includes("rural")) {
          environmentScore += 1
        }
        
        // Support network
        const supportNetwork = formData.supportNetwork
        console.log('Support network field:', supportNetwork)
        if (supportNetwork === "Yes") {
          environmentScore += 2
        }
        
        const environmentCommunityScore = Math.min(maxScore, environmentScore)
        console.log(`Living Environment & Community Connections score: ${environmentCommunityScore}/${maxScore}`)
        return environmentCommunityScore
        
      default:
        return 0
    }
  }

  // Fetch Google Sheets scores
  const fetchGoogleSheetsScores = async () => {
    try {
      setScoresLoading(true)
      const response = await fetch('/api/test/google-sheets-scores')
      if (response.ok) {
        const data = await response.json()
        setGoogleSheetsScores(data.results || [])
        console.log('📊 Google Sheets scores loaded:', data.results?.length || 0)
      } else {
        console.error('Failed to fetch Google Sheets scores')
      }
    } catch (error) {
      console.error('Error fetching Google Sheets scores:', error)
    } finally {
      setScoresLoading(false)
    }
  }

  // Handle edit mode functions
  const handleEditMode = () => {
    setEditMode(true)
    // Initialize editable scores with current Google Sheets scores
    const initialScores: {[key: string]: number} = {}
    criteria.forEach(criterion => {
      initialScores[criterion.name] = getGoogleSheetsScore(applicationId, criterion.name)
    })
    setEditableScores(initialScores)
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setEditableScores({})
    setHasTemporaryScores(false)
  }

  const handleSaveEdit = async () => {
    try {
      // Temporarily save the edited scores to local state
      setEditMode(false)
      setHasTemporaryScores(true)
      toast({
        title: "Scores Saved Temporarily",
        description: "Scores have been saved temporarily. Click 'Submit Interview Scores' to save to database.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save scores temporarily",
        variant: "destructive",
      })
    }
  }

  const handleScoreEdit = (criteriaName: string, newScore: number) => {
    setEditableScores(prev => ({
      ...prev,
      [criteriaName]: Math.max(0, Math.min(newScore, criteria.find(c => c.name === criteriaName)?.maxScore || 10))
    }))
  }

  // Get score from Google Sheets data or temporary scores
  const getGoogleSheetsScore = (applicationId: string, criteriaName: string) => {
    // If we have temporary scores, return those instead
    if (hasTemporaryScores && editableScores[criteriaName] !== undefined) {
      return editableScores[criteriaName]
    }
    
    console.log(`🔍 Looking for application ID: ${applicationId}`)
    console.log(`📊 Available Google Sheets IDs (first 5):`, googleSheetsScores.slice(0, 5).map(s => s.ID))
    
    const applicantData = googleSheetsScores.find(score => score.ID === applicationId)
    if (!applicantData) {
      console.log(`❌ No Google Sheets data found for application ID: ${applicationId}`)
      console.log(`📊 Total Google Sheets records: ${googleSheetsScores.length}`)
      return 0
    }
    console.log(`✅ Found Google Sheets data for ${applicationId}:`, applicantData)

    switch (criteriaName) {
      case "Education and Work Experience":
        return applicantData.educationWorkScore || 0
      case "Digital Access and Literacy":
        return applicantData.digitalAccessScore || 0
      case "Socio-Economic and Vulnerability Status":
        return applicantData.socioEconomicScore || 0
      case "Living Environment & Community Connections":
        return applicantData.environmentCommunityScore || 0
      default:
        return 0
    }
  }

  const handleSubmitScores = async () => {
    if (!currentInterview) {
      toast({
        title: "Error",
        description: "No interview found for current user",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    
    try {
      // Prepare scores to submit - include temporary scores if they exist
      let scoresToSubmit = scores
      
      if (hasTemporaryScores && Object.keys(editableScores).length > 0) {
        // Convert temporary scores to the format expected by the API
        const temporaryScoresArray = criteria.map(criterion => ({
          criteriaId: criterion.id,
          score: editableScores[criterion.name] || 0,
          comments: scores.find(s => s.criteriaId === criterion.id)?.comments || ""
        }))
        scoresToSubmit = temporaryScoresArray
      }

      const response = await fetch('/api/test/submit-interview-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: currentInterview.id,
          scores: scoresToSubmit,
          temporaryScores: hasTemporaryScores ? editableScores : null
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Clear temporary scores after successful submission
        setHasTemporaryScores(false)
        setEditableScores({})
        
        toast({
          title: "Success",
          description: "Interview scores submitted successfully to database",
        })
        // Reload data to show updated status
        await loadData()
      } else {
        throw new Error(data.message)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to submit scores",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'INTERVIEW_INVITED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderFormAnswers = () => {
    if (!application?.formData) return <p className="text-gray-500">No form data available</p>
    
    return Object.entries(application.formData).map(([key, value]) => (
      <div key={key} className="border-b pb-4 mb-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">{key}</h4>
        <p className="text-sm bg-gray-50 p-3 rounded">{String(value)}</p>
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Interview</h3>
                <p className="text-gray-600">Preparing the interview dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto py-8">
          <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Error Loading Interview</h3>
              <p className="text-gray-600 text-center max-w-md mb-6">{error}</p>
              <Button 
                onClick={() => router.push(`/${lang}/dashboard/applications`)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 px-4">
        {/* Enhanced Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push(`/${lang}/dashboard/applications`)}
            className="mb-6 hover:bg-white/80 transition-all duration-200 shadow-sm border-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
          

        </div>

      <Tabs defaultValue="overview" className="space-y-8">
        {/* Applicant Name Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {getApplicantName(application) || application?.email || "Applicant"}
                </h2>
                <p className="text-gray-600 text-sm">
                  Application ID: {application?.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(application?.status || '')} font-semibold px-4 py-2`}>
                {application?.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-3">
          <TabsList className="grid w-full grid-cols-3 bg-transparent gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-xl transition-all duration-300">
              <User className="h-5 w-5" />
              <span className="font-semibold">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="interview" className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-50 data-[state=active]:to-indigo-100 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200 rounded-xl transition-all duration-300">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">Interview</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-50 data-[state=active]:to-orange-100 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200 rounded-xl transition-all duration-300">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Results</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8">
          <ApplicationInsights application={application} />
          
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 p-6">
                <CardTitle className="flex items-center gap-3 text-blue-800 text-xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Applicant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
                    <span className="font-semibold text-gray-700">ID:</span>
                    <span className="text-sm font-mono bg-gray-200 px-3 py-2 rounded-lg font-medium">{application?.id}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
                    <span className="font-semibold text-gray-700">Email:</span>
                    <span className="text-sm text-gray-600 font-medium">{application?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
                    <span className="font-semibold text-gray-700">Status:</span>
                    <Badge className={`${getStatusColor(application?.status)} font-semibold px-4 py-2`}>
                      {application?.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-200 p-6">
                <CardTitle className="flex items-center gap-3 text-emerald-800 text-xl">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  Interview Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {interviews.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Calendar className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-6 text-lg">No interviews scheduled yet.</p>
                    <Button 
                      onClick={() => setShowAssignModal(true)}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Assign Interviewers
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviews.map((interview, index) => (
                      <div key={interview.id} className="border border-gray-200 rounded-2xl p-5 hover:bg-gray-50 transition-all duration-300 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-gray-800 text-lg">Interview #{index + 1}</h4>
                          <Badge className={`${getStatusColor(interview.status)} font-semibold px-4 py-2`}>
                            {interview.status}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-gray-700 font-medium">{interview.interviewer?.name || interview.interviewerId}</span>
                          </div>
                          {interview.overallScore && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Star className="h-4 w-4 text-yellow-600" />
                              </div>
                              <span className="font-semibold text-gray-700">Score: {interview.overallScore}/100</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>





        <TabsContent value="interview" className="space-y-8">
          <InterviewQuestions application={application} onScoresSubmitted={handleScoresSubmitted} />
        </TabsContent>



        <TabsContent value="results" className="space-y-6">
          {applicationId && (
            <InterviewResultsTab key={scoresSubmitted} applicationId={applicationId} />
          )}
        </TabsContent>
      </Tabs>

      {applicationId && (
        <AssignInterviewersModal
          applicationId={applicationId}
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => {
            setShowAssignModal(false)
            loadData()
          }}
        />
      )}
    </div>
  </div>
  )
} 