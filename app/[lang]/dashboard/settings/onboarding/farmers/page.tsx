"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { AddFarmerForm } from "@/app/[lang]/dashboard/mcc/components/AddFarmerForm"
import { Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OnboardFarmerPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [isFormOpen, setIsFormOpen] = useState(true)

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-gray-600">
                You need appropriate permissions to onboard farmers
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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link href={`/${lang}/dashboard/settings`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Onboard Smallholder Farmer</h1>
              <p className="text-gray-600">Register a new smallholder farmer to the system</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Farmer Onboarding</CardTitle>
          <CardDescription>
            Register a new smallholder farmer. This will create a farmer profile, generate a unique farmer code,
            create a ledger account, and capture necessary information including National ID verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Required Information</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Full Name</li>
                  <li>• Phone Number</li>
                  <li>• National ID (Mandatory)</li>
                  <li>• Location Details</li>
                  <li>• Gender</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Auto-Generated</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Unique Farmer Code</li>
                  <li>• Ledger Account</li>
                  <li>• Registration Date</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farmer Form */}
      <AddFarmerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          setIsFormOpen(false)
          // Optionally redirect or show success message
        }}
      />
    </div>
  )
}
