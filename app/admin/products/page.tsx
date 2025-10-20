import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Plus, Edit, Trash2, Eye, Package, AlertTriangle } from "lucide-react"

export default function ProductManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Product Management</h2>
          <p className="text-muted-foreground">Manage health products and inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+3 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">91% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Package className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Products (156)</TabsTrigger>
          <TabsTrigger value="preventative">Preventative Health (45)</TabsTrigger>
          <TabsTrigger value="reproductive">Reproductive Health (32)</TabsTrigger>
          <TabsTrigger value="water">Water & Sanitation (28)</TabsTrigger>
          <TabsTrigger value="services">Health Services (51)</TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input className="pl-10" placeholder="Search products..." />
          </div>
          <Select>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="sfh">ADMIN</SelectItem>
              <SelectItem value="edencare">EdenCare</SelectItem>
              <SelectItem value="babyl">Babyl</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Products</CardTitle>
              <CardDescription>Manage all health products in the marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Mosquito Net (LLIN)</TableCell>
                    <TableCell>Preventative Health</TableCell>
                    <TableCell>ADMIN</TableCell>
                    <TableCell>RWF 3,500</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>1,250</span>
                        <Badge className="bg-green-100 text-green-800">Good</Badge>
                      </div>
                    </TableCell>
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
                    <TableCell className="font-medium">Water Purification Tablets</TableCell>
                    <TableCell>Water & Sanitation</TableCell>
                    <TableCell>ADMIN</TableCell>
                    <TableCell>RWF 1,200</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>45</span>
                        <Badge className="bg-red-100 text-red-800">Low</Badge>
                      </div>
                    </TableCell>
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
                    <TableCell className="font-medium">Contraceptive Pills</TableCell>
                    <TableCell>Reproductive Health</TableCell>
                    <TableCell>ADMIN</TableCell>
                    <TableCell>RWF 2,800</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>320</span>
                        <Badge className="bg-amber-100 text-amber-800">Medium</Badge>
                      </div>
                    </TableCell>
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
                    <TableCell className="font-medium">Telehealth Consultation</TableCell>
                    <TableCell>Health Services</TableCell>
                    <TableCell>Babyl</TableCell>
                    <TableCell>RWF 5,000</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>Unlimited</span>
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                      </div>
                    </TableCell>
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

        <TabsContent value="preventative">
          <Card>
            <CardHeader>
              <CardTitle>Preventative Health Products</CardTitle>
              <CardDescription>Products focused on disease prevention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Preventative health products will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reproductive">
          <Card>
            <CardHeader>
              <CardTitle>Reproductive Health Products</CardTitle>
              <CardDescription>Family planning and reproductive health items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Reproductive health products will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="water">
          <Card>
            <CardHeader>
              <CardTitle>Water & Sanitation Products</CardTitle>
              <CardDescription>Water purification and sanitation items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Water & sanitation products will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Health Services</CardTitle>
              <CardDescription>Digital health services and consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">Health services will be displayed here</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
