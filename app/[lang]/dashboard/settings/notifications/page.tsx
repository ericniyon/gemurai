"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { Bell, Save, Mail, Smartphone } from "lucide-react"
import { SettingsPageHeader } from "@/components/settings/settings-page-header"
import { toast } from "sonner"

export default function NotificationsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Email Notifications
    emailCollectionApproved: true,
    emailCollectionRejected: true,
    emailPaymentProcessed: true,
    emailLowStockAlert: true,
    emailSystemAlert: true,
    emailWeeklyReport: false,
    emailMonthlyReport: true,

    // SMS Notifications
    smsCollectionApproved: false,
    smsPaymentProcessed: true,
    smsLowStockAlert: false,
    smsSystemAlert: true,

    // In-App Notifications
    inAppCollectionUpdates: true,
    inAppPaymentUpdates: true,
    inAppSystemUpdates: true,
    inAppQualityAlerts: true,

    // Notification Preferences
    notifyOnNewUser: true,
    notifyOnNewMCC: true,
    notifyOnNewCommodity: true,
    notifyOnFailedPayment: true,
    notifyOnSystemError: true,
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem("Gemurai_token")
        const response = await fetch("/api/v1/admin/settings/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setFormData((prev) => ({ ...prev, ...result.data }))
          }
        }
      } catch (error) {
        console.error("Error loading notification settings:", error)
      }
    }
    loadSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/admin/settings/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Notification settings saved successfully")
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

  const notificationGroups = [
    {
      title: "Email Notifications",
      icon: Mail,
      items: [
        { key: "emailCollectionApproved", label: "Collection Approved", description: "Notify when a collection is approved" },
        { key: "emailCollectionRejected", label: "Collection Rejected", description: "Notify when a collection is rejected" },
        { key: "emailPaymentProcessed", label: "Payment Processed", description: "Notify when a payment is processed" },
        { key: "emailLowStockAlert", label: "Low Stock Alert", description: "Notify when stock is low" },
        { key: "emailSystemAlert", label: "System Alerts", description: "Receive system-wide alerts" },
        { key: "emailWeeklyReport", label: "Weekly Reports", description: "Receive weekly summary reports" },
        { key: "emailMonthlyReport", label: "Monthly Reports", description: "Receive monthly summary reports" },
      ],
    },
    {
      title: "SMS Notifications",
      icon: Smartphone,
      items: [
        { key: "smsCollectionApproved", label: "Collection Approved", description: "SMS when collection is approved" },
        { key: "smsPaymentProcessed", label: "Payment Processed", description: "SMS when payment is processed" },
        { key: "smsLowStockAlert", label: "Low Stock Alert", description: "SMS for low stock alerts" },
        { key: "smsSystemAlert", label: "System Alerts", description: "SMS for critical system alerts" },
      ],
    },
    {
      title: "In-App Notifications",
      icon: Bell,
      items: [
        { key: "inAppCollectionUpdates", label: "Collection Updates", description: "Show collection status updates" },
        { key: "inAppPaymentUpdates", label: "Payment Updates", description: "Show payment status updates" },
        { key: "inAppSystemUpdates", label: "System Updates", description: "Show system update notifications" },
        { key: "inAppQualityAlerts", label: "Quality Alerts", description: "Show quality-related alerts" },
      ],
    },
    {
      title: "Admin Notifications",
      icon: Bell,
      items: [
        { key: "notifyOnNewUser", label: "New User Registration", description: "Notify when a new user registers" },
        { key: "notifyOnNewMCC", label: "New MCC Created", description: "Notify when a new MCC is created" },
        { key: "notifyOnNewCommodity", label: "New Commodity Added", description: "Notify when a new commodity is added" },
        { key: "notifyOnFailedPayment", label: "Failed Payment", description: "Notify when a payment fails" },
        { key: "notifyOnSystemError", label: "System Errors", description: "Notify on system errors" },
      ],
    },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <SettingsPageHeader
        title="Notification Settings"
        description="Configure notification preferences and channels"
        icon={Bell}
        lang={lang}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
          {notificationGroups.map((group, groupIndex) => {
            const Icon = group.icon
            return (
              <Card key={groupIndex} className="border-slate-200/80">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Icon className="h-5 w-5 text-slate-600" />
                    {group.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Configure {group.title.toLowerCase()} preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {group.items.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-all"
                    >
                      <div className="flex-1">
                        <Label htmlFor={item.key} className="text-sm font-medium text-slate-700 cursor-pointer">
                          {item.label}
                        </Label>
                        <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                      </div>
                      <Switch
                        id={item.key}
                        checked={formData[item.key as keyof typeof formData] as boolean}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, [item.key]: checked })
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Notification Settings"}
            </Button>
        </div>
      </form>
    </div>
  )
}
