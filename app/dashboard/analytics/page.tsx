"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, FileText, Clock, CheckCircle, Download, Target, Award } from "lucide-react"

export default function AnalyticsPage() {
  // Mock analytics data
  const analyticsData = {
    overview: {
      totalApplications: 156,
      approvedDCCs: 12,
      pendingReviews: 23,
      rejectionRate: 15.4,
    },
    monthlyTrends: [
      { month: "Jan", applications: 20, approved: 3, rejected: 2 },
      { month: "Feb", applications: 25, approved: 4, rejected: 3 },
      { month: "Mar", applications: 30, approved: 5, rejected: 4 },
      { month: "Apr", applications: 35, approved: 6, rejected: 5 },
      { month: "May", applications: 28, approved: 4, rejected: 3 },
      { month: "Jun", applications: 18, approved: 2, rejected: 1 },
    ],
    topPerformingDCCs: [
      { name: "Marie Claire Uwamahoro", sales: 45000, region: "Musanze" },
      { name: "Eric Nshimiyimana", sales: 38000, region: "Karongi" },
      { name: "Jean Pierre Hakizimana", sales: 32000, region: "Kigali" },
    ],
    applicationSources: [
      { source: "Direct Application", count: 89, percentage: 57 },
      { source: "Referral", count: 45, percentage: 29 },
      { source: "Social Media", count: 22, percentage: 14 },
    ],
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 text-lg mt-2">Insights into your DCC recruitment and performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="30days">
              <SelectTrigger className="w-[140px] h-10 rounded-xl">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Total Applications
            </CardTitle>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">{analyticsData.overview.totalApplications}</div>
            <p className="text-sm text-green-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Approved DCCs</CardTitle>
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">{analyticsData.overview.approvedDCCs}</div>
            <p className="text-sm text-green-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +3 this month
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Pending Reviews
            </CardTitle>
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">{analyticsData.overview.pendingReviews}</div>
            <p className="text-sm text-yellow-600 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Needs attention
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Approval Rate</CardTitle>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl">
              <Target className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {(100 - analyticsData.overview.rejectionRate).toFixed(1)}%
            </div>
            <p className="text-sm text-green-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +2.3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Application Trends */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Application Trends</CardTitle>
            <CardDescription>Monthly application and approval trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end gap-2 pt-4">
              {analyticsData.monthlyTrends.map((item, index) => {
                const maxApplications = Math.max(...analyticsData.monthlyTrends.map((d) => d.applications))
                const height = (item.applications / maxApplications) * 250

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative group">
                      <div
                        className="w-full bg-primary/20 rounded-t-md hover:bg-primary/30 transition-colors cursor-pointer"
                        style={{ height: `${height}px` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.applications} applications
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">{item.month}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing DCCs */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Top Performing DCCs</CardTitle>
            <CardDescription>Best performing Digital Community Champions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topPerformingDCCs.map((dcc, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{dcc.name}</p>
                      <p className="text-sm text-gray-500">{dcc.region}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">RWF {dcc.sales.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Sources */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Application Sources</CardTitle>
          <CardDescription>Where your applications are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {analyticsData.applicationSources.map((source, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{source.source}</h4>
                  <Badge variant="secondary">{source.percentage}%</Badge>
                </div>
                <div className="text-2xl font-bold text-primary mb-2">{source.count}</div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
