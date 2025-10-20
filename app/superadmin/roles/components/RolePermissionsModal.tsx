"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Shield, Check, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface Role {
  id: string
  name: string
  description: string
  isSystem: boolean
}

interface RolePermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  role: Role | null
  onPermissionsUpdated: () => void
}

export function RolePermissionsModal({
  isOpen,
  onClose,
  role,
  onPermissionsUpdated
}: RolePermissionsModalProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Load all permissions and current role permissions
  useEffect(() => {
    if (isOpen && role) {
      loadPermissions()
    }
  }, [isOpen, role])

  const loadPermissions = async () => {
    setLoading(true)
    try {
      // Load all permissions
      const permissionsResponse = await fetch('/api/v1/permissions')
      const permissionsData = await permissionsResponse.json()
      
      if (permissionsData.success) {
        setPermissions(permissionsData.permissions)
      }

      // Load current role permissions
      const rolePermissionsResponse = await fetch(`/api/v1/roles/${role?.id}/permissions`)
      const rolePermissionsData = await rolePermissionsResponse.json()
      
      if (rolePermissionsData.success) {
        setSelectedPermissions(rolePermissionsData.permissions.map((p: Permission) => p.name))
      }
    } catch (error) {
      console.error('Error loading permissions:', error)
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = (permissionName: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionName)) {
        return prev.filter(p => p !== permissionName)
      } else {
        return [...prev, permissionName]
      }
    })
  }

  const handleSave = async () => {
    if (!role) return

    setSaving(true)
    try {
      const response = await fetch(`/api/v1/roles/${role.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permissions: selectedPermissions
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Permissions updated for ${role.name}`,
        })
        onPermissionsUpdated()
        onClose()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update permissions",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating permissions:', error)
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSelectAll = (category: string) => {
    const categoryPermissions = permissions.filter(p => p.category === category)
    const categoryPermissionNames = categoryPermissions.map(p => p.name)
    
    setSelectedPermissions(prev => {
      const hasAllCategory = categoryPermissionNames.every(p => prev.includes(p))
      if (hasAllCategory) {
        // Remove all category permissions
        return prev.filter(p => !categoryPermissionNames.includes(p))
      } else {
        // Add all category permissions
        const newPermissions = [...prev]
        categoryPermissionNames.forEach(p => {
          if (!newPermissions.includes(p)) {
            newPermissions.push(p)
          }
        })
        return newPermissions
      }
    })
  }

  const handleSelectAllPermissions = () => {
    const allPermissionNames = permissions.map(p => p.name)
    setSelectedPermissions(prev => {
      if (prev.length === allPermissionNames.length) {
        return []
      } else {
        return allPermissionNames
      }
    })
  }

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const allPermissionNames = permissions.map(p => p.name)
  const allSelected = selectedPermissions.length === allPermissionNames.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-white border-0 shadow-2xl backdrop-blur-none opacity-100 rounded-xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl p-6 -m-6 mb-6">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            Manage Permissions for {role?.name}
          </DialogTitle>
          <DialogDescription>
            Select the permissions that should be assigned to this role.
            {role?.isSystem && (
              <span className="text-orange-600 font-medium">
                {" "}Note: This is a system role and cannot be modified.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading permissions...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Global Select All */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAllPermissions}
                  disabled={role?.isSystem}
                />
                <Label htmlFor="select-all" className="font-medium">
                  Select All Permissions ({selectedPermissions.length}/{allPermissionNames.length})
                </Label>
              </div>
              <Badge variant="secondary">
                {selectedPermissions.length} selected
              </Badge>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                  const categorySelected = categoryPermissions.filter(p => 
                    selectedPermissions.includes(p.name)
                  ).length
                  const allCategorySelected = categorySelected === categoryPermissions.length

                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg capitalize">
                          {category.replace('_', ' ')}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectAll(category)}
                            disabled={role?.isSystem}
                          >
                            {allCategorySelected ? (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Deselect All
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Select All
                              </>
                            )}
                          </Button>
                          <Badge variant="outline">
                            {categorySelected}/{categoryPermissions.length}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryPermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-2 p-2 rounded border hover:bg-muted/50"
                          >
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions.includes(permission.name)}
                              onCheckedChange={() => handlePermissionToggle(permission.name)}
                              disabled={role?.isSystem}
                            />
                            <Label
                              htmlFor={permission.id}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {permission.description}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || role?.isSystem}
            className="min-w-[100px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 