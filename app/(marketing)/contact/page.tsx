import { Section } from "@/components/yden/section"
import { LogoBadge } from "@/components/yden/logo-badge"
import { Linkedin, Mail, MapPin, Phone, Send, Sparkles } from "lucide-react"

const fields = [
  { label: "Name", type: "text", required: true },
  { label: "Email", type: "email", required: true },
  { label: "Phone (optional)", type: "tel", required: false },
]

const categories = ["Youth", "Partner", "Media", "Other"]

const quickContacts = [
  { label: "Email", value: "info@yden.rw", icon: Mail, href: "mailto:info@yden.rw" },
  { label: "Phone", value: "+250 XXX XXX XXX", icon: Phone, href: "tel:+250000000000" },
  { label: "Location", value: "Kigali, Rwanda – YDEN Hub", icon: MapPin },
]

const socialLinks = [
  { label: "LinkedIn", href: "#", icon: Linkedin },
  { label: "X", href: "#", icon: Send },
  { label: "Instagram", href: "#", icon: Sparkles },
]

export default function ContactPage() {
  return (
    <div className="space-y-0">
      <section className="bg-gradient-to-br from-sky-950 to-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <LogoBadge className="mb-6" />
          <h1 className="mt-6 text-4xl font-bold sm:text-5xl">Get in touch</h1>
          <p className="mt-6 max-w-3xl text-lg text-slate-100">
            Reach the YDEN team for partnerships, media, or application support. We respond within 3 working days.
          </p>
        </div>
      </section>

      <Section className="bg-white" title="Send us a message">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <form className="space-y-6">
            {fields.map((field) => (
              <div key={field.label} className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {field.label} {field.required && <span className="text-emerald-600">*</span>}
                </label>
                <input
                  type={field.type}
                  required={field.required}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">I am a</label>
              <select className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100">
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Subject</label>
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Message</label>
              <textarea
                rows={5}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <button type="submit" className="rounded-full bg-gradient-to-r from-sky-600 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30">
              Send message
            </button>
          </form>

          <div className="rounded-[32px] border border-slate-100 bg-slate-50/80 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Reach us directly</p>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              {quickContacts.map((contact) => (
                <div key={contact.label} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 p-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-900">
                    <contact.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{contact.label}</p>
                    {contact.href ? (
                      <a href={contact.href} className="text-sm font-semibold text-slate-900">
                        {contact.value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-slate-900">{contact.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Social media</p>
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} className="flex items-center gap-2 text-sky-700">
                  <social.icon className="h-4 w-4" />
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}

