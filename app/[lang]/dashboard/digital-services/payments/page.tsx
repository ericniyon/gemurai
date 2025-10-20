"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  CreditCard, 
  Search, 
  Plus, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowLeft,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Shield,
  Activity,
  Zap
} from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface PaymentService {
  id: string
  name: string
  description: string
  type: 'card' | 'qr' | 'bank' | 'international' | 'crypto'
  status: 'active' | 'pending' | 'inactive'
  fee: number
  minAmount: number
  maxAmount: number
  transactionsCount: number
  totalVolume: number
  successRate: number
  processingTime: string
}

interface PaymentTransaction {
  id: string
  customerName: string
  customerEmail: string
  amount: number
  type: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  createdAt: string
  reference: string
  paymentMethod: string
  description: string
}

export default function DigitalPaymentsPage() {
  const [services, setServices] = useState<PaymentService[]>([])
  const [recentTransactions, setRecentTransactions] = useState<PaymentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const router = useRouter()

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setServices([
        {
          id: '1',
          name: 'Card Payment Processing',
          description: 'Accept credit and debit card payments',
          type: 'card',
          status: 'active',
          fee: 250,
          minAmount: 1000,
          maxAmount: 5000000,
          transactionsCount: 2347,
          totalVolume: 156780000,
          successRate: 98.2,
          processingTime: '2-3 minutes'
        },
        {
          id: '2',
          name: 'QR Code Payments',
          description: 'Quick payments via QR codes',
          type: 'qr',
          status: 'active',
          fee: 100,
          minAmount: 100,
          maxAmount: 1000000,
          transactionsCount: 1892,
          totalVolume: 89230000,
          successRate: 99.1,
          processingTime: 'Instant'
        },
        {
          id: '3',
          name: 'Bank Transfer',
          description: 'Direct bank transfers and wire payments',
          type: 'bank',
          status: 'active',
          fee: 500,
          minAmount: 5000,
          maxAmount: 10000000,
          transactionsCount: 567,
          totalVolume: 234500000,
          successRate: 97.5,
          processingTime: '1-2 business days'
        },
        {
          id: '4',
          name: 'International Payments',
          description: 'Cross-border payment processing',
          type: 'international',
          status: 'active',
          fee: 2000,
          minAmount: 10000,
          maxAmount: 50000000,
          transactionsCount: 234,
          totalVolume: 456700000,
          successRate: 95.8,
          processingTime: '2-5 business days'
        },
        {
          id: '5',
          name: 'Cryptocurrency Payments',
          description: 'Accept Bitcoin and other cryptocurrencies',
          type: 'crypto',
          status: 'pending',
          fee: 1000,
          minAmount: 5000,
          maxAmount: 100000000,
          transactionsCount: 45,
          totalVolume: 12340000,
          successRate: 94.2,
          processingTime: '10-30 minutes'
        },
        {
          id: '6',
          name: 'Digital Wallet Integration',
          description: 'Integration with popular digital wallets',
          type: 'qr',
          status: 'active',
          fee: 150,
          minAmount: 500,
          maxAmount: 2000000,
          transactionsCount: 892,
          totalVolume: 67890000,
          successRate: 98.7,
          processingTime: 'Instant'
        }
      ])

      setRecentTransactions([
        {
          id: '1',
          customerName: 'Jean Pierre Uwimana',
          customerEmail: 'jean.uwimana@email.com',
          amount: 75000,
          type: 'Card Payment',
          status: 'completed',
          createdAt: new Date().toISOString(),
          reference: 'PAY-2024-001',
          paymentMethod: 'Visa Card',
          description: 'Online purchase - Electronics'
        },
        {
          id: '2',
          customerName: 'Marie Claire Niyonsaba',
          customerEmail: 'marie.niyonsaba@email.com',
          amount: 25000,
          type: 'QR Payment',
          status: 'completed',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          reference: 'PAY-2024-002',
          paymentMethod: 'Mobile QR',
          description: 'Restaurant payment'
        },
        {
          id: '3',
          customerName: 'Emmanuel Ndayisaba',
          customerEmail: 'emmanuel.ndayisaba@email.com',
          amount: 150000,
          type: 'Bank Transfer',
          status: 'pending',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          reference: 'PAY-2024-003',
          paymentMethod: 'Bank Transfer',
          description: 'Business payment - Services'
        },
        {
          id: '4',
          customerName: 'Grace Uwamahoro',
          customerEmail: 'grace.uwamahoro@email.com',
          amount: 50000,
          type: 'International Payment',
          status: 'completed',
          createdAt: new Date(Date.now() - 10800000).toISOString(),
          reference: 'PAY-2024-004',
          paymentMethod: 'SWIFT Transfer',
          description: 'International remittance'
        }
      ])

      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const typeColors = {
      card: 'bg-blue-100 text-blue-800',
      qr: 'bg-green-100 text-green-800',
      bank: 'bg-purple-100 text-purple-800',
      international: 'bg-orange-100 text-orange-800',
      crypto: 'bg-yellow-100 text-yellow-800'
    }
    return <Badge className={typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>
  }

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || service.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalVolume = services.reduce((sum, service) => sum + service.totalVolume, 0)
  const totalTransactions = services.reduce((sum, service) => sum + service.transactionsCount, 0)
  const averageSuccessRate = services.reduce((sum, service) => sum + service.successRate, 0) / services.length

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            <CreditCard className="absolute inset-0 m-auto w-6 h-6 text-orange-600" />
          </div>
          <p className="text-sm text-gray-600">Loading Digital Payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Digital Payments</h1>
                <p className="text-gray-600 mt-1">Manage payment solutions and transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4" />
                New Payment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Total Services</p>
                  <p className="text-2xl font-bold text-orange-900">{services.length}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-900">{totalTransactions.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Volume</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(totalVolume)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-900">{averageSuccessRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredServices.map((service) => (
            <Card key={service.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {service.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusBadge(service.status)}
                      {getTypeBadge(service.type)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Fee:</span>
                      <p className="font-medium text-gray-900">{formatCurrency(service.fee)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Success Rate:</span>
                      <p className="font-medium text-green-600">{service.successRate}%</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Min Amount:</span>
                      <p className="font-medium text-gray-900">{formatCurrency(service.minAmount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Amount:</span>
                      <p className="font-medium text-gray-900">{formatCurrency(service.maxAmount)}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Transactions:</span>
                      <span className="text-sm font-medium text-gray-900">{service.transactionsCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Volume:</span>
                      <span className="text-sm font-medium text-green-600">{formatCurrency(service.totalVolume)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Processing:</span>
                      <span className="text-sm font-medium text-gray-900">{service.processingTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4">
                    <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Transactions */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Zap className="w-5 h-5 text-orange-600" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <CreditCard className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{transaction.customerName}</h4>
                        <p className="text-sm text-gray-600">{transaction.customerEmail}</p>
                        <p className="text-xs text-gray-500">{transaction.paymentMethod} • {transaction.reference}</p>
                        <p className="text-xs text-gray-500">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(transaction.amount)}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {getTransactionStatusBadge(transaction.status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {filteredServices.length === 0 && (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-sm text-gray-600">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No digital payment services have been added yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
