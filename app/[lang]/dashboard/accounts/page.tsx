"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  UserPlus,
  Building2,
  Shield,
  RefreshCw,
  Download,
  Eye
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface BranchManager {
  id: string
  name: string
  email: string
  phone?: string | null
  createdAt: string
}

export default function AccountsPage() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  const [managers, setManagers] = useState<BranchManager[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [gender, setGender] = useState("")
  const [district, setDistrict] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  

  const canAccess = useMemo(() => user?.role === "EMPLOYER" || user?.role === "BRANCH_MANAGER", [user])

  const filteredManagers = useMemo(() => {
    if (!searchTerm) return managers
    return managers.filter(manager => 
      manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (manager.phone && manager.phone.includes(searchTerm))
    )
  }, [managers, searchTerm])

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !user) {
      router.push(`/${lang}/login?redirect=/${lang}/dashboard/accounts`)
      return
    }
    if (!canAccess) {
      toast({ title: "Access denied", description: "Only EMPLOYER and BRANCH_MANAGER can manage branch managers.", variant: "destructive" })
      router.push(`/${lang}/dashboard`)
      return
    }
    loadManagers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, user, canAccess, lang])

  const loadManagers = async () => {
    try {
      setLoading(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem("Gemurai_token") : null
      const res = await fetch("/api/v1/branch-managers", { 
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setManagers(data.data || [])
    } catch (error: any) {
      toast({ title: "Failed to load managers", description: error?.message || "Unknown error", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) {
      toast({ title: "Validation", description: "Name and Email are required." })
      return
    }
    try {
      setCreating(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem("Gemurai_token") : null
      if (!token) {
        toast({ title: "Authentication required", description: "Please login again.", variant: "destructive" })
        router.push(`/${lang}/login?redirect=/${lang}/dashboard/accounts`)
        return
      }
      const res = await fetch("/api/v1/branch-managers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          name, 
          email, 
          phone,
          national_id: nationalId || undefined,
          gender: gender || undefined,
          district: district || undefined,
        })
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to create")
      toast({ title: "Branch Manager created", description: `Temporary password: ${data.tempPassword}` })
      setName("")
      setEmail("")
      setPhone("")
      setNationalId("")
      setGender("")
      setDistrict("")
      loadManagers()
    } catch (error: any) {
      toast({ title: "Create failed", description: error?.message || "Unknown error", variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Loading Branch Managers</h3>
            <p className="text-sm text-gray-600">Please wait while we fetch the data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Modern Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
        <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Branch Managers
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Manage your branch manager accounts and permissions
                  </p>
        </div>
      </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="gap-2 border-gray-300 hover:bg-gray-50"
                onClick={loadManagers}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 border-gray-300 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button 
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                <UserPlus className="h-4 w-4" />
                Add Manager
              </Button>
            </div>
          </div>
            </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Managers</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {managers.length}
                  </p>
                  <p className="text-xs text-gray-500">Active branch managers</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {managers.filter(m => new Date(m.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                  </p>
                  <p className="text-xs text-gray-500">New managers added</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <UserPlus className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {managers.length}
                  </p>
                  <p className="text-xs text-gray-500">All managers active</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
            </div>
            </div>
            </CardContent>
          </Card>
            </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Create New Branch Manager
              </CardTitle>
              <CardDescription>Add a new branch manager to your organization</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={onCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Jane Doe"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="jane@example.com"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                    <Input 
                      id="phone" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="07xxxxxxxx"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationalId" className="text-sm font-medium text-gray-700">National ID</Label>
                    <Input 
                      id="nationalId" 
                      value={nationalId} 
                      onChange={(e) => setNationalId(e.target.value)} 
                      placeholder="1xxxxxxxxxxxxxxx"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender</Label>
                    <Input 
                      id="gender" 
                      value={gender} 
                      onChange={(e) => setGender(e.target.value)} 
                      placeholder="Male/Female"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-sm font-medium text-gray-700">District</Label>
                    <Input 
                      id="district" 
                      value={district} 
                      onChange={(e) => setDistrict(e.target.value)} 
                      placeholder="Kigali"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={creating}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  >
                    {creating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Manager
                      </>
                    )}
              </Button>
            </div>
          </form>
            </CardContent>
          </Card>
        )}

        {/* Managers Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Branch Managers
                </CardTitle>
                <CardDescription>Manage your branch manager accounts</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search managers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">Manager</TableHead>
                    <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                    <TableHead className="font-semibold text-gray-700">Location</TableHead>
                    <TableHead className="font-semibold text-gray-700">Created</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                          <p className="text-gray-500">Loading managers...</p>
                        </div>
                      </TableCell>
                  </TableRow>
                  ) : filteredManagers.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="h-12 w-12 text-gray-300" />
                          <div className="text-center">
                            <p className="text-gray-500 font-medium">No branch managers found</p>
                            <p className="text-sm text-gray-400">
                              {searchTerm ? "Try adjusting your search" : "Create your first branch manager"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredManagers.map((manager) => (
                      <TableRow key={manager.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold">
                                {manager.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{manager.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                Branch Manager
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span className="truncate">{manager.email}</span>
                            </div>
                            {manager.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{manager.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{manager.district || "Not specified"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(manager.createdAt).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}


