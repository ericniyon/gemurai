"use client"

import { BookOpen, Activity, Truck, Sprout, Wifi, FileText, ChevronRight } from "lucide-react"
import Button from "@/components/yden/ui/button"
import ScrollReveal from "@/components/yden/ui/scroll-reveal"

export default function ProgramsPage() {
const programs = [
  {
    title: "Dairy Skills Bootcamp",
      icon: <BookOpen className="w-6 h-6" />,
      audience: "Youth 18–35, interested in dairy production.",
      duration: "2–4 weeks intensive + ongoing mentorship.",
      content: [
        "Dairy husbandry, youngstock management",
        "Feeding & ration formulation using local resources",
        "Milk hygiene and quality",
        "Recordkeeping & basic farm economics",
    ],
      outcome: "Participants graduate with a farm-based action plan and access to YDEN opportunities.",
  },
    {
      title: "Youngstock & Heifer Enterprise Track",
      icon: <Activity className="w-6 h-6" />,
      audience: "Aspiring dairy farmers without land ownership.",
      duration: "Variable based on growth cycle.",
      content: [
      "Manage calves and heifers for farmers or as co-owners",
        "Focus on growth, health, and fertility",
      "Earn income through service fees or shared value at sale.",
    ],
      outcome: "Sustainable income stream and herd ownership pathways.",
  },
    {
      title: "Youth Milk Aggregators & Cold Chain Agents",
      icon: <Truck className="w-6 h-6" />,
      audience: "Logistics and business-minded youth.",
      duration: "Ongoing operational support.",
      content: [
      "Collect and transport milk from smallholders to HarvestPlus/MoHarvest hubs",
        "Use quality control tools (testing, chilling)",
        "Learn logistics, negotiation, and data reporting.",
    ],
      outcome: "Operational logistics business servicing the value chain.",
  },
  {
    title: "Feed & Fodder Entrepreneurs",
      icon: <Sprout className="w-6 h-6" />,
      audience: "Agriculture enthusiasts.",
      duration: "Seasonal cycles.",
      content: [
      "Grow and conserve fodder (hay, silage, fodder crops)",
      "Supply feeds to local dairy farmers",
      "Explore innovations like hydroponic fodder and forage mixes",
    ],
      outcome: "Vital input supply business for the region.",
  },
  {
    title: "Digital Dairy & Data Agents",
      icon: <Wifi className="w-6 h-6" />,
      audience: "Tech-savvy youth.",
      duration: "Project based.",
      content: [
        "Youth gather and manage data (milk records, herd health, input usage)",
        "Use digital tools and apps to support farmers, processors, and investors",
      ],
      outcome: "Data-driven service provision.",
    },
]

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="py-24 relative overflow-hidden" style={{ backgroundColor: '#0099f2' }}>
        {/* Background: Farmers in field */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1595414688142-d92053d35963?q=80&w=2000&auto=format&fit=crop"
            alt="Field training"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0, 153, 242, 0.9), #0099f2)' }}></div>

        {/* Background Symbols */}
        <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
          <div 
            className="absolute top-32 left-10 w-28 h-28 md:w-36 md:h-36 opacity-20"
            style={{
              animation: 'float 8s ease-in-out infinite, symbol-rotate-reverse 25s linear infinite',
              animationDelay: '2s',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <g transform="translate(100,100)">
                <path d="M0,-50 Q-25,-25 -25,0 Q-25,25 0,50 Q25,25 25,0 Q25,-25 0,-50 Z" fill="currentColor" opacity="0.9" className="animate-pulse" />
                <path d="M0,-35 Q-15,-18 -15,0 Q-15,18 0,35 Q15,18 15,0 Q15,-18 0,-35 Z" fill="currentColor" opacity="0.6" />
                <circle cx="-30" cy="-30" r="8" fill="currentColor" opacity="0.7" />
                <circle cx="30" cy="-30" r="8" fill="currentColor" opacity="0.7" />
                <circle cx="0" cy="-60" r="6" fill="currentColor" opacity="0.8" />
              </g>
            </svg>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in-up">
          <span className="font-bold uppercase tracking-wider text-sm mb-4 block" style={{ color: '#016629' }}>Skills for the Future</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Programs that turn youth into dairy entrepreneurs
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Comprehensive tracks designed to build skills, foster innovation, and launch real businesses in the dairy
            sector.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10">
          {programs.map((program, idx) => (
            <ScrollReveal key={idx} delay={idx * 100}>
              <div className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="md:flex">
                  <div className="p-10 md:w-1/3 flex flex-col justify-center border-r border-slate-100 relative" style={{ background: 'linear-gradient(to bottom right, rgba(0, 153, 242, 0.1), rgb(248 250 252))' }}>
                    <div className="absolute top-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" style={{ background: 'linear-gradient(to right, #0099f2, #016629)' }}></div>
                    <div className="bg-white w-16 h-16 rounded-2xl shadow-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style={{ color: '#0099f2' }}>
                      {program.icon}
              </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 transition-colors group-hover:[color:#0099f2]">
                      {program.title}
                    </h3>
                    <div className="space-y-3 text-sm text-slate-600 mt-2">
                      <p className="flex items-start gap-2">
                        <span className="font-semibold text-slate-900 min-w-[80px]">Audience:</span>{" "}
                        <span>{program.audience}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="font-semibold text-slate-900 min-w-[80px]">Duration:</span>{" "}
                        <span>{program.duration}</span>
                      </p>
          </div>
        </div>
                  <div className="p-10 md:w-2/3 flex flex-col justify-between">
                <div>
                      <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-wider flex items-center gap-2" style={{ color: '#016629' }}>
                        What you&apos;ll do
                        <div className="h-px bg-slate-100 flex-grow"></div>
                      </h4>
                      <ul className="grid md:grid-cols-1 gap-4 mb-8">
                        {program.content.map((item, i) => (
                          <li key={i} className="flex items-start text-slate-600 bg-slate-50 p-3 rounded-lg">
                            <div className="w-1.5 h-1.5 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: '#0099f2' }}></div>
                            <span className="text-base">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-5 rounded-xl border flex items-start gap-3" style={{ backgroundColor: 'rgba(0, 153, 242, 0.05)', borderColor: 'rgba(0, 153, 242, 0.2)' }}>
                      <div className="mt-1" style={{ color: '#0099f2' }}>
                        <ChevronRight size={20} />
                      </div>
                      <p className="text-base font-medium text-slate-800">
                        <span className="font-bold" style={{ color: '#0099f2' }}>Outcome:</span> {program.outcome}
                      </p>
                    </div>
                </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={200} className="mt-20 text-center bg-white p-12 rounded-3xl shadow-lg border border-slate-100">
          <h3 className="text-3xl font-bold text-slate-900 mb-6">Ready to start your journey?</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button to="/youth" variant="primary" className="px-8 py-4 text-lg">
              See how to join these programs →
            </Button>
            <Button variant="white" className="flex items-center gap-2 px-8 py-4 text-lg">
              <FileText size={20} />
              Download program brochure (PDF)
            </Button>
          </div>
        </ScrollReveal>
        </div>
    </div>
  )
}
