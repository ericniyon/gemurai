import Link from "next/link"
import { Section } from "@/components/yden/section"

export default function PortalPage() {
  return (
    <div className="space-y-0">
      <section className="bg-gradient-to-br from-slate-900 to-sky-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200">Member portal</p>
          <h1 className="mt-6 text-4xl font-bold sm:text-5xl">Access your YDEN dashboard</h1>
          <p className="mt-6 text-lg text-slate-100">
            Registered members can log in to manage program tasks, submit reports, track payments, and chat with mentors.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/en/login" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900">
              Member Login
            </Link>
            <Link href="/youth#apply" className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white">
              Request access
            </Link>
          </div>
        </div>
      </section>

      <Section className="bg-white" title="Inside the portal">
        <ul className="grid gap-4 md:grid-cols-2">
          <li className="rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4 text-sm font-semibold text-slate-700">
            Track training schedules and assignments
          </li>
          <li className="rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4 text-sm font-semibold text-slate-700">
            Upload field reports and business metrics
          </li>
          <li className="rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4 text-sm font-semibold text-slate-700">
            Chat with mentors and cohort peers
          </li>
          <li className="rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-4 text-sm font-semibold text-slate-700">
            Access contracts, payments, and support tickets
          </li>
        </ul>
      </Section>
    </div>
  )
}

