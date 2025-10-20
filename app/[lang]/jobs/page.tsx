"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Eye,
  ArrowLeft,
  TrendingUp,
  Users,
  Building,
  Star,
} from "lucide-react"
import Link from "next/link"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { ClientOnly } from "@/components/client-only"
import { jobsTranslations } from "../translations/jobs"

function JobsContent() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const t = jobsTranslations[lang as keyof typeof jobsTranslations] || jobsTranslations.en

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-green-600 via-primary to-emerald-600 overflow-hidden">
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
                  <TrendingUp className="h-5 w-5" />
                  <span>{t.hero.badges.growth}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <Users className="h-5 w-5" />
                  <span>{t.hero.badges.matching}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <Building className="h-5 w-5" />
                  <span>{t.hero.badges.employers}</span>
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
                  <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl font-bold mb-1">{t.stats.jobs.value}</div>
                  <div className="text-blue-100">{t.stats.jobs.label}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <Building className="h-12 w-12 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl font-bold mb-1">{t.stats.companies.value}</div>
                  <div className="text-green-100">{t.stats.companies.label}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl font-bold mb-1">{t.stats.seekers.value}</div>
                  <div className="text-purple-100">{t.stats.seekers.label}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl font-bold mb-1">{t.stats.success.value}</div>
                  <div className="text-orange-100">{t.stats.success.label}</div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Search Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{t.search.title}</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    className="pl-12 h-14 border-2 border-gray-200 focus:border-primary text-lg"
                    placeholder={t.search.input.placeholder}
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-full md:w-[200px] h-14 border-2 border-gray-200 focus:border-primary">
                    <SelectValue placeholder={t.search.category.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.search.category.all}</SelectItem>
                    <SelectItem value="healthcare">{t.search.category.healthcare}</SelectItem>
                    <SelectItem value="sales">{t.search.category.sales}</SelectItem>
                    <SelectItem value="education">{t.search.category.education}</SelectItem>
                    <SelectItem value="technology">{t.search.category.technology}</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full md:w-[200px] h-14 border-2 border-gray-200 focus:border-primary">
                    <SelectValue placeholder={t.search.location.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.search.location.all}</SelectItem>
                    <SelectItem value="kigali">{t.search.location.kigali}</SelectItem>
                    <SelectItem value="rubavu">{t.search.location.rubavu}</SelectItem>
                    <SelectItem value="musanze">{t.search.location.musanze}</SelectItem>
                    <SelectItem value="huye">{t.search.location.huye}</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="h-14 px-8 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                  <Search className="mr-2 h-5 w-5" />
                  {t.search.button}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Featured Jobs */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {t.featured.title}
            </h2>

            <div className="space-y-8">
              <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 group-hover:text-primary transition-colors">
                            {t.featured.job.title}
                          </h3>
                          <p className="text-lg text-gray-600 font-medium">{t.featured.job.company}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                        {t.featured.job.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span className="font-medium">{t.featured.job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="h-5 w-5 text-primary" />
                          <span className="font-medium">{t.featured.job.salary}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-5 w-5 text-primary" />
                          <span className="font-medium">{t.featured.job.type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-5 w-5 text-primary" />
                          <span className="font-medium">{t.featured.job.positions}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold px-3 py-1">
                          {t.featured.job.badges.new}
                        </Badge>
                        <Badge variant="outline" className="border-primary/30 text-primary font-medium">
                          {t.featured.job.badges.healthcare}
                        </Badge>
                        <Badge variant="outline" className="border-orange-300 text-orange-600 font-medium">
                          {t.featured.job.badges.training}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button className="bg-primary hover:bg-primary/90">
                        <Eye className="mr-2 h-4 w-4" />
                        {t.featured.job.buttons.view}
                      </Button>
                      <Button variant="outline">{t.featured.job.buttons.apply}</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* More job listings would go here */}
            </div>
          </section>
        </main>

        <AuthFooter />
      </div>
    </>
  )
}

export default function Jobs() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <JobsContent />
    </ClientOnly>
  )
} 