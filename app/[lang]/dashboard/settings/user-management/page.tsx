"use client"

// User Management Settings Page - Redirects to main users page
// Maintains Settings menu structure while using the existing users page

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function UserManagementSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  useEffect(() => {
    router.push(`/${lang}/dashboard/admin/users`)
  }, [router, lang])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md border-slate-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 mx-auto text-slate-600 animate-spin" />
            <p className="text-slate-600 font-medium">Redirecting to User Management...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
