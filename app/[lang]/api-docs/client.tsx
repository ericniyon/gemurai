"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { 
  Search, 
  Code2, 
  Shield, 
  Copy, 
  Check, 
  ExternalLink, 
  Zap, 
  Globe, 
  Database,
  Users,
  ShoppingCart,
  FileText,
  ChevronRight,
  Star,
  Clock,
  Activity,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle,
  Key,
  History,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Menu,
  X,
  BookOpen,
  Terminal,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { endpoints } from "@/lib/api-docs/endpoints"
import { translations } from "@/lib/api-docs/translations"
import { endpointDescriptions } from "@/lib/api-docs/descriptions"

export function ApiDocs({ params }: { params: { lang: string } }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<{[key: string]: string}>({})
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({})
  
  // Interactive API testing states
  const [authToken, setAuthToken] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [requestHistory, setRequestHistory] = useState<any[]>([])
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<{[key: string]: any}>({})
  const [customParams, setCustomParams] = useState<{[key: string]: any}>({})
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000")
  
  const t = translations[params.lang as keyof typeof translations] || translations.en
  const descriptions = endpointDescriptions[params.lang as keyof typeof endpointDescriptions] || endpointDescriptions.en

  useEffect(() => {
    setMounted(true)
    // Load saved auth token from localStorage
    const savedToken = localStorage.getItem('api-docs-token')
    if (savedToken) {
      setAuthToken(savedToken)
    }
    // Load request history
    const savedHistory = localStorage.getItem('api-docs-history')
    if (savedHistory) {
      setRequestHistory(JSON.parse(savedHistory))
    }
    // Initialize expanded categories
    const initialExpanded: {[key: string]: boolean} = {}
    endpoints.forEach(category => {
      initialExpanded[category.category] = true
    })
    setExpandedCategories(initialExpanded)
  }, [])

  const getCurrentTab = (endpointId: string) => {
    return activeTab[endpointId] || 'response'
  }

  const setCurrentTab = (endpointId: string, tab: string) => {
    setActiveTab(prev => ({ ...prev, [endpointId]: tab }))
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts when an endpoint is active
      if (!activeEndpoint) return

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault()
            event.stopPropagation()
            setCurrentTab(activeEndpoint, 'response')
            break
          case '2':
            event.preventDefault()
            event.stopPropagation()
            setCurrentTab(activeEndpoint, 'request')
            break
          case '3':
            event.preventDefault()
            event.stopPropagation()
            setCurrentTab(activeEndpoint, 'curl')
            break
          case '4':
            event.preventDefault()
            event.stopPropagation()
            setCurrentTab(activeEndpoint, 'test')
            break
          default:
            break
        }
      }
    }

    // Always add the event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeEndpoint])

  if (!mounted) {
    return null
  }

  const isDark = resolvedTheme === 'dark'

  const getDescription = (path: string) => {
    const [category, key] = path.split('.')
    if (!category || !key) return path
    
    const categoryDescriptions = descriptions[category as keyof typeof descriptions]
    if (!categoryDescriptions) return path
    
    const description = categoryDescriptions[key as keyof typeof categoryDescriptions]
    if (!description) return path
    
    // Handle nested language objects (like inventory section)
    if (typeof description === 'object' && description !== null) {
      const langDescription = description[params.lang as keyof typeof description]
      return langDescription || description['en' as keyof typeof description] || path
    }
    
    // Handle simple string descriptions
    return description || path
  }

  const filteredEndpoints = endpoints.filter(category => {
    if (selectedCategory && category.category !== selectedCategory) {
      return false
    }
    
    if (searchQuery) {
      return category.endpoints.some(endpoint => 
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getDescription(endpoint.description).toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return true
  })

  const categories = Array.from(new Set(endpoints.map(e => e.category)))
  
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'authentication': return <Shield className="w-4 h-4" />
      case 'user management': return <Users className="w-4 h-4" />
      case 'products': return <ShoppingCart className="w-4 h-4" />
      case 'applications': return <FileText className="w-4 h-4" />
      case 'dcc stock': return <Database className="w-4 h-4" />
      case 'rwanda divisions': return <Globe className="w-4 h-4" />
      default: return <Code2 className="w-4 h-4" />
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-emerald-500 hover:bg-emerald-600 text-white'
      case 'POST': return 'bg-blue-500 hover:bg-blue-600 text-white'
      case 'PUT': return 'bg-amber-500 hover:bg-amber-600 text-white'
      case 'PATCH': return 'bg-orange-500 hover:bg-orange-600 text-white'
      case 'DELETE': return 'bg-red-500 hover:bg-red-600 text-white'
      default: return 'bg-gray-500 hover:bg-gray-600 text-white'
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const generateCurlCommand = (endpoint: any) => {
    let curl = `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}"`
    
    if (endpoint.requiresAuth && authToken) {
      curl += ` \\\n  -H "Authorization: Bearer ${authToken}"`
    }
    
    if (endpoint.request) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(endpoint.request, null, 2)}'`
    }
    
    return curl
  }

  const testEndpoint = async (endpoint: any, endpointId: string) => {
    setIsTesting(true)
    
    try {
      const url = `${baseUrl}${endpoint.path}`
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (endpoint.requiresAuth && authToken) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${authToken}`,
        }
      }

      if (endpoint.request && (endpoint.method === 'POST' || endpoint.method === 'PUT' || endpoint.method === 'PATCH')) {
        options.body = JSON.stringify(endpoint.request)
      }

      const startTime = Date.now()
      const response = await fetch(url, options)
      const endTime = Date.now()
      const responseTime = endTime - startTime

      let responseData
      try {
        responseData = await response.json()
      } catch {
        responseData = { error: 'Invalid JSON response' }
      }

      const result = {
        status: response.status,
        statusText: response.statusText,
        responseTime,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString(),
        success: response.ok,
      }

      setTestResults(prev => ({ ...prev, [endpointId]: result }))

      // Add to request history
      const historyItem = {
        id: Date.now(),
        endpoint: endpoint.path,
        method: endpoint.method,
        result,
        timestamp: new Date().toISOString(),
      }

      const newHistory = [historyItem, ...requestHistory.slice(0, 9)] // Keep last 10
      setRequestHistory(newHistory)
      localStorage.setItem('api-docs-history', JSON.stringify(newHistory))

    } catch (error) {
      const result = {
        status: 0,
        statusText: 'Network Error',
        responseTime: 0,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        headers: {},
        timestamp: new Date().toISOString(),
        success: false,
      }
      setTestResults(prev => ({ ...prev, [endpointId]: result }))
    } finally {
      setIsTesting(false)
    }
  }

  const saveAuthToken = () => {
    localStorage.setItem('api-docs-token', authToken)
  }

  const clearHistory = () => {
    setRequestHistory([])
    localStorage.removeItem('api-docs-history')
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 300 && status < 400) return 'text-blue-600'
    if (status >= 400 && status < 500) return 'text-yellow-600'
    if (status >= 500) return 'text-red-600'
    return 'text-gray-600'
  }

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (status >= 400) return <AlertCircle className="w-4 h-4 text-red-600" />
    return <Clock className="w-4 h-4 text-gray-600" />
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const scrollToEndpoint = (endpointId: string) => {
    const element = document.getElementById(endpointId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveEndpoint(endpointId)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'} flex`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ${isDark ? 'bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 border-r border-slate-700' : 'bg-gradient-to-b from-white via-gray-50 to-gray-100 border-r border-gray-200'} overflow-hidden shadow-2xl backdrop-blur-sm sticky top-0 h-screen`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className={`p-6 border-b ${isDark ? 'border-slate-700 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm' : 'border-gray-200 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-sm'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-lg shadow-blue-500/25' : 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-lg shadow-blue-500/25'}`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>API Reference</h2>
                  <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>HarvestPlus Platform</p>
                </div>
          </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden rounded-lg transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-white hover:bg-slate-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'}`}
              >
                <X className="w-4 h-4" />
              </Button>
        </div>

            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <Input 
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 rounded-lg border-0 transition-all duration-200 ${isDark ? 'bg-slate-700/50 text-white placeholder-gray-400 focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/50' : 'bg-gray-100/50 text-gray-900 placeholder-gray-500 focus:bg-gray-100 focus:ring-2 focus:ring-blue-500/50'}`}
              />
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {/* All Endpoints */}
              <Button
                variant={!selectedCategory ? "default" : "ghost"}
                className={`w-full justify-start rounded-lg transition-all duration-200 ${
                  !selectedCategory 
                    ? `${isDark ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'}`
                    : `${isDark ? 'text-gray-300 hover:text-white hover:bg-slate-700/50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'}`
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                <Star className="w-4 h-4 mr-3" />
                <span className="font-medium">All Endpoints</span>
              </Button>

              <Separator className={`my-4 ${isDark ? 'bg-slate-600' : 'bg-gray-200'}`} />

              {/* Categories */}
              {filteredEndpoints.map((category, i) => (
                <div key={i} className="space-y-2">
                  <Button
                    variant="ghost"
                    className={`w-full justify-between p-3 h-auto rounded-lg transition-all duration-200 ${isDark ? 'text-gray-300 hover:text-white hover:bg-slate-700/50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'}`}
                    onClick={() => toggleCategory(category.category)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${isDark ? 'bg-slate-700/50' : 'bg-gray-100/50'}`}>
                        {getCategoryIcon(category.category)}
                      </div>
                      <span className="font-medium">{t.categories[category.category.toLowerCase().replace(/\s+/g, '') as keyof typeof t.categories]}</span>
                      <Badge variant="secondary" className={`text-xs ${isDark ? 'bg-slate-600 text-slate-200' : 'bg-gray-200 text-gray-700'}`}>
                        {category.endpoints.length}
                      </Badge>
                    </div>
                    <div className={`p-1 rounded-md transition-transform duration-200 ${expandedCategories[category.category] ? 'rotate-180' : ''} ${isDark ? 'bg-slate-700/50' : 'bg-gray-100/50'}`}>
                      {expandedCategories[category.category] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </Button>

                  {/* Endpoints */}
                  {expandedCategories[category.category] && (
                    <div className="ml-4 space-y-1 pl-4 border-l-2 border-dashed border-gray-300 dark:border-gray-600">
                      {category.endpoints.map((endpoint, j) => {
                        const endpointId = `${i}-${j}`
                        return (
                          <Button
                            key={j}
                            variant="ghost"
                            size="sm"
                            className={`w-full justify-start text-sm rounded-md transition-all duration-200 ${
                              activeEndpoint === endpointId 
                                ? `${isDark ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30' : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200'}`
                                : `${isDark ? 'text-gray-400 hover:text-white hover:bg-slate-700/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'}`
                            }`}
                            onClick={() => scrollToEndpoint(endpointId)}
                          >
                            <Badge className={`mr-3 px-2 py-1 text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </Badge>
                            <span className="truncate font-mono text-xs">{endpoint.path}</span>
                          </Button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className={`p-4 border-t ${isDark ? 'border-slate-700 bg-gradient-to-r from-slate-800/50 to-slate-700/50' : 'border-gray-200 bg-gradient-to-r from-gray-50/50 to-white/50'} backdrop-blur-sm`}>
            <div className="space-y-3">
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-400' : 'bg-green-500'}`}></div>
                    Total Endpoints
                  </span>
                  <span className={`font-semibold px-2 py-1 rounded-md ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-800'}`}>
                    {endpoints.reduce((acc, cat) => acc + cat.endpoints.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
                    Categories
                  </span>
                  <span className={`font-semibold px-2 py-1 rounded-md ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-800'}`}>
                    {endpoints.length}
                  </span>
                </div>
              </div>
              <div className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <div className="flex items-center justify-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>API Documentation v1.1.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <div className={`${isDark ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-gray-200'} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">API Documentation</h1>
                <p className="text-sm text-gray-500">Interactive API testing and documentation</p>
              </div>
            </div>
            
            {/* Quick Settings */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {authToken ? 'Authenticated' : 'No Auth'}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                <span>⌘1-4: Switch tabs</span>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1 h-full">
          <div className="p-6">
            {/* Settings Panel */}
            <Card className={`mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  API Testing Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseUrl">Base URL</Label>
                    <Input
                      id="baseUrl"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="http://localhost:3000"
                      className={isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authToken">Authentication Token</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="authToken"
                          type={showToken ? "text" : "password"}
                          value={authToken}
                          onChange={(e) => setAuthToken(e.target.value)}
                          placeholder="Enter your Bearer token"
                          className={`pl-10 pr-10 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowToken(!showToken)}
                        >
                          {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <Button onClick={saveAuthToken} variant="outline">
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endpoints */}
            <div className="space-y-8">
          {filteredEndpoints.map((category, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                      {getCategoryIcon(category.category)}
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                {t.categories[category.category.toLowerCase().replace(/\s+/g, '') as keyof typeof t.categories]}
              </h2>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {category.endpoints.length} endpoint{category.endpoints.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {category.endpoints.map((endpoint, j) => {
                      const endpointId = `${i}-${j}`
                      const isActive = activeEndpoint === endpointId
                      
                      return (
                        <Card 
                    key={j}
                          id={endpointId}
                          className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-gray-200'} backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${isActive ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setActiveEndpoint(isActive ? null : endpointId)}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                  <Badge className={`px-4 py-2 text-sm font-semibold ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </Badge>
                                  <code className={`text-lg font-mono ${isDark ? 'bg-slate-900 text-blue-300' : 'bg-gray-100 text-blue-600'} px-4 py-2 rounded-lg`}>
                              {endpoint.path}
                            </code>
                                  {endpoint.requiresAuth && (
                                    <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                      <Shield className="w-4 h-4" />
                                      Auth Required
                                    </Badge>
                                  )}
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      testEndpoint(endpoint, endpointId)
                                    }}
                                    disabled={isTesting || (endpoint.requiresAuth && !authToken)}
                                    className="ml-auto"
                                  >
                                    {isTesting ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Play className="w-4 h-4" />
                                    )}
                                    Test
                                  </Button>
                          </div>
                                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg leading-relaxed`}>
                            {getDescription(endpoint.description)}
                          </p>
                                
                                {/* Test Result */}
                                {testResults[endpointId] && (
                                  <div className="mt-4">
                                    <Alert className={`${testResults[endpointId].success ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                                      <div className="flex items-center gap-2">
                                        {getStatusIcon(testResults[endpointId].status)}
                                        <AlertDescription className="flex items-center gap-4">
                                          <span className={`font-semibold ${getStatusColor(testResults[endpointId].status)}`}>
                                            {testResults[endpointId].status} {testResults[endpointId].statusText}
                                          </span>
                                          <span className="text-sm text-gray-500">
                                            {testResults[endpointId].responseTime}ms
                                          </span>
                                          <span className="text-sm text-gray-500">
                                            {new Date(testResults[endpointId].timestamp).toLocaleTimeString()}
                                          </span>
                                        </AlertDescription>
                                      </div>
                                    </Alert>
                        </div>
                        )}
                      </div>
                              <Button variant="ghost" size="sm" className="ml-4">
                                <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                              </Button>
                            </div>
                          </CardHeader>

                          {isActive && (
                            <CardContent className="pt-0">
                              <Tabs value={getCurrentTab(endpointId)} onValueChange={(value) => setCurrentTab(endpointId, value)} className="w-full tabs-container" onClick={(e) => e.stopPropagation()}>
                                <TabsList className={`grid w-full grid-cols-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`} onClick={(e) => e.stopPropagation()}>
                                  <TabsTrigger value="response" className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Activity className="w-4 h-4" />
                                    Response
                                    <span className="text-xs opacity-60">⌘1</span>
                                  </TabsTrigger>
                                  <TabsTrigger value="request" className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <FileText className="w-4 h-4" />
                                    Request
                                    <span className="text-xs opacity-60">⌘2</span>
                                  </TabsTrigger>
                                  <TabsTrigger value="curl" className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Code2 className="w-4 h-4" />
                                    cURL
                                    <span className="text-xs opacity-60">⌘3</span>
                                  </TabsTrigger>
                                  <TabsTrigger value="test" className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Play className="w-4 h-4" />
                                    Live Test
                                    <span className="text-xs opacity-60">⌘4</span>
                                  </TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="response" className="mt-6" onClick={(e) => e.stopPropagation()}>
                                  <div className="relative">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="absolute top-4 right-4 z-10"
                                      onClick={() => copyToClipboard(JSON.stringify(endpoint.response, null, 2), `response-${endpointId}`)}
                                    >
                                      {copiedCode === `response-${endpointId}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                    <pre className={`${isDark ? 'bg-slate-900' : 'bg-gray-50'} p-6 rounded-lg overflow-x-auto text-sm max-h-96`}>
                                      <code className={`${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {JSON.stringify(endpoint.response, null, 2)}
                                      </code>
                                    </pre>
                    </div>
                                </TabsContent>
                                
                                <TabsContent value="request" className="mt-6" onClick={(e) => e.stopPropagation()}>
                                  <div className="relative">
                                    {endpoint.request ? (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="absolute top-4 right-4 z-10"
                                          onClick={() => copyToClipboard(JSON.stringify(endpoint.request, null, 2), `request-${endpointId}`)}
                                        >
                                          {copiedCode === `request-${endpointId}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                        <pre className={`${isDark ? 'bg-slate-900' : 'bg-gray-50'} p-6 rounded-lg overflow-x-auto text-sm max-h-96`}>
                                          <code className={`${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                              {JSON.stringify(endpoint.request, null, 2)}
                            </code>
                          </pre>
                                      </>
                                    ) : (
                                      <div className={`${isDark ? 'bg-slate-900' : 'bg-gray-50'} rounded-lg p-8 text-center`}>
                                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-gray-500">This endpoint doesn't require a request body</p>
                                        <p className="text-sm text-gray-400 mt-2">
                                          {endpoint.method} requests to {endpoint.path} don't need additional data
                                        </p>
                        </div>
                      )}
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="curl" className="mt-6" onClick={(e) => e.stopPropagation()}>
                                  <div className="relative">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="absolute top-4 right-4 z-10"
                                      onClick={() => copyToClipboard(generateCurlCommand(endpoint), `curl-${endpointId}`)}
                                    >
                                      {copiedCode === `curl-${endpointId}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                    <pre className={`${isDark ? 'bg-slate-900' : 'bg-gray-50'} p-6 rounded-lg overflow-x-auto text-sm max-h-96`}>
                                      <code className={`${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {generateCurlCommand(endpoint)}
                                      </code>
                                    </pre>
                                  </div>
                                </TabsContent>

                                <TabsContent value="test" className="mt-6" onClick={(e) => e.stopPropagation()}>
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold">Live API Testing</h4>
                                      <Button
                                        onClick={() => testEndpoint(endpoint, endpointId)}
                                        disabled={isTesting || (endpoint.requiresAuth && !authToken)}
                                        className="flex items-center gap-2"
                                      >
                                        {isTesting ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Play className="w-4 h-4" />
                                        )}
                                        {isTesting ? 'Testing...' : 'Run Test'}
                                      </Button>
                                    </div>

                                    {endpoint.requiresAuth && !authToken && (
                                      <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                                        <AlertCircle className="w-4 h-4" />
                                        <AlertDescription>
                                          This endpoint requires authentication. Please add your Bearer token in the settings above.
                                        </AlertDescription>
                                      </Alert>
                                    )}

                                    {testResults[endpointId] && (
                                      <div className="space-y-4">
                                        <div className={`${isDark ? 'bg-slate-900' : 'bg-gray-50'} rounded-lg p-4`}>
                                          <div className="flex items-center gap-3 mb-3">
                                            {getStatusIcon(testResults[endpointId].status)}
                                            <span className={`font-semibold ${getStatusColor(testResults[endpointId].status)}`}>
                                              {testResults[endpointId].status} {testResults[endpointId].statusText}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                              {testResults[endpointId].responseTime}ms
                                            </span>
                                          </div>
                                          
                                          <div className="mb-4">
                                            <h5 className="text-sm font-medium mb-2">Response Headers</h5>
                                            <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded p-3 text-xs max-h-32 overflow-y-auto`}>
                                              {Object.entries(testResults[endpointId].headers).map(([key, value]) => (
                                                <div key={key} className="flex justify-between">
                                                  <span className="font-mono text-blue-600">{key}:</span>
                                                  <span className="font-mono">{String(value)}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>

                                          <div>
                                            <h5 className="text-sm font-medium mb-2">Response Body</h5>
                                            <div className="relative">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="absolute top-2 right-2 z-10"
                                                onClick={() => copyToClipboard(JSON.stringify(testResults[endpointId].data, null, 2), `test-response-${endpointId}`)}
                                              >
                                                {copiedCode === `test-response-${endpointId}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                              </Button>
                                              <pre className={`${isDark ? 'bg-slate-800' : 'bg-white'} p-4 rounded text-xs max-h-64 overflow-x-auto`}>
                                                <code className={`${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                                  {JSON.stringify(testResults[endpointId].data, null, 2)}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                                      </div>
                                    )}

                                    {!testResults[endpointId] && (
                                      <div className={`${isDark ? 'bg-slate-900' : 'bg-gray-50'} rounded-lg p-8 text-center`}>
                                        <Play className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-gray-500">Click "Run Test" to test this endpoint</p>
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </CardContent>
                          )}
                        </Card>
                      )
                    })}
              </div>
            </div>
          ))}
        </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
} 