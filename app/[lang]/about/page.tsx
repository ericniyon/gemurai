"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, Target, Award, Globe, Heart, Shield, Zap, TrendingUp } from "lucide-react"
import Link from "next/link"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { HeroBackground } from "@/components/hero-background"
import { aboutTranslations } from "../translations/about"

export default function About() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const t = aboutTranslations[lang as keyof typeof aboutTranslations] || aboutTranslations.en

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Hero Section */}
        <HeroBackground
          image="/images/hero/about-hero.jpg"
          overlayColor="from-blue-900"
          overlayOpacity={0.7}
          className="relative"
        >
          <div className="relative container mx-auto px-4 py-16">
            <Link
              href={`/${lang}`}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t.hero.backToHome}</span>
            </Link>
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  {t.hero.title}
                </span>
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                {t.hero.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <Heart className="h-5 w-5" />
                  <span>{t.hero.badges.impact}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <Shield className="h-5 w-5" />
                  <span>{t.hero.badges.trusted}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <Zap className="h-5 w-5" />
                  <span>{t.hero.badges.innovation}</span>
                </div>
              </div>
            </div>
          </div>
        </HeroBackground>

        <main className="container mx-auto px-4 py-12">
          {/* Mission Section */}
          <section className="mb-20">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t.mission.title}
              </h2>
              <Card className="bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-2xl">
                <CardContent className="p-12">
                  <p className="text-xl text-gray-700 leading-relaxed mb-8">
                    {t.mission.description.primary}
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {t.mission.description.secondary}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Impact Stats */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.impact.title}
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-90 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold mb-2">{t.impact.stats.directWork.value}</div>
                  <div className="text-blue-100 text-lg">{t.impact.stats.directWork.label}</div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <Globe className="h-16 w-16 mx-auto mb-4 opacity-90 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold mb-2">{t.impact.stats.indirectWork.value}</div>
                  <div className="text-green-100 text-lg">{t.impact.stats.indirectWork.label}</div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <Award className="h-16 w-16 mx-auto mb-4 opacity-90 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold mb-2">{t.impact.stats.champions.value}</div>
                  <div className="text-purple-100 text-lg">{t.impact.stats.champions.label}</div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <Target className="h-16 w-16 mx-auto mb-4 opacity-90 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold mb-2">{t.impact.stats.partners.value}</div>
                  <div className="text-orange-100 text-lg">{t.impact.stats.partners.label}</div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Partners Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.partners.title}
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {t.partners.mastercard.title}
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-gray-600">
                    {t.partners.mastercard.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {t.partners.mastercard.description}
                  </p>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {t.partners.commons.title}
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-gray-600">
                    {t.partners.commons.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {t.partners.commons.description}
                  </p>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {t.partners.ict.title}
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-gray-600">
                    {t.partners.ict.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {t.partners.ict.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Key Features */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.features.title}
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100/50 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {t.features.marketplace.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {t.features.marketplace.description}
                  </p>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100/50 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {t.features.training.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {t.features.training.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.cta.title}
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t.cta.description}
            </p>
            <Link href={`/${lang}/application`}>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                {t.cta.button}
              </Button>
            </Link>
          </section>
        </main>
      </div>
      <AuthFooter />
    </>
  )
} 