"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Smartphone, 
  CreditCard, 
  Building, 
  Users, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Settings,
  BarChart3,
  FileText,
  MessageSquare,
  Phone,
  Globe,
  Wifi,
  Tv,
  Monitor,
  Database,
  Shield,
  Zap,
  ArrowRight,
  Star,
  Calendar,
  Target,
  Award
} from "lucide-react"
import { useParams } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface DigitalServiceStats {
  totalServices: number
  activeServices: number
  pendingServices: number
  totalRevenue: number
  totalTransactions: number
  successRate: number
  monthlyGrowth: number
  customerSatisfaction: number
}

interface ServiceTransaction {
  id: string
  serviceType: 'irembo' | 'mobile_money' | 'canal' | 'digital_payment'
  serviceName: string
  customerName: string
  customerPhone: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  createdAt: string
  description: string
}

export default function DigitalServicesDashboard() {
  const [stats, setStats] = useState<DigitalServiceStats>({
    totalServices: 0,
    activeServices: 0,
    pendingServices: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    successRate: 0,
    monthlyGrowth: 0,
    customerSatisfaction: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<ServiceTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  const params = useParams()

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalServices: 156,
        activeServices: 142,
        pendingServices: 14,
        totalRevenue: 2847500,
        totalTransactions: 892,
        successRate: 94.2,
        monthlyGrowth: 12.5,
        customerSatisfaction: 4.8
      })
      
      setRecentTransactions([
        {
          id: '1',
          serviceType: 'irembo',
          serviceName: 'National ID Application',
          customerName: 'Jean Pierre Uwimana',
          customerPhone: '+250788123456',
          amount: 15000,
          status: 'completed',
          createdAt: new Date().toISOString(),
          description: 'National ID application processed successfully'
        },
        {
          id: '2',
          serviceType: 'mobile_money',
          serviceName: 'MOMO Transfer',
          customerName: 'Marie Claire Niyonsaba',
          customerPhone: '+250789234567',
          amount: 50000,
          status: 'completed',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          description: 'Mobile money transfer to 0789123456'
        },
        {
          id: '3',
          serviceType: 'canal',
          serviceName: 'Canal+ Premium Package',
          customerName: 'Emmanuel Ndayisaba',
          customerPhone: '+250787345678',
          amount: 25000,
          status: 'pending',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          description: 'Canal+ premium package subscription'
        },
        {
          id: '4',
          serviceType: 'digital_payment',
          serviceName: 'Online Payment',
          customerName: 'Grace Uwamahoro',
          customerPhone: '+250786456789',
          amount: 75000,
          status: 'completed',
          createdAt: new Date(Date.now() - 10800000).toISOString(),
          description: 'Online payment for utility bills'
        }
      ])
      
      setIsLoading(false)
    }, 1000)
  }, [])

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'irembo':
        return <Building className="w-5 h-5 text-blue-600" />
      case 'mobile_money':
        return <Smartphone className="w-5 h-5 text-green-600" />
      case 'canal':
        return <Tv className="w-5 h-5 text-purple-600" />
      case 'digital_payment':
        return <CreditCard className="w-5 h-5 text-orange-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Completed</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      )
    }
    return <div className="flex gap-1">{stars}</div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <Activity className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Digital Services</h3>
            <p className="text-sm text-gray-600">Preparing your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Digital Services
                  </h1>
                  <p className="text-gray-600 mt-1 text-lg">Comprehensive digital solutions platform</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2 border-gray-300 hover:bg-gray-50">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                <Plus className="w-4 h-4" />
                New Service
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-700">Total Services</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalServices}</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600">+{stats.monthlyGrowth}% this month</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-green-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-emerald-700">Active Services</p>
                  <p className="text-3xl font-bold text-emerald-900">{stats.activeServices}</p>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-600">{((stats.activeServices / stats.totalServices) * 100).toFixed(1)}% active</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-amber-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-orange-700">Total Revenue</p>
                  <p className="text-3xl font-bold text-orange-900">{formatCurrency(stats.totalRevenue)}</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-600">+{stats.monthlyGrowth}% growth</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-violet-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-700">Success Rate</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.successRate}%</p>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-600">{stats.customerSatisfaction}/5 satisfaction</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-2xl p-2">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="irembo" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Building className="w-4 h-4 mr-2" />
              Irembo
            </TabsTrigger>
            <TabsTrigger 
              value="mobile-money" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile Money
            </TabsTrigger>
            <TabsTrigger 
              value="canal" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Tv className="w-4 h-4 mr-2" />
              Canal+
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Enhanced Recent Transactions */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Recent Transactions</CardTitle>
                      <p className="text-sm text-gray-600">Latest service activities and payments</p>
                    </div>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            {getServiceIcon(transaction.serviceType)}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                              {transaction.serviceName}
                            </h4>
                            <p className="text-sm text-gray-600">{transaction.customerName} • {transaction.customerPhone}</p>
                            <p className="text-xs text-gray-500">{transaction.description}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-lg font-bold text-gray-900">{formatCurrency(transaction.amount)}</div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(transaction.status)}
                            {getStatusBadge(transaction.status)}
                          </div>
                          <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Service Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100/50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-gray-900">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">Irembo Services</div>
                      <div className="text-sm text-gray-600">Government services</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      { name: 'National ID', status: 'active', count: 245 },
                      { name: 'Passport', status: 'active', count: 189 },
                      { name: 'Driving License', status: 'pending', count: 156 }
                    ].map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-900">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{service.count} requests</span>
                          <Badge className={service.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-100/50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-gray-900">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">Mobile Money</div>
                      <div className="text-sm text-gray-600">Financial services</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      { name: 'MOMO Transfer', status: 'active', count: 1247 },
                      { name: 'Airtime Purchase', status: 'active', count: 892 },
                      { name: 'Bill Payment', status: 'active', count: 567 }
                    ].map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl hover:from-emerald-100 hover:to-green-100 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm font-medium text-emerald-900">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{service.count} transactions</span>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Satisfaction */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-100/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Customer Satisfaction</div>
                    <div className="text-sm text-gray-600">Service quality metrics</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {renderStars(stats.customerSatisfaction)}
                      <span className="text-2xl font-bold text-gray-900">{stats.customerSatisfaction}/5</span>
                    </div>
                    <p className="text-sm text-gray-600">Based on {stats.totalTransactions} customer reviews</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">{stats.successRate}%</div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Tab Content for other tabs */}
          <TabsContent value="irembo" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Irembo Government Services</div>
                    <div className="text-sm text-gray-600">Manage government services and applications</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'National ID Application', status: 'active', price: 15000, icon: '🆔' },
                    { name: 'Passport Application', status: 'active', price: 25000, icon: '📘' },
                    { name: 'Driving License', status: 'pending', price: 20000, icon: '🚗' },
                    { name: 'Birth Certificate', status: 'active', price: 5000, icon: '👶' },
                    { name: 'Marriage Certificate', status: 'active', price: 10000, icon: '💒' },
                    { name: 'Business Registration', status: 'active', price: 30000, icon: '🏢' }
                  ].map((service, index) => (
                    <div key={index} className="group p-6 border border-gray-200 rounded-2xl hover:shadow-xl hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl">{service.icon}</div>
                        <Badge className={service.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                          {service.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">{service.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">Government service application</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(service.price)}</span>
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                          Process
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobile-money" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-100/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Mobile Money Services</div>
                    <div className="text-sm text-gray-600">Manage mobile money transactions and services</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'MOMO Transfer', status: 'active', description: 'Send money to any phone number', icon: '💸' },
                    { name: 'Airtime Purchase', status: 'active', description: 'Buy airtime for any network', icon: '📱' },
                    { name: 'Bill Payment', status: 'active', description: 'Pay utility bills and services', icon: '📄' },
                    { name: 'Cash Withdrawal', status: 'active', description: 'Withdraw money from MOMO', icon: '🏧' },
                    { name: 'International Transfer', status: 'pending', description: 'Send money internationally', icon: '🌍' },
                    { name: 'Savings Account', status: 'active', description: 'MOMO savings and investments', icon: '💰' }
                  ].map((service, index) => (
                    <div key={index} className="group p-6 border border-gray-200 rounded-2xl hover:shadow-xl hover:border-emerald-300 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl">{service.icon}</div>
                        <Badge className={service.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                          {service.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-900 transition-colors">{service.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                      <Button size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700">
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="canal" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-100/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                    <Tv className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Canal+ Packages</div>
                    <div className="text-sm text-gray-600">Manage Canal+ TV packages and subscriptions</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'Basic Package', price: 15000, channels: 50, status: 'active', icon: '📺' },
                    { name: 'Premium Package', price: 25000, channels: 100, status: 'active', icon: '⭐' },
                    { name: 'Sports Package', price: 20000, channels: 75, status: 'active', icon: '⚽' },
                    { name: 'Movies Package', price: 18000, channels: 60, status: 'pending', icon: '🎬' },
                    { name: 'News Package', price: 12000, channels: 40, status: 'active', icon: '📰' },
                    { name: 'Kids Package', price: 10000, channels: 30, status: 'active', icon: '🧸' }
                  ].map((package_, index) => (
                    <div key={index} className="group p-6 border border-gray-200 rounded-2xl hover:shadow-xl hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl">{package_.icon}</div>
                        <Badge className={package_.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                          {package_.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-900 transition-colors">{package_.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{package_.channels} channels</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(package_.price)}</span>
                        <Button size="sm" className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700">
                          Subscribe
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-100/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Digital Payments</div>
                    <div className="text-sm text-gray-600">Manage digital payment solutions and transactions</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'Online Payments', status: 'active', description: 'Process online transactions', icon: '💳' },
                    { name: 'Card Payments', status: 'active', description: 'Credit/debit card processing', icon: '🪙' },
                    { name: 'Bank Transfers', status: 'active', description: 'Direct bank transfers', icon: '🏦' },
                    { name: 'QR Code Payments', status: 'pending', description: 'QR code payment system', icon: '📱' },
                    { name: 'International Payments', status: 'active', description: 'Cross-border payments', icon: '🌐' },
                    { name: 'Refund Management', status: 'active', description: 'Handle payment refunds', icon: '↩️' }
                  ].map((service, index) => (
                    <div key={index} className="group p-6 border border-gray-200 rounded-2xl hover:shadow-xl hover:border-orange-300 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl">{service.icon}</div>
                        <Badge className={service.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                          {service.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-900 transition-colors">{service.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                      <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
                        Configure
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
