"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Tv, 
  Search, 
  Plus, 
  Users, 
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
  Star,
  Activity
} from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface CanalPackage {
  id: string
  name: string
  description: string
  price: number
  channels: number
  status: 'active' | 'pending' | 'inactive'
  category: string
  features: string[]
  subscribersCount: number
  revenue: number
  rating: number
}

interface Subscription {
  id: string
  customerName: string
  customerPhone: string
  packageName: string
  amount: number
  status: 'active' | 'expired' | 'pending'
  startDate: string
  endDate: string
  autoRenew: boolean
}

export default function CanalPackagesPage() {
  const [packages, setPackages] = useState<CanalPackage[]>([])
  const [recentSubscriptions, setRecentSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const router = useRouter()

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setPackages([
        {
          id: '1',
          name: 'Basic Package',
          description: 'Essential channels for everyday viewing',
          price: 15000,
          channels: 50,
          status: 'active',
          category: 'Entertainment',
          features: ['News', 'Sports', 'Movies', 'Kids', 'Music'],
          subscribersCount: 1247,
          revenue: 18705000,
          rating: 4.2
        },
        {
          id: '2',
          name: 'Premium Package',
          description: 'Premium channels with exclusive content',
          price: 25000,
          channels: 100,
          status: 'active',
          category: 'Premium',
          features: ['Premium Movies', 'Sports HD', 'Documentaries', 'International News', 'Premium Series'],
          subscribersCount: 892,
          revenue: 22300000,
          rating: 4.5
        },
        {
          id: '3',
          name: 'Sports Package',
          description: 'Dedicated sports channels and live events',
          price: 20000,
          channels: 75,
          status: 'active',
          category: 'Sports',
          features: ['Live Sports', 'Sports News', 'Highlights', 'Analysis Shows', 'Sports Movies'],
          subscribersCount: 567,
          revenue: 11340000,
          rating: 4.3
        },
        {
          id: '4',
          name: 'Movies Package',
          description: 'Unlimited movies and series',
          price: 18000,
          channels: 60,
          status: 'pending',
          category: 'Movies',
          features: ['Latest Movies', 'Classic Films', 'TV Series', 'Movie News', 'Behind the Scenes'],
          subscribersCount: 445,
          revenue: 8010000,
          rating: 4.4
        },
        {
          id: '5',
          name: 'News Package',
          description: '24/7 news coverage from around the world',
          price: 12000,
          channels: 40,
          status: 'active',
          category: 'News',
          features: ['Local News', 'International News', 'Business News', 'Weather', 'Documentaries'],
          subscribersCount: 234,
          revenue: 2808000,
          rating: 4.1
        },
        {
          id: '6',
          name: 'Kids Package',
          description: 'Safe and educational content for children',
          price: 10000,
          channels: 30,
          status: 'active',
          category: 'Kids',
          features: ['Cartoons', 'Educational Shows', 'Kids Movies', 'Learning Programs', 'Family Shows'],
          subscribersCount: 189,
          revenue: 1890000,
          rating: 4.6
        }
      ])

      setRecentSubscriptions([
        {
          id: '1',
          customerName: 'Jean Pierre Uwimana',
          customerPhone: '+250788123456',
          packageName: 'Premium Package',
          amount: 25000,
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenew: true
        },
        {
          id: '2',
          customerName: 'Marie Claire Niyonsaba',
          customerPhone: '+250789234567',
          packageName: 'Sports Package',
          amount: 20000,
          status: 'active',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenew: false
        },
        {
          id: '3',
          customerName: 'Emmanuel Ndayisaba',
          customerPhone: '+250787345678',
          packageName: 'Basic Package',
          amount: 15000,
          status: 'expired',
          startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenew: false
        },
        {
          id: '4',
          customerName: 'Grace Uwamahoro',
          customerPhone: '+250786456789',
          packageName: 'Kids Package',
          amount: 10000,
          status: 'active',
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenew: true
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

  const getSubscriptionStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
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

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || pkg.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalRevenue = packages.reduce((sum, pkg) => sum + pkg.revenue, 0)
  const totalSubscribers = packages.reduce((sum, pkg) => sum + pkg.subscribersCount, 0)
  const averageRating = packages.reduce((sum, pkg) => sum + pkg.rating, 0) / packages.length

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <Tv className="absolute inset-0 m-auto w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600">Loading Canal+ Packages...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Canal+ Packages</h1>
                <p className="text-gray-600 mt-1">Manage TV packages and subscriptions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4" />
                Add Package
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Packages</p>
                  <p className="text-2xl font-bold text-purple-900">{packages.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Tv className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Subscribers</p>
                  <p className="text-2xl font-bold text-blue-900">{totalSubscribers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Average Rating</p>
                  <p className="text-2xl font-bold text-yellow-900">{averageRating.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-600" />
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
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {pkg.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusBadge(pkg.status)}
                      <Badge variant="outline" className="text-xs">
                        {pkg.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(pkg.price)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Channels:</span>
                    <span className="text-sm font-medium text-gray-900">{pkg.channels}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Subscribers:</span>
                    <span className="text-sm font-medium text-gray-900">{pkg.subscribersCount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="text-sm font-medium text-green-600">{formatCurrency(pkg.revenue)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rating:</span>
                    <div className="flex items-center gap-2">
                      {renderStars(pkg.rating)}
                      <span className="text-sm font-medium text-gray-900">({pkg.rating})</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-gray-700">Features:</span>
                    </div>
                    <div className="space-y-1">
                      {pkg.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                          {feature}
                        </div>
                      ))}
                      {pkg.features.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{pkg.features.length - 3} more features
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4">
                    <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
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

        {/* Recent Subscriptions */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Users className="w-5 h-5 text-purple-600" />
              Recent Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {recentSubscriptions.map((subscription) => (
                <div key={subscription.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Tv className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{subscription.customerName}</h4>
                        <p className="text-sm text-gray-600">{subscription.customerPhone}</p>
                        <p className="text-xs text-gray-500">{subscription.packageName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(subscription.amount)}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {getSubscriptionStatusBadge(subscription.status)}
                        {subscription.autoRenew && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Auto Renew</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {filteredPackages.length === 0 && (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Tv className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
              <p className="text-sm text-gray-600">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No Canal+ packages have been added yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
