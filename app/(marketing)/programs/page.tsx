import Link from "next/link"
import { Section } from "@/components/yden/section"
import { LogoBadge } from "@/components/yden/logo-badge"
import { GraduationCap, Laptop2, Milk, Sprout, ThermometerSnowflake } from "lucide-react"

const programs = [
  {
    title: "Dairy Skills Bootcamp",
    audience: "Youth 18–35 interested in dairy production",
    duration: "2–4 weeks intensive + ongoing mentorship",
    icon: GraduationCap,
    highlights: [
      "Dairy husbandry & youngstock management",
      "Feeding & ration formulation with local resources",
      "Milk hygiene, quality, and cold chain basics",
      "Recordkeeping & farm economics",
    ],
    outcome: "Graduate with a farm-based action plan and access to YDEN opportunities.",
  },
  {
    title: "Youngstock & Heifer Enterprise Track",
    focus: "Raising calves and heifers as a business.",
    icon: Milk,
    highlights: [
      "Manage calves and heifers for farmers or as co-owners",
      "Prioritize growth, health, and fertility milestones",
      "Earn income through service fees or shared value at sale",
    ],
  },
  {
    title: "Youth Milk Aggregators & Cold Chain Agents",
    focus: "Post-farmgate operations and quality control.",
    icon: ThermometerSnowflake,
    highlights: [
      "Collect and transport milk from smallholders to Gemura/MoHarvest hubs",
      "Use testing and chilling tools for quality assurance",
      "Develop logistics, negotiation, and data reporting skills",
    ],
  },
  {
    title: "Feed & Fodder Entrepreneurs",
    focus: "Pasture, fodder, and feed businesses.",
    icon: Sprout,
    highlights: [
      "Grow and conserve fodder (hay, silage, fodder crops)",
      "Supply feeds to local dairy farmers",
      "Explore innovations like hydroponic fodder and forage mixes",
    ],
  },
  {
    title: "Digital Dairy & Data Agents",
    focus: "Data-driven support services for dairy value chains.",
    icon: Laptop2,
    highlights: [
      "Gather and manage milk records, herd health, and input usage",
      "Deploy digital tools and apps for farmers, processors, and investors",
      "Translate on-farm insights into actionable dashboards",
    ],
  },
]

const programMetrics = [
  { label: "Completion rate", value: "92%" },
  { label: "Women participating", value: "48%" },
  { label: "Partner pilots", value: "15" },
]

export default function ProgramsPage() {
  return (
    <div className="space-y-0">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-sky-900 to-emerald-700 text-white">
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 20% 20%, rgba(59,130,246,.6), transparent 50%)" }} />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <LogoBadge variant="light" className="mb-6" />
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">Programs that turn youth into dairy entrepreneurs</h1>
          <p className="mt-6 max-w-3xl text-lg text-slate-100">
            Every program blends technical training, business coaching, and real assignments inside the dairy value chain. Youth leave with practical experience, mentors, and a clear income pathway.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {programMetrics.map((metric) => (
              <div key={metric.label} className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-center shadow-lg shadow-slate-950/30 transition hover:-translate-y-1">
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section className="bg-white" title="Choose your path" description="Five tracks cover the entire dairy value chain, from farm to data.">
        <div className="space-y-8">
          {programs.map((program) => (
            <div key={program.title} className="group relative overflow-hidden rounded-[32px] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm shadow-slate-900/5 transition hover:-translate-y-2 hover:shadow-2xl">
              <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(circle at 10% 20%, rgba(14,165,233,0.15), transparent 40%)" }} />
              <div className="relative flex flex-wrap items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner shadow-emerald-200/60">
                  <program.icon className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">{program.title}</h2>
                  {program.focus && <p className="mt-1 text-sm text-slate-600">{program.focus}</p>}
                </div>
                <div className="ml-auto flex flex-wrap gap-2 text-xs font-semibold">
                  {program.audience && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{program.audience}</span>}
                  {program.duration && <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">{program.duration}</span>}
                </div>
              </div>
              <ul className="relative mt-6 grid gap-3 text-slate-600 sm:grid-cols-2">
                {program.highlights.map((item) => (
                  <li key={item} className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-sm font-semibold shadow-inner shadow-slate-900/5">
                    {item}
                  </li>
                ))}
              </ul>
              {program.outcome && <p className="relative mt-6 text-sm font-semibold text-slate-900">{program.outcome}</p>}
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/youth" className="rounded-full bg-gradient-to-r from-sky-600 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg">
            See how to join these programs
          </Link>
          <Link href="/resources#downloads" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700">
            Download program brochure (PDF)
          </Link>
        </div>
      </Section>
    </div>
  )
}

