"use client"

import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { layoutTranslations } from "@/app/[lang]/translations/layout"
import { usePublicSettings } from "@/lib/public-settings-context"

export function AuthFooter() {
  const params = useParams()
  const lang = ((params || {}) as { lang?: string }).lang || "en"
  const t = layoutTranslations[lang as keyof typeof layoutTranslations] || layoutTranslations.en
  const settings = usePublicSettings()

  return (
    <footer className="bg-white border-t border-slate-200/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-4">
            <Link href={`/${lang}`} className="inline-block">
              <div className="relative w-32 h-10">
                <Image src="/yden.png" alt={settings.platformName} fill className="object-contain" />
              </div>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed max-w-xs">
              {settings.platformDescription || t.footer.description}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#0099f2]/10 flex items-center justify-center text-slate-500 hover:text-[#0099f2] transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#0099f2]/10 flex items-center justify-center text-slate-500 hover:text-[#0099f2] transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#0099f2]/10 flex items-center justify-center text-slate-500 hover:text-[#0099f2] transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{t.footer.quickLinks.title}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${lang}/about`} className="text-slate-600 hover:text-[#0099f2] transition-colors">
                  {t.footer.quickLinks.about}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/marketplace`} className="text-slate-600 hover:text-[#0099f2] transition-colors">
                  {t.footer.quickLinks.marketplace}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/jobs`} className="text-slate-600 hover:text-[#0099f2] transition-colors">
                  {t.footer.quickLinks.jobs}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/learning`} className="text-slate-600 hover:text-[#0099f2] transition-colors">
                  {t.footer.quickLinks.learning}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{t.footer.services.title}</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>{t.footer.services.training}</li>
              <li>{t.footer.services.ecommerce}</li>
              <li>{t.footer.services.jobMatching}</li>
              <li>{t.footer.services.financial}</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{t.footer.contact.title}</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0099f2] mt-0.5 flex-shrink-0" />
                <span className="text-slate-600">{t.footer.contact.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#0099f2] flex-shrink-0" />
                <a href={`tel:${settings.supportPhone || t.footer.contact.phone}`} className="text-slate-600 hover:text-[#0099f2] transition-colors">{settings.supportPhone || t.footer.contact.phone}</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#0099f2] flex-shrink-0" />
                <a href={`mailto:${settings.supportEmail || t.footer.contact.email}`} className="text-slate-600 hover:text-[#0099f2] transition-colors">{settings.supportEmail || t.footer.contact.email}</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} {settings.platformName}. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href={`/${lang}/privacy`} className="text-slate-500 hover:text-[#0099f2] transition-colors">
                {t.footer.legal.privacy}
              </Link>
              <Link href={`/${lang}/terms`} className="text-slate-500 hover:text-[#0099f2] transition-colors">
                {t.footer.legal.terms}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
