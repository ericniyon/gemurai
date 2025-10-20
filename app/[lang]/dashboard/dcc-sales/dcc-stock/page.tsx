'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  RefreshCw,
  MapPin,
  Phone,
  User,
  Calendar,
  Search,
  Filter,
  Users,
  TrendingUp,
  Award,
  Star,
  Eye,
  MoreHorizontal,
  Package,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Clock,
  Mail,
  IdCard,
  Activity
} from 'lucide-react'
import { format } from 'date-fns'

interface DCCUser {
  id: string
  name: string
  email: string
  phone: string | null
  national_id: string | null
  gender: string | null
  district: string | null
  isActive: boolean
  createdAt: string
  userRole: {
    role: {
      name: string
  description: string
}
    assignedAt: string
    isActive: boolean
  }
  dccStocks: {
    quantity: number
    product: {
      id: string
      name: string
      description: string
      category: string
      price: number
      image: string | null
      commission: number
    }
  }[]
  sales: {
    id: string
    quantity: number
    salePrice: number
    totalRevenue: number
    profit: number
    customerName: string | null
    saleDate: string
    product: {
      name: string
  category: string
}
  }[]
  dccProfile?: {
    level: string
    rating: number
    totalSales: number
    monthlySales: number
    productsAvailable: number
    status: string
    location: string
    specialties: string[]
  }
}

export default function EmployerDCCStockPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  
  const [dccUsers, setDccUsers] = useState<DCCUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedDCC, setSelectedDCC] = useState<DCCUser | null>(null)

  useEffect(() => {
    fetchDCCUsers()
  }, [])

  const fetchDCCUsers = async () => {
    try {
      setIsLoadingUsers(true)
      
      const response = await fetch(`/api/v1/users/dcc-simple?limit=100`)
      const data = await response.json()
      
      if (data.success) {
        setDccUsers(data.data.users)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load DCC users",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching DCC users:', error)
      toast({
        title: "Error",
        description: "Failed to load DCC users",
        variant: "destructive"
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredUsers = dccUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm)
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && user.isActive) ||
                         (filterActive === 'inactive' && !user.isActive)
    
    return matchesSearch && matchesFilter
  })

  const activeUsers = dccUsers.filter(user => user.isActive).length
  const inactiveUsers = dccUsers.filter(user => !user.isActive).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Digital Community Champions</h1>
              <p className="text-slate-600">Manage and monitor your DCC network</p>
            </div>
            <div className="flex items-center space-x-4">
            <Button 
                onClick={fetchDCCUsers}
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
            </Button>
          </div>
        </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Total DCCs</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{dccUsers.length}</p>
                    <p className="text-xs text-slate-400 mt-1">All registered champions</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
              </div>
            </CardContent>
          </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Active DCCs</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{activeUsers}</p>
                    <p className="text-xs text-slate-400 mt-1">Currently active</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl">
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                  </div>
              </div>
            </CardContent>
          </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Inactive DCCs</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{inactiveUsers}</p>
                    <p className="text-xs text-slate-400 mt-1">Not currently active</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-2xl">
                    <Award className="h-8 w-8 text-orange-600" />
                  </div>
              </div>
            </CardContent>
          </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Success Rate</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{dccUsers.length > 0 ? Math.round((activeUsers / dccUsers.length) * 100) : 0}%</p>
                    <p className="text-xs text-slate-400 mt-1">Active ratio</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-2xl">
                    <Star className="h-8 w-8 text-purple-600" />
              </div>
              </div>
            </CardContent>
          </Card>
        </div>
              </div>
        </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filter Bar */}
        <Card className="mb-8 shadow-lg border-slate-200 bg-white hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, district, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <option value="all">All DCCs</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DCC Users Grid */}
        {isLoadingUsers ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="text-slate-600">Loading DCC users...</p>
                </div>
              </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-16 text-center">
              <User className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No DCC users found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white hover:-translate-y-2 overflow-hidden hover:border-blue-200">
                <CardContent className="p-0">
                  {/* User Header with Gradient */}
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg">
                            <User className="h-7 w-7" />
                                  </div>
                          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            user.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}></div>
                                  </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                            {user.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-md inline-block mt-1">
                            #{user.id.slice(-8)}
                          </p>
                                  </div>
                                </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/80 hover:shadow-md rounded-full p-2 h-8 w-8"
                      >
                        <MoreHorizontal className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                      </Button>
                              </div>
                            </div>
                  
                  {/* User Details */}
                  <div className="p-6 space-y-4">
                    {user.phone && (
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Phone className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-slate-700 font-medium">{user.phone}</span>
                          </div>
                    )}
                    
                    {user.district && (
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-slate-700">{user.district}</span>
                          </div>
                    )}
                    
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-purple-600" />
                          </div>
                      <span className="text-slate-700">{formatDate(user.createdAt)}</span>
                          </div>

                    {/* Stock Information */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="p-2 bg-orange-50 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                          </div>
                        <div className="flex-1">
                          <span className="text-slate-700 font-medium">
                            {user.dccStocks?.length || 0} Products in Stock
                          </span>
                          <div className="text-xs text-slate-500 mt-1">
                            Total Quantity: {user.dccStocks?.reduce((sum, stock) => sum + stock.quantity, 0) || 0}
                          </div>
                        </div>
                      </div>
                      
                      {/* Top Products */}
                      {user.dccStocks && user.dccStocks.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {user.dccStocks.slice(0, 2).map((stock, index) => (
                            <div key={index} className="flex items-center justify-between text-xs bg-slate-50 rounded-md px-2 py-1">
                              <span className="text-slate-600 truncate flex-1">{stock.product.name}</span>
                              <span className="text-slate-800 font-medium ml-2">{stock.quantity}</span>
                    </div>
                          ))}
                          {user.dccStocks.length > 2 && (
                            <div className="text-xs text-slate-400 text-center">
                              +{user.dccStocks.length - 2} more products
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Badge and Action */}
                  <div className="px-6 pb-6">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={user.isActive ? "default" : "secondary"}
                        className={`${
                          user.isActive 
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 px-3 py-1" 
                            : "bg-slate-100 text-slate-600 border-slate-200 px-3 py-1"
                        } font-medium text-xs rounded-full`}
                      >
                        {user.isActive ? "✓ Active" : "○ Inactive"}
                      </Badge>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full p-2 h-8 w-8 transition-all duration-200 hover:shadow-md hover:scale-105"
                            onClick={() => setSelectedDCC(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl backdrop-blur-none opacity-100 rounded-xl">
                          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl p-6 -m-6 mb-6">
                            <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                              <div className="p-2 bg-blue-500 rounded-lg">
                                <User className="h-6 w-6 text-white" />
                              </div>
                              DCC Details - {user.name}
                            </DialogTitle>
                          </DialogHeader>
                          
                          {/* DCC Detailed Information */}
                          <div className="space-y-6">
                            {/* Profile Section */}
                            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-start space-x-6">
                                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white">
                                    <User className="h-8 w-8" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{user.name}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        {user.phone && (
                                          <div className="flex items-center space-x-2 text-sm">
                                            <Phone className="h-4 w-4 text-slate-400" />
                                            <span className="text-slate-700">{user.phone}</span>
                                          </div>
                                        )}
                                        {user.district && (
                                          <div className="flex items-center space-x-2 text-sm">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            <span className="text-slate-700">{user.district}</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2 text-sm">
                                          <IdCard className="h-4 w-4 text-slate-400" />
                                          <span className="text-slate-700">ID: {user.id.slice(-8)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                          <Calendar className="h-4 w-4 text-slate-400" />
                                          <span className="text-slate-700">Joined: {formatDate(user.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                          <Activity className="h-4 w-4 text-slate-400" />
                                          <Badge 
                                            variant={user.isActive ? "default" : "secondary"}
                                            className={`${
                                              user.isActive 
                                                ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                                                : "bg-slate-100 text-slate-600 border-slate-200"
                                            } font-medium text-xs`}
                                          >
                                            {user.isActive ? "✓ Active" : "○ Inactive"}
                                          </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Stock Information */}
                            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                  <Package className="h-6 w-6 text-orange-600" />
                                  <h4 className="text-lg font-semibold text-slate-900">Stock Information</h4>
                                </div>
                                
                                {user.dccStocks && user.dccStocks.length > 0 ? (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                      <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{user.dccStocks.length}</div>
                                        <div className="text-sm text-blue-800">Total Products</div>
                                      </div>
                                      <div className="bg-emerald-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-emerald-600">
                                          {user.dccStocks.reduce((sum, stock) => sum + stock.quantity, 0)}
                                        </div>
                                        <div className="text-sm text-emerald-800">Total Quantity</div>
                                      </div>
                                      <div className="bg-purple-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                          RWF {user.dccStocks.reduce((sum, stock) => sum + (stock.product.price * stock.quantity), 0).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-purple-800">Total Value</div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {user.dccStocks.map((stock, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                          <div className="flex-1">
                                            <div className="font-medium text-slate-900">{stock.product.name}</div>
                                            <div className="text-sm text-slate-500">{stock.product.category}</div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-bold text-slate-900">{stock.quantity}</div>
                                            <div className="text-sm text-slate-500">RWF {stock.product.price.toLocaleString()}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-slate-500">
                                    <Package className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                    <p>No products in stock</p>
                      </div>
                    )}
                              </CardContent>
                            </Card>

                            {/* Sales History */}
                            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                  <ShoppingCart className="h-6 w-6 text-green-600" />
                                  <h4 className="text-lg font-semibold text-slate-900">Recent Sales</h4>
                                </div>
                                
                                {user.sales && user.sales.length > 0 ? (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                      <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{user.sales.length}</div>
                                        <div className="text-sm text-green-800">Total Sales</div>
                                      </div>
                                      <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                          RWF {user.sales.reduce((sum, sale) => sum + sale.totalRevenue, 0).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-blue-800">Total Revenue</div>
                                      </div>
                                      <div className="bg-emerald-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-emerald-600">
                                          RWF {user.sales.reduce((sum, sale) => sum + sale.profit, 0).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-emerald-800">Total Profit</div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {user.sales.slice(0, 5).map((sale, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                          <div className="flex-1">
                                            <div className="font-medium text-slate-900">{sale.product.name}</div>
                                            <div className="text-sm text-slate-500">
                                              {sale.customerName || 'Anonymous'} • {formatDate(sale.saleDate)}
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-bold text-slate-900">Qty: {sale.quantity}</div>
                                            <div className="text-sm text-green-600">RWF {sale.totalRevenue.toLocaleString()}</div>
                                          </div>
                  </div>
                ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-slate-500">
                                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                    <p>No sales recorded</p>
              </div>
            )}
          </CardContent>
        </Card>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

