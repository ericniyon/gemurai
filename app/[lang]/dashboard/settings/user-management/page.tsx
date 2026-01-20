"use client"

// User Management Settings Page - Wrapper that redirects to main users page
// This maintains the Settings menu structure while using the existing users page

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function UserManagementSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  useEffect(() => {
    // Redirect to the main users page which has full CRUD functionality
    router.push(`/${lang}/dashboard/admin/users`)
  }, [router, lang])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Card className="max-w-md border-2 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 mx-auto text-blue-600 animate-spin" />
            <p className="text-blue-700 font-medium">Redirecting to User Management...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
