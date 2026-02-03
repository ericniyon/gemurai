"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { Database, Server, Cloud, Save, RefreshCw } from "lucide-react"
import { SettingsPageHeader } from "@/components/settings/settings-page-header"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SystemConfigurationPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [loading, setLoading] = useState(false)
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [formData, setFormData] = useState({
    databaseBackupFrequency: "daily",
    enableAutoBackup: true,
    backupRetentionDays: 30,
    enableAPILogging: true,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    cacheEnabled: true,
    cacheTTL: 3600,
    enableRateLimiting: true,
    rateLimitRequests: 100,
    rateLimitWindow: 60,
    enableCORS: true,
    allowedOrigins: "",
    maxFileUploadSize: 10,
    allowedFileTypes: "jpg,jpeg,png,pdf,doc,docx,xlsx",
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem("Gemurai_token")
        const [settingsRes, infoRes] = await Promise.all([
          fetch("/api/v1/admin/settings/system", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/v1/admin/settings/system-info", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (settingsRes.ok) {
          const result = await settingsRes.json()
          if (result.success && result.data) {
            setFormData((prev) => ({ ...prev, ...result.data }))
          }
        }

        if (infoRes.ok) {
          const result = await infoRes.json()
          if (result.success && result.data) {
            setSystemInfo(result.data)
          }
        }
      } catch (error) {
        console.error("Error loading system settings:", error)
      }
    }
    loadSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/admin/settings/system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("System configuration saved successfully")
      } else {
        toast.error(result.error || "Failed to save configuration")
      }
    } catch (error) {
      console.error("Error saving configuration:", error)
      toast.error("Failed to save configuration")
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/admin/settings/test-db", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (response.ok && result.success) {
        toast.success("Database connection successful")
      } else {
        toast.error(result.error || "Database connection failed")
      }
    } catch (error) {
      toast.error("Failed to test database connection")
    }
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-slate-500">You need admin privileges to access this page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <SettingsPageHeader
        title="System Configuration"
        description="Configure system-level settings and infrastructure"
        icon={Database}
        lang={lang}
      />

      {/* System Information */}
      {systemInfo && (
        <Card className="border-slate-200/80 mb-6">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Server className="h-5 w-5 text-slate-600" />
              System Information
            </CardTitle>
          </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-600">Database Status</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{systemInfo.databaseStatus || "Connected"}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-600">Server Uptime</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{systemInfo.uptime || "N/A"}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-600">Version</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{systemInfo.version || "1.0.0"}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-600">Environment</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{systemInfo.environment || "Production"}</p>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={handleTestConnection}
                  variant="outline"
                  className="border-slate-200 hover:border-slate-400"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Database Connection
                </Button>
              </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Backup Settings */}
          <Card className="border-slate-200/80">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Cloud className="h-5 w-5" />
                Backup & Recovery
              </CardTitle>
              <CardDescription className="text-slate-600">
                Configure database backup and retention policies
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <Label htmlFor="enableAutoBackup" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Enable Automatic Backups
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">Automatically backup database on schedule</p>
                </div>
                <Switch
                  id="enableAutoBackup"
                  checked={formData.enableAutoBackup}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableAutoBackup: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="databaseBackupFrequency" className="text-sm font-medium text-slate-700">
                    Backup Frequency
                  </Label>
                  <Select
                    value={formData.databaseBackupFrequency}
                    onValueChange={(value) => setFormData({ ...formData, databaseBackupFrequency: value })}
                  >
                    <SelectTrigger className="border-slate-200 focus:border-primary focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupRetentionDays" className="text-sm font-medium text-slate-700">
                    Backup Retention (days)
                  </Label>
                  <Input
                    id="backupRetentionDays"
                    type="number"
                    value={formData.backupRetentionDays}
                    onChange={(e) => setFormData({ ...formData, backupRetentionDays: parseInt(e.target.value) || 30 })}
                    className="border-slate-200 focus:border-primary focus:ring-primary/20"
                    min={1}
                    max={365}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance & Monitoring */}
          <Card className="border-slate-200/80">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Server className="h-5 w-5 text-slate-600" />
                Performance & Monitoring
              </CardTitle>
              <CardDescription className="text-slate-600">
                System performance and monitoring settings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <Label htmlFor="enableAPILogging" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Enable API Logging
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">Log all API requests and responses</p>
                </div>
                <Switch
                  id="enableAPILogging"
                  checked={formData.enableAPILogging}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableAPILogging: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <Label htmlFor="enableErrorTracking" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Enable Error Tracking
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">Track and log system errors</p>
                </div>
                <Switch
                  id="enableErrorTracking"
                  checked={formData.enableErrorTracking}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableErrorTracking: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <Label htmlFor="enablePerformanceMonitoring" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Enable Performance Monitoring
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">Monitor system performance metrics</p>
                </div>
                <Switch
                  id="enablePerformanceMonitoring"
                  checked={formData.enablePerformanceMonitoring}
                  onCheckedChange={(checked) => setFormData({ ...formData, enablePerformanceMonitoring: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <Label htmlFor="cacheEnabled" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Enable Caching
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">Enable response caching for better performance</p>
                </div>
                <Switch
                  id="cacheEnabled"
                  checked={formData.cacheEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, cacheEnabled: checked })}
                />
              </div>

              {formData.cacheEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="cacheTTL" className="text-sm font-medium text-slate-700">
                    Cache TTL (seconds)
                  </Label>
                  <Input
                    id="cacheTTL"
                    type="number"
                    value={formData.cacheTTL}
                    onChange={(e) => setFormData({ ...formData, cacheTTL: parseInt(e.target.value) || 3600 })}
                    className="border-slate-200 focus:border-primary focus:ring-primary/20"
                    min={60}
                    max={86400}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security & Rate Limiting */}
          <Card className="border-slate-200/80">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Server className="h-5 w-5 text-slate-600" />
                Security & Rate Limiting
              </CardTitle>
              <CardDescription className="text-slate-600">
                API security and rate limiting configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <Label htmlFor="enableRateLimiting" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Enable Rate Limiting
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">Limit API requests per time window</p>
                </div>
                <Switch
                  id="enableRateLimiting"
                  checked={formData.enableRateLimiting}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableRateLimiting: checked })}
                />
              </div>

              {formData.enableRateLimiting && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rateLimitRequests" className="text-sm font-medium text-slate-700">
                      Max Requests
                    </Label>
                    <Input
                      id="rateLimitRequests"
                      type="number"
                      value={formData.rateLimitRequests}
                      onChange={(e) => setFormData({ ...formData, rateLimitRequests: parseInt(e.target.value) || 100 })}
                      className="border-slate-200 focus:border-primary focus:ring-primary/20"
                      min={10}
                      max={1000}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rateLimitWindow" className="text-sm font-medium text-slate-700">
                      Time Window (seconds)
                    </Label>
                    <Input
                      id="rateLimitWindow"
                      type="number"
                      value={formData.rateLimitWindow}
                      onChange={(e) => setFormData({ ...formData, rateLimitWindow: parseInt(e.target.value) || 60 })}
                      className="border-slate-200 focus:border-primary focus:ring-primary/20"
                      min={10}
                      max={3600}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <Label htmlFor="enableCORS" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Enable CORS
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">Allow cross-origin resource sharing</p>
                </div>
                <Switch
                  id="enableCORS"
                  checked={formData.enableCORS}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableCORS: checked })}
                />
              </div>

              {formData.enableCORS && (
                <div className="space-y-2">
                  <Label htmlFor="allowedOrigins" className="text-sm font-medium text-slate-700">
                    Allowed Origins (comma-separated)
                  </Label>
                  <Input
                    id="allowedOrigins"
                    value={formData.allowedOrigins}
                    onChange={(e) => setFormData({ ...formData, allowedOrigins: e.target.value })}
                    className="border-slate-200 focus:border-primary focus:ring-primary/20"
                    placeholder="https://example.com, https://app.example.com"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Upload Settings */}
          <Card className="border-slate-200/80">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Cloud className="h-5 w-5" />
                File Upload Settings
              </CardTitle>
              <CardDescription className="text-slate-600">
                Configure file upload limits and allowed types
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileUploadSize" className="text-sm font-medium text-slate-700">
                    Max File Size (MB)
                  </Label>
                  <Input
                    id="maxFileUploadSize"
                    type="number"
                    value={formData.maxFileUploadSize}
                    onChange={(e) => setFormData({ ...formData, maxFileUploadSize: parseInt(e.target.value) || 10 })}
                    className="border-slate-200 focus:border-primary focus:ring-primary/20"
                    min={1}
                    max={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes" className="text-sm font-medium text-slate-700">
                    Allowed File Types (comma-separated)
                  </Label>
                  <Input
                    id="allowedFileTypes"
                    value={formData.allowedFileTypes}
                    onChange={(e) => setFormData({ ...formData, allowedFileTypes: e.target.value })}
                    className="border-slate-200 focus:border-primary focus:ring-primary/20"
                    placeholder="jpg,jpeg,png,pdf"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Configuration"}
            </Button>
        </div>
      </form>
    </div>
  )
}
