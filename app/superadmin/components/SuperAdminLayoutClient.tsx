"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { usePermissionUpdates } from "@/hooks/use-permission-updates"
import { Navigation } from "./Navigation"
import { roleSpecificDashboards } from "../config/navigation"
import styles from "../styles/superadmin.module.scss"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SuperAdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  
  // Listen for permission updates and refresh sidebar automatically
  usePermissionUpdates()

  // Check if this is the login page
  const isLoginPage = pathname === "/superadmin/login"

  // Handle redirects outside of render cycle (but not for login page)
  useEffect(() => {
    if (!isLoginPage && !isLoading) {
      if (!user) {
        redirect("/superadmin/login")
      } else if (user.role !== "SUPER_ADMIN") {
        // Only SUPER_ADMIN can access superadmin routes
        redirect(roleSpecificDashboards[user.role] || "/")
      }
    }
  }, [user, isLoading, isLoginPage])

  // For login page, just render children without authentication checks
  if (isLoginPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated or doesn't have access
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return null
  }

  return (
    <div className={styles.layout}>
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 lg:left-[256px] bg-white border-b border-gray-200 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-white shadow-md"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center gap-4 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name || user?.email} />
                    <AvatarFallback>
                      {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.name || "Super Admin"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarContent}>
          {/* Mobile Close Button */}
          <div className="lg:hidden flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Navigation />
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`${styles.main} pt-16`}>
        {children}
        <Toaster />
      </main>
    </div>
  )
} 