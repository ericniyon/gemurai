import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, FileText, BarChart3, TrendingUp, Users, DollarSign } from "lucide-react"

export default function ReportsAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">Generate insights and comprehensive reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+23.5%</div>
            <p className="text-xs text-muted-foreground">User growth this quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+18.2%</div>
            <p className="text-xs text-muted-foreground">Revenue growth this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active DCCs</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">87% engagement rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
          <TabsTrigger value="user-reports">User Reports</TabsTrigger>
          <TabsTrigger value="financial-reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="performance">Performance Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Usage Analytics</CardTitle>
                <CardDescription>User engagement and activity metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily Active Users</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">1,234</span>
                      <Badge className="bg-green-100 text-green-800">+5.2%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly Active Users</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">2,456</span>
                      <Badge className="bg-green-100 text-green-800">+8.1%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Active Users</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">2,847</span>
                      <Badge className="bg-green-100 text-green-800">+12.5%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Duration (avg)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">24 min</span>
                      <Badge className="bg-amber-100 text-amber-800">-2.3%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Revenue and sales metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Sales (Month)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">RWF 12.4M</span>
                      <Badge className="bg-green-100 text-green-800">+18.2%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Order Value</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">RWF 8,500</span>
                      <Badge className="bg-green-100 text-green-800">+3.4%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversion Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">23.5%</span>
                      <Badge className="bg-green-100 text-green-800">+1.2%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Top Performing DCCs</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">156</span>
                      <Badge className="bg-primary text-white">Level C+</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


        </TabsContent>

        <TabsContent value="user-reports">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>Generate reports about user activity and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold">Available User Reports</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      DCC Performance Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      User Engagement Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Training Completion Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Geographic Distribution Report
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Report Filters</h4>
                  <div className="space-y-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="quarter">Last Quarter</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="dccs">DCCs Only</SelectItem>
                        <SelectItem value="employers">Employers Only</SelectItem>
                        <SelectItem value="consumers">Consumers Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="w-full">Generate Report</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial-reports">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate comprehensive financial and revenue reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold">Available Financial Reports</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Revenue Analysis Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Commission Summary Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Revolving Fund Status Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Profit & Loss Statement
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Financial Reports</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Monthly Revenue Report - May 2025</span>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Commission Report - Q2 2025</span>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Fund Status Report - June 2025</span>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reports</CardTitle>
              <CardDescription>Analyze platform and user performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Performance reports interface will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
              <CardDescription>Create custom reports with specific parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Name</label>
                    <Input placeholder="Enter report name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User Analytics</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="sales">Sales Performance</SelectItem>
                        <SelectItem value="training">Training Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="quarter">Last Quarter</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full">Generate Custom Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
