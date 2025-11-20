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
      "Collect and transport milk from smallholders to Gemura/MoHarvest hubs",
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
      <div className="bg-blue-600 py-24 relative overflow-hidden">
        {/* Background: Farmers in field */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1595414688142-d92053d35963?q=80&w=2000&auto=format&fit=crop"
            alt="Field training"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/90 to-blue-600"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in-up">
          <span className="text-green-400 font-bold uppercase tracking-wider text-sm mb-4 block">Skills for the Future</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Programs that turn youth into dairy entrepreneurs
          </h1>
          <p className="text-blue-100 text-xl max-w-3xl mx-auto leading-relaxed">
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
                  <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-10 md:w-1/3 flex flex-col justify-center border-r border-slate-100 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    <div className="bg-white w-16 h-16 rounded-2xl shadow-md flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                      {program.icon}
              </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
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
                      <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-wider text-emerald-600 flex items-center gap-2">
                        What you&apos;ll do
                        <div className="h-px bg-slate-100 flex-grow"></div>
                      </h4>
                      <ul className="grid md:grid-cols-1 gap-4 mb-8">
                        {program.content.map((item, i) => (
                          <li key={i} className="flex items-start text-slate-600 bg-slate-50 p-3 rounded-lg">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-base">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex items-start gap-3">
                      <div className="mt-1 text-blue-600">
                        <ChevronRight size={20} />
                      </div>
                      <p className="text-base font-medium text-slate-800">
                        <span className="text-blue-600 font-bold">Outcome:</span> {program.outcome}
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
