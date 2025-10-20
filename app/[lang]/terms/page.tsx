"use client"

import { useParams } from "next/navigation"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollText, CheckCircle, AlertCircle, Scale, Users, ShieldCheck } from "lucide-react"
import { ClientOnly } from "@/components/client-only"

const termsTranslations = {
  en: {
    title: "Terms of Service",
    lastUpdated: "Last Updated: March 15, 2024",
    intro: "Welcome to Gemurai Platform. By accessing or using our platform, you agree to be bound by these Terms of Service.",
    sections: [
      {
        title: "Platform Usage",
        content: "Gemurai Platform is a digital community platform connecting Digital Community Champions (DCCs) with resources, training, and economic opportunities. Users must be at least 18 years old and legally able to form binding contracts.",
        icon: Users
      },
      {
        title: "User Responsibilities",
        content: "As a user, you are responsible for maintaining the confidentiality of your account, providing accurate information, and complying with all applicable laws and regulations.",
        icon: CheckCircle
      },
      {
        title: "DCC Specific Terms",
        content: "Digital Community Champions must complete required training, maintain quality standards, and follow platform guidelines when providing services or selling products.",
        icon: ShieldCheck
      },
      {
        title: "Intellectual Property",
        content: "All content on Gemurai Platform, including text, graphics, logos, and software, is the property of Gemurai Platform or its licensors and is protected by intellectual property laws.",
        icon: Scale
      },
      {
        title: "Prohibited Activities",
        content: "Users may not engage in any activity that disrupts the platform, violates others' rights, or compromises platform security. Violations may result in account termination.",
        icon: AlertCircle
      }
    ],
    additionalTerms: {
      title: "Additional Terms",
      items: [
        "We reserve the right to modify these terms at any time",
        "Users will be notified of significant changes",
        "Continued use of the platform constitutes acceptance of modified terms",
        "These terms are governed by Rwandan law"
      ]
    }
  },
  rw: {
    title: "Amabwiriza yo Gukoresha",
    lastUpdated: "Yaherukiye kuvugururwa: Werurwe 15, 2024",
    intro: "Murakaza neza kuri Gemurai Platform. Mukoresha iyi platform, mwemera kubahiriza aya mabwiriza yo gukoresha.",
    sections: [
      {
        title: "Imikoreshereze ya Platform",
        content: "Gemurai Platform ni urubuga ruhuza Abayobozi b'Ikoranabuhanga mu Miryango (DCCs) n'ibikoresho, amahugurwa n'amahirwe y'ubukungu. Abakoresha bagomba kuba bafite nibura imyaka 18 kandi bafite uburenganzira bwo gukora amasezerano.",
        icon: Users
      },
      {
        title: "Inshingano z'Ukoresha",
        content: "Nk'umukoresha, ushinzwe kubika ibanga ry'konti yawe, gutanga amakuru y'ukuri, no kubahiriza amategeko n'amabwiriza yose akurikizwa.",
        icon: CheckCircle
      },
      {
        title: "Amabwiriza ya DCC",
        content: "Abayobozi b'Ikoranabuhanga mu Miryango bagomba kurangiza amahugurwa asabwa, kubahiriza ibipimo by'ubuziranenge, no gukurikiza amabwiriza ya platform mu gutanga serivisi cyangwa kugurisha ibicuruzwa.",
        icon: ShieldCheck
      },
      {
        title: "Uburenganzira ku Mutungo",
        content: "Ibikubiye byose kuri Gemurai Platform, harimo inyandiko, amashusho, ibirango, na software, ni umutungo wa Gemurai Platform cyangwa abatanga uburenganzira kandi burindwa n'amategeko y'umutungo bwite.",
        icon: Scale
      },
      {
        title: "Ibikorwa Bibujijwe",
        content: "Abakoresha ntibashobora gukora igikorwa cyose cyangiza platform, kica uburenganzira bw'abandi, cyangwa cyangiza umutekano wa platform. Kutubahiriza bishobora guhagarika konti.",
        icon: AlertCircle
      }
    ],
    additionalTerms: {
      title: "Andi Mabwiriza",
      items: [
        "Dufite uburenganzira bwo guhindura aya mabwiriza igihe cyose",
        "Abakoresha bazamenyeshwa impinduka z'ingenzi",
        "Gukomeza gukoresha platform bisobanura ko wemeye amabwiriza yahindutse",
        "Aya mabwiriza agenga n'amategeko y'u Rwanda"
      ]
    }
  }
}

function TermsContent() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const t = termsTranslations[lang as keyof typeof termsTranslations] || termsTranslations.en

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">{t.title}</h1>
            <p className="text-gray-600">{t.lastUpdated}</p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8 p-4 bg-primary/5 rounded-lg">
                <ScrollText className="w-8 h-8 text-primary" />
                <p className="text-lg text-gray-700">{t.intro}</p>
              </div>

              <div className="space-y-8">
                {t.sections.map((section, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-2 text-gray-900">{section.title}</h2>
                      <p className="text-gray-700">{section.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">{t.additionalTerms.title}</h3>
                <ul className="space-y-2">
                  {t.additionalTerms.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-600">
            <p>
              {lang === "en" 
                ? "For questions about these terms, please contact us at legal@Gemurai.rw"
                : "Ku bibazo kuri aya mabwiriza, nyamuneka twandikire kuri legal@Gemurai.rw"}
            </p>
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  )
}

export default function Terms() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <TermsContent />
    </ClientOnly>
  )
} 