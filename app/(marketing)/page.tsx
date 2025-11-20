"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  TrendingUp,
  Users,
  Award,
  Sprout,
  Truck,
  Thermometer,
  Droplets,
  ChevronRight,
  Play,
  GraduationCap,
  Smartphone,
  Building2,
  DollarSign,
} from "lucide-react"
import Button from "@/components/yden/ui/button"
import ScrollReveal from "@/components/yden/ui/scroll-reveal"

export default function HomePage() {
  const parallaxRef = useRef<HTMLDivElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    let rafId: number

    const handleScroll = () => {
      cancelAnimationFrame(rafId)

      rafId = requestAnimationFrame(() => {
        if (parallaxRef.current) {
          const scrolled = window.scrollY
          parallaxRef.current.style.transform = `translateY(${scrolled * 0.4}px)`
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="flex flex-col w-full overflow-hidden bg-white">
      {/* Hero Section - Immersive with Video/Image Background */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Video Container - Handles Parallax Translation */}
        <div ref={parallaxRef} className="absolute inset-0 z-0 bg-slate-900 will-change-transform">
          {/* Animation Wrapper - Handles Zoom for both Image and Video */}
          <div className="relative w-full h-full animate-slow-zoom">
            {/* Fallback Image - Always visible immediately */}
            <Image
              src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=2074&auto=format&fit=crop"
              alt="Hero Background"
              fill
              className="object-cover"
              priority
            />

            {/* Video Overlay - Fades in when ready */}
            <video
              autoPlay
              muted
              loop
              playsInline
              onCanPlay={() => setVideoLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                videoLoaded ? "opacity-100" : "opacity-0"
              }`}
            >
              <source src="https://videos.pexels.com/video-files/855072/855072-hd_1920_1080_25fps.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Dark Overlay with Blue Tint */}
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm font-medium tracking-wide uppercase">The Future of Rwandan Dairy</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6 animate-fade-in-up delay-100 drop-shadow-lg">
            Building the next generation of dairy entrepreneurs in Rwanda
          </h1>

          <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto mb-10 font-light leading-relaxed animate-fade-in-up delay-200">
            YDEN connects young people to skills, technology, finance, and markets across the dairy value chain – from farm to cold chain to processing to table.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Button to="/en/login" variant="secondary" className="text-lg px-8 py-4 shadow-green-900/20 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              Join YDEN
            </Button>
            <Button to="/partners" variant="white" className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              Partner With Us
            </Button>
          </div>
        </div>

        {/* Bottom Ticker / Stats */}
        <div className="absolute bottom-0 w-full border-t border-white/10 bg-slate-900/50 backdrop-blur-md py-4 z-20 hidden md:block animate-fade-in delay-500">
          <div className="max-w-7xl mx-auto px-6 flex justify-between text-sm text-slate-300">
            <div className="flex gap-8">
              <span className="flex items-center gap-2">
                <TrendingUp className="text-green-400 w-4 h-4" /> Milk Production +15% YoY
              </span>
              <span className="flex items-center gap-2">
                <Users className="text-blue-400 w-4 h-4" /> 120+ Youth Deployed
              </span>
              <span className="flex items-center gap-2">
                <Truck className="text-blue-600 w-4 h-4" /> 5 Districts Covered
            </span>
            </div>
            <div className="font-mono text-slate-400">
              Partnering with <span className="text-white font-bold">GEMURA</span> &{" "}
              <span className="text-white font-bold">KIVU COLD</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Dairy Ecosystem Section */}
      <section id="who-we-are" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <ScrollReveal>
              <h4 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-2">Who We Are</h4>
              <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">Who is YDEN?</h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Young Dairy Entrepreneurs Network (YDEN) is a youth-led initiative that equips young people in Rwanda to build profitable, climate-smart businesses in the dairy sector. Built around <strong className="text-slate-900">Gemura milk collection</strong>, <strong className="text-slate-900">Kivu Cold</strong> post-harvest solutions, and the <strong className="text-slate-900">HarvestPlus philosophy</strong>, we help youth create real jobs and real income along the entire dairy value chain.
              </p>

              <Link href="/about" className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all group">
                Learn about our model <ChevronRight size={20} />
            </Link>
            </ScrollReveal>

            {/* Right: Image Grid */}
            <ScrollReveal delay={200} className="hidden lg:block relative h-[600px]">
              {/* Main Image: Milk Collection */}
              <div className="absolute top-0 right-0 w-4/5 h-3/5 rounded-2xl overflow-hidden shadow-2xl z-10">
                <Image
                  src="https://images.unsplash.com/photo-1527153818091-1a9638521e2a?q=80&w=1000&auto=format&fit=crop"
                  alt="Milk Processing"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 bg-blue-600 text-white px-6 py-3 font-bold">Milk Aggregation</div>
          </div>
              {/* Secondary Image: Farmer */}
              <div className="absolute bottom-0 left-0 w-3/5 h-1/2 rounded-2xl overflow-hidden shadow-2xl z-20 border-4 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1595414688142-d92053d35963?q=80&w=800&auto=format&fit=crop"
                  alt="Young Farmer"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute top-1/2 left-10 bg-white p-4 rounded-lg shadow-xl z-30 flex items-center gap-3 animate-float">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                  <Droplets size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Daily Collection</p>
                  <p className="text-xl font-bold text-slate-900">50,000 L+</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Core Value Chain Services */}
      <section id="services" className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Background Pattern - YDEN Logo inspired */}
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3C!-- YDEN Logo inspired pattern --%3E%3Cg transform='translate(100,100)'%3E%3C!-- Main milk drop shape --%3E%3Cpath d='M0,-50 Q-25,-25 -25,0 Q-25,25 0,50 Q25,25 25,0 Q25,-25 0,-50 Z' fill='%2306b6d4' opacity='0.6'/%3E%3C!-- Inner detail --%3E%3Cpath d='M0,-35 Q-15,-18 -15,0 Q-15,18 0,35 Q15,18 15,0 Q15,-18 0,-35 Z' fill='%2310b981' opacity='0.4'/%3E%3C!-- Decorative circles --%3E%3Ccircle cx='-30' cy='-30' r='8' fill='%2306b6d4' opacity='0.3'/%3E%3Ccircle cx='30' cy='-30' r='8' fill='%2310b981' opacity='0.3'/%3E%3Ccircle cx='0' cy='-60' r='6' fill='%2306b6d4' opacity='0.4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '300px 300px',
            backgroundRepeat: 'repeat',
            backgroundPosition: '0 0',
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal className="text-center mb-16">
            <span className="text-green-600 font-bold tracking-wide uppercase text-sm">Our Focus</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">What we focus on</h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
              Comprehensive support across the dairy value chain to empower youth entrepreneurs
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <GraduationCap size={32} />,
                title: "Skills & Training",
                desc: "Practical training in dairy husbandry, youngstock management, fodder and feeding, milk handling, and agribusiness.",
                color: "from-emerald-500 to-green-600",
                colorLight: "from-emerald-50 to-green-50",
                bgColor: "bg-emerald-50",
                iconColor: "text-emerald-600",
                mccRef: "Training programs at MCC facilities",
              },
              {
                icon: <Smartphone size={32} />,
                title: "Technology & Innovation",
                desc: "Access to tools such as milk testing devices, cold chain solutions, digital recordkeeping, and precision dairy technologies.",
                color: "from-blue-500 to-blue-600",
                colorLight: "from-blue-50 to-cyan-50",
                bgColor: "bg-blue-50",
                iconColor: "text-blue-600",
                mccRef: "Digital tools for MCC operations",
              },
              {
                icon: <Building2 size={32} />,
                title: "Markets & Opportunities",
                desc: "Linkages to Gemura for milk aggregation, logistics, and value-added processing.",
                color: "from-purple-500 to-purple-600",
                colorLight: "from-purple-50 to-violet-50",
                bgColor: "bg-purple-50",
                iconColor: "text-purple-600",
                mccRef: "MCC network connections",
              },
              {
                icon: <DollarSign size={32} />,
                title: "Finance & Investment",
                desc: "Blended financing models, asset financing and revenue-based financing through partners to help youth start and grow.",
                color: "from-amber-500 to-orange-600",
                colorLight: "from-amber-50 to-orange-50",
                bgColor: "bg-amber-50",
                iconColor: "text-amber-600",
                mccRef: "Financial support for MCC ventures",
              },
            ].map((card, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="group relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-transparent transition-all duration-500 h-full flex flex-col overflow-hidden">
                  {/* Gradient background overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.colorLight} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0`}></div>
                  
                  {/* Decorative corner accent */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 rounded-bl-full transition-opacity duration-500 -z-0`}></div>

                  {/* Content wrapper */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon with enhanced gradient background */}
                    <div className={`mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative overflow-hidden`}>
                      {/* Icon shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative z-10">{card.icon}</div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-slate-800 transition-colors duration-300">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-sm leading-relaxed flex-grow mb-4 group-hover:text-slate-700 transition-colors duration-300">
                      {card.desc}
                    </p>

                    {/* MCC Reference with badge style */}
                    <div className="mb-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${card.bgColor} ${card.iconColor} border border-current/20 group-hover:scale-105 transition-transform duration-300`}>
                        {card.mccRef}
                      </span>
            </div>

                    {/* Decorative bottom accent with enhanced animation */}
                    <div className="mt-auto relative">
                      <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${card.color} group-hover:w-full group-hover:shadow-lg transition-all duration-500 relative overflow-hidden`}>
                        <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-50 group-hover:animate-pulse`}></div>
            </div>
          </div>
            </div>

                  {/* Subtle glow effect on hover */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-br ${card.color} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`}></div>
                </div>
              </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

      {/* Impact Statistics with Parallax */}
      <section id="impact" className="py-20 bg-blue-600 relative overflow-hidden bg-fixed" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1632663287425-56454b677885?q=80&w=2000&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-blue-600/90"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">YDEN in numbers</h2>
          </ScrollReveal>
          <ScrollReveal className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-blue-400/30">
            {[
              { number: "120+", label: "youth trained in dairy entrepreneurship" },
              { number: "5", label: "pilot districts engaged" },
              { number: "3", label: "core value-chain partners (Gemura, Kivu Cold Group, others)" },
              { number: "20+", label: "youth-led dairy ventures supported" },
            ].map((stat, i) => (
              <div key={i} className="p-4">
                <div className="text-4xl md:text-6xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-200 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works - Timeline */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How YDEN works for youth</h2>
          </ScrollReveal>

          <div className="relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {[
                { step: "01", title: "Learn", desc: "Join a YDEN bootcamp or training cohort to build technical and business skills." },
                { step: "02", title: "Launch", desc: "Get matched with opportunities—calf rearing, feed production, milk aggregation, cold chain services, and more." },
                { step: "03", title: "Grow", desc: "Access mentorship, markets, and financing to scale your dairy enterprise." },
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 200}>
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center group hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-16 h-16 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 ring-8 ring-blue-50 group-hover:ring-blue-100 transition-all">
                      {item.step}
            </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
                </ScrollReveal>
              ))}
            </div>
            </div>
            <div className="mt-8 text-center">
            <Button
              to="/en/login"
              variant="primary"
              className="inline-flex items-center gap-2 px-8 py-3"
            >
              Apply to Join YDEN <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        </section>

      {/* Featured Farmer Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="md:w-1/2 relative min-h-[400px]">
              <Image
                src="https://images.unsplash.com/photo-1528498033381-246f1f202572?q=80&w=1000&auto=format&fit=crop"
                alt="Aline at Milk Collection Center"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
                  <Award size={20} /> YDEN Star Entrepreneur
            </div>
                <h3 className="text-white text-2xl font-bold">Aline, 24</h3>
                <p className="text-slate-300">Kayonza District • Milk Aggregator</p>
              </div>
            </div>
            <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white mb-6">From youth to dairy entrepreneur</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                At 24, Aline from Kayonza started with 2 calves and basic training from YDEN. After joining our youngstock program and supplying milk through Gemura&apos;s collection centre, she now manages a small herd, employs 2 other youth, and has consistent income every month.
              </p>
              <Link href="/news" className="self-start inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500">
                Read more success stories <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
          </div>
        </section>

      {/* Partner CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Partner with YDEN</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              We partner with cooperatives, processors, financial institutions, technology providers, and development partners who share our vision of a strong, youth-driven dairy sector. Through structured programs, we help you recruit, train, and support youth enterprises that plug directly into your value chain.
            </p>
          </ScrollReveal>
          <div className="text-center">
            <Button to="/partners" variant="primary" className="inline-flex items-center gap-2 px-8 py-3">
              Explore partnership options <ArrowRight className="h-4 w-4" />
            </Button>
            </div>
          </div>
        </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 py-24 text-center text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        {/* Pattern overlay - YDEN Logo inspired */}
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3C!-- YDEN Logo inspired pattern --%3E%3Cg transform='translate(100,100)'%3E%3C!-- Main milk drop shape --%3E%3Cpath d='M0,-50 Q-25,-25 -25,0 Q-25,25 0,50 Q25,25 25,0 Q25,-25 0,-50 Z' fill='%23ffffff' opacity='0.6'/%3E%3C!-- Inner detail --%3E%3Cpath d='M0,-35 Q-15,-18 -15,0 Q-15,18 0,35 Q15,18 15,0 Q15,-18 0,-35 Z' fill='%23ffffff' opacity='0.4'/%3E%3C!-- Decorative circles --%3E%3Ccircle cx='-30' cy='-30' r='8' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='30' cy='-30' r='8' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='0' cy='-60' r='6' fill='%23ffffff' opacity='0.4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '300px 300px',
            backgroundRepeat: 'repeat',
            backgroundPosition: '0 0',
          }}></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Users size={18} className="text-white" />
              <span className="text-sm font-semibold text-white">Join the Movement</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Ready to transform the dairy value chain?
            </h2>
            <p className="text-xl md:text-2xl text-green-50 mb-12 max-w-3xl mx-auto leading-relaxed">
              Whether you are a young person looking for opportunity, or a processor looking for quality supply.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="white" 
                to="/en/login" 
                className="text-green-700 font-bold px-10 py-5 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Apply as Youth
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              <Button 
                variant="outline" 
                to="/partners" 
                className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-10 py-5 text-lg font-bold backdrop-blur-sm bg-white/5 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Partner with Us
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>

            {/* Additional info */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-green-100">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-green-300" />
                <span className="text-sm">Free Training Programs</span>
        </div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-green-300" />
                <span className="text-sm">Network of 1000+ Youth</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-green-300" />
                <span className="text-sm">Proven Success Stories</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
