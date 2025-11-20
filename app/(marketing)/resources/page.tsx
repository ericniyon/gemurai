"use client"

import { useState } from "react"
import { FileText, Book, Download, ChevronRight } from "lucide-react"
import ScrollReveal from "@/components/yden/ui/scroll-reveal"

type TabType = "all" | "toolkits" | "stories" | "downloads"

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all")

  const resources = [
    { type: "toolkits", title: "Starting a small dairy enterprise", format: "PDF Guide", size: "2.4 MB" },
    { type: "toolkits", title: "Basics of milk hygiene", format: "Video Course", size: "15 Mins" },
    { type: "toolkits", title: "Introduction to fodder and silage", format: "PDF Guide", size: "1.8 MB" },
    { type: "stories", title: "How Jean Pierre doubled his yield", format: "Case Study", size: "Read Now" },
    { type: "stories", title: "From Huye to the Capital: Marie's Story", format: "Case Study", size: "Read Now" },
    { type: "downloads", title: "YDEN Program Brochure 2025", format: "PDF", size: "5.1 MB" },
    { type: "downloads", title: "Partnership Brief", format: "PDF", size: "1.2 MB" },
    { type: "downloads", title: "Membership Application Form", format: "DOCX", size: "0.5 MB" },
  ]

  const filtered = activeTab === "all" ? resources : resources.filter((r) => r.type === activeTab)

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Resources & Stories</h1>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Resources" },
              { id: "toolkits", label: "Toolkits & Guides" },
              { id: "stories", label: "Success Stories" },
              { id: "downloads", label: "Downloads" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => (
            <ScrollReveal key={idx} delay={idx * 50}>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group h-full">
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`p-3 rounded-lg ${
                      item.type === "stories" ? "" : ""
                    }`}
                    style={item.type === "stories" ? { backgroundColor: 'rgba(1, 102, 41, 0.1)', color: '#016629' } : { backgroundColor: 'rgba(0, 153, 242, 0.1)', color: '#0099f2' }}
                  >
                    {item.type === "toolkits" && <Book size={24} />}
                    {item.type === "stories" && <FileText size={24} />}
                    {item.type === "downloads" && <Download size={24} />}
                  </div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{item.format}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 transition-colors group-hover:[color:#0099f2]">
                  {item.title}
                </h3>
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-sm text-slate-500">{item.size}</span>
                  <button className="hover:[color:#0080d1]" style={{ color: '#0099f2' }}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        </div>
    </div>
  )
}
