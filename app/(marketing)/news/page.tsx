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
    <div className="pt-16 min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Symbol */}
      <div className="absolute top-32 left-10 w-28 h-28 md:w-36 md:h-36 opacity-10 pointer-events-none z-0">
        <div 
          style={{
            animation: 'float 8s ease-in-out infinite, symbol-rotate-reverse 22s linear infinite',
            animationDelay: '2s',
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ color: '#0099f2' }}>
            <g transform="translate(100,100)">
              <path d="M0,-50 Q-25,-25 -25,0 Q-25,25 0,50 Q25,25 25,0 Q25,-25 0,-50 Z" fill="currentColor" opacity="0.9" />
              <path d="M0,-35 Q-15,-18 -15,0 Q-15,18 0,35 Q15,18 15,0 Q15,-18 0,-35 Z" fill="currentColor" opacity="0.6" />
              <circle cx="-30" cy="-30" r="8" fill="currentColor" opacity="0.7" />
              <circle cx="30" cy="-30" r="8" fill="currentColor" opacity="0.7" />
              <circle cx="0" cy="-60" r="6" fill="currentColor" opacity="0.8" />
            </g>
          </svg>
        </div>
      </div>
      
      <div className="bg-white py-12 border-b border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900">News & Events</h1>
          <p className="text-slate-600 mt-2">Latest updates from the network and the dairy sector.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {newsItems.map((item, idx) => (
            <ScrollReveal key={idx} delay={idx * 100}>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="h-48 overflow-hidden relative">
                  <Image src={item.image} alt={item.title} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="px-2 py-1 rounded-md font-medium" style={{ backgroundColor: 'rgba(0, 153, 242, 0.1)', color: '#0099f2' }}>{item.category}</span>
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" /> {item.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 cursor-pointer hover:[color:#0099f2]">{item.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-3">{item.summary}</p>
                  <button className="mt-4 text-sm font-semibold hover:underline" style={{ color: '#0099f2' }}>Read full story</button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}
