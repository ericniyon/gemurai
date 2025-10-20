"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { layoutTranslations } from "@/app/[lang]/translations/layout"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function AuthHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const params = useParams()
  const pathname = usePathname()
  const lang = ((params || {}) as { lang?: string }).lang || "en"
  const t = layoutTranslations[lang as keyof typeof layoutTranslations] || layoutTranslations.en
  const isApplicationPage = pathname?.startsWith(`/${lang}/application`) || pathname === "/application"

  return (
    <header className="transition-colors duration-300 bg-white relative z-40">
      <div className="container mx-auto px-4 py-4 relative">
        <div className="flex items-center justify-between">
          <Link href={`/${lang}`} className="flex items-center space-x-2">
            <div className="w-[160px] h-[49px] flex items-center justify-center">
              <img
                src="https://gemura.rw/wp-content/uploads/2023/11/logo-160x49.png"
                alt="Gemura Logo"
                className="w-full h-full object-contain"
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
            {mobileNavOpen ? <X className="h-6 w-6 text-[#0D47A1]" /> : <Menu className="h-6 w-6 text-[#0D47A1]" />}
          </button>

          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher />
            <Link href={`/${lang}/login`}>
              <Button 
                variant="outline" 
                className="!text-[#0D47A1] !border-2 !border-[#0D47A1] hover:!bg-[#0D47A1] hover:!text-white hover:!border-[#0D47A1] !transition-all !duration-200 !font-medium !px-6 !py-2 !rounded-lg !shadow-sm hover:!shadow-md bg-white"
              >
                {t.header.auth.login}
              </Button>
            </Link>
            {!isApplicationPage && (
              <Link href={`/${lang}/application`}>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  {t.header.auth.getStarted}
                </Button>
              </Link>
            )}
          </div>
        </div>
        {/* Mobile Nav Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden mt-4 bg-white rounded shadow-lg p-4 z-50 absolute left-0 right-0 top-16 mx-2 border border-gray-100">
            <nav className="flex flex-col space-y-4">
              {/* Navigation items removed */}
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100 mt-2">
                <LanguageSwitcher />
                <Link href={`/${lang}/login`} onClick={() => setMobileNavOpen(false)}>
                  <Button 
                    variant="outline" 
                    className="w-full !text-[#0D47A1] !border-2 !border-[#0D47A1] hover:!bg-[#0D47A1] hover:!text-white hover:!border-[#0D47A1] !transition-all !duration-200 !font-medium !px-6 !py-2 !rounded-lg !shadow-sm hover:!shadow-md bg-white"
                  >
                    {t.header.auth.login}
                  </Button>
                </Link>
                {!isApplicationPage && (
                  <Link href={`/${lang}/application`} onClick={() => setMobileNavOpen(false)}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      {t.header.auth.getStarted}
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}