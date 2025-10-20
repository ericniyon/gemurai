"use client"

import { useParams } from "next/navigation"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, Eye, FileText } from "lucide-react"
import { ClientOnly } from "@/components/client-only"

const privacyTranslations = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last Updated: March 15, 2024",
    intro: "At Gemurai Platform, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.",
    sections: [
      {
        title: "Information We Collect",
        content: "We collect information that you provide directly to us, including your name, email address, phone number, and other details necessary for platform functionality.",
        icon: FileText
      },
      {
        title: "How We Use Your Information",
        content: "Your information is used to provide and improve our services, communicate with you, and ensure platform security.",
        icon: Eye
      },
      {
        title: "Data Protection",
        content: "We implement robust security measures to protect your personal information from unauthorized access, disclosure, or misuse.",
        icon: Shield
      },
      {
        title: "Your Privacy Rights",
        content: "You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.",
        icon: Lock
      }
    ]
  },
  rw: {
    title: "Politiki y'Ibanga",
    lastUpdated: "Yaherukiye kuvugururwa: Werurwe 15, 2024",
    intro: "Kuri Gemurai Platform, dufata ibanga ryawe by'umwihariko. Iyi Politiki y'Ibanga isobanura uburyo dukusanya, dukoresha kandi turinda amakuru yawe bwite.",
    sections: [
      {
        title: "Amakuru Dukusanya",
        content: "Dukusanya amakuru utanga mu buryo butaziguye, harimo izina ryawe, imeyili, numero ya telefoni, n'andi makuru akenewe kugira ngo urubuga rukore neza.",
        icon: FileText
      },
      {
        title: "Uburyo Dukoresha Amakuru Yawe",
        content: "Amakuru yawe akoreshwa mu gutanga no kunoza serivisi zacu, kuvugana nawe, no kurinda umutekano w'urubuga.",
        icon: Eye
      },
      {
        title: "Kurinda Amakuru",
        content: "Dushyira mu bikorwa ingamba zikomeye zo kurinda amakuru yawe bwite ku byerekeye kubona, gutangaza, cyangwa gukoresha nabi.",
        icon: Shield
      },
      {
        title: "Uburenganzira bw'Ibanga Ryawe",
        content: "Ufite uburenganzira bwo kubona, gukosora, cyangwa gusiba amakuru yawe bwite. Twandikire kugira ngo ukoreshe ubu burenganzira.",
        icon: Lock
      }
    ]
  }
}

function PrivacyContent() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const t = privacyTranslations[lang as keyof typeof privacyTranslations] || privacyTranslations.en

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
              <p className="text-lg text-gray-700 mb-8">{t.intro}</p>

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
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-600">
            <p>
              {lang === "en" 
                ? "For any privacy-related questions, please contact us at privacy@Gemurai.rw"
                : "Ku bibazo bijyanye n'ibanga, nyamuneka twandikire kuri privacy@Gemurai.rw"}
            </p>
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  )
}

export default function Privacy() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <PrivacyContent />
    </ClientOnly>
  )
} 