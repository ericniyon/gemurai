"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, User } from "lucide-react"
import Button from "./ui/button"

export function YdenNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Programs", href: "/programs" },
    { label: "For Youth", href: "/youth" },
    { label: "For Partners", href: "/partners" },
    { label: "Resources", href: "/resources" },
    { label: "News", href: "/news" },
    { label: "Contact", href: "/contact" },
  ]

  const isSolid = scrolled || isOpen || pathname !== "/"

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isSolid ? "bg-white/95 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-12 w-28 sm:h-12 sm:w-28 lg:h-14 lg:w-32 transition-transform group-hover:scale-105">
                <Image
                  src="/yden.png"
                  alt="YDEN Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const isHome = pathname === "/"

              const textColor = scrolled || !isHome ? "text-slate-600 hover:text-blue-600" : "text-white hover:text-blue-200"
              const activeColor = scrolled || !isHome ? "text-blue-600 font-semibold" : "text-white font-semibold"

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeColor : textColor}`}
                >
                  {link.label}
                </Link>
              )
            })}
            <Link href="/portal" className="ml-2">
              <div
                className={`p-2 rounded-full transition-colors ${
                  scrolled || pathname !== "/"
                    ? "bg-slate-100 text-blue-600 hover:bg-slate-200"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <User className="w-5 h-5" />
              </div>
            </Link>
            <div className="pl-2">
              <Button
                to="/en/login"
                variant={scrolled || pathname !== "/" ? "primary" : "secondary"}
                className="py-2 px-4 text-sm"
              >
                Join YDEN
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md transition-colors ${
                isSolid ? "text-slate-600 hover:bg-slate-100" : "text-white hover:bg-white/10"
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600`}
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with Transition */}
      <div
        className={`md:hidden fixed top-16 left-0 right-0 w-full bg-white shadow-xl border-t border-slate-100 overflow-hidden transition-all duration-300 ease-in-out origin-top ${
          isOpen ? "max-h-[85vh] opacity-100 visible" : "max-h-0 opacity-0 invisible"
        }`}
      >
        <div className="px-4 py-6 space-y-3 overflow-y-auto max-h-[80vh]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                pathname === link.href
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-slate-100 my-4 pt-4 space-y-4">
            <Link
              href="/portal"
              className="flex items-center px-4 py-3 text-base font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg"
            >
              <User className="w-5 h-5 mr-3" />
              Member Portal Login
            </Link>

            <div className="px-4">
              <Button to="/en/login" variant="primary" className="w-full justify-center py-3">
                Join YDEN
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
