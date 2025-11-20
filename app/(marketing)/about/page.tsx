"use client"

import { Target, Eye, History, Share2 } from "lucide-react"
import ScrollReveal from "@/components/yden/ui/scroll-reveal"

export default function AboutPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Hero */}
      <div className="relative bg-slate-900 py-24 border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1527153818091-1a9638521e2a?q=80&w=2000&auto=format&fit=crop"
            className="w-full h-full object-cover"
            alt="Dairy Processing"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
            About Young Dairy Entrepreneurs Network
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto font-light leading-relaxed">
            YDEN exists to make dairy entrepreneurship a viable and attractive path for young people in Rwanda.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-2 gap-12">
          <ScrollReveal delay={100}>
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-blue-900/5 border border-blue-50 hover:-translate-y-1 transition-transform duration-300 h-full">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                <Target size={28} />
                </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Mission</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                To build a new generation of skilled, profitable, and climate-smart dairy entrepreneurs who power
                Rwanda&apos;s dairy industry through innovation, technology, and strong market linkages.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-green-900/5 border border-green-50 hover:-translate-y-1 transition-transform duration-300 h-full">
              <div className="w-14 h-14 bg-green-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8">
                <Eye size={28} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Vision</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                A vibrant dairy economy where young people lead in production, aggregation, processing, and innovation –
                creating jobs, raising incomes, and improving nutrition across Rwanda.
              </p>
          </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Story */}
      <div className="bg-slate-50 py-24">
        <ScrollReveal className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-sm mb-8">
            <History className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Our story</h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            YDEN was born out of practical work in Rwanda&apos;s dairy value chain. Through{" "}
            <strong className="text-blue-600 font-semibold">Gemura&apos;s milk collection centers</strong> and{" "}
            <strong className="text-blue-600 font-semibold">MoHarvest&apos;s post-harvest and cold chain solutions</strong>, we saw a
            clear gap: <strong className="text-slate-900">young people</strong> were present on farms but rarely leading viable dairy businesses. We created YDEN to
            bridge that gap – combining technical training, entrepreneurship, and concrete market linkages into a
            single, youth-focused network.
          </p>
        </ScrollReveal>
      </div>

      {/* Model */}
      <div id="model" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-20">
          <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm">The Framework</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4">Our Model: From Skills to Market</h2>
        </ScrollReveal>

        <div className="relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-8 left-0 w-full h-1 bg-slate-100 z-0 rounded-full">
            <div className="h-full w-full bg-gradient-to-r from-blue-100 via-green-100 to-blue-100"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
            {[
              "Identify youth in rural and peri-urban areas interested in dairy.",
              "Train them in technical dairy skills and business fundamentals.",
              "Equip them with tools, technologies, and advisory support.",
              "Connect them to Gemura, MoHarvest, cooperatives, processors, and off-takers.",
              "Support through mentorship, peer networks, and financing pathways.",
            ].map((step, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-500 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-white text-blue-600 text-xl font-bold flex items-center justify-center mb-6 shadow-lg border border-slate-50 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 relative">
                    {i + 1}
        </div>
                  <p className="text-slate-600 leading-relaxed">{step}</p>
            </div>
              </ScrollReveal>
          ))}
          </div>
        </div>
      </div>

      {/* Core Partners List */}
      <div className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Share2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Built on Strong Partnerships</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: "Gemura Milk Collection", role: "Quality milk aggregation and farmer linkages." },
              { name: "MoHarvest", role: "Cold chain and post-harvest infrastructure." },
              { name: "RAB & Districts", role: "Government partnership and regulatory alignment." },
              { name: "Development Partners", role: "Financial and technical support for scaling impact." },
            ].map((partner, idx) => (
              <ScrollReveal key={idx} delay={idx * 100}>
                <div className="flex items-center p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                  <div className="w-1.5 h-16 bg-blue-600 rounded-full mr-6 self-center"></div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2">{partner.name}</h3>
                    <p className="text-slate-600 text-sm">{partner.role}</p>
        </div>
          </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
