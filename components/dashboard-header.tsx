"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
import {
  Bell,
  LogOut,
  Settings,
  User,
  Menu,
  BarChart2,
  HelpCircle,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ClientOnly } from "@/components/client-only"

// Add this function to generate background color based on name
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500'
  ]
  
  // Get a consistent index based on the name
  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return colors[charSum % colors.length]
}

export function DashboardHeader() {
  return (
    <ClientOnly>
      <DashboardHeaderContent />
    </ClientOnly>
  )
}

function DashboardHeaderContent() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const navigation = [
    // Navigation items removed
  ]

  return (
    <header className="fixed top-0 left-0 right-0 bg-navy-900 border-b border-navy-700 z-50">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-4 md:hidden text-white hover:bg-navy-800">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-navy-900 border-navy-700">
                <nav className="flex flex-col gap-1 p-4">
                  {navigation.filter(item => item.href && item.href.trim() !== "" && item.href.trim() !== "#").map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-navy-100 rounded-lg hover:bg-navy-800 hover:text-white transition-colors"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center space-x-3">
              <div className="w-[160px] h-[49px] flex items-center justify-center">
                <img
                  src="/yden.png"
                  alt="YDEN Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">YDEN</h1>
                <p className="text-xs text-navy-200">Young Dairy Entrepreneurs Network</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.filter(item => item.href && item.href.trim() !== "" && item.href.trim() !== "#").map((item) => (
              <Link
                key={item.name}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="px-3 py-2 text-sm font-medium text-navy-100 rounded-lg hover:bg-navy-800 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-navy-100 hover:text-white hover:bg-navy-800"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-navy-100 hover:text-white hover:bg-navy-800"
            >
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-auto p-2 hover:bg-navy-800 transition-all duration-300"
                >
                  <Avatar className="h-8 w-8 border-4 border-white shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:scale-105 hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] transition-all duration-300">
                    {user?.avatar && (
                      <AvatarImage 
                        src={user.avatar} 
                        alt={user.name || "User avatar"} 
                      />
                    )}
                    <AvatarFallback>
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{user?.name || "User"}</p>
                    <p className="text-xs text-navy-200 capitalize">{user?.role || "User"}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-navy-900 border-navy-700">
                <DropdownMenuLabel className="text-navy-100">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border-4 border-white shadow-[0_8px_25px_rgba(0,0,0,0.15)]">
                      {user?.avatar && (
                        <AvatarImage 
                          src={user.avatar} 
                          alt={user.name || "User avatar"} 
                        />
                      )}
                      <AvatarFallback>
                        {user?.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-navy-200">{user?.email}</p>
                      <p className="text-xs text-navy-200 capitalize">Role: {user?.role}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-navy-700" />
                <DropdownMenuItem className="text-navy-100 focus:bg-navy-800 focus:text-white">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-navy-100 focus:bg-navy-800 focus:text-white">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-navy-700" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-red-400 focus:text-red-400 focus:bg-navy-800 disabled:opacity-50"
                >
                  <LogOut className={cn("mr-2 h-4 w-4", isLoggingOut && "animate-spin")} />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
} 