"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { 
  Shield, 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Network, 
  Activity,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  BarChart3,
  Download,
  Upload,
  Trash2,
  Eye,
  Edit,
  Save,
  X,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Monitor,
  Globe,
  Lock,
  Unlock,
  Key,
  Zap,
  Wifi,
  HardDriveIcon,
  MemoryStick,
  Thermometer,
  Gauge
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

interface SystemInfo {
  version: string
  uptime: string
  environment: string
  lastBackup: string
  totalUsers: number
  activeUsers: number
  totalApplications: number
  pendingApplications: number
}

interface SystemHealth {
  status: "healthy" | "warning" | "critical"
  cpu: number
  memory: number
  disk: number
  database: "connected" | "disconnected"
  api: "online" | "offline"
  lastCheck: string
}

interface SystemLog {
  id: string
  timestamp: string
  level: "info" | "warning" | "error" | "debug"
  message: string
  source: string
  userId?: string
  ipAddress?: string
  userAgent?: string
}

interface LogsResponse {
  success: boolean
  logs: SystemLog[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface BackupConfig {
  id: string
  name: string
  schedule: string
  lastRun: string
  nextRun: string
  status: "active" | "inactive" | "failed"
  type: "database" | "files" | "full"
  retention: number
  size: string
  location?: string
}

interface BackupResponse {
  success: boolean
  jobs: BackupConfig[]
  totalJobs: number
  activeJobs: number
  failedJobs: number
}

export default function SystemPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    version: "1.0.0",
    uptime: "15 days, 3 hours",
    environment: "Production",
    lastBackup: "2 hours ago",
    totalUsers: 1250,
    activeUsers: 892,
    totalApplications: 3456,
    pendingApplications: 23
  })

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: "healthy",
    cpu: 45,
    memory: 67,
    disk: 78,
    database: "connected",
    api: "online",
    lastCheck: "2 minutes ago"
  })

  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  const [logsPagination, setLogsPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  const [backupConfigs, setBackupConfigs] = useState<BackupConfig[]>([])
  const [isLoadingBackups, setIsLoadingBackups] = useState(false)
  const [backupStats, setBackupStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    failedJobs: 0
  })

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedLogLevel, setSelectedLogLevel] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [logsRefreshInterval, setLogsRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Fetch system logs from API
  const fetchSystemLogs = async (page = 1, level = selectedLogLevel, search = searchTerm) => {
    try {
      setIsLoadingLogs(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        level: level,
        search: search
      })

      const response = await fetch(`/api/v1/superadmin/system/logs?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: LogsResponse = await response.json()
      
      if (data.success) {
        setSystemLogs(data.logs)
        setLogsPagination(data.pagination)
      } else {
        throw new Error(data.message || 'Failed to fetch logs')
      }
    } catch (error) {
      console.error('Error fetching system logs:', error)
      toast({
        title: "Error loading logs",
        description: error instanceof Error ? error.message : "Failed to fetch system logs",
        variant: "destructive",
      })
    } finally {
      setIsLoadingLogs(false)
    }
  }

  // Create a new log entry (for testing)
  const createTestLog = async () => {
    try {
      const testLogs = [
        { level: 'info', message: 'Test log entry created', source: 'system-test' },
        { level: 'warning', message: 'Test warning message', source: 'system-test' },
        { level: 'error', message: 'Test error message', source: 'system-test' },
        { level: 'debug', message: 'Test debug message', source: 'system-test' }
      ]
      
      const randomLog = testLogs[Math.floor(Math.random() * testLogs.length)]
      
      const response = await fetch('/api/v1/superadmin/system/logs', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(randomLog),
      })

      if (response.ok) {
        toast({
          title: "Test log created",
          description: `Created ${randomLog.level} log entry`,
        })
        // Refresh logs to show the new entry
        fetchSystemLogs()
      }
    } catch (error) {
      console.error('Error creating test log:', error)
    }
  }

  // Set up real-time log updates
  useEffect(() => {
    // Initial fetch
    fetchSystemLogs()

    // Set up auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchSystemLogs()
    }, 10000)

    setLogsRefreshInterval(interval)

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (logsRefreshInterval) {
        clearInterval(logsRefreshInterval)
      }
    }
  }, [logsRefreshInterval])

  // Fetch backup jobs from API
  const fetchBackupJobs = async () => {
    try {
      setIsLoadingBackups(true)
      const response = await fetch('/api/v1/superadmin/system/backups', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: BackupResponse = await response.json()
      
      if (data.success) {
        setBackupConfigs(data.jobs)
        setBackupStats({
          totalJobs: data.totalJobs,
          activeJobs: data.activeJobs,
          failedJobs: data.failedJobs
        })
      } else {
        throw new Error(data.message || 'Failed to fetch backup jobs')
      }
    } catch (error) {
      console.error('Error fetching backup jobs:', error)
      toast({
        title: "Error loading backups",
        description: error instanceof Error ? error.message : "Failed to fetch backup jobs",
        variant: "destructive",
      })
    } finally {
      setIsLoadingBackups(false)
    }
  }

  // Run backup now
  const handleRunBackupNow = async (jobId: string) => {
    try {
      const response = await fetch('/api/v1/superadmin/system/backups', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'run_now',
          jobId: jobId
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Backup started",
          description: `Backup job "${jobId}" has been initiated`,
        })
        // Refresh backup jobs to show updated status
        fetchBackupJobs()
      } else {
        throw new Error(data.message || 'Failed to start backup')
      }
    } catch (error) {
      console.error('Error running backup:', error)
      toast({
        title: "Backup failed",
        description: error instanceof Error ? error.message : "Failed to start backup",
        variant: "destructive",
      })
    }
  }

  // Toggle backup job status
  const handleToggleBackupJob = async (jobId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      
      const response = await fetch('/api/v1/superadmin/system/backups', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle_job',
          jobId: jobId
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Backup job updated",
          description: `Backup job "${jobId}" is now ${newStatus}`,
        })
        // Refresh backup jobs to show updated status
        fetchBackupJobs()
      } else {
        throw new Error(data.message || 'Failed to update backup job')
      }
    } catch (error) {
      console.error('Error toggling backup job:', error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update backup job",
        variant: "destructive",
      })
    }
  }

  // Create new backup job
  const handleCreateBackupJob = async (jobData: any) => {
    try {
      const response = await fetch('/api/v1/superadmin/system/backups', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_job',
          jobData: jobData
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Backup job created",
          description: `New backup job "${jobData.name}" has been created`,
        })
        // Refresh backup jobs to show the new job
        fetchBackupJobs()
      } else {
        throw new Error(data.message || 'Failed to create backup job')
      }
    } catch (error) {
      console.error('Error creating backup job:', error)
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Failed to create backup job",
        variant: "destructive",
      })
    }
  }

  // Handle filter changes
  useEffect(() => {
    fetchSystemLogs(1, selectedLogLevel, searchTerm)
  }, [selectedLogLevel, searchTerm])

  // Fetch backup jobs on component mount
  useEffect(() => {
    fetchBackupJobs()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSystemLogs()
    setIsRefreshing(false)
    toast({
      title: "System refreshed",
      description: "All system data has been updated",
    })
  }

  const handleBackupNow = async (backupId: string) => {
    toast({
      title: "Backup initiated",
      description: "Backup process has been started",
    })
  }

  const handleSystemRestart = async () => {
    toast({
      title: "System restart initiated",
      description: "The system will restart in 30 seconds",
      variant: "destructive",
    })
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-600 bg-green-100"
      case "warning": return "text-yellow-600 bg-yellow-100"
      case "critical": return "text-red-600 bg-red-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "info": return "text-blue-600 bg-blue-100"
      case "warning": return "text-yellow-600 bg-yellow-100"
      case "error": return "text-red-600 bg-red-100"
      case "debug": return "text-gray-600 bg-gray-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    fetchSystemLogs(newPage, selectedLogLevel, searchTerm)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchSystemLogs(1, selectedLogLevel, value)
    }, 500)
    return () => clearTimeout(timeoutId)
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 break-words">
            System Administration
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Monitor and manage system health, logs, and configurations
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 px-6 py-3 rounded-lg font-semibold"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh System</span>
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">System Status</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">{systemHealth.status}</p>
              </div>
              <div className={`p-3 rounded-full shrink-0 ${getHealthStatusColor(systemHealth.status)}`}>
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">CPU Usage</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{systemHealth.cpu}%</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full shrink-0">
                <Cpu className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Memory Usage</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{systemHealth.memory}%</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full shrink-0">
                <MemoryStick className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Disk Usage</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{systemHealth.disk}%</p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full shrink-0">
                <HardDrive className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 bg-white rounded-xl shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Server className="h-5 w-5 text-white" />
              </div>
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Version</span>
                <span className="text-sm font-semibold text-gray-900">{systemInfo.version}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Uptime</span>
                <span className="text-sm font-semibold text-gray-900">{systemInfo.uptime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Environment</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">{systemInfo.environment}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Last Backup</span>
                <span className="text-sm font-semibold text-gray-900">{systemInfo.lastBackup}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Total Users</span>
                <span className="text-sm font-semibold text-gray-900">{systemInfo.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Active Users</span>
                <span className="text-sm font-semibold text-gray-900">{systemInfo.activeUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Total Applications</span>
                <span className="text-sm font-semibold text-gray-900">{systemInfo.totalApplications.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Pending Applications</span>
                <span className="text-sm font-semibold text-gray-900">{systemInfo.pendingApplications.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white rounded-xl shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 rounded-t-xl">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Database</span>
                <Badge className={`${systemHealth.database === 'connected' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                  {systemHealth.database}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">API Status</span>
                <Badge className={`${systemHealth.api === 'online' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                  {systemHealth.api}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Last Health Check</span>
                <span className="text-sm font-semibold text-gray-900">{systemHealth.lastCheck}</span>
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-500">CPU Usage</span>
                    <span className="text-sm font-semibold text-gray-900">{systemHealth.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${systemHealth.cpu}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-500">Memory Usage</span>
                    <span className="text-sm font-semibold text-gray-900">{systemHealth.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${systemHealth.memory}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-500">Disk Usage</span>
                    <span className="text-sm font-semibold text-gray-900">{systemHealth.disk}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${systemHealth.disk}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-50 border-slate-200 shadow-sm">
          <TabsTrigger value="logs" className="py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
            <FileText className="h-4 w-4 mr-2" />
            System Logs
          </TabsTrigger>
          <TabsTrigger value="backups" className="py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
            <Database className="h-4 w-4 mr-2" />
            Backup Management
          </TabsTrigger>
          <TabsTrigger value="settings" className="py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </TabsTrigger>
        </TabsList>

        {/* System Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="border-0 bg-white rounded-xl shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      System Logs
                      {isLoadingLogs && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                      Monitor system events and troubleshoot issues • Auto-refresh every 10s
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {logsPagination.totalCount} entries
                    </Badge>
                    <Button
                      onClick={createTestLog}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Test Log
                    </Button>
                  </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Search and Filter */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search logs by message or source..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={selectedLogLevel} onValueChange={setSelectedLogLevel}>
                    <SelectTrigger className="w-48 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Filter by level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Timestamp</TableHead>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Level</TableHead>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Source</TableHead>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemLogs.map((log, index) => (
                      <TableRow 
                        key={log.id} 
                        className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{log.timestamp}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge className={`${getLogLevelColor(log.level)} px-3 py-1 font-medium text-xs rounded-full`}>
                            {log.level.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{log.source}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="text-sm text-gray-700">{log.message}</span>
                            {log.userId && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Users className="h-3 w-3" />
                                <span>User: {log.userId}</span>
                              </div>
                            )}
                            {log.ipAddress && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Network className="h-3 w-3" />
                                <span>IP: {log.ipAddress}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {systemLogs.length === 0 && !isLoadingLogs && (
                      <TableRow>
                        <TableCell colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <FileText className="h-12 w-12 text-gray-300" />
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">No logs found</h3>
                              <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {isLoadingLogs && (
                      <TableRow>
                        <TableCell colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                            <p className="text-sm text-gray-500">Loading logs...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {logsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Showing {((logsPagination.page - 1) * logsPagination.limit) + 1} to {Math.min(logsPagination.page * logsPagination.limit, logsPagination.totalCount)} of {logsPagination.totalCount} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(logsPagination.page - 1)}
                      disabled={!logsPagination.hasPrev || isLoadingLogs}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Previous
                    </Button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, logsPagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, logsPagination.page - 2) + i
                      if (pageNum > logsPagination.totalPages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={logsPagination.page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoadingLogs}
                          className={logsPagination.page === pageNum 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "border-gray-200 hover:bg-gray-50"
                          }
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(logsPagination.page + 1)}
                      disabled={!logsPagination.hasNext || isLoadingLogs}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Management Tab */}
        <TabsContent value="backups" className="space-y-6">
          <Card className="border-0 bg-white rounded-xl shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Database className="h-5 w-5 text-white" />
                    </div>
                    Backup Management
                    {isLoadingBackups && <RefreshCw className="h-4 w-4 animate-spin text-green-500" />}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    Manage automated backups and restore points • {backupStats.activeJobs} active jobs
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {backupStats.totalJobs} jobs
                  </Badge>
                  <Button 
                    onClick={() => handleCreateBackupJob({
                      name: 'Weekly Database Backup',
                      schedule: '0 2 * * 0',
                      type: 'database',
                      retention: 30
                    })}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 px-6 py-3 rounded-lg font-semibold"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Backup
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Name</TableHead>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Type</TableHead>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Schedule</TableHead>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Last Run</TableHead>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Next Run</TableHead>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Status</TableHead>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">Size</TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50 w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backupConfigs.map((backup, index) => (
                      <TableRow 
                        key={backup.id} 
                        className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-1 rounded ${
                              backup.type === 'database' ? 'bg-blue-100' :
                              backup.type === 'files' ? 'bg-green-100' :
                              'bg-purple-100'
                            }`}>
                              <Database className={`h-4 w-4 ${
                                backup.type === 'database' ? 'text-blue-600' :
                                backup.type === 'files' ? 'text-green-600' :
                                'text-purple-600'
                              }`} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{backup.name}</div>
                              <div className="text-xs text-gray-500">Retention: {backup.retention} days</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge className={`${
                            backup.type === 'database' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            backup.type === 'files' ? 'bg-green-100 text-green-800 border-green-200' :
                            'bg-purple-100 text-purple-800 border-purple-200'
                          } px-2 py-1 font-medium text-xs rounded-full`}>
                            {backup.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{backup.schedule}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{backup.lastRun}</span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{backup.nextRun}</span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              backup.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                              backup.status === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            } px-3 py-1 font-medium text-xs rounded-full`}>
                              {backup.status}
                            </Badge>
                            {backup.status === 'active' && (
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{backup.size}</span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex justify-center gap-1">
                            <Button
                              onClick={() => handleRunBackupNow(backup.id)}
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 border-green-200 hover:bg-green-50 hover:border-green-300"
                              title="Run Now"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => handleToggleBackupJob(backup.id, backup.status)}
                              variant="outline"
                              size="sm"
                              className={`h-8 px-2 ${
                                backup.status === 'active' 
                                  ? 'border-orange-200 hover:bg-orange-50 hover:border-orange-300' 
                                  : 'border-green-200 hover:bg-green-50 hover:border-green-300'
                              }`}
                              title={backup.status === 'active' ? 'Disable' : 'Enable'}
                            >
                              {backup.status === 'active' ? <X className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-xl rounded-lg">
                                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 hover:text-blue-600">
                                  <Eye className="h-4 w-4 mr-3" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer hover:bg-yellow-50 hover:text-yellow-600">
                                  <Edit className="h-4 w-4 mr-3" />
                                  Edit Schedule
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer">
                                  <Trash2 className="h-4 w-4 mr-3" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {backupConfigs.length === 0 && !isLoadingBackups && (
                      <TableRow>
                        <TableCell colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Database className="h-12 w-12 text-gray-300" />
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">No backup jobs found</h3>
                              <p className="text-sm text-gray-500">Create your first automated backup job</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {isLoadingBackups && (
                      <TableRow>
                        <TableCell colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="h-8 w-8 text-green-500 animate-spin" />
                            <p className="text-sm text-gray-500">Loading backup jobs...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 bg-white rounded-xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100 rounded-t-xl">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Maintenance Mode</Label>
                      <p className="text-xs text-gray-500">Enable maintenance mode to restrict access</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Auto Backup</Label>
                      <p className="text-xs text-gray-500">Automatically create backups</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email Notifications</Label>
                      <p className="text-xs text-gray-500">Send email alerts for system events</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Debug Mode</Label>
                      <p className="text-xs text-gray-500">Enable detailed logging</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white rounded-xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100 rounded-t-xl">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  System Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Button 
                    onClick={handleSystemRestart}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 px-6 py-3 rounded-lg font-semibold"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Restart System
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                  >
                    <Database className="h-5 w-5 mr-2" />
                    Clear Cache
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200"
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Clean Logs
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
