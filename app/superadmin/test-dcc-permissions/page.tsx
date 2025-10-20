"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { usePermissionUpdates } from "@/hooks/use-permission-updates"

export default function TestDCCPermissionsPage() {
  const { user, refreshUser } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  // Listen for permission updates
  usePermissionUpdates()

  const testDCCPermissions = async () => {
    try {
      setIsRefreshing(true)
      console.log("🧪 Testing DCC permissions update...")

      // 1. Get current DCC user permissions
      const dccResponse = await fetch("/api/v1/roles")
      const dccData = await dccResponse.json()
      const dccRole = dccData.roles?.find((r: any) => r.id === "DCC")
      
      console.log("Current DCC role:", dccRole)

      // 2. Update DCC permissions with new set
      const newPermissions = [
        'dashboard.view',
        'applications.view',
        'applications.review',
        'products.view',
        'products.create',
        'products.edit',
        'products.delete',
        'jobs.view',
        'jobs.apply',
        'stock.create',
        'sales.create',
        'sales.view',
        'stock.view',
        'finance.view',
        'finance.request',
        'learning.view',
        'learning.enroll'
      ]

      const updateResponse = await fetch("/api/v1/roles/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roleId: "DCC",
          permissions: newPermissions,
          name: "Digital Community Champion",
          description: "Updated DCC role with enhanced permissions"
        })
      })

      const updateData = await updateResponse.json()
      console.log("Update result:", updateData)

      // 3. Refresh auth context to trigger sidebar update
      await refreshUser()

      // 4. Dispatch permission update event
      window.dispatchEvent(new CustomEvent('permissionsUpdated', {
        detail: {
          timestamp: new Date().toISOString(),
          message: 'DCC permissions have been updated'
        }
      }))

      setTestResults({
        success: true,
        message: "DCC permissions updated successfully",
        data: {
          oldPermissions: dccRole?.permissions || [],
          newPermissions: newPermissions,
          updateResult: updateData
        }
      })

    } catch (error) {
      console.error("Test failed:", error)
      setTestResults({
        success: false,
        message: "Test failed",
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const resetDCCPermissions = async () => {
    try {
      setIsRefreshing(true)
      console.log("🔄 Resetting DCC permissions...")

      // Reset to original permissions
      const originalPermissions = [
        'dashboard.view',
        'applications.view',
        'applications.review',
        'products.view',
        'jobs.view',
        'jobs.apply',
        'stock.create',
        'sales.create',
        'sales.view',
        'stock.view'
      ]

      const updateResponse = await fetch("/api/v1/roles/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roleId: "DCC",
          permissions: originalPermissions,
          name: "Digital Community Champion",
          description: "Reset DCC role to original permissions"
        })
      })

      const updateData = await updateResponse.json()
      console.log("Reset result:", updateData)

      // Refresh auth context
      await refreshUser()

      // Dispatch permission update event
      window.dispatchEvent(new CustomEvent('permissionsUpdated', {
        detail: {
          timestamp: new Date().toISOString(),
          message: 'DCC permissions have been reset'
        }
      }))

      setTestResults({
        success: true,
        message: "DCC permissions reset successfully",
        data: {
          resetPermissions: originalPermissions,
          updateResult: updateData
        }
      })

    } catch (error) {
      console.error("Reset failed:", error)
      setTestResults({
        success: false,
        message: "Reset failed",
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DCC Permissions Test</h1>
          <p className="text-muted-foreground">
            Test the real-time permission update system for DCC role
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={testDCCPermissions} 
            disabled={isRefreshing}
            variant="default"
          >
            {isRefreshing ? "Testing..." : "Test DCC Update"}
          </Button>
          <Button 
            onClick={resetDCCPermissions} 
            disabled={isRefreshing}
            variant="outline"
          >
            {isRefreshing ? "Resetting..." : "Reset DCC"}
          </Button>
        </div>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
          <CardDescription>Information about the current logged-in user</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Role:</strong> <Badge>{user.role}</Badge>
                </div>
              </div>
              
              <div>
                <strong>Role Permissions:</strong> {user.rolePermissions?.length || 0}
                <div className="mt-2 flex flex-wrap gap-1">
                  {user.rolePermissions?.map((permission, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <strong>Database Permissions:</strong> {user.databasePermissions?.length || 0}
                <div className="mt-2 flex flex-wrap gap-1">
                  {user.databasePermissions?.map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <strong>Combined Permissions:</strong> {user.permissions?.length || 0}
                <div className="mt-2 flex flex-wrap gap-1">
                  {user.permissions?.map((permission, index) => (
                    <Badge key={index} variant="default" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No user logged in</p>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className={testResults.success ? "text-green-600" : "text-red-600"}>
              {testResults.success ? "✅ Test Results" : "❌ Test Failed"}
            </CardTitle>
            <CardDescription>{testResults.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
              {JSON.stringify(testResults.data, null, 2)}
            </pre>
            {testResults.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <strong>Error:</strong> {testResults.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
          <CardDescription>Steps to verify the real-time update system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">1. Current State</h4>
              <p className="text-sm text-muted-foreground">
                Check the current user permissions above. The sidebar should reflect these permissions.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">2. Update Permissions</h4>
              <p className="text-sm text-muted-foreground">
                Click "Test DCC Update" to update DCC role permissions. This will:
                - Update all DCC users in the database
                - Refresh the auth context
                - Trigger a real-time sidebar update
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">3. Verify Changes</h4>
              <p className="text-sm text-muted-foreground">
                After the update, the sidebar should immediately reflect the new permissions.
                You can also log in as a DCC user to see the changes.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">4. Reset (Optional)</h4>
              <p className="text-sm text-muted-foreground">
                Click "Reset DCC" to restore the original DCC permissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 