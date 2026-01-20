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
import { Settings, Save, Globe, Clock, Bell, Shield } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function GeneralSettingsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    platformName: "HarvestPlus by GEMURA",
    platformDescription: "Multi-Commodity Aggregation & Settlement Platform",
    defaultLanguage: "en",
    timezone: "Africa/Kigali",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    currency: "RWF",
    enableNotifications: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    maintenanceMode: false,
    allowUserRegistration: true,
    requireEmailVerification: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    supportEmail: "support@harvestplus.rw",
    supportPhone: "+250 788 123 456",
  })

  useEffect(() => {
    // Load saved settings
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem("Gemurai_token")
        const response = await fetch("/api/v1/admin/settings/general", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setFormData({ ...formData, ...result.data })
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }
    loadSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/admin/settings/general", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("General settings saved successfully")
      } else {
        toast.error(result.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                General Settings
              </h1>
              <p className="text-blue-700 mt-1 font-medium">Configure platform-wide general settings</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform Information */}
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe className="h-5 w-5" />
                Platform Information
              </CardTitle>
              <CardDescription className="text-blue-100">
                Basic platform identification and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName" className="text-base font-semibold text-gray-700">
                  Platform Name
                </Label>
                <Input
                  id="platformName"
                  value={formData.platformName}
                  onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                  className="border-2 border-blue-200 focus:border-blue-500"
                  placeholder="HarvestPlus by GEMURA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platformDescription" className="text-base font-semibold text-gray-700">
                  Platform Description
                </Label>
                <Textarea
                  id="platformDescription"
                  value={formData.platformDescription}
                  onChange={(e) => setFormData({ ...formData, platformDescription: e.target.value })}
                  className="border-2 border-blue-200 focus:border-blue-500"
                  rows={3}
                  placeholder="Multi-Commodity Aggregation & Settlement Platform"
                />
              </div>
            </CardContent>
          </Card>

          {/* Localization */}
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe className="h-5 w-5" />
                Localization
              </CardTitle>
              <CardDescription className="text-blue-100">
                Language, timezone, and format settings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage" className="text-base font-semibold text-gray-700">
                    Default Language
                  </Label>
                  <Select
                    value={formData.defaultLanguage}
                    onValueChange={(value) => setFormData({ ...formData, defaultLanguage: value })}
                  >
                    <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="rw">Kinyarwanda</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-base font-semibold text-gray-700">
                    Timezone
                  </Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  >
                    <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Kigali">Africa/Kigali (GMT+2)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat" className="text-base font-semibold text-gray-700">
                    Date Format
                  </Label>
                  <Select
                    value={formData.dateFormat}
                    onValueChange={(value) => setFormData({ ...formData, dateFormat: value })}
                  >
                    <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeFormat" className="text-base font-semibold text-gray-700">
                    Time Format
                  </Label>
                  <Select
                    value={formData.timeFormat}
                    onValueChange={(value) => setFormData({ ...formData, timeFormat: value })}
                  >
                    <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 Hour</SelectItem>
                      <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-base font-semibold text-gray-700">
                    Currency
                  </Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RWF">RWF (Rwandan Franc)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Registration */}
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5" />
                User Registration
              </CardTitle>
              <CardDescription className="text-blue-100">
                Control user registration and verification
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex-1">
                  <Label htmlFor="allowUserRegistration" className="text-base font-semibold text-gray-700 cursor-pointer">
                    Allow User Registration
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">Allow new users to register accounts</p>
                </div>
                <Switch
                  id="allowUserRegistration"
                  checked={formData.allowUserRegistration}
                  onCheckedChange={(checked) => setFormData({ ...formData, allowUserRegistration: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex-1">
                  <Label htmlFor="requireEmailVerification" className="text-base font-semibold text-gray-700 cursor-pointer">
                    Require Email Verification
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">Users must verify their email before accessing the platform</p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={formData.requireEmailVerification}
                  onCheckedChange={(checked) => setFormData({ ...formData, requireEmailVerification: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription className="text-blue-100">
                System-wide configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex-1">
                  <Label htmlFor="maintenanceMode" className="text-base font-semibold text-gray-700 cursor-pointer">
                    Maintenance Mode
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">Put the platform in maintenance mode (only admins can access)</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={formData.maintenanceMode}
                  onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout" className="text-base font-semibold text-gray-700">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={formData.sessionTimeout}
                    onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) || 30 })}
                    className="border-2 border-blue-200 focus:border-blue-500"
                    min={5}
                    max={480}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts" className="text-base font-semibold text-gray-700">
                    Max Login Attempts
                  </Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={formData.maxLoginAttempts}
                    onChange={(e) => setFormData({ ...formData, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                    className="border-2 border-blue-200 focus:border-blue-500"
                    min={3}
                    max={10}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <Bell className="h-5 w-5" />
                Support Information
              </CardTitle>
              <CardDescription className="text-blue-100">
                Contact information for user support
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supportEmail" className="text-base font-semibold text-gray-700">
                    Support Email
                  </Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                    className="border-2 border-blue-200 focus:border-blue-500"
                    placeholder="support@harvestplus.rw"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportPhone" className="text-base font-semibold text-gray-700">
                    Support Phone
                  </Label>
                  <Input
                    id="supportPhone"
                    type="tel"
                    value={formData.supportPhone}
                    onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                    className="border-2 border-blue-200 focus:border-blue-500"
                    placeholder="+250 788 123 456"
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
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all border-2 border-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
