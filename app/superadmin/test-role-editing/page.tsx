"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, RotateCcw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  level: number
  userCount?: number
}

interface Permission {
  id: string
  name: string
  description: string
}

export default function TestRoleEditingPage() {
  const { toast } = useToast()
  const { user, refreshUser } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<Record<string, Permission[]>>({})
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [editedPermissions, setEditedPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [isRefreshingAuth, setIsRefreshingAuth] = useState(false)

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/v1/roles")
      const data = await response.json()
      
      if (data.success && data.roles) {
        setRoles(data.roles)
        console.log("Fetched roles:", data.roles)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch roles",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      })
    }
  }

  // Fetch available permissions from API
  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/v1/permissions")
      const data = await response.json()
      
      if (data.success && data.permissions) {
        setAvailablePermissions(data.permissions)
        console.log("Fetched permissions:", data.permissions)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch permissions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching permissions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch permissions",
        variant: "destructive",
      })
    }
  }

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true)
      await Promise.all([fetchRoles(), fetchPermissions()])
      setIsInitialLoading(false)
    }
    loadData()
  }, [])

  // Function to refresh auth context and trigger sidebar update
  const refreshAuthContext = async () => {
    try {
      setIsRefreshingAuth(true)
      console.log("🔄 Refreshing auth context...")
      
      // Refresh user data
      await refreshUser()
      
      // Dispatch custom event to notify components of permission changes
      window.dispatchEvent(new CustomEvent('permissionsUpdated', {
        detail: {
          timestamp: new Date().toISOString(),
          message: 'Permissions have been updated'
        }
      }))
      
      console.log("✅ Auth context refreshed successfully")
      
      toast({
        title: "Auth Refreshed",
        description: "User permissions and sidebar have been updated",
      })
    } catch (error) {
      console.error("❌ Error refreshing auth context:", error)
      toast({
        title: "Error",
        description: "Failed to refresh auth context",
        variant: "destructive",
      })
    } finally {
      setIsRefreshingAuth(false)
    }
  }

  const handleEditRole = async () => {
    if (!selectedRole) return

    try {
      setIsLoading(true)

      const updateData = {
        permissions: editedPermissions,
        name: selectedRole.name,
        description: selectedRole.description,
        level: selectedRole.level,
      }

      console.log("Updating role:", selectedRole.id, "with permissions:", editedPermissions)

      const response = await fetch(`/api/v1/roles/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roleId: selectedRole.id,
          ...updateData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const updateTime = new Date().toLocaleTimeString()
        setLastUpdate(updateTime)
        
        toast({
          title: "Success",
          description: data.message || "Role updated successfully",
        })
        
        console.log("Role update successful:", data)
        
        // Refresh roles from API
        await fetchRoles()
        
        // If the updated role is the current user's role, refresh auth context
        if (user && user.role === selectedRole.id) {
          console.log("🔄 Current user's role updated, refreshing auth context...")
          await refreshAuthContext()
        } else {
          // For other roles, show a message about manual refresh
          toast({
            title: "Role Updated",
            description: "To see sidebar changes, refresh the page or log out and back in",
          })
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update role",
          variant: "destructive",
        })
        console.error("Role update failed:", data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      })
      console.error("Role update error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePermission = (permissionId: string) => {
    setEditedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    )
  }

  const selectRole = (role: Role) => {
    setSelectedRole(role)
    setEditedPermissions([...role.permissions])
    console.log("Selected role:", role.id, "with permissions:", role.permissions)
  }

  const groupPermissionsByCategory = (permissions: string[]) => {
    const grouped: Record<string, string[]> = {}
    
    permissions.forEach(permission => {
      const category = permission.split('.')[0]
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(permission)
    })
    
    return grouped
  }

  const handleRefresh = async () => {
    setIsInitialLoading(true)
    await Promise.all([fetchRoles(), fetchPermissions()])
    setIsInitialLoading(false)
    toast({
      title: "Refreshed",
      description: "Roles and permissions refreshed from database",
    })
  }

  if (isInitialLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading roles and permissions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Role & Permission Editing Test</h1>
            <p className="text-muted-foreground">
              Test the dynamic role and permission editing functionality. Changes are saved to the database and affect all users with that role.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={refreshAuthContext} variant="outline" size="sm" disabled={isRefreshingAuth}>
              <RotateCcw className={`h-4 w-4 mr-2 ${isRefreshingAuth ? 'animate-spin' : ''}`} />
              {isRefreshingAuth ? "Refreshing..." : "Refresh Auth"}
            </Button>
          </div>
        </div>
        
        {lastUpdate && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">
              <strong>Last Update:</strong> {lastUpdate} - Check the console for detailed logs
            </p>
          </div>
        )}

        {/* Current User Info */}
        {user && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-sm">
              <strong>Current User:</strong> {user.name} ({user.role}) - {user.rolePermissions?.length || 0} permissions
            </p>
            <div className="mt-2 flex gap-2">
              <Button 
                onClick={refreshAuthContext} 
                variant="outline" 
                size="sm" 
                disabled={isRefreshingAuth}
              >
                <RotateCcw className={`h-4 w-4 mr-2 ${isRefreshingAuth ? 'animate-spin' : ''}`} />
                {isRefreshingAuth ? "Refreshing..." : "Refresh Auth"}
              </Button>
              <Button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('permissionsUpdated', {
                    detail: {
                      timestamp: new Date().toISOString(),
                      message: 'Manual test event triggered'
                    }
                  }))
                  toast({
                    title: "Test Event",
                    description: "Permission update event triggered manually",
                  })
                }} 
                variant="outline" 
                size="sm"
              >
                Test Event
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Roles */}
        <Card>
          <CardHeader>
            <CardTitle>Available Roles</CardTitle>
            <CardDescription>
              Click on a role to edit its permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole?.id === role.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  } ${user?.role === role.id ? "ring-2 ring-blue-200" : ""}`}
                  onClick={() => selectRole(role)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{role.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Level {role.level}</Badge>
                      {user?.role === role.id && (
                        <Badge variant="default" className="bg-blue-600">Current</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {role.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{role.permissions.length} permissions</span>
                    {role.userCount !== undefined && (
                      <>
                        <span>•</span>
                        <span>{role.userCount} users</span>
                      </>
                    )}
                  </div>
                  {role.id === "SUPER_ADMIN" && (
                    <Badge variant="destructive" className="mt-2">
                      Cannot be modified
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Editor */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedRole ? `Edit ${selectedRole.name}` : "Select a Role"}
            </CardTitle>
            <CardDescription>
              {selectedRole
                ? "Modify permissions for this role. Changes will affect all users with this role."
                : "Choose a role from the left to edit its permissions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRole ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Role Information</Label>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <p><strong>ID:</strong> {selectedRole.id}</p>
                    <p><strong>Name:</strong> {selectedRole.name}</p>
                    <p><strong>Description:</strong> {selectedRole.description}</p>
                    <p><strong>Level:</strong> {selectedRole.level}</p>
                    {selectedRole.userCount !== undefined && (
                      <p><strong>Users:</strong> {selectedRole.userCount}</p>
                    )}
                    {user?.role === selectedRole.id && (
                      <p className="text-blue-600 font-semibold">⚠️ This is your current role</p>
                    )}
                  </div>
                </div>

                {selectedRole.id === "SUPER_ADMIN" ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-800 text-sm">
                      The SUPER_ADMIN role cannot be modified as it has full system access.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Permissions</Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Select the permissions this role should have
                      </p>
                      <ScrollArea className="h-64 border rounded-md p-4">
                        {Object.keys(availablePermissions).length === 0 ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                            <span className="ml-2">Loading permissions...</span>
                          </div>
                        ) : (
                          Object.entries(availablePermissions).map(([category, permissions]) => (
                            <div key={category} className="mb-6">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium capitalize">{category}</h4>
                                <Checkbox
                                  id={`category-${category}`}
                                  checked={permissions.every(p => editedPermissions.includes(p.id))}
                                  onCheckedChange={(checked) => {
                                    const permissionIds = permissions.map(p => p.id)
                                    if (checked) {
                                      setEditedPermissions(prev => [...new Set([...prev, ...permissionIds])])
                                    } else {
                                      setEditedPermissions(prev => prev.filter(p => !permissionIds.includes(p)))
                                    }
                                  }}
                                  disabled={selectedRole.id === "SUPER_ADMIN"}
                                />
                              </div>
                              <div className="space-y-2 ml-4">
                                {permissions.map((permission) => (
                                  <div key={permission.id} className="flex items-start space-x-2">
                                    <Checkbox
                                      id={`edit-${permission.id}`}
                                      checked={editedPermissions.includes(permission.id)}
                                      onCheckedChange={() => togglePermission(permission.id)}
                                      disabled={selectedRole.id === "SUPER_ADMIN"}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                      <Label htmlFor={`edit-${permission.id}`} className="text-sm font-medium">
                                        {permission.name}
                                      </Label>
                                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </ScrollArea>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {editedPermissions.length} permissions selected
                      </div>
                      <Button 
                        onClick={handleEditRole}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>Select a role to edit its permissions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Permissions Display */}
      {selectedRole && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Current Permissions for {selectedRole.name}</CardTitle>
            <CardDescription>
              These are the permissions currently assigned to this role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(groupPermissionsByCategory(selectedRole.permissions)).map(([category, perms]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm uppercase text-muted-foreground">{category}</h4>
                  <div className="space-y-1">
                    {perms.map((perm) => (
                      <div key={perm} className="text-xs bg-muted p-2 rounded">
                        {perm}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>
            Technical details for debugging
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Selected Role:</strong> {selectedRole?.id || "None"}</p>
            <p><strong>Original Permissions:</strong> {selectedRole?.permissions.length || 0}</p>
            <p><strong>Edited Permissions:</strong> {editedPermissions.length}</p>
            <p><strong>Available Permission Categories:</strong> {Object.keys(availablePermissions).length}</p>
            <p><strong>Total Available Permissions:</strong> {Object.values(availablePermissions).flat().length}</p>
            <p><strong>Current User Role:</strong> {user?.role || "None"}</p>
            <p><strong>Current User Permissions:</strong> {user?.rolePermissions?.length || 0}</p>
            <p className="text-xs text-muted-foreground">
              Check the browser console for detailed logs of role updates and permission changes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 