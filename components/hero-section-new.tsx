"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const slides = [
  {
    id: 1,
    title: "Empowering Digital Community Champions",
    subtitle: "Building Rwanda's Digital Future Together",
    description:
      "Join thousands of young Rwandans transforming their communities through technology, health education, and sustainable entrepreneurship.",
    cta: "Become a DCC",
    ctaLink: "/application",
    image: "/images/hero/dcc-training.jpg",
    overlayColor: "bg-gradient-to-br from-primary/95 via-primary/80 to-transparent",
    stats: [
      { label: "Direct Jobs Created", value: "14,640+" },
      { label: "Communities Served", value: "100+" },
      { label: "Success Rate", value: "95%" },
    ],
  },
  {
    id: 2,
    title: "Good Health, Good Business",
    subtitle: "Health & Prosperity for All",
    description:
      "Connecting rural communities with essential health products while creating sustainable income opportunities for local champions.",
    cta: "Explore Products",
    ctaLink: "/marketplace",
    image: "/images/hero/health-outreach.jpg",
    overlayColor: "bg-gradient-to-br from-blue-900/95 via-blue-900/80 to-transparent",
    stats: [
      { label: "Health Products", value: "500+" },
      { label: "Communities Reached", value: "250+" },
      { label: "Lives Impacted", value: "50K+" },
    ],
  },
  {
    id: 3,
    title: "Learn, Work, Succeed",
    subtitle: "Education for Economic Growth",
    description:
      "Access world-class digital skills training, find meaningful employment, and build a prosperous future in Rwanda's growing digital economy.",
    cta: "Start Learning",
    ctaLink: "/learning",
    image: "/images/hero/tech-education.jpg",
    overlayColor: "bg-gradient-to-br from-green-900/95 via-green-900/80 to-transparent",
    stats: [
      { label: "Courses Available", value: "200+" },
      { label: "Graduates", value: "5,000+" },
      { label: "Job Placement", value: "85%" },
    ],
  },
  {
    id: 4,
    title: "Community Innovation",
    subtitle: "Grassroots Technology Solutions",
    description:
      "Fostering local innovation and entrepreneurship through technology, creating solutions that address real community needs.",
    cta: "Join Community",
    ctaLink: "/register",
    image: "/images/hero/community-innovation.jpg",
    overlayColor: "bg-gradient-to-br from-purple-900/95 via-purple-900/80 to-transparent",
    stats: [
      { label: "Innovation Hubs", value: "25+" },
      { label: "Projects Launched", value: "150+" },
      { label: "Entrepreneurs", value: "1,000+" },
    ],
  },
]

export function HeroSectionNew() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  useEffect(() => {
    setIsLoaded(true)
    const interval = setInterval(() => {
      setDirection('right')
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setDirection('right')
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setDirection('left')
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative h-screen overflow-hidden bg-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />

      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-out",
            index === currentSlide 
              ? "opacity-100 translate-x-0" 
              : direction === 'right'
                ? index < currentSlide 
                  ? "opacity-0 -translate-x-full"
                  : "opacity-0 translate-x-full"
                : index < currentSlide
                  ? "opacity-0 translate-x-full"
                  : "opacity-0 -translate-x-full"
          )}
        >
          {/* Background Image */}
          <div
            className={cn(
              "absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-linear",
              isLoaded && index === currentSlide && "scale-105"
            )}
            style={{ backgroundImage: `url(${slide.image})` }}
          />

          {/* Overlay */}
          <div className={cn("absolute inset-0", slide.overlayColor)} />

          {/* Content */}
          <div className="relative h-full">
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="max-w-4xl space-y-8">
                {/* Badge */}
                <div className={cn(
                  "transform transition-all duration-700 delay-100",
                  isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}>
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                    🇷🇼 {slide.subtitle}
                  </Badge>
                </div>

                {/* Title */}
                <h1 className={cn(
                  "text-6xl md:text-7xl font-bold text-white leading-tight transform transition-all duration-700 delay-200",
                  isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}>
                  {slide.title}
                </h1>

                {/* Description */}
                <p className={cn(
                  "text-xl text-white/90 max-w-2xl transform transition-all duration-700 delay-300",
                  isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}>
                  {slide.description}
                </p>

                {/* Buttons */}
                <div className={cn(
                  "flex flex-wrap gap-4 transform transition-all duration-700 delay-400",
                  isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}>
                  <Link href={slide.ctaLink || "/"}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-lg px-8 py-6 text-lg group">
                      {slide.cta}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className={cn(
                  "grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 transform transition-all duration-700 delay-500",
                  isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}>
                  {slide.stats.map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-colors"
                    >
                      <div className="text-3xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentSlide ? 'right' : 'left')
                setCurrentSlide(index)
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentSlide 
                  ? "w-8 bg-white" 
                  : "w-2 bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      </div>

      {/* Arrow Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors group"
      >
        <ChevronLeft className="h-6 w-6 text-white transition-transform group-hover:-translate-x-1" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors group"
      >
        <ChevronRight className="h-6 w-6 text-white transition-transform group-hover:translate-x-1" />
      </button>
    </section>
  )
} 