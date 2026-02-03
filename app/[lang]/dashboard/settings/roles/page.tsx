"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { SettingsPageHeader } from "@/components/settings/settings-page-header"
import { RolePermissionsModal } from "@/components/settings/role-permissions-modal"
import { Shield, Key, Search, KeyRound, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("Gemurai_token") : null
  const headers: HeadersInit = { "Content-Type": "application/json" }
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }
  return headers
}

export default function RolesAndPermissionPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [rolesRes, permsRes] = await Promise.all([
        fetch("/api/v1/roles", { headers: getAuthHeaders() }),
        fetch("/api/v1/permissions", { headers: getAuthHeaders() })
      ])
      const rolesData = await rolesRes.json()
      const permsData = await permsRes.json()

      if (rolesData.success) {
        setRoles(rolesData.roles || [])
      } else {
        toast({ title: "Error", description: rolesData.message || "Failed to load roles", variant: "destructive" })
      }
      if (permsData.success) {
        setPermissions(permsData.permissions || [])
      } else {
        toast({ title: "Error", description: permsData.message || "Failed to load permissions", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({ title: "Error", description: "Failed to load roles and permissions", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filteredRoles = roles.filter(
    r =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  )
  const filteredPermissions = permissions.filter(
    p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role)
    setPermissionsModalOpen(true)
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md border-slate-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2 text-slate-900">Access Denied</h2>
              <p className="text-slate-600">You need admin privileges to access this page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <SettingsPageHeader
          title="Roles and Permission"
          description="Manage roles and assign permissions"
          icon={Shield}
          lang={lang}
        />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-900" />
          <span className="ml-3 text-slate-600">Loading...</span>
        </div>
      </div>
    )
  }

  const activeRolesCount = roles.filter(r => r.isActive).length
  const categoriesCount = new Set(permissions.map(p => p.category)).size

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <SettingsPageHeader
        title="Roles and Permission"
        description="Manage roles and assign permissions"
        icon={Shield}
        lang={lang}
      />

      {/* Summary cards - enhanced design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-indigo-200/60 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600/80">Roles</p>
                <p className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">{roles.length}</p>
                <p className="text-sm text-slate-500 mt-1">{activeRolesCount} active</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-500/15 transition-colors">
                <Shield className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-emerald-200/60 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600/80">Permissions</p>
                <p className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">{permissions.length}</p>
                <p className="text-sm text-slate-500 mt-1">{categoriesCount} categories</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/15 transition-colors">
                <Key className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-violet-200/60 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600/80">System Roles</p>
                <p className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">{roles.filter(r => r.isSystem).length}</p>
                <p className="text-sm text-slate-500 mt-1">protected</p>
              </div>
              <div className="p-3 rounded-xl bg-violet-500/10 text-violet-600 group-hover:bg-violet-500/15 transition-colors">
                <Shield className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80 w-full sm:w-auto inline-flex h-auto">
          <TabsTrigger
            value="roles"
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/80 data-[state=active]:text-slate-900 font-medium text-slate-600 transition-all"
          >
            <Shield className="h-4 w-4 mr-2" />
            Roles
            <Badge variant="secondary" className="ml-2 bg-slate-200/80 text-slate-600 text-xs">{roles.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="permissions"
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200/80 data-[state=active]:text-slate-900 font-medium text-slate-600 transition-all"
          >
            <Key className="h-4 w-4 mr-2" />
            Permissions
            <Badge variant="secondary" className="ml-2 bg-slate-200/80 text-slate-600 text-xs">{permissions.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4 mt-0">
          <Card className="border-slate-200/80 overflow-hidden shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-6 py-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">System Roles</CardTitle>
                  <CardDescription className="text-slate-600 mt-0.5">Manage roles and assign permissions to control access</CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-lg bg-white"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200/80">
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">Role</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">Description</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6 text-center">Users</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6 text-center">Permissions</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6 text-center">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6 text-right w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 rounded-full bg-slate-100">
                              <Shield className="h-10 w-10 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-medium">No roles found</p>
                            <p className="text-sm text-slate-500">{searchTerm ? "Try adjusting your search" : "Roles will appear here"}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRoles.map((role, idx) => (
                        <TableRow
                          key={role.id}
                          className={`border-b border-slate-100 transition-colors hover:bg-indigo-50/30 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                        >
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl shrink-0 ${role.isSystem ? "bg-violet-500/10" : "bg-indigo-500/10"}`}>
                                <Shield className={`h-5 w-5 ${role.isSystem ? "text-violet-600" : "text-indigo-600"}`} />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{role.name}</p>
                                {role.isSystem && (
                                  <Badge variant="outline" className="mt-1 text-xs border-violet-200 text-violet-700 bg-violet-50">System</Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-slate-600 text-sm max-w-[240px]">{role.description || "—"}</TableCell>
                          <TableCell className="py-4 px-6 text-center">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5">
                              <Users className="h-3.5 w-3 mr-1.5 inline" />
                              {role.userCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-center">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5">
                              <KeyRound className="h-3.5 w-3 mr-1.5 inline" />
                              {role.permissionCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-center">
                            <Badge
                              variant="outline"
                              className={role.isActive ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-slate-200 text-slate-600 bg-slate-50"}
                            >
                              {role.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManagePermissions(role)}
                              className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700"
                            >
                              <Key className="h-4 w-4 mr-1.5" />
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4 mt-0">
          <Card className="border-slate-200/80 overflow-hidden shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-6 py-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">System Permissions</CardTitle>
                  <CardDescription className="text-slate-600 mt-0.5">View all available permissions grouped by category</CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-lg bg-white"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200/80">
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">Permission</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">Description</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6">Category</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 px-6 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPermissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 rounded-full bg-slate-100">
                              <Key className="h-10 w-10 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-medium">No permissions found</p>
                            <p className="text-sm text-slate-500">{searchTerm ? "Try adjusting your search" : "Permissions will appear here"}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPermissions.map((perm, idx) => (
                        <TableRow
                          key={perm.id}
                          className={`border-b border-slate-100 transition-colors hover:bg-emerald-50/30 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                        >
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-emerald-500/10 shrink-0">
                                <Key className="h-5 w-5 text-emerald-600" />
                              </div>
                              <span className="font-mono font-semibold text-slate-900">{perm.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-slate-600 text-sm max-w-[320px]">{perm.description || "—"}</TableCell>
                          <TableCell className="py-4 px-6">
                            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{perm.category}</Badge>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-center">
                            <Badge
                              variant="outline"
                              className={perm.isActive ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-slate-200 text-slate-600 bg-slate-50"}
                            >
                              {perm.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RolePermissionsModal
        isOpen={permissionsModalOpen}
        onClose={() => {
          setPermissionsModalOpen(false)
          setSelectedRole(null)
        }}
        role={selectedRole}
        onPermissionsUpdated={loadData}
      />
    </div>
  )
}
