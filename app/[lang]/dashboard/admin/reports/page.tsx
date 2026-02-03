"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Activity,
  XCircle,
  Loader2,
  CheckCircle,
  Building2,
  PieChart,
  LineChart,
  Filter,
  RefreshCw,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"

interface Report {
  id: string
  reportType: string
  title: string
  generatedAt: string
  format: string
  downloadUrl?: string
  status: "completed" | "generating" | "failed"
  startDate?: string
  endDate?: string
  mccId?: string
  farmerId?: string
}

interface ReportStats {
  totalReports: number
  todayReports: number
  thisMonthReports: number
  totalDownloads: number
}

export default function AdminReportsPage() {
  const { user: currentUser } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [mccs, setMccs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState<string>("")
  const [stats, setStats] = useState<ReportStats>({
    totalReports: 0,
    todayReports: 0,
    thisMonthReports: 0,
    totalDownloads: 0,
  })

  const [reportConfig, setReportConfig] = useState({
    reportType: "",
    mccId: "all",
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    format: "pdf",
    farmerId: "",
  })

  useEffect(() => {
    if (currentUser && (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN")) {
      fetchReports()
      fetchMCCs()
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser && (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN")) {
      calculateStats()
    }
  }, [currentUser, reports])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const savedReports = localStorage.getItem("generated_reports")
      if (savedReports) {
        try {
          const parsed = JSON.parse(savedReports)
          setReports(Array.isArray(parsed) ? parsed : [])
        } catch {
          setReports([])
        }
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      setReports([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMCCs = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/mcc/setup", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setMccs(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching MCCs:", error)
    }
  }

  const calculateStats = () => {
    try {
      const today = new Date()
      const startOfThisMonth = startOfMonth(today)

      const todayReports = reports.filter((r) => {
        try {
          return r.generatedAt && format(new Date(r.generatedAt), "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
        } catch {
          return false
        }
      }).length

      const thisMonthReports = reports.filter((r) => {
        try {
          return r.generatedAt && new Date(r.generatedAt) >= startOfThisMonth
        } catch {
          return false
        }
      }).length

      setStats({
        totalReports: reports.length,
        todayReports,
        thisMonthReports,
        totalDownloads: reports.filter((r) => r.downloadUrl).length,
      })
    } catch (error) {
      console.error("Error calculating stats:", error)
    }
  }

  const handleGenerateReport = async () => {
    if (!reportConfig.reportType) {
      toast.error("Please select a report type")
      return
    }

    setIsGenerating(true)

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/mcc/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportType: reportConfig.reportType,
          mccId: reportConfig.mccId && reportConfig.mccId !== "all" ? reportConfig.mccId : undefined,
          startDate: reportConfig.startDate,
          endDate: reportConfig.endDate,
          format: reportConfig.format,
          farmerId: reportConfig.farmerId || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const newReport: Report = {
          id: result.data.reportId,
          reportType: reportConfig.reportType,
          title: getReportTitle(reportConfig.reportType),
          generatedAt: new Date().toISOString(),
          format: reportConfig.format,
          downloadUrl: result.data.downloadUrl,
          status: "completed",
          startDate: reportConfig.startDate,
          endDate: reportConfig.endDate,
          mccId: reportConfig.mccId !== "all" ? reportConfig.mccId : undefined,
          farmerId: reportConfig.farmerId || undefined,
        }

        const updatedReports = [newReport, ...reports]
        setReports(updatedReports)
        localStorage.setItem("generated_reports", JSON.stringify(updatedReports))
        calculateStats()

        toast.success("Report generated successfully")
        setIsDialogOpen(false)
      } else {
        toast.error(result.error || "Failed to generate report")
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast.error("Failed to generate report")
    } finally {
      setIsGenerating(false)
    }
  }

  const getReportTitle = (reportType: string): string => {
    const titles: Record<string, string> = {
      summary: "Summary Report",
      farmer: "Farmer Report",
      financial: "Financial Report",
      period: "Period Report",
      analytics: "Analytics Report",
      quality: "Quality Report",
      sales: "Sales Report",
      rentals: "Rentals Report",
      daily: "Daily Report",
      weekly: "Weekly Report",
      monthly: "Monthly Report",
    }
    return titles[reportType] || reportType
  }

  const handleDownloadReport = async (report: Report) => {
    if (!report.downloadUrl) {
      toast.error("Download URL not available")
      return
    }
    try {
      const token = localStorage.getItem("Gemurai_token")
      // Append params for re-generation when cache expires
      const params = new URLSearchParams()
      if (report.reportType) params.set("reportType", report.reportType)
      if (report.format) params.set("format", report.format)
      if (report.startDate) params.set("startDate", report.startDate)
      if (report.endDate) params.set("endDate", report.endDate)
      if (report.mccId) params.set("mccId", report.mccId)
      if (report.farmerId) params.set("farmerId", report.farmerId)
      const url = params.toString()
        ? `${report.downloadUrl}?${params.toString()}`
        : report.downloadUrl
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Download failed")
      }
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      const ext = report.format === "pdf" ? "pdf" : "json"
      a.download = `report_${report.id}.${ext}`
      a.click()
      window.URL.revokeObjectURL(blobUrl)
      toast.success("Report downloaded")
    } catch (error) {
      console.error("Download error:", error)
      toast.error(error instanceof Error ? error.message : "Download failed")
    }
  }

  const reportTypes = [
    { value: "summary", label: "Summary Report", icon: BarChart3, description: "Overview of all activities" },
    { value: "financial", label: "Financial Report", icon: DollarSign, description: "Revenue, expenses, and payments" },
    { value: "analytics", label: "Analytics Report", icon: TrendingUp, description: "Trends and insights" },
    { value: "quality", label: "Quality Report", icon: CheckCircle, description: "Quality metrics and standards" },
    { value: "sales", label: "Sales Report", icon: Package, description: "Sales transactions and revenue" },
    { value: "farmer", label: "Farmer Report", icon: Users, description: "Individual farmer performance" },
    { value: "daily", label: "Daily Report", icon: Calendar, description: "Day-to-day operations" },
    { value: "weekly", label: "Weekly Report", icon: Calendar, description: "Weekly aggregated data" },
    { value: "monthly", label: "Monthly Report", icon: Calendar, description: "Monthly summary" },
    { value: "period", label: "Period Report", icon: Activity, description: "Custom period analysis" },
    { value: "rentals", label: "Rentals Report", icon: Building2, description: "Asset rental transactions" },
  ]

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-2 border-red-100">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
              <p className="text-gray-600">You need admin privileges to access this page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">Generate and manage system reports</p>
            </div>
            <Button
              onClick={() => {
                setReportConfig({
                  reportType: "",
                  mccId: "all",
                  startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
                  endDate: format(new Date(), "yyyy-MM-dd"),
                  format: "pdf",
                  farmerId: "",
                })
                setIsDialogOpen(true)
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.totalReports}</div>
              <p className="text-xs text-gray-500 mt-1">All generated reports</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Today</CardTitle>
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.todayReports}</div>
              <p className="text-xs text-gray-500 mt-1">Generated today</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.thisMonthReports}</div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 hover:border-orange-400 transition-all shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Downloads</CardTitle>
                <Download className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{stats.totalDownloads}</div>
              <p className="text-xs text-gray-500 mt-1">Total downloads</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Types Grid */}
        <Card className="mb-6 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900">Available Reports</CardTitle>
            <CardDescription>Select a report type to generate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Card
                    key={type.value}
                    className="border-2 border-gray-200 hover:border-blue-400 transition-all cursor-pointer hover:shadow-md"
                    onClick={() => {
                      setReportConfig({
                        ...reportConfig,
                        reportType: type.value,
                      })
                      setIsDialogOpen(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{type.label}</h3>
                          <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900">Recent Reports</CardTitle>
            <CardDescription>View and download previously generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    accessorKey: "reportType",
                    header: "Report Type",
                    cell: ({ row }) => (
                      <Badge variant="outline" className="border-blue-300 text-blue-700">
                        {row.original.reportType}
                      </Badge>
                    ),
                  },
                  { accessorKey: "title", header: "Title", cell: ({ row }) => <span className="font-medium">{row.original.title}</span> },
                  {
                    accessorKey: "format",
                    header: "Format",
                    cell: ({ row }) => (
                      <Badge variant="outline" className="border-gray-300 text-gray-700 uppercase">
                        {row.original.format}
                      </Badge>
                    ),
                  },
                  {
                    accessorKey: "generatedAt",
                    header: "Generated",
                    cell: ({ row }) => {
                      try {
                        return row.original.generatedAt
                          ? format(new Date(row.original.generatedAt), "MMM dd, yyyy HH:mm")
                          : "-"
                      } catch {
                        return "-"
                      }
                    },
                  },
                  {
                    accessorKey: "status",
                    header: "Status",
                    cell: ({ row }) => (
                      <Badge
                        variant={row.original.status === "completed" ? "default" : "secondary"}
                        className={
                          row.original.status === "completed"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : row.original.status === "generating"
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {row.original.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {row.original.status === "generating" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        {row.original.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                        {row.original.status}
                      </Badge>
                    ),
                  },
                  {
                    id: "actions",
                    header: () => <span className="text-right w-full block">Actions</span>,
                    cell: ({ row }) => (
                      <div className="flex justify-end">
                        {row.original.downloadUrl && row.original.status === "completed" ? (
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadReport(row.original)} className="h-8">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">Not available</span>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={reports}
                searchKey="search"
                searchPlaceholder="Search reports..."
                emptyMessage="No reports generated yet"
                emptyDescription="Click Generate Report to create your first report"
                entityName="reports"
                pageSize={10}
                defaultSorting={[{ id: "generatedAt", desc: true }]}
              />
            )}
          </CardContent>
        </Card>

        {/* Generate Report Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white opacity-100 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-900">Generate Report</DialogTitle>
              <DialogDescription>
                Configure report parameters and generate your report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reportType" className="text-base font-semibold text-gray-700">
                  Report Type *
                </Label>
                <Select
                  value={reportConfig.reportType}
                  onValueChange={(value) => setReportConfig({ ...reportConfig, reportType: value })}
                  required
                >
                  <SelectTrigger style={{ border: '2px solid lightblue' }}>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mccId" className="text-base font-semibold text-gray-700">
                  MCC (Optional)
                </Label>
                <Select
                  value={reportConfig.mccId}
                  onValueChange={(value) => setReportConfig({ ...reportConfig, mccId: value })}
                >
                  <SelectTrigger style={{ border: '2px solid lightblue' }}>
                    <SelectValue placeholder="All MCCs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All MCCs</SelectItem>
                    {mccs.map((mcc) => (
                      <SelectItem key={mcc.id} value={mcc.id}>
                        {mcc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-base font-semibold text-gray-700">
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={reportConfig.startDate}
                    onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
                    required
                    style={{ border: '2px solid lightblue' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-base font-semibold text-gray-700">
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={reportConfig.endDate}
                    onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                    required
                    style={{ border: '2px solid lightblue' }}
                  />
                </div>
              </div>

              {reportConfig.reportType === "farmer" && (
                <div className="space-y-2">
                  <Label htmlFor="farmerId" className="text-base font-semibold text-gray-700">
                    Farmer ID (Optional)
                  </Label>
                  <Input
                    id="farmerId"
                    value={reportConfig.farmerId}
                    onChange={(e) => setReportConfig({ ...reportConfig, farmerId: e.target.value })}
                    placeholder="Enter farmer ID"
                    style={{ border: '2px solid lightblue' }}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="format" className="text-base font-semibold text-gray-700">
                  Format *
                </Label>
                <Select
                  value={reportConfig.format}
                  onValueChange={(value) => setReportConfig({ ...reportConfig, format: value })}
                  required
                >
                  <SelectTrigger style={{ border: '2px solid lightblue' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel (XLSX)</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating || !reportConfig.reportType}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
