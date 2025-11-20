"use client"

import { Calendar } from "lucide-react"
import ScrollReveal from "@/components/yden/ui/scroll-reveal"
import Image from "next/image"

export default function NewsPage() {
  const newsItems = [
    {
      title: "Cohort 4 Applications Now Open",
      date: "October 15, 2023",
      category: "Announcements",
      image: "https://images.unsplash.com/photo-1576505123548-d31e8a621033?q=80&w=800&auto=format&fit=crop",
      summary:
        "We are calling all aspiring dairy entrepreneurs in the Eastern Province to apply for our upcoming specialized bootcamp focusing on youngstock.",
    },
    {
      title: "YDEN Partners with Kivu Cold Group",
      date: "September 28, 2023",
      category: "Partnerships",
      image: "https://images.unsplash.com/photo-1635361653830-114df8294a30?q=80&w=800&auto=format&fit=crop",
      summary:
        "A strategic alliance to bring affordable cold chain technology to youth aggregators in remote districts, reducing milk spoilage.",
    },
    {
      title: "Field Day: Nyagatare Dairy Tour",
      date: "September 10, 2023",
      category: "Events",
      image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=800&auto=format&fit=crop",
      summary:
        "Join us for a practical learning visit to one of Rwanda's leading model dairy farms. Learn best practices in feeding and hygiene.",
    },
  ]

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="bg-white py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900">News & Events</h1>
          <p className="text-slate-600 mt-2">Latest updates from the network and the dairy sector.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {newsItems.map((item, idx) => (
            <ScrollReveal key={idx} delay={idx * 100}>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="h-48 overflow-hidden relative">
                  <Image src={item.image} alt={item.title} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">{item.category}</span>
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" /> {item.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-blue-600 cursor-pointer">{item.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-3">{item.summary}</p>
                  <button className="mt-4 text-sm font-semibold text-blue-600 hover:underline">Read full story</button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}
