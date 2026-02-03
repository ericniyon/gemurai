"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { FileText, Search, Download, Filter } from "lucide-react"
import { SettingsPageHeader } from "@/components/settings/settings-page-header"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AuditLogsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [loading, setLoading] = useState(false)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [filters, setFilters] = useState({
    action: "all",
    user: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  })

  useEffect(() => {
    fetchAuditLogs()
  }, [filters, pagination.page])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.action !== "all" && { action: filters.action }),
        ...(filters.user !== "all" && { userId: filters.user }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await fetch(`/api/v1/admin/settings/audit-logs?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setAuditLogs(result.data.logs || [])
          setPagination({
            ...pagination,
            total: result.data.total || 0,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      toast.error("Failed to fetch audit logs")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const params = new URLSearchParams({
        ...(filters.action !== "all" && { action: filters.action }),
        ...(filters.user !== "all" && { userId: filters.user }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      })

      const response = await fetch(`/api/v1/admin/settings/audit-logs/export?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `audit-logs-${new Date().toISOString()}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Audit logs exported successfully")
      } else {
        toast.error("Failed to export audit logs")
      }
    } catch (error) {
      console.error("Error exporting audit logs:", error)
      toast.error("Failed to export audit logs")
    }
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes("CREATE") || action.includes("LOGIN")) return "bg-green-100 text-green-800 border-green-300"
    if (action.includes("UPDATE") || action.includes("EDIT")) return "bg-blue-100 text-blue-800 border-blue-300"
    if (action.includes("DELETE") || action.includes("LOGOUT")) return "bg-red-100 text-red-800 border-red-300"
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-gray-600">You need admin privileges to access this page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8">
        <SettingsPageHeader
          title="Audit Logs"
          description="View system activity and security audit trail"
          icon={FileText}
          lang={lang}
        />
        <Button
          onClick={handleExport}
          variant="outline"
          className="shrink-0 border-slate-200 hover:bg-slate-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200/80 mb-6">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Filter className="h-5 w-5 text-slate-600" />
            Filters
          </CardTitle>
        </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Action Type</Label>
                <Select
                  value={filters.action}
                  onValueChange={(value) => {
                    setFilters({ ...filters, action: value })
                    setPagination({ ...pagination, page: 1 })
                  }}
                >
                  <SelectTrigger className="border-slate-200 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                    <SelectItem value="VIEW">View</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Date From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => {
                    setFilters({ ...filters, dateFrom: e.target.value })
                    setPagination({ ...pagination, page: 1 })
                  }}
                  className="border-slate-200 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Date To</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => {
                    setFilters({ ...filters, dateTo: e.target.value })
                    setPagination({ ...pagination, page: 1 })
                  }}
                  className="border-slate-200 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    value={filters.search}
                    onChange={(e) => {
                      setFilters({ ...filters, search: e.target.value })
                      setPagination({ ...pagination, page: 1 })
                    }}
                    className="border-slate-200 focus:border-primary focus:ring-primary/20 pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Audit Logs Table */}
      <Card className="border-slate-200/80">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
          <CardTitle className="flex items-center justify-between text-slate-900">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-600" />
              Audit Logs
            </div>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-200">
              {pagination.total} total
            </Badge>
          </CardTitle>
        </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-600">Loading audit logs...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-slate-600">No audit logs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-medium text-slate-700">Timestamp</TableHead>
                      <TableHead className="font-medium text-slate-700">User</TableHead>
                      <TableHead className="font-medium text-slate-700">Action</TableHead>
                      <TableHead className="font-medium text-slate-700">Entity</TableHead>
                      <TableHead className="font-medium text-slate-700">Details</TableHead>
                      <TableHead className="font-medium text-slate-700">IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">
                          {new Date(log.timestamp || log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.user?.name || "System"}</p>
                            <p className="text-xs text-slate-500">{log.user?.email || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border-2 ${getActionBadgeColor(log.action || "")}`}>
                            {log.action || "UNKNOWN"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{log.entityType || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">{log.description || log.details || "—"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-slate-500">{log.ipAddress || "N/A"}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50">
                <p className="text-sm text-slate-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="border-slate-200 hover:border-slate-400"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    className="border-slate-200 hover:border-slate-400"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
