import { Section } from "@/components/yden/section"
import { LogoBadge } from "@/components/yden/logo-badge"
import { Compass, HeartHandshake, Layers3, Map, Rocket } from "lucide-react"

const modelSteps = [
  "Identify youth in rural and peri-urban areas interested in dairy.",
  "Train them in technical dairy skills and business fundamentals.",
  "Equip them with tools, technologies, and advisory support.",
  "Connect them to Gemura, MoHarvest, cooperatives, processors, and off-takers.",
  "Support with mentorship, peer networks, and financing pathways.",
]

const partners = [
  {
    name: "Gemura Milk Collection",
    role: "Quality milk aggregation and farmer linkages.",
  },
  {
    name: "MoHarvest",
    role: "Cold chain and post-harvest infrastructure for dairy and other value chains.",
  },
  {
    name: "Strategic Allies",
    role: "RAB, district governments, financial partners, technology providers, and development partners.",
  },
]

const values = [
  {
    title: "Youth-first design",
    description: "Programs co-created with youth advisory councils in every district.",
    icon: Compass,
  },
  {
    title: "Market reality",
    description: "Every training module links directly to an offtake, service, or data contract.",
    icon: Layers3,
  },
  {
    title: "Trusted partnerships",
    description: "We sit inside cooperative, processor, and finance workflows—not on the sidelines.",
    icon: HeartHandshake,
  },
]

const timeline = [
  { year: "2022", note: "Concepted inside Gemura’s milk ecosystem after pilot youth bootcamps." },
  { year: "2023", note: "Launched official YDEN cohorts with MoHarvest cold chain deployments." },
  { year: "2024", note: "Scaled to 5 districts and debuted youth-owned aggregation pods." },
  { year: "2025", note: "Added fintech partners and data agents to reach national coverage." },
]

export default function AboutPage() {
  return (
    <div className="space-y-0">
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-24 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <LogoBadge className="mb-6" />
            <h1 className="mt-6 text-4xl font-bold sm:text-5xl">YDEN exists to make dairy entrepreneurship a viable and attractive path for young people in Rwanda.</h1>
            <p className="mt-6 text-lg text-slate-100">
              Through immersive programs, strong partnerships, and real market access, we enable youth to lead in production, aggregation, processing, logistics, and innovation.
            </p>
          </div>
          <div className="relative w-full max-w-lg">
            <div className="absolute inset-0 -z-10 rounded-[36px] bg-white/10 blur-3xl" />
            <div className="grid gap-4 rounded-[32px] border border-white/15 bg-white/5 p-6 backdrop-blur-lg sm:grid-cols-2">
              {values.map((value) => (
                <div key={value.title} className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-left shadow-lg shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:bg-white/10">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-emerald-100">
                    <value.icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">{value.title}</p>
                  <p className="mt-2 text-sm text-slate-100">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow="Our mission" title="Our mission">
        <p className="text-lg text-slate-600">
          To build a new generation of skilled, profitable, and climate-smart dairy entrepreneurs who power Rwanda’s dairy industry through innovation, technology, and strong market linkages.
        </p>
      </Section>

      <Section eyebrow="Our vision" title="Our vision" className="bg-white">
        <p className="text-lg text-slate-600">
          A vibrant dairy economy where young people lead in production, aggregation, processing, and innovation – creating jobs, raising incomes, and improving nutrition across Rwanda.
        </p>
      </Section>

      <Section
        eyebrow="Our story"
        title="Born out of Rwanda’s dairy value chain"
        description="YDEN emerged from practical work across Gemura’s milk collection centers and MoHarvest’s cold chain solutions."
      >
        <div className="grid gap-10 lg:grid-cols-2">
          <p className="text-lg text-slate-600">
            We saw youth active on farms but rarely leading viable dairy businesses. YDEN bridges that gap by combining technical training, entrepreneurship, and market linkages into a dedicated youth network.
          </p>
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg shadow-slate-900/5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">What makes us different</p>
            <p className="mt-4 text-slate-600">
              Everything we offer is tied to real partners and real demand. Youth don’t just learn—they launch businesses inside existing supply chains.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="model"
        eyebrow="Our model"
        title="From skills to market"
        description="A repeatable approach that turns interested youth into reliable dairy entrepreneurs."
        className="bg-gradient-to-br from-sky-50 to-emerald-50"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modelSteps.map((step, index) => (
            <div key={step} className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Step {index + 1}</p>
              <p className="mt-3 text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Core partners"
        title="Built on strong partnerships"
        description="Our collaboration network keeps youth connected to markets, finance, technology, and policy support."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {partners.map((partner) => (
            <div key={partner.name} className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">{partner.name}</p>
              <p className="mt-4 text-slate-600">{partner.role}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Growth timeline"
        title="Momentum we are carrying forward"
        description="Steady expansion driven by youth demand and partner confidence."
        className="bg-gradient-to-br from-emerald-50 via-white to-sky-50"
      >
        <div className="rounded-[32px] border border-emerald-100 bg-white/80 p-8 shadow-lg shadow-emerald-100/50">
          <div className="flex items-center gap-3 text-emerald-700">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50">
              <Rocket className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold uppercase tracking-[0.3em]">Trail highlights</p>
          </div>
          <div className="mt-8 space-y-6">
            {timeline.map((item) => (
              <div key={item.year} className="flex flex-col gap-3 rounded-[24px] border border-emerald-100 bg-emerald-50/50 p-4 transition hover:-translate-y-1 hover:border-emerald-200">
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-600">{item.year}</p>
                <p className="text-slate-700">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}

