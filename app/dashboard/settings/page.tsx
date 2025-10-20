"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Bell, Shield, CreditCard, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ThemeSwitch } from "@/components/theme-switch"

export default function DCCSettings() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    }
  }

  const passwordValidation = validatePassword(passwordData.newPassword)
  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword.length > 0

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    setPasswordError("")
    setPasswordSuccess("")
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All password fields are required")
      return
    }

    if (!passwordValidation.isValid) {
      setPasswordError("Please ensure your new password meets all requirements")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirmation do not match")
      return
    }

    setPasswordLoading(true)
    setPasswordError("")
    setPasswordSuccess("")

    try {
      const response = await fetch("/api/v1/users/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPasswordSuccess("Password updated successfully!")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        toast.success("Password updated successfully!")
      } else {
        setPasswordError(data.message || "Failed to update password")
      }
    } catch (error) {
      setPasswordError("An error occurred while updating your password")
      console.error("Password update error:", error)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Reset to Defaults
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, GIF or PNG. Max size of 2MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" defaultValue="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="+250 788 123 456" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue="Kigali, Rwanda" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  defaultValue="Digital Community Champion passionate about empowering communities through technology."
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive important updates via SMS</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Job Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new job opportunities</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Training Reminders</Label>
                  <p className="text-sm text-muted-foreground">Reminders about upcoming training</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">Updates about commissions and payments</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">Promotional emails and updates</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      placeholder="Enter your current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      placeholder="Enter your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                      placeholder="Confirm your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                {passwordData.newPassword && (
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-700">Password Requirements:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li className={`flex items-center gap-2 ${passwordValidation.minLength ? "text-green-600" : ""}`}>
                        {passwordValidation.minLength ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        At least 8 characters long
                      </li>
                      <li className={`flex items-center gap-2 ${passwordValidation.hasUpperCase ? "text-green-600" : ""}`}>
                        {passwordValidation.hasUpperCase ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Contains at least one uppercase letter
                      </li>
                      <li className={`flex items-center gap-2 ${passwordValidation.hasLowerCase ? "text-green-600" : ""}`}>
                        {passwordValidation.hasLowerCase ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Contains at least one lowercase letter
                      </li>
                      <li className={`flex items-center gap-2 ${passwordValidation.hasNumbers ? "text-green-600" : ""}`}>
                        {passwordValidation.hasNumbers ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Contains at least one number
                      </li>
                      <li className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? "text-green-600" : ""}`}>
                        {passwordValidation.hasSpecialChar ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Contains at least one special character
                      </li>
                      <li className={`flex items-center gap-2 ${passwordsMatch ? "text-green-600" : ""}`}>
                        {passwordsMatch ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Passwords match
                      </li>
                    </ul>
                  </div>
                )}

                {passwordError && (
                  <Alert variant="destructive">
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                {passwordSuccess && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{passwordSuccess}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>Manage your payment methods and commission settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-money">Mobile Money Number</Label>
                <Input id="mobile-money" defaultValue="+250 788 123 456" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-account">Bank Account Number</Label>
                <Input id="bank-account" placeholder="Optional" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bnr">Bank of Kigali</SelectItem>
                    <SelectItem value="equity">Equity Bank</SelectItem>
                    <SelectItem value="gt">GT Bank</SelectItem>
                    <SelectItem value="cogebanque">Cogebanque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Commission Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Commission Rate</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Frequency</span>
                    <span className="font-medium">Monthly</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next Payment Date</span>
                    <span className="font-medium">June 30, 2025</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
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
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="africa-kigali">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="africa-kigali">Africa/Kigali (CAT)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ThemeSwitch />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-sync Data</Label>
                  <p className="text-sm text-muted-foreground">Automatically sync your data</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Offline Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable offline functionality</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
