"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { layoutTranslations } from "@/app/[lang]/translations/layout"
import { useState } from "react"
import { Menu, X } from "lucide-react"

interface AuthHeaderProps {
  variant?: "default" | "dark"
}

export function AuthHeader({ variant = "default" }: AuthHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const params = useParams()
  const lang = ((params || {}) as { lang?: string }).lang || "en"
  const t = layoutTranslations[lang as keyof typeof layoutTranslations] || layoutTranslations.en
  const isDark = variant === "dark"

  return (
    <header className={`transition-colors duration-300 relative z-40 ${isDark ? "bg-transparent" : "bg-white"}`}>
      <div className="container mx-auto px-4 py-4 relative">
        <div className="flex items-center justify-between">
          <Link href={`/${lang}`} className="flex items-center space-x-2">
            <div className="w-[160px] h-[49px] flex items-center justify-center">
              <img
                src="/yden.png"
                alt="YDEN Logo"
                className={`w-full h-full object-contain ${isDark ? "brightness-0 invert" : ""}`}
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Navigation items removed */}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            {mobileNavOpen ? <X className={`h-6 w-6 ${isDark ? "text-white" : "text-[#0099f2]"}`} /> : <Menu className={`h-6 w-6 ${isDark ? "text-white" : "text-[#0099f2]"}`} />}
          </button>

          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher variant={isDark ? "dark" : "default"} />
            <Link href={`/${lang}/login`}>
              <Button 
                variant="outline" 
                className={`!transition-all !duration-200 !font-medium !px-6 !py-2 !rounded-lg !shadow-sm hover:!shadow-md ${isDark ? "!text-white !border-2 !border-white/60 hover:!bg-white hover:!text-[#0099f2] hover:!border-white bg-transparent" : "!text-[#0099f2] !border-2 !border-[#0099f2] hover:!bg-[#0099f2] hover:!text-white hover:!border-[#0099f2] bg-white"}`}
              >
                {t.header.auth.login}
              </Button>
            </Link>
          </div>
        </div>
        {/* Mobile Nav Drawer */}
        {mobileNavOpen && (
          <div className={`md:hidden mt-4 rounded shadow-lg p-4 z-50 absolute left-0 right-0 top-16 mx-2 border ${isDark ? "bg-[#0a1628] border-white/20" : "bg-white border-gray-100"}`}>
            <nav className="flex flex-col space-y-4">
              {/* Navigation items removed */}
              <div className={`flex flex-col space-y-2 pt-2 mt-2 ${isDark ? "border-t border-white/20" : "border-t border-gray-100"}`}>
                <LanguageSwitcher variant={isDark ? "dark" : "default"} />
                <Link href={`/${lang}/login`} onClick={() => setMobileNavOpen(false)}>
                  <Button 
                    variant="outline" 
                    className={`w-full !transition-all !duration-200 !font-medium !px-6 !py-2 !rounded-lg !shadow-sm hover:!shadow-md ${isDark ? "!text-white !border-2 !border-white/60 hover:!bg-white hover:!text-[#0099f2] bg-transparent" : "!text-[#0099f2] !border-2 !border-[#0099f2] hover:!bg-[#0099f2] hover:!text-white bg-white"}`}
                  >
                    {t.header.auth.login}
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}