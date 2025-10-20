'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  Search, 
  RefreshCw, 
  Mail, 
  Phone, 
  MapPin,
  User,
  Calendar
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function DCCUsersList() {
  const { toast } = useToast()
  const [users, setUsers] = useState<DCCUser[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [includeProfile, setIncludeProfile] = useState(false)

  useEffect(() => {
    fetchDCCUsers()
  }, [pagination.page, pagination.limit, searchTerm, includeProfile])

  const fetchDCCUsers = async () => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        includeProfile: includeProfile.toString()
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/v1/users/dcc-simple?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data.users)
        setPagination(data.data.pagination)
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
      setIsLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page on search
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleLimitChange = (newLimit: string) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: parseInt(newLimit), 
      page: 1 
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DCC Users Management
              </h1>
              <p className="text-slate-600 text-lg">
                View and manage Digital Community Champions
              </p>
            </div>
            <Button 
              onClick={fetchDCCUsers} 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total DCC Users</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{pagination.total}</div>
            <p className="text-xs text-blue-700 mt-1">
              Active Digital Community Champions
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-slate-600" />
              Search & Filter Options
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, email, phone, national ID, or district..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
                  <SelectTrigger className="w-[120px] h-11 border-slate-300">
                    <SelectValue placeholder="Limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant={includeProfile ? "default" : "outline"}
                  onClick={() => setIncludeProfile(!includeProfile)}
                  className="h-11"
                >
                  {includeProfile ? "Hide Profile" : "Show Profile"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-600" />
              DCC Users List
            </CardTitle>
            <CardDescription className="text-slate-600">
              Showing {users.length} of {pagination.total} users
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                  <p className="text-slate-600">Loading DCC users...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">No DCC users found</h3>
                <p className="text-slate-500">Try adjusting your search criteria or check back later.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700">Name</TableHead>
                      <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                      <TableHead className="font-semibold text-slate-700">Location</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Joined</TableHead>
                      {includeProfile && (
                        <TableHead className="font-semibold text-slate-700">DCC Profile</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{user.name}</div>
                              <div className="text-sm text-slate-500">ID: {user.id.slice(-8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-700">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span className="text-slate-700">{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.district && (
                              <div className="flex items-center space-x-2 text-sm">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span className="text-slate-700">{user.district}</span>
                              </div>
                            )}
                            {user.national_id && (
                              <div className="text-xs text-slate-500">
                                ID: {user.national_id}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.isActive ? "default" : "secondary"}
                            className={user.isActive ? "bg-emerald-100 text-emerald-800 border-emerald-200" : ""}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </TableCell>
                        {includeProfile && (
                          <TableCell>
                            {user.dccProfile ? (
                              <div className="space-y-1">
                                <Badge variant="outline" className="text-xs">
                                  Level: {user.dccProfile.level || 'N/A'}
                                </Badge>
                                <div className="text-xs text-slate-500">
                                  Sales: {user.dccProfile.totalSales || 0}
                                </div>
                              </div>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                No Profile
                              </Badge>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i
                      if (pageNum > pagination.totalPages) return null
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}





