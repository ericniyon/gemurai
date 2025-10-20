"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState<number>(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1)
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: delay * 0.1, duration: 0.5 },
    }),
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentSlide((prev) => (prev + newDirection + slides.length) % slides.length)
  }

  return (
    <div className="relative h-screen overflow-hidden bg-slate-900">
      {/* Background Pattern */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center" />
      </motion.div>

      {/* Slides */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x)

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1)
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1)
            }
          }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
          />

          {/* Overlay */}
          <div className={cn("absolute inset-0", slides[currentSlide].overlayColor)} />

          {/* Content */}
          <div className="relative h-full">
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="max-w-4xl space-y-8">
                {/* Badge */}
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                >
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                    🇷🇼 {slides[currentSlide].subtitle}
                  </Badge>
                </motion.div>

                {/* Title */}
                <motion.h1
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  className="text-6xl md:text-7xl font-bold text-white leading-tight"
                >
                  {slides[currentSlide].title}
                </motion.h1>

                {/* Description */}
                <motion.p
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  custom={3}
                  className="text-xl text-white/90 max-w-2xl"
                >
                  {slides[currentSlide].description}
                </motion.p>

                {/* Buttons */}
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  custom={4}
                  className="flex flex-wrap gap-4"
                >
                  <Link href={slides[currentSlide].ctaLink || "/"}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-lg px-8 py-6 text-lg group">
                      {slides[currentSlide].cta}
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
                </motion.div>

                {/* Stats */}
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  custom={5}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12"
                >
                  {slides[currentSlide].stats.map((stat, i) => (
                    <motion.div
                      key={i}
                      variants={contentVariants}
                      custom={6 + i}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-colors"
                    >
                      <div className="text-3xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentSlide ? 1 : -1)
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
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => paginate(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors group"
      >
        <ChevronLeft className="h-6 w-6 text-white transition-transform group-hover:-translate-x-1" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => paginate(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors group"
      >
        <ChevronRight className="h-6 w-6 text-white transition-transform group-hover:translate-x-1" />
      </motion.button>
    </div>
  )
} 