"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  CheckCircle,
  Users,
  BookOpen,
  Briefcase,
  Target,
  Heart,
  Rocket,
  Star,
} from "lucide-react"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { homeTranslations } from "./translations/home"
import { HERO_IMAGES } from "@/lib/constants/hero-images"

export function HomeContent({ lang }: { lang: string }) {
  const t = homeTranslations[lang as keyof typeof homeTranslations] || homeTranslations.en
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying || !isMounted) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % t.hero.slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlaying, isMounted, t.hero.slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AuthHeader />

      {/* Hero Section with Slider */}
      <section className="relative min-h-[60vh] md:min-h-[80vh] overflow-hidden text-primary justify-center items-center">
        {t.hero.slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
              index === currentSlide ? "translate-x-0" : index < currentSlide ? "-translate-x-full" : "translate-x-full"
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(https://www.ihuzo.rw/storage/sliddesphotos/9BpqGGazg0Jfz5VK4RtQqvpQiUIYtUgfL9BWiTaO.jpg)`,
                minHeight: '50vh',
                height: '100%',
                width: '100vw',
                maxHeight: '100vh',
              }}
            />

            {/* Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${HERO_IMAGES.landing[index].overlayColor}`} />

            {/* Content */}
            <div className="relative min-h-[40vh] md:min-h-[60vh] flex items-top mt-20 md:mt-32">
              <div className="container w-full mx-auto px-4">
                <div className="max-w-4xl">
                  <div className="space-y-4 text-white">
                    <Badge className="bg-[#0D47A1]/20 text-white border-white/30 backdrop-blur-sm text-[#0D47A1]">
                      🇷🇼 {lang === "en" ? "Transforming Rwanda Together" : "Guhindura u Rwanda Hamwe"}
                    </Badge>

                    <h1 className="text-5xl md:text-5xl font-bold leading-tight text-[#0D47A1]">{slide.title}</h1>

                    <h2 className="text-2xl md:text-3xl font-light text-black/90">{slide.subtitle}</h2>

                    <p className="text-xl md:text-2xl text-black/80 max-w-3xl leading-relaxed">{slide.description}</p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Link href={`/${lang}${index === 0 ? "/application" : index === 1 ? "/marketplace" : index === 2 ? "/learning" : "/register"}`}>
                        <Button
                          size="lg"
                          className="bg-white text-primary hover:bg-gray-100 shadow-lg px-8 py-4 text-lg"
                        >
                          {slide.cta}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href={`/${lang}${index === 0 ? "/about" : index === 1 ? "/register?role=dcc" : index === 2 ? "/jobs" : "/about"}`}>
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-white/10 text-gray-900 hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
                        >
                          {slide.secondaryCta}
                        </Button>
                      </Link>
                    </div>

                    {/* Stats */}
                    <div className="pt-8">
                      <div className="bg-[#0D47A1]/96 backdrop-blur-sm rounded-2xl p-6 inline-block">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-primary">{slide.stats.primary}</div>
                          <div className="text-primary/80 text-sm font-medium">{slide.stats.secondary}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          {t.hero.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="pb-4 bg-gray-50 min-h-[40vh] md:min-h-[60vh] pt-16">
        <div className="container w-full mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-600">{t.features.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.features.cards.map((card, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-xl overflow-hidden">
                {/* Orange border: top for others, bottom for Skills Development (index 1) */}
                {index === 1 ? null : <div className="h-2 bg-orange-500" />}
                <CardContent className="pt-8">
                  <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-center text-gray-600">{card.title}</h3>
                  <p className="text-gray-600 mb-6 text-center">{card.description}</p>
                  <div className="text-center">
                    <Link
                      href={`/${lang}${index === 0 ? "/marketplace" : index === 1 ? "/learning" : "/jobs"}`}
                      className="text-primary font-medium hover:underline inline-flex items-center"
                    >
                      {card.cta}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
                {/* Orange border at bottom for Skills Development */}
                {index === 1 && <div className="h-2 bg-orange-500 mt-8" />}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="container w-full mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-600">{t.mission.title}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t.mission.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2 text-primary">{t.mission.mission.title}</h3>
                    <p className="text-gray-600">{t.mission.mission.content}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2 text-secondary">{t.mission.vision.title}</h3>
                    <p className="text-gray-600">{t.mission.vision.content}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{t.mission.features.learn.title}</h4>
                  <p className="text-sm text-gray-600">{t.mission.features.learn.subtitle}</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-secondary" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{t.mission.features.work.title}</h4>
                  <p className="text-sm text-gray-600">{t.mission.features.work.subtitle}</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-xl">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{t.mission.features.serve.title}</h4>
                  <p className="text-sm text-gray-600">{t.mission.features.serve.subtitle}</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-xl">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{t.mission.features.connect.title}</h4>
                  <p className="text-sm text-gray-600">{t.mission.features.connect.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        
        <div className="container w-full mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-500/20 text-orange-400 border-none">
              {t.testimonials.badge}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              {t.testimonials.title}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t.testimonials.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="bg-navy-800 rounded-2xl p-8 shadow-lg border border-navy-700"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{t.testimonials.testimonial.role}</h4>
                    <p className="text-gray-400">{t.testimonials.testimonial.subtitle}</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  {t.testimonials.testimonial.content}
                </p>
                <div className="flex items-center gap-1 text-orange-500">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-white dark:bg-navy-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        
        <div className="container w-full mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors dark:bg-orange-500/20 dark:text-orange-400">
              {t.cta.badge}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-600 dark:text-gray-600">
              {t.cta.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {t.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${lang}/register`}>
                <Button
                  size="lg"
                  className="bg-orange-500 text-white hover:bg-orange-600 shadow-lg px-8 py-6 text-lg"
                >
                  {t.cta.primary}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={`/${lang}/about`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-navy-900 text-navy-900 hover:bg-navy-50 dark:border-white dark:text-white dark:hover:bg-white/10 px-8 py-6 text-lg"
                >
                  {t.cta.secondary}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <AuthFooter />
    </div>
  )
} 