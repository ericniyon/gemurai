"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAuthorizedNavigation } from "../config/navigation"

export default function TestSuperAdminNavigationPage() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view navigation test.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Get navigation items using the same logic as the sidebar
  const navigationItems = getAuthorizedNavigation(
    user.role, 
    user.permissions || [], 
    user.databasePermissions || [], 
    user.rolePermissions || []
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SuperAdmin Navigation Test</h1>
        <p className="text-muted-foreground">
          This page shows what navigation items are available for your role in the SuperAdmin panel.
        </p>
        {user.role === "SUPER_ADMIN" && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-lg">🔓</span>
              <div>
                <h3 className="font-semibold text-green-800">SUPER_ADMIN Full Access</h3>
                <p className="text-sm text-green-700">
                  As a SUPER_ADMIN, you should see all navigation items below.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Current user details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg">{user.name || "Not provided"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {user.role}
                </Badge>
                {user.role === "SUPER_ADMIN" && (
                  <Badge variant="default" className="bg-green-600 text-white">
                    🔓 Full Access
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role Permissions</label>
              <p className="text-sm">{user.rolePermissions?.length || 0} permissions</p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Summary</CardTitle>
            <CardDescription>Available menu items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Menu Items</label>
              <p className="text-2xl font-bold">{navigationItems.length}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Access Level</label>
              <div className="mt-1">
                {user.role === "SUPER_ADMIN" ? (
                  <Badge variant="default" className="bg-green-600 text-white">
                    🔓 Full System Access
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    Role-Based Access
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Navigation Items</CardTitle>
          <CardDescription>
            {navigationItems.length === 0 
              ? "No navigation items available for your role." 
              : `${navigationItems.length} items available`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {navigationItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No navigation items found.</p>
              <p className="text-sm mt-1">Check your role and permissions.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {navigationItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.href}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {item.requiredPermissions?.length > 0 && (
                        <div>Permissions: {item.requiredPermissions.join(", ")}</div>
                      )}
                      {item.roles?.length > 0 && (
                        <div>Roles: {item.roles.join(", ")}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Information */}
      {process.env.NODE_ENV === "development" && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Development mode details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>User Role:</strong> {user.role}
              </div>
              <div>
                <strong>Is SUPER_ADMIN:</strong> {user.role === "SUPER_ADMIN" ? "Yes" : "No"}
              </div>
              <div>
                <strong>Role Permissions:</strong> {user.rolePermissions?.length || 0}
              </div>
              <div>
                <strong>Database Permissions:</strong> {user.databasePermissions?.length || 0}
              </div>
              <div>
                <strong>Combined Permissions:</strong> {user.permissions?.length || 0}
              </div>
              <div>
                <strong>Navigation Items:</strong> {navigationItems.length}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 