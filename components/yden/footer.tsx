import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Linkedin, Twitter, Instagram, ArrowRight, Heart } from "lucide-react"

const columns = [
  {
    title: "YDEN",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Programs", href: "/programs" },
      { label: "Our Impact", href: "/about#impact" },
      { label: "Success Stories", href: "/resources#stories" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { label: "Join as Youth", href: "/youth" },
      { label: "Become a Partner", href: "/partners" },
      { label: "Volunteer", href: "/contact" },
      { label: "Mentorship", href: "/contact#mentor" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Training Materials", href: "/resources#toolkits" },
      { label: "Guides & Manuals", href: "/resources#guides" },
      { label: "Downloads", href: "/resources#downloads" },
      { label: "News & Updates", href: "/news" },
    ],
  },
]

export function YdenFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-200 to-sky-200 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-gradient-to-tl from-sky-200 to-teal-200 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid gap-12 lg:grid-cols-12">
          
          {/* Brand column - spans 4 columns */}
          <div className="lg:col-span-4">
            <Link href="/" className="group inline-flex items-center gap-3 transition-transform hover:scale-105">
              <div className="flex h-14 w-32 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-sky-50 ring-2 ring-slate-200/50 transition-all group-hover:ring-emerald-300">
                <Image
                  src="/yden.png"
                  alt="YDEN logo"
                  width={120}
                  height={48}
                  className="h-auto w-full object-contain p-1.5"
                />
              </div>
            </Link>
            
            <p className="mt-6 text-base leading-relaxed text-slate-700">
              Empowering Rwanda's youth to build profitable, sustainable dairy businesses through skills, technology, and market access.
            </p>

            {/* Social links */}
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Connect With Us</p>
              <div className="mt-4 flex gap-3">
                <Link 
                  href="https://www.linkedin.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-200 bg-white transition-all hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <Linkedin className="h-5 w-5 text-slate-600 transition-colors group-hover:text-emerald-600" />
                </Link>
                <Link 
                  href="https://x.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-200 bg-white transition-all hover:border-sky-400 hover:bg-sky-50"
                >
                  <Twitter className="h-5 w-5 text-slate-600 transition-colors group-hover:text-sky-600" />
                </Link>
                <Link 
                  href="https://www.instagram.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-200 bg-white transition-all hover:border-pink-400 hover:bg-pink-50"
                >
                  <Instagram className="h-5 w-5 text-slate-600 transition-colors group-hover:text-pink-600" />
                </Link>
              </div>
            </div>
          </div>

          {/* Links columns - spans 5 columns */}
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-5">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">{col.title}</p>
                <ul className="mt-6 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href} 
                        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact card - spans 3 columns */}
          <div className="lg:col-span-3">
            <div className="rounded-[28px] border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-8 shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Contact Us</p>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                    <Mail className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</p>
                    <Link href="mailto:info@yden.rw" className="font-bold text-slate-900 hover:text-emerald-700">
                      info@yden.rw
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sky-100">
                    <Phone className="h-4 w-4 text-sky-700" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</p>
                    <p className="font-bold text-slate-900">+250 XXX XXX XXX</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100">
                    <MapPin className="h-4 w-4 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location</p>
                    <p className="font-bold text-slate-900">Kigali, Rwanda</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t-2 border-slate-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:text-left">
              <p className="flex items-center gap-2 text-sm text-slate-600">
                Made with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> for Rwanda's dairy sector
              </p>
              <span className="hidden text-slate-300 lg:inline">•</span>
              <p className="text-sm text-slate-600">
                © {new Date().getFullYear()} Young Dairy Entrepreneurs Network (YDEN). All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/privacy" className="font-medium text-slate-600 transition-colors hover:text-emerald-700">
                Privacy Policy
              </Link>
              <Link href="/terms" className="font-medium text-slate-600 transition-colors hover:text-emerald-700">
                Terms of Use
              </Link>
              <Link href="/portal" className="font-medium text-slate-600 transition-colors hover:text-emerald-700">
                Member Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

