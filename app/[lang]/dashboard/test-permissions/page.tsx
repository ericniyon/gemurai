"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function TestPermissionsPage() {
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
            <CardDescription>Please log in to view your permissions.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Permissions Test</h1>
        <p className="text-muted-foreground">
          This page shows your current role and permissions. The sidebar menu should change based on these values.
        </p>
        {user.role === "SUPER_ADMIN" && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-lg">🔓</span>
              <div>
                <h3 className="font-semibold text-green-800">SUPER_ADMIN Full Access</h3>
                <p className="text-sm text-green-700">
                  As a SUPER_ADMIN, you have complete access to all system features regardless of specific permissions.
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
            <CardDescription>Basic user details</CardDescription>
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
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <p className="text-sm font-mono bg-muted p-2 rounded">{user.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Permissions from your role (used for navigation)</CardDescription>
          </CardHeader>
          <CardContent>
            {user.rolePermissions && user.rolePermissions.length > 0 ? (
              <div className="space-y-2">
                {user.rolePermissions.map((permission, index) => (
                  <Badge key={index} variant="secondary" className="mr-2 mb-2">
                    {permission}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No role permissions found</p>
            )}
          </CardContent>
        </Card>

        {/* Database Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Database Permissions</CardTitle>
            <CardDescription>Permissions from database (legacy)</CardDescription>
          </CardHeader>
          <CardContent>
            {user.databasePermissions && user.databasePermissions.length > 0 ? (
              <div className="space-y-2">
                {user.databasePermissions.map((permission, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2">
                    {permission}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No database permissions found</p>
            )}
          </CardContent>
        </Card>

        {/* Combined Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Combined Permissions</CardTitle>
            <CardDescription>All permissions combined</CardDescription>
          </CardHeader>
          <CardContent>
            {user.permissions && user.permissions.length > 0 ? (
              <div className="space-y-2">
                {user.permissions.map((permission, index) => (
                  <Badge key={index} variant="default" className="mr-2 mb-2">
                    {permission}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No combined permissions found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
          <CardDescription>Instructions for testing the dynamic sidebar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Change User Role and Permissions</h4>
            <p className="text-sm text-muted-foreground">
              Go to the Super Admin panel and modify a user's role and permissions. The sidebar should update automatically.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-semibold">2. Check Console Logs</h4>
            <p className="text-sm text-muted-foreground">
              Open browser developer tools and check the console for debug information about navigation filtering.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-semibold">3. Debug Information</h4>
            <p className="text-sm text-muted-foreground">
              Look for the yellow debug box in the sidebar (development mode only) that shows your role and menu item count.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-semibold">4. Expected Behavior</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>SUPER_ADMIN:</strong> 🔓 Has FULL ACCESS to all menu items regardless of permissions</li>
              <li>• <strong>ADMIN:</strong> Should see admin-specific items but not SUPER_ADMIN only items</li>
              <li>• <strong>EMPLOYER:</strong> Should see employer-specific items like Application Review</li>
              <li>• <strong>DCC:</strong> Should see DCC-specific items like DCC Stock</li>
              <li>• <strong>CONSUMER:</strong> Should see basic items like Dashboard, Products, Learning</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 