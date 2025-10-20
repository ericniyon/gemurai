"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Settings, Database, Server, Code, Shield, Bell } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your system settings and configurations
        </p>
      </div>

      <Tabs defaultValue="server" className="space-y-4">
        <TabsList>
          <TabsTrigger value="server">Server</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="server" id="server" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Server Status</CardTitle>
              <CardDescription>View and manage server configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System Status</p>
                    <p className="text-sm text-muted-foreground">All systems operational</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>CPU Usage</span>
                    <span>45%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Memory Usage</span>
                    <span>60%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
                <Button>Restart Server</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" id="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Health</CardTitle>
              <CardDescription>Monitor and manage database performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Connection Status</p>
                    <p className="text-sm text-muted-foreground">Connected and healthy</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="mr-2 h-4 w-4" />
                    Run Database Backup
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    View Security Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" id="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Manage API settings and monitor performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">API Status</p>
                    <p className="text-sm text-muted-foreground">All endpoints responding</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Code className="mr-2 h-4 w-4" />
                    View API Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" id="updates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Updates</CardTitle>
              <CardDescription>Manage system updates and security patches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                  <Bell className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Security Update Available</p>
                    <p className="text-sm text-muted-foreground">Version 2.1.0</p>
                  </div>
                  <Button size="sm" className="ml-auto">Install Update</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" id="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup Management</CardTitle>
              <CardDescription>Configure and manage system backups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Latest Backup</p>
                    <p className="text-sm text-muted-foreground">Today at 12:00 PM</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                <Button className="w-full">Create New Backup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" id="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Management</CardTitle>
              <CardDescription>Control system features and capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <Bell className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Enhanced Reporting</p>
                    <p className="text-sm text-muted-foreground">New feature deployed successfully</p>
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