"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { getAuthorizedNavigation } from "../config/navigation"
import {
  Users,
  FileText,
  Settings,
  Shield,
  Activity,
  LayoutDashboard,
  Building2,
  Wallet,
  BookOpen,
  Store,
  Briefcase,
  GraduationCap,
} from "lucide-react"
import styles from "../styles/superadmin.module.scss"

export function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const navigationItems = getAuthorizedNavigation(user.role, user.permissions || [], user.databasePermissions || [], user.rolePermissions || [])

  // Show message if no navigation items are available
  if (navigationItems.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No navigation items available for your role.
      </div>
    )
  }

  return (
    <nav className="flex flex-col gap-1 sm:gap-2">
      {/* Show user role and permission count in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-2 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
          Role: {user.role} | Items: {navigationItems.length}
          {user.role === "SUPER_ADMIN" && (
            <div className="text-green-700 font-semibold mt-1">🔓 SUPER_ADMIN: Full Access</div>
          )}
        </div>
      )}
      
      {navigationItems.filter(item => item.href && item.href.trim() !== "" && item.href.trim() !== "#").map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2 text-sm font-medium transition-colors min-h-[44px] sm:min-h-[40px]",
            pathname === item.href
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate">{item.name}</span>
        </Link>
      ))}
    </nav>
  )
} 