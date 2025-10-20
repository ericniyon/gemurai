import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Plus, DollarSign, TrendingUp, CreditCard, AlertTriangle } from "lucide-react"

export default function FinancialManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Management</h2>
          <p className="text-muted-foreground">Manage revenue, commissions, and revolving fund</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF 12.4M</div>
            <p className="text-xs text-muted-foreground">+18.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF 1.2M</div>
            <p className="text-xs text-muted-foreground">To DCCs this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revolving Fund</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF 8.7M</div>
            <p className="text-xs text-muted-foreground">Available balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Loans</CardTitle>
            <AlertTriangle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF 2.1M</div>
            <p className="text-xs text-muted-foreground">From 156 DCCs</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="revolving-fund">Revolving Fund</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Monthly revenue by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Product Sales</span>
                    <span className="font-bold">RWF 8.2M (66%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Service Fees</span>
                    <span className="font-bold">RWF 2.8M (23%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Training Fees</span>
                    <span className="font-bold">RWF 1.1M (9%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Other</span>
                    <span className="font-bold">RWF 0.3M (2%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Monthly expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DCC Commissions</span>
                    <span className="font-bold">RWF 1.2M (45%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Platform Operations</span>
                    <span className="font-bold">RWF 0.8M (30%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Training Development</span>
                    <span className="font-bold">RWF 0.4M (15%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Administrative</span>
                    <span className="font-bold">RWF 0.3M (10%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revolving Fund Status</CardTitle>
              <CardDescription>Current status of the revolving fund program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="font-semibold">Total Fund Size</h3>
                  <p className="text-2xl font-bold text-primary">RWF 10.8M</p>
                  <p className="text-sm text-muted-foreground">Initial allocation</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="font-semibold">Disbursed</h3>
                  <p className="text-2xl font-bold text-secondary">RWF 2.1M</p>
                  <p className="text-sm text-muted-foreground">To 156 DCCs</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="font-semibold">Available</h3>
                  <p className="text-2xl font-bold text-green-600">RWF 8.7M</p>
                  <p className="text-sm text-muted-foreground">For new loans</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>All platform transactions and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input className="pl-10" placeholder="Search transactions..." />
                </div>
                <Select>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sale">Sales</SelectItem>
                    <SelectItem value="commission">Commissions</SelectItem>
                    <SelectItem value="loan">Loans</SelectItem>
                    <SelectItem value="repayment">Repayments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>DCC/User</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2025-06-02</TableCell>
                    <TableCell>
                      <Badge variant="outline">Sale</Badge>
                    </TableCell>
                    <TableCell>Marie Uwimana</TableCell>
                    <TableCell>Mosquito Net (x2)</TableCell>
                    <TableCell className="text-green-600">+RWF 7,000</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-06-02</TableCell>
                    <TableCell>
                      <Badge variant="outline">Commission</Badge>
                    </TableCell>
                    <TableCell>Marie Uwimana</TableCell>
                    <TableCell>Commission for sale</TableCell>
                    <TableCell className="text-green-600">+RWF 700</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-06-01</TableCell>
                    <TableCell>
                      <Badge variant="outline">Repayment</Badge>
                    </TableCell>
                    <TableCell>Jean Baptiste</TableCell>
                    <TableCell>Loan repayment</TableCell>
                    <TableCell className="text-blue-600">+RWF 500</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Commission Management</CardTitle>
              <CardDescription>Track and manage DCC commissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Commission management interface will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revolving-fund">
          <Card>
            <CardHeader>
              <CardTitle>Revolving Fund Management</CardTitle>
              <CardDescription>Manage loan disbursements and repayments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Revolving fund management interface will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate comprehensive financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold">Available Reports</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Monthly Revenue Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Commission Summary
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Revolving Fund Status
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      DCC Financial Performance
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button className="w-full">Generate Monthly Report</Button>
                    <Button variant="outline" className="w-full">
                      Export Transaction Data
                    </Button>
                    <Button variant="outline" className="w-full">
                      Download Financial Summary
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
