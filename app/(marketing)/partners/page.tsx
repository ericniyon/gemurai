import Link from "next/link"
import { Section } from "@/components/yden/section"
import { LogoBadge } from "@/components/yden/logo-badge"
import { ArrowRight, Factory, Handshake, Landmark, MonitorSmartphone, Sprout } from "lucide-react"

const partnerTypes = [
  { label: "Dairy processors & off-takers", icon: Factory },
  { label: "Cooperatives & farmer organizations", icon: Sprout },
  { label: "Financial institutions & impact investors", icon: Landmark },
  { label: "Development agencies and NGOs", icon: Handshake },
  { label: "Technology providers in dairy and agriculture", icon: MonitorSmartphone },
]

const models = [
  {
    title: "Youth Supply Chains",
    description: "Build youth-led raw milk collection networks that supply your plant or hub with traceable quality.",
  },
  {
    title: "Embedded Training Programs",
    description: "Co-brand training content aligned with your quality, sourcing, and sustainability requirements.",
  },
  {
    title: "Co-financed Youth Ventures",
    description: "Support youth-owned dairy and feed businesses with blended finance and risk sharing.",
  },
  {
    title: "Pilot & Innovation Projects",
    description: "Test new technologies—sensors, apps, cold chain solutions—with youth as frontline adopters.",
  },
]

const proofPoints = [
  { value: "45 days", label: "Average time from brief to pilot launch" },
  { value: "3x", label: "Youth retention vs. ad-hoc recruitment" },
  { value: "8 districts", label: "Ready for deployment today" },
]

export default function PartnersPage() {
  return (
    <div className="space-y-0">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 text-white">
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 80% 20%, rgba(14,165,233,.5), transparent 50%)" }} />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <LogoBadge className="mb-6" />
          <h1 className="mt-6 text-4xl font-bold sm:text-5xl">Work with YDEN to power your dairy value chain</h1>
          <p className="mt-6 max-w-3xl text-lg text-slate-100">
            We co-design youth pipelines that serve your business, cooperative, or development program. YDEN becomes your partner for talent, last-mile services, and inclusive growth.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg">
              Book a partnership call <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/resources#downloads" className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold">
              Download partnership brief (PDF)
            </Link>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {proofPoints.map((point) => (
              <div key={point.label} className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-center shadow-lg shadow-slate-950/30 transition hover:-translate-y-1">
                <p className="text-3xl font-bold">{point.value}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">{point.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section title="Who we partner with" className="bg-white">
        <ul className="grid gap-4 md:grid-cols-2">
          {partnerTypes.map((item) => (
            <li key={item.label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <item.icon className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-slate-700">{item.label}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="models" title="Partnership models" description="Mix and match structures to support your sourcing, financing, or innovation goals.">
        <div className="grid gap-6 md:grid-cols-2">
          {models.map((model) => (
            <div key={model.title} className="group rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-sky-200">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">{model.title}</p>
              <p className="mt-4 text-slate-600">{model.description}</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-sky-700 opacity-0 transition group-hover:opacity-100">
                View sample SOW <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-gradient-to-br from-emerald-100 via-white to-sky-100" title="Let’s co-design your youth strategy">
        <div className="grid gap-8 lg:grid-cols-2">
          <p className="text-lg text-slate-700">
            Share your objectives—milk volumes, service coverage, product innovation, or inclusive employment. We will map a youth pathway that meets your KPIs and strengthens Rwanda’s dairy value chain.
          </p>
          <div className="rounded-[32px] border border-emerald-200 bg-white/80 p-8 shadow-lg shadow-emerald-200/50">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600">Get started</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-900">Schedule a discovery call within 5 days</h3>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">1</span>
                Submit your brief via the contact form.
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">2</span>
                We map youth capacity + districts that match.
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">3</span>
                Co-design scope + KPIs, then launch.
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/contact" className="rounded-full bg-gradient-to-r from-emerald-500 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg">
                Book a partnership call
              </Link>
              <Link href="/partners#models" className="rounded-full border border-emerald-200 px-6 py-3 text-sm font-semibold text-emerald-700">
                Explore sample SOWs
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}

