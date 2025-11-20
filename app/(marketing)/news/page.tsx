import Link from "next/link"
import { Section } from "@/components/yden/section"
import { LogoBadge } from "@/components/yden/logo-badge"
import { CalendarDays, Megaphone, Sparkles } from "lucide-react"

const newsItems = [
  {
    title: "Cohort 04 Applications Open",
    date: "Nov 1, 2025",
    summary: "Recruiting 40 youth across Kayonza, Rwamagana, and Nyagatare for dairy bootcamps.",
  },
  {
    title: "Training Schedule: Cold Chain Agents",
    date: "Oct 20, 2025",
    summary: "Week-long intensive focused on milk testing, chilling protocols, and data capture.",
  },
  {
    title: "Field Day with Kivu Cold Group",
    date: "Oct 10, 2025",
    summary: "Youth visited the latest cold room deployment to learn about aggregation economics.",
  },
  {
    title: "New Partnership: Impact Bank Rwanda",
    date: "Sep 28, 2025",
    summary: "Blended finance facility launched for feed entrepreneurs and aggregation agents.",
  },
]

export default function NewsPage() {
  return (
    <div className="space-y-0">
      <section className="bg-gradient-to-br from-slate-950 to-slate-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <LogoBadge className="mb-6" />
          <h1 className="mt-6 text-4xl font-bold sm:text-5xl">Latest updates, schedules, and announcements</h1>
          <p className="mt-6 max-w-3xl text-lg text-slate-100">
            Track cohort announcements, training schedules, field days, and new partnerships. Each update links to a dedicated detail page.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <CalendarDays className="h-5 w-5 text-emerald-200" />
              <p className="mt-2 text-3xl font-bold">Weekly</p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70"> cadence</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <Megaphone className="h-5 w-5 text-emerald-200" />
              <p className="mt-2 text-3xl font-bold">Multi-channel</p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70"> email • sms • social</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <Sparkles className="h-5 w-5 text-emerald-200" />
              <p className="mt-2 text-3xl font-bold">Real-time</p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70"> field signals</p>
            </div>
          </div>
        </div>
      </section>

      <Section className="bg-white" title="Blog-style listing">
        <div className="space-y-6">
          {newsItems.map((item) => (
            <article key={item.title} className="group relative overflow-hidden rounded-[28px] border border-slate-100 bg-slate-50/80 p-6">
              <div className="absolute left-0 top-0 h-full w-1 rounded-full bg-gradient-to-b from-sky-500 to-emerald-500 opacity-60" />
              <div className="pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">{item.date}</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-4 text-slate-600">{item.summary}</p>
                <Link href="/news" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                  Read more <Sparkles className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  )
}

