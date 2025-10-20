import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Plus, Edit, Trash2, Eye, Briefcase, Users, Clock, CheckCircle } from "lucide-react"

export default function JobManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Job Management</h2>
          <p className="text-muted-foreground">Manage job postings and applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+12 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,456</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Placements</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+8.7% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Job Postings (89)</TabsTrigger>
          <TabsTrigger value="applications">Applications (3,456)</TabsTrigger>
          <TabsTrigger value="employers">Employers (156)</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input className="pl-10" placeholder="Search jobs..." />
          </div>
          <Select>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Job Postings</CardTitle>
              <CardDescription>Manage all job postings and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Employer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Salary Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Community Health Assistant</TableCell>
                    <TableCell>Kigali Health Center</TableCell>
                    <TableCell>Healthcare</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>45</span>
                        <Badge className="bg-green-100 text-green-800">High Interest</Badge>
                      </div>
                    </TableCell>
                    <TableCell>RWF 80,000 - 120,000</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Sales Representative</TableCell>
                    <TableCell>Rwanda Pharmacy Ltd</TableCell>
                    <TableCell>Sales</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>23</span>
                        <Badge className="bg-amber-100 text-amber-800">Medium Interest</Badge>
                      </div>
                    </TableCell>
                    <TableCell>RWF 60,000 - 90,000</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Digital Health Educator</TableCell>
                    <TableCell>Ministry of Health</TableCell>
                    <TableCell>Education</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>67</span>
                        <Badge className="bg-green-100 text-green-800">High Interest</Badge>
                      </div>
                    </TableCell>
                    <TableCell>RWF 100,000 - 150,000</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>Review and manage job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Job applications management interface will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employers">
          <Card>
            <CardHeader>
              <CardTitle>Employer Management</CardTitle>
              <CardDescription>Manage employer accounts and their job postings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Employer management interface will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Job Market Analytics</CardTitle>
              <CardDescription>Analyze job market trends and placement success</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Job market analytics dashboard will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
