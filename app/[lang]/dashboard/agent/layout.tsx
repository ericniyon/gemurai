"use client"

import { ReactNode, useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useParams, usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Home,
  Package,
  ClipboardCheck,
  Wallet,
  Settings,
  Menu,
  X,
  ChevronRight,
  Building2,
  User,
  LogOut,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AgentLayoutProps {
  children: ReactNode
}

interface MCC {
  id: string
  name: string
}

const agentNavItems = [
  { href: "/dashboard/agent", label: "Dashboard", icon: Home, exact: true },
  { href: "/dashboard/agent/intake", label: "Collect", icon: Package },
  { href: "/dashboard/agent/quality", label: "Quality Check", icon: ClipboardCheck },
  { href: "/dashboard/agent/commissions", label: "Commissions", icon: Wallet },
  { href: "/dashboard/agent/settings", label: "Settings", icon: Settings },
]

export default function AgentLayout({ children }: AgentLayoutProps) {
  const { user, logout } = useAuth()
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const lang = (params?.lang as string) || "en"

  const [mccs, setMccs] = useState<MCC[]>([])
  const [selectedMccId, setSelectedMccId] = useState<string>("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if user has agent role
  const isAgent = user && (
    user.role === "AGENT" ||
    user.role === "AGENT" ||
    user.role === "MCC_MANAGER" ||
    user.role === "ADMIN" ||
    user.role === "SUPER_ADMIN"
  )

  // Fetch MCCs the agent can access
  useEffect(() => {
    const token = localStorage.getItem("Gemurai_token")
    if (!token || !user) return

    fetch("/api/v1/agent/mccs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setMccs(data.data)
          // Auto-select MCC
          if (user.mccId && data.data.some((m: MCC) => m.id === user.mccId)) {
            setSelectedMccId(user.mccId)
          } else if (data.data.length === 1) {
            setSelectedMccId(data.data[0].id)
          }
        }
      })
      .finally(() => setLoading(false))
  }, [user])

  const handleLogout = () => {
    logout()
    router.push(`/${lang}/login`)
  }

  const isActiveLink = (href: string, exact?: boolean) => {
    const fullPath = `/${lang}${href}`
    if (exact) {
      return pathname === fullPath
    }
    return pathname?.startsWith(fullPath) ?? false
  }

  const selectedMcc = mccs.find((m) => m.id === selectedMccId)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You need an Agent or Field Agent role to access this area.
          </p>
          <Button onClick={() => router.push(`/${lang}/dashboard`)} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo & Menu */}
          <div className="flex items-center gap-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-gradient-to-b from-[#1e3a5f] to-[#2d5a87]">
                <MobileNav
                  items={agentNavItems}
                  lang={lang}
                  pathname={pathname}
                  onClose={() => setIsMobileMenuOpen(false)}
                />
              </SheetContent>
            </Sheet>

            <Link href={`/${lang}/dashboard/agent`} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:block">Gemura Agent</span>
            </Link>
          </div>

          {/* Center: MCC Selector */}
          <div className="flex-1 max-w-xs mx-4 hidden sm:block">
            <Select value={selectedMccId} onValueChange={setSelectedMccId}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white h-9">
                <Building2 className="h-4 w-4 mr-2 opacity-70" />
                <SelectValue placeholder="Select MCC" />
              </SelectTrigger>
              <SelectContent>
                {mccs.map((mcc) => (
                  <SelectItem key={mcc.id} value={mcc.id}>
                    {mcc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10 px-2">
                  <Avatar className="h-8 w-8 border-2 border-white/30">
                    <AvatarFallback className="bg-blue-500 text-white text-sm">
                      {user.name?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                    <Badge variant="secondary" className="mt-1 w-fit text-xs">
                      {user.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/dashboard/agent/settings`} className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile MCC Selector */}
        <div className="sm:hidden px-4 pb-3">
          <Select value={selectedMccId} onValueChange={setSelectedMccId}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white h-9">
              <Building2 className="h-4 w-4 mr-2 opacity-70" />
              <SelectValue placeholder="Select MCC" />
            </SelectTrigger>
            <SelectContent>
              {mccs.map((mcc) => (
                <SelectItem key={mcc.id} value={mcc.id}>
                  {mcc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 bg-white border-r border-gray-200 shadow-sm">
          <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
            <nav className="flex-1 px-3 space-y-1">
              {agentNavItems.map((item) => {
                const isActive = isActiveLink(item.href, item.exact)
                return (
                  <Link
                    key={item.href}
                    href={`/${lang}${item.href}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-500")} />
                    {item.label}
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </Link>
                )
              })}
            </nav>

            {/* Agent Info Card */}
            <div className="px-3 mt-auto">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 border-2 border-blue-200">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {user.name?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">Agent ID: {(user as any).displayId || "—"}</p>
                  </div>
                </div>
                {selectedMcc && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-white rounded-lg px-3 py-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <span>{selectedMcc.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* Pass selected MCC to children via context or props */}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around py-2">
          {agentNavItems.slice(0, 4).map((item) => {
            const isActive = isActiveLink(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={`/${lang}${item.href}`}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                  isActive ? "text-blue-600" : "text-gray-500"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-blue-600")} />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute -top-1 w-1 h-1 bg-blue-600 rounded-full"></span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Add padding for mobile bottom nav */}
      <div className="lg:hidden h-20"></div>
    </div>
  )
}

// Mobile Navigation Component
function MobileNav({
  items,
  lang,
  pathname,
  onClose,
}: {
  items: typeof agentNavItems
  lang: string
  pathname: string | null
  onClose: () => void
}) {
  return (
    <div className="flex flex-col h-full text-white">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Gemura Agent</h2>
            <p className="text-xs text-white/70">Collection App</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const isActive = pathname === `/${lang}${item.href}` || 
            (!item.exact && pathname?.startsWith(`/${lang}${item.href}`))
          return (
            <Link
              key={item.href}
              href={`/${lang}${item.href}`}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
