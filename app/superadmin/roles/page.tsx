"use client"

import { useState, useEffect } from "react"
import type { ComponentType } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { 
  Plus, 
  Shield, 
  Users, 
  Key, 
  Edit, 
  Trash2, 
  Eye,
  UserCheck,
  Settings,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Calendar,
  Activity,
  UserPlus,
  Lock,
  Unlock,
  X
} from "lucide-react"
import { RolePermissionsModal } from "./components/RolePermissionsModal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type RoleStatusFilter = "all" | "active" | "inactive" | "system"

interface Role {
  id: string
  name: string
  description: string
  isActive: boolean
  isSystem: boolean
  userCount: number
  permissionCount: number
  createdAt: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  isActive: boolean
}

interface UserRoleAssignment {
  id: string
  userId: string
  roleId?: string
  userName: string
  userEmail: string
  roleName: string
  assignedAt: string | null
  assignedBy: string | null
  isActive: boolean
}

export default function RoleManagementPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("roles")
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [userAssignments, setUserAssignments] = useState<UserRoleAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [roleStatusFilter, setRoleStatusFilter] = useState<RoleStatusFilter>("all")

  // Dialog states
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false)
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      // Load roles, permissions, and user assignments
      // This will be implemented with actual API calls
      await Promise.all([
        loadRoles(),
        loadPermissions(),
        loadUserAssignments()
      ])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load role management data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/v1/roles')
      const data = await response.json()
      
      if (data.success) {
        setRoles(data.roles)
      } else {
        throw new Error(data.message || 'Failed to load roles')
      }
    } catch (error) {
      console.error('Error loading roles:', error)
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive"
      })
    }
  }

  const loadPermissions = async () => {
    try {
      const response = await fetch('/api/v1/permissions')
      const data = await response.json()
      
      if (data.success) {
        setPermissions(data.permissions)
      } else {
        throw new Error(data.message || 'Failed to load permissions')
      }
    } catch (error) {
      console.error('Error loading permissions:', error)
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive"
      })
    }
  }

  const loadUserAssignments = async () => {
    try {
      const response = await fetch('/api/v1/roles/assignments', {
        credentials: 'include'
      })
      const data = await response.json()

      if (data.success) {
        setUserAssignments(data.assignments)
      } else {
        throw new Error(data.message || 'Failed to load assignments')
      }
    } catch (error) {
      console.error('Error loading assignments:', error)
      toast({
        title: "Error",
        description: "Failed to load role assignments",
        variant: "destructive"
      })
    }
  }

  const filteredRoles = roles
    .filter(role =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(role => {
      switch (roleStatusFilter) {
        case "active":
          return role.isActive
        case "inactive":
          return !role.isActive
        case "system":
          return role.isSystem
        default:
          return true
      }
    })

  const filteredPermissions = permissions.filter(permission =>
    (selectedCategory === "all" || permission.category === selectedCategory) &&
    (permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     permission.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const categories = Array.from(new Set(permissions.map(p => p.category)))

  const activeRolesCount = roles.filter(role => role.isActive).length
  const inactiveRolesCount = roles.length - activeRolesCount
  const systemRolesCount = roles.filter(role => role.isSystem).length
  const totalPermissionsCount = permissions.length
  const avgPermissionsPerRole = roles.length
    ? Math.round(
        roles.reduce((sum, role) => sum + (role.permissionCount || 0), 0) / roles.length
      )
    : 0

  const roleFilterOptions: Array<{
    label: string
    value: RoleStatusFilter
    icon: ComponentType<{ className?: string }>
    count: number
  }> = [
    { label: "All", value: "all", icon: Shield, count: roles.length },
    { label: "Active", value: "active", icon: Unlock, count: activeRolesCount },
    { label: "Inactive", value: "inactive", icon: Lock, count: inactiveRolesCount },
    { label: "System", value: "system", icon: Settings, count: systemRolesCount }
  ]

  const pageBackgroundClasses = "min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40"
  const contentWrapperClasses = "w-full px-4 sm:px-6 lg:px-10 py-10 space-y-8"
  const frostedCardClasses =
    "rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_25px_70px_rgba(15,23,42,0.08)]"
  const summaryCardClasses =
    "relative overflow-hidden rounded-2xl border border-blue-100/50 bg-white/90 px-5 py-4 shadow-lg shadow-blue-100/50 transition-all hover:-translate-y-0.5 hover:shadow-blue-200/70"

  if (isLoading) {
    return (
      <div className={pageBackgroundClasses}>
        <div className={contentWrapperClasses}>
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/60 bg-white/80 px-10 py-12 shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              <p className="text-gray-600 font-medium">Loading role management data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={pageBackgroundClasses}>
      <div className={contentWrapperClasses}>
        {/* Enhanced Header */}
        <div className={`${frostedCardClasses} px-6 py-6`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100/70 rounded-2xl shadow-inner">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="uppercase text-xs font-semibold tracking-[0.3em] text-blue-500">Access Control</p>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">Role Management</h1>
                <p className="text-gray-600 mt-2 max-w-2xl">
                  Manage system roles, fine-tune permissions, and keep assignments transparent across teams.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" className="border-gray-200 bg-white/60 hover:bg-white">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCreateRoleOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className={summaryCardClasses}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-blue-500 uppercase">Roles</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{roles.length}</p>
                <p className="text-sm text-gray-500 mt-1">{systemRolesCount} system · {activeRolesCount} active</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className={summaryCardClasses}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-emerald-500 uppercase">Permissions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalPermissionsCount}</p>
                <p className="text-sm text-gray-500 mt-1">
                  ~{avgPermissionsPerRole || 0} per role
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Key className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className={summaryCardClasses}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-purple-500 uppercase">Assignments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userAssignments.length}</p>
                <p className="text-sm text-gray-500 mt-1">across users</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-2xl">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className={summaryCardClasses}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-orange-500 uppercase">Coverage</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{categories.length}</p>
                <p className="text-sm text-gray-500 mt-1">permission categories</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-2xl">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Card className={`${frostedCardClasses} border-0`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-100/80 px-4">
              <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0">
                <TabsTrigger 
                  value="roles" 
                  className="flex items-center gap-2 py-4 px-6 text-sm font-semibold text-gray-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                >
                  <div className="p-1 bg-gray-100 rounded data-[state=active]:bg-blue-100">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Roles</span>
                  <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                    {roles.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="permissions" 
                  className="flex items-center gap-2 py-4 px-6 text-sm font-semibold text-gray-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                >
                  <div className="p-1 bg-gray-100 rounded data-[state=active]:bg-blue-100">
                    <Key className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Permissions</span>
                  <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                    {permissions.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="assignments" 
                  className="flex items-center gap-2 py-4 px-6 text-sm font-semibold text-gray-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                >
                  <div className="p-1 bg-gray-100 rounded data-[state=active]:bg-blue-100">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Assignments</span>
                  <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                    {userAssignments.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Roles Tab */}
            <TabsContent value="roles" className="p-0">
              <div className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">System Roles</h2>
                  <p className="text-gray-600 mt-1">
                    Manage roles and their associated permissions
                  </p>
                </div>
                <Button 
                  onClick={() => setIsCreateRoleOpen(true)} 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 px-6 py-3 rounded-lg font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Role
                </Button>
              </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search roles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {roleFilterOptions.map(({ label, value, icon: Icon, count }) => (
                      <Button
                        key={value}
                        type="button"
                        variant={roleStatusFilter === value ? "default" : "outline"}
                        onClick={() => setRoleStatusFilter(value)}
                        className={`h-10 rounded-full border ${
                          roleStatusFilter === value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-200 bg-white/70 text-gray-600 hover:border-blue-200"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {label}
                        <Badge
                          variant={roleStatusFilter === value ? "secondary" : "outline"}
                          className={`ml-2 ${
                            roleStatusFilter === value
                              ? "bg-white/20 text-white border-transparent"
                              : "bg-transparent text-gray-500 border-gray-200"
                          }`}
                        >
                          {count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Shield className="h-4 w-4 text-gray-600" />
                          </div>
                          Role Name
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Activity className="h-4 w-4 text-gray-600" />
                          </div>
                          Description
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                          Users
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Key className="h-4 w-4 text-gray-600" />
                          </div>
                          Permissions
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Activity className="h-4 w-4 text-gray-600" />
                          </div>
                          Status
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Calendar className="h-4 w-4 text-gray-600" />
                          </div>
                          Created
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Settings className="h-4 w-4 text-gray-600" />
                          </div>
                          Actions
                        </div>
                      </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRoles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                              <Shield className="h-12 w-12 text-gray-300" />
                            </div>
                            <div className="text-center">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Roles Found</h3>
                              <p className="text-gray-500 mb-1">No roles match your current search criteria</p>
                              {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search terms</p>}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRoles.map((role, index) => (
                        <TableRow 
                          key={role.id}
                          className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                          }`}
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                role.isSystem ? 'bg-purple-100' : 'bg-blue-100'
                              }`}>
                                <Shield className={`h-4 w-4 ${
                                  role.isSystem ? 'text-purple-600' : 'text-blue-600'
                                }`} />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-base">{role.name}</p>
                          {role.isSystem && (
                                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200 mt-1">
                                    System Role
                            </Badge>
                          )}
                              </div>
                        </div>
                      </TableCell>
                          <TableCell className="px-6 py-4">
                            <p className="text-gray-600 text-sm">{role.description}</p>
                      </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="p-1 bg-green-100 rounded">
                                <Users className="h-4 w-4 text-green-600" />
                              </div>
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          {role.userCount} users
                        </Badge>
                            </div>
                      </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="p-1 bg-orange-100 rounded">
                                <Key className="h-4 w-4 text-orange-600" />
                              </div>
                              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                          {role.permissionCount} permissions
                        </Badge>
                            </div>
                      </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className={`p-1 rounded ${
                                role.isActive ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                {role.isActive ? (
                                  <Unlock className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Lock className="h-4 w-4 text-gray-600" />
                                )}
                              </div>
                              <Badge variant={role.isActive ? "default" : "secondary"} className={
                                role.isActive 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }>
                          {role.isActive ? "Active" : "Inactive"}
                        </Badge>
                            </div>
                      </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="p-1 bg-gray-100 rounded">
                                <Calendar className="h-4 w-4 text-gray-600" />
                              </div>
                              <span className="text-sm text-gray-500 font-medium">
                        {new Date(role.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                      </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                                  className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                >
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-xl rounded-lg">
                                <DropdownMenuItem 
                            onClick={() => {
                              setSelectedRole(role)
                              setIsEditRoleOpen(true)
                            }}
                                  className="cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Eye className="mr-3 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                            onClick={() => {
                              setSelectedRole(role)
                              setIsPermissionsModalOpen(true)
                            }}
                                  className="cursor-pointer hover:bg-green-50 hover:text-green-600"
                                >
                                  <Key className="mr-3 h-4 w-4" />
                                  Manage Permissions
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                            onClick={() => {
                              setSelectedRole(role)
                              setIsEditRoleOpen(true)
                            }}
                                  className="cursor-pointer hover:bg-yellow-50 hover:text-yellow-600"
                          >
                                  <Edit className="mr-3 h-4 w-4" />
                                  Edit Role
                                </DropdownMenuItem>
                          {!role.isSystem && (
                                  <DropdownMenuItem
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                                  >
                                    <Trash2 className="mr-3 h-4 w-4" />
                                    Delete Role
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                      </TableCell>
                    </TableRow>
                      ))
                    )}
                </TableBody>
              </Table>
              </div>
            </div>
        </TabsContent>

        {/* Permissions Tab */}
          <TabsContent value="permissions" className="p-0">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">System Permissions</h2>
                <p className="text-gray-600 mt-1">
                View and manage all available permissions
                </p>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Key className="h-4 w-4 text-gray-600" />
                          </div>
                          Permission Name
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Activity className="h-4 w-4 text-gray-600" />
                          </div>
                          Description
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Settings className="h-4 w-4 text-gray-600" />
                          </div>
                          Category
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Activity className="h-4 w-4 text-gray-600" />
                          </div>
                          Status
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Settings className="h-4 w-4 text-gray-600" />
                          </div>
                          Actions
                        </div>
                      </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredPermissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                              <Key className="h-12 w-12 text-gray-300" />
                            </div>
                            <div className="text-center">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Permissions Found</h3>
                              <p className="text-gray-500 mb-1">No permissions match your current filters</p>
                              {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search criteria</p>}
                            </div>
                          </div>
                      </TableCell>
                      </TableRow>
                    ) : (
                      filteredPermissions.map((permission, index) => (
                        <TableRow 
                          key={permission.id}
                          className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                          }`}
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Key className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-base font-mono">{permission.name}</p>
                              </div>
                            </div>
                      </TableCell>
                          <TableCell className="px-6 py-4">
                            <p className="text-gray-600 text-sm">{permission.description}</p>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                          {permission.category}
                        </Badge>
                      </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className={`p-1 rounded ${
                                permission.isActive ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                {permission.isActive ? (
                                  <Unlock className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Lock className="h-4 w-4 text-gray-600" />
                                )}
                              </div>
                              <Badge variant={permission.isActive ? "default" : "secondary"} className={
                                permission.isActive 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }>
                          {permission.isActive ? "Active" : "Inactive"}
                        </Badge>
                            </div>
                      </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                            >
                              <Eye className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                      ))
                    )}
                </TableBody>
              </Table>
              </div>
            </div>
        </TabsContent>

        {/* User Assignments Tab */}
          <TabsContent value="assignments" className="p-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">User Role Assignments</h2>
                  <p className="text-gray-600 mt-1">
                    Manage which users have which roles
                  </p>
                </div>
                <Button onClick={() => setIsAssignRoleOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Role
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users or roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                          User
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-left font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Activity className="h-4 w-4 text-gray-600" />
                          </div>
                          Email
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Shield className="h-4 w-4 text-gray-600" />
                          </div>
                          Role
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <UserCheck className="h-4 w-4 text-gray-600" />
                          </div>
                          Assigned By
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Calendar className="h-4 w-4 text-gray-600" />
                          </div>
                          Assigned Date
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Activity className="h-4 w-4 text-gray-600" />
                          </div>
                          Status
                        </div>
                      </TableHead>
                      <TableHead className="h-12 px-6 text-center font-semibold text-gray-700 bg-gray-50">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-1 bg-gray-100 rounded">
                            <Settings className="h-4 w-4 text-gray-600" />
                          </div>
                          Actions
                        </div>
                      </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {userAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                              <UserCheck className="h-12 w-12 text-gray-300" />
                            </div>
                            <div className="text-center">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Found</h3>
                              <p className="text-gray-500 mb-1">No user role assignments match your current search</p>
                              {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search terms</p>}
                            </div>
                          </div>
                      </TableCell>
                      </TableRow>
                    ) : (
                      userAssignments.map((assignment, index) => (
                        <TableRow 
                          key={assignment.id}
                          className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                          }`}
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-base">{assignment.userName}</p>
                              </div>
                            </div>
                      </TableCell>
                          <TableCell className="px-6 py-4">
                            <p className="text-gray-600 text-sm">{assignment.userEmail}</p>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="p-1 bg-purple-100 rounded">
                                <Shield className="h-4 w-4 text-purple-600" />
                              </div>
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                          {assignment.roleName}
                        </Badge>
                            </div>
                      </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="p-1 bg-green-100 rounded">
                                <UserCheck className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="text-sm text-gray-600 font-medium">
                                {assignment.assignedBy || "System"}
                              </span>
                            </div>
                      </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="p-1 bg-gray-100 rounded">
                                <Calendar className="h-4 w-4 text-gray-600" />
                              </div>
                              <span className="text-sm text-gray-500 font-medium">
                                {assignment.assignedAt
                                  ? new Date(assignment.assignedAt).toLocaleDateString()
                                  : "—"}
                              </span>
                            </div>
                      </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className={`p-1 rounded ${
                                assignment.isActive ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                {assignment.isActive ? (
                                  <Unlock className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Lock className="h-4 w-4 text-gray-600" />
                                )}
                              </div>
                              <Badge variant={assignment.isActive ? "default" : "secondary"} className={
                                assignment.isActive 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }>
                          {assignment.isActive ? "Active" : "Inactive"}
                        </Badge>
                            </div>
                      </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                              >
                                <Edit className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                                className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                          >
                                <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                      ))
                    )}
                </TableBody>
              </Table>
              </div>
            </div>
        </TabsContent>
      </Tabs>
      </Card>

      {/* Create Role Dialog */}
      <CreateRoleDialog 
        open={isCreateRoleOpen} 
        onOpenChange={setIsCreateRoleOpen}
        onSuccess={() => {
          loadData()
          setIsCreateRoleOpen(false)
        }}
      />

      {/* Edit Role Dialog */}
      <EditRoleDialog 
        open={isEditRoleOpen} 
        onOpenChange={setIsEditRoleOpen}
        role={selectedRole}
        onSuccess={() => {
          loadData()
          setIsEditRoleOpen(false)
          setSelectedRole(null)
        }}
      />

      {/* Assign Role Dialog */}
      <AssignRoleDialog 
        open={isAssignRoleOpen} 
        onOpenChange={setIsAssignRoleOpen}
        onSuccess={() => {
          loadData()
          setIsAssignRoleOpen(false)
        }}
      />

      {/* Role Permissions Modal */}
      <RolePermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false)
          setSelectedRole(null)
        }}
        role={selectedRole}
        onPermissionsUpdated={() => {
          loadData()
        }}
      />
      </div>
    </div>
  )
}

// Dialog Components
function CreateRoleDialog({ open, onOpenChange, onSuccess }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Implement API call
      toast({
        title: "Success",
        description: "Role created successfully"
      })
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl backdrop-blur-none opacity-100 rounded-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl p-6 -m-6 mb-6">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            Create New Role
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Create a new role and assign permissions to it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., MODERATOR"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this role can do..."
                required
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-md p-4">
                {/* TODO: Add permission checkboxes */}
                <div className="text-gray-500 text-sm">
                  Permission selection will be implemented
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="bg-gray-50 border-t border-gray-100 rounded-b-xl p-6 -m-6 mt-6 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-6 py-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 px-6 py-2 font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditRoleDialog({ open, onOpenChange, role, onSuccess }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onSuccess: () => void
}) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  })

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: []
      })
    }
  }, [role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Implement API call
      toast({
        title: "Success",
        description: "Role updated successfully"
      })
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive"
      })
    }
  }

  if (!role) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border shadow-xl backdrop-blur-none opacity-100">
        <DialogHeader>
          <DialogTitle>Edit Role: {role.name}</DialogTitle>
          <DialogDescription>
            Modify role details and permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={role.isSystem}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Permissions ({role.permissionCount})</Label>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-md p-4">
                {/* TODO: Add permission checkboxes */}
                <div className="text-gray-500 text-sm">
                  Permission management will be implemented
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Role</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AssignRoleDialog({ open, onOpenChange, onSuccess }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    userId: "",
    roleId: ""
  })
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState("")

  // Fetch users and roles when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsersAndRoles()
    }
  }, [open])

  const fetchUsersAndRoles = async () => {
    setIsLoading(true)
    try {
      // Try superadmin endpoint first, fallback to all users endpoint
      let usersData: any = null
      
      try {
        const usersResponse = await fetch('/api/v1/superadmin/users', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        usersData = await usersResponse.json()
        console.log('Superadmin users API response:', usersData)
      } catch (error) {
        console.log('Superadmin users API failed, trying fallback...')
      }

      // If superadmin endpoint failed, try the all users endpoint
      if (!usersData || !usersData.success) {
        try {
          const fallbackResponse = await fetch('/api/v1/users/all', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          })
          usersData = await fallbackResponse.json()
          console.log('Fallback users API response:', usersData)
        } catch (error) {
          console.error('Both users APIs failed:', error)
        }
      }
      
      if (usersData && usersData.success) {
        setUsers(usersData.users)
      } else {
        console.error('Users API error:', usersData?.message || 'Unknown error')
        toast({
          title: "Error",
          description: `Failed to load users: ${usersData?.message || 'Please check your authentication'}`,
          variant: "destructive"
        })
      }

      // Fetch roles
      const rolesResponse = await fetch('/api/v1/roles', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const rolesData = await rolesResponse.json()
      
      console.log('Roles API response:', rolesData)
      
      if (rolesData.success) {
        setRoles(rolesData.roles)
      } else {
        console.error('Roles API error:', rolesData.message)
        toast({
          title: "Error",
          description: `Failed to load roles: ${rolesData.message}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching users and roles:', error)
      toast({
        title: "Error",
        description: "Failed to load users and roles",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.userId || !formData.roleId) {
      toast({
        title: "Validation Error",
        description: "Please select both a user and a role",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/v1/roles/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: formData.userId,
          roleId: formData.roleId
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to assign role')
      }

      toast({
        title: "Success",
        description: data.message || "Role assigned successfully"
      })
      
      setFormData({ userId: "", roleId: "" })
      onSuccess()
    } catch (error) {
      console.error('Error assigning role:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign role",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl backdrop-blur-none opacity-100 rounded-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl p-6 -m-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Assign Role to User</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Select a user and assign them a new role in the system.
          </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="user" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Select User
              </Label>
              
              <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                <SelectTrigger className="h-12 bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 hover:border-gray-300">
                  <SelectValue placeholder={isLoading ? "Loading users..." : "Search and select a user..."} />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-xl rounded-lg">
                  {/* Search Input inside dropdown */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10 h-9 bg-white border border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {userSearchTerm && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setUserSearchTerm("")
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {users.length > 0 ? (
                    users
                      .filter((user) => 
                        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
                      )
                      .map((user) => (
                      <SelectItem key={user.id} value={user.id} className="py-3 px-4 hover:bg-blue-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-gray-100 rounded-full">
                            <Users className="h-3 w-3 text-gray-600" />
                          </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{user.name}</div>
                        </div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="py-8 px-4 text-center text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">
                        {userSearchTerm ? `No users found matching "${userSearchTerm}"` : "No users available"}
                      </p>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="role" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                Select Role
              </Label>
              <Select value={formData.roleId} onValueChange={(value) => setFormData({ ...formData, roleId: value })}>
                <SelectTrigger className="h-12 bg-white border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg transition-all duration-200 hover:border-gray-300">
                  <SelectValue placeholder={isLoading ? "Loading roles..." : "Choose a role to assign"} />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-xl rounded-lg">
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <SelectItem key={role.id} value={role.id} className="py-3 px-4 hover:bg-purple-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-purple-100 rounded-full">
                            <Shield className="h-3 w-3 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{role.name}</div>
                            <div className="text-sm text-gray-500">{role.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="py-8 px-4 text-center text-gray-500">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No roles available</p>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="bg-gray-50 border-t border-gray-100 rounded-b-xl p-6 -m-6 mt-6 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              <Settings className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.userId || !formData.roleId}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assign Role
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}