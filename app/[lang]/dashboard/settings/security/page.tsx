"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { Shield, Save, Lock, Key, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SecurityPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    // Password Policy
    minPasswordLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    passwordExpiryDays: 90,
    preventPasswordReuse: true,
    maxPasswordHistory: 5,

    // Authentication
    enable2FA: false,
    enableSSO: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    requireStrongPasswords: true,

    // API Security
    enableAPIAuthentication: true,
    apiKeyExpiryDays: 365,
    enableHTTPSOnly: true,
    enableCSRFProtection: true,

    // Data Security
    enableEncryption: true,
    encryptionAlgorithm: "AES-256",
    enableDataBackup: true,
    enableAuditLogging: true,
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem("Gemurai_token")
        const response = await fetch("/api/v1/admin/settings/security", {
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
        console.error("Error loading security settings:", error)
      }
    }
    loadSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/admin/settings/security", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Security settings saved successfully")
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
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Security Settings
              </h1>
              <p className="text-blue-700 mt-1 font-medium">Configure security policies and authentication</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Policy */}
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <Lock className="h-5 w-5" />
                Password Policy
              </CardTitle>
              <CardDescription className="text-blue-100">
                Configure password requirements and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minPasswordLength" className="text-base font-semibold text-gray-700">
                  Minimum Password Length
                </Label>
                <Input
                  id="minPasswordLength"
                  type="number"
                  value={formData.minPasswordLength}
                  onChange={(e) => setFormData({ ...formData, minPasswordLength: parseInt(e.target.value) || 8 })}
                  className="border-2 border-blue-200 focus:border-blue-500"
                  min={6}
                  max={32}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex-1">
                    <Label htmlFor="requireUppercase" className="text-base font-semibold text-gray-700 cursor-pointer">
                      Require Uppercase
                    </Label>
                  </div>
                  <Switch
                    id="requireUppercase"
                    checked={formData.requireUppercase}
                    onCheckedChange={(checked) => setFormData({ ...formData, requireUppercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex-1">
                    <Label htmlFor="requireLowercase" className="text-base font-semibold text-gray-700 cursor-pointer">
                      Require Lowercase
                    </Label>
                  </div>
                  <Switch
                    id="requireLowercase"
                    checked={formData.requireLowercase}
                    onCheckedChange={(checked) => setFormData({ ...formData, requireLowercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex-1">
                    <Label htmlFor="requireNumbers" className="text-base font-semibold text-gray-700 cursor-pointer">
                      Require Numbers
                    </Label>
                  </div>
                  <Switch
                    id="requireNumbers"
                    checked={formData.requireNumbers}
                    onCheckedChange={(checked) => setFormData({ ...formData, requireNumbers: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex-1">
                    <Label htmlFor="requireSpecialChars" className="text-base font-semibold text-gray-700 cursor-pointer">
                      Require Special Characters
                    </Label>
                  </div>
                  <Switch
                    id="requireSpecialChars"
                    checked={formData.requireSpecialChars}
                    onCheckedChange={(checked) => setFormData({ ...formData, requireSpecialChars: checked })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiryDays" className="text-base font-semibold text-gray-700">
                    Password Expiry (days)
                  </Label>
                  <Input
                    id="passwordExpiryDays"
                    type="number"
                    value={formData.passwordExpiryDays}
                    onChange={(e) => setFormData({ ...formData, passwordExpiryDays: parseInt(e.target.value) || 90 })}
                    className="border-2 border-blue-200 focus:border-blue-500"
                    min={30}
                    max={365}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPasswordHistory" className="text-base font-semibold text-gray-700">
                    Password History (prevent reuse)
                  </Label>
                  <Input
                    id="maxPasswordHistory"
                    type="number"
                    value={formData.maxPasswordHistory}
                    onChange={(e) => setFormData({ ...formData, maxPasswordHistory: parseInt(e.target.value) || 5 })}
                    className="border-2 border-blue-200 focus:border-blue-500"
                    min={0}
                    max={10}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex-1">
                  <Label htmlFor="preventPasswordReuse" className="text-base font-semibold text-gray-700 cursor-pointer">
                    Prevent Password Reuse
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">Users cannot reuse previous passwords</p>
                </div>
                <Switch
                  id="preventPasswordReuse"
                  checked={formData.preventPasswordReuse}
                  onCheckedChange={(checked) => setFormData({ ...formData, preventPasswordReuse: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <Key className="h-5 w-5" />
                Authentication
              </CardTitle>
              <CardDescription className="text-blue-100">
                Configure authentication methods and session management
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex-1">
                  <Label htmlFor="enable2FA" className="text-base font-semibold text-gray-700 cursor-pointer">
                    Enable Two-Factor Authentication (2FA)
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">Require 2FA for admin accounts</p>
                </div>
                <Switch
                  id="enable2FA"
                  checked={formData.enable2FA}
                  onCheckedChange={(checked) => setFormData({ ...formData, enable2FA: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex-1">
                  <Label htmlFor="requireStrongPasswords" className="text-base font-semibold text-gray-700 cursor-pointer">
                    Require Strong Passwords
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">Enforce all password policy requirements</p>
                </div>
                <Switch
                  id="requireStrongPasswords"
                  checked={formData.requireStrongPasswords}
                  onCheckedChange={(checked) => setFormData({ ...formData, requireStrongPasswords: checked })}
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

                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration" className="text-base font-semibold text-gray-700">
                    Lockout Duration (minutes)
                  </Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={formData.lockoutDuration}
                    onChange={(e) => setFormData({ ...formData, lockoutDuration: parseInt(e.target.value) || 15 })}
                    className="border-2 border-blue-200 focus:border-blue-500"
                    min={5}
                    max={60}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Security */}
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5" />
                API Security
              </CardTitle>
              <CardDescription className="text-blue-100">
                Configure API authentication and security
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex-1">
                  <Label htmlFor="enableAPIAuthentication" className="text-base font-semibold text-gray-700 cursor-pointer">
                    Require API Authentication
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">All API requests must be authenticated</p>
                </div>
                <Switch
                  id="enableAPIAuthentication"
                  checked={formData.enableAPIAuthentication}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableAPIAuthentication: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex-1">
                  <Label htmlFor="enableHTTPSOnly" className="text-base font-semibold text-gray-700 cursor-pointer">
                    HTTPS Only
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">Force HTTPS for all connections</p>
                </div>
                <Switch
                  id="enableHTTPSOnly"
                  checked={formData.enableHTTPSOnly}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableHTTPSOnly: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex-1">
                  <Label htmlFor="enableCSRFProtection" className="text-base font-semibold text-gray-700 cursor-pointer">
                    CSRF Protection
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">Enable Cross-Site Request Forgery protection</p>
                </div>
                <Switch
                  id="enableCSRFProtection"
                  checked={formData.enableCSRFProtection}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableCSRFProtection: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKeyExpiryDays" className="text-base font-semibold text-gray-700">
                  API Key Expiry (days)
                </Label>
                <Input
                  id="apiKeyExpiryDays"
                  type="number"
                  value={formData.apiKeyExpiryDays}
                  onChange={(e) => setFormData({ ...formData, apiKeyExpiryDays: parseInt(e.target.value) || 365 })}
                  className="border-2 border-blue-200 focus:border-blue-500"
                  min={30}
                  max={3650}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <Lock className="h-5 w-5" />
                Data Security
              </CardTitle>
              <CardDescription className="text-blue-100">
                Configure data encryption and protection
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex-1">
                  <Label htmlFor="enableEncryption" className="text-base font-semibold text-gray-700 cursor-pointer">
                    Enable Data Encryption
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">Encrypt sensitive data at rest</p>
                </div>
                <Switch
                  id="enableEncryption"
                  checked={formData.enableEncryption}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableEncryption: checked })}
                />
              </div>

              {formData.enableEncryption && (
                <div className="space-y-2">
                  <Label htmlFor="encryptionAlgorithm" className="text-base font-semibold text-gray-700">
                    Encryption Algorithm
                  </Label>
                  <Select
                    value={formData.encryptionAlgorithm}
                    onValueChange={(value) => setFormData({ ...formData, encryptionAlgorithm: value })}
                  >
                    <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AES-256">AES-256</SelectItem>
                      <SelectItem value="AES-128">AES-128</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex-1">
                  <Label htmlFor="enableDataBackup" className="text-base font-semibold text-gray-700 cursor-pointer">
                    Enable Data Backup
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">Automatically backup sensitive data</p>
                </div>
                <Switch
                  id="enableDataBackup"
                  checked={formData.enableDataBackup}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableDataBackup: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex-1">
                  <Label htmlFor="enableAuditLogging" className="text-base font-semibold text-gray-700 cursor-pointer">
                    Enable Audit Logging
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">Log all security-related events</p>
                </div>
                <Switch
                  id="enableAuditLogging"
                  checked={formData.enableAuditLogging}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableAuditLogging: checked })}
                />
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
              {loading ? "Saving..." : "Save Security Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
