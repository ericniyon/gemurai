"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, Award, ArrowLeft, Play, Star, TrendingUp, Target, Zap, Shield } from "lucide-react"
import Link from "next/link"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { ClientOnly } from "@/components/client-only"
import { learningTranslations } from "../translations/learning"

function LearningContent({ lang }: { lang: string }) {
  const t = learningTranslations[lang as keyof typeof learningTranslations] || learningTranslations.en

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-purple-600 via-primary to-blue-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center opacity-10"></div>
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
                  <Target className="h-5 w-5" />
                  <span>{t.hero.badges.skillBased}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <Award className="h-5 w-5" />
                  <span>{t.hero.badges.certified}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <Zap className="h-5 w-5" />
                  <span>{t.hero.badges.selfPaced}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-12">
          {/* Stats Section */}
          <section className="mb-16">
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl font-bold mb-1">{t.stats.learners.value}</div>
                  <div className="text-blue-100">{t.stats.learners.label}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl font-bold mb-1">{t.stats.courses.value}</div>
                  <div className="text-green-100">{t.stats.courses.label}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl font-bold mb-1">{t.stats.certificates.value}</div>
                  <div className="text-purple-100">{t.stats.certificates.label}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl font-bold mb-1">{t.stats.rating.value}</div>
                  <div className="text-orange-100">{t.stats.rating.label}</div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Featured Courses */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {t.featured.title}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t.featured.subtitle}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
              <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-0 shadow-lg">
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=300')] bg-cover bg-center opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white/80" />
                  </div>
                  <Badge className="absolute top-4 left-4 bg-white/90 text-blue-600 font-semibold">
                    {t.featured.courses.health.duration}
                  </Badge>
                  <Badge className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 font-semibold">
                    {t.featured.courses.health.badge}
                  </Badge>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {t.featured.courses.health.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {t.featured.courses.health.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      {t.featured.courses.health.enrolled}
                    </span>
                    <span className="flex items-center gap-2 text-gray-600">
                      <Award className="h-4 w-4" />
                      {t.featured.courses.health.certificate}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t.featured.courses.health.progress}</span>
                      <span className="font-medium">{t.featured.courses.health.percent}</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t.featured.courses.health.details}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{t.featured.courses.health.rating}</span>
                  </div>
                  <Link href={`/${lang}/register`}>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all">
                      <Play className="mr-2 h-4 w-4" />
                      {t.featured.courses.health.button}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-0 shadow-lg">
                <div className="relative h-48 bg-gradient-to-br from-green-400 to-green-600 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=300')] bg-cover bg-center opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp className="h-16 w-16 text-white/80" />
                  </div>
                  <Badge className="absolute top-4 left-4 bg-white/90 text-green-600 font-semibold">
                    {t.featured.courses.sales.duration}
                  </Badge>
                  <Badge className="absolute top-4 right-4 bg-green-400 text-green-900 font-semibold">
                    {t.featured.courses.sales.badge}
                  </Badge>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {t.featured.courses.sales.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {t.featured.courses.sales.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      {t.featured.courses.sales.enrolled}
                    </span>
                    <span className="flex items-center gap-2 text-gray-600">
                      <Award className="h-4 w-4" />
                      {t.featured.courses.sales.certificate}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t.featured.courses.sales.progress}</span>
                      <span className="font-medium">{t.featured.courses.sales.percent}</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t.featured.courses.sales.details}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{t.featured.courses.sales.rating}</span>
                  </div>
                  <Link href={`/${lang}/register`}>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all">
                      <Play className="mr-2 h-4 w-4" />
                      {t.featured.courses.sales.button}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-0 shadow-lg">
                <div className="relative h-48 bg-gradient-to-br from-purple-400 to-purple-600 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=300')] bg-cover bg-center opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="h-16 w-16 text-white/80" />
                  </div>
                  <Badge className="absolute top-4 left-4 bg-white/90 text-purple-600 font-semibold">
                    {t.featured.courses.leadership.duration}
                  </Badge>
                  <Badge className="absolute top-4 right-4 bg-purple-400 text-purple-900 font-semibold">
                    {t.featured.courses.leadership.badge}
                  </Badge>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {t.featured.courses.leadership.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {t.featured.courses.leadership.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      {t.featured.courses.leadership.enrolled}
                    </span>
                    <span className="flex items-center gap-2 text-gray-600">
                      <Award className="h-4 w-4" />
                      {t.featured.courses.leadership.certificate}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t.featured.courses.leadership.progress}</span>
                      <span className="font-medium">{t.featured.courses.leadership.percent}</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t.featured.courses.leadership.details}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{t.featured.courses.leadership.rating}</span>
                  </div>
                  <Link href={`/${lang}/register`}>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
                      <Play className="mr-2 h-4 w-4" />
                      {t.featured.courses.leadership.button}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        <AuthFooter />
      </div>
    </>
  )
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LearningContent lang={lang} />
    </ClientOnly>
  )
} 