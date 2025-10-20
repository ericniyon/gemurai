"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Building, 
  Search, 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowLeft,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface IremboService {
  id: string
  name: string
  description: string
  price: number
  status: 'active' | 'pending' | 'inactive'
  category: string
  processingTime: string
  requirements: string[]
  applicationsCount: number
  revenue: number
}

export default function IremboServicesPage() {
  const [services, setServices] = useState<IremboService[]>([])
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
          name: 'National ID Application',
          description: 'Apply for a new National ID card',
          price: 15000,
          status: 'active',
          category: 'Identity Documents',
          processingTime: '5-7 business days',
          requirements: ['Birth Certificate', 'Passport Photo', 'Proof of Address'],
          applicationsCount: 245,
          revenue: 3675000
        },
        {
          id: '2',
          name: 'Passport Application',
          description: 'Apply for a new passport',
          price: 25000,
          status: 'active',
          category: 'Travel Documents',
          processingTime: '10-15 business days',
          requirements: ['National ID', 'Passport Photos', 'Travel Itinerary'],
          applicationsCount: 189,
          revenue: 4725000
        },
        {
          id: '3',
          name: 'Driving License',
          description: 'Apply for a new driving license',
          price: 20000,
          status: 'pending',
          category: 'Licenses',
          processingTime: '7-10 business days',
          requirements: ['National ID', 'Medical Certificate', 'Training Certificate'],
          applicationsCount: 156,
          revenue: 3120000
        },
        {
          id: '4',
          name: 'Birth Certificate',
          description: 'Apply for a birth certificate',
          price: 5000,
          status: 'active',
          category: 'Civil Registration',
          processingTime: '3-5 business days',
          requirements: ['Hospital Records', 'Parent IDs', 'Witness Statement'],
          applicationsCount: 312,
          revenue: 1560000
        },
        {
          id: '5',
          name: 'Marriage Certificate',
          description: 'Apply for a marriage certificate',
          price: 10000,
          status: 'active',
          category: 'Civil Registration',
          processingTime: '5-7 business days',
          requirements: ['National IDs', 'Witness Statements', 'Marriage Declaration'],
          applicationsCount: 98,
          revenue: 980000
        },
        {
          id: '6',
          name: 'Business Registration',
          description: 'Register a new business',
          price: 30000,
          status: 'active',
          category: 'Business Services',
          processingTime: '10-15 business days',
          requirements: ['Business Plan', 'Owner IDs', 'Location Details'],
          applicationsCount: 67,
          revenue: 2010000
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

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || service.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalRevenue = services.reduce((sum, service) => sum + service.revenue, 0)
  const totalApplications = services.reduce((sum, service) => sum + service.applicationsCount, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <Building className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Loading Irembo Services...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Irembo Government Services</h1>
                <p className="text-gray-600 mt-1">Manage government services and applications</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Add Service
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Services</p>
                  <p className="text-2xl font-bold text-blue-900">{services.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Applications</p>
                  <p className="text-2xl font-bold text-green-900">{totalApplications}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <FileText className="w-6 h-6 text-green-600" />
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
                  <CheckCircle className="w-6 h-6 text-orange-600" />
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
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <Badge variant="outline" className="text-xs">
                        {service.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(service.price)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Processing Time:</span>
                    <span className="text-sm font-medium text-gray-900">{service.processingTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Applications:</span>
                    <span className="text-sm font-medium text-gray-900">{service.applicationsCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="text-sm font-medium text-green-600">{formatCurrency(service.revenue)}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-gray-700">Requirements:</span>
                    </div>
                    <div className="space-y-1">
                      {service.requirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          {req}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
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

        {filteredServices.length === 0 && (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-sm text-gray-600">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No Irembo services have been added yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
