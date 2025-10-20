"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Brain,
  FileText,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Clock,
  Edit,
  Download,
  Share2,
  Star,
  TrendingUp,
  Activity,
  Shield,
  Award,
  Target,
  Zap,
  Eye,
  Copy,
  ExternalLink,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Building,
  GraduationCap,
  Heart,
  DollarSign,
  Globe,
  Lock,
  Unlock,
  Settings,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Crown,
  Gem,
  Flame,
  Sun,
  Moon,
  Palette,
  List
} from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface ApplicationData {
  id: string
  formData: any
  evaluations: any[]
  createdAt?: string
  updatedAt?: string
}

interface SimpleApplicationDetailProps {
  application: ApplicationData
  user: {
    id: string
    role: string
    permissions: string[]
  }
  permissions: {
    canView: boolean
    canEdit: boolean
    canDelete: boolean
    canEvaluate: boolean
  }
}

export function SimpleApplicationDetail({ 
  application, 
  user, 
  permissions 
}: SimpleApplicationDetailProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showAllDetails, setShowAllDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSections, setExpandedSections] = useState<string[]>(['personal', 'contact', 'status'])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const formData = application.formData || {}

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = resolvedTheme === 'dark'

  // Utility functions
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      toast.success(`${label} copied to clipboard!`)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleAction = async (action: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`${action} completed successfully!`)
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()}`)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'from-emerald-500 to-green-600', icon: Crown }
    if (score >= 80) return { level: 'Very Good', color: 'from-blue-500 to-cyan-600', icon: Star }
    if (score >= 70) return { level: 'Good', color: 'from-yellow-500 to-orange-600', icon: Award }
    if (score >= 60) return { level: 'Fair', color: 'from-orange-500 to-red-600', icon: Target }
    return { level: 'Needs Improvement', color: 'from-red-500 to-pink-600', icon: Flame }
  }

  const getApplicantName = () => {
    // Priority 1: User's name from user table
    if (application.user?.name) {
      return application.user.name
    }
    
    // Priority 2: Database format - q1 (first name) + q2 (last name)
    if (formData.q1 && formData.q2) {
      return `${formData.q1} ${formData.q2}`.trim()
    }
    
    // Priority 3: Google Sheets format - First Name + Last Name
    if (formData['First Name'] && formData['Last Name']) {
      return `${formData['First Name']} ${formData['Last Name']}`.trim()
    }
    
    // Priority 4: Google Sheets format - First Name + Lat Name (typo)
    if (formData['First Name'] && formData['Lat Name']) {
      return `${formData['First Name']} ${formData['Lat Name']}`.trim()
    }
    
    // Priority 5: Direct firstName/lastName fields
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName} ${formData.lastName}`.trim()
    }
    
    // Priority 6: Single name fields
    if (formData['Full Name']) {
      return formData['Full Name']
    }
    if (formData['Applicant Name']) {
      return formData['Applicant Name']
    }
    if (formData.name) {
      return formData.name
    }
    if (formData.fullName) {
      return formData.fullName
    }
    
    // Priority 7: Just first name fields
    if (formData['First Name']) {
      return formData['First Name']
    }
    if (formData.q1) {
      return formData.q1
    }
    if (formData.firstName) {
      return formData.firstName
    }
    
    return 'Unknown'
  }

  const getTotalScore = () => {
    const score = formData['Total Score']
    if (score && score !== '#N/A' && score !== '') {
      return Number(score)
    }
    return null
  }

  const getVulnerabilityCategory = () => {
    return formData['Vulnerability Category'] || 'Unknown'
  }

  const getLocation = () => {
    return formData['district'] || formData['Location'] || 'Unknown'
  }

  const getPhoneNumber = () => {
    return formData['Phone Number'] || formData['phone'] || 'N/A'
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-100 text-green-800'
    if (score >= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getVulnerabilityColor = (category: string) => {
    switch (category) {
      case 'Level A':
        return 'bg-red-100 text-red-800'
      case 'Level B':
        return 'bg-orange-100 text-orange-800'
      case 'Level C':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'interview_invited':
        return 'bg-purple-100 text-purple-800'
      case 'interviewed':
        return 'bg-indigo-100 text-indigo-800'
      case 'pending_documents':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-700 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse ${
          isDark ? 'bg-purple-500' : 'bg-blue-400'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 animate-pulse delay-1000 ${
          isDark ? 'bg-indigo-500' : 'bg-purple-400'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 animate-pulse delay-2000 ${
          isDark ? 'bg-pink-500' : 'bg-indigo-400'
        }`}></div>
      </div>
      
      <div className="container mx-auto py-6 px-4 relative z-10">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className={`group transition-all duration-300 shadow-lg backdrop-blur-sm hover:shadow-xl transform hover:-translate-y-0.5 ${
                isDark 
                  ? 'hover:bg-slate-800/90 border-slate-600/30 bg-slate-800/50 text-slate-200' 
                  : 'hover:bg-white/90 border-white/30 bg-white/50 text-gray-800'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Applications
            </Button>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className={`transition-all duration-300 ${
                  isDark 
                    ? 'border-slate-600/30 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50' 
                    : 'border-white/30 bg-white/50 text-gray-800 hover:bg-white/80'
                }`}
              >
                {viewMode === 'grid' ? <BarChart3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(window.location.href, 'Page URL')}
                className={`transition-all duration-300 ${
                  isDark 
                    ? 'border-slate-600/30 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50' 
                    : 'border-white/30 bg-white/50 text-gray-800 hover:bg-white/80'
                }`}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Hero Section */}
          <div className={`backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-2 ${
            isDark 
              ? 'bg-slate-800/80 border border-slate-700/50' 
              : 'bg-white/80 border border-white/50'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div>
                  <h1 className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 ${
                    isDark 
                      ? 'from-slate-200 to-slate-400' 
                      : 'from-gray-800 to-gray-600'
                  }`}>
                    {getApplicantName()}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      isDark 
                        ? 'bg-blue-900/50 text-blue-300' 
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      <Phone className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                        {getPhoneNumber()}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      isDark 
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-green-50 text-green-600'
                    }`}>
                      <MapPin className={`h-4 w-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                        {getLocation()}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      isDark 
                        ? 'bg-purple-900/50 text-purple-300' 
                        : 'bg-purple-50 text-purple-600'
                    }`}>
                      <Calendar className={`h-4 w-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
                        {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm font-mono px-4 py-2 rounded-lg inline-block ${
                    isDark 
                      ? 'text-slate-400 bg-slate-700/50' 
                      : 'text-gray-500 bg-gray-100'
                  }`}>
                    ID: {application.id}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={`${getStatusColor(application.status)} font-bold px-6 py-3 text-sm shadow-lg`}>
                    {application.status}
                  </Badge>
                  {getVulnerabilityCategory() && (
                    <Badge className={`${getVulnerabilityColor(getVulnerabilityCategory())} font-bold px-6 py-3 text-sm shadow-lg`}>
                      {getVulnerabilityCategory()}
                    </Badge>
                  )}
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleAction('Edit')}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isLoading ? <Activity className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                  </Button>
                  <Button 
                    onClick={() => handleAction('Email')}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isLoading ? <Activity className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  </Button>
                  <Button 
                    onClick={() => handleAction('Download')}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isLoading ? <Activity className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`backdrop-blur-xl rounded-2xl p-2 mb-8 shadow-xl ${
          isDark 
            ? 'bg-slate-800/80 border border-slate-700/50' 
            : 'bg-white/80 border border-white/50'
        }`}>
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'details', label: 'Details', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'timeline', label: 'Timeline', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? isDark
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Score Overview */}
            {getTotalScore() && (
              <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-2 ${
                isDark 
                  ? 'bg-slate-800/80 border border-slate-700/50' 
                  : 'bg-white/80 border border-white/50'
              }`}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                      isDark 
                        ? 'from-slate-200 to-slate-400' 
                        : 'from-gray-800 to-gray-600'
                    }`}>Performance Score</h2>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Comprehensive Assessment</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                      {getTotalScore()}
                    </div>
                    <div className={`text-2xl font-semibold mb-2 ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      {getScoreLevel(getTotalScore()!).level}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Out of 100 points
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className={`w-full rounded-full h-3 mb-3 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 shadow-lg bg-gradient-to-r ${
                            getTotalScore()! >= 75 ? 'from-green-400 to-green-600' : 
                            getTotalScore()! >= 50 ? 'from-yellow-400 to-orange-500' : 'from-red-400 to-red-600'
                          }`}
                          style={{ width: `${getTotalScore()}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                          {getTotalScore()! >= 75 ? 'High Performance' : 
                           getTotalScore()! >= 50 ? 'Medium Performance' : 'Needs Improvement'}
                        </p>
                        <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {getTotalScore()}% Complete
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className={`p-4 rounded-xl text-center ${
                        isDark 
                          ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50' 
                          : 'bg-gradient-to-r from-blue-50 to-blue-100'
                      }`}>
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                          {Math.floor(getTotalScore()! * 0.3)}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Knowledge</div>
                      </div>
                      <div className={`p-4 rounded-xl text-center ${
                        isDark 
                          ? 'bg-gradient-to-r from-green-900/50 to-green-800/50' 
                          : 'bg-gradient-to-r from-green-50 to-green-100'
                      }`}>
                        <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                          {Math.floor(getTotalScore()! * 0.4)}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Skills</div>
                      </div>
                      <div className={`p-4 rounded-xl text-center ${
                        isDark 
                          ? 'bg-gradient-to-r from-purple-900/50 to-purple-800/50' 
                          : 'bg-gradient-to-r from-purple-50 to-purple-100'
                      }`}>
                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                          {Math.floor(getTotalScore()! * 0.3)}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Experience</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Application Details */}
            <div className={`backdrop-blur-md rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 ${
              isDark 
                ? 'bg-slate-800/95 border border-slate-700/30' 
                : 'bg-white/95 border border-white/30'
            }`}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                    isDark 
                      ? 'from-slate-200 to-slate-400' 
                      : 'from-gray-800 to-gray-600'
                  }`}>Application Details</h2>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Complete Information</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {Object.entries(formData).slice(0, showAllDetails ? formData.length : 8).map(([key, value]) => (
                  <div key={key} className="group">
                    <label className={`text-sm font-bold uppercase tracking-wider mb-3 block ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    <div className={`p-4 rounded-xl border group-hover:shadow-lg transition-all duration-300 ${
                      isDark 
                        ? 'bg-gradient-to-r from-slate-700/50 to-slate-600/50 border-slate-600' 
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                    }`}>
                      <p className={`text-sm font-medium ${
                        isDark ? 'text-slate-200' : 'text-gray-800'
                      }`}>
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {Object.entries(formData).length > 8 && (
                <div className="mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAllDetails(!showAllDetails)}
                    className={`w-full shadow-lg hover:shadow-xl transition-all duration-300 ${
                      isDark 
                        ? 'bg-slate-700/50 hover:bg-slate-700/80 border-slate-600/30 hover:border-slate-600/50 text-slate-200' 
                        : 'bg-white/50 hover:bg-white/80 border-white/30 hover:border-white/50 text-gray-800'
                    }`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showAllDetails ? 'Show Less' : 'View All Details'}
                  </Button>
                </div>
              )}
            </div>
            {/* Statistics Overview */}
            <div className={`backdrop-blur-md rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 ${
              isDark 
                ? 'bg-slate-800/95 border border-slate-700/30' 
                : 'bg-white/95 border border-white/30'
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-xl">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                    isDark 
                      ? 'from-slate-200 to-slate-400' 
                      : 'from-gray-800 to-gray-600'
                  }`}>Application Analytics</h2>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Performance Metrics</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl text-center ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50' 
                    : 'bg-gradient-to-r from-blue-50 to-blue-100'
                }`}>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {getTotalScore() || 'N/A'}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Total Score</div>
                </div>
                <div className={`p-4 rounded-xl text-center ${
                  isDark 
                    ? 'bg-gradient-to-r from-green-900/50 to-green-800/50' 
                    : 'bg-gradient-to-r from-green-50 to-green-100'
                }`}>
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    {Object.keys(formData).length}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Fields</div>
                </div>
                <div className={`p-4 rounded-xl text-center ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-900/50 to-purple-800/50' 
                    : 'bg-gradient-to-r from-purple-50 to-purple-100'
                }`}>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                    {application.evaluations?.length || 0}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Evaluations</div>
                </div>
                <div className={`p-4 rounded-xl text-center ${
                  isDark 
                    ? 'bg-gradient-to-r from-orange-900/50 to-orange-800/50' 
                    : 'bg-gradient-to-r from-orange-50 to-orange-100'
                }`}>
                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                    {Math.floor((Date.now() - new Date(application.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Days Active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Status Card */}
            <div className={`backdrop-blur-md rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 ${
              isDark 
                ? 'bg-slate-800/95 border border-slate-700/30' 
                : 'bg-white/95 border border-white/30'
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-xl">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                    isDark 
                      ? 'from-slate-200 to-slate-400' 
                      : 'from-gray-800 to-gray-600'
                  }`}>Status</h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Current State</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className={`flex items-center justify-between p-4 rounded-xl ${
                  isDark 
                    ? 'bg-gradient-to-r from-slate-700/50 to-slate-600/50' 
                    : 'bg-gradient-to-r from-gray-50 to-gray-100'
                }`}>
                  <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Current Status</span>
                  <Badge className={`${getStatusColor(application.status)} font-bold px-4 py-2 shadow-lg`}>
                    {application.status}
                  </Badge>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50' 
                    : 'bg-gradient-to-r from-blue-50 to-blue-100'
                }`}>
                  <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Submitted</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                    {new Date(application.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl ${
                  isDark 
                    ? 'bg-gradient-to-r from-green-900/50 to-green-800/50' 
                    : 'bg-gradient-to-r from-green-50 to-green-100'
                }`}>
                  <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Last Updated</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                    {new Date(application.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                  <Edit className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Quick Actions</h3>
                  <p className="text-sm text-gray-500">Available Operations</p>
                </div>
              </div>
              <div className="space-y-4">
                <Button 
                  onClick={() => handleAction('Edit Application')}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Activity className="h-4 w-4 mr-2 animate-spin" /> : <Edit className="h-4 w-4 mr-2" />}
                  Edit Application
                </Button>
                <Button 
                  onClick={() => handleAction('Send Email')}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Activity className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                  Send Email
                </Button>
                <Button 
                  onClick={() => handleAction('Call Applicant')}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Activity className="h-4 w-4 mr-2 animate-spin" /> : <Phone className="h-4 w-4 mr-2" />}
                  Call Applicant
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => copyToClipboard(application.id, 'Application ID')}
                    variant="outline" 
                    className={`w-full shadow-lg hover:shadow-xl transition-all duration-300 ${
                      isDark 
                        ? 'bg-slate-700/50 hover:bg-slate-700/80 border-slate-600/30 hover:border-slate-600/50 text-slate-200' 
                        : 'bg-white/50 hover:bg-white/80 border-white/30 hover:border-white/50 text-gray-800'
                    }`}
                  >
                    {copiedText === 'Application ID' ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy ID
                  </Button>
                  <Button 
                    onClick={() => copyToClipboard(getPhoneNumber(), 'Phone Number')}
                    variant="outline" 
                    className={`w-full shadow-lg hover:shadow-xl transition-all duration-300 ${
                      isDark 
                        ? 'bg-slate-700/50 hover:bg-slate-700/80 border-slate-600/30 hover:border-slate-600/50 text-slate-200' 
                        : 'bg-white/50 hover:bg-white/80 border-white/30 hover:border-white/50 text-gray-800'
                    }`}
                  >
                    {copiedText === 'Phone Number' ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> : <Phone className="h-4 w-4 mr-2" />}
                    Copy Phone
                  </Button>
                </div>
                <Button 
                  onClick={() => handleAction('Download PDF')}
                  disabled={isLoading}
                  variant="outline" 
                  className={`w-full shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isDark 
                      ? 'bg-slate-700/50 hover:bg-slate-700/80 border-slate-600/30 hover:border-slate-600/50 text-slate-200' 
                      : 'bg-white/50 hover:bg-white/80 border-white/30 hover:border-white/50 text-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? <Activity className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Application Timeline */}
            <div className={`backdrop-blur-md rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 ${
              isDark 
                ? 'bg-slate-800/95 border border-slate-700/30' 
                : 'bg-white/95 border border-white/30'
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                    isDark 
                      ? 'from-slate-200 to-slate-400' 
                      : 'from-gray-800 to-gray-600'
                  }`}>Timeline</h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Progress Tracking</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className={`w-full rounded-full h-2 mb-2 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: '60%' }}></div>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>60% Complete</p>
              </div>
              
              <div className="space-y-4">
                <div className={`flex items-center gap-4 p-4 rounded-xl ${
                  isDark 
                    ? 'bg-gradient-to-r from-green-900/50 to-green-800/50' 
                    : 'bg-gradient-to-r from-green-50 to-green-100'
                }`}>
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg"></div>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>Application Submitted</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{new Date(application.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-4 p-4 rounded-xl ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50' 
                    : 'bg-gradient-to-r from-blue-50 to-blue-100'
                }`}>
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg"></div>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>Under Review</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>In Progress</p>
                  </div>
                </div>
                <div className={`flex items-center gap-4 p-4 rounded-xl ${
                  isDark 
                    ? 'bg-gradient-to-r from-slate-700/50 to-slate-600/50' 
                    : 'bg-gradient-to-r from-gray-50 to-gray-100'
                }`}>
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Decision Pending</p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Awaiting Review</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}