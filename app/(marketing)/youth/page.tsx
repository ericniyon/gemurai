"use client"

import { CheckCircle } from "lucide-react"
import Button from "@/components/yden/ui/button"
import ScrollReveal from "@/components/yden/ui/scroll-reveal"
import Image from "next/image"

export default function YouthPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image
            src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2000&auto=format&fit=crop"
            alt="Youth in Field"
            fill
            className="object-cover"
          />
        </div>
        
        {/* Background Symbols */}
        <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
          <div 
            className="absolute bottom-20 right-10 w-32 h-32 md:w-40 md:h-40 opacity-20"
            style={{
              animation: 'float 7s ease-in-out infinite, symbol-rotate 22s linear infinite',
              animationDelay: '1s',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg" style={{ color: '#016629' }}>
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="animate-fade-in-up">
            <span className="font-bold uppercase tracking-wider text-sm mb-2 block" style={{ color: '#016629' }}>
              For Aspiring Agripreneurs
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Are you ready to build your <span style={{ color: '#0099f2' }}>dairy business</span>?
            </h1>
            <p className="text-xl text-slate-200 mb-8">
              YDEN helps you start and grow as a young dairy entrepreneur – even if you don&apos;t own cows yet. We
              provide the skills, the tech, and the market.
            </p>
            <Button
              variant="secondary"
              onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
            >
              Start Your Application
            </Button>
          </div>
          <div className="hidden md:block rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700 transform rotate-2 hover:rotate-0 transition-transform duration-500 animate-fade-in-up delay-200">
            <Image
              src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1000&auto=format&fit=crop"
              alt="Farming Logistics"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Requirements */}
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Who can join?</h2>
            <ul className="space-y-4">
              {[
                "Age 18–35",
                "Living in Rwanda",
                "Interested in dairy production, aggregation, processing, logistics, feed, or digital services",
                "Willing to commit time and effort to training and implementation",
              ].map((req, i) => (
                <li key={i} className="flex items-center text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#016629' }} />
                  {req}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* Benefits */}
          <ScrollReveal delay={200}>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">What you get</h2>
            <div className="space-y-6">
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'rgba(0, 153, 242, 0.1)', color: '#0099f2' }}>
                  1
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">Training and coaching</h3>
                  <p className="mt-1 text-slate-600">in technical and business skills</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'rgba(0, 153, 242, 0.1)', color: '#0099f2' }}>
                  2
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">Access to practical opportunities</h3>
                  <p className="mt-1 text-slate-600">(calves, aggregation routes, feed contracts, etc.)</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'rgba(0, 153, 242, 0.1)', color: '#0099f2' }}>
                  3
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">Linkages to buyers and off-takers</h3>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'rgba(0, 153, 242, 0.1)', color: '#0099f2' }}>
                  4
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">Mentorship</h3>
                  <p className="mt-1 text-slate-600">from experienced farmers and agribusiness experts</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'rgba(0, 153, 242, 0.1)', color: '#0099f2' }}>
                  5
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">Inclusion in a national youth network</h3>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* How to Apply */}
      <div id="apply" className="bg-slate-50 py-20 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-slate-900 mb-12">How to Apply</h2>
            <div className="grid md:grid-cols-4 gap-6 text-left">
              {[
                "Fill in the online application form.",
                "Shortlisting & interviews for each cohort.",
                "Successful applicants join a bootcamp or program track.",
                "After training, youth are matched with real opportunities.",
              ].map((step, i) => (
                <div key={i} className="relative bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <span className="absolute top-4 right-4 text-4xl font-bold text-slate-100 -z-10">{i + 1}</span>
                  <p className="font-medium text-slate-800">{step}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200} className="mt-12 space-y-4">
            <Button to="/en/login" className="text-lg px-12 py-4 shadow-xl transform hover:-translate-y-1 transition-all">
              Apply to Join YDEN
            </Button>
            <p className="text-sm text-slate-500">
              If you have limited internet access, contact us through your local partner hub or cooperative.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
