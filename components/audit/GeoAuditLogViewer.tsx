"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  FileText,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  User,
  MapPin,
} from "lucide-react"
import { format } from "date-fns"
import type { GeoAuditLog, GeoAuditAction, GeoEntityType } from "@/lib/services/geo-audit-service"

export interface GeoAuditLogViewerProps {
  entityType?: GeoEntityType
  entityId?: string
  userId?: string
  className?: string
  title?: string
}

const ACTION_COLORS: Record<GeoAuditAction, string> = {
  CREATE: "bg-green-100 text-green-700 border-green-300",
  UPDATE: "bg-blue-100 text-blue-700 border-blue-300",
  DELETE: "bg-red-100 text-red-700 border-red-300",
  VIEW: "bg-gray-100 text-gray-700 border-gray-300",
  EXPORT: "bg-purple-100 text-purple-700 border-purple-300",
  CONSENT_GRANTED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  CONSENT_REVOKED: "bg-orange-100 text-orange-700 border-orange-300",
  ACCESS_DENIED: "bg-red-100 text-red-700 border-red-300",
}

export function GeoAuditLogViewer({
  entityType,
  entityId,
  userId,
  className,
  title = "Geo-Location Audit Log",
}: GeoAuditLogViewerProps) {
  const [logs, setLogs] = useState<GeoAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: "" as GeoAuditAction | "",
    entityType: entityType || ("" as GeoEntityType | ""),
    startDate: "",
    endDate: "",
  })

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (entityType) params.set("entityType", entityType)
      if (entityId) params.set("entityId", entityId)
      if (userId) params.set("userId", userId)
      if (filters.action && filters.action !== "all") params.set("action", filters.action)
      if (filters.startDate) params.set("startDate", filters.startDate)
      if (filters.endDate) params.set("endDate", filters.endDate)

      const response = await fetch(`/api/v1/geo/audit-logs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [entityType, entityId, userId, filters])

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (entityType) params.set("entityType", entityType)
      if (entityId) params.set("entityId", entityId)
      if (userId) params.set("userId", userId)

      const response = await fetch(`/api/v1/geo/audit-logs/export?${params.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `geo-audit-logs-${new Date().toISOString()}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting audit logs:", error)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              Complete audit trail for geo-location data operations
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="action">Action</Label>
            <Select
              value={filters.action || "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, action: (value === "all" ? "" : value) as GeoAuditAction | "" })
              }
            >
              <SelectTrigger id="action">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="VIEW">View</SelectItem>
                <SelectItem value="EXPORT">Export</SelectItem>
                <SelectItem value="CONSENT_GRANTED">Consent Granted</SelectItem>
                <SelectItem value="CONSENT_REVOKED">Consent Revoked</SelectItem>
                <SelectItem value="ACCESS_DENIED">Access Denied</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="entityType">Entity Type</Label>
            <Select
              value={filters.entityType || "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, entityType: (value === "all" ? "" : value) as GeoEntityType | "" })
              }
            >
              <SelectTrigger id="entityType">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="farmer">Farmer</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="mcc">MCC</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="milk_collection">Milk Collection</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No audit logs found</div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-400" />
                        <div>
                          <div className="font-medium">{log.userName || "Unknown"}</div>
                          <div className="text-xs text-gray-500">{log.userRole}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={ACTION_COLORS[log.action] || "bg-gray-100 text-gray-700"}
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <div>
                          <div className="font-medium">{log.entityName || log.entityId}</div>
                          <div className="text-xs text-gray-500">{log.entityType}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.oldValue && log.newValue ? (
                        <div className="text-xs space-y-1">
                          <div className="text-red-600">
                            Old: {log.oldValue.latitude?.toFixed(4)},{" "}
                            {log.oldValue.longitude?.toFixed(4)}
                          </div>
                          <div className="text-green-600">
                            New: {log.newValue.latitude?.toFixed(4)},{" "}
                            {log.newValue.longitude?.toFixed(4)}
                          </div>
                        </div>
                      ) : log.newValue ? (
                        <div className="text-xs text-green-600">
                          {log.newValue.latitude?.toFixed(4)},{" "}
                          {log.newValue.longitude?.toFixed(4)}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {log.ipAddress || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
