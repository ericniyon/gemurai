"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  BookOpen, 
  ShoppingBag, 
  FileText, 
  Settings, 
  Bell,
  BarChart3,
  UserCheck,
  Building2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Download,
  Store,
  Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import styles from "../styles/superadmin.module.scss"

export default function SuperadminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  const handleQuickAction = (path: string) => {
    router.push(path)
  }

  const handleDownloadReport = async (reportType: string) => {
    // TODO: Implement report download
    console.log(`Downloading ${reportType} report...`)
  }

  return (
    <div className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-50 max-w-[2000px] mx-auto min-h-screen">
      {/* Header Section - Mobile Optimized */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 break-words">
            Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">Welcome to your superadmin dashboard</p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Link href="/superadmin/notifications" className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 sm:h-9 px-4"
            >
              <Bell className="h-4 w-4 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-sm">Notifications</span>
            </Button>
          </Link>
          <Link href="/superadmin/settings" className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 sm:h-9 px-4"
            >
              <Settings className="h-4 w-4 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-sm">Settings</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid - Responsive Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Users</p>
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 break-words">
                  1,234
                </h3>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-full shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 md:mt-4 flex items-center text-xs sm:text-sm text-gray-500">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 sm:mr-2 shrink-0" />
              <span className="truncate">12% increase</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Applications</p>
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 break-words">
                  567
                </h3>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 rounded-full shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 md:mt-4 flex items-center text-xs sm:text-sm text-gray-500">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 sm:mr-2 shrink-0" />
              <span className="truncate">8% increase</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">DCCs</p>
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 break-words">
                  89
                </h3>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-full shrink-0">
                <Store className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 md:mt-4 flex items-center text-xs sm:text-sm text-gray-500">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 sm:mr-2 shrink-0" />
              <span className="truncate">15% increase</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Employers</p>
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 break-words">
                  45
                </h3>
              </div>
              <div className="p-2 sm:p-3 bg-orange-50 rounded-full shrink-0">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-500" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 md:mt-4 flex items-center text-xs sm:text-sm text-gray-500">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1 sm:mr-2 shrink-0" />
              <span className="truncate">5% increase</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid - Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        {/* Recent Activities */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">Recent Activities</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Latest system activities and updates</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <Link href="/superadmin/users" className="block">
                <div className="flex items-center p-2 sm:p-3 md:p-4 hover:bg-gray-50 rounded-lg transition-colors min-h-[48px] sm:min-h-[52px] md:min-h-[56px]">
                  <div className="p-1.5 sm:p-2 bg-blue-50 rounded-full mr-2 sm:mr-3 md:mr-4 shrink-0">
                    <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate">
                      New user registration
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">2 minutes ago</p>
                  </div>
                </div>
              </Link>
              <Link href="/superadmin/applications" className="block">
                <div className="flex items-center p-2 sm:p-3 md:p-4 hover:bg-gray-50 rounded-lg transition-colors min-h-[48px] sm:min-h-[52px] md:min-h-[56px]">
                  <div className="p-1.5 sm:p-2 bg-purple-50 rounded-full mr-2 sm:mr-3 md:mr-4 shrink-0">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate">
                      New application submitted
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">15 minutes ago</p>
                  </div>
                </div>
              </Link>
              <Link href="/superadmin/employers" className="block">
                <div className="flex items-center p-2 sm:p-3 md:p-4 hover:bg-gray-50 rounded-lg transition-colors min-h-[48px] sm:min-h-[52px] md:min-h-[56px]">
                  <div className="p-1.5 sm:p-2 bg-orange-50 rounded-full mr-2 sm:mr-3 md:mr-4 shrink-0">
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate">
                      New company registered
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Common management tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 pt-0">
            <div className="grid gap-2 sm:gap-3 md:gap-4">
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-gray-50 text-xs sm:text-sm md:text-base h-12 sm:h-10 md:h-11 px-3 sm:px-4" 
                onClick={() => handleQuickAction("/superadmin/users")}
              >
                <Users className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-500 shrink-0" />
                <span className="truncate">Manage Users</span>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-gray-50 text-xs sm:text-sm md:text-base h-12 sm:h-10 md:h-11 px-3 sm:px-4" 
                onClick={() => handleQuickAction("/superadmin/applications")}
              >
                <FileText className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-purple-500 shrink-0" />
                <span className="truncate">Review Applications</span>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-gray-50 text-xs sm:text-sm md:text-base h-12 sm:h-10 md:h-11 px-3 sm:px-4" 
                onClick={() => handleQuickAction("/superadmin/courses")}
              >
                <BookOpen className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
                <span className="truncate">Manage Courses</span>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-gray-50 text-xs sm:text-sm md:text-base h-12 sm:h-10 md:h-11 px-3 sm:px-4" 
                onClick={() => handleQuickAction("/superadmin/dccs")}
              >
                <Store className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-orange-500 shrink-0" />
                <span className="truncate">Manage DCCs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">System Health</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Current system status and metrics</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg min-h-[60px] sm:min-h-[70px] md:min-h-[80px]">
              <div className="flex items-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2 sm:mr-3 shrink-0" />
                <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate">Server Status</p>
              </div>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">All systems operational</p>
            </div>
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg min-h-[60px] sm:min-h-[70px] md:min-h-[80px]">
              <div className="flex items-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2 sm:mr-3 shrink-0" />
                <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate">API Health</p>
              </div>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">100% uptime</p>
            </div>
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg min-h-[60px] sm:min-h-[70px] md:min-h-[80px]">
              <div className="flex items-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2 sm:mr-3 shrink-0" />
                <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate">Database</p>
              </div>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">Connected</p>
            </div>
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg min-h-[60px] sm:min-h-[70px] md:min-h-[80px]">
              <div className="flex items-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2 sm:mr-3 shrink-0" />
                <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate">Storage</p>
              </div>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">75% available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}