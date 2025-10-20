"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, AlertCircle, RefreshCw, Database, FileSpreadsheet, Users, Search, Filter, Download, Mail, Calendar, TrendingUp, Activity, Star, Zap, Target, BarChart3, MapPin, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ApplicationsTable from "./applications-table"
import { BulkEmailDialog } from "./bulk-email-dialog"
import { ApplicationWithRelations } from "@/types/application"
import { useToast } from "@/components/ui/use-toast"
import { AIEvaluationButton } from "./ai-evaluation-button"
import { getApplicationsWithAuth, getInterviewInvitedApplicationsFromDb, getInterviewedApplicationsFromDb, getSubmittedApplicationsFromGoogleSheets, forceLiveReloadFromGoogleSheets } from "./actions"
import { applicationsTranslations } from "../../translations/applications"
import { Badge } from "@/components/ui/badge"
import { ApplicationAnalytics } from "./application-analytics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ExcelImport } from "./excel-import"
import "./stl.css"
import { AuthHelper } from "@/components/auth-helper"
import SimpleApplicationsDashboard from "./simple-dashboard"
import DatabaseApplicationsDashboard from "./database-dashboard"
import ModernApplicationsDashboard from "./modern-dashboard"
import { DistrictFilter, applicationMatchesDistrictFilter } from "./components/district-filter"
import { ProvinceCards } from "./components/province-cards"

function LoadingState({ lang }: { lang: string }) {
  return (
    <div className="applications-dashboard min-h-screen bg-background font-sans">
      <div className="container mx-auto py-8 px-4">
        <Card className="card elevated rounded-xl border-0 bg-card shadow-lg">
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-accent rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-secondary rounded-full animate-spin" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-foreground tracking-tight">
                  {lang === 'rw' ? 'Guhuza ubusabe...' : 'Loading Applications'}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  {lang === 'rw' ? 'Turabikora vuba...' : 'Please wait while we fetch your data'}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>{lang === 'rw' ? 'Kugenzura cache...' : 'Checking cache...'}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{lang === 'rw' ? 'Kugenzura Google Sheets...' : 'Fetching from Google Sheets...'}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>{lang === 'rw' ? 'Kugenzura database...' : 'Merging with database...'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry, lang }: { message: string; onRetry: () => void; lang: string }) {
  const t = applicationsTranslations[lang as keyof typeof applicationsTranslations] || applicationsTranslations.en
  
  return (
    <div className="applications-dashboard min-h-screen bg-background font-sans">
      <div className="container mx-auto py-8 px-4">
        <Card className="card elevated rounded-xl border-0 bg-card shadow-lg">
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full animate-pulse"></div>
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold text-foreground tracking-tight">{t.errors.fetchFailed}</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md font-medium">{message}</p>
            </div>
            <Button
              onClick={onRetry}
              className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-sm hover:shadow-md transition-all duration-200 font-semibold px-8 py-4 rounded-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.buttons.refresh}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ApplicationsPage() {
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang as string || 'en'
  const { isAuthenticated, isLoading, user } = useAuth()
  const [applications, setApplications] = useState<ApplicationWithRelations[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedApplications, setSelectedApplications] = useState<ApplicationWithRelations[]>([])
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isInvitingToInterview, setIsInvitingToInterview] = useState(false)
  const [dataSource, setDataSource] = useState<'google-sheets' | 'database' | null>(null)
  const { toast } = useToast()
  const [interviewInvitedApplications, setInterviewInvitedApplications] = useState<ApplicationWithRelations[]>([])
  const [interviewedApplications, setInterviewedApplications] = useState<ApplicationWithRelations[]>([])
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null)
  const [useSimpleDashboard, setUseSimpleDashboard] = useState(false)
  const [useDatabaseOnly, setUseDatabaseOnly] = useState(false)
  const [useModernDashboard, setUseModernDashboard] = useState(true)
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithRelations[]>([])

  // Get translations for current language
  const t = applicationsTranslations[lang as keyof typeof applicationsTranslations] || applicationsTranslations.en

  // Debug logging
  console.log("🔍 ApplicationsPage Debug:", {
    isAuthenticated,
    isLoading: loading,
    user,
    applicationsLength: applications.length,
    error,
    dataSource,
    useSimpleDashboard,
    cacheBuster: Date.now() // Force cache refresh
  })

  // New loader for Submitted Applications from Google Sheets
  const loadSubmittedApplicationsFromGoogleSheets = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Loading submitted applications from Google Sheets...")
      
      const data = await getSubmittedApplicationsFromGoogleSheets()
      
      console.log("📊 Google Sheets submitted applications data received:", data)
      console.log("📊 Data type:", typeof data)
      console.log("📊 Is array:", Array.isArray(data))
      
      if (Array.isArray(data)) {
        console.log("✅ Data is array, processing submitted applications from Google Sheets...")
        console.log("📊 Submitted applications from Google Sheets found:", data.length)
        
        // Transform the data to match ApplicationWithRelations expected by the table
        const transformedData = data.map(app => {
          // Extract total score for sorting
          let totalScore = 0
          if (app.formData && app.formData['Total Score'] !== undefined) {
            totalScore = Number(app.formData['Total Score']) || 0
          } else if (app.evaluations && app.evaluations.length > 0) {
            totalScore = app.evaluations[0].score || 0
          }
          
          return {
            ...app,
            formData: app.formData || {},
            createdAt: app.createdAt || new Date().toISOString(),
            updatedAt: app.updatedAt || new Date().toISOString(),
            user: app.user || null,
            evaluations: app.evaluations || [],
            totalScore: totalScore
          }
        })
        
        setApplications(transformedData as ApplicationWithRelations[])
        setDataSource('google-sheets')
        console.log("✅ Submitted applications from Google Sheets loaded successfully:", transformedData.length)
        setLastRefreshedAt(new Date())
        
        // Show success message
        toast({
          title: lang === 'rw' ? 'Amakuru' : 'Success',
          description: lang === 'rw' 
            ? `Amakuru ya vuba yerekwa kuri Google Sheets (${transformedData.length} ubwishingizi)`
            : `Data loaded from Google Sheets (${transformedData.length} applications)`,
          variant: "default",
        })
        
        // Debug: Check totalScore values
        const appsWithScores = transformedData.filter(app => app.totalScore && app.totalScore > 0)
        console.log(`🔍 Applications with totalScore: ${appsWithScores.length}/${transformedData.length}`)
        if (appsWithScores.length > 0) {
          console.log("🔍 First 5 apps with scores:")
          appsWithScores.slice(0, 5).forEach((app, index) => {
            console.log(`${index + 1}. ${app.formData?.['First Name']} ${app.formData?.['Lat Name']} - Score: ${app.totalScore}`)
          })
        }
      } else {
        console.warn("⚠️ Google Sheets data is not an array:", data)
        setApplications([])
        setDataSource('google-sheets')
      }
      
    } catch (error) {
      console.error("❌ Error loading submitted applications from Google Sheets:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch submitted applications from Google Sheets"
      setError(errorMessage)
      setApplications([])
      
      // Show error message
      toast({
        title: lang === 'rw' ? 'Ikosa' : 'Error',
        description: lang === 'rw' 
          ? 'Ntabwo byashoboka kugenzura amakuru kuri Google Sheets'
          : 'Failed to load data from Google Sheets',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadApplications = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Loading applications...")
      console.log("👤 Current user:", user)
      console.log("🔐 Is authenticated:", isAuthenticated)

      // Set a timeout to show partial data if loading takes too long
      const timeoutId = setTimeout(() => {
        console.log("⚠️ Loading timeout reached, showing partial data...")
        toast({
          title: lang === 'rw' ? 'Ikosa' : 'Warning',
          description: lang === 'rw' 
            ? 'Kugenzura byose byatangiye. Urashobora kubona amakuru ya vuba.'
            : 'Loading is taking longer than expected. You can view partial data.',
          variant: "default",
        })
      }, 8000) // Show warning after 8 seconds
      
      setLoadingTimeout(timeoutId)

      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      )

      // Fetch applications using the action with timeout
      console.log("🔄 Calling getApplicationsWithAuth...")
      const data = await Promise.race([
        getApplicationsWithAuth(),
        timeoutPromise
      ])
      
      console.log("📊 Applications data received:", data)
      console.log("📊 Data type:", typeof data)
      console.log("📊 Is array:", Array.isArray(data))
      
      // Handle error responses
      if (data && typeof data === 'object' && 'error' in data) {
        console.error("❌ Error response received:", data)
        
        // Try fallback to debug endpoint if authentication failed
        if (data.error.includes('Authentication') || data.error.includes('Unauthorized')) {
          console.log("🔄 Authentication failed, trying debug endpoint...")
          try {
            const debugResponse = await fetch('/api/debug-applications', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            })
            
            if (debugResponse.ok) {
              const debugData = await debugResponse.json()
              console.log("✅ Debug data received:", debugData.count, "applications")
              
              if (debugData.applications && Array.isArray(debugData.applications)) {
                // Filter for only SUBMITTED status applications
                const submittedApplications = debugData.applications.filter((app: any) => app.status === "SUBMITTED")
                
                // Transform the data
                const transformedData = submittedApplications.map((app: any) => {
                  let totalScore = 0
                  if (app.formData && app.formData['Total Score'] !== undefined) {
                    totalScore = Number(app.formData['Total Score']) || 0
                  } else if (app.evaluations && app.evaluations.length > 0) {
                    totalScore = app.evaluations[0].score || 0
                  }
                  
                  return {
                    ...app,
                    formData: app.formData || {},
                    createdAt: app.createdAt || new Date().toISOString(),
                    updatedAt: app.updatedAt || new Date().toISOString(),
                    user: app.user || null,
                    evaluations: app.evaluations || [],
                    totalScore: totalScore
                  }
                })
                
                setApplications(transformedData as ApplicationWithRelations[])
                setDataSource('database')
                console.log("✅ Debug applications loaded successfully:", transformedData.length)
                
                // Show warning about authentication
                toast({
                  title: lang === 'rw' ? 'Ikosa' : 'Authentication Warning',
                  description: lang === 'rw' 
                    ? 'Ntabwo ufite uburenganzira. Amakuru ya vuba yerekwa.'
                    : 'You may not have full access. Showing limited data.',
                  variant: "default",
                })
                return
              }
            }
          } catch (debugError) {
            console.error("❌ Debug endpoint also failed:", debugError)
          }
        }
        
        throw new Error(data.error as string)
      }
      
      // Ensure data is an array and transform to expected format
      if (Array.isArray(data)) {
        console.log("✅ Data is array, processing applications...")
        // Filter for only SUBMITTED status applications
        const submittedApplications = data.filter(app => app.status === "SUBMITTED")
        console.log("📊 Submitted applications found:", submittedApplications.length)
        
        // Transform the data to match ApplicationWithRelations expected by the table
        const transformedData = submittedApplications.map(app => {
          // Extract total score for sorting
          let totalScore = 0
          if (app.formData && app.formData['Total Score'] !== undefined) {
            totalScore = Number(app.formData['Total Score']) || 0
          } else if (app.evaluations && app.evaluations.length > 0) {
            totalScore = app.evaluations[0].score || 0
          }
          
          return {
            ...app,
            formData: app.formData || {},
            createdAt: app.createdAt || new Date().toISOString(),
            updatedAt: app.updatedAt || new Date().toISOString(),
            user: app.user || null,
            evaluations: app.evaluations || [],
            totalScore: totalScore
          }
        })
        setApplications(transformedData as ApplicationWithRelations[])
        console.log("✅ Submitted applications loaded successfully:", transformedData.length)
        
        // Debug: Check totalScore values
        const appsWithScores = transformedData.filter(app => app.totalScore && app.totalScore > 0)
        console.log(`🔍 Applications with totalScore: ${appsWithScores.length}/${transformedData.length}`)
        if (appsWithScores.length > 0) {
          console.log("🔍 First 5 apps with scores:")
          appsWithScores.slice(0, 5).forEach((app, index) => {
            console.log(`${index + 1}. ${app.formData?.['First Name']} ${app.formData?.['Lat Name']} - Score: ${app.totalScore}`)
          })
        }
        
        // Determine data source based on application IDs
        const hasGoogleSheetsData = transformedData.some(app => app.id?.startsWith('GS-'))
        setDataSource(hasGoogleSheetsData ? 'google-sheets' : 'database')
        
        // Debug: Check for INTERVIEW_INVITED applications
        const interviewInvitedApps = transformedData.filter(app => app.status === "INTERVIEW_INVITED")
        console.log("🔍 Applications with INTERVIEW_INVITED status:", interviewInvitedApps.length)
        if (interviewInvitedApps.length > 0) {
          console.log("📋 INTERVIEW_INVITED applications:", interviewInvitedApps.map(app => ({ id: app.id, status: app.status })))
        }
      } else {
        console.warn("⚠️ Applications data is not an array:", data)
        console.warn("⚠️ Data type:", typeof data)
        if (data && typeof data === 'object') {
          console.warn("⚠️ Data keys:", Object.keys(data))
        }
        setApplications([])
        setDataSource('database')
      }
      
    } catch (error) {
      console.error("❌ Error loading applications:", error)
      const errorMessage = error instanceof Error ? error.message : t.errors.fetchFailed
      
      // Try fallback to direct database fetch
      try {
        console.log("🔄 Trying fallback to direct database fetch...")
        const response = await fetch('/api/applications/direct', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const fallbackData = await response.json()
          console.log("✅ Fallback data received:", fallbackData.length, "applications")
          
          // Filter for only SUBMITTED status applications
          const submittedApplications = fallbackData.filter((app: any) => app.status === "SUBMITTED")
          
          // Transform the data
          const transformedData = submittedApplications.map((app: any) => {
            let totalScore = 0
            if (app.formData && app.formData['Total Score'] !== undefined) {
              totalScore = Number(app.formData['Total Score']) || 0
            } else if (app.evaluations && app.evaluations.length > 0) {
              totalScore = app.evaluations[0].score || 0
            }
            
            return {
              ...app,
              formData: app.formData || {},
              createdAt: app.createdAt || new Date().toISOString(),
              updatedAt: app.updatedAt || new Date().toISOString(),
              user: app.user || null,
              evaluations: app.evaluations || [],
              totalScore: totalScore
            }
          })
          
          setApplications(transformedData as ApplicationWithRelations[])
          setDataSource('database')
          console.log("✅ Fallback applications loaded successfully:", transformedData.length)
          
          // Show warning about fallback
          toast({
            title: lang === 'rw' ? 'Ikosa' : 'Limited Access',
            description: lang === 'rw' 
              ? 'Amakuru ya vuba yerekwa. Ongera ugerageza kwinjira.'
              : 'Showing limited data. Please try logging in again.',
            variant: "default",
          })
          return
        }
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError)
      }
      
      setError(errorMessage)
      setApplications([])
    } finally {
      setLoading(false)
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
        setLoadingTimeout(null)
      }
    }
  }

  // New loader for Interview Invited tab
  const loadInterviewInvitedApplications = async () => {
    try {
      setLoading(true)
      const data = await getInterviewInvitedApplicationsFromDb()
      
      if (Array.isArray(data)) {
        // Transform the data to match ApplicationWithRelations expected by the table
        const transformedData = data.map(app => {
          // Extract total score for sorting
          let totalScore = 0
          if (app.formData && app.formData['Total Score'] !== undefined) {
            totalScore = Number(app.formData['Total Score']) || 0
          } else if (app.evaluations && app.evaluations.length > 0) {
            totalScore = app.evaluations[0].score || 0
          }
          
          return {
            ...app,
            formData: app.formData || {},
            createdAt: app.createdAt || new Date().toISOString(),
            updatedAt: app.updatedAt || new Date().toISOString(),
            user: app.user || null,
            evaluations: app.evaluations || [],
            totalScore: totalScore
          }
        })
        
        setInterviewInvitedApplications(transformedData as ApplicationWithRelations[])
        console.log("✅ Interview invited applications loaded successfully:", transformedData.length)
      } else {
        setInterviewInvitedApplications([])
      }
    } catch (error) {
      console.error("❌ Error loading interview invited applications:", error)
      setInterviewInvitedApplications([])
    } finally {
      setLoading(false)
    }
  }

  // New loader for Interviewed tab
  const loadInterviewedApplications = async () => {
    try {
      setLoading(true)
      const data = await getInterviewedApplicationsFromDb()
      
      if (Array.isArray(data)) {
        // The getInterviewedApplicationsFromDb function already calculates totalScore from Google Sheets
        // Just ensure the data structure is correct for the table
        const transformedData = data.map(app => {
          return {
            ...app,
            formData: app.formData || {},
            createdAt: app.createdAt || new Date().toISOString(),
            updatedAt: app.updatedAt || new Date().toISOString(),
            user: app.user || null,
            evaluations: app.evaluations || [],
            // Keep the totalScore that was already calculated from Google Sheets
            totalScore: app.totalScore || 0
          }
        })
        
        setInterviewedApplications(transformedData as ApplicationWithRelations[])
        console.log("✅ Interviewed applications loaded successfully:", transformedData.length)
        console.log("📊 Sample totalScore values:", transformedData.slice(0, 3).map(app => ({ id: app.id, totalScore: app.totalScore })))
        
        // Additional debug logging
        transformedData.slice(0, 3).forEach((app, index) => {
          console.log(`📊 App ${index + 1}: ID=${app.id}, totalScore=${app.totalScore}, type=${typeof app.totalScore}`)
        })
      } else {
        setInterviewedApplications([])
      }
    } catch (error) {
      console.error("❌ Error loading interviewed applications:", error)
      setInterviewedApplications([])
    } finally {
      setLoading(false)
    }
  }

  // Simple authentication check
  useEffect(() => {
    console.log("🔍 Auth state changed:", { isAuthenticated, isLoading, user: user?.email, role: user?.role })
    
    if (isLoading) {
      return // Still loading auth state
    }
    
    if (!isAuthenticated) {
      console.log("🔄 Not authenticated, redirecting to login")
      router.push(`/${lang}/login`)
      return
    }
    
    if (!user) {
      console.log("🔄 No user data, redirecting to login")
      router.push(`/${lang}/login`)
      return
    }
    
    // Check if user has the right role
    if (user.role !== "EMPLOYER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== "INTERVIEWER" && user.role !== "BRANCH_MANAGER") {
      console.log(`🔄 User role '${user.role}' not authorized for applications dashboard`)
      // Redirect AGENT users to their specific applications page
      if (user.role === "AGENT") {
        router.push(`/${lang}/dashboard/agent-applications`)
        return
      }
      // Redirect other users to general dashboard
      router.push(`/${lang}/dashboard`)
      return
    }
    
    // User is authenticated and has the right role, load submitted applications from Google Sheets
    console.log("✅ User authorized, loading submitted applications from Google Sheets")
    loadSubmittedApplicationsFromGoogleSheets()
  }, [isAuthenticated, isLoading, user, lang])

  // Add a useEffect to load interview invited apps on mount
  useEffect(() => {
    loadInterviewInvitedApplications()
  }, [])

  // Add a useEffect to load interviewed apps on mount
  useEffect(() => {
    loadInterviewedApplications()
  }, [])

  // Filter applications based on selected districts
  useEffect(() => {
    if (selectedDistricts.length === 0) {
      setFilteredApplications(applications)
    } else {
      const filtered = applications.filter(app => 
        applicationMatchesDistrictFilter(app, selectedDistricts)
      )
      setFilteredApplications(filtered)
    }
  }, [applications, selectedDistricts])

  // Show loading state while auth is being determined
  if (isLoading) {
    return <LoadingState lang={lang} />
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {lang === 'rw' ? 'Ikosa' : 'Error'}
            </h1>
            <p className="text-muted-foreground">
              {error}
            </p>
          </div>
          
          {/* Show auth helper if it's an authentication error */}
          {(error.includes('Authentication') || error.includes('Unauthorized')) && (
            <div className="mb-6">
              <AuthHelper lang={lang} />
            </div>
          )}
          
          <ErrorState message={error} onRetry={loadApplications} lang={lang} />
        </div>
      </div>
    )
  }

  // Ensure applications is always an array
  const safeApplications = Array.isArray(applications) ? applications : []

  const handleViewApplication = (id: string) => {
    router.push(`/${lang}/dashboard/applications/${id}`)
  }

  const handleSendBulkEmail = (selectedApps: ApplicationWithRelations[]) => {
    setSelectedApplications(selectedApps)
    setIsEmailDialogOpen(true)
  }

  const handleRefresh = () => {
    loadApplications()
  }

  // Auto-refresh every 30 seconds (pause when tab hidden)
  useEffect(() => {
    if (!autoRefresh) return
    let interval: NodeJS.Timeout | null = null

    const tick = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        loadSubmittedApplicationsFromGoogleSheets()
      }
    }

    interval = setInterval(tick, 30000)
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, lang])

  const handleForceLiveReload = async () => {
    try {
      const result = await forceLiveReloadFromGoogleSheets()
      if ((result as any)?.success) {
        await loadSubmittedApplicationsFromGoogleSheets()
        toast({ title: 'Live Reload', description: 'Cache cleared. Fetched fresh data.' })
      } else {
        toast({ title: 'Live Reload Failed', description: 'Could not clear cache.', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Live Reload Error', description: 'Unexpected error during live reload.', variant: 'destructive' })
    }
  }

  const handleInviteToInterview = async (selectedApps: ApplicationWithRelations[]) => {
    console.log("🔍 Invite to interview called with:", selectedApps.length, "applications")
    console.log("🔍 Current user:", user)
    console.log("🔍 User role:", user?.role)
    
    if (selectedApps.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one application to invite to interview",
        variant: "destructive",
      })
      return
    }

    setIsInvitingToInterview(true)
    try {
      const selectedApplicationIds = selectedApps.map(app => app.id)
      console.log("🔍 Selected application IDs:", selectedApplicationIds)
      
      // Invite each selected application to interview
      const results = await Promise.allSettled(
        selectedApplicationIds.map(async (applicationId) => {
          console.log("🔍 Making API call to invite application:", applicationId)
          
          // Debug: Check if we have cookies
          console.log("🔍 Document cookies:", document.cookie)
          
          // Ensure we're using the correct API URL
          const apiUrl = "/api/v1/applications/invite-to-interview"
          console.log("🔍 Calling API URL:", apiUrl)
          
          const response = await fetch(apiUrl, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              applicationId
            })
          })

          console.log("🔍 API response status:", response.status)
          console.log("🔍 API response ok:", response.ok)
          console.log("🔍 API response URL:", response.url)

          if (!response.ok) {
            const errorText = await response.text()
            console.log("🔍 API error response:", errorText)
            
            // If we get a 404, it might be a routing issue
            if (response.status === 404) {
              console.error("🔍 404 Error - API route not found. Check if the route is deployed correctly.")
            }
            
            // If we get a 401, it's an auth issue
            if (response.status === 401) {
              console.error("🔍 401 Error - Authentication failed. Token might be expired.")
              // Try to refresh the page or redirect to login
              window.location.reload()
              return
            }
            
            throw new Error(`Failed to invite application ${applicationId}: ${response.status} ${errorText}`)
          }

          const data = await response.json()
          console.log("🔍 API success response:", data)
          return { applicationId, success: data.success, message: data.message }
        })
      )

      // Count successes and failures
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length
      const failed = results.length - successful

      console.log("📊 Interview invitation results:", { successful, failed, total: results.length })

      // Status is now updated automatically by the invite-interview endpoint
      const statusUpdateSuccessful = successful
      const statusUpdateFailed = failed

      // Refresh applications list
      await loadApplications()

      // Show results
      if (statusUpdateSuccessful > 0 && statusUpdateFailed === 0) {
        toast({
          title: "Success",
          description: `Successfully invited ${statusUpdateSuccessful} application(s) to interview`,
        })
      } else if (statusUpdateSuccessful > 0 && statusUpdateFailed > 0) {
        toast({
          title: "Partial Success",
          description: `Invited ${statusUpdateSuccessful} application(s) to interview. ${statusUpdateFailed} failed.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to invite ${statusUpdateFailed} application(s) to interview`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error inviting to interview:", error)
      toast({
        title: "Error",
        description: "Failed to invite applications to interview",
        variant: "destructive",
      })
    } finally {
      setIsInvitingToInterview(false)
    }
  }

  // Use modern dashboard by default
  if (useModernDashboard) {
    return <ModernApplicationsDashboard />
  }

  // Use database-only dashboard as fallback
  if (useDatabaseOnly) {
    return <DatabaseApplicationsDashboard />
  }

  // Use simple dashboard as fallback
  if (useSimpleDashboard) {
    return <SimpleApplicationsDashboard />
  }

  return (
    <div className="applications-dashboard min-h-screen bg-background font-sans">
      <div className="container mx-auto py-8 px-4">
        {/* Debug Info - Remove this later */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-bold text-yellow-800">Debug Info:</h3>
          <p className="text-xs text-yellow-700">
            Auth: {isAuthenticated ? 'Yes' : 'No'} | 
            Loading: {loading ? 'Yes' : 'No'} | 
            Apps: {applications.length} | 
            Error: {error || 'None'} | 
            User: {user?.email || 'None'} |
            Modern Dashboard: {useModernDashboard ? 'Yes' : 'No'} |
            Database Only: {useDatabaseOnly ? 'Yes' : 'No'} |
            Simple Dashboard: {useSimpleDashboard ? 'Yes' : 'No'}
          </p>
          <div className="mt-2 space-x-2">
            <Button 
              onClick={() => {
                setUseModernDashboard(!useModernDashboard)
                setUseDatabaseOnly(false)
                setUseSimpleDashboard(false)
              }}
              variant="outline"
              size="sm"
            >
              {useModernDashboard ? 'Use Database Dashboard' : 'Use Modern Dashboard'}
            </Button>
            <Button 
              onClick={() => {
                setUseDatabaseOnly(!useDatabaseOnly)
                setUseModernDashboard(false)
                setUseSimpleDashboard(false)
              }}
              variant="outline"
              size="sm"
            >
              {useDatabaseOnly ? 'Use Modern Dashboard' : 'Use Database Only'}
            </Button>
            <Button 
              onClick={() => {
                setUseSimpleDashboard(!useSimpleDashboard)
                setUseModernDashboard(false)
                setUseDatabaseOnly(false)
              }}
              variant="outline"
              size="sm"
            >
              {useSimpleDashboard ? 'Use Modern Dashboard' : 'Use Simple Dashboard'}
            </Button>
          </div>
        </div>

        {/* Enhanced Application Analytics */}
        {!loading && safeApplications.length > 0 && (
          <div className="mb-8 animate-slide-in-left">
            <ApplicationAnalytics 
              applications={safeApplications}
              lang={lang}
            />
          </div>
        )}
      
        {/* Enhanced Main Content */}
        {error ? (
          <ErrorState message={error} onRetry={loadApplications} lang={lang} />
        ) : loading ? (
          <LoadingState lang={lang} />
        ) : (
          <Card className="card elevated rounded-xl border-0 bg-card shadow-lg animate-fade-in">
            <CardContent className="p-0">
              {safeApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-8">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center">
                    <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">
                      {lang === 'rw' ? 'Nta Ubwishingizi Bwabonetse' : 'No Applications Found'}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md font-medium">
                      {lang === 'rw' 
                        ? 'Nta ubwishingizi bw\'ubwishingizi bwabonetse. Nyamuneka gerageza kuvugurura cyangwa reba ko ufite uburenganzira bwo kureba ubusabe.' 
                        : 'No applications were found. Please try refreshing or check if you have permission to view applications.'
                      }
                    </p>
                  </div>
                  <Button
                    onClick={loadApplications}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-sm hover:shadow-md transition-all duration-200 font-semibold px-8 py-4 rounded-lg"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {lang === 'rw' ? 'Kuvugurura' : 'Refresh'}
                  </Button>
                </div>
              ) : (
              <div className="w-full">
                {/* District Filter */}
                <div className="p-6 border-b border-border bg-muted/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {lang === 'rw' ? 'Gusuzuma Ubwishingizi' : 'Filter Applications'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {lang === 'rw' 
                          ? 'Hitamo uturere twose ukeneye kureba ubwishingizi'
                          : 'Select districts to view applications from specific areas'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">
                        {lang === 'rw' ? 'Ubwishingizi Byose' : 'Total'}: {applications.length}
                      </Badge>
                      <Badge variant="secondary" className="text-sm">
                        {lang === 'rw' ? 'Byasuzumwe' : 'Filtered'}: {filteredApplications.length}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <DistrictFilter
                      selectedDistricts={selectedDistricts}
                      onDistrictsChange={setSelectedDistricts}
                      className="flex-1"
                    />
                    
                    {selectedDistricts.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDistricts([])}
                        className="h-9"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {lang === 'rw' ? 'Kuvanga' : 'Clear All'}
                      </Button>
                    )}
                  </div>
                </div>

                <Tabs defaultValue="all" className="w-full">
                  {/* Enhanced Tab Container with Premium Styling */}
                  <div className="relative overflow-hidden border-2 border-gray-300 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 shadow-xl backdrop-blur-sm">
                    {/* Subtle Pattern Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30"></div>
                    
                    <TabsList className="relative grid w-full grid-cols-4 bg-transparent p-2 h-auto border-0 gap-3">
                      {/* Submitted Applications Tab */}
                      <TabsTrigger 
                        value="all" 
                        className="group relative flex items-center gap-3 px-6 py-5 text-sm font-semibold transition-all duration-500 border-2 border-transparent rounded-xl hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:border-blue-800 data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-blue-700 data-[state=inactive]:hover:bg-white data-[state=inactive]:hover:border-blue-400 data-[state=inactive]:hover:shadow-lg data-[state=inactive]:bg-white/90 data-[state=inactive]:backdrop-blur-sm"
                      >
                        <div className="relative">
                          <FileSpreadsheet className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <span className="font-medium">{lang === 'rw' ? 'Ubwishingizi Byoherejwe' : 'Submitted Applications'}</span>
                        <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs font-bold border border-blue-300 px-2 py-1 rounded-full shadow-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-blue-200 data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-blue-100 data-[state=inactive]:to-blue-200 data-[state=inactive]:text-blue-800">
                          {filteredApplications.length}
                        </Badge>
                      </TabsTrigger>

                      {/* Interview Invited Tab */}
                      <TabsTrigger 
                        value="interview-invited" 
                        className="group relative flex items-center gap-3 px-6 py-5 text-sm font-semibold transition-all duration-500 border-2 border-transparent rounded-xl hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:border-emerald-800 data-[state=active]:shadow-xl data-[state=active]:shadow-emerald-500/25 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-emerald-700 data-[state=inactive]:hover:bg-white data-[state=inactive]:hover:border-emerald-400 data-[state=inactive]:hover:shadow-lg data-[state=inactive]:bg-white/90 data-[state=inactive]:backdrop-blur-sm"
                      >
                        <div className="relative">
                          <Users className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <span className="font-medium">{lang === 'rw' ? 'Batumijwe Kuri Interview' : 'Interview Invited'}</span>
                        <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 text-xs font-bold border border-emerald-300 px-2 py-1 rounded-full shadow-sm data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:border-emerald-200 data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-emerald-100 data-[state=inactive]:to-emerald-200 data-[state=inactive]:text-emerald-800">
                          {interviewInvitedApplications.length}
                        </Badge>
                      </TabsTrigger>

                      {/* Interviewed Tab */}
                      <TabsTrigger 
                        value="interviewed" 
                        className="group relative flex items-center gap-3 px-6 py-5 text-sm font-semibold transition-all duration-500 border-2 border-transparent rounded-xl hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-violet-700 data-[state=active]:text-white data-[state=active]:border-violet-800 data-[state=active]:shadow-xl data-[state=active]:shadow-violet-500/25 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-violet-700 data-[state=inactive]:hover:bg-white data-[state=inactive]:hover:border-violet-400 data-[state=inactive]:hover:shadow-lg data-[state=inactive]:bg-white/90 data-[state=inactive]:backdrop-blur-sm"
                      >
                        <div className="relative">
                          <Database className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <span className="font-medium">{lang === 'rw' ? 'Ubwishingizi Bafashe Interview' : 'Interviewed Applications'}</span>
                        <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-violet-100 to-violet-200 text-violet-800 text-xs font-bold border border-violet-300 px-2 py-1 rounded-full shadow-sm data-[state=active]:bg-white data-[state=active]:text-violet-600 data-[state=active]:border-violet-200 data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-violet-100 data-[state=inactive]:to-violet-200 data-[state=inactive]:text-violet-800">
                          {interviewedApplications.length}
                        </Badge>
                      </TabsTrigger>

                      {/* By Province Tab */}
                      <TabsTrigger 
                        value="provinces" 
                        className="group relative flex items-center gap-3 px-6 py-5 text-sm font-semibold transition-all duration-500 border-2 border-transparent rounded-xl hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-700 data-[state=active]:text-white data-[state=active]:border-amber-800 data-[state=active]:shadow-xl data-[state=active]:shadow-amber-500/25 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-amber-700 data-[state=inactive]:hover:bg-white data-[state=inactive]:hover:border-amber-400 data-[state=inactive]:hover:shadow-lg data-[state=inactive]:bg-white/90 data-[state=inactive]:backdrop-blur-sm"
                      >
                        <div className="relative">
                          <MapPin className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <span className="font-medium">{lang === 'rw' ? 'Ubwishingizi by\'Intara' : 'By Province'}</span>
                        <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 text-xs font-bold border border-amber-300 px-2 py-1 rounded-full shadow-sm data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:border-amber-200 data-[state=inactive]:bg-gradient-to-r data-[state=inactive]:from-amber-100 data-[state=inactive]:to-amber-200 data-[state=inactive]:text-amber-800">
                          {applications.length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>
          
                <TabsContent value="all" className="m-0">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {lastRefreshedAt && (
                          <span>Last refreshed: {lastRefreshedAt.toLocaleTimeString()}</span>
                        )}
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                          Auto-refresh (30s)
                        </label>
                        <Button size="sm" variant="outline" onClick={handleForceLiveReload} className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" /> Force Live Reload
                        </Button>
                      </div>
                    </div>
                    <ApplicationsTable 
                      applications={filteredApplications}
                      onViewApplication={handleViewApplication}
                      onSendBulkEmail={handleSendBulkEmail}
                      onInviteToInterview={handleInviteToInterview}
                      onRefresh={loadSubmittedApplicationsFromGoogleSheets}
                      loading={loading}
                      isInvitingToInterview={isInvitingToInterview}
                      userRole={user?.role}
                      showActionsColumn={true}
                      isAllApplicationsTab={true}
                    />
                  </div>
                </TabsContent>
          
                <TabsContent value="interview-invited" className="m-0">
                  <div className="p-6">
                    <ApplicationsTable 
                      applications={interviewInvitedApplications}
                      onViewApplication={handleViewApplication}
                      onSendBulkEmail={handleSendBulkEmail}
                      onInviteToInterview={handleInviteToInterview}
                      onRefresh={loadInterviewInvitedApplications}
                      loading={loading}
                      isInvitingToInterview={isInvitingToInterview}
                      userRole={user?.role}
                      showActionsColumn={true}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="interviewed" className="m-0">
                  <div className="p-6">
                    <ApplicationsTable 
                      applications={interviewedApplications}
                      onViewApplication={handleViewApplication}
                      onSendBulkEmail={handleSendBulkEmail}
                      onInviteToInterview={handleInviteToInterview}
                      onRefresh={loadInterviewedApplications}
                      loading={loading}
                      isInvitingToInterview={isInvitingToInterview}
                      userRole={user?.role}
                      showActionsColumn={true}
                      isInterviewedTab={true}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="provinces" className="m-0">
                  <div className="p-6">
                    <ProvinceCards
                      applications={applications}
                      onViewApplication={handleViewApplication}
                      lang={lang}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              </div>
            )}
            </CardContent>
          </Card>
        )}
      
        <BulkEmailDialog
          applications={selectedApplications}
          open={isEmailDialogOpen}
          onOpenChange={setIsEmailDialogOpen}
        />
      </div>
    </div>
  )
}
