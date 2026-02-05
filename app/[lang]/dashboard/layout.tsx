"use client"

import type { ReactNode, CSSProperties } from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation"
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
  Pill,
  Lock,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Wheat,
  Coffee,
  Sprout,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Database,
  UserPlus,
  Clock,
  Tractor,
  DollarSign,
  HandCoins,
  RefreshCw,
  Warehouse
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { usePermissionUpdates } from "@/hooks/use-permission-updates"
import { cn, formatCurrency } from "@/lib/utils"
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
  id: string
  name: string
  href?: string
  icon?: LucideIcon
  children?: NavigationItem[]
  /** When true, renders as a non-clickable section label with children as direct links below it */
  isSectionLabel?: boolean
  requiredPermissions?: string[]
  roles?: string[]
}

// Define navigation items for ADMIN users (platform administration focus)
// Dashboard, System Settings (Users, MCCs, Pricing Scheme), Commodity Studio, Reports, Settings
const getAdminNavigationItems = (lang: string): NavigationItem[] => [
  { 
    id: "admin-dashboard",
    name: "Dashboard", 
    href: `/${lang}/dashboard`,
    icon: LayoutDashboard,
    roles: ["ADMIN", "SUPER_ADMIN"]
  },
  {
    id: "admin-system-settings",
    name: "System Settings",
    isSectionLabel: true,
    roles: ["ADMIN", "SUPER_ADMIN"],
    children: [
      {
        id: "admin-users",
        name: "Users",
        href: `/${lang}/dashboard/admin/users`,
        icon: Users,
        roles: ["ADMIN", "SUPER_ADMIN"]
      },
      {
        id: "admin-mccs",
        name: "MCCs",
        href: `/${lang}/dashboard/admin/mccs`,
        icon: Building2,
        roles: ["ADMIN", "SUPER_ADMIN"]
      },
      {
        id: "admin-pricing-scheme",
        name: "Pricing Scheme",
        href: `/${lang}/dashboard/admin/pricing-scheme`,
        icon: DollarSign,
        roles: ["ADMIN", "SUPER_ADMIN"]
      }
    ]
  },
  {
    id: "admin-core-architectural-concept",
    name: "Core Architectural Concept",
    isSectionLabel: true,
    roles: ["ADMIN", "SUPER_ADMIN"],
    children: [
      {
        id: "admin-categories",
        name: "Categories",
        href: `/${lang}/dashboard/admin/commodity-studio?tab=categories`,
        icon: Package,
        roles: ["ADMIN", "SUPER_ADMIN"]
      },
      {
        id: "admin-commodities",
        name: "Commodities",
        href: `/${lang}/dashboard/admin/commodity-studio?tab=commodities`,
        icon: Wheat,
        roles: ["ADMIN", "SUPER_ADMIN"]
      },
      {
        id: "admin-quality-checks",
        name: "Quality Checks",
        href: `/${lang}/dashboard/admin/commodity-studio?tab=quality`,
        icon: CheckSquare,
        roles: ["ADMIN", "SUPER_ADMIN"]
      },
      {
        id: "admin-inputs-catalog",
        name: "Inputs Catalog",
        href: `/${lang}/dashboard/admin/commodity-studio?tab=input-catalog`,
        icon: Database,
        roles: ["ADMIN", "SUPER_ADMIN"]
      },
      {
        id: "admin-seasons-calendars",
        name: "Seasons & Calendars",
        href: `/${lang}/dashboard/admin/commodity-studio?tab=frequency`,
        icon: Calendar,
        roles: ["ADMIN", "SUPER_ADMIN"]
      }
    ]
  },
  {
    id: "admin-reports",
    name: "Reports",
    href: `/${lang}/dashboard/admin/reports`,
    icon: BarChart3,
    roles: ["ADMIN", "SUPER_ADMIN"]
  },
  {
    id: "admin-settings",
    name: "Settings",
    href: `/${lang}/dashboard/settings`,
    icon: Settings,
    roles: ["ADMIN", "SUPER_ADMIN"],
    children: [
      {
        id: "admin-settings-general",
        name: "General Settings",
        href: `/${lang}/dashboard/settings/general`,
        icon: Settings,
        roles: ["ADMIN", "SUPER_ADMIN"]
      },
      {
        id: "admin-settings-user-management",
        name: "User Management",
        href: `/${lang}/dashboard/settings/user-management`,
        icon: Users,
        roles: ["ADMIN", "SUPER_ADMIN"]
      },
      {
        id: "admin-settings-roles",
        name: "Roles and Permission",
        href: `/${lang}/dashboard/settings/roles`,
        icon: Shield,
        roles: ["ADMIN", "SUPER_ADMIN"]
      },
      {
        id: "admin-settings-system",
        name: "System Configuration",
        href: `/${lang}/dashboard/settings/system`,
        icon: Database,
        roles: ["ADMIN", "SUPER_ADMIN"]
      },
      {
        id: "admin-settings-notifications",
        name: "Notifications",
        href: `/${lang}/dashboard/settings/notifications`,
        icon: Bell,
        roles: ["ADMIN", "SUPER_ADMIN"]
      },
      {
        id: "admin-settings-security",
        name: "Security",
        href: `/${lang}/dashboard/settings/security`,
        icon: Shield,
        roles: ["ADMIN", "SUPER_ADMIN"]
      },
      {
        id: "admin-settings-audit",
        name: "Audit Logs",
        href: `/${lang}/dashboard/settings/audit`,
        icon: FileText,
        roles: ["ADMIN", "SUPER_ADMIN"]
      }
    ]
  }
]

// Define navigation items for MCC_MANAGER and other operational roles
// Order: Dashboard → HarvestPlus (daily ops) → Farm-Level Data (incl. Onboarding) → MCC (Dairy) → Agriculture
const getMCCManagerNavigationItems = (lang: string): NavigationItem[] => [
  { 
    id: "mcc-dashboard",
    name: "Dashboard", 
    href: `/${lang}/dashboard`,
    icon: LayoutDashboard,
    requiredPermissions: [],
    roles: ["MCC_MANAGER", "SUPER_ADMIN", "AGENT", "FIELD_AGENT"]
  },
  // Operations - hub for periods, processing, types, payments (dairy + crop)
  {
    id: "operations",
    name: "Operations",
    href: `/${lang}/dashboard/operations`,
    icon: Activity,
    requiredPermissions: [],
    roles: ["MCC_MANAGER", "SUPER_ADMIN"]
  },
  // Collections - one page: choose type then form (commodity / milk / crop)
  {
    id: "collections",
    name: "Collections",
    href: `/${lang}/dashboard/collections`,
    icon: ClipboardList,
    requiredPermissions: [],
    roles: ["MCC_MANAGER", "SUPER_ADMIN"]
  },
  // HarvestPlus - single menu (Farmer Payments, Agent Advances, Reconciliation are tabs on the page)
  {
    id: "harvestplus",
    name: "HarvestPlus",
    href: `/${lang}/dashboard/harvestplus`,
    icon: Wheat,
    requiredPermissions: [],
    roles: ["MCC_MANAGER", "SUPER_ADMIN"]
  },
  // Farm-Level Data - single page (Farmer Profiles, Season Plans, Input Usage, Farmers, Agents are tabs)
  {
    id: "farm-level-data",
    name: "Farm-Level Data",
    href: `/${lang}/dashboard/farm-level-data`,
    icon: Tractor,
    requiredPermissions: [],
    roles: ["MCC_MANAGER", "SUPER_ADMIN"]
  },
  // MCC (Dairy) - single page (Sales, Customers, Suppliers, Ikofi, Warehouses are tabs)
  {
    id: "mcc-dairy",
    name: "MCC (Dairy)",
    href: `/${lang}/dashboard/mcc`,
    icon: Droplets,
    requiredPermissions: [],
    roles: ["MCC_MANAGER", "SUPER_ADMIN"]
  },
  // Inventory (for EMPLOYER, BRANCH_MANAGER - keep for other roles)
  { 
    id: "inventory",
    name: "Inventory", 
    href: `/${lang}/dashboard/inventory`, 
    icon: Building2, 
    requiredPermissions: [],
    roles: ["EMPLOYER", "SUPER_ADMIN", "BRANCH_MANAGER"],
    children: [
      { id: "inventory-milk", name: "Milk Inventory", href: `/${lang}/dashboard/mcc`, icon: Droplets, requiredPermissions: [], roles: ["EMPLOYER", "SUPER_ADMIN", "BRANCH_MANAGER"] },
      { id: "inventory-pharmacy", name: "Pharmacy Inventory", href: `/${lang}/dashboard/pharmacy`, icon: Pill, requiredPermissions: [], roles: ["EMPLOYER", "SUPER_ADMIN", "BRANCH_MANAGER"] }
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

  // ADMIN and SUPER_ADMIN users get a completely different sidebar focused on platform administration
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    console.log('🎯 ADMIN/SUPER_ADMIN User detected - using admin-specific navigation')
    const adminItems = getAdminNavigationItems(lang)
    return adminItems.filter(item => 
      hasRequiredPermissions(userPermissions, item.requiredPermissions || [], user.role) &&
      hasRequiredRole(user.role, item.roles)
    ).map(item => ({
      ...item,
      children: item.children?.filter(child => 
        hasRequiredPermissions(userPermissions, child.requiredPermissions || [], user.role) &&
        hasRequiredRole(user.role, child.roles)
      )
    }))
  }

  // MCC_MANAGER and other operational roles get the standard navigation
  const allItems = getMCCManagerNavigationItems(lang)
  
  // Special handling for DCC users - ensure they can see stock management
  if (user.role === "DCC") {
    console.log('🎯 DCC User detected, ensuring stock management access')
  }
  
  // Special handling for MCC_MANAGER users - ensure they can see MCC management
  if (user.role === "MCC_MANAGER") {
    console.log('🎯 MCC_MANAGER User detected, ensuring MCC management access')
  }
  
  const filteredItems = allItems.filter(item => 
    hasRequiredPermissions(userPermissions, item.requiredPermissions || [], user.role) &&
    hasRequiredRole(user.role, item.roles)
  ).map(item => ({
    ...item,
    children: item.children?.filter(child => 
      hasRequiredPermissions(userPermissions, child.requiredPermissions || [], user.role) &&
      hasRequiredRole(user.role, child.roles)
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
  const searchParams = useSearchParams()
  const lang = (params?.lang as string) || "en"
  const [wallet, setWallet] = useState<{ balance: number } | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [hasRedirected, setHasRedirected] = useState(false)
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<any[]>([])
  const [hasNewNotifications, setHasNewNotifications] = useState(false)
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
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
        const token = localStorage.getItem("Gemurai_token")
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
  const displayName = user?.name || user?.email || "User"
  const displayRole = user?.role ? user.role.replace(/_/g, " ").toUpperCase() : "USER"
  const sidebarDesktopWidth = sidebarCollapsed ? "5rem" : "18.5rem"
  const layoutStyle = { "--sidebar-width": sidebarDesktopWidth } as CSSProperties
  const isActiveLink = (targetHref: string) => {
    if (!targetHref) return false
    const withoutHash = targetHref.split("#")[0]
    const basePath = withoutHash.replace(/\?.*$/, "")
    if (pathname !== basePath && !pathname.startsWith(`${basePath}/`)) return false
    const tabInHref = targetHref.match(/\?.*\btab=([^&]+)/)?.[1]
    if (tabInHref) {
      if (!searchParams) return false
      return searchParams.get("tab") === tabInHref
    }
    return true
  }
  
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

  const handleSidebarCollapseToggle = () => {
    setSidebarCollapsed((prev) => !prev)
  }

  useEffect(() => {
    if (sidebarCollapsed) {
      setExpandedItems([])
    }
  }, [sidebarCollapsed])

  useEffect(() => {
    const intervalId = setInterval(() => {
      // setCurrentTime(new Date()) // Removed as per edit hint
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newItems = prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
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
            shouldExpandItems.push(item.id)
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
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#0099f2]/5"
      style={layoutStyle}
      data-sidebar-collapsed={sidebarCollapsed}
    >
      {/* Top Navigation Bar */}
      <header className="dashboard-topbar">
        <div className="dashboard-topbar__content">
          <div className="dashboard-topbar__left">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="dashboard-topbar__toggle"
              onClick={handleSidebarCollapseToggle}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={sidebarCollapsed}
            >
              {sidebarCollapsed ? (
                <ChevronsRight className="dashboard-topbar__toggle-icon" />
              ) : (
                <ChevronsLeft className="dashboard-topbar__toggle-icon" />
              )}
            </Button>
          </div>

          <div className="dashboard-topbar__actions">
            <LanguageSwitcher variant="nav" />

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="dashboard-topbar__icon-button"
                >
                  <Bell className="h-5 w-5" />
                  {hasNewNotifications && (
                    <span className="dashboard-topbar__notification-dot" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dashboard-topbar__dropdown">
                <DropdownMenuLabel className="dashboard-topbar__dropdown-label">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="dashboard-topbar__dropdown-empty">No new notifications</div>
                ) : (
                  <div className="max-h-80 overflow-auto divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="dashboard-topbar__dropdown-item"
                        onClick={() => {
                          setSelectedNotificationId(n.id)
                          setHasNewNotifications(false)
                          router.push(`/${lang}/dashboard/notifications/${String(n.id)}`)
                        }}
                      >
                        <div className="text-sm text-slate-900">{n.title}</div>
                        <div className="text-xs text-slate-500">Time remaining: {n.timeRemaining}</div>
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
                <Button
                  variant="ghost"
                  className="dashboard-topbar__profile-button"
                >
                  <Avatar className="dashboard-topbar__profile-avatar">
                    {user?.avatar ? <AvatarImage src={user.avatar} /> : null}
                    <AvatarFallback className="dashboard-topbar__profile-fallback">
                      {user?.name?.slice(0, 2).toUpperCase() || displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="dashboard-topbar__chevron" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dashboard-topbar__dropdown dashboard-topbar__dropdown--profile">
                <DropdownMenuLabel className="dashboard-topbar__dropdown-label">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={`/${lang}/dashboard/profile`}>
                  <DropdownMenuItem className="dashboard-topbar__dropdown-link">
                    <User className="mr-2 h-4 w-4 text-slate-500" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link href={`/${lang}/dashboard/settings`}>
                  <DropdownMenuItem className="dashboard-topbar__dropdown-link">
                    <Settings className="mr-2 h-4 w-4 text-slate-500" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="dashboard-topbar__dropdown-logout"
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
      </header>

      {/* Mobile Menu Trigger */}
      <Button
        variant="ghost"
        className="lg:hidden fixed left-4 top-4 z-40 text-slate-600 hover:bg-slate-100"
        onClick={() => document.getElementById('mobile-menu')?.click()}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Side Navigation */}
      <div className={cn("sidebar-container", sidebarCollapsed && "sidebar-collapsed")}>
        <nav className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <Link href={`/${lang}/dashboard`} className="sidebar-logo" aria-label="HarvestPlus by YDEN dashboard home">
              <div className="sidebar-logo-icon">
                <span className="text-lg font-semibold tracking-tight">H</span>
              </div>
              <div>
                <span className="sidebar-brand-title">HarvestPlus</span>
                <span className="sidebar-brand-subtitle">by YDEN</span>
              </div>
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
                <div key={item.id} className={item.isSectionLabel ? "sidebar-section" : item.children ? "sidebar-expandable" : undefined}>
                  {item.isSectionLabel && item.children ? (
                    <>
                      <div className="sidebar-section-label" title={item.name}>
                        {item.name}
                      </div>
                      <div className="sidebar-section-links">
                        {item.children.map((child) => (
                          child.href && child.href.trim() !== "" && child.href.trim() !== "#" && child.href.trim() !== "/" ? (
                            <Link
                              key={child.id}
                              href={child.href.trim()}
                              className={cn(
                                "sidebar-submenu-item",
                                isActiveLink(child.href) ? "active" : ""
                              )}
                              title={child.name}
                            >
                              {child.icon && createElement(child.icon, {
                                className: "sidebar-nav-item-icon"
                              })}
                              <span className="sidebar-item-label">{child.name}</span>
                            </Link>
                          ) : null
                        ))}
                      </div>
                    </>
                  ) : item.children ? (
                    <>
                      <button
                        className={cn(
                          "sidebar-expandable-toggle",
                          item.href && (pathname.startsWith(item.href) || pathname === item.href) ? "active" : ""
                        )}
                        onClick={() => toggleExpanded(item.id)}
                        title={item.name}
                      >
                        <div className="sidebar-item-content">
                          {item.icon && createElement(item.icon, {
                            className: "sidebar-nav-item-icon"
                          })}
                          <span className="sidebar-item-label">{item.name}</span>
                        </div>
                        <ChevronDown className={cn(
                          "sidebar-expandable-chevron",
                          expandedItems.includes(item.id) ? "expanded" : ""
                        )} />
                      </button>
                      <div className={cn(
                        "sidebar-expandable-content",
                        expandedItems.includes(item.id) ? "expanded" : "collapsed"
                      )}>
                        <div className="sidebar-submenu">
                          {item.children.map((child) => {
                            // If child has children, render as nested expandable
                            if (child.children && child.children.length > 0) {
                              return (
                                <div key={child.id} className="sidebar-nested-expandable">
                                  <button
                                    className={cn(
                                      "sidebar-expandable-toggle sidebar-nested-toggle",
                                      pathname.startsWith(child.href || "") ? "active" : ""
                                    )}
                                    onClick={() => toggleExpanded(child.id)}
                                    title={child.name}
                                  >
                                    <div className="sidebar-item-content">
                                      {child.icon && createElement(child.icon, {
                                        className: "sidebar-nav-item-icon"
                                      })}
                                      <span className="sidebar-item-label">{child.name}</span>
                                    </div>
                                    <ChevronDown className={cn(
                                      "sidebar-expandable-chevron",
                                      expandedItems.includes(child.id) ? "expanded" : ""
                                    )} />
                                  </button>
                                  <div className={cn(
                                    "sidebar-expandable-content sidebar-nested-content",
                                    expandedItems.includes(child.id) ? "expanded" : "collapsed"
                                  )}>
                                    <div className="sidebar-submenu sidebar-nested-submenu">
                                      {child.children.map((nestedChild) => (
                                        nestedChild.href && nestedChild.href.trim() !== "" && nestedChild.href.trim() !== "#" && nestedChild.href.trim() !== "/" ? (
                                          <Link
                                            key={nestedChild.id}
                                            href={nestedChild.href.trim()}
                                            className={cn(
                                              "sidebar-submenu-item",
                                              isActiveLink(nestedChild.href) ? "active" : ""
                                            )}
                                            title={nestedChild.name}
                                          >
                                            {nestedChild.icon && createElement(nestedChild.icon, {
                                              className: "sidebar-nav-item-icon"
                                            })}
                                            <span className="sidebar-item-label">{nestedChild.name}</span>
                                          </Link>
                                        ) : null
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            // Regular child link
                            return (
                              child.href && child.href.trim() !== "" && child.href.trim() !== "#" && child.href.trim() !== "/" ? (
                                <Link
                                  key={child.id}
                                  href={child.href.trim()}
                                  className={cn(
                                    "sidebar-submenu-item",
                                    isActiveLink(child.href) ? "active" : ""
                                  )}
                                  title={child.name}
                                >
                                  {child.icon && createElement(child.icon, {
                                    className: "sidebar-nav-item-icon"
                                  })}
                                  <span className="sidebar-item-label">{child.name}</span>
                                </Link>
                              ) : null
                            )
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    item.href && item.href.trim() !== "" && item.href.trim() !== "#" && item.href.trim() !== "/" ? (
                      <Link
                        href={item.href.trim()}
                        className={cn(
                          "sidebar-nav-item",
                          isActiveLink(item.href) ? "active" : ""
                        )}
                        title={item.name}
                      >
                        {item.icon && createElement(item.icon, {
                          className: "sidebar-nav-item-icon"
                        })}
                        <span className="sidebar-item-label">{item.name}</span>
                      </Link>
                    ) : null
                  )}
                </div>
              ))
            )}
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
                  <div key={item.id}>
                    {item.isSectionLabel && item.children ? (
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground sidebar-section-label-mobile">
                          {item.name}
                        </div>
                        <div className="space-y-0.5">
                          {item.children.map((child) => (
                            child.href && child.href.trim() !== "" && child.href.trim() !== "#" && child.href.trim() !== "/" ? (
                              <Link
                                key={child.id}
                                href={child.href.trim()}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 sidebar-nav-item",
                                  isActiveLink(child.href)
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm active"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                )}
                              >
                                {child.icon && createElement(child.icon, {
                                  className: cn(
                                    "h-4 w-4",
                                    isActiveLink(child.href) ? "text-sidebar-primary-foreground" : "text-sidebar-foreground"
                                  )
                                })}
                                {child.name}
                              </Link>
                            ) : null
                          ))}
                        </div>
                      </div>
                    ) : item.children ? (
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between transition-all duration-200 sidebar-nav-item",
                            item.href && (pathname.startsWith(item.href) || pathname === item.href)
                              ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-sm active"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                          onClick={() => toggleExpanded(item.id)}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon && createElement(item.icon, {
                              className: cn(
                                "h-5 w-5",
                                item.href && (pathname.startsWith(item.href) || pathname === item.href) ? "text-sidebar-primary-foreground" : "text-sidebar-foreground"
                              )
                            })}
                            {item.name}
                          </div>
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-transform",
                            expandedItems.includes(item.id) ? "rotate-180" : ""
                          )} />
                        </Button>
                        {expandedItems.includes(item.id) && (
                          <div className="pl-11 space-y-1">
                            {item.children.map((child) => (
                              child.href && child.href.trim() !== "" && child.href.trim() !== "#" && child.href.trim() !== "/" ? (
                                <Link
                                  key={child.id}
                                  href={child.href.trim()}
                                  className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 sidebar-nav-item",
                                    isActiveLink(child.href)
                                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm active"
                                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                  )}
                                >
                                  {child.icon && createElement(child.icon, {
                                    className: cn(
                                      "h-4 w-4",
                                      isActiveLink(child.href) ? "text-sidebar-primary-foreground" : "text-sidebar-foreground"
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
                          isActiveLink(item.href)
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm active"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                        >
                          {item.icon && createElement(item.icon, {
                          className: cn("h-5 w-5", isActiveLink(item.href) ? "text-sidebar-primary-foreground" : "text-sidebar-foreground")
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
      <main className="dashboard-main">
        <div className={pathname.includes("/dashboard/mcc") ? "w-full max-w-full px-2 sm:px-4 lg:px-6 pb-10" : "px-4 sm:px-6 lg:px-10 pb-10"}>
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