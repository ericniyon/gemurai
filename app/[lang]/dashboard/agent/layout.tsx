"use client"

import { ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface AgentLayoutProps {
  children: ReactNode
}

/**
 * Agent layout uses the same chrome as the rest of the dashboard (sidebar + top bar),
 * like pre-collection. Only enforces agent access and renders children.
 */
export default function AgentLayout({ children }: AgentLayoutProps) {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const lang = (params?.lang as string) || "en"

  const isAgent =
    user &&
    (user.role === "AGENT" ||
      user.role === "MCC_MANAGER" ||
      user.role === "ADMIN" ||
      user.role === "SUPER_ADMIN")

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-400" />
      </div>
    )
  }

  if (!isAgent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access denied</h2>
          <p className="text-slate-600 mb-6">
            You need an Agent or authorised role to access this area.
          </p>
          <Button variant="outline" onClick={() => router.push(`/${lang}/dashboard`)}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
