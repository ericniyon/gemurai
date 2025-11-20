import Link from "next/link"
import { Section } from "@/components/yden/section"
import { LogoBadge } from "@/components/yden/logo-badge"
import { BadgeCheck, CalendarClock, Compass, Sparkles, Target } from "lucide-react"

const eligibility = [
  { label: "Age 18–35", icon: BadgeCheck },
  { label: "Based anywhere in Rwanda", icon: Compass },
  { label: "Excited about dairy, logistics, feed, or data", icon: Target },
  { label: "Ready to commit to hands-on work", icon: Sparkles },
]

const benefits = [
  { title: "Deep training", detail: "Technical + business bootcamps with coaches." },
  { title: "Real assignments", detail: "Access calves, aggregation routes, feed contracts, or data gigs." },
  { title: "Market linkages", detail: "Guaranteed introductions to buyers and offtakers." },
  { title: "Mentorship", detail: "Paired with experienced dairy operators and agribiz mentors." },
  { title: "National network", detail: "Join a peer community across all pilot districts." },
]

const steps = [
  { title: "Apply online", detail: "Fill in the youth application form with your focus area." },
  { title: "Shortlist & interview", detail: "We review motivation, availability, and district readiness." },
  { title: "Join a track", detail: "Bootcamps plus practical modules tailored to your pathway." },
  { title: "Launch & grow", detail: "Get matched with verified opportunities and support coaches." },
]

export default function YouthPage() {
  return (
    <div className="space-y-0">
      <section className="bg-gradient-to-br from-sky-950 to-emerald-700 text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <LogoBadge className="mb-6" />
            <h1 className="mt-6 text-4xl font-bold sm:text-5xl">Are you ready to build your dairy business?</h1>
            <p className="mt-6 text-lg text-slate-100">
              YDEN helps you start and grow as a young dairy entrepreneur – even if you don’t own cows yet. We connect you to assets, mentors, markets, and finance.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/youth#apply" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg">
                Apply to Join YDEN
              </Link>
              <Link href="/contact" className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold">
                Talk to our team
              </Link>
            </div>
          </div>
          <div className="relative rounded-[32px] border border-white/15 bg-white/5 p-6 backdrop-blur">
            <div className="absolute inset-0 -z-10 rounded-[32px] bg-white/10 blur-3xl" />
            <div className="space-y-4">
              {benefits.slice(0, 3).map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-lg shadow-slate-950/30">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-emerald-100">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">{benefit.title}</p>
                    <p className="text-sm text-slate-100">{benefit.detail}</p>
                  </div>
                </div>
              ))}
              <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/20 to-transparent p-5 text-sm text-white">
                <p className="font-semibold uppercase tracking-[0.4em] text-emerald-200">Now onboarding</p>
                <p className="mt-2 text-lg font-semibold">Cohort 04 • Kayonza & Nyagatare</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-100">
                  <CalendarClock className="h-4 w-4" /> Applications close 15 Dec 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section title="Who can join?" className="bg-white">
        <ul className="grid gap-4 md:grid-cols-2">
          {eligibility.map((item) => (
            <li key={item.label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <item.icon className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-slate-700">{item.label}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="What you get">
        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/5 transition hover:-translate-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">{benefit.title}</p>
              <p className="mt-3 text-slate-700">{benefit.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="apply" title="How to apply" className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="group rounded-[28px] border border-white/20 bg-white/5 p-6 transition hover:-translate-y-1">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-semibold">
                {index + 1}
              </span>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.4em] text-emerald-200">{step.title}</p>
              <p className="mt-3 text-slate-100">{step.detail}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/youth#apply" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900">
            Apply to Join YDEN
          </Link>
          <p className="flex items-center gap-2 text-sm text-slate-200">
            <CalendarClock className="h-4 w-4" /> Limited internet? Visit your nearest partner hub and we’ll help you apply.
          </p>
        </div>
      </Section>
    </div>
  )
}

