"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  PhoneCall,
  Sparkles,
  Twitter,
  Users,
} from "lucide-react"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "For Youth", href: "/youth" },
  { label: "For Partners", href: "/partners" },
  { label: "Resources", href: "/resources" },
  { label: "News & Events", href: "/news" },
  { label: "Contact", href: "/contact" },
]

const heroContent = {
  eyebrow: "Young Dairy Entrepreneurs Network",
  title: "Building the next generation of dairy entrepreneurs in Rwanda",
  description:
    "YDEN connects young people to skills, technology, finance, and markets across the dairy value chain – from farm to cold chain to processing to table.",
  primaryCta: { label: "Join YDEN", href: "/youth" },
  secondaryCta: { label: "Partner With Us", href: "/partners" },
  highlights: [
    "For youth aged 18–35",
    "Dairy production, aggregation & processing",
    "Linked to Gemura, Kivu Cold & partners",
  ],
}

const ydenStats = [
  { label: "Youth trained", value: "120+", icon: Users },
  { label: "Pilot districts", value: "5", icon: MapPin },
  { label: "Core partners", value: "3", icon: CheckCircle2 },
  { label: "Youth ventures", value: "20+", icon: Sparkles },
]

const youthJourney = [
  {
    title: "Learn",
    description: "Join a YDEN bootcamp or training cohort to build technical and business skills for dairy entrepreneurship.",
  },
  {
    title: "Launch",
    description: "Match into live opportunities such as calf rearing, feed production, milk aggregation, and cold chain services.",
  },
  {
    title: "Grow",
    description: "Access mentorship, markets, and financing pathways to scale your youth-led dairy venture.",
  },
]

const featuredStory = {
  title: "From youth to dairy entrepreneur",
  body: "At 24, Aline from Kayonza started with two calves and foundational training from YDEN. After joining our youngstock program and supplying milk through Gemura’s collection centre, she now manages a small herd, employs two other youth, and earns consistent monthly income.",
}

const partnerContent = {
  description:
    "We collaborate with cooperatives, processors, financial institutions, technology providers, and development partners who share our vision of a strong, youth-driven dairy sector.",
}

const faqItems = [
  {
    question: "Who can join YDEN?",
    answer: "Youth aged 18–35 in Rwanda who can commit time to dairy training, aggregation, processing, logistics, feed, or digital services.",
  },
  {
    question: "What support do members receive?",
    answer:
      "Technical and business training, mentorship, market linkages, access to opportunities such as calves or aggregation routes, and financing pathways.",
  },
  {
    question: "How do I apply?",
    answer:
      "Complete the online application, go through shortlisting and interviews, join a bootcamp or track, and get matched with real opportunities.",
  },
]

const footerColumns = [
  {
    title: "About",
    links: [
      { label: "About YDEN", href: "/about" },
      { label: "Programs", href: "/programs" },
      { label: "Our Model", href: "/about#model" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { label: "Join as Youth", href: "/youth" },
      { label: "Become a Partner", href: "/partners" },
      { label: "Volunteer / Mentor", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Toolkits", href: "/resources#toolkits" },
      { label: "Guides", href: "/resources#guides" },
      { label: "Downloads", href: "/resources#downloads" },
    ],
  },
]

const contactInfo = {
  email: "info@yden.rw",
  phone: "+250 XXX XXX XXX",
  location: "Kigali, Rwanda",
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(0)
  const currentYear = new Date().getFullYear()

  return (
    <div className="bg-white text-slate-900">
      <header>
        <div className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-2">
            <div className="flex flex-wrap items-center gap-6">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600" /> {contactInfo.email}
              </span>
              <span className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-emerald-600" /> {contactInfo.phone}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" /> {contactInfo.location}
            </span>
            </div>
            <div className="flex items-center gap-3 text-emerald-600">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon) => (
                <a key={Icon.displayName ?? Icon.name} href="#" aria-label={Icon.displayName ?? Icon.name}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-b border-slate-100 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="flex items-center text-2xl font-black text-emerald-700">
              <Sparkles className="mr-2 h-6 w-6" /> YDEN
            </Link>
            <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition hover:text-emerald-600">
                  {link.label}
                </Link>
              ))}
            </nav>
            <Link href="/youth" className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500">
              Join YDEN
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 py-20 text-white sm:py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">{heroContent.eyebrow}</p>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{heroContent.title}</h1>
              <p className="text-lg text-white/85">{heroContent.description}</p>
              <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
                <Link
                  href={heroContent.primaryCta.href}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 shadow hover:shadow-lg"
                >
                  {heroContent.primaryCta.label} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={heroContent.secondaryCta.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white px-6 py-3 font-semibold text-white"
                >
                  {heroContent.secondaryCta.label}
                </Link>
              </div>
              <div className="grid gap-3 text-left sm:grid-cols-3">
                {heroContent.highlights.map((item) => (
                  <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold">
                    {item}
                </div>
              ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="rounded-[32px] border border.white/20 bg-white/10 p-8 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Program snapshot</p>
                <h3 className="mt-4 text-2xl font-bold">Built around real dairy opportunities</h3>
                <p className="mt-3 text-sm text-white/80">
                  Bootcamps, youngstock tracks, milk aggregation routes, cold chain services, feed enterprises, and digital dairy assignments – all linked to Gemura, Kivu Cold, and value-chain partners.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-white/80">
                  {["Dairy Skills Bootcamps", "Youngstock & heifer enterprises", "Milk aggregation & cold chain agents", "Feed & fodder ventures"].map(
                    (point) => (
                      <li key={point} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-200" /> {point}
                      </li>
                    )
                  )}
                </ul>
            </div>
          </div>
        </div>
      </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Who we are</p>
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Who is YDEN?</h2>
              <p className="text-lg text-slate-700">
                Young Dairy Entrepreneurs Network (YDEN) is a youth-led initiative equipping Rwanda’s youth to build profitable, climate-smart businesses along the dairy value chain. Built on Gemura milk collection, Kivu Cold solutions, and the HarvestPlus philosophy, we help youth create jobs and income from farm to processing to market.
              </p>
            </div>
            <div className="rounded-[32px] bg-slate-50 p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">What makes us different?</h3>
              <ul className="mt-5 space-y-3 text-slate-700">
                {[
                  "Co-designed with value-chain leaders like Gemura and MoHarvest",
                  "Blends technical, business, and climate-smart training",
                  "Links every youth to practical market opportunities",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-600" /> {item}
                </li>
              ))}
            </ul>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">Impact</p>
              <h2 className="text-3xl font-bold sm:text-4xl">YDEN in numbers</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {ydenStats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
                  <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <stat.icon className="h-6 w-6 text-white" />
                  </span>
                  <p className="text-3xl font-black">{stat.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">How it works</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">How YDEN works for youth</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {youthJourney.map((step, index) => (
                <div key={step.title} className="rounded-[28px] border border-slate-100 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Step {index + 1}</p>
                  <h3 className="mt-3 text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/youth"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-500"
              >
                Apply to join YDEN <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        </section>

        <section className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Featured story</p>
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{featuredStory.title}</h2>
              <p className="text-slate-700">{featuredStory.body}</p>
              <Link href="/news" className="inline-flex items-center gap-2 font-semibold text-emerald-600">
                Read more success stories <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Partner with us</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">Partner with YDEN</h3>
              <p className="mt-4 text-slate-700">{partnerContent.description}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
                {["Cooperatives & processors", "Financial institutions", "Technology providers", "Development partners"].map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 px-4 py-1">
                    {item}
                  </span>
                ))}
              </div>
              <Link
                href="/partners"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
              >
                Explore partnership options <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-6xl px-4 lg:flex lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">Call to action</p>
              <h2 className="text-3xl font-bold sm:text-4xl">Ready to build or partner with YDEN?</h2>
              <p className="text-white/80">
                Whether you are a young person ready to launch your dairy enterprise or a partner looking to power your value chain, our team can help you take the next step.
              </p>
          </div>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row lg:mt-0">
              <Link href="/youth" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-emerald-700">
                Join YDEN
              </Link>
              <Link href="/partners" className="inline-flex items-center gap-2 rounded-full border border-white px-6 py-3 font-semibold text-white">
                Book a partnership call
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 lg:flex lg:items-start lg:gap-10">
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">FAQs</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Common questions</h2>
              <p className="mt-4 text-slate-600">Not sure where to start? These quick answers cover who can join, what support you receive, and how applications work.</p>
            </div>
            <div className="mt-8 flex-1 space-y-4 lg:mt-0">
              {faqItems.map((item, index) => (
                <div key={item.question} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <button
                    className={`flex w-full items-center justify-between px-5 py-4 text-left text-lg font-semibold ${openFaq === index ? "text-emerald-600" : "text-slate-800"}`}
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  >
                    {item.question}
                    <ArrowRight className={`h-4 w-4 transition ${openFaq === index ? "rotate-90 text-emerald-600" : "text-slate-400"}`} />
                  </button>
                  {openFaq === index && <p className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600">{item.answer}</p>}
            </div>
          ))}
        </div>
              </div>
        </section>
      </main>

      <footer className="bg-slate-950 pt-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr]">
            <div>
            <Link href="/" className="flex items-center text-2xl font-black">
                <Sparkles className="mr-2 h-6 w-6 text-emerald-400" /> YDEN
              </Link>
              <p className="mt-4 text-sm text-white/70">
                YDEN equips Rwandan youth with the skills, tools, and opportunities to build profitable dairy ventures across production, aggregation, processing, and innovation.
              </p>
              <div className="mt-4 flex gap-3 text-emerald-300">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon) => (
                  <a key={Icon.displayName ?? Icon.name} href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h4 className="text-lg font-semibold text-white">{column.title}</h4>
                <div className="mt-4 space-y-2 text-sm text-white/70">
                  {column.links.map((link) => (
                    <Link key={link.label} href={link.href} className="flex items-center gap-2 hover:text-white">
                      <ArrowRight className="h-3.5 w-3.5" /> {link.label}
                    </Link>
          ))}
        </div>
              </div>
            ))}
            <div>
              <h4 className="text-lg font-semibold text-white">Contact</h4>
              <div className="mt-4 space-y-2 text-sm text-white/80">
                <p>Email: {contactInfo.email}</p>
                <p>Phone: {contactInfo.phone}</p>
                <p>Location: {contactInfo.location}</p>
          </div>
        </div>
          </div>
          <div className="mt-10 border-t border-white/10 py-6 text-center text-sm text-white/70">
            <p>
              © {currentYear} Young Dairy Entrepreneurs Network (YDEN). All rights reserved.{" "}
              <Link href="/privacy" className="text-white">
                Privacy Policy
              </Link>{" "}
              |{" "}
              <Link href="/terms" className="text-white">
                Terms of Use
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}