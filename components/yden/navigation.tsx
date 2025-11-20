"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, MapPin, Mail, Phone } from "lucide-react"
import clsx from "clsx"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/youth", label: "For Youth" },
  { href: "/partners", label: "For Partners" },
  { href: "/resources", label: "Resources" },
  { href: "/news", label: "News & Events" },
  { href: "/contact", label: "Contact" },
]

export function YdenNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-900/5" 
          : "bg-white/80 backdrop-blur-md shadow-sm"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3 transition-transform hover:scale-105" aria-label="YDEN home">
          <div className="relative flex h-12 w-28 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-sky-50 ring-2 ring-slate-100/50 transition-all group-hover:ring-emerald-200 sm:h-12 sm:w-28 lg:h-14 lg:w-32">
            <Image
              src="/yden.png"
              alt="YDEN logo"
              width={120}
              height={48}
              sizes="(min-width: 1024px) 128px, 112px"
              className="h-auto w-full object-contain p-1.5"
              priority
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="group relative px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-emerald-700"
            >
              <span className="relative z-10">{item.label}</span>
              <span className="absolute inset-0 rounded-xl bg-emerald-50 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
          <Link
            href="/youth"
            className="group relative ml-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40"
          >
            <span className="relative z-10">Join YDEN</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-500 group-hover:translate-x-full" />
          </Link>
        </nav>

        <button
          className={clsx(
            "inline-flex h-11 w-11 items-center justify-center rounded-full border-2 text-slate-700 transition-all lg:hidden",
            isOpen 
              ? "border-emerald-500 bg-emerald-50" 
              : "border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50"
          )}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? (
            <X className="h-5 w-5 text-emerald-700" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      <div
        className={clsx(
          "lg:hidden transition-all duration-300 overflow-hidden border-slate-100",
          isOpen 
            ? "max-h-[600px] border-t bg-white/98 backdrop-blur-xl shadow-lg" 
            : "max-h-0 border-transparent"
        )}
      >
        <div className="space-y-1 px-4 py-4 sm:px-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:bg-gradient-to-r hover:from-emerald-50 hover:to-sky-50 hover:text-emerald-700"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex items-center justify-between">
                {item.label}
                <ChevronDown className="h-4 w-4 -rotate-90 opacity-0 transition-all group-hover:opacity-100" />
              </span>
            </Link>
          ))}
          <div className="!mt-4 space-y-2 border-t border-slate-100 pt-4">
            <Link
              href="/youth"
              className="block rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 px-5 py-4 text-center text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:shadow-xl"
              onClick={() => setIsOpen(false)}
            >
              Join YDEN
            </Link>
            <Link
              href="/en/login"
              className="block rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-center text-sm font-bold text-slate-700 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={() => setIsOpen(false)}
            >
              Member Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

