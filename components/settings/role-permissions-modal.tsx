"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("Gemurai_token") : null
  const headers: HeadersInit = { "Content-Type": "application/json" }
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }
  return headers
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

  useEffect(() => {
    if (isOpen && role) {
      loadPermissions()
    }
  }, [isOpen, role])

  const loadPermissions = async () => {
    setLoading(true)
    try {
      const [permissionsRes, rolePermsRes] = await Promise.all([
        fetch("/api/v1/permissions", { headers: getAuthHeaders() }),
        fetch(`/api/v1/roles/${role?.id}/permissions`, { headers: getAuthHeaders() })
      ])
      const permissionsData = await permissionsRes.json()
      const rolePermissionsData = await rolePermsRes.json()

      if (permissionsData.success) {
        setPermissions(permissionsData.permissions)
      }
      if (rolePermissionsData.success) {
        setSelectedPermissions(rolePermissionsData.permissions.map((p: Permission) => p.name))
      }
    } catch (error) {
      console.error("Error loading permissions:", error)
      toast({ title: "Error", description: "Failed to load permissions", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = (permissionName: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionName) ? prev.filter(p => p !== permissionName) : [...prev, permissionName]
    )
  }

  const handleSave = async () => {
    if (!role) return
    setSaving(true)
    try {
      const response = await fetch(`/api/v1/roles/${role.id}/permissions`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ permissions: selectedPermissions })
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: "Success", description: `Permissions updated for ${role.name}` })
        onPermissionsUpdated()
        onClose()
      } else {
        toast({ title: "Error", description: data.message || "Failed to update permissions", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update permissions", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleSelectAll = (category: string) => {
    const categoryPermissionNames = permissions.filter(p => p.category === category).map(p => p.name)
    setSelectedPermissions(prev => {
      const hasAll = categoryPermissionNames.every(p => prev.includes(p))
      return hasAll ? prev.filter(p => !categoryPermissionNames.includes(p)) : [...new Set([...prev, ...categoryPermissionNames])]
    })
  }

  const handleSelectAllPermissions = () => {
    const allNames = permissions.map(p => p.name)
    setSelectedPermissions(prev => (prev.length === allNames.length ? [] : allNames))
  }

  const groupedPermissions = permissions.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {} as Record<string, Permission[]>)

  const allSelected = selectedPermissions.length === permissions.length && permissions.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] bg-white border-slate-200 rounded-2xl shadow-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
            <div className="p-2.5 bg-slate-900 rounded-xl">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span>Manage Permissions for </span>
              <span className="text-indigo-600">{role?.name}</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-slate-600 mt-1.5 ml-14">
            Select the permissions that should be assigned to this role.
            {role?.isSystem && (
              <span className="text-amber-600 font-medium"> System roles cannot be modified.</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <span className="text-slate-600 font-medium">Loading permissions...</span>
          </div>
        ) : (
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAllPermissions}
                  disabled={role?.isSystem}
                  className="border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <Label htmlFor="select-all" className="font-semibold text-slate-800 cursor-pointer">
                  Select All ({selectedPermissions.length}/{permissions.length})
                </Label>
              </div>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 font-medium px-3 py-1">
                {selectedPermissions.length} selected
              </Badge>
            </div>

            <ScrollArea className="h-[380px] pr-4 -mr-2">
              <div className="space-y-6 pb-4">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                  const categorySelected = categoryPermissions.filter(p => selectedPermissions.includes(p.name)).length
                  const allCategorySelected = categorySelected === categoryPermissions.length
                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <h3 className="font-semibold text-slate-900 capitalize text-base">{category.replace(/_/g, " ")}</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectAll(category)}
                            disabled={role?.isSystem}
                            className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            {allCategorySelected ? <><X className="h-4 w-4 mr-1" />Deselect</> : <><Check className="h-4 w-4 mr-1" />Select All</>}
                          </Button>
                          <Badge variant="outline" className="border-slate-200 bg-slate-50">{categorySelected}/{categoryPermissions.length}</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryPermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
                              selectedPermissions.includes(permission.name)
                                ? "border-indigo-200 bg-indigo-50/50"
                                : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions.includes(permission.name)}
                              onCheckedChange={() => handlePermissionToggle(permission.name)}
                              disabled={role?.isSystem}
                              className="border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                            <Label htmlFor={permission.id} className="flex-1 cursor-pointer">
                              <div className="font-medium text-slate-900">{permission.name}</div>
                              <div className="text-sm text-slate-500 mt-0.5">{permission.description}</div>
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

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          <Button variant="outline" onClick={onClose} disabled={saving} className="border-slate-200 hover:bg-white">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || role?.isSystem} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
