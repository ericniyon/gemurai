"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  BarChart3, 
  Settings, 
  Bell, 
  LogOut, 
  Menu, 
  User, 
  Users, 
  FileText, 
  Briefcase, 
  TrendingUp, 
  ShoppingCart, 
  Package,
  Plus,
  ChevronDown,
  Wallet,
  ShoppingBag,
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  Shield,
  Building2,
  GraduationCap,
  FormInput,
  CheckCircle,
  Smartphone,
  CreditCard,
  Tv,
  Activity,
  Droplets,
  Pill
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { usePermissionUpdates } from "@/hooks/use-permission-updates"
import { cn, formatCurrency } from "@/lib/utils"
import Image from "next/image"
import { ClientOnly } from "@/components/client-only"
import { AlertCircle } from "lucide-react"
import { WalletBalance } from "./components/wallet-balance"
import { toast } from "@/components/ui/use-toast"
import { LucideIcon } from "lucide-react"
import { createElement } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { AuthUser } from "@/lib/token"
import { LanguageSwitcher } from "@/components/language-switcher"
import "@/styles/sidebar.css"

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  children?: NavigationItem[]
  requiredPermissions?: string[]
  roles?: string[]
}

// Define simplified navigation items - keeping only the specified menu items
const getAllNavigationItems = (lang: string): NavigationItem[] => [
  { 
    name: "Dashboard", 
    href: `/${lang}/dashboard`,
    icon: LayoutDashboard
    // No permissions required - every user should have access to Dashboard
  },
  { 
    name: "Inventory", 
    href: `/${lang}/dashboard/inventory`, 
    icon: Building2, 
    requiredPermissions: [],
    roles: ["EMPLOYER", "SUPER_ADMIN", "BRANCH_MANAGER"],
    children: [
      { name: "Milk Inventory", href: `/${lang}/dashboard/mcc`, icon: Droplets, requiredPermissions: [] },
      { name: "Pharmacy Inventory", href: `/${lang}/dashboard/pharmacy`, icon: Pill, requiredPermissions: [] }
    ]
  },
]

// Helper function to check if user has required permissions
const hasRequiredPermissions = (userPermissions: string[], requiredPermissions: string[], userRole?: string): boolean => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true
  if (userRole === "SUPER_ADMIN") return true // SUPER_ADMIN has full access
  if (userPermissions.includes("*")) return true // Wildcard permission
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

// Helper function to check if user has required role
const hasRequiredRole = (userRole: string, allowedRoles?: string[]): boolean => {
  if (userRole === "SUPER_ADMIN") return true // SUPER_ADMIN can access everything
  if (!allowedRoles || allowedRoles.length === 0) return true
  return allowedRoles.includes(userRole)
}

// Get navigation items based on user's permissions
const getNavigationItems = (user: any, lang: string): NavigationItem[] => {
  if (!user) return []
  
  const allItems = getAllNavigationItems(lang)
  // Use database permissions (user.permissions) instead of rolePermissions
  const userPermissions = user.permissions || []
  
  // Debug logging to show what permissions are being used
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Navigation Permission Check:', {
      userId: user.id,
      role: user.role,
      rolePermissions: user.rolePermissions,
      databasePermissions: user.databasePermissions,
      combinedPermissions: user.permissions,
      usingPermissions: userPermissions
    })
  }

  // Special handling for DCC users - ensure they can see stock management
  if (user.role === "DCC") {
    console.log('🎯 DCC User detected, ensuring stock management access')
  }
  
  const filteredItems = allItems.filter(item => 
    hasRequiredPermissions(userPermissions, item.requiredPermissions || [], user.role) &&
    hasRequiredRole(user.role, item.roles)
  ).map(item => ({
    ...item,
    children: item.children?.filter(child => 
      hasRequiredPermissions(userPermissions, child.requiredPermissions || [], user.role)
    )
  }))

  // Debug logging for filtered items
  if (process.env.NODE_ENV === 'development') {
    console.log('📋 Filtered Navigation Items:', {
      userRole: user.role,
      lang: lang,
      isSuperAdmin: user.role === "SUPER_ADMIN",
      totalItems: allItems.length,
      filteredItems: filteredItems.length,
      items: filteredItems.map(item => ({
        name: item.name,
        href: item.href,
        permissions: item.requiredPermissions,
        roles: item.roles,
        hasChildren: !!item.children?.length
      }))
    })
  }

  return filteredItems
}

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname() || ""
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [wallet, setWallet] = useState<{ balance: number } | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [hasRedirected, setHasRedirected] = useState(false)
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<any[]>([])
  const [hasNewNotifications, setHasNewNotifications] = useState(false)
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null)
  
  // Listen for permission updates and refresh sidebar automatically
  usePermissionUpdates()

  // Helper to compute time remaining to a 24h deadline
  const getTimeRemaining24h = (createdAt?: string) => {
    try {
      const created = createdAt ? new Date(createdAt).getTime() : Date.now()
      const deadline = created + 24 * 60 * 60 * 1000
      const remainingMs = deadline - Date.now()
      if (remainingMs <= 0) return "Overdue"
      const hours = Math.floor(remainingMs / (60 * 60 * 1000))
      const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000))
      return `${hours}h ${minutes}m`
    } catch {
      return "24h"
    }
  }

  // Add wallet data loading
  useEffect(() => {
    let isMounted = true
    let intervalId: NodeJS.Timeout | null = null

    const loadWallet = async () => {
      try {
        const token = localStorage.getItem("KoraLink_token")
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "No auth token found. Please try logging in again.",
            variant: "destructive"
          })
          return
        }

        const response = await fetch("/api/wallet", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const errorText = await response.text()
          toast({
            title: "Wallet Error",
            description: `Failed to load wallet: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`,
            variant: "destructive"
          })
          return
        }

        const data = await response.json()
        if (isMounted) {
          if (data.success && data.data) {
            setWallet(data.data)
          } else {
            console.error('Invalid wallet data received:', data)
          }
        }
      } catch (error) {
        toast({
          title: "Wallet Error",
          description: "Failed to load wallet information. Please try again later.",
          variant: "destructive"
        })
      }
    }

    if (isAuthenticated && user && !isLoggingOut) {
      // Initial load
      loadWallet()
      
      // Set up interval for periodic updates (every 5 minutes)
      intervalId = setInterval(loadWallet, 5 * 60 * 1000)
    }

    // Cleanup function
    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isAuthenticated, user, isLoggingOut]) // Only re-run if auth state or logout state changes

  // Load lightweight notifications (e.g., pending stock order payments for DCC)
  useEffect(() => {
    let isMounted = true
    const loadNotifications = async () => {
      if (!isAuthenticated || !user) return
      try {
        // Only relevant for DCC for now
        if (user.role !== "DCC") {
          if (isMounted) {
            setNotifications([])
            setHasNewNotifications(false)
          }
          return
        }
        const resp = await fetch("/api/v1/stock-orders")
        const data = await resp.json()
        if (isMounted && data?.success && Array.isArray(data.data)) {
          const pendingPayments = data.data.filter((o: any) => o?.payment?.status === "PENDING")
          const items = pendingPayments.slice(0, 5).map((o: any) => ({
            id: o.id,
            title: `Payment pending for Order #${String(o.id).slice(-8)}`,
            timeRemaining: getTimeRemaining24h(o.createdAt)
          }))
          setNotifications(items)
          setHasNewNotifications(items.length > 0)
        }
      } catch (_) {
        // ignore notification errors
      }
    }
    loadNotifications()
    const id = setInterval(loadNotifications, 60 * 1000)
    return () => {
      isMounted = false
      clearInterval(id)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    // Skip if already loading or has redirected
    if (isLoading || hasRedirected) return

    // Handle unauthenticated state
    if (!isAuthenticated) {
      // Add a small delay to prevent immediate redirects during refresh operations
      const redirectTimer = setTimeout(() => {
        const redirectPath = typeof pathname === 'string' ? pathname : '/'
        const redirectUrl = `/${lang}/login?redirect=${encodeURIComponent(redirectPath)}`
        
        // Only redirect if we're not already on the login page and haven't already redirected
        if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🚫 Dashboard Access Denied:', {
              isLoading,
              isAuthenticated,
              redirectingTo: redirectUrl
            })
          }
          setHasRedirected(true)
          router.push(redirectUrl)
        }
      }, 1000) // 1 second delay

      return () => clearTimeout(redirectTimer)
    }

    // Debug log for authenticated state
    if (process.env.NODE_ENV === 'development' && isAuthenticated && user) {
      console.log('✅ Dashboard Access Granted:', {
        userId: user.id,
        role: user.role,
        pathname: typeof pathname === 'string' ? pathname : '/'
      })
    }
  }, [isAuthenticated, isLoading, router, pathname, lang, user, hasRedirected])

  // Only generate navigation items if user is authenticated
  const navigation = isAuthenticated ? getNavigationItems(user, lang) : []

  // Debug logging to check user role
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Dashboard Layout Debug:', {
      userRole: user?.role,
      navigationItems: navigation.length,
      isAuthenticated,
      isLoading
    })
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      await logout()
      router.push('/rw')
    } catch (error) {
      console.error('Logout failed:', error)
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const toggleExpanded = (href: string) => {
    console.log('🔄 Toggle expanded clicked for:', href)
    setExpandedItems(prev => {
      const newItems = prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
      console.log('📋 Updated expanded items:', newItems)
      return newItems
    })
  }

  // Auto-expand sidebar items when on child routes
  useEffect(() => {
    if (!pathname || !navigation.length) return

    // Add a small delay to prevent interference with user interactions
    const timeoutId = setTimeout(() => {
      const shouldExpandItems: string[] = []
      
      // Check each navigation item with children
      navigation.forEach(item => {
        if (item.children) {
          // Check if current pathname matches any child route
          const isOnChildRoute = item.children.some(child => 
            pathname === child.href || pathname.startsWith(child.href + '/')
          )
          
          if (isOnChildRoute) {
            shouldExpandItems.push(item.href)
          }
        }
      })

      // Update expanded items if needed, but only if it's different from current state
      if (shouldExpandItems.length > 0) {
        setExpandedItems(prev => {
          const newExpanded = [...new Set([...prev, ...shouldExpandItems])]
          // Only update if the state actually changed to prevent unnecessary re-renders
          if (JSON.stringify(newExpanded.sort()) !== JSON.stringify(prev.sort())) {
            return newExpanded
          }
          return prev
        })
      }
    }, 100) // 100ms delay

    return () => clearTimeout(timeoutId)
  }, [pathname, navigation])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    // Add a small delay to prevent immediate redirects during refresh operations
    const redirectPath = typeof pathname === 'string' ? pathname : '/'
    const redirectUrl = `/${lang}/login?redirect=${redirectPath}`
    
    // Only redirect if we're not already on the login page
    if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
      // Use setTimeout to delay the redirect
      setTimeout(() => {
        router.replace(redirectUrl)
      }, 500) // 500ms delay
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-blue-600 z-30 px-4">
        <div className="flex h-full items-center justify-between">
          {/* Left side - Logo only */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-16 h-16 flex items-center justify-center">
              <img
                src="/KoraLink.png"
                alt="KoraLink Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-xl text-white">KoraLink</span>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher variant="nav" />

            {/* Wallet Balance */}
            <WalletBalance variant="nav" lang={lang} />

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20">
                  <Bell className="h-5 w-5" />
                  {hasNewNotifications && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-white border border-gray-200 shadow-lg">
                <DropdownMenuLabel className="font-semibold text-gray-900">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-3 py-6 text-sm text-gray-500 text-center">No new notifications</div>
                ) : (
                  <div className="max-h-80 overflow-auto">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedNotificationId(n.id)
                          // Mark as read locally but keep it in the list until paid
                          setHasNewNotifications(false)
                          router.push(`/${lang}/dashboard/notifications/${String(n.id)}`)
                        }}
                      >
                        <div className="text-sm text-gray-900">{n.title}</div>
                        <div className="text-xs text-gray-500">Time remaining: {n.timeRemaining}</div>
                      </div>
                    ))}
                  </div>
                )}
                <DropdownMenuSeparator />
                <Link href={`/${lang}/dashboard/dcc-stock/orders`}>
                  <DropdownMenuItem className="hover:bg-gray-50 cursor-pointer">View all</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                  <Avatar className="h-6 w-6">
                    {user?.avatar ? <AvatarImage src={user.avatar} /> : null}
                    <AvatarFallback className="bg-white text-blue-600 font-semibold">
                      {user?.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
                  <ChevronDown className="h-4 w-4 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
                <DropdownMenuLabel className="font-semibold text-gray-900">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={`/${lang}/dashboard/profile`}>
                  <DropdownMenuItem className="hover:bg-gray-50 cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link href={`/${lang}/dashboard/settings`}>
                  <DropdownMenuItem className="hover:bg-gray-50 cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className={cn("mr-2 h-4 w-4", isLoggingOut && "animate-spin")} />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Menu Trigger */}
      <Button
        variant="ghost"
        className="lg:hidden fixed left-4 top-4 z-40 text-white"
        onClick={() => document.getElementById('mobile-menu')?.click()}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Side Navigation */}
      <div className="sidebar-container">
        <nav className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <Link href={`/${lang}/dashboard`} className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span>Dashboard</span>
            </Link>
          </div>

          
          {/* Desktop Navigation */}
          <div className="sidebar-nav">
            {navigation.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <Shield className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No menu items available</p>
                <p className="text-xs mt-1">Check your role and permissions</p>
              </div>
            ) : (
              navigation.map((item: NavigationItem) => (
                <div key={item.href}>
                  {item.children ? (
                    <div className="sidebar-expandable">
                      <button
                        className={cn(
                          "sidebar-expandable-toggle",
                          pathname.startsWith(item.href) ? "active" : ""
                        )}
                        onClick={() => toggleExpanded(item.href)}
                      >
                        <div className="flex items-center gap-3">
                          {createElement(item.icon, {
                            className: "sidebar-nav-item-icon"
                          })}
                          {item.name}
                        </div>
                        <ChevronDown className={cn(
                          "sidebar-expandable-chevron",
                          expandedItems.includes(item.href) ? "expanded" : ""
                        )} />
                      </button>
                      <div className={cn(
                        "sidebar-expandable-content",
                        expandedItems.includes(item.href) ? "expanded" : "collapsed"
                      )}>
                        <div className="sidebar-submenu">
                          {item.children.map((child) => (
                            child.href && child.href.trim() !== "" && child.href.trim() !== "#" && child.href.trim() !== "/" ? (
                              <Link
                                key={child.href}
                                href={child.href.trim()}
                                className={cn(
                                  "sidebar-submenu-item",
                                  pathname === child.href ? "active" : ""
                                )}
                              >
                                {createElement(child.icon, {
                                  className: "sidebar-nav-item-icon"
                                })}
                                {child.name}
                              </Link>
                            ) : null
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    item.href && item.href.trim() !== "" && item.href.trim() !== "#" && item.href.trim() !== "/" ? (
                      <Link
                        href={item.href.trim()}
                        className={cn(
                          "sidebar-nav-item",
                          pathname === item.href ? "active" : ""
                        )}
                      >
                        {createElement(item.icon, {
                          className: "sidebar-nav-item-icon"
                        })}
                        {item.name}
                      </Link>
                    ) : null
                  )}
                </div>
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="sidebar-footer">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">
                  {user?.name || 'User'}
                </div>
                <div className="sidebar-user-role">
                  {user?.role || 'Unknown Role'}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <button id="mobile-menu" className="hidden" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
          <div className="h-full flex flex-col pt-16">
            
            <nav className="flex-1 px-4 space-y-1 py-4">
              {navigation.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No menu items available</p>
                </div>
              ) : (
                navigation.map((item: NavigationItem) => (
                  <div key={item.href}>
                    {item.children ? (
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between transition-all duration-200 sidebar-nav-item",
                            pathname.startsWith(item.href)
                              ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-sm active"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                          onClick={() => toggleExpanded(item.href)}
                        >
                          <div className="flex items-center gap-3">
                            {createElement(item.icon, {
                              className: cn(
                                "h-5 w-5",
                                pathname.startsWith(item.href) ? "text-sidebar-primary-foreground" : "text-sidebar-foreground"
                              )
                            })}
                            {item.name}
                          </div>
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-transform",
                            expandedItems.includes(item.href) ? "rotate-180" : ""
                          )} />
                        </Button>
                        {expandedItems.includes(item.href) && (
                          <div className="pl-11 space-y-1">
                            {item.children.map((child) => (
                              child.href && child.href.trim() !== "" && child.href.trim() !== "#" && child.href.trim() !== "/" ? (
                                <Link
                                  key={child.href}
                                  href={child.href.trim()}
                                  className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 sidebar-nav-item",
                                    pathname === child.href
                                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm active"
                                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                  )}
                                >
                                  {createElement(child.icon, {
                                    className: cn(
                                      "h-4 w-4",
                                      pathname === child.href ? "text-sidebar-primary-foreground" : "text-sidebar-foreground"
                                    )
                                  })}
                                  {child.name}
                                </Link>
                              ) : null
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      item.href && item.href.trim() !== "" && item.href.trim() !== "#" && item.href.trim() !== "/" ? (
                        <Link
                          href={item.href.trim()}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 sidebar-nav-item",
                            pathname === item.href
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm active"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          {createElement(item.icon, {
                            className: cn("h-5 w-5", pathname === item.href ? "text-sidebar-primary-foreground" : "text-sidebar-foreground")
                          })}
                          {item.name}
                        </Link>
                      ) : null
                    )}
                  </div>
                ))
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="lg:pl-[280px] pt-16">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ClientOnly>
  )
} 