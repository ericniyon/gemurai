"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react"
import { usePublicSettings } from "@/lib/public-settings-context"

export function YdenFooter() {
  const settings = usePublicSettings()

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-24">
                <Image
                  src="/yden.png"
                  alt={settings.platformName}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              {settings.platformDescription || "The home of youth in the dairy value chain in Rwanda. Building a new generation of skilled, profitable, and climate-smart dairy entrepreneurs."}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 1 */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4">YDEN</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-white transition-colors">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/about#model" className="hover:text-white transition-colors">
                  Our Model
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-white transition-colors">
                  News & Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Get Involved</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/youth" className="hover:text-white transition-colors">
                  Join as Youth
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-white transition-colors">
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Volunteer / Mentor
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors">
                  Resources & Toolkits
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-white transition-colors">{settings.supportEmail}</a>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                <a href={`tel:${settings.supportPhone}`} className="hover:text-white transition-colors">{settings.supportPhone}</a>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Kigali, Rwanda</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {settings.platformName}. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-slate-500">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
