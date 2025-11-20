"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useAuthStore } from "@/lib/stores/auth-store"
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
  const router = useRouter()
  const { user, isLoading, logout, isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const [hasRedirected, setHasRedirected] = useState(false)
  
  // Listen for permission updates and refresh sidebar automatically
  usePermissionUpdates()

  // Check if this is the login page
  const isLoginPage = pathname === "/superadmin/login"

  // Get auth store state to check initialization
  const authStore = useAuthStore()
  const isInitialized = authStore.isInitialized

  // Handle redirects outside of render cycle (but not for login page)
  useEffect(() => {
    // Don't redirect if we're on login page or already redirected
    if (isLoginPage || hasRedirected) {
      return
    }

    // Wait for auth to finish initializing and loading
    if (!isInitialized || isLoading) {
      return
    }

    // Check authentication and role
    if (!isAuthenticated || !user) {
      setHasRedirected(true)
      router.replace("/superadmin/login")
      return
    }

    // Only SUPER_ADMIN and ADMIN can access superadmin routes
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      setHasRedirected(true)
      router.replace(roleSpecificDashboards[user.role] || "/")
      return
    }

    // Reset redirect flag if user is authenticated and has correct role
    setHasRedirected(false)
  }, [user, isLoading, isAuthenticated, isInitialized, isLoginPage, router, hasRedirected])

  // For login page, just render children without authentication checks
  if (isLoginPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  // Show loading state while checking auth or initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated or doesn't have access
  // (This prevents flash of content before redirect)
  if (!isAuthenticated || !user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return null
  }

  return (
    <div className={styles.layout}>
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 lg:left-64 bg-white border-b border-slate-200 shadow-sm z-30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-white text-slate-600 border-slate-200 hover:bg-slate-100 shadow-sm"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center gap-4 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full text-slate-600 hover:bg-slate-100">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name || user?.email} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 border border-slate-200 shadow-lg" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-3">
                  <p className="text-sm font-semibold leading-none text-slate-900">{user?.name || "Super Admin"}</p>
                  <p className="text-xs leading-none text-slate-500">{user?.email}</p>
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
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
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