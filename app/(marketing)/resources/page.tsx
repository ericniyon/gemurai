import Link from "next/link"
import { Section } from "@/components/yden/section"
import { LogoBadge } from "@/components/yden/logo-badge"
import { ArrowDownToLine, BookMarked, Podcast, Sparkles } from "lucide-react"

const toolkits = [
  { title: "Starting a small dairy enterprise", format: "PDF playbook", icon: BookMarked },
  { title: "Basics of milk hygiene", format: "Checklist + SOPs", icon: Sparkles },
  { title: "Introduction to fodder and silage", format: "Slide deck", icon: Podcast },
]

const stories = [
  {
    title: "Aline – Youngstock champion, Kayonza",
    highlight: "Scaled from 2 calves to a herd that now supplies Gemura monthly.",
  },
  {
    title: "Eric & Clarisse – Milk aggregation duo, Nyagatare",
    highlight: "Opened a youth-led collection point with digital quality tracking.",
  },
  {
    title: "Imanzi Feed Collective",
    highlight: "Three friends who turned idle plots into thriving fodder businesses.",
  },
]

const downloads = [
  { label: "Program brochures", href: "/downloads/yden-programs.pdf" },
  { label: "Application forms", href: "/downloads/yden-application.pdf" },
  { label: "Partner briefs", href: "/downloads/yden-partner-brief.pdf" },
]

export default function ResourcesPage() {
  return (
    <div className="space-y-0">
      <section className="bg-gradient-to-br from-slate-950 to-sky-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <LogoBadge className="mb-6" />
          <h1 className="mt-6 text-4xl font-bold sm:text-5xl">Toolkits, guides, stories, and downloads for youth and partners</h1>
          <p className="mt-6 max-w-3xl text-lg text-slate-100">
            Browse the latest learning content, spotlight stories, and assets you can download to onboard faster.
          </p>
        </div>
      </section>

      <Section id="toolkits" title="Toolkits & Guides" className="bg-white">
        <div className="grid gap-6 md:grid-cols-3">
          {toolkits.map((toolkit) => (
            <div key={toolkit.title} className="group rounded-[28px] border border-slate-100 bg-slate-50/80 p-6 text-slate-700 transition hover:-translate-y-2 hover:bg-white">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <toolkit.icon className="h-6 w-6" />
              </span>
              <p className="mt-4 text-lg font-semibold text-slate-900">{toolkit.title}</p>
              <p className="mt-2 text-sm text-slate-500">{toolkit.format}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 opacity-0 transition group-hover:opacity-100">
                Download <ArrowDownToLine className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="stories" title="Success stories" description="Case studies and before/after snapshots from youth across Rwanda.">
        <div className="grid gap-6 md:grid-cols-3">
          {stories.map((story) => (
            <div key={story.title} className="group rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-sky-200">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">{story.title}</p>
              <p className="mt-4 text-slate-600">{story.highlight}</p>
              <Link href="/news" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                Read story
                <Sparkles className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section id="downloads" title="Downloads" className="bg-gradient-to-br from-emerald-100 via-white to-sky-100">
        <div className="grid gap-4 md:grid-cols-3">
          {downloads.map((file) => (
            <Link
              key={file.label}
              href={file.href}
              className="flex flex-col items-center gap-4 rounded-[28px] border border-emerald-200 bg-white/90 px-6 py-8 text-center text-lg font-semibold text-emerald-700 shadow-lg shadow-emerald-200/40 transition hover:-translate-y-2"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <ArrowDownToLine className="h-6 w-6" />
              </span>
              {file.label}
            </Link>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-600">
          Need a custom asset? <Link href="/contact" className="font-semibold text-slate-900">Contact our communications team.</Link>
        </p>
      </Section>
    </div>
  )
}

