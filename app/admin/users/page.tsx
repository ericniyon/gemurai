"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Edit, Eye, MoreHorizontal, Trash2, Search, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const getStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <Badge className="bg-green-100 text-green-800">Active</Badge>
  ) : (
    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
  )
}

const getRoleBadge = (role: string) => {
  const roleColors = {
    SUPER_ADMIN: "bg-purple-100 text-purple-800",
    ADMIN: "bg-blue-100 text-blue-800",
    DCC: "bg-green-100 text-green-800",
    EMPLOYER: "bg-orange-100 text-orange-800",
    CONSUMER: "bg-gray-100 text-gray-800",
  }

  return <Badge className={roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"}>{role}</Badge>
}

const UsersPage = () => {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "CONSUMER",
  })

  // Fetch users from database
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/users?search=${searchTerm}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchTerm])

  // Filter users by role
  const filteredUsers = users.filter((user) => {
    if (activeTab === "all") return true
    return user.role.toLowerCase() === activeTab
  })

  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "User created successfully",
        })
        setIsCreateDialogOpen(false)
        setNewUser({ name: "", email: "", password: "", role: "CONSUMER" })
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/v1/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        })
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading users...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage platform users and their roles</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">DCCs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.role === "DCC").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.isActive).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
          <TabsTrigger value="consumer">Consumers ({users.filter((u) => u.role === "CONSUMER").length})</TabsTrigger>
          <TabsTrigger value="dcc">DCCs ({users.filter((u) => u.role === "DCC").length})</TabsTrigger>
          <TabsTrigger value="employer">Employers ({users.filter((u) => u.role === "EMPLOYER").length})</TabsTrigger>
          <TabsTrigger value="admin">
            Admins ({users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No users found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter user name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSUMER">Consumer</SelectItem>
                  <SelectItem value="DCC">DCC</SelectItem>
                  <SelectItem value="EMPLOYER">Employer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select value={selectedUser.role} onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONSUMER">Consumer</SelectItem>
                    <SelectItem value="DCC">DCC</SelectItem>
                    <SelectItem value="EMPLOYER">Employer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersPage
