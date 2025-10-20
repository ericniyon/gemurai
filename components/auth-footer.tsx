"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { layoutTranslations } from "@/app/[lang]/translations/layout"

export function AuthFooter() {
  const params = useParams()
  const lang = ((params || {}) as { lang?: string }).lang || "en"
  const t = layoutTranslations[lang as keyof typeof layoutTranslations] || layoutTranslations.en

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">I</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Gemurai</h3>
                <p className="text-sm text-gray-400">{t.footer.tagline}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t.footer.description}
            </p>
            <div className="flex space-x-3">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t.footer.quickLinks.title}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${lang}/about`} className="text-gray-300 hover:text-primary transition-colors">
                  {t.footer.quickLinks.about}
                </Link>
              </li>
              {/* Navigation links removed */}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t.footer.services.title}</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-300">{t.footer.services.training}</li>
              <li className="text-gray-300">{t.footer.services.ecommerce}</li>
              <li className="text-gray-300">{t.footer.services.jobMatching}</li>
              <li className="text-gray-300">{t.footer.services.financial}</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t.footer.contact.title}</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-gray-300">{t.footer.contact.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-gray-300">{t.footer.contact.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-gray-300">{t.footer.contact.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">{t.footer.legal.copyright}</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href={`/${lang}/privacy`} className="text-gray-400 hover:text-primary transition-colors">
                {t.footer.legal.privacy}
              </Link>
              <Link href={`/${lang}/terms`} className="text-gray-400 hover:text-primary transition-colors">
                {t.footer.legal.terms}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
