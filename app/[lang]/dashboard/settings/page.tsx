"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  Settings, 
  UserPlus, 
  Users, 
  Database, 
  CheckCircle2,
  Wheat,
  ArrowRight
} from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-gray-600">
                You need appropriate permissions to access system settings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure system-wide settings and manage onboarding</p>
          </div>
        </div>
      </div>

      {/* Onboarding Section */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
          <CardDescription>
            Register new users to the HarvestPlus platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href={`/${lang}/dashboard/settings/onboarding/farmers`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Onboard Smallholder Farmer</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Register a new smallholder farmer
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/${lang}/dashboard/settings/onboarding/agents`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <UserPlus className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Onboard Agent / Abacunda</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Register a new field agent (Abacunda)
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            System-wide configuration and management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/${lang}/dashboard/admin/commodity-studio`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Wheat className="h-8 w-8 text-amber-600" />
                    <div>
                      <h3 className="font-semibold">Commodity Studio</h3>
                      <p className="text-xs text-gray-500">Configure commodities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/${lang}/dashboard/admin/input-catalog`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Database className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">Input Catalog</h3>
                      <p className="text-xs text-gray-500">Manage input catalog</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/${lang}/dashboard/admin/id-verification`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    <div>
                      <h3 className="font-semibold">ID Verification</h3>
                      <p className="text-xs text-gray-500">Verify identities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
