"use client"

import { useState, useEffect } from "react"
import { ProductImage } from "@/components/product-image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const slides = [
  {
    id: 1,
    title: "Empowering Community Health",
    description: "Join our network of dedicated community health workers making a difference across Rwanda.",
    image: "/images/slides/community-health.svg?height=600&width=1200&text=Community+Health+Workers",
    cta: "Join Now",
    link: "/application"
  },
  {
    id: 2,
    title: "Quality Healthcare Products",
    description: "Access essential medical supplies and earn commissions while serving your community.",
    image: "/images/slides/healthcare-products.svg?height=600&width=1200&text=Healthcare+Products",
    cta: "Browse Products",
    link: "/marketplace"
  },
  {
    id: 3,
    title: "Training & Development",
    description: "Continuous learning opportunities to enhance your healthcare delivery skills.",
    image: "/images/slides/training.svg?height=600&width=1200&text=Training+and+Development",
    cta: "Learn More",
    link: "/learning"
  }
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative h-[100vh] w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-transform duration-500 ease-in-out",
            index === currentSlide ? "translate-x-0" : index < currentSlide ? "-translate-x-full" : "translate-x-full"
          )}
        >
          {/* Background Image with Dark Overlay */}
          <div className="relative h-full w-full">
            <ProductImage
              src={slide.image}
              alt={slide.title}
              fill
              priority
              darkOverlay
              overlayOpacity={0.75}
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center pt-16">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl text-center text-white">
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                <p className="mb-8 text-lg md:text-xl opacity-90">
                  {slide.description}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white border-0"
                >
                  <a href={slide.link}>{slide.cta}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-0 right-0">
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
 