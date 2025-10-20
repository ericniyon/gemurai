import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, Shield, Bell, Database, Mail, Globe, Users, DollarSign } from "lucide-react"

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Settings</h2>
          <p className="text-muted-foreground">Manage platform configuration and preferences</p>
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

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Settings
              </CardTitle>
              <CardDescription>Configure general platform settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="Gemurai Platform" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-version">Platform Version</Label>
                  <Input id="platform-version" defaultValue="2.0.1" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-description">Platform Description</Label>
                <Textarea
                  id="platform-description"
                  defaultValue="E-marketplace platform for Digital Community Champions in Rwanda"
                  rows={3}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="default-language">Default Language</Label>
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
                  <Label htmlFor="default-currency">Default Currency</Label>
                  <Select defaultValue="rwf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rwf">Rwandan Franc (RWF)</SelectItem>
                      <SelectItem value="usd">US Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable maintenance mode to restrict access</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Settings
              </CardTitle>
              <CardDescription>Configure regional and localization settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Multi-language Support</Label>
                  <p className="text-sm text-muted-foreground">Enable multiple language support for users</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Registration Settings
              </CardTitle>
              <CardDescription>Configure user registration and account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve DCC registrations</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve new DCC registrations</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require phone verification</Label>
                  <p className="text-sm text-muted-foreground">Require phone number verification for new accounts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable employer self-registration</Label>
                  <p className="text-sm text-muted-foreground">Allow employers to register without admin approval</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts">Maximum login attempts</Label>
                <Input id="max-login-attempts" type="number" defaultValue="5" className="w-32" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="60" className="w-32" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>DCC Level Configuration</CardTitle>
              <CardDescription>Configure DCC levels and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Level A</h4>
                    <p className="text-sm text-muted-foreground">Entry level - Basic training required</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Min Sales: RWF 10,000</Badge>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Level B</h4>
                    <p className="text-sm text-muted-foreground">Intermediate level - Additional certifications</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Min Sales: RWF 50,000</Badge>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Level C</h4>
                    <p className="text-sm text-muted-foreground">Advanced level - Leadership training</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Min Sales: RWF 100,000</Badge>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Commission Settings
              </CardTitle>
              <CardDescription>Configure commission rates and payment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="default-commission">Default Commission Rate (%)</Label>
                  <Input id="default-commission" type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-payout">Minimum Payout Amount (RWF)</Label>
                  <Input id="min-payout" type="number" defaultValue="5000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-schedule">Payment Schedule</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-calculate commissions</Label>
                  <p className="text-sm text-muted-foreground">Automatically calculate and process commissions</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revolving Fund Settings</CardTitle>
              <CardDescription>Configure revolving fund parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max-loan-amount">Maximum Loan Amount (RWF)</Label>
                  <Input id="max-loan-amount" type="number" defaultValue="50000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input id="interest-rate" type="number" defaultValue="5" step="0.1" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="repayment-period">Default Repayment Period (months)</Label>
                  <Input id="repayment-period" type="number" defaultValue="12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grace-period">Grace Period (days)</Label>
                  <Input id="grace-period" type="number" defaultValue="7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS notifications</Label>
                  <p className="text-sm text-muted-foreground">Send SMS notifications for important updates</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push notifications</Label>
                  <p className="text-sm text-muted-foreground">Send push notifications to mobile apps</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Admin alerts</Label>
                  <p className="text-sm text-muted-foreground">Send alerts for admin actions required</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>Configure email server settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-server">SMTP Server</Label>
                  <Input id="smtp-server" defaultValue="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input id="smtp-port" type="number" defaultValue="587" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email-username">Email Username</Label>
                  <Input id="email-username" defaultValue="noreply@Gemurai.rw" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input id="from-name" defaultValue="Gemurai Platform" />
                </div>
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
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-factor authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password complexity requirements</Label>
                  <p className="text-sm text-muted-foreground">Enforce strong password requirements</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IP whitelist for admin access</Label>
                  <p className="text-sm text-muted-foreground">Restrict admin access to specific IP addresses</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-expiry">Password expiry (days)</Label>
                <Input id="password-expiry" type="number" defaultValue="90" className="w-32" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Security</CardTitle>
              <CardDescription>Configure API access and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>API rate limiting</Label>
                  <p className="text-sm text-muted-foreground">Enable rate limiting for API requests</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rate-limit">Rate limit (requests per minute)</Label>
                  <Input id="rate-limit" type="number" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-timeout">API timeout (seconds)</Label>
                  <Input id="api-timeout" type="number" defaultValue="30" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Third-party Integrations
              </CardTitle>
              <CardDescription>Configure external service integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Mobile Money Integration</h4>
                    <p className="text-sm text-muted-foreground">MTN Mobile Money, Airtel Money</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">SMS Gateway</h4>
                    <p className="text-sm text-muted-foreground">SMS notifications and OTP</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Analytics Platform</h4>
                    <p className="text-sm text-muted-foreground">Google Analytics, custom tracking</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Backup Service</h4>
                    <p className="text-sm text-muted-foreground">Automated data backup</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
