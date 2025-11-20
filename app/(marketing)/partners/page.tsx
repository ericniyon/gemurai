"use client"

import { Handshake, Building2, Users, Briefcase, ChevronRight, Download } from "lucide-react"
import Button from "@/components/yden/ui/button"
import ScrollReveal from "@/components/yden/ui/scroll-reveal"

export default function PartnersPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Hero */}
      <div className="py-20" style={{ backgroundColor: '#0099f2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-4">Work with YDEN to power your dairy value chain</h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            We co-design youth pipelines that serve your business, cooperative, or development program.
          </p>
        </div>
          </div>

      {/* Who we partner with */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-slate-100">
        <ScrollReveal className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-10">Who we partner with</h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Dairy processors & off-takers", icon: <Building2 /> },
            { label: "Cooperatives & farmer organizations", icon: <Users /> },
            { label: "Financial institutions & impact investors", icon: <Briefcase /> },
            { label: "Development agencies and NGOs", icon: <Handshake /> },
            { label: "Technology providers in dairy and agriculture", icon: <Handshake /> },
          ].map((item, idx) => (
            <ScrollReveal key={idx} delay={idx * 100}>
              <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors h-full">
                <div className="mb-4" style={{ color: '#0099f2' }}>{item.icon}</div>
                <h3 className="font-semibold text-slate-800">{item.label}</h3>
              </div>
            </ScrollReveal>
            ))}
          </div>
        </div>

      {/* Partnership Models */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Partnership Models</h2>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: "Youth Supply Chains",
              desc: "Build youth-led raw milk collection networks that supply your plant or hub.",
            },
            {
              title: "Embedded Training Programs",
              desc: "Co-brand training content aligned with your quality and sourcing needs.",
            },
            {
              title: "Co-financed Youth Ventures",
              desc: "Support youth-owned dairy and feed businesses with blended finance and risk sharing.",
            },
            {
              title: "Pilot & Innovation Projects",
              desc: "Test new technologies (sensors, apps, cold chain solutions) with youth as frontline adopters.",
            },
          ].map((model, idx) => (
            <ScrollReveal key={idx} delay={idx * 100}>
              <div className="flex p-6 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="mr-4 mt-1 flex-shrink-0" style={{ color: '#016629' }}>
                  <ChevronRight />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{model.title}</h3>
                  <p className="text-slate-600">{model.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-900 py-16 text-white text-center">
        <ScrollReveal className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Let&apos;s Build Together</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button to="/contact" variant="secondary">
                Book a partnership call
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
              <Download size={18} className="mr-2" />
              Download Partnership Brief
            </Button>
          </div>
        </ScrollReveal>
        </div>
    </div>
  )
}
