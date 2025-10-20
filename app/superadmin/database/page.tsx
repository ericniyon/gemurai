"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Database, 
  RefreshCw, 
  Upload, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  FileText,
  Users,
  BarChart3,
  Terminal,
  Trash2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApplicationScoreUpdate {
  id: string
  applicationScore: number | null
  vulnerabilityCategory: string | null
  name: string
  email: string
  phone: string
}

interface UpdateStats {
  totalProcessed: number
  matched: number
  updated: number
  skipped: number
}

export default function DatabasePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [updateStats, setUpdateStats] = useState<UpdateStats | null>(null)
  const [applications, setApplications] = useState<ApplicationScoreUpdate[]>([])
  const [selectedApplication, setSelectedApplication] = useState<ApplicationScoreUpdate | null>(null)
  const [manualScore, setManualScore] = useState<string>("")
  const [manualCategory, setManualCategory] = useState<string>("")
  const [progressLogs, setProgressLogs] = useState<string[]>([])
  const [consoleLogs, setConsoleLogs] = useState<string[]>([])
  const { toast } = useToast()

  const addConsoleLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setConsoleLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const clearConsole = () => {
    setConsoleLogs([])
  }

  const handleBulkUpdate = async () => {
    setIsLoading(true)
    setProgressLogs([])
    setConsoleLogs([])
    setUpdateStats(null)
    
    // Add initial logs
    addConsoleLog("🚀 Starting bulk update process...")
    setProgressLogs(prev => [...prev, "🚀 Starting bulk update process..."])
    
    try {
      addConsoleLog("📡 Fetching data from Google Sheets...")
      const response = await fetch('/api/v1/superadmin/database/bulk-update-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      addConsoleLog("📊 Processing response...")
      const result = await response.json()
      
      if (result.success) {
        setUpdateStats(result.stats)
        addConsoleLog(`✅ Bulk update completed successfully!`)
        addConsoleLog(`📊 Total processed: ${result.stats.totalProcessed}`)
        addConsoleLog(`🔗 Matched: ${result.stats.matched}`)
        addConsoleLog(`📝 Updated: ${result.stats.updated}`)
        addConsoleLog(`⏭️ Skipped: ${result.stats.skipped}`)
        
        setProgressLogs(prev => [...prev, 
          `✅ Bulk update completed successfully!`,
          `📊 Total processed: ${result.stats.totalProcessed}`,
          `🔗 Matched: ${result.stats.matched}`,
          `📝 Updated: ${result.stats.updated}`,
          `⏭️ Skipped: ${result.stats.skipped}`
        ])
        toast({
          title: "Bulk Update Successful",
          description: `Updated ${result.stats.updated} applications successfully.`,
        })
      } else {
        addConsoleLog(`❌ Bulk update failed: ${result.message}`)
        setProgressLogs(prev => [...prev, `❌ Bulk update failed: ${result.message}`])
        toast({
          title: "Bulk Update Failed",
          description: result.message || "Failed to update application scores.",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addConsoleLog(`❌ Error: ${errorMessage}`)
      setProgressLogs(prev => [...prev, `❌ Error: ${errorMessage}`])
      toast({
        title: "Error",
        description: "Failed to perform bulk update.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFetchApplications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/superadmin/database/applications')
      const result = await response.json()
      
      if (result.success) {
        setApplications(result.data)
        toast({
          title: "Applications Loaded",
          description: `Loaded ${result.data.length} applications.`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to load applications.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load applications.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualUpdate = async () => {
    if (!selectedApplication) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/superadmin/database/applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationScore: manualScore ? parseFloat(manualScore) : null,
          vulnerabilityCategory: manualCategory || null,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Update Successful",
          description: "Application updated successfully.",
        })
        // Refresh applications list
        handleFetchApplications()
      } else {
        toast({
          title: "Update Failed",
          description: result.message || "Failed to update application.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const vulnerabilityCategories = [
    "Level A",
    "Level B", 
    "Level C",
    "Not Vulnerable",
    "Highly Vulnerable",
    "Moderately Vulnerable",
    "Low Vulnerability"
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Database Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage application scores and vulnerability categories
        </p>
      </div>

      <Tabs defaultValue="bulk-update" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bulk-update">Bulk Update</TabsTrigger>
          <TabsTrigger value="manual-update">Manual Update</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-update" className="space-y-4">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Bulk Update from Google Sheets
              </CardTitle>
              <CardDescription>
                Update application scores and vulnerability categories from Google Sheets data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This will fetch data from Google Sheets and update all matching applications in the database.
                  The process matches applications by ID, phone number, or email address.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button 
                  onClick={handleBulkUpdate} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Updating...' : 'Start Bulk Update'}
                </Button>
                {consoleLogs.length > 0 && (
                  <Button 
                    onClick={clearConsole} 
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Console
                  </Button>
                )}
              </div>

              {/* Console Interface */}
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    <span className="text-white font-semibold">Database Console</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="h-48 overflow-y-auto border border-gray-700 rounded p-2 bg-gray-900">
                  {consoleLogs.length === 0 ? (
                    <div className="text-gray-500 italic">
                      Console ready. Click "Start Bulk Update" to see logs...
                    </div>
                  ) : (
                    consoleLogs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {progressLogs.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Progress Log:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {progressLogs.map((log, index) => (
                      <div key={index} className="text-sm font-mono text-gray-700">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {updateStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{updateStats.totalProcessed}</div>
                    <div className="text-sm text-muted-foreground">Total Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{updateStats.matched}</div>
                    <div className="text-sm text-muted-foreground">Matched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{updateStats.updated}</div>
                    <div className="text-sm text-muted-foreground">Updated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{updateStats.skipped}</div>
                    <div className="text-sm text-muted-foreground">Skipped</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual-update" className="space-y-4">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manual Update
              </CardTitle>
              <CardDescription>
                Manually update application scores and vulnerability categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={handleFetchApplications} 
                  disabled={isLoading}
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Load Applications
                </Button>
              </div>

              {applications.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="application-select">Select Application</Label>
                    <Select onValueChange={(value) => {
                      const app = applications.find(a => a.id === value)
                      setSelectedApplication(app || null)
                      if (app) {
                        setManualScore(app.applicationScore?.toString() || "")
                        setManualCategory(app.vulnerabilityCategory || "")
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an application" />
                      </SelectTrigger>
                      <SelectContent>
                        {applications.map((app) => (
                          <SelectItem key={app.id} value={app.id}>
                            {app.name} - {app.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedApplication && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="score">Application Score (0-100)</Label>
                        <Input
                          id="score"
                          type="number"
                          min="0"
                          max="100"
                          value={manualScore}
                          onChange={(e) => setManualScore(e.target.value)}
                          placeholder="Enter score (0-100)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Vulnerability Category</Label>
                        <Select value={manualCategory} onValueChange={setManualCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {vulnerabilityCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {selectedApplication && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <strong>Current Values:</strong>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          Score: {selectedApplication.applicationScore || 'Not set'}
                        </Badge>
                        <Badge variant="outline">
                          Category: {selectedApplication.vulnerabilityCategory || 'Not set'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {selectedApplication && (
                    <Button 
                      onClick={handleManualUpdate} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isLoading ? 'Updating...' : 'Update Application'}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Applications List
              </CardTitle>
              <CardDescription>
                View and manage application scores and vulnerability categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button 
                  onClick={handleFetchApplications} 
                  disabled={isLoading}
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Loading...' : 'Refresh Applications'}
                </Button>
              </div>

              {applications.length > 0 ? (
                <div className="space-y-2">
                  {applications.slice(0, 10).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{app.name}</div>
                        <div className="text-sm text-muted-foreground">{app.email}</div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={app.applicationScore ? "default" : "secondary"}>
                          Score: {app.applicationScore || 'N/A'}
                        </Badge>
                        <Badge variant={app.vulnerabilityCategory ? "default" : "secondary"}>
                          {app.vulnerabilityCategory || 'No Category'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {applications.length > 10 && (
                    <div className="text-sm text-muted-foreground text-center">
                      Showing first 10 of {applications.length} applications
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No applications loaded. Click "Refresh Applications" to load data.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.length}</div>
                <p className="text-xs text-muted-foreground">
                  Applications in database
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">With Scores</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applications.filter(app => app.applicationScore !== null).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Applications with scores
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">With Categories</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applications.filter(app => app.vulnerabilityCategory !== null).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Applications with categories
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
