"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle2, AlertTriangle, Info } from "lucide-react"

export default function NotificationsPage() {
  const [notifications] = useState([
    {
      id: 1,
      type: "warning",
      title: "System Update Required",
      message: "A new security patch is available for installation",
      time: "5 minutes ago",
      icon: AlertTriangle,
      color: "yellow",
      link: "/superadmin/settings#updates"
    },
    {
      id: 2,
      type: "success",
      title: "Database Backup Complete",
      message: "Latest backup was completed successfully",
      time: "1 hour ago",
      icon: CheckCircle2,
      color: "green",
      link: "/superadmin/settings#backups"
    },
    {
      id: 3,
      type: "info",
      title: "New Feature Available",
      message: "Enhanced reporting capabilities have been deployed",
      time: "2 hours ago",
      icon: Info,
      color: "blue",
      link: "/superadmin/settings#features"
    }
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            System alerts and important updates
          </p>
        </div>
        <Button variant="outline" size="sm">
          Mark all as read
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Latest system alerts and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center space-x-4 p-4 bg-${notification.color}-50 border-l-4 border-${notification.color}-500 rounded hover:bg-${notification.color}-100`}
              >
                <notification.icon className={`h-5 w-5 text-${notification.color}-500`} />
                <div className="flex-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => window.location.href = notification.link}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure your notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">System Updates</p>
                  <p className="text-sm text-muted-foreground">Receive notifications about system updates</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Security Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about security-related events</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Maintenance Updates</p>
                  <p className="text-sm text-muted-foreground">Notifications about system maintenance</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 