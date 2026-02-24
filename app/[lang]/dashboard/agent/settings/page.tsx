"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Bell,
  Shield,
  Smartphone,
  Moon,
  Globe,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Edit2,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { toast } from "sonner"

export default function AgentSettingsPage() {
  const { user, logout } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  const [saving, setSaving] = useState(false)
  const [notifications, setNotifications] = useState({
    collections: true,
    payments: true,
    quality: true,
    announcements: false,
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
    toast.success("Settings saved successfully")
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your profile and preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] p-6 text-white">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-white/30">
              <AvatarFallback className="bg-white/20 text-white text-2xl">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.name || "Agent"}</h2>
              <p className="text-blue-200 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-white/20 text-white">
                  {user?.role || "AGENT"}
                </Badge>
                <Badge className="bg-emerald-500/80 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Agent ID</p>
                <p className="font-medium">{(user as any)?.displayId || "AGT-001"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{(user as any)?.phone || "+250 78X XXX XXX"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Building2 className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Assigned MCC</p>
                <p className="font-medium">Umak MCC</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Collection Reminders</p>
                <p className="text-sm text-gray-500">Get notified about collection schedules</p>
              </div>
            </div>
            <Switch
              checked={notifications.collections}
              onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, collections: v }))}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">Payment Updates</p>
                <p className="text-sm text-gray-500">Receive commission payment notifications</p>
              </div>
            </div>
            <Switch
              checked={notifications.payments}
              onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, payments: v }))}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">Quality Alerts</p>
                <p className="text-sm text-gray-500">Get notified about quality test results</p>
              </div>
            </div>
            <Switch
              checked={notifications.quality}
              onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, quality: v }))}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Announcements</p>
                <p className="text-sm text-gray-500">System updates and news</p>
              </div>
            </div>
            <Switch
              checked={notifications.announcements}
              onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, announcements: v }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Language</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span>English</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Dark Mode</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span>Off</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Help Center</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Terms & Conditions</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Privacy Policy</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50"
        onClick={logout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>

      {/* App Version */}
      <p className="text-center text-xs text-gray-400">
        Gemura Agent v1.0.0
      </p>
    </div>
  )
}
